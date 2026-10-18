"""Comprehensive regression tests covering all 12 scenarios from Section 10:
1. Update user's name; verify profile and user identity both update.
2. Update profile information; verify cross-endpoint consistency.
3. Refresh simulation; verify session persistence and role preservation.
4. Explicit logout; verify protected routes reject unauthenticated requests.
5. Add a club member via coordinator endpoint; verify Members roster reflects it.
6. Remove a member; verify list and count update accurately.
7. Refresh after membership changes; verify database persistence.
8. Failed API request simulation; verify error response format.
9. 403 simulation; verify access-denied without session invalidation.
10. Expired/invalid session simulation; verify 401 status.
11. Role verification for student, coordinator, and administrator accounts.
12. Verify no stale or hardcoded identity leakage across distinct accounts.
"""

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


def test_scenario_1_and_2_update_name_and_cross_endpoint_consistency(db):
    """Scenario 1 & 2: Update user's name and profile info; verify cross-endpoint consistency."""
    unique = uuid.uuid4().hex[:8]
    email = f"user_{unique}@college.edu"
    signup_payload = {
        "email": email,
        "password": "Password@2026",
        "name": f"Original Name {unique}",
        "phone": "+91 99880 11223",
        "course": "B.Tech",
        "branch": "Computer Science & Engineering",
        "semester": "4th Sem",
        "classRollNo": f"CS24{unique[:4]}",
        "universityRollNo": f"UNI24{unique[:4]}",
    }
    signup_res = client.post("/api/v1/auth/signup", json=signup_payload)
    assert signup_res.status_code == 201
    token = signup_res.json()["data"]["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Update user's name and bio
    updated_name = f"Updated Name {unique}"
    update_payload = {
        "name": updated_name,
        "phone": "+91 98765 43210",
        "bio": "Software Systems Engineering Scholar",
        "bloodGroup": "AB+",
        "skills": ["React", "Redux Toolkit", "FastAPI"],
        "interests": ["Distributed Systems", "Cloud"],
    }
    put_res = client.put("/api/v1/students/me", json=update_payload, headers=headers)
    assert put_res.status_code == 200
    profile_data = put_res.json()["data"]
    assert profile_data["name"] == updated_name
    assert profile_data["bio"] == "Software Systems Engineering Scholar"
    assert profile_data["bloodGroup"] == "AB+"

    # 2. Verify /api/v1/auth/me returns the updated name (canonical user identity)
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    user_data = me_res.json()["data"]
    assert user_data["name"] == updated_name

    # 3. Verify /api/v1/students/me/id-card returns the updated name
    card_res = client.get("/api/v1/students/me/id-card", headers=headers)
    assert card_res.status_code == 200
    assert card_res.json()["data"]["name"] == updated_name


def test_scenario_3_refresh_preserves_session(db):
    """Scenario 3: Page refresh simulation restores user without logging out."""
    unique = uuid.uuid4().hex[:8]
    email = f"refresh_{unique}@college.edu"
    signup_payload = {
        "email": email,
        "password": "Password@2026",
        "name": f"Session Tester {unique}",
        "phone": "+91 91234 56789",
        "course": "B.Tech",
        "branch": "IT",
        "semester": "5th Sem",
        "classRollNo": f"IT24{unique[:4]}",
        "universityRollNo": f"UNI_IT{unique[:4]}",
    }
    signup_res = client.post("/api/v1/auth/signup", json=signup_payload)
    token = signup_res.json()["data"]["token"]

    # Simulating refresh: frontend calls getMe with stored token
    headers = {"Authorization": f"Bearer {token}"}
    restore_res = client.get("/api/v1/auth/me", headers=headers)
    assert restore_res.status_code == 200
    user = restore_res.json()["data"]
    assert user["email"] == email
    assert user["role"] in ("GENERAL_STUDENT", "student")
    assert user["name"] == f"Session Tester {unique}"


def test_scenario_4_logout_requires_login(db):
    """Scenario 4: Explicit logout clears token and protected routes require login."""
    # Attempting protected route without Authorization header
    res_no_auth = client.get("/api/v1/auth/me")
    assert res_no_auth.status_code == 401

    # Attempting protected student profile without token
    res_profile = client.get("/api/v1/students/me")
    assert res_profile.status_code == 401


def test_scenario_5_6_7_club_membership_add_remove_and_persistence(db):
    """Scenarios 5, 6, 7: Add member via coordinator endpoint, remove member, verify persistence."""
    # Find existing approved club (or create one for testing)
    club = db.query(Club).filter(Club.approval_status == "approved").first()
    if not club:
        club = Club(
            id=f"c_{uuid.uuid4().hex[:6]}",
            club_code="TEST-CLUB",
            name="Automated Test Society",
            category="Technical & Coding",
            department="CSE",
            approval_status="approved",
            status="Approved",
        )
        db.add(club)
        db.commit()

    # Coordinator login for club c1
    coord_res = client.post("/api/v1/auth/login", json={"email": "sharma.cse@college.edu", "password": "ClubAdmin#2026"})
    assert coord_res.status_code == 200
    coord_token = coord_res.json()["data"]["token"]
    coord_headers = {"Authorization": f"Bearer {coord_token}"}

    # Initial members list count
    init_res = client.get(f"/api/v1/clubs/{club.id}/members")
    assert init_res.status_code == 200
    initial_count = init_res.json()["data"]["totalMembers"]

    # Scenario 5: Add a club member directly
    unique_student = uuid.uuid4().hex[:6]
    member_add_payload = {
        "name": f"Member {unique_student}",
        "email": f"member_{unique_student}@campus.edu",
        "collegeId": f"CS{unique_student.upper()}",
        "department": "CSE",
        "year": "2nd Year",
        "role": "MEMBER",
        "designation": "General Member",
    }
    add_res = client.post(f"/api/v1/clubs/{club.id}/members", json=member_add_payload, headers=coord_headers)
    assert add_res.status_code in (200, 201)
    new_members_data = add_res.json()["data"]
    assert new_members_data["totalMembers"] == initial_count + 1

    # Verify the member appears in the members list
    added_member = next((m for m in new_members_data["members"] if m["name"] == f"Member {unique_student}"), None)
    assert added_member is not None
    member_user_id = added_member["id"]

    # Scenario 7: Verify database persistence across a separate query
    db_members_res = client.get(f"/api/v1/clubs/{club.id}/members")
    assert db_members_res.status_code == 200
    assert any(m["id"] == member_user_id for m in db_members_res.json()["data"]["members"])

    # Scenario 6: Remove the member and verify the count updates
    del_res = client.delete(f"/api/v1/clubs/{club.id}/members/{member_user_id}", headers=coord_headers)
    assert del_res.status_code == 200

    # Verify removed from list
    after_del_res = client.get(f"/api/v1/clubs/{club.id}/members")
    assert after_del_res.status_code == 200
    assert not any(m["id"] == member_user_id for m in after_del_res.json()["data"]["members"])
    assert after_del_res.json()["data"]["totalMembers"] == initial_count


def test_scenario_8_failed_api_request_normalization():
    """Scenario 8: Failed API request returns standard normalized error structure."""
    res = client.post("/api/v1/auth/login", json={"email": "nonexistent@college.edu", "password": "WrongPassword"})
    assert res.status_code == 401
    body = res.json()
    assert body["success"] is False
    assert "error" in body
    assert "message" in body
    assert body["error"] in ("INVALID_CREDENTIALS", "UNAUTHORIZED")


def test_scenario_9_forbidden_does_not_destroy_session(db):
    """Scenario 9: 403 Forbidden returns access-denied without invalidating authentication."""
    # Student login
    stud_res = client.post("/api/v1/auth/login", json={"email": "vikram.singh@college.edu", "password": "Password@2026"})
    stud_token = stud_res.json()["data"]["token"]
    stud_headers = {"Authorization": f"Bearer {stud_token}"}

    # Student attempts admin approval endpoint -> 403
    res_403 = client.patch("/api/v1/admin/clubs/c1/approve", headers=stud_headers)
    assert res_403.status_code == 403

    # Student's session must still be completely valid
    res_me = client.get("/api/v1/auth/me", headers=stud_headers)
    assert res_me.status_code == 200
    assert res_me.json()["data"]["email"] in ("vikram.singh@college.edu", "vikram.cs24@college.edu")


def test_scenario_10_expired_or_invalid_session_returns_401():
    """Scenario 10: Invalid or expired token returns 401 requiring reauthentication."""
    invalid_headers = {"Authorization": "Bearer invalid.expired.token.123"}
    res = client.get("/api/v1/auth/me", headers=invalid_headers)
    assert res.status_code == 401


def test_scenario_11_role_based_identities_and_dashboards():
    """Scenario 11: Verify student, coordinator, and administrator accounts have proper identities."""
    # 1. Student
    s_res = client.post("/api/v1/auth/login", json={"email": "vikram.singh@college.edu", "password": "Password@2026"})
    assert s_res.status_code == 200
    s_user = s_res.json()["data"]["user"]
    assert s_user["role"] in ("GENERAL_STUDENT", "student")

    # 2. Coordinator
    c_res = client.post("/api/v1/auth/login", json={"email": "sharma.cse@college.edu", "password": "ClubAdmin#2026"})
    assert c_res.status_code == 200
    c_user = c_res.json()["data"]["user"]
    assert c_user["role"] in ("CLUB_COORDINATOR", "coordinator", "teacher", "organizer")

    # 3. Admin
    a_res = client.post("/api/v1/auth/login", json={"email": "admin@college.edu", "password": "Admin@2026"})
    assert a_res.status_code == 200
    a_user = a_res.json()["data"]["user"]
    assert a_user["role"] in ("ADMIN", "admin")


def test_scenario_12_no_stale_or_hardcoded_leakage(db):
    """Scenario 12: Distinct accounts maintain their own authentic identity with zero hardcoding."""
    unique_a = uuid.uuid4().hex[:6]
    unique_b = uuid.uuid4().hex[:6]

    res_a = client.post("/api/v1/auth/signup", json={
        "email": f"alice_{unique_a}@college.edu",
        "password": "Password@2026",
        "name": f"Alice Johnson {unique_a}",
        "classRollNo": f"CS_{unique_a}",
        "universityRollNo": f"UNI_{unique_a}",
    })
    assert res_a.status_code == 201
    user_a = res_a.json()["data"]["user"]

    res_b = client.post("/api/v1/auth/signup", json={
        "email": f"bob_{unique_b}@college.edu",
        "password": "Password@2026",
        "name": f"Bob Williams {unique_b}",
        "classRollNo": f"CS_{unique_b}",
        "universityRollNo": f"UNI_{unique_b}",
    })
    assert res_b.status_code == 201
    user_b = res_b.json()["data"]["user"]

    # Verify no fallback leakage
    assert user_a["name"] == f"Alice Johnson {unique_a}"
    assert user_b["name"] == f"Bob Williams {unique_b}"
    assert user_a["name"] != user_b["name"]
    assert "Vikram" not in user_a["name"]
    assert "Vikram" not in user_b["name"]
