"""Student profile, virtual identity card, and autocomplete directory APIs."""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.session import get_db
from app.models.user import User
from app.models.student_profile import StudentProfile, StudentSkill, StudentInterest
from app.models.membership import ClubMembership
from app.models.registration import EventRegistration
from app.core.dependencies import get_current_user
from app.core.responses import json_success_response, json_error_response
from app.schemas.unified import StudentProfileUpdateRequest

router = APIRouter()


@router.get("/me")
def get_student_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve full student academic credentials and profile."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        # Create default empty profile if none exists
        profile = StudentProfile(
            user_id=user.id,
            class_roll_no="UNSET",
            university_roll_no=f"REG-{user.id[:8]}",
            course="B.Tech",
            branch="Computer Science & Engineering",
            semester="4th Sem",
            academic_year="2nd Year",
            department="Computer Science & Engineering",
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    skills = [s.skill_name for s in profile.skills]
    interests = [i.interest_name for i in profile.interests]

    data = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone or profile.emergency_contact,
        "course": profile.course,
        "branch": profile.branch,
        "sem": profile.semester,
        "year": profile.academic_year,
        "classRollNo": profile.class_roll_no,
        "universityRollNo": profile.university_roll_no,
        "department": profile.department,
        "admissionYear": profile.admission_year,
        "graduatingYear": profile.graduating_year,
        "avatar": user.avatar_url,
        "bio": profile.bio,
        "bloodGroup": profile.blood_group,
        "emergencyContact": profile.emergency_contact,
        "github": profile.github_url,
        "linkedin": profile.linkedin_url,
        "coCurricularHours": float(profile.co_curricular_hours),
        "targetHours": 40.0,
        "skills": skills,
        "interests": interests,
    }
    return json_success_response(data=data, status_code=200)


@router.put("/me")
def update_student_profile(
    payload: StudentProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Modify personal statement, contact telephone, avatar, skills, and links."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        profile = StudentProfile(
            user_id=user.id,
            class_roll_no="UNSET",
            university_roll_no=f"REG-{user.id[:8]}",
            course="B.Tech",
            branch="Computer Science & Engineering",
            semester="4th Sem",
            department="Computer Science & Engineering",
        )
        db.add(profile)

    if payload.name:
        user.name = payload.name.strip()
    if payload.phone is not None:
        user.phone = payload.phone.strip()
    if payload.avatar is not None:
        user.avatar_url = payload.avatar.strip()

    if payload.bio is not None:
        profile.bio = payload.bio.strip()
    if payload.bloodGroup is not None:
        profile.blood_group = payload.bloodGroup.strip()
    if payload.emergencyContact is not None:
        profile.emergency_contact = payload.emergencyContact.strip()
    if payload.github is not None:
        profile.github_url = payload.github.strip()
    if payload.linkedin is not None:
        profile.linkedin_url = payload.linkedin.strip()

    if payload.skills is not None:
        db.query(StudentSkill).filter(StudentSkill.user_id == user.id).delete()
        for s in payload.skills:
            if s.strip():
                db.add(StudentSkill(user_id=user.id, skill_name=s.strip()))

    if payload.interests is not None:
        db.query(StudentInterest).filter(StudentInterest.user_id == user.id).delete()
        for i in payload.interests:
            if i.strip():
                db.add(StudentInterest(user_id=user.id, interest_name=i.strip()))

    db.commit()
    db.refresh(profile)
    db.refresh(user)

    return get_student_profile(user, db)


@router.get("/me/id-card")
def get_student_id_card(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Generate verified digital identity pass with simulated barcode string."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    roll_no = profile.class_roll_no if profile else "CS24089"
    univ_roll = profile.university_roll_no if profile else "2400100345"
    course = profile.course if profile else "B.Tech"
    branch = profile.branch if profile else "Computer Science & Engineering"
    sem = profile.semester if profile else "4th Sem"
    year = profile.academic_year if profile else "2nd Year"
    dept = profile.department if profile else "Computer Science & Engineering"
    blood = profile.blood_group if profile else "B+"

    data = {
        "institutionName": "UNISPHERE UNIVERSITY",
        "academicSession": "SESSION 2024-28",
        "name": user.name,
        "course": f"{course} in {branch}",
        "classRollNo": roll_no,
        "universityRollNo": univ_roll,
        "semesterYear": f"{sem} ({year})",
        "department": dept,
        "bloodGroup": blood,
        "avatar": user.avatar_url,
        "barcodeString": f"UNI-STUDENT-{roll_no}-2026",
        "barcodeVisual": "||| | |||| | |||||| || | |||| ||",
        "qrPayload": f"UNISPHERE-VERIFIED-ID:{univ_roll}:{user.name}",
        "validThru": "2028-06-30",
        "isValidated": True,
    }
    return json_success_response(data=data, status_code=200)


@router.get("/search")
def search_students(
    q: str = Query(..., min_length=1),
    clubId: Optional[str] = Query(None),
    eventId: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Search campus student directory with autocomplete matching name, email, or roll numbers."""
    term = f"%{q.strip()}%"

    results = (
        db.query(User, StudentProfile)
        .outerjoin(StudentProfile, User.id == StudentProfile.user_id)
        .filter(
            User.role.in_(["GENERAL_STUDENT", "student"]),
            User.is_active == True,
            or_(
                User.name.ilike(term),
                User.email.ilike(term),
                StudentProfile.class_roll_no.ilike(term),
                StudentProfile.university_roll_no.ilike(term),
            )
        )
        .limit(10)
        .all()
    )

    items = []
    for u, p in results:
        is_member = False
        if clubId:
            is_member = (
                db.query(ClubMembership)
                .filter(
                    ClubMembership.club_id == clubId,
                    ClubMembership.user_id == u.id,
                    ClubMembership.status == "ACTIVE"
                )
                .first()
                is not None
            )

        is_registered = False
        if eventId:
            is_registered = (
                db.query(EventRegistration)
                .filter(
                    EventRegistration.event_id == eventId,
                    EventRegistration.user_id == u.id,
                    EventRegistration.status != "CANCELLED"
                )
                .first()
                is not None
            )

        items.append({
            "id": u.id,
            "name": u.name,
            "classRollNo": p.class_roll_no if p else "N/A",
            "universityRollNo": p.university_roll_no if p else "N/A",
            "email": u.email,
            "phone": u.phone,
            "course": p.course if p else "B.Tech",
            "branch": p.branch if p else "CSE",
            "year": p.academic_year if p else "2nd Year",
            "department": p.department if p else "CSE",
            "avatar": u.avatar_url,
            "isClubMember": is_member,
            "isAlreadyRegistered": is_registered,
        })

    return json_success_response(data=items, status_code=200)
