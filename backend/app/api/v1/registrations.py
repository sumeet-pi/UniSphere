"""Event Registrations, Quick RSVP, Team RSVP, and Gate Scanner router conforming to API_SPECIFICATION.md."""

import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.session import get_db
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.club import Club
from app.models.membership import ClubMembership
from app.models.event import Event
from app.models.event_details import EventTeam, EventTeamMember
from app.models.registration import EventRegistration
from app.models.event_details import Certificate
from app.core.dependencies import get_current_user
from app.core.responses import json_success_response, json_error_response
from app.schemas.unified import TeamRSVPRequest

router = APIRouter()


# ============================================================================
# 7. EVENT REGISTRATIONS & DIGITAL PASSES
# ============================================================================

@router.post("/events/{event_id}/rsvp")
def individual_rsvp(
    event_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Quick individual RSVP reserving pass with digital barcode."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        return json_error_response(status_code=404, error="NOT_FOUND", message="Event not found.")

    if event.stage != "open":
        return json_error_response(
            status_code=400,
            error="EVENT_NOT_OPEN",
            message=f"Event is currently {event.stage} and not accepting registrations.",
        )

    # Institutional Non-Participation Rule:
    # Any student who belongs to the club cannot register for that club's events
    if event.restrict_club_members:
        is_member = (
            db.query(ClubMembership)
            .filter(
                ClubMembership.club_id == event.club_id,
                ClubMembership.user_id == user.id,
                ClubMembership.status == "ACTIVE",
            )
            .first()
            is not None
        )
        if is_member:
            return json_error_response(
                status_code=403,
                error="CLUB_MEMBER_CANNOT_REGISTER",
                message=f"You are a member of {event.club.name}. Organizing club members cannot register as participants for their own club's events.",
            )

    # Check capacity
    if event.registered_count >= event.capacity:
        return json_error_response(
            status_code=400,
            error="CAPACITY_REACHED",
            message="Event capacity reached. Registration is full.",
        )

    # Check duplicate
    existing = (
        db.query(EventRegistration)
        .filter(
            EventRegistration.event_id == event_id,
            EventRegistration.user_id == user.id,
            EventRegistration.status != "CANCELLED",
        )
        .first()
    )
    if existing:
        return json_error_response(
            status_code=409,
            error="ALREADY_REGISTERED",
            message="You already hold an active seat pass for this event.",
        )

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    roll = profile.class_roll_no if profile else "CS24089"
    event_slug = event.id.split("-")[0].upper()
    pass_code = f"PASS-{event_slug}-2026-{roll}"

    # Atomic create pass and increment counter
    registration = EventRegistration(
        pass_code=pass_code,
        event_id=event.id,
        user_id=user.id,
        status="CONFIRMED",
    )
    event.registered_count += 1

    db.add(registration)
    db.commit()
    db.refresh(registration)

    return json_success_response(
        data={
            "registrationId": str(registration.id),
            "eventId": event.id,
            "eventTitle": event.title,
            "passCode": registration.pass_code,
            "attendeeName": user.name,
            "classRollNo": roll,
            "status": registration.status,
            "reportingTime": event.start_time,
            "venue": event.venue,
        },
        message="Seat confirmed! Digital Hall Ticket issued.",
        status_code=201,
    )


@router.post("/events/{event_id}/team-rsvp")
def team_rsvp(
    event_id: str,
    payload: TeamRSVPRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Team RSVP for hackathons & group contests."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        return json_error_response(status_code=404, error="NOT_FOUND", message="Event not found.")

    if not event.is_team_event:
        return json_error_response(
            status_code=400,
            error="NOT_A_TEAM_EVENT",
            message="This event does not support team registrations.",
        )

    total_team_count = 1 + len(payload.teammateUserIds)
    if total_team_count < event.min_team_size or total_team_count > event.max_team_size:
        return json_error_response(
            status_code=400,
            error="INVALID_TEAM_SIZE",
            message=f"Team size must be between {event.min_team_size} and {event.max_team_size} members.",
        )

    # Check lead membership
    if event.restrict_club_members:
        lead_is_member = (
            db.query(ClubMembership)
            .filter(
                ClubMembership.club_id == event.club_id,
                ClubMembership.user_id == user.id,
                ClubMembership.status == "ACTIVE",
            )
            .first()
            is not None
        )
        if lead_is_member:
            return json_error_response(
                status_code=403,
                error="CLUB_MEMBER_CANNOT_REGISTER",
                message=f"Team Captain is a member of {event.club.name} and cannot participate.",
            )

    # Verify teammates
    all_user_ids = [user.id] + payload.teammateUserIds
    if len(all_user_ids) != len(set(all_user_ids)):
        return json_error_response(
            status_code=400, error="DUPLICATE_TEAMMATE", message="Duplicate teammates listed in request."
        )

    teammates = db.query(User).filter(User.id.in_(payload.teammateUserIds)).all()
    if len(teammates) != len(payload.teammateUserIds):
        return json_error_response(
            status_code=404, error="USER_NOT_FOUND", message="One or more teammates could not be found."
        )

    # Validate each teammate
    for tm in teammates:
        if event.restrict_club_members:
            tm_is_member = (
                db.query(ClubMembership)
                .filter(
                    ClubMembership.club_id == event.club_id,
                    ClubMembership.user_id == tm.id,
                    ClubMembership.status == "ACTIVE",
                )
                .first()
                is not None
            )
            if tm_is_member:
                return json_error_response(
                    status_code=403,
                    error="TEAMMATE_IS_CLUB_MEMBER",
                    message=f"Teammate {tm.name} is a member of the organizing club and cannot participate.",
                )

        # Check if already registered
        existing_reg = (
            db.query(EventRegistration)
            .filter(
                EventRegistration.event_id == event.id,
                EventRegistration.user_id == tm.id,
                EventRegistration.status != "CANCELLED",
            )
            .first()
        )
        if existing_reg:
            return json_error_response(
                status_code=409,
                error="TEAMMATE_ALREADY_REGISTERED",
                message=f"Teammate {tm.name} already holds a pass for this event.",
            )

    # Check capacity
    if event.registered_count + total_team_count > event.capacity:
        return json_error_response(
            status_code=400, error="CAPACITY_REACHED", message="Not enough seats remaining for this team size."
        )

    # Create Team
    event_slug = event.id.split("-")[0].upper()
    clean_team_slug = payload.teamName.strip().upper().replace(" ", "")[:15]
    team_pass_code = f"TEAM-{event_slug}-{clean_team_slug}-2026"

    new_team = EventTeam(
        event_id=event.id,
        team_name=payload.teamName.strip(),
        team_lead_user_id=user.id,
        pass_code=team_pass_code,
        status="CONFIRMED",
    )
    db.add(new_team)
    db.flush()

    # Add lead
    db.add(EventTeamMember(team_id=new_team.id, user_id=user.id, role="LEAD"))
    lead_prof = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    lead_roll = lead_prof.class_roll_no if lead_prof else "LEAD"
    lead_reg = EventRegistration(
        pass_code=f"PASS-{event_slug}-2026-{lead_roll}",
        event_id=event.id,
        user_id=user.id,
        team_id=new_team.id,
        is_team_lead=True,
        status="CONFIRMED",
    )
    db.add(lead_reg)

    member_responses = []
    for tm in teammates:
        db.add(EventTeamMember(team_id=new_team.id, user_id=tm.id, role="MEMBER"))
        tm_prof = db.query(StudentProfile).filter(StudentProfile.user_id == tm.id).first()
        tm_roll = tm_prof.class_roll_no if tm_prof else tm.id[:6]
        tm_pass = f"PASS-{event_slug}-2026-{tm_roll}"

        db.add(
            EventRegistration(
                pass_code=tm_pass,
                event_id=event.id,
                user_id=tm.id,
                team_id=new_team.id,
                is_team_lead=False,
                status="CONFIRMED",
            )
        )
        member_responses.append({
            "id": tm.id,
            "name": tm.name,
            "classRollNo": tm_roll,
            "passCode": tm_pass,
        })

    event.registered_count += total_team_count
    db.commit()

    return json_success_response(
        data={
            "teamId": str(new_team.id),
            "teamName": new_team.team_name,
            "teamPassCode": new_team.pass_code,
            "eventTitle": event.title,
            "teamLead": {
                "id": user.id,
                "name": user.name,
                "classRollNo": lead_roll,
            },
            "members": member_responses,
        },
        message="Team RSVP confirmed! Team Hall Tickets issued.",
        status_code=201,
    )


@router.delete("/events/{event_id}/rsvp")
def cancel_rsvp(
    event_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel registration and release capacity back to pool."""
    reg = (
        db.query(EventRegistration)
        .filter(
            EventRegistration.event_id == event_id,
            EventRegistration.user_id == user.id,
            EventRegistration.status != "CANCELLED",
        )
        .first()
    )

    if not reg:
        return json_error_response(
            status_code=404, error="NOT_FOUND", message="No active registration found to cancel."
        )

    reg.status = "CANCELLED"
    reg.cancelled_at = datetime.now(timezone.utc)

    event = db.query(Event).filter(Event.id == event_id).first()
    if event and event.registered_count > 0:
        event.registered_count -= 1

    db.commit()

    return json_success_response(
        message="Registration cancelled. Your seat pass has been released.", status_code=200
    )


@router.get("/student/registrations")
def get_student_registrations(
    tab: Optional[str] = Query("upcoming"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get active and past registrations and certificates."""
    regs = (
        db.query(EventRegistration, Event, Club)
        .join(Event, EventRegistration.event_id == Event.id)
        .join(Club, Event.club_id == Club.id)
        .filter(EventRegistration.user_id == user.id, EventRegistration.status != "CANCELLED")
        .order_by(Event.event_date.desc())
        .all()
    )

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    co_curricular_hrs = float(profile.co_curricular_hours) if profile else 16.0

    certs_count = db.query(Certificate).filter(Certificate.user_id == user.id, Certificate.status == "ISSUED").count()

    active_count = 0
    completed_count = 0
    items = []

    for r, e, c in regs:
        is_past = e.stage == "past"
        if is_past:
            completed_count += 1
        else:
            active_count += 1

        items.append({
            "id": str(r.id),
            "eventId": e.id,
            "passCode": r.pass_code,
            "eventTitle": e.title,
            "clubId": c.id,
            "clubName": c.name,
            "date": e.event_date.isoformat(),
            "time": e.time_display,
            "venue": e.venue,
            "status": r.status,
            "stage": e.stage,
        })

    data = {
        "activePassesCount": active_count,
        "completedEventsCount": completed_count,
        "certificatesReadyCount": certs_count,
        "coCurricularHours": co_curricular_hrs,
        "registrations": items,
    }
    return json_success_response(data=data, status_code=200)


@router.patch("/events/{event_id}/registrations/{pass_code}/check-in")
def gate_check_in(
    event_id: str,
    pass_code: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Gate scanner attendance verification."""
    reg = (
        db.query(EventRegistration, User, StudentProfile)
        .join(User, EventRegistration.user_id == User.id)
        .outerjoin(StudentProfile, User.id == StudentProfile.user_id)
        .filter(
            EventRegistration.event_id == event_id,
            EventRegistration.pass_code == pass_code.strip(),
        )
        .first()
    )

    if not reg:
        return json_error_response(
            status_code=404, error="INVALID_PASS", message="Invalid pass code or event mismatch."
        )

    r, u, sp = reg
    if r.status == "CHECKED_IN":
        return json_error_response(
            status_code=409,
            error="ALREADY_CHECKED_IN",
            message=f"Student {u.name} is already checked in at {r.checked_in_at.isoformat() if r.checked_in_at else 'earlier'}.",
        )

    if r.status == "CANCELLED":
        return json_error_response(
            status_code=400, error="PASS_CANCELLED", message="This registration pass was cancelled."
        )

    r.status = "CHECKED_IN"
    now_utc = datetime.now(timezone.utc)
    r.checked_in_at = now_utc

    event = db.query(Event).filter(Event.id == event_id).first()
    if event:
        event.turnout_count += 1

    db.commit()

    return json_success_response(
        data={
            "passCode": r.pass_code,
            "attendanceStatus": "Checked In",
            "status": "CHECKED_IN",
            "studentName": u.name,
            "classRollNo": sp.class_roll_no if sp else "N/A",
            "checkInTime": now_utc.isoformat(),
        },
        message="Verified! Student checked in.",
        status_code=200,
    )
