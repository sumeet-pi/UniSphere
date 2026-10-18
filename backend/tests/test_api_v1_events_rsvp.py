"""Tests for Events lifecycle, Individual RSVP, Team RSVP, Cancellation, and Gate Check-in conforming to API_SPECIFICATION.md."""

import pytest
import uuid
from datetime import datetime, date, timedelta, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.club import Club
from app.models.event import Event
from app.models.registration import EventRegistration

client = TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_api_v1_events_catalog_and_filters(db):
    res = client.get("/api/v1/events?stage=all")
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert isinstance(body["data"], list)
    assert len(body["data"]) > 0

    # Test filtering by specific category
    res_cat = client.get("/api/v1/events?category=Coding & Development")
    assert res_cat.status_code == 200
    assert res_cat.json()["success"] is True


def test_api_v1_event_creation_and_stage_transitions(db):
    # Log in as coordinator of c1 (Byte Warriors)
    login_res = client.post("/api/v1/auth/login", json={"email": "sharma.cse@college.edu", "password": "ClubAdmin#2026"})
    token = login_res.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}

    unique = uuid.uuid4().hex[:6]
    event_payload = {
        "title": f"DevSprint Hackathon {unique}",
        "category": "Coding & Development",
        "stage": "upcoming",
        "date": "2026-11-15",
        "time": "10:00 AM - 5:00 PM",
        "venue": "Campus Innovation Lab",
        "capacity": 10,
        "description": "Annual 24-hour rapid product prototyping marathon.",
        "eligibility": "Open to all enrolled engineering undergraduates.",
        "rules": [
            "Teams must build project from scratch during the hackathon window.",
            "All repositories must be pushed to GitHub before deadline."
        ],
        "isTeamEvent": True,
        "minTeamSize": 2,
        "maxTeamSize": 4,
        "restrictClubMembers": False,
        "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"
    }

    # 1. Create event
    create_res = client.post("/api/v1/clubs/c1/events", json=event_payload, headers=headers)
    assert create_res.status_code == 201
    created_event = create_res.json()["data"]
    event_id = created_event["id"]
    assert created_event["title"] == event_payload["title"]
    assert created_event["stage"] == "upcoming"
    assert created_event["capacity"] == 10

    # 2. Get event details
    get_res = client.get(f"/api/v1/events/{event_id}")
    assert get_res.status_code == 200
    assert get_res.json()["data"]["id"] == event_id

    # 3. Transition stage: upcoming -> open
    stage_res = client.patch(
        f"/api/v1/events/{event_id}/stage",
        json={"stage": "open"},
        headers=headers,
    )
    assert stage_res.status_code == 200
    assert stage_res.json()["data"]["stage"] == "open"


def test_api_v1_individual_rsvp_and_checkin_flow(db):
    # 1. Coordinator creates an open event
    coord_login = client.post("/api/v1/auth/login", json={"email": "sharma.cse@college.edu", "password": "ClubAdmin#2026"})
    coord_token = coord_login.json()["data"]["token"]
    coord_headers = {"Authorization": f"Bearer {coord_token}"}

    unique = uuid.uuid4().hex[:6]
    event_res = client.post(
        "/api/v1/clubs/c1/events",
        json={
            "title": f"Open Tech Symposium {unique}",
            "category": "Coding & Development",
            "stage": "open",
            "date": "2026-11-20",
            "time": "10:00 AM - 1:00 PM",
            "venue": "Seminar Hall A",
            "capacity": 50,
            "description": "Tech talk and hands-on symposium.",
            "restrictClubMembers": False,
            "isTeamEvent": False,
            "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
            "rules": ["Be on time"],
        },
        headers=coord_headers,
    )
    assert event_res.status_code == 201
    event_id = event_res.json()["data"]["id"]

    # 2. Register student
    student_unique = uuid.uuid4().hex[:8]
    signup_res = client.post(
        "/api/v1/auth/signup",
        json={
            "email": f"student_rsvp_{student_unique}@college.edu",
            "password": "Password@2026",
            "name": f"RSVP Student {student_unique}",
            "course": "B.Tech",
            "branch": "Computer Science & Engineering",
            "semester": "3rd Sem",
            "classRollNo": f"CS-{student_unique[:4]}",
            "universityRollNo": f"UNI-{student_unique[:6]}",
        },
    )
    student_token = signup_res.json()["data"]["token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 3. RSVP to open event
    rsvp_res = client.post(f"/api/v1/events/{event_id}/rsvp", headers=student_headers)
    assert rsvp_res.status_code == 201
    rsvp_data = rsvp_res.json()["data"]
    assert "passCode" in rsvp_data
    pass_code = rsvp_data["passCode"]
    assert rsvp_data["status"] == "CONFIRMED"

    # 4. Duplicate RSVP should return 409 Conflict
    dup_res = client.post(f"/api/v1/events/{event_id}/rsvp", headers=student_headers)
    assert dup_res.status_code == 409

    # 5. Student sees registration in their list
    regs_res = client.get("/api/v1/student/registrations", headers=student_headers)
    assert regs_res.status_code == 200
    regs_data = regs_res.json()["data"]
    regs_list = regs_data.get("registrations", regs_data) if isinstance(regs_data, dict) else regs_data
    event_ids = [r["eventId"] for r in regs_list]
    assert event_id in event_ids

    # 6. Gate check-in using passCode (Coordinator authority)
    checkin_res = client.patch(
        f"/api/v1/events/{event_id}/registrations/{pass_code}/check-in",
        headers=coord_headers,
    )
    assert checkin_res.status_code == 200
    checkin_data = checkin_res.json()["data"]
    assert checkin_data["passCode"] == pass_code
    assert checkin_data["attendanceStatus"] == "Checked In"

    # 7. Duplicate check-in should be rejected with 400 or 409
    dup_checkin = client.patch(
        f"/api/v1/events/{event_id}/registrations/{pass_code}/check-in",
        headers=coord_headers,
    )
    assert dup_checkin.status_code in (400, 409)


def test_api_v1_rsvp_cancellation(db):
    # 1. Coordinator creates an open event
    coord_login = client.post("/api/v1/auth/login", json={"email": "sharma.cse@college.edu", "password": "ClubAdmin#2026"})
    coord_token = coord_login.json()["data"]["token"]
    coord_headers = {"Authorization": f"Bearer {coord_token}"}

    unique = uuid.uuid4().hex[:6]
    event_res = client.post(
        "/api/v1/clubs/c1/events",
        json={
            "title": f"Cancellable Workshop {unique}",
            "category": "Workshop",
            "stage": "open",
            "date": "2026-11-22",
            "time": "2:00 PM - 4:00 PM",
            "venue": "Room 302",
            "capacity": 20,
            "description": "Workshop on Web3.",
            "restrictClubMembers": False,
            "isTeamEvent": False,
            "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
            "rules": ["None"],
        },
        headers=coord_headers,
    )
    assert event_res.status_code == 201
    event_id = event_res.json()["data"]["id"]

    # 2. Register student
    unique_s = uuid.uuid4().hex[:8]
    signup_res = client.post(
        "/api/v1/auth/signup",
        json={
            "email": f"canceller_{unique_s}@college.edu",
            "password": "Password@2026",
            "name": f"Canceller {unique_s}",
            "course": "B.Tech",
            "branch": "IT",
            "semester": "5th Sem",
            "classRollNo": f"IT-{unique_s[:4]}",
            "universityRollNo": f"UNI-{unique_s[:6]}",
        },
    )
    student_token = signup_res.json()["data"]["token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 3. RSVP to open event
    rsvp_res = client.post(f"/api/v1/events/{event_id}/rsvp", headers=student_headers)
    assert rsvp_res.status_code == 201

    # 4. Cancel RSVP
    cancel_res = client.delete(f"/api/v1/events/{event_id}/rsvp", headers=student_headers)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["success"] is True

    # 5. Attempting to cancel again should fail with 400 or 404
    cancel_again = client.delete(f"/api/v1/events/{event_id}/rsvp", headers=student_headers)
    assert cancel_again.status_code in (400, 404)
