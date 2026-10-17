"""Registration router — the most critical business logic."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.event import Event
from app.models.registration import EventRegistration
from app.models.club import Club
from app.models.user import User
from app.schemas.registration import (
    RegistrationResponse,
    RegistrationCreateResponse,
    MyRegistrationResponse,
)

router = APIRouter(tags=["Registrations"])


@router.post(
    "/api/events/{event_id}/registrations",
    response_model=RegistrationCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_for_event(
    event_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Register the current user for an event.

    Uses SELECT ... FOR UPDATE to prevent race conditions on capacity.
    """
    # Lock the event row to prevent concurrent overbooking
    event = (
        db.query(Event)
        .filter(Event.id == event_id)
        .with_for_update()
        .first()
    )
    if not event:
        raise HTTPException(
            status_code=404,
            detail={"code": "NOT_FOUND", "message": "Event not found."},
        )

    # Must be published
    if event.status != "published":
        raise HTTPException(
            status_code=400,
            detail={"code": "EVENT_NOT_OPEN", "message": f"Event is {event.status}, not accepting registrations."},
        )

    # Check if event is in the past
    try:
        event_date = datetime.strptime(event.date, "%Y-%m-%d").date()
        if event_date < datetime.now(timezone.utc).date():
            raise HTTPException(
                status_code=400,
                detail={"code": "EVENT_PAST", "message": "This event has already occurred."},
            )
    except ValueError:
        pass  # If date can't be parsed, allow registration

    # Check registration deadline
    if event.registration_deadline:
        if datetime.now(timezone.utc) > event.registration_deadline:
            raise HTTPException(
                status_code=400,
                detail={"code": "REGISTRATION_CLOSED", "message": "Registration deadline has passed."},
            )

    # Check capacity
    if event.capacity is not None and event.registered_count >= event.capacity:
        raise HTTPException(
            status_code=409,
            detail={"code": "EVENT_FULL", "message": "This event has reached its capacity."},
        )

    # Check duplicate registration
    existing = (
        db.query(EventRegistration)
        .filter(
            EventRegistration.event_id == event_id,
            EventRegistration.user_id == user.id,
            EventRegistration.status == "confirmed",
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail={"code": "ALREADY_REGISTERED", "message": "You are already registered for this event."},
        )

    # Check if there's a cancelled registration to reactivate
    cancelled = (
        db.query(EventRegistration)
        .filter(
            EventRegistration.event_id == event_id,
            EventRegistration.user_id == user.id,
            EventRegistration.status == "cancelled",
        )
        .first()
    )

    if cancelled:
        cancelled.status = "confirmed"
        cancelled.registered_at = datetime.now(timezone.utc)
        cancelled.cancelled_at = None
        registration = cancelled
    else:
        registration = EventRegistration(
            event_id=event_id,
            user_id=user.id,
            status="confirmed",
        )
        db.add(registration)

    # Atomically increment registered_count
    event.registered_count = event.registered_count + 1

    try:
        db.commit()
        db.refresh(registration)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail={"code": "REGISTRATION_CONFLICT", "message": "Could not complete registration. Please try again."},
        )

    return RegistrationCreateResponse(
        id=registration.id,
        event_id=registration.event_id,
        user_id=registration.user_id,
        status=registration.status,
        registered_at=registration.registered_at,
        message="Successfully registered for the event.",
    )


@router.delete("/api/events/{event_id}/registrations/me", status_code=status.HTTP_200_OK)
def cancel_registration(
    event_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel the current user's registration for an event."""
    registration = (
        db.query(EventRegistration)
        .filter(
            EventRegistration.event_id == event_id,
            EventRegistration.user_id == user.id,
            EventRegistration.status == "confirmed",
        )
        .first()
    )
    if not registration:
        raise HTTPException(
            status_code=404,
            detail={"code": "NOT_FOUND", "message": "No active registration found for this event."},
        )

    registration.status = "cancelled"
    registration.cancelled_at = datetime.now(timezone.utc)

    # Decrement count
    event = db.query(Event).filter(Event.id == event_id).with_for_update().first()
    if event and event.registered_count > 0:
        event.registered_count = event.registered_count - 1

    db.commit()
    return {"message": "Registration cancelled successfully."}


@router.get("/api/me/registrations", response_model=list[MyRegistrationResponse])
def get_my_registrations(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all registrations for the current user, enriched with event details."""
    registrations = (
        db.query(EventRegistration, Event, Club)
        .join(Event, EventRegistration.event_id == Event.id)
        .join(Club, Event.club_id == Club.id)
        .filter(
            EventRegistration.user_id == user.id,
            EventRegistration.status == "confirmed",
        )
        .order_by(Event.date.desc())
        .all()
    )

    result = []
    for reg, event, club in registrations:
        # Determine display status
        display_status = event.status.capitalize()
        try:
            event_date = datetime.strptime(event.date, "%Y-%m-%d").date()
            if event_date < datetime.now(timezone.utc).date():
                display_status = "Past"
            else:
                display_status = "Upcoming"
        except (ValueError, TypeError):
            display_status = "Upcoming"

        result.append(MyRegistrationResponse(
            id=reg.id,
            event_id=reg.event_id,
            status=reg.status,
            registered_at=reg.registered_at,
            event_title=event.title,
            event_date=event.date,
            event_time=event.time,
            event_venue=event.venue,
            event_club_name=club.name,
            event_club_id=club.id,
            event_image=event.image_url,
            event_description=event.description,
            event_status=display_status,
        ))
    return result


@router.get("/api/events/{event_id}/registrations", response_model=list[RegistrationResponse])
def list_event_registrations(
    event_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List registrations for an event (organizer view)."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Event not found."})

    # Check authorization — must be coordinator of the event's club or admin
    if user.role != "admin":
        from app.models.membership import ClubMembership
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
            raise HTTPException(status_code=403, detail={"code": "FORBIDDEN", "message": "Not authorized to view registrations."})

    regs = (
        db.query(EventRegistration)
        .filter(EventRegistration.event_id == event_id)
        .order_by(EventRegistration.registered_at.desc())
        .all()
    )
    return [RegistrationResponse.model_validate(r) for r in regs]
