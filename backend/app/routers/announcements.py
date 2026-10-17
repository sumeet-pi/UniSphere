"""Announcements router."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.announcement import Announcement
from app.models.club import Club
from app.models.membership import ClubMembership
from app.models.user import User
from app.schemas.announcement import AnnouncementResponse, AnnouncementCreateRequest

router = APIRouter(tags=["Announcements"])


def _announcement_to_response(ann: Announcement, db: Session) -> AnnouncementResponse:
    club = db.query(Club).filter(Club.id == ann.club_id).first()
    return AnnouncementResponse(
        id=ann.id,
        club_id=ann.club_id,
        title=ann.title,
        body=ann.body,
        status=ann.status,
        created_at=ann.created_at,
        clubId=ann.club_id,
        date=ann.created_at.strftime("%Y-%m-%d") if ann.created_at else "",
        content=ann.body,
    )


@router.get("/api/clubs/{club_id}/announcements", response_model=list[AnnouncementResponse])
def list_club_announcements(
    club_id: str,
    db: Session = Depends(get_db),
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Club not found."})
    anns = (
        db.query(Announcement)
        .filter(Announcement.club_id == club_id, Announcement.status == "published")
        .order_by(Announcement.created_at.desc())
        .all()
    )
    return [_announcement_to_response(a, db) for a in anns]


@router.get("/api/announcements", response_model=list[AnnouncementResponse])
def list_all_announcements(db: Session = Depends(get_db)):
    anns = (
        db.query(Announcement)
        .filter(Announcement.status == "published")
        .order_by(Announcement.created_at.desc())
        .limit(20)
        .all()
    )
    return [_announcement_to_response(a, db) for a in anns]


@router.post("/api/clubs/{club_id}/announcements", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(
    club_id: str,
    req: AnnouncementCreateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Club not found."})

    # Authorization
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
            raise HTTPException(status_code=403, detail={"code": "FORBIDDEN", "message": "Not authorized."})

    ann = Announcement(
        club_id=club_id,
        title=req.title,
        body=req.body,
        event_id=req.event_id,
        status=req.status,
        creator_id=user.id,
    )
    db.add(ann)
    db.commit()
    db.refresh(ann)
    return _announcement_to_response(ann, db)
