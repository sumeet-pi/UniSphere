"""Announcements API endpoints conforming to API_SPECIFICATION.md Section 11."""
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.announcement import Announcement
from app.models.club import Club
from app.models.membership import ClubMembership
from app.models.user import User
from app.core.dependencies import get_current_user, get_optional_current_user
from app.core.responses import json_success_response
from app.schemas.unified import AnnouncementCreateRequest

router = APIRouter(tags=["Announcements"])


@router.get("/announcements")
def list_announcements(
    club_id: str | None = Query(None, alias="clubId"),
    priority: str | None = Query(None),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    """
    List announcements feed.
    Conforms to API_SPECIFICATION.md Section 11.1.
    Audience enforcement:
    - 'All Campus Students' visible to all.
    - 'Club Members Only' visible only if user is logged in and is member/coordinator/admin of the club.
    """
    query = db.query(Announcement).join(Club, Announcement.club_id == Club.id)

    if club_id:
        query = query.filter(Announcement.club_id == club_id)

    if priority and priority.lower() != "all":
        query = query.filter(Announcement.priority.ilike(priority))

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Announcement.title.ilike(search_pattern))
            | (Announcement.content.ilike(search_pattern))
            | (Club.name.ilike(search_pattern))
        )

    announcements = (
        query.order_by(Announcement.is_pinned.desc(), Announcement.publish_date.desc(), Announcement.created_at.desc())
        .all()
    )

    # Determine user's active club memberships
    user_club_ids = set()
    is_admin = False
    if current_user:
        if current_user.role == "ADMIN":
            is_admin = True
        else:
            memberships = (
                db.query(ClubMembership)
                .filter(
                    ClubMembership.user_id == current_user.id,
                    ClubMembership.status == "ACTIVE",
                )
                .all()
            )
            user_club_ids = {m.club_id for m in memberships}
            # If coordinator of a club
            if current_user.role in ("CLUB_COORDINATOR", "FACULTY_HEAD"):
                coord_clubs = db.query(Club).filter(Club.coordinator_id == current_user.id).all()
                for c in coord_clubs:
                    user_club_ids.add(c.id)

    result = []
    for a in announcements:
        if a.audience == "Club Members Only" and not is_admin:
            if not current_user or a.club_id not in user_club_ids:
                continue

        result.append(
            {
                "id": a.id,
                "clubId": a.club_id,
                "clubName": a.club.name if a.club else "University Club",
                "title": a.title,
                "category": a.category,
                "priority": a.priority,
                "audience": a.audience,
                "author": a.author,
                "date": a.publish_date.isoformat() if a.publish_date else str(date.today()),
                "content": a.content,
            }
        )

    return json_success_response(data=result, status_code=200)


@router.post("/clubs/{club_id}/announcements", status_code=201)
def broadcast_announcement(
    club_id: str,
    payload: AnnouncementCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Broadcast campus announcement for a club.
    Conforms to API_SPECIFICATION.md Section 11.2.
    """
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found.")

    # Authorization check
    is_authorized = (
        current_user.role == "ADMIN"
        or club.coordinator_id == current_user.id
        or club.faculty_advisor_id == current_user.id
        or (club.email and current_user.email and club.email.lower() == current_user.email.lower())
    )
    if not is_authorized:
        membership = (
            db.query(ClubMembership)
            .filter(
                ClubMembership.club_id == club_id,
                ClubMembership.user_id == current_user.id,
                ClubMembership.status.in_(["ACTIVE", "APPROVED"]),
                ClubMembership.role.in_(["COORDINATOR", "VICE_PRESIDENT", "LEAD", "FACULTY_HEAD", "Faculty Advisor"]),
            )
            .first()
        )
        if not membership and current_user.role not in ("CLUB_COORDINATOR", "FACULTY_HEAD", "organizer"):
            raise HTTPException(
                status_code=403,
                detail="Only the authorized club coordinator or faculty head can broadcast announcements.",
            )

    announcement = Announcement(
        club_id=club_id,
        status="published",
        title=payload.title,
        content=payload.content,
        category=payload.category,
        priority=payload.priority,
        audience=payload.audience,
        author=payload.author or (f"{current_user.name} ({current_user.role.title()})"),
        author_user_id=current_user.id,
        publish_date=date.today(),
        is_pinned=payload.is_pinned if hasattr(payload, "is_pinned") and payload.is_pinned is not None else False,
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)

    data = {
        "id": announcement.id,
        "clubId": announcement.club_id,
        "clubName": club.name,
        "title": announcement.title,
        "category": announcement.category,
        "priority": announcement.priority,
        "audience": announcement.audience,
        "author": announcement.author,
        "date": announcement.publish_date.isoformat(),
        "content": announcement.content,
    }
    return json_success_response(
        data=data,
        message="Announcement broadcasted successfully",
        status_code=201,
    )
