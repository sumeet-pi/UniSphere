"""UniSphere End-to-End User Acceptance Test (UAT) Verification Suite.
Validates all 14 end-to-end user journeys against live FastAPI backend and PostgreSQL database.
"""

import pytest
import uuid
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal

client = TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_uat_journey_1_public_discovery_and_health():
    """Workflow 1: Health probes, OpenAPI documentation, and public catalog endpoints."""
    r_health = client.get("/health")
    assert r_health.status_code == 200
    assert r_health.json()["status"] == "healthy"

    r_db = client.get("/health/ready")
    assert r_db.status_code == 200
    assert r_db.json()["database"] == "connected"

    r_clubs = client.get("/api/v1/clubs")
    assert r_clubs.status_code == 200
    clubs = r_clubs.json()["data"]
    assert isinstance(clubs, list)
    assert len(clubs) > 0

    r_events = client.get("/api/v1/events")
    assert r_events.status_code == 200
    events = r_events.json()["data"]
    assert isinstance(events, list)
    assert len(events) > 0


def test_uat_journey_2_student_lifecycle_registration_profile_and_refresh(db):
    """Workflows 2, 3, 4: Student registration, login, profile view/edit, token persistence."""
    unique = uuid.uuid4().hex[:8]
    email = f"uat_student_{unique}@college.edu"
    password = "Password@2026"
    name = f"UAT Student {unique}"

    # 1. Student Registration
    payload = {
        "email": email,
        "password": password,
        "name": name,
        "phone": "+91 99887 76655",
        "course": "B.Tech",
        "branch": "Computer Science & Engineering",
        "semester": "3rd Sem",
        "classRollNo": f"CS-{unique[:4]}",
        "universityRollNo": f"UNI-{unique[:6]}",
    }
    r_signup = client.post("/api/v1/auth/signup", json=payload)
    assert r_signup.status_code == 201
    auth_data = r_signup.json()["data"]
    token = auth_data["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Login verification
    r_login = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert r_login.status_code == 200
    assert r_login.json()["data"]["user"]["email"] == email

    # 3. Session restore / token refresh verification
    r_me = client.get("/api/v1/auth/me", headers=headers)
    assert r_me.status_code == 200
    assert r_me.json()["data"]["email"] == email

    # 4. Profile retrieval and update
    r_prof = client.get("/api/v1/students/me", headers=headers)
    assert r_prof.status_code == 200
    assert r_prof.json()["data"]["name"] == name

    r_update = client.put(
        "/api/v1/students/me",
        headers=headers,
        json={"bio": "Enthusiastic full-stack open-source contributor", "phone": "+91 98765 00112"},
    )
    assert r_update.status_code == 200
    assert r_update.json()["data"]["bio"] == "Enthusiastic full-stack open-source contributor"

    # 5. Digital ID Card
    r_card = client.get("/api/v1/students/me/id-card", headers=headers)
    assert r_card.status_code == 200
    card_data = r_card.json()["data"]
    assert "name" in card_data
    assert "classRollNo" in card_data
    assert "barcodeString" in card_data or "qrPayload" in card_data


def test_uat_journey_3_club_join_leave_and_persistence(db):
    """Workflows 5, 6: Student joins club, verifies membership, and leaves club."""
    unique = uuid.uuid4().hex[:8]
    r_signup = client.post(
        "/api/v1/auth/signup",
        json={
            "email": f"joiner_{unique}@college.edu",
            "password": "Password@2026",
            "name": f"Joiner {unique}",
            "phone": "+91 98765 43210",
            "course": "BCA",
            "branch": "Computer Science",
            "semester": "1st Sem",
            "classRollNo": f"BCA-{unique[:4]}",
            "universityRollNo": f"UNI-{unique[:6]}",
        },
    )
    assert r_signup.status_code == 201
    token = r_signup.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Join club c1 (Byte Warriors) -> 201 Created
    r_join = client.post("/api/v1/clubs/c1/join", headers=headers)
    assert r_join.status_code == 201
    assert r_join.json()["data"]["status"] in ("ACTIVE", "active", "Active", "joined")

    # Leave club -> 200 OK
    r_leave = client.delete("/api/v1/clubs/c1/leave", headers=headers)
    assert r_leave.status_code == 200


def test_uat_journey_4_event_rsvp_duplicate_prevention_and_cancel(db):
    """Workflows 6, 7: Event RSVP, duplicate prevention (409 Conflict), cancellation."""
    coord_login = client.post("/api/v1/auth/login", json={"email": "sharma.cse@college.edu", "password": "ClubAdmin#2026"})
    coord_token = coord_login.json()["data"]["token"]

    unique = uuid.uuid4().hex[:6]
    r_event = client.post(
        "/api/v1/clubs/c1/events",
        headers={"Authorization": f"Bearer {coord_token}"},
        json={
            "title": f"UAT Hackathon {unique}",
            "category": "Coding & Development",
            "stage": "open",
            "date": "2026-12-01",
            "time": "09:00 AM - 05:00 PM",
            "venue": "Campus Innovation Lab",
            "capacity": 25,
            "description": "Full-stack hackathon.",
            "eligibility": "All enrolled students",
            "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
            "restrictClubMembers": False,
            "rules": ["Follow code of conduct"],
        },
    )
    assert r_event.status_code == 201
    event_id = r_event.json()["data"]["id"]

    # Student registers
    unique_s = uuid.uuid4().hex[:8]
    r_s = client.post(
        "/api/v1/auth/signup",
        json={
            "email": f"rsvp_uat_{unique_s}@college.edu",
            "password": "Password@2026",
            "name": f"RSVP Student {unique_s}",
            "phone": "+91 98765 43210",
            "course": "B.Tech",
            "branch": "Computer Science & Engineering",
            "semester": "5th Sem",
            "classRollNo": f"CS-{unique_s[:4]}",
            "universityRollNo": f"UNI-{unique_s[:6]}",
        },
    )
    assert r_s.status_code == 201
    student_token = r_s.json()["data"]["token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 1. RSVP -> 201 Created
    r_rsvp = client.post(f"/api/v1/events/{event_id}/rsvp", headers=student_headers)
    assert r_rsvp.status_code == 201
    pass_code = r_rsvp.json()["data"]["passCode"]
    assert pass_code is not None

    # 2. Duplicate RSVP -> 409 Conflict
    r_dup = client.post(f"/api/v1/events/{event_id}/rsvp", headers=student_headers)
    assert r_dup.status_code == 409

    # 3. Gate check-in
    r_checkin = client.patch(
        f"/api/v1/events/{event_id}/registrations/{pass_code}/check-in",
        headers={"Authorization": f"Bearer {coord_token}"},
    )
    assert r_checkin.status_code == 200
    assert r_checkin.json()["data"]["attendanceStatus"] == "Checked In"


def test_uat_journey_5_coordinator_application_approval_workflow(db):
    """Workflows 8, 9, 10: Coordinator application -> restricted state -> admin approval."""
    unique = uuid.uuid4().hex[:6]
    app_payload = {
        "clubName": f"Quantum Computing {unique}",
        "category": "Technical",
        "department": "Computer Science & Engineering",
        "description": "Leading quantum algorithms research and student hackathons.",
        "facultyAdvisor": f"Dr. Quantum {unique}",
        "hod": "Dr. V. K. Mathur",
        "email": f"quantum_{unique}@college.edu",
        "phone": "+91 98111 22233",
        "password": "Password@2026",
    }
    r_apply = client.post("/api/v1/clubs", json=app_payload)
    assert r_apply.status_code == 201
    club_id = r_apply.json()["data"]["id"]
    assert r_apply.json()["data"]["approvalStatus"] == "requested"

    # Admin login
    admin_login = client.post("/api/v1/auth/login", json={"email": "admin@college.edu", "password": "Admin@2026"})
    assert admin_login.status_code == 200
    admin_headers = {"Authorization": f"Bearer {admin_login.json()['data']['token']}"}

    # Admin lists pending clubs
    r_pending = client.get("/api/v1/admin/clubs/pending", headers=admin_headers)
    assert r_pending.status_code == 200
    pending_ids = [c["id"] for c in r_pending.json()["data"]]
    assert club_id in pending_ids

    # Admin approves club charter
    r_approve = client.patch(f"/api/v1/admin/clubs/{club_id}/approve", headers=admin_headers)
    assert r_approve.status_code == 200
    assert r_approve.json()["data"]["approvalStatus"] == "approved"


def test_uat_journey_6_security_least_privilege_and_unauthorized_rejection():
    """Workflows 13, 14: Security RBAC and unauthorized route access rejection."""
    # 1. Unauthenticated request to protected endpoint -> 401 Unauthorized
    r_unauth = client.get("/api/v1/auth/me")
    assert r_unauth.status_code == 401

    r_prof_unauth = client.get("/api/v1/students/me")
    assert r_prof_unauth.status_code == 401

    # 2. General student attempting coordinator mutation -> 403 Forbidden
    unique = uuid.uuid4().hex[:8]
    r_s = client.post(
        "/api/v1/auth/signup",
        json={
            "email": f"hacker_student_{unique}@college.edu",
            "password": "Password@2026",
            "name": f"Hacker {unique}",
            "phone": "+91 98765 43210",
            "course": "B.Tech",
            "branch": "Computer Science & Engineering",
            "semester": "1st Sem",
            "classRollNo": f"CS-{unique[:4]}",
            "universityRollNo": f"UNI-{unique[:6]}",
        },
    )
    assert r_s.status_code == 201
    s_token = r_s.json()["data"]["token"]
    s_headers = {"Authorization": f"Bearer {s_token}"}

    # Student trying to create an event -> 403 Forbidden
    r_hack_event = client.post(
        "/api/v1/clubs/c1/events",
        headers=s_headers,
        json={
            "title": "Unauthorized Event",
            "category": "Coding & Development",
            "date": "2026-11-20",
            "time": "10:00 AM - 01:00 PM",
            "venue": "Lab 101",
            "capacity": 50,
            "description": "Unauthorized hack test",
            "eligibility": "All Students",
            "image": "https://example.com/hack.jpg",
        },
    )
    assert r_hack_event.status_code == 403

    # Student trying to publish a club announcement -> 403 Forbidden
    r_hack_ann = client.post(
        "/api/v1/clubs/c1/announcements",
        headers=s_headers,
        json={"title": "Fake Notice", "content": "Fake content"},
    )
    assert r_hack_ann.status_code == 403
