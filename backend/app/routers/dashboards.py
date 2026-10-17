"""Dashboard router — aggregated data for role-specific dashboards."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.club import Club
from app.models.event import Event
from app.models.registration import EventRegistration
from app.models.membership import ClubMembership
from app.models.announcement import Announcement

router = APIRouter(prefix="/api/dashboard", tags=["Dashboards"])


@router.get("/student")
def student_dashboard(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Registered events
    registered = (
        db.query(EventRegistration, Event, Club)
        .join(Event, EventRegistration.event_id == Event.id)
        .join(Club, Event.club_id == Club.id)
        .filter(
            EventRegistration.user_id == user.id,
            EventRegistration.status == "confirmed",
        )
        .all()
    )

    registered_events = []
    for reg, event, club in registered:
        registered_events.append({
            "id": event.id,
            "title": event.title,
            "date": event.date,
            "time": event.time,
            "venue": event.venue,
            "clubName": club.name,
            "clubId": club.id,
            "image": event.image_url,
            "status": event.status,
        })

    # Joined clubs
    memberships = (
        db.query(ClubMembership, Club)
        .join(Club, ClubMembership.club_id == Club.id)
        .filter(
            ClubMembership.user_id == user.id,
            ClubMembership.status == "approved",
        )
        .all()
    )
    joined_clubs = [
        {
            "id": club.id,
            "name": club.name,
            "category": club.category,
            "logo": club.logo_url,
        }
        for _, club in memberships
    ]

    # Recent announcements
    anns = (
        db.query(Announcement)
        .filter(Announcement.status == "published")
        .order_by(Announcement.created_at.desc())
        .limit(5)
        .all()
    )
    announcements = [
        {
            "id": a.id,
            "clubId": a.club_id,
            "title": a.title,
            "date": a.created_at.strftime("%Y-%m-%d") if a.created_at else "",
            "content": a.body,
        }
        for a in anns
    ]

    return {
        "registeredEvents": registered_events,
        "joinedClubs": joined_clubs,
        "announcements": announcements,
        "registeredCount": len(registered_events),
        "joinedClubsCount": len(joined_clubs),
    }


@router.get("/organizer")
def organizer_dashboard(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Find managed clubs
    managed = (
        db.query(ClubMembership, Club)
        .join(Club, ClubMembership.club_id == Club.id)
        .filter(
            ClubMembership.user_id == user.id,
            ClubMembership.status == "approved",
            ClubMembership.club_role.in_(["coordinator", "faculty_head"]),
        )
        .all()
    )

    clubs_data = []
    total_members = 0
    total_events = 0
    total_registrations = 0

    for membership, club in managed:
        member_count = db.query(func.count(ClubMembership.id)).filter(
            ClubMembership.club_id == club.id, ClubMembership.status == "approved"
        ).scalar() or 0

        events = db.query(Event).filter(Event.club_id == club.id).all()
        event_count = len(events)
        reg_count = sum(e.registered_count for e in events)

        clubs_data.append({
            "id": club.id,
            "name": club.name,
            "category": club.category,
            "memberCount": member_count,
            "eventCount": event_count,
            "totalRegistrations": reg_count,
        })
        total_members += member_count
        total_events += event_count
        total_registrations += reg_count

    return {
        "managedClubs": clubs_data,
        "totalMembers": total_members,
        "totalEvents": total_events,
        "totalRegistrations": total_registrations,
    }
