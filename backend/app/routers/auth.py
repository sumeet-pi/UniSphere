"""Auth router — signup, login, me."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.membership import ClubMembership
from app.models.club import Club
from app.schemas.auth import (
    SignupRequest,
    StudentSignupRequest,
    CoordinatorSignupRequest,
    CoordinatorSignupResponse,
    LoginRequest,
    LoginResponse,
    UserResponse,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _slugify(name: str) -> str:
    import re
    slug = re.sub(r"[^\w\s-]", "", name.lower().strip())
    return re.sub(r"[\s_]+", "-", slug)


def _user_to_response(user: User, db: Session) -> UserResponse:
    """Build a UserResponse, populating frontend-compat club fields."""
    club_id = None
    managed_club_id = None
    club_role_label = None

    user_role_lower = (user.role or "").strip().lower().replace("_", "")
    if user_role_lower in ("organizer", "faculty", "clubcoordinator", "coordinator"):
        membership = (
            db.query(ClubMembership)
            .filter(
                ClubMembership.user_id == user.id,
                ClubMembership.status.in_(["approved", "ACTIVE", "pending"]),
                ClubMembership.role.in_(["coordinator", "faculty_head", "COORDINATOR", "FACULTY_HEAD"]),
            )
            .first()
        )
        if membership:
            club_id = membership.club_id
            managed_club_id = membership.club_id
            club_role_label = (
                "Faculty Club Head" if "faculty" in user_role_lower
                else "Lead Coordinator"
            )
        if not club_id:
            club = db.query(Club).filter(
                (Club.faculty_advisor_id == user.id) | (Club.email == user.email)
            ).first()
            if club:
                club_id = club.id
                managed_club_id = club.id
                club_role_label = "Lead Coordinator"

    return UserResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        role=_map_role_to_frontend(user.role),
        status=user.status,
        phone=user.phone,
        course=user.course,
        branch=user.branch,
        semester=user.semester,
        class_roll_no=user.class_roll_no,
        university_roll_no=user.university_roll_no,
        name=user.full_name,
        clubId=club_id,
        managedClubId=managed_club_id,
        clubRole=club_role_label,
    )


def _map_role_to_frontend(role: str) -> str:
    """Map backend role names to frontend-expected display names.
    Handles both uppercase (ADMIN, CLUB_COORDINATOR, GENERAL_STUDENT) from seed
    and lowercase (admin, organizer, student) from registration endpoints.
    """
    normalized = role.strip().lower().replace("_", "") if role else role
    mapping = {
        "student": "General Student",
        "generalstudent": "General Student",
        "organizer": "Club Coordinator",
        "faculty": "Club Coordinator",
        "clubcoordinator": "Club Coordinator",
        "facultyhead": "Club Coordinator",
        "admin": "Admin",
        "administrator": "Admin",
    }
    return mapping.get(normalized, role)


def _handle_student_registration(req: StudentSignupRequest, db: Session) -> LoginResponse:
    # Normalize email
    email = req.email.strip().lower()

    # Check duplicate email
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "EMAIL_EXISTS", "message": "An account with this email already exists."},
        )

    # Password strength validation
    if len(req.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "WEAK_PASSWORD", "message": "Password must be at least 8 characters."},
        )

    user = User(
        name=req.full_name.strip(),
        email=email,
        password_hash=hash_password(req.password),
        role="student",  # Student role
        status="active",
        phone=req.phone,
    )
    db.add(user)
    db.flush()

    from app.models.student_profile import StudentProfile
    profile = StudentProfile(
        user_id=user.id,
        course=req.course or "B.Tech",
        branch=req.branch or "Computer Science & Engineering",
        semester=req.semester or "1st Sem",
        class_roll_no=req.class_roll_no or "CS001",
        university_roll_no=req.university_roll_no or f"UNI-{user.id[:8]}",
        department="Computer Science & Engineering",
        admission_year=2024,
        graduation_year=2028,
    )
    db.add(profile)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "role": user.role})
    return LoginResponse(
        access_token=token,
        user=_user_to_response(user, db),
    )


@router.post("/register/student", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
def register_student(req: StudentSignupRequest, db: Session = Depends(get_db)):
    """Independent Student registration endpoint."""
    return _handle_student_registration(req, db)


@router.post("/signup", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    """Backward compatibility alias for student signup."""
    return _handle_student_registration(req, db)


@router.post("/register/coordinator", response_model=CoordinatorSignupResponse, status_code=status.HTTP_201_CREATED)
def register_coordinator(req: CoordinatorSignupRequest, db: Session = Depends(get_db)):
    """Independent Club Coordinator registration endpoint."""
    email = req.email.strip().lower()
    club_name = req.club_name.strip()

    # 1. Check duplicate email in users
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "EMAIL_EXISTS", "message": "An account with this email already exists."},
        )

    # 2. Check duplicate club name
    if db.query(Club).filter(Club.name.ilike(club_name)).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "CLUB_NAME_EXISTS", "message": "A club with this name already exists or has a pending registration."},
        )

    # 3. Password validation
    if len(req.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "WEAK_PASSWORD", "message": "Password must be at least 8 characters."},
        )

    # 4. Generate unique slug
    base_slug = _slugify(club_name)
    slug = base_slug
    suffix = 1
    while db.query(Club).filter(Club.slug == slug).first():
        slug = f"{base_slug}-{suffix}"
        suffix += 1

    # 5. Generate reference ID
    import random
    dept_code = "CSE" if "computer" in req.department.lower() else "CLB"
    random_digits = random.randint(1000, 9999)
    reference_id = f"REQ-2026-{dept_code}-{random_digits}"

    # 6. Atomic Transaction: create coordinator user (organizer role, pending status), club (pending status), membership (pending)
    try:
        coordinator_name = req.faculty_advisor.strip() or f"{club_name} Coordinator"
        user = User(
            name=coordinator_name,
            email=email,
            password_hash=hash_password(req.password),
            role="organizer",  # Canonical coordinator role
            status="pending",  # Pending authority approval
            phone=req.phone.strip(),
        )
        db.add(user)
        db.flush()

        club = Club(
            name=club_name,
            slug=slug,
            club_code=f"CLB-{dept_code}-{random_digits}",
            department=req.department.strip(),
            category=req.category.strip(),
            description=req.description.strip() if req.description else "College student activity club.",
            faculty_advisor_name=req.faculty_advisor.strip(),
            hod_name=req.hod.strip() if hasattr(req, "hod") and req.hod else "Dr. V. K. Mathur",
            status="pending",  # Club is pending approval
            approval_status="requested",
            coordinator_id=user.id,
            faculty_advisor_id=user.id,
            email=email,
            phone=req.phone.strip(),
        )
        db.add(club)
        db.flush()

        membership = ClubMembership(
            user_id=user.id,
            club_id=club.id,
            status="pending",  # Pending membership
            role="COORDINATOR",
            designation="Faculty Advisor / Coordinator",
        )
        db.add(membership)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "REGISTRATION_FAILED", "message": f"Failed to register coordinator: {str(e)}"},
        )

    return CoordinatorSignupResponse(
        message="Club registration request submitted successfully for authority approval.",
        status="pending_approval",
        reference_id=reference_id,
        club_id=club.id,
        club_name=club.name,
        department=req.department.strip(),
        category=club.category,
        hod=req.hod.strip(),
        faculty_advisor=req.faculty_advisor.strip(),
        email=user.email,
        phone=user.phone or req.phone.strip(),
    )


@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_CREDENTIALS", "message": "Invalid email or password."},
        )

    if user.status == "pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "ACCOUNT_PENDING_APPROVAL",
                "message": "Your registration request is currently pending authority approval. You will receive access once endorsed by the institution.",
            },
        )

    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "ACCOUNT_DISABLED", "message": "This account has been disabled."},
        )

    token = create_access_token({"sub": user.id, "role": user.role})
    return LoginResponse(
        access_token=token,
        user=_user_to_response(user, db),
    )


@router.get("/me", response_model=UserResponse)
def get_me(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _user_to_response(user, db)
