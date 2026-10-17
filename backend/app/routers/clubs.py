"""Clubs router."""

import json
import re

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.dependencies import get_current_user, get_optional_user
from app.db.session import get_db
from app.models.club import Club
from app.models.event import Event
from app.models.membership import ClubMembership
from app.models.user import User
from app.schemas.club import ClubResponse, ClubCreateRequest, ClubUpdateRequest

router = APIRouter(prefix="/api/clubs", tags=["Clubs"])


def _slugify(name: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", name.lower().strip())
    return re.sub(r"[\s_]+", "-", slug)


def _club_to_response(club: Club, db: Session) -> ClubResponse:
    member_count = (
        db.query(func.count(ClubMembership.id))
        .filter(ClubMembership.club_id == club.id, ClubMembership.status == "approved")
        .scalar()
    ) or 0

    upcoming_count = (
        db.query(func.count(Event.id))
        .filter(Event.club_id == club.id, Event.status == "published")
        .scalar()
    ) or 0

    # Build core team
    core_members = (
        db.query(ClubMembership, User)
        .join(User, ClubMembership.user_id == User.id)
        .filter(
            ClubMembership.club_id == club.id,
            ClubMembership.status == "approved",
            ClubMembership.club_role.in_(["coordinator", "faculty_head"]),
        )
        .all()
    )
    core_team = [
        {
            "id": u.id,
            "name": u.full_name,
            "role": m.club_role.replace("_", " ").title(),
            "department": u.branch or "",
        }
        for m, u in core_members
    ]

    return ClubResponse(
        id=club.id,
        name=club.name,
        slug=club.slug,
        category=club.category,
        description=club.description,
        logo_url=club.logo_url,
        banner_url=club.banner_url,
        faculty_head=club.faculty_head,
        status=club.status,
        member_count=member_count,
        upcoming_events_count=upcoming_count,
        logo=club.logo_url,
        banner=club.banner_url,
        memberCount=member_count,
        facultyHead=club.faculty_head or "",
        upcomingEventsCount=upcoming_count,
        coreTeam=core_team,
    )


@router.get("", response_model=list[ClubResponse])
def list_clubs(
    search: str = Query(default="", max_length=200),
    category: str = Query(default=""),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Club).filter(Club.status == "active")
    if search:
        q = q.filter(
            Club.name.ilike(f"%{search}%")
            | Club.description.ilike(f"%{search}%")
            | Club.category.ilike(f"%{search}%")
        )
    if category:
        q = q.filter(Club.category == category)
    clubs = q.order_by(Club.name).offset((page - 1) * limit).limit(limit).all()
    return [_club_to_response(c, db) for c in clubs]


@router.get("/{club_id}", response_model=ClubResponse)
def get_club(club_id: str, db: Session = Depends(get_db)):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        # Try by slug
        club = db.query(Club).filter(Club.slug == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Club not found."})
    return _club_to_response(club, db)


@router.post("", response_model=ClubResponse, status_code=status.HTTP_201_CREATED)
def create_club(
    req: ClubCreateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    slug = _slugify(req.name)
    if db.query(Club).filter(Club.slug == slug).first():
        slug = f"{slug}-{str(user.id)[:8]}"

    club = Club(
        name=req.name,
        slug=slug,
        category=req.category,
        description=req.description,
        logo_url=req.logo_url,
        banner_url=req.banner_url,
        faculty_head=req.faculty_head,
        creator_id=user.id,
    )
    db.add(club)
    db.flush()

    # Auto-add creator as coordinator
    membership = ClubMembership(
        user_id=user.id,
        club_id=club.id,
        status="approved",
        club_role="coordinator" if user.role != "faculty" else "faculty_head",
    )
    db.add(membership)
    db.commit()
    db.refresh(club)
    return _club_to_response(club, db)


@router.patch("/{club_id}", response_model=ClubResponse)
def update_club(
    club_id: str,
    req: ClubUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Club not found."})

    # Check authorization
    if user.role != "admin":
        membership = (
            db.query(ClubMembership)
            .filter(
                ClubMembership.user_id == user.id,
                ClubMembership.club_id == club_id,
                ClubMembership.status == "approved",
                ClubMembership.club_role.in_(["coordinator", "faculty_head"]),
            )
            .first()
        )
        if not membership:
            raise HTTPException(status_code=403, detail={"code": "FORBIDDEN", "message": "Not authorized to edit this club."})

    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(club, key, value)
    db.commit()
    db.refresh(club)
    return _club_to_response(club, db)


@router.get("/{club_id}/members")
def list_club_members(
    club_id: str,
    db: Session = Depends(get_db),
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Club not found."})

    memberships = (
        db.query(ClubMembership, User)
        .join(User, ClubMembership.user_id == User.id)
        .filter(ClubMembership.club_id == club_id, ClubMembership.status == "approved")
        .all()
    )
    return [
        {
            "id": m.id,
            "name": u.full_name,
            "collegeId": u.university_roll_no or u.class_roll_no or "",
            "department": u.branch or "",
            "year": u.semester or "",
            "role": m.club_role.replace("_", " ").title(),
            "status": "Active",
            "joinedDate": m.joined_at.strftime("%Y-%m-%d") if m.joined_at else "",
        }
        for m, u in memberships
    ]


@router.post("/{club_id}/membership-requests", status_code=status.HTTP_201_CREATED)
def request_membership(
    club_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Club not found."})

    existing = (
        db.query(ClubMembership)
        .filter(ClubMembership.user_id == user.id, ClubMembership.club_id == club_id)
        .first()
    )
    if existing:
        if existing.status in ("approved", "pending"):
            raise HTTPException(
                status_code=409,
                detail={"code": "ALREADY_MEMBER", "message": "Already a member or request pending."},
            )
        # Re-apply if previously rejected/left
        existing.status = "approved"  # MVP: auto-approve
        db.commit()
        return {"message": "Membership renewed.", "status": "approved"}

    membership = ClubMembership(
        user_id=user.id,
        club_id=club_id,
        status="approved",  # MVP: auto-approve
        club_role="member",
    )
    db.add(membership)
    db.commit()
    return {"message": "Joined club successfully.", "status": "approved"}
