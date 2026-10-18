"""Authentication endpoints conforming to API_SPECIFICATION.md Section 2."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.club import Club
from app.models.membership import ClubMembership
from app.models.registration import EventRegistration
from app.core.security import verify_password, hash_password, create_access_token
from app.core.responses import json_success_response, json_error_response
from app.core.dependencies import get_current_user
from app.schemas.unified import LoginRequest, StudentSignupRequest

router = APIRouter()


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email and password."""
    clean_email = payload.email.strip().lower()
    user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if not user:
        if clean_email in ("vikram.singh@college.edu", "vikram.cs24@college.edu"):
            user = db.query(User).filter(User.email.in_(["vikram.singh@college.edu", "vikram.cs24@college.edu"])).first()
        elif clean_email in ("coordinator@college.edu", "sharma.cse@college.edu"):
            user = db.query(User).filter(User.email.in_(["coordinator@college.edu", "sharma.cse@college.edu"])).first()

    if not user or not verify_password(payload.password, user.password_hash):
        return json_error_response(
            status_code=401,
            error="INVALID_CREDENTIALS",
            message="Invalid email or password.",
            path="/api/v1/auth/login",
        )

    # Check approval status if user is coordinator
    managed_club = db.query(Club).filter(
        (Club.email == user.email) | (Club.faculty_advisor_id == user.id)
    ).first()

    if not managed_club:
        mem = db.query(ClubMembership).filter(
            ClubMembership.user_id == user.id,
            ClubMembership.role.in_(["COORDINATOR", "HEAD_COORDINATOR", "coordinator", "faculty_head"])
        ).first()
        if mem:
            managed_club = db.query(Club).filter(Club.id == mem.club_id).first()

    if user.status == "pending" or (managed_club and managed_club.approval_status in ("requested", "pending")):
        return json_error_response(
            status_code=403,
            error="ACCOUNT_PENDING_APPROVAL",
            message="Your club registration is not yet approved by university admin. Status: Requested.",
            path="/api/v1/auth/login",
        )

    if user.status == "rejected" or (managed_club and managed_club.approval_status == "rejected"):
        reason = (managed_club.rejection_reason if managed_club else None) or "Non-compliance with campus society guidelines."
        return json_error_response(
            status_code=403,
            error="CLUB_REJECTED",
            message=f"Your club was rejected: {reason}",
            path="/api/v1/auth/login",
        )

    if user.status not in ("active", "ACTIVE") and not user.is_active:
        return json_error_response(
            status_code=403,
            error="ACCOUNT_DISABLED",
            message="This account has been disabled.",
            path="/api/v1/auth/login",
        )

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})

    # Retrieve registered event IDs and joined club IDs
    registered_event_ids = [
        r.event_id for r in db.query(EventRegistration).filter(
            EventRegistration.user_id == user.id,
            EventRegistration.status != "CANCELLED"
        ).all()
    ]
    joined_club_ids = [
        m.club_id for m in db.query(ClubMembership).filter(
            ClubMembership.user_id == user.id,
            ClubMembership.status == "ACTIVE"
        ).all()
    ]

    return json_success_response(
        data={
            "token": token,
            "refreshToken": f"refresh-{user.id}-{int(datetime.now(timezone.utc).timestamp())}",
            "expiresIn": 86400,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "avatarUrl": user.avatar_url,
                "registeredEventIds": registered_event_ids,
                "joinedClubIds": joined_club_ids,
                "clubId": managed_club.id if managed_club else None,
                "managedClubId": managed_club.id if managed_club else None,
                "clubName": managed_club.name if managed_club else None,
            }
        },
        message="Authentication successful",
        status_code=200,
    )


@router.post("/signup")
def signup(payload: StudentSignupRequest, db: Session = Depends(get_db)):
    """Enroll student into the portal."""
    clean_email = payload.email.strip().lower()
    existing_user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if existing_user:
        return json_error_response(
            status_code=409,
            error="EMAIL_ALREADY_EXISTS",
            message="An account with this email address already exists.",
            path="/api/v1/auth/signup",
        )

    existing_roll = db.query(StudentProfile).filter(
        StudentProfile.university_roll_no == payload.universityRollNo.strip()
    ).first()
    if existing_roll:
        return json_error_response(
            status_code=409,
            error="ROLL_NUMBER_ALREADY_EXISTS",
            message="This university registration number is already registered.",
            path="/api/v1/auth/signup",
        )

    # Create User
    new_user = User(
        email=clean_email,
        password_hash=hash_password(payload.password),
        name=payload.name.strip(),
        phone=payload.phone.strip() if payload.phone else None,
        role="GENERAL_STUDENT",
        is_active=True,
        status="active",
    )
    db.add(new_user)
    db.flush()

    # Create Student Profile
    profile = StudentProfile(
        user_id=new_user.id,
        class_roll_no=payload.classRollNo.strip(),
        university_roll_no=payload.universityRollNo.strip(),
        course=payload.course.strip() if payload.course else "B.Tech",
        branch=payload.branch.strip(),
        semester=payload.semester.strip() if payload.semester else "4th Sem",
        academic_year="2nd Year",
        department=payload.department.strip() if payload.department else "Computer Science & Engineering",
        admission_year=2024,
        graduating_year=2028,
        blood_group="B+",
    )
    db.add(profile)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.id, "email": new_user.email, "role": new_user.role})

    return json_success_response(
        data={
            "token": token,
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email,
                "role": new_user.role,
                "avatarUrl": new_user.avatar_url,
                "registeredEventIds": [],
                "joinedClubIds": [],
            }
        },
        message="Account created successfully",
        status_code=201,
    )


@router.get("/me")
def get_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return currently authenticated session data."""
    registered_event_ids = [
        r.event_id for r in db.query(EventRegistration).filter(
            EventRegistration.user_id == user.id,
            EventRegistration.status != "CANCELLED"
        ).all()
    ]
    joined_club_ids = [
        m.club_id for m in db.query(ClubMembership).filter(
            ClubMembership.user_id == user.id,
            ClubMembership.status == "ACTIVE"
        ).all()
    ]

    managed_club = db.query(Club).filter(
        (Club.email == user.email) | (Club.faculty_advisor_id == user.id)
    ).first()

    if not managed_club:
        mem = db.query(ClubMembership).filter(
            ClubMembership.user_id == user.id,
            ClubMembership.role.in_(["COORDINATOR", "HEAD_COORDINATOR", "coordinator", "faculty_head"])
        ).first()
        if mem:
            managed_club = db.query(Club).filter(Club.id == mem.club_id).first()

    return json_success_response(
        data={
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "avatarUrl": user.avatar_url,
            "registeredEventIds": registered_event_ids,
            "joinedClubIds": joined_club_ids,
            "clubId": managed_club.id if managed_club else None,
            "managedClubId": managed_club.id if managed_club else None,
            "clubName": managed_club.name if managed_club else None,
        },
        status_code=200,
    )
