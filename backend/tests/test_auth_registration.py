"""Automated tests for UniSphere separate student and coordinator registration, role assignment, and approval workflow."""

import pytest
import uuid
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.club import Club
from app.models.membership import ClubMembership
from app.core.security import hash_password

client = TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_health_endpoints():
    r1 = client.get("/api/health")
    assert r1.status_code == 200
    assert r1.json()["status"] == "healthy"

    r2 = client.get("/api/health/db")
    assert r2.status_code == 200
    assert r2.json()["status"] == "healthy"


def test_student_registration_success(db):
    unique = uuid.uuid4().hex[:8]
    email = f"student_{unique}@college.edu"
    payload = {
        "full_name": f"Student {unique}",
        "email": email,
        "password": "Password@2026",
        "phone": "+91 98765 43210",
        "course": "B.Tech",
        "branch": "Computer Science & Engineering",
        "semester": "1st Sem",
        "class_roll_no": f"CS-{unique[:4]}",
        "university_roll_no": f"24010{unique[:5]}",
    }

    response = client.post("/api/auth/register/student", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == email
    assert data["user"]["full_name"] == f"Student {unique}"
    # Role in response is frontend mapped
    assert data["user"]["role"] == "General Student"
    assert data["user"]["status"] == "active"

    # Verify DB record
    user = db.query(User).filter(User.email == email).first()
    assert user is not None
    assert user.role == "student"  # Canonical DB role
    assert user.status == "active"
    assert user.course == "B.Tech"
    assert user.branch == "Computer Science & Engineering"
    assert user.password_hash != "Password@2026"  # Hashed


def test_coordinator_registration_success(db):
    unique = uuid.uuid4().hex[:8]
    email = f"coordinator_{unique}@college.edu"
    club_name = f"Test Club {unique}"
    payload = {
        "club_name": club_name,
        "department": "Computer Science & Engineering",
        "category": "Technical & Coding",
        "hod": "Dr. R. K. Singhal",
        "faculty_advisor": "Dr. Neha Verma",
        "email": email,
        "phone": "+91 98101 23456",
        "description": "A test club for autonomous AI systems.",
        "password": "ClubAdmin#2026",
    }

    response = client.post("/api/auth/register/coordinator", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert data["status"] == "pending_approval"
    assert data["club_name"] == club_name
    assert data["email"] == email
    assert "reference_id" in data
    assert data["reference_id"].startswith("REQ-2026-")

    # Verify DB record: user role is organizer, status is pending
    user = db.query(User).filter(User.email == email).first()
    assert user is not None
    assert user.role == "organizer"  # Canonical DB role
    assert user.status == "pending"  # Pending authority review
    assert user.password_hash != "ClubAdmin#2026"

    # Verify DB record: club is created with status pending and linked to user
    club = db.query(Club).filter(Club.name == club_name).first()
    assert club is not None
    assert club.status == "pending"
    assert club.creator_id == user.id
    assert club.category == "Technical & Coding"

    # Verify DB record: membership is created with status pending and coordinator role
    membership = (
        db.query(ClubMembership)
        .filter(ClubMembership.user_id == user.id, ClubMembership.club_id == club.id)
        .first()
    )
    assert membership is not None
    assert membership.status == "pending"
    assert membership.club_role == "coordinator"


def test_invalid_student_registration():
    # Weak password
    payload = {
        "full_name": "Short Pass",
        "email": "shortpass@college.edu",
        "password": "short",
    }
    r1 = client.post("/api/auth/register/student", json=payload)
    assert r1.status_code in (400, 422)

    # Missing email
    r2 = client.post("/api/auth/register/student", json={"full_name": "No Email", "password": "Password@2026"})
    assert r2.status_code == 422


def test_invalid_coordinator_registration():
    # Missing required club fields
    payload = {
        "email": "invalid_coord@college.edu",
        "password": "ClubAdmin#2026",
    }
    r = client.post("/api/auth/register/coordinator", json=payload)
    assert r.status_code == 422


def test_duplicate_email_rejection():
    unique = uuid.uuid4().hex[:8]
    email = f"dup_{unique}@college.edu"

    # Register student first
    r1 = client.post(
        "/api/auth/register/student",
        json={"full_name": "First User", "email": email, "password": "Password@2026"},
    )
    assert r1.status_code == 201

    # Try registering again with student
    r2 = client.post(
        "/api/auth/register/student",
        json={"full_name": "Second User", "email": email, "password": "Password@2026"},
    )
    assert r2.status_code == 409
    assert r2.json()["detail"]["code"] == "EMAIL_EXISTS"

    # Try registering coordinator with same email
    r3 = client.post(
        "/api/auth/register/coordinator",
        json={
            "club_name": f"Club {unique}",
            "department": "CSE",
            "category": "Tech",
            "hod": "Dr. HOD",
            "faculty_advisor": "Dr. Advisor",
            "email": email,
            "phone": "+91 98101 23456",
            "password": "ClubAdmin#2026",
        },
    )
    assert r3.status_code == 409
    assert r3.json()["detail"]["code"] == "EMAIL_EXISTS"


def test_duplicate_club_name_rejection():
    unique = uuid.uuid4().hex[:8]
    club_name = f"Duplicate Club {unique}"

    # First coordinator registration succeeds
    r1 = client.post(
        "/api/auth/register/coordinator",
        json={
            "club_name": club_name,
            "department": "CSE",
            "category": "Tech",
            "hod": "Dr. HOD",
            "faculty_advisor": "Dr. Advisor",
            "email": f"coord1_{unique}@college.edu",
            "phone": "+91 98101 23456",
            "password": "ClubAdmin#2026",
        },
    )
    assert r1.status_code == 201

    # Second coordinator registration with same club name rejected
    r2 = client.post(
        "/api/auth/register/coordinator",
        json={
            "club_name": club_name,
            "department": "CSE",
            "category": "Tech",
            "hod": "Dr. HOD",
            "faculty_advisor": "Dr. Advisor",
            "email": f"coord2_{unique}@college.edu",
            "phone": "+91 98101 23456",
            "password": "ClubAdmin#2026",
        },
    )
    assert r2.status_code == 409
    assert r2.json()["detail"]["code"] == "CLUB_NAME_EXISTS"


def test_coordinator_pending_approval_login_rejected():
    unique = uuid.uuid4().hex[:8]
    email = f"pending_coord_{unique}@college.edu"
    password = "ClubAdmin#2026"

    # Register coordinator
    client.post(
        "/api/auth/register/coordinator",
        json={
            "club_name": f"Pending Club {unique}",
            "department": "CSE",
            "category": "Tech",
            "hod": "Dr. HOD",
            "faculty_advisor": "Dr. Advisor",
            "email": email,
            "phone": "+91 98101 23456",
            "password": password,
        },
    )

    # Attempt login while status is pending -> rejected with 403 ACCOUNT_PENDING_APPROVAL
    r = client.post("/api/auth/login", json={"email": email, "password": password})
    assert r.status_code == 403
    assert r.json()["detail"]["code"] == "ACCOUNT_PENDING_APPROVAL"


def test_approved_coordinator_login_and_me(db):
    unique = uuid.uuid4().hex[:8]
    email = f"approved_coord_{unique}@college.edu"
    password = "ClubAdmin#2026"

    # Create approved coordinator directly in DB (simulating institutional approval)
    user = User(
        id=f"u-{unique}",
        full_name=f"Approved Coord {unique}",
        email=email,
        password_hash=hash_password(password),
        role="organizer",
        status="active",  # Approved!
    )
    db.add(user)
    db.flush()

    club = Club(
        id=f"c-{unique}",
        name=f"Approved Club {unique}",
        slug=f"approved-club-{unique}",
        category="Technical",
        status="active",
        creator_id=user.id,
    )
    db.add(club)
    db.flush()

    membership = ClubMembership(
        user_id=user.id,
        club_id=club.id,
        status="approved",
        club_role="coordinator",
    )
    db.add(membership)
    db.commit()

    # Login succeeds
    r_login = client.post("/api/auth/login", json={"email": email, "password": password})
    assert r_login.status_code == 200
    login_data = r_login.json()
    token = login_data["access_token"]
    assert login_data["user"]["role"] == "Club Coordinator"
    assert login_data["user"]["status"] == "active"
    assert login_data["user"]["clubId"] == club.id

    # /api/auth/me succeeds with token
    r_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r_me.status_code == 200
    me_data = r_me.json()
    assert me_data["role"] == "Club Coordinator"
    assert me_data["clubId"] == club.id


def test_student_login_and_me(db):
    # Seeded demo student or newly registered
    unique = uuid.uuid4().hex[:8]
    email = f"active_student_{unique}@college.edu"
    password = "Password@2026"

    r_reg = client.post(
        "/api/auth/register/student",
        json={"full_name": "Active Student", "email": email, "password": password},
    )
    assert r_reg.status_code == 201

    r_login = client.post("/api/auth/login", json={"email": email, "password": password})
    assert r_login.status_code == 200
    token = r_login.json()["access_token"]

    r_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r_me.status_code == 200
    assert r_me.json()["role"] == "General Student"
