"""Events and 4-Stage Lifecycle State Machine router conforming to API_SPECIFICATION.md."""

from datetime import datetime, date, timezone
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.db.session import get_db
from app.models.user import User
from app.models.club import Club
from app.models.membership import ClubMembership
from app.models.event import Event
from app.models.event_details import EventRule, EventWinner
from app.models.registration import EventRegistration
from app.core.dependencies import get_current_user, get_optional_user
from app.core.responses import json_success_response, json_error_response
from app.schemas.unified import (
    EventCreateRequest,
    EventStageTransitionRequest,
    DeclareWinnersRequest,
)

router = APIRouter()


@router.get("")
def list_events(
    stage: Optional[str] = Query("all"),
    category: Optional[str] = Query("All"),
    search: Optional[str] = Query(None),
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """List events with stage, category, and search filters."""
    query = db.query(Event).join(Club, Event.club_id == Club.id)

    if stage and stage.lower() != "all":
        query = query.filter(Event.stage == stage.lower().strip())

    if category and category.lower() != "all":
        query = query.filter(Event.category.ilike(f"%{category.strip()}%"))

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Event.title.ilike(s),
                Event.description.ilike(s),
                Event.venue.ilike(s),
                Club.name.ilike(s),
            )
        )

    events = query.order_by(Event.event_date.asc()).all()

    # User membership tags and registration records
    user_memberships = set()
    user_registrations = set()
    if user:
        user_memberships = {
            m.club_id
            for m in db.query(ClubMembership)
            .filter(ClubMembership.user_id == user.id, ClubMembership.status == "ACTIVE")
            .all()
        }
        user_registrations = {
            r.event_id
            for r in db.query(EventRegistration)
            .filter(EventRegistration.user_id == user.id, EventRegistration.status != "CANCELLED")
            .all()
        }

    results = []
    for e in events:
        is_member = e.club_id in user_memberships
        is_reg = e.id in user_registrations

        can_reg = True
        restriction_reason = None

        if e.stage != "open":
            can_reg = False
            restriction_reason = f"Event is currently {e.stage} for registrations."
        elif is_reg:
            can_reg = False
            restriction_reason = "You already hold an active pass for this event."
        elif is_member and e.restrict_club_members:
            can_reg = False
            restriction_reason = f"You are a member of {e.club.name}. Organizing club members cannot register as participants."
        elif e.registered_count >= e.capacity:
            can_reg = False
            restriction_reason = "Event capacity is full."

        rules = [r.rule_text for r in e.rules_list]

        results.append({
            "id": e.id,
            "clubId": e.club_id,
            "clubName": e.club.name,
            "title": e.title,
            "category": e.category,
            "stage": e.stage,
            "status": e.status,
            "date": e.event_date.isoformat(),
            "time": e.time_display,
            "venue": e.venue,
            "capacity": e.capacity,
            "registeredCount": e.registered_count,
            "description": e.description,
            "image": e.image_url,
            "restrictClubMembers": e.restrict_club_members,
            "isTeamEvent": e.is_team_event,
            "minTeamSize": e.min_team_size,
            "maxTeamSize": e.max_team_size,
            "isRegistered": is_reg,
            "isClubMember": is_member,
            "canRegister": can_reg,
            "restrictionReason": restriction_reason,
            "rules": rules,
        })

    return json_success_response(data=results, status_code=200)


@router.get("/{event_id}")
def get_event_details(
    event_id: str,
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Get single event metadata, rules, venue, and restriction indicators."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        return json_error_response(
            status_code=404, error="NOT_FOUND", message="Event not found.", path=f"/api/v1/events/{event_id}"
        )

    is_member = False
    is_reg = False
    if user:
        is_member = (
            db.query(ClubMembership)
            .filter(ClubMembership.club_id == event.club_id, ClubMembership.user_id == user.id, ClubMembership.status == "ACTIVE")
            .first()
            is not None
        )
        is_reg = (
            db.query(EventRegistration)
            .filter(EventRegistration.event_id == event.id, EventRegistration.user_id == user.id, EventRegistration.status != "CANCELLED")
            .first()
            is not None
        )

    can_reg = True
    restriction_reason = None
    if event.stage != "open":
        can_reg = False
        restriction_reason = f"Event is currently {event.stage} for registrations."
    elif is_reg:
        can_reg = False
        restriction_reason = "You already hold an active pass for this event."
    elif is_member and event.restrict_club_members:
        can_reg = False
        restriction_reason = f"You are a member of {event.club.name}. Organizing club members cannot register as participants."
    elif event.registered_count >= event.capacity:
        can_reg = False
        restriction_reason = "Event capacity is full."

    rules = [r.rule_text for r in event.rules_list]

    data = {
        "id": event.id,
        "clubId": event.club_id,
        "clubName": event.club.name,
        "title": event.title,
        "category": event.category,
        "stage": event.stage,
        "status": event.status,
        "date": event.event_date.isoformat(),
        "time": event.time_display,
        "venue": event.venue,
        "capacity": event.capacity,
        "registeredCount": event.registered_count,
        "turnoutCount": event.turnout_count,
        "description": event.description,
        "eligibility": event.eligibility,
        "image": event.image_url,
        "restrictClubMembers": event.restrict_club_members,
        "isTeamEvent": event.is_team_event,
        "minTeamSize": event.min_team_size,
        "maxTeamSize": event.max_team_size,
        "isRegistered": is_reg,
        "isClubMember": is_member,
        "canRegister": can_reg,
        "restrictionReason": restriction_reason,
        "rules": rules,
    }
    return json_success_response(data=data, status_code=200)


@router.post("/clubs/{club_id}")
def create_event_legacy_endpoint(
    club_id: str,
    payload: EventCreateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create event under /api/v1/events/clubs/:clubId (supporting both URL styles)."""
    return create_event_for_club(club_id, payload, user, db)


def create_event_for_club(
    club_id: str,
    payload: EventCreateRequest,
    user: User,
    db: Session,
):
    """Internal helper to create event."""
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        return json_error_response(status_code=404, error="NOT_FOUND", message="Club not found.")

    is_authorized = (
        user.role == "ADMIN"
        or club.coordinator_id == user.id
        or club.faculty_advisor_id == user.id
        or (club.email and club.email.lower() == user.email.lower())
    )
    if not is_authorized:
        membership = db.query(ClubMembership).filter(
            ClubMembership.club_id == club_id,
            ClubMembership.user_id == user.id,
            func.upper(ClubMembership.status).in_(["ACTIVE", "APPROVED"]),
            func.upper(ClubMembership.role).in_(["COORDINATOR", "FACULTY_HEAD", "PRESIDENT", "VICE_PRESIDENT", "LEAD"])
        ).first()
        if not membership and user.role not in ("CLUB_COORDINATOR", "organizer", "FACULTY_HEAD"):
            return json_error_response(
                status_code=403,
                error="FORBIDDEN",
                message="You are not authorized to create events for this club."
            )

    event_dt = datetime.strptime(payload.date, "%Y-%m-%d").date()
    start_dt = None
    end_dt = None
    try:
        start_part = payload.time.split("-")[0].strip() if "-" in payload.time else "09:00 AM"
        start_dt = datetime.strptime(f"{payload.date} {start_part}", "%Y-%m-%d %I:%M %p").replace(tzinfo=timezone.utc)
    except Exception:
        start_dt = None
    try:
        end_part = payload.time.split("-")[1].strip() if "-" in payload.time else "05:00 PM"
        end_dt = datetime.strptime(f"{payload.date} {end_part}", "%Y-%m-%d %I:%M %p").replace(tzinfo=timezone.utc)
    except Exception:
        end_dt = None

    new_event = Event(
        club_id=club_id,
        title=payload.title.strip(),
        category=payload.category.strip(),
        stage=payload.stage.lower().strip() if payload.stage else "open",
        status=payload.stage.title().strip() if payload.stage else "Open",
        restrict_club_members=payload.restrictClubMembers,
        is_team_event=payload.isTeamEvent,
        min_team_size=payload.minTeamSize,
        max_team_size=payload.maxTeamSize,
        event_date=event_dt,
        start_time=start_dt,
        end_time=end_dt,
        time_display=payload.time.strip(),
        venue=payload.venue.strip(),
        capacity=payload.capacity,
        description=payload.description.strip(),
        eligibility=payload.eligibility.strip() if payload.eligibility else "All Students",
        image_url=payload.image.strip(),
        created_by=user.id,
    )
    db.add(new_event)
    db.flush()

    for idx, rule_text in enumerate(payload.rules, start=1):
        if rule_text.strip():
            db.add(EventRule(event_id=new_event.id, rule_order=idx, rule_text=rule_text.strip()))

    db.commit()
    db.refresh(new_event)

    return json_success_response(
        data={
            "id": new_event.id,
            "clubId": new_event.club_id,
            "title": new_event.title,
            "stage": new_event.stage,
            "status": new_event.status,
            "capacity": new_event.capacity,
        },
        message="Event created successfully.",
        status_code=201,
    )


@router.patch("/{event_id}/stage")
def transition_event_stage(
    event_id: str,
    payload: EventStageTransitionRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Transition 4-stage lifecycle: upcoming -> open -> closed -> past."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        return json_error_response(status_code=404, error="NOT_FOUND", message="Event not found.")

    new_stage = payload.stage.lower().strip()
    allowed_stages = ["upcoming", "open", "closed", "past", "cancelled"]
    if new_stage not in allowed_stages:
        return json_error_response(
            status_code=400,
            error="INVALID_STAGE",
            message=f"Invalid stage '{new_stage}'. Allowed stages: {', '.join(allowed_stages)}",
        )

    event.stage = new_stage
    event.status = payload.status or new_stage.title()
    db.commit()
    db.refresh(event)

    return json_success_response(
        data={
            "eventId": event.id,
            "stage": event.stage,
            "status": event.status,
        },
        message=f"Event lifecycle stage transitioned to '{event.stage}'",
        status_code=200,
    )


# ============================================================================
# 8. CHAMPIONS & WINNERS PODIUM
# ============================================================================

@router.get("/{event_id}/winners")
def get_event_winners(event_id: str, db: Session = Depends(get_db)):
    """Get podium champions for concluded hackathons and contests."""
    winners = (
        db.query(EventWinner)
        .filter(EventWinner.event_id == event_id)
        .order_by(EventWinner.rank_position.asc())
        .all()
    )

    data = []
    for w in winners:
        data.append({
            "rankPosition": w.rank_position,
            "rank": w.rank_display,
            "name": w.winner_name,
            "branch": w.branch,
            "prize": w.prize,
            "projectTitle": w.project_title,
        })

    return json_success_response(data=data, status_code=200)


@router.post("/{event_id}/winners")
def declare_winners(
    event_id: str,
    payload: DeclareWinnersRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Declare or update champions podium."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        return json_error_response(status_code=404, error="NOT_FOUND", message="Event not found.")

    db.query(EventWinner).filter(EventWinner.event_id == event_id).delete()

    items = payload.winners or payload.podium or []
    for w in items:
        name = (w.name or w.teamName or (", ".join(w.teamMembers) if w.teamMembers else "Winner")).strip()
        rank_val = w.position or w.rank or f"Rank {w.rankPosition}"
        rank_display = str(rank_val).strip()
        try:
            pos_int = int(w.rankPosition) if w.rankPosition is not None else 1
        except (ValueError, TypeError):
            pos_int = 1
        winner = EventWinner(
            event_id=event_id,
            rank_position=pos_int,
            rank_display=rank_display,
            winner_name=name,
            branch=w.branch.strip() if w.branch else "CSE",
            prize=w.prize.strip() if w.prize else "Certificate & Trophy",
            project_title=w.projectTitle.strip() if w.projectTitle else None,
        )
        db.add(winner)

    db.commit()
    return get_event_winners(event_id, db)
