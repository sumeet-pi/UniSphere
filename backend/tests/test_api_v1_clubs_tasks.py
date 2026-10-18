"""Tests for API v1 Clubs, Memberships, and Task management conforming to API_SPECIFICATION.md."""

import pytest
import uuid
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.club import Club
from app.models.membership import ClubMembership

client = TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_api_v1_list_and_get_club(db):
    # 1. Discover public clubs
    res = client.get("/api/v1/clubs?category=All")
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert isinstance(body["data"], list)
    assert len(body["data"]) > 0

    # Ensure only approved clubs appear
    for club in body["data"]:
        assert club["approvalStatus"] == "approved"

    # 2. Get specific club by ID (c1 = Byte Warriors)
    res_club = client.get("/api/v1/clubs/c1")
    assert res_club.status_code == 200
    data_club = res_club.json()["data"]
    assert data_club["id"] == "c1"
    assert data_club["name"] == "Byte Warriors"
    assert "coreTeam" in data_club
    assert "gallery" in data_club
    assert "socialLinks" in data_club


def test_api_v1_register_new_club(db):
    unique = uuid.uuid4().hex[:6]
    payload = {
        "clubName": f"Autonomous Robotics {unique}",
        "category": "Robotics & Hardware",
        "department": "Electronics & Electrical",
        "description": "Building autonomous campus rovers and drones.",
        "facultyAdvisor": "Dr. Ramesh Gupta",
        "hod": "Dr. V. K. Mathur",
        "email": f"robotics_{unique}@college.edu",
        "phone": "+91 98765 11223",
        "password": "Password@2026",
    }

    res = client.post("/api/v1/clubs", json=payload)
    assert res.status_code == 201
    body = res.json()
    assert body["success"] is True
    assert body["statusCode"] == 201
    data = body["data"]
    assert data["approvalStatus"] == "requested"
    assert "referenceId" in data
    assert "clubCode" in data

    # Verify club is not yet visible in public catalog
    cat_res = client.get("/api/v1/clubs")
    catalog_ids = [c["id"] for c in cat_res.json()["data"]]
    assert data["id"] not in catalog_ids


def test_api_v1_join_and_leave_club(db):
    # Register a new student
    unique = uuid.uuid4().hex[:8]
    email = f"joiner_{unique}@college.edu"
    signup_res = client.post(
        "/api/v1/auth/signup",
        json={
            "email": email,
            "password": "Password@2026",
            "name": f"Club Joiner {unique}",
            "course": "B.Tech",
            "branch": "Computer Science & Engineering",
            "semester": "1st Sem",
            "classRollNo": f"CS-{unique[:4]}",
            "universityRollNo": f"UNI-{unique[:6]}",
        },
    )
    token = signup_res.json()["data"]["token"]
    user_id = signup_res.json()["data"]["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Join club c2 (Data Science Circle)
    join_res = client.post("/api/v1/clubs/c2/join", headers=headers)
    assert join_res.status_code == 201
    assert join_res.json()["success"] is True

    # 2. Verify in club members list
    members_res = client.get("/api/v1/clubs/c2/members")
    assert members_res.status_code == 200
    member_ids = [m["id"] for m in members_res.json()["data"]["members"]]
    assert user_id in member_ids

    # 3. Duplicate join should be rejected with 409
    dup_join = client.post("/api/v1/clubs/c2/join", headers=headers)
    assert dup_join.status_code == 409

    # 4. Leave club
    leave_res = client.delete("/api/v1/clubs/c2/leave", headers=headers)
    assert leave_res.status_code == 200
    assert leave_res.json()["success"] is True


def test_api_v1_coordinator_tasks_crud(db):
    # Log in as coordinator of c1
    login_res = client.post("/api/v1/auth/login", json={"email": "sharma.cse@college.edu", "password": "ClubAdmin#2026"})
    token = login_res.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. List tasks
    tasks_res = client.get("/api/v1/clubs/c1/tasks", headers=headers)
    assert tasks_res.status_code == 200
    assert tasks_res.json()["success"] is True

    # 2. Create task
    task_payload = {
        "title": "Setup Venue Projectors and Sound System",
        "description": "Coordinate with campus AV department for seminar hall.",
        "category": "Logistics",
        "priority": "High",
        "assignee": "Aarav Patel",
        "dueDate": "2026-10-25",
    }
    create_res = client.post("/api/v1/clubs/c1/tasks", json=task_payload, headers=headers)
    assert create_res.status_code == 201
    created_task = create_res.json()["data"]
    task_id = created_task["id"]
    assert created_task["title"] == task_payload["title"]

    # 3. Toggle task status to completed
    patch_res = client.patch(
        f"/api/v1/clubs/c1/tasks/{task_id}/status",
        json={"status": "completed"},
        headers=headers,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["data"]["status"] == "completed"
    assert patch_res.json()["data"]["completedAt"] is not None
