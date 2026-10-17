"""Events router."""

import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.dependencies import get_current_user, get_optional_user
from app.db.session import get_db
from app.models.club import Club
from app.models.event import Event
from app.models.membership import ClubMembership
from app.models.user import User
from app.schemas.event import EventResponse, EventCreateRequest, EventUpdateRequest

router = APIRouter(tags=["Events"])


def _parse_rules(rules_str: str | None) -> list[str]:
    if not rules_str:
        return []
    try:
        parsed = json.loads(rules_str)
        if isinstance(parsed, list):
            return parsed
    except (json.JSONDecodeError, TypeError):
        pass
    return [r.strip() for r in rules_str.split(",") if r.strip()]


def _event_to_response(event: Event, db: Session) -> EventResponse:
    club = db.query(Club).filter(Club.id == event.club_id).first()
    club_name = club.name if club else ""

    # Determine display status
    display_status = event.status.capitalize()
    if event.status == "published":
        # Check if past
        try:
            event_date = datetime.strptime(event.date, "%Y-%m-%d").date()
            if event_date < datetime.now(timezone.utc).date():
                display_status = "Past"
            else:
                display_status = "Upcoming"
        except (ValueError, TypeError):
            display_status = "Upcoming"

    return EventResponse(
        id=event.id,
        club_id=event.club_id,
        title=event.title,
        description=event.description,
        date=event.date,
        time=event.time,
        venue=event.venue,
        capacity=event.capacity,
        registered_count=event.registered_count,
        status=display_status,
        eligibility=event.eligibility,
        rules=_parse_rules(event.rules),
        image_url=event.image_url,
        clubId=event.club_id,
        clubName=club_name,
        registeredCount=event.registered_count,
        image=event.image_url,
    )


@router.get("/api/events", response_model=list[EventResponse])
def list_events(
    search: str = Query(default="", max_length=200),
    club_id: str = Query(default="", alias="clubId"),
    status_filter: str = Query(default="", alias="status"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Event).filter(Event.status.in_(["published", "completed"]))
    if search:
        q = q.filter(
            Event.title.ilike(f"%{search}%")
            | Event.description.ilike(f"%{search}%")
            | Event.venue.ilike(f"%{search}%")
        )
    if club_id:
        q = q.filter(Event.club_id == club_id)
    events = q.order_by(Event.date.desc()).offset((page - 1) * limit).limit(limit).all()
    return [_event_to_response(e, db) for e in events]


@router.get("/api/events/{event_id}", response_model=EventResponse)
def get_event(event_id: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Event not found."})
    return _event_to_response(event, db)


@router.post("/api/clubs/{club_id}/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    club_id: str,
    req: EventCreateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Club not found."})

    # Authorization: must be coordinator/faculty_head of this club, or admin
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
            raise HTTPException(
                status_code=403,
                detail={"code": "FORBIDDEN", "message": "Not authorized to create events for this club."},
            )

    # Build rules JSON
    rules_json = None
    if req.rules:
        rules_list = [r.strip() for r in req.rules.split(",") if r.strip()]
        rules_json = json.dumps(rules_list)

    # Build time display string
    time_str = req.time
    if not time_str and req.start_time and req.end_time:
        time_str = f"{req.start_time} - {req.end_time}"

    event = Event(
        club_id=club_id,
        title=req.title,
        description=req.description,
        date=req.date,
        time=time_str,
        venue=req.venue,
        capacity=req.capacity,
        status=req.status if req.status in ("draft", "published") else "published",
        eligibility=req.eligibility,
        rules=rules_json,
        image_url=req.image_url,
        creator_id=user.id,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return _event_to_response(event, db)


@router.patch("/api/events/{event_id}", response_model=EventResponse)
def update_event(
    event_id: str,
    req: EventUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Event not found."})

    # Authorization
    if user.role != "admin":
        membership = (
            db.query(ClubMembership)
            .filter(
                ClubMembership.user_id == user.id,
                ClubMembership.club_id == event.club_id,
                ClubMembership.status == "approved",
                ClubMembership.club_role.in_(["coordinator", "faculty_head"]),
            )
            .first()
        )
        if not membership:
            raise HTTPException(status_code=403, detail={"code": "FORBIDDEN", "message": "Not authorized to edit this event."})

    update_data = req.model_dump(exclude_unset=True)
    if "rules" in update_data and update_data["rules"] is not None:
        rules_list = [r.strip() for r in update_data["rules"].split(",") if r.strip()]
        update_data["rules"] = json.dumps(rules_list)
    for key, value in update_data.items():
        setattr(event, key, value)
    db.commit()
    db.refresh(event)
    return _event_to_response(event, db)


@router.post("/api/events/{event_id}/publish", response_model=EventResponse)
def publish_event(
    event_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Event not found."})
    if event.status not in ("draft",):
        raise HTTPException(status_code=400, detail={"code": "INVALID_STATUS", "message": "Only draft events can be published."})
    event.status = "published"
    db.commit()
    db.refresh(event)
    return _event_to_response(event, db)


@router.post("/api/events/{event_id}/cancel", response_model=EventResponse)
def cancel_event(
    event_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Event not found."})
    if event.status == "cancelled":
        raise HTTPException(status_code=400, detail={"code": "ALREADY_CANCELLED", "message": "Event is already cancelled."})
    event.status = "cancelled"
    db.commit()
    db.refresh(event)
    return _event_to_response(event, db)


@router.get("/api/clubs/{club_id}/events", response_model=list[EventResponse])
def list_club_events(
    club_id: str,
    db: Session = Depends(get_db),
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Club not found."})
    events = db.query(Event).filter(Event.club_id == club_id).order_by(Event.date.desc()).all()
    return [_event_to_response(e, db) for e in events]
