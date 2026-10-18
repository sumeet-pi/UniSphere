"""Tests for Coordinator Identity and Data Synchronization consistency conforming to Phase 7."""

import uuid
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.club import Club
from app.models.membership import ClubMembership
from app.core.security import hash_password, create_access_token

client = TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def test_coordinator(db):
    """Create a temporary test coordinator and associated club for isolated testing."""
    unique = uuid.uuid4().hex[:8]
    coord_email = f"test_coord_{unique}@college.edu"
    student_email = f"test_stud_{unique}@college.edu"

    # Create coordinator user
    coordinator = User(
        email=coord_email,
        password_hash=hash_password("Password@2026"),
        name="Dr. Test Coordinator",
        phone="9876543210",
        role="organizer",
        status="active",
        is_active=True,
    )
    db.add(coordinator)

    # Create an unrelated student user for unauthorized testing
    student = User(
        email=student_email,
        password_hash=hash_password("Password@2026"),
        name="Test Student",
        phone="9123456780",
        role="student",
        status="active",
        is_active=True,
    )
    db.add(student)

    db.add(coordinator)
    db.add(student)
    db.flush()

    # Create club with distinct faculty advisor, HOD, and contact info
    club = Club(
        name=f"Robotics Club {unique}",
        category="Technical",
        department="Robotics & AI",
        description="Autonomous systems and robotics research club.",
        faculty_advisor_name="Dr. Independent Faculty Advisor",
        faculty_advisor_id=coordinator.id,
        hod_name="Dr. Autonomous Systems HOD",
        email=f"robotics_{unique}@college.edu",
        phone="011-2345678",
    )
    db.add(club)
    db.flush()

    # Create membership linking coordinator to club
    membership = ClubMembership(
        user_id=coordinator.id,
        club_id=club.id,
        role="COORDINATOR",
        designation="Club Coordinator",
        status="ACTIVE",
    )
    db.add(membership)
    db.commit()
    db.refresh(coordinator)
    db.refresh(club)

    coord_token = create_access_token(data={"sub": coordinator.id, "role": coordinator.role})
    student_token = create_access_token(data={"sub": student.id, "role": student.role})

    yield {
        "coordinator": coordinator,
        "student": student,
        "club": club,
        "coord_token": coord_token,
        "student_token": student_token,
    }

    # Clean up test records
    try:
        db.query(ClubMembership).filter(ClubMembership.club_id == club.id).delete()
        db.query(Club).filter(Club.id == club.id).delete()
        db.query(User).filter(User.id.in_([coordinator.id, student.id])).delete()
        db.commit()
    except Exception:
        db.rollback()


def test_coordinator_sidebar_and_me_identity(test_coordinator):
    """Test 1: Coordinator identity is backed by the persisted user record."""
    token = test_coordinator["coord_token"]
    res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()["data"]

    # Name must match coordinator user name
    assert data["name"] == "Dr. Test Coordinator"
    assert data["email"] == test_coordinator["coordinator"].email
    assert data["phone"] == "9876543210"
    assert data["clubName"] == test_coordinator["club"].name
    assert data["clubRole"] in ("COORDINATOR", "Club Coordinator")


def test_update_coordinator_name_and_phone(test_coordinator, db):
    """Tests 2, 3, 4: Updating coordinator name and phone persists and returns canonical data."""
    token = test_coordinator["coord_token"]
    coord_id = test_coordinator["coordinator"].id
    club_id = test_coordinator["club"].id

    update_payload = {
        "name": "Dr. Updated Coordinator Name",
        "phone": "+91 99988 77766",
    }

    res = client.put(
        "/api/v1/auth/me",
        json=update_payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    res_data = res.json()["data"]
    assert res_data["name"] == "Dr. Updated Coordinator Name"
    assert res_data["phone"] == "+91 99988 77766"

    # Verify directly in database session
    db.expire_all()
    updated_user = db.query(User).filter(User.id == coord_id).first()
    assert updated_user.name == "Dr. Updated Coordinator Name"
    assert updated_user.phone == "+91 99988 77766"

    # Verify persisted on fresh GET /auth/me (refresh simulation)
    res_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["data"]["name"] == "Dr. Updated Coordinator Name"
    assert res_me.json()["data"]["phone"] == "+91 99988 77766"


def test_faculty_advisor_and_hod_remain_unchanged(test_coordinator, db):
    """Tests 6, 7, 8: Updating coordinator personal info leaves faculty advisor, HOD, and club email untouched."""
    token = test_coordinator["coord_token"]
    club_id = test_coordinator["club"].id

    # Update coordinator personal profile
    res = client.put(
        "/api/v1/auth/me",
        json={"name": "Dr. Vijay Changed Name", "phone": "1234567890"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200

    # Verify club record in DB was NOT modified
    db.expire_all()
    fresh_club = db.query(Club).filter(Club.id == club_id).first()
    assert fresh_club.faculty_advisor_name == "Dr. Independent Faculty Advisor"
    assert fresh_club.hod_name == "Dr. Autonomous Systems HOD"
    assert fresh_club.department == "Robotics & AI"
    assert fresh_club.email == test_coordinator["club"].email
    assert fresh_club.phone == "011-2345678"


def test_coordinator_cannot_update_another_profile_without_auth():
    """Test 9: Unauthorized updates without valid JWT token fail."""
    res = client.put("/api/v1/auth/me", json={"name": "Hacker Name"})
    assert res.status_code in (401, 403)


def test_invalid_profile_data_produces_error(test_coordinator):
    """Test 10: Empty or invalid profile data yields clear 422 error."""
    token = test_coordinator["coord_token"]
    res = client.put(
        "/api/v1/auth/me",
        json={"name": ""},  # name min_length is 2
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 422


def test_duplicate_email_conflict(test_coordinator):
    """Test: Attempting to update email to an existing user's email returns 409 Conflict."""
    token = test_coordinator["coord_token"]
    student_email = test_coordinator["student"].email

    res = client.put(
        "/api/v1/auth/me",
        json={"email": student_email},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 409
    assert "already exists" in res.json()["message"].lower()


def test_club_update_authorization(test_coordinator):
    """Test 12: Club updates enforce coordinator / admin authorization."""
    club_id = test_coordinator["club"].id
    student_token = test_coordinator["student_token"]
    coord_token = test_coordinator["coord_token"]

    # Student trying to update club details must receive 403 Forbidden
    res_student = client.put(
        f"/api/v1/clubs/{club_id}",
        json={"description": "Unauthorized change"},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert res_student.status_code == 403

    # Coordinator can update their club
    res_coord = client.put(
        f"/api/v1/clubs/{club_id}",
        json={"description": "Authorized coordinator update"},
        headers={"Authorization": f"Bearer {coord_token}"},
    )
    assert res_coord.status_code == 200
