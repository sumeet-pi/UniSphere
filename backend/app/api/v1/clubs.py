"""Clubs catalog, club profiles, membership, and task management APIs."""

import uuid
from datetime import datetime, date, timezone
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.db.session import get_db
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.club import Club
from app.models.club_gallery import ClubGallery
from app.models.membership import ClubMembership
from app.models.event import Event
from app.models.task import CoordinatorTask
from app.core.dependencies import get_current_user, get_optional_user
from app.core.security import hash_password
from app.core.responses import json_success_response, json_error_response
from app.schemas.unified import (
    ClubRegistrationRequest,
    ClubUpdateRequest,
    MemberRoleUpdateRequest,
    MemberAddRequest,
    TaskCreateRequest,
    TaskStatusUpdateRequest,
    EventCreateRequest,
)

router = APIRouter()


# ============================================================================
# 4. CLUBS & PUBLIC CATALOG
# ============================================================================

@router.get("")
def list_clubs(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List approved clubs for public catalog discovery."""
    query = db.query(Club).filter(Club.approval_status == "approved")

    if category and category.lower() != "all":
        query = query.filter(Club.category.ilike(f"%{category.strip()}%"))

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Club.name.ilike(s),
                Club.description.ilike(s),
                Club.faculty_advisor_name.ilike(s),
                Club.department.ilike(s),
            )
        )

    clubs = query.all()
    results = []
    for c in clubs:
        member_count = db.query(ClubMembership).filter(
            ClubMembership.club_id == c.id, ClubMembership.status == "ACTIVE"
        ).count()
        upcoming_events_count = db.query(Event).filter(
            Event.club_id == c.id, Event.stage.in_(["upcoming", "open"])
        ).count()

        results.append({
            "id": c.id,
            "clubCode": c.club_code,
            "name": c.name,
            "category": c.category,
            "department": c.department,
            "facultyAdvisor": c.faculty_advisor_name,
            "hod": c.hod_name,
            "memberCount": member_count,
            "upcomingEventsCount": upcoming_events_count,
            "description": c.description,
            "logo": c.logo_url,
            "banner": c.banner_url,
            "approvalStatus": c.approval_status,
        })

    return json_success_response(data=results, status_code=200)


@router.get("/{club_id}")
def get_club_profile(club_id: str, db: Session = Depends(get_db)):
    """Fetch multi-tab public club profile."""
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        return json_error_response(
            status_code=404, error="NOT_FOUND", message="Club not found.", path=f"/api/v1/clubs/{club_id}"
        )

    member_count = db.query(ClubMembership).filter(
        ClubMembership.club_id == club.id, ClubMembership.status == "ACTIVE"
    ).count()

    # Core team list
    core_memberships = (
        db.query(ClubMembership, User, StudentProfile)
        .join(User, ClubMembership.user_id == User.id)
        .outerjoin(StudentProfile, User.id == StudentProfile.user_id)
        .filter(
            ClubMembership.club_id == club.id,
            ClubMembership.status == "ACTIVE",
            ClubMembership.role.in_(["CORE_TEAM", "COORDINATOR", "LEAD"])
        )
        .all()
    )

    core_team = []
    for m, u, sp in core_memberships:
        core_team.append({
            "id": u.id,
            "name": u.name,
            "role": m.designation or m.role,
            "year": sp.academic_year if sp else "3rd Year",
            "department": sp.department if sp else club.department,
        })

    gallery = [g.image_url for g in club.gallery_items]

    data = {
        "id": club.id,
        "clubCode": club.club_code,
        "name": club.name,
        "category": club.category,
        "department": club.department,
        "facultyAdvisor": club.faculty_advisor_name,
        "hod": club.hod_name,
        "description": club.description,
        "about": club.about_mission or club.description,
        "email": club.email or f"{club.id}@college.edu",
        "phone": club.phone or "+91 98765 00001",
        "memberCount": member_count,
        "coreTeam": core_team,
        "socials": {
            "instagram": club.instagram_url or "https://instagram.com",
            "linkedin": club.linkedin_url or "https://linkedin.com",
            "github": club.github_url or "https://github.com",
        },
        "socialLinks": {
            "instagram": club.instagram_url or "https://instagram.com",
            "linkedin": club.linkedin_url or "https://linkedin.com",
            "github": club.github_url or "https://github.com",
        },
        "gallery": gallery or [club.banner_url],
        "logo": club.logo_url,
        "banner": club.banner_url,
    }
    return json_success_response(data=data, status_code=200)


@router.put("/{club_id}")
def update_club_profile(
    club_id: str,
    payload: ClubUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update club profile and governance settings."""
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        return json_error_response(status_code=404, error="NOT_FOUND", message="Club not found.")

    if payload.name:
        club.name = payload.name.strip()
    if payload.clubCode:
        club.club_code = payload.clubCode.strip()
    if payload.description:
        club.description = payload.description.strip()
    if payload.about:
        club.about_mission = payload.about.strip()
    if payload.facultyAdvisor:
        club.faculty_advisor_name = payload.facultyAdvisor.strip()
    if payload.hod:
        club.hod_name = payload.hod.strip()
    if payload.email:
        club.email = payload.email.strip()
    if payload.phone:
        club.phone = payload.phone.strip()
    if payload.banner:
        club.banner_url = payload.banner.strip()
    if payload.logo:
        club.logo_url = payload.logo.strip()
    if payload.category:
        club.category = payload.category.strip()
    if payload.department:
        club.department = payload.department.strip()

    db.commit()
    db.refresh(club)

    return get_club_profile(club_id, db)


@router.post("")
def register_club(payload: ClubRegistrationRequest, db: Session = Depends(get_db)):
    """Submit application to establish new student club. Sets approval_status = 'requested'."""
    clean_email = payload.email.strip().lower()
    club_name = (payload.name or payload.clubName or "").strip()
    coord_teacher = (payload.coordinatorTeacher or payload.facultyAdvisor or "").strip()
    if not club_name:
        return json_error_response(status_code=400, error="BAD_REQUEST", message="Club name is required.")

    existing_club = db.query(Club).filter(
        or_(Club.name.ilike(club_name), Club.email.ilike(clean_email))
    ).first()
    if existing_club:
        return json_error_response(
            status_code=409,
            error="CLUB_ALREADY_EXISTS",
            message="A club with this name or email already exists.",
            path="/api/v1/clubs",
        )

    # Find or create coordinator account
    coord_user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if not coord_user:
        coord_user = User(
            email=clean_email,
            password_hash=hash_password(payload.password),
            name=coord_teacher,
            phone=payload.phone.strip(),
            role="CLUB_COORDINATOR",
            is_active=True,
            status="pending",
        )
        db.add(coord_user)
        db.flush()
    else:
        coord_user.role = "CLUB_COORDINATOR"
        coord_user.status = "pending"
        db.flush()

    new_id = f"c_{uuid.uuid4().hex[:8]}"
    ref_suffix = f"{uuid.uuid4().hex[:4].upper()}"
    dept_code = "CSE" if "Computer" in payload.department else "CLB"
    reference_id = f"REQ-2026-{dept_code}-{ref_suffix}"
    club_code = f"{dept_code}-{ref_suffix}"

    new_club = Club(
        id=new_id,
        club_code=club_code,
        name=club_name,
        category=payload.category.strip(),
        department=payload.department.strip(),
        description=payload.description.strip(),
        about_mission=payload.description.strip(),
        faculty_advisor_name=coord_teacher,
        faculty_advisor_id=coord_user.id,
        hod_name=payload.hod.strip(),
        email=clean_email,
        phone=payload.phone.strip(),
        logo_url=f"https://api.dicebear.com/7.x/shapes/svg?seed={club_name.replace(' ', '')}",
        banner_url="https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
        approval_status="requested",
        status="Requested",
    )
    db.add(new_club)
    db.flush()

    # Add coordinator membership tag
    membership = ClubMembership(
        club_id=new_club.id,
        user_id=coord_user.id,
        role="COORDINATOR",
        designation="Faculty Club Coordinator",
        status="pending",
    )
    db.add(membership)
    db.commit()

    return json_success_response(
        data={
            "id": new_club.id,
            "club_id": new_club.id,
            "referenceId": reference_id,
            "reference_id": reference_id,
            "clubCode": club_code,
            "name": new_club.name,
            "club_name": new_club.name,
            "category": new_club.category,
            "department": new_club.department,
            "hod": new_club.hod_name,
            "faculty_advisor": new_club.faculty_advisor_name,
            "email": new_club.email,
            "phone": new_club.phone,
            "approvalStatus": "requested",
            "status": "Requested",
            "submittedAt": datetime.now(timezone.utc).isoformat(),
        },
        message="Club registration request submitted successfully. Pending administrative approval.",
        status_code=201,
    )


# ============================================================================
# 5. ZERO-CODE OPEN ADMISSIONS & MEMBERSHIP
# ============================================================================

@router.get("/{club_id}/members")
def get_club_members(club_id: str, db: Session = Depends(get_db)):
    """List members and core team of a club."""
    memberships = (
        db.query(ClubMembership, User, StudentProfile)
        .join(User, ClubMembership.user_id == User.id)
        .outerjoin(StudentProfile, User.id == StudentProfile.user_id)
        .filter(ClubMembership.club_id == club_id, ClubMembership.status == "ACTIVE")
        .all()
    )

    core_count = 0
    gen_count = 0
    members_list = []

    for m, u, sp in memberships:
        is_core = m.role in ["CORE_TEAM", "COORDINATOR", "LEAD"]
        if is_core:
            core_count += 1
        else:
            gen_count += 1

        members_list.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone or (sp.emergency_contact if sp else None),
            "course": sp.course if sp else "B.Tech",
            "branch": sp.branch if sp else "CSE",
            "semester": sp.semester if sp else "4th Sem",
            "classRollNo": sp.class_roll_no if sp else "N/A",
            "role": m.role.replace("_", " ").title(),
            "designation": m.designation,
            "status": m.status.title(),
            "joinedDate": m.joined_date.isoformat() if m.joined_date else "2026-01-01",
        })

    data = {
        "totalMembers": len(members_list),
        "coreTeamCount": core_count,
        "generalMemberCount": gen_count,
        "members": members_list,
    }
    return json_success_response(data=data, status_code=200)


@router.post("/{club_id}/join")
def join_club(
    club_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Zero-code open enrollment into a club."""
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        return json_error_response(status_code=404, error="NOT_FOUND", message="Club not found.")

    existing = db.query(ClubMembership).filter(
        ClubMembership.club_id == club_id, ClubMembership.user_id == user.id
    ).first()

    if existing:
        if existing.status == "ACTIVE":
            return json_error_response(
                status_code=409,
                error="ALREADY_MEMBER",
                message="You are already an active member of this club.",
            )
        else:
            existing.status = "ACTIVE"
            db.commit()
            return json_success_response(
                data={
                    "clubId": club.id,
                    "clubName": club.name,
                    "role": existing.role,
                    "status": "Active",
                },
                message=f"Enrolled in {club.name} successfully under zero-code open admissions",
                status_code=201,
            )

    membership = ClubMembership(
        club_id=club_id,
        user_id=user.id,
        role="MEMBER",
        designation="General Member",
        status="ACTIVE",
    )
    db.add(membership)
    db.commit()

    return json_success_response(
        data={
            "clubId": club.id,
            "clubName": club.name,
            "role": "General Member",
            "status": "Active",
        },
        message=f"Enrolled in {club.name} successfully under zero-code open admissions",
        status_code=201,
    )


@router.delete("/{club_id}/leave")
def leave_club(
    club_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Leave a club and release membership tag."""
    membership = db.query(ClubMembership).filter(
        ClubMembership.club_id == club_id, ClubMembership.user_id == user.id
    ).first()

    if not membership or membership.status != "ACTIVE":
        return json_error_response(
            status_code=400, error="NOT_MEMBER", message="You are not an active member of this club."
        )

    membership.status = "left"
    db.commit()

    return json_success_response(message="You have left the club", status_code=200)


@router.patch("/{club_id}/members/{user_id}/role")
def update_member_role(
    club_id: str,
    user_id: str,
    payload: MemberRoleUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Promote/demote member role and designation in roster."""
    membership = db.query(ClubMembership).filter(
        ClubMembership.club_id == club_id, ClubMembership.user_id == user_id
    ).first()

    if not membership:
        return json_error_response(status_code=404, error="NOT_FOUND", message="Membership record not found.")

    membership.role = payload.role.strip().upper()
    membership.designation = payload.designation.strip()
    db.commit()
    db.refresh(membership)

    return json_success_response(
        data={
            "userId": user_id,
            "clubId": club_id,
            "role": membership.role,
            "designation": membership.designation,
        },
        message="Member role updated successfully.",
        status_code=200,
    )


@router.post("/{club_id}/members")
def add_club_member(
    club_id: str,
    payload: MemberAddRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Coordinator adds or enrolls a student member into the club."""
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        return json_error_response(status_code=404, error="NOT_FOUND", message="Club not found.")

    target_user = None
    if payload.userId:
        target_user = db.query(User).filter(User.id == payload.userId.strip()).first()

    if not target_user and payload.email:
        clean_email = payload.email.strip().lower()
        target_user = db.query(User).filter(User.email.ilike(clean_email)).first()

    if not target_user and payload.collegeId:
        clean_roll = payload.collegeId.strip()
        sp = db.query(StudentProfile).filter(
            or_(StudentProfile.university_roll_no.ilike(clean_roll), StudentProfile.class_roll_no.ilike(clean_roll))
        ).first()
        if sp:
            target_user = db.query(User).filter(User.id == sp.user_id).first()

    # If user doesn't exist, create a student account and profile
    if not target_user:
        member_name = (payload.name or "New Member").strip()
        base_email = payload.email.strip().lower() if payload.email else f"student_{uuid.uuid4().hex[:6]}@college.edu"
        target_user = User(
            email=base_email,
            password_hash=hash_password("Password@2026"),
            name=member_name,
            role="GENERAL_STUDENT",
            status="active",
            is_active=True,
        )
        db.add(target_user)
        db.flush()

        sp = StudentProfile(
            user_id=target_user.id,
            class_roll_no=payload.collegeId.strip() if payload.collegeId else f"CS-{uuid.uuid4().hex[:4].upper()}",
            university_roll_no=f"240{uuid.uuid4().hex[:7]}",
            course="B.Tech",
            branch=payload.department.strip() if payload.department else "Computer Science & Engineering",
            semester="4th Sem",
            academic_year=payload.year.strip() if payload.year else "2nd Year",
            department=payload.department.strip() if payload.department else "Computer Science & Engineering",
        )
        db.add(sp)
        db.flush()

    # Check existing membership
    existing = db.query(ClubMembership).filter(
        ClubMembership.club_id == club_id, ClubMembership.user_id == target_user.id
    ).first()

    raw_role = (payload.role or "MEMBER").strip().upper().replace(" ", "_")
    designation = (payload.designation or "General Member").strip()

    if existing:
        if existing.status == "ACTIVE":
            return json_error_response(
                status_code=409,
                error="ALREADY_MEMBER",
                message=f"{target_user.name} is already an active member of this club.",
            )
        existing.status = "ACTIVE"
        existing.role = raw_role
        existing.designation = designation
        db.commit()
    else:
        membership = ClubMembership(
            club_id=club_id,
            user_id=target_user.id,
            role=raw_role,
            designation=designation,
            status="ACTIVE",
        )
        db.add(membership)
        db.commit()

    return get_club_members(club_id, db)


@router.delete("/{club_id}/members/{user_id}")
def remove_club_member(
    club_id: str,
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Coordinator removes a member from the club roster."""
    membership = db.query(ClubMembership).filter(
        ClubMembership.club_id == club_id, ClubMembership.user_id == user_id
    ).first()

    if not membership:
        return json_error_response(status_code=404, error="NOT_FOUND", message="Membership record not found.")

    db.delete(membership)
    db.commit()

    return json_success_response(
        data={"clubId": club_id, "userId": user_id},
        message="Member removed from club successfully.",
        status_code=200,
    )


# ============================================================================
# 10. COORDINATOR TASK MANAGEMENT
# ============================================================================

@router.get("/{club_id}/tasks")
def list_tasks(
    club_id: str,
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List operational tasks for club coordinators."""
    q = db.query(CoordinatorTask).filter(CoordinatorTask.club_id == club_id)

    if status and status.lower() != "all":
        q = q.filter(CoordinatorTask.status.ilike(status.strip()))
    if priority and priority.lower() != "all":
        q = q.filter(CoordinatorTask.priority.ilike(priority.strip()))
    if category and category.lower() != "all":
        q = q.filter(CoordinatorTask.category.ilike(category.strip()))

    tasks = q.order_by(CoordinatorTask.due_date.asc()).all()

    items = []
    for t in tasks:
        items.append({
            "id": t.id,
            "clubId": t.club_id,
            "title": t.title,
            "description": t.description,
            "category": t.category,
            "priority": t.priority,
            "assignee": t.assignee,
            "dueDate": t.due_date.isoformat() if t.due_date else "2026-10-24",
            "status": t.status,
        })

    return json_success_response(data=items, status_code=200)


@router.post("/{club_id}/tasks")
def create_task(
    club_id: str,
    payload: TaskCreateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new operational task."""
    due = datetime.strptime(payload.dueDate, "%Y-%m-%d").date() if payload.dueDate else date.today()

    task = CoordinatorTask(
        club_id=club_id,
        title=payload.title.strip(),
        description=payload.description.strip() if payload.description else None,
        category=payload.category.strip() if payload.category else "General",
        priority=payload.priority.strip() if payload.priority else "Medium",
        assignee=payload.assignee.strip(),
        due_date=due,
        status="pending",
        created_by=user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    return json_success_response(
        data={
            "id": task.id,
            "clubId": task.club_id,
            "title": task.title,
            "description": task.description,
            "category": task.category,
            "priority": task.priority,
            "assignee": task.assignee,
            "dueDate": task.due_date.isoformat(),
            "status": task.status,
        },
        message="Task created successfully.",
        status_code=201,
    )


@router.patch("/{club_id}/tasks/{task_id}/status")
def toggle_task_status(
    club_id: str,
    task_id: str,
    payload: TaskStatusUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Toggle operational task status."""
    task = db.query(CoordinatorTask).filter(
        CoordinatorTask.id == task_id, CoordinatorTask.club_id == club_id
    ).first()

    if not task:
        return json_error_response(status_code=404, error="NOT_FOUND", message="Task not found.")

    task.status = payload.status.strip().lower()
    if task.status == "completed":
        task.completed_at = datetime.now(timezone.utc)
    else:
        task.completed_at = None

    db.commit()
    db.refresh(task)

    return json_success_response(
        data={
            "id": task.id,
            "clubId": task.club_id,
            "status": task.status,
            "completedAt": task.completed_at.isoformat() if task.completed_at else None,
        },
        message="Task status updated.",
        status_code=200,
    )


@router.post("/{club_id}/events", status_code=201)
def create_club_event(
    club_id: str,
    payload: EventCreateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create event for a club conforming to POST /api/v1/clubs/{clubId}/events."""
    from app.api.v1.events import create_event_for_club

    return create_event_for_club(club_id, payload, user, db)

