"""Tests for API v1 Auth and Student Profile endpoints conforming to API_SPECIFICATION.md."""

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


def test_api_v1_signup_and_me(db):
    unique = uuid.uuid4().hex[:8]
    email = f"stud_v1_{unique}@college.edu"
    payload = {
        "email": email,
        "password": "Password@2026",
        "name": f"Student V1 {unique}",
        "phone": "+91 99887 76655",
        "course": "B.Tech",
        "branch": "Computer Science & Engineering",
        "semester": "3rd Sem",
        "classRollNo": f"CS24{unique[:3]}",
        "universityRollNo": f"UNI24{unique[:4]}",
    }

    # 1. Signup
    res = client.post("/api/v1/auth/signup", json=payload)
    assert res.status_code == 201
    body = res.json()
    assert body["success"] is True
    assert body["statusCode"] == 201
    assert "token" in body["data"]
    assert body["data"]["user"]["role"] in ("GENERAL_STUDENT", "student")
    token = body["data"]["token"]

    # 2. Authenticated /auth/me
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/api/v1/auth/me", headers=headers)
    assert res_me.status_code == 200
    body_me = res_me.json()
    assert body_me["success"] is True
    data_me = body_me["data"]
    assert (data_me.get("email") or data_me.get("user", {}).get("email")) == email


def test_api_v1_login_success(db):
    payload = {
        "email": "vikram.singh@college.edu",
        "password": "Password@2026",
    }
    res = client.post("/api/v1/auth/login", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert "token" in body["data"]
    assert body["data"]["user"]["role"] in ("GENERAL_STUDENT", "student")


def test_api_v1_login_invalid_credentials():
    payload = {
        "email": "vikram.singh@college.edu",
        "password": "WrongPassword#123",
    }
    res = client.post("/api/v1/auth/login", json=payload)
    assert res.status_code == 401
    body = res.json()
    assert body["success"] is False
    assert body["error"] in ("INVALID_CREDENTIALS", "UNAUTHORIZED")


def test_api_v1_student_profile_get_and_update(db):
    # Log in as Vikram
    login_res = client.post("/api/v1/auth/login", json={"email": "vikram.singh@college.edu", "password": "Password@2026"})
    token = login_res.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # GET /students/me
    res_get = client.get("/api/v1/students/me", headers=headers)
    assert res_get.status_code == 200
    data_get = res_get.json()["data"]
    assert "skills" in data_get
    assert "interests" in data_get

    # PUT /students/me
    update_payload = {
        "name": "Vikram Singh Updated",
        "phone": "+91 98111 22233",
        "bio": "Competitive programmer & full-stack architect",
        "bloodGroup": "O+",
        "githubUrl": "https://github.com/vikram-singh",
        "skills": ["Python", "FastAPI", "React", "PostgreSQL"],
        "interests": ["Machine Learning", "Web3", "Robotics"],
    }
    res_put = client.put("/api/v1/students/me", json=update_payload, headers=headers)
    assert res_put.status_code == 200
    data_put = res_put.json()["data"]
    assert data_put["name"] == "Vikram Singh Updated"
    assert data_put["bio"] == "Competitive programmer & full-stack architect"
    assert data_put["bloodGroup"] == "O+"
    assert "FastAPI" in data_put["skills"]


def test_api_v1_student_id_card(db):
    login_res = client.post("/api/v1/auth/login", json={"email": "vikram.singh@college.edu", "password": "Password@2026"})
    token = login_res.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/students/me/id-card", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert "name" in data
    assert "classRollNo" in data
    assert "universityRollNo" in data
    assert "qrPayload" in data
    assert "validThru" in data


def test_api_v1_students_search(db):
    login_res = client.post("/api/v1/auth/login", json={"email": "vikram.singh@college.edu", "password": "Password@2026"})
    token = login_res.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/students/search?q=Vikram", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert isinstance(data, list)
    assert len(data) >= 1
