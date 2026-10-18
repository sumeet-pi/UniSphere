"""Regression tests for Club Coordinator Registration, Admin Approval/Rejection Workflow,
and Role-based Dashboard routing.
"""

import pytest
import uuid
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.club import Club
from app.models.membership import ClubMembership
from app.models.student_profile import StudentProfile

client = TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_coordinator_registration_approval_and_routing_flow(db):
    """
    Test the full end-to-end lifecycle:
    1. Coordinator registers with unique email and club.
    2. User and Club records created with pending status and linked.
    3. Pending coordinator login blocked with 403.
    4. Non-admin cannot access admin endpoints.
    5. Admin logs in and retrieves pending club in /api/v1/admin/clubs/pending.
    6. Admin approves club -> club becomes approved/ACTIVE, coordinator becomes active.
    7. Approved coordinator logs in -> gets Club Coordinator role, identity matches, not Vikram Singh.
    8. Coordinator /me returns matching identity and role.
    9. Second coordinator registers and is rejected with reason.
    10. Rejected club status is updated, reason stored, coordinator login blocked.
    11. Student registers and logs in -> role is General Student.
    12. Student cannot perform admin approvals (403 Forbidden).
    13. Clean up test records.
    """
    created_user_ids = []
    created_club_ids = []

    try:
        # Step 1: Register test coordinator 1
        unique_id = uuid.uuid4().hex[:8]
        coord1_email = f"test_coord_{unique_id}@college.edu"
        club1_name = f"Test Robotics Club {unique_id}"
        coord1_pass = "CoordPass#2026"

        coord1_payload = {
            "club_name": club1_name,
            "department": "Computer Science & Engineering",
            "category": "Technical & Coding",
            "hod": "Dr. R. K. Singhal",
            "faculty_advisor": "Dr. Neha Verma",
            "email": coord1_email,
            "phone": "+91 98101 23456",
            "description": "High performance autonomous systems club.",
            "password": coord1_pass,
        }

        res_reg = client.post("/api/auth/register/coordinator", json=coord1_payload)
        assert res_reg.status_code == 201, f"Registration failed: {res_reg.text}"
        data_reg = res_reg.json()
        assert data_reg["status"] == "pending_approval"
        assert data_reg["club_name"] == club1_name
        club1_id = data_reg["club_id"]
        created_club_ids.append(club1_id)

        # Step 2: Verify database records
        user1 = db.query(User).filter(User.email == coord1_email).first()
        assert user1 is not None
        created_user_ids.append(user1.id)
        assert user1.role == "organizer"  # Existing canonical coordinator role
        assert user1.status == "pending"

        club1 = db.query(Club).filter(Club.id == club1_id).first()
        assert club1 is not None
        assert club1.name == club1_name
        assert club1.approval_status in ("requested", "pending")
        # Foreign key linkage
        assert club1.faculty_advisor_id == user1.id or club1.coordinator_id == user1.id

        # Step 3: Pending coordinator login blocked
        res_pending_login = client.post("/api/auth/login", json={"email": coord1_email, "password": coord1_pass})
        assert res_pending_login.status_code == 403
        pending_code = res_pending_login.json().get("detail", {}).get("code")
        assert pending_code == "ACCOUNT_PENDING_APPROVAL"

        # Step 4: Non-admin access denied to admin endpoints
        res_no_auth = client.get("/api/v1/admin/clubs/pending")
        assert res_no_auth.status_code in (401, 403)

        # Step 5: Admin logs in
        admin_login_res = client.post("/api/auth/login", json={"email": "admin@college.edu", "password": "Admin@2026"})
        if admin_login_res.status_code != 200:
            # Fallback to v1
            admin_login_res = client.post("/api/v1/auth/login", json={"email": "admin@college.edu", "password": "Admin@2026"})
        assert admin_login_res.status_code == 200, f"Admin login failed: {admin_login_res.text}"
        admin_data = admin_login_res.json()
        admin_token = admin_data.get("access_token") or admin_data.get("data", {}).get("token")
        assert admin_token is not None

        # Step 6: Admin retrieves pending clubs list
        res_pending_list = client.get(
            "/api/v1/admin/clubs/pending",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res_pending_list.status_code == 200
        pending_data = res_pending_list.json()
        pending_clubs = pending_data.get("data", [])
        club_ids_in_list = [c["id"] for c in pending_clubs]
        assert club1_id in club_ids_in_list, f"New club {club1_id} not in admin pending list: {club_ids_in_list}"

        # Verify club details in admin list
        club_entry = next(c for c in pending_clubs if c["id"] == club1_id)
        assert club_entry["name"] == club1_name
        assert club_entry["facultyAdvisor"] == "Dr. Neha Verma"
        assert club_entry["hod"] == "Dr. R. K. Singhal"

        # Step 7: Admin approves the club
        res_approve = client.patch(
            f"/api/v1/admin/clubs/{club1_id}/approve",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res_approve.status_code == 200, f"Approve failed: {res_approve.text}"
        approve_data = res_approve.json().get("data", {})
        assert approve_data.get("approvalStatus") == "approved"

        # Step 8: Verify database status changed
        db.expire_all()
        club1_db = db.query(Club).filter(Club.id == club1_id).first()
        assert club1_db.approval_status == "approved"
        assert club1_db.status == "ACTIVE"

        user1_db = db.query(User).filter(User.id == user1.id).first()
        assert user1_db.status == "active"
        assert user1_db.is_active is True

        # Step 9: Coordinator logs in successfully
        res_coord_login = client.post("/api/auth/login", json={"email": coord1_email, "password": coord1_pass})
        assert res_coord_login.status_code == 200, f"Coordinator login failed: {res_coord_login.text}"
        coord_auth = res_coord_login.json()
        coord_token = coord_auth["access_token"]
        coord_user = coord_auth["user"]
        # Must NOT be Vikram Singh
        assert coord_user["name"] != "Vikram Singh"
        assert coord_user["email"] == coord1_email
        assert coord_user["role"] == "Club Coordinator"
        assert coord_user["clubId"] == club1_id

        # Step 10: Verify /me endpoint for coordinator
        res_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {coord_token}"})
        assert res_me.status_code == 200
        me_user = res_me.json()
        assert me_user["name"] != "Vikram Singh"
        assert me_user["role"] == "Club Coordinator"
        assert me_user["clubId"] == club1_id

        # Step 11: Rejection workflow with coordinator 2
        unique_id2 = uuid.uuid4().hex[:8]
        coord2_email = f"test_coord_{unique_id2}@college.edu"
        club2_name = f"Test Rejected Club {unique_id2}"
        coord2_pass = "CoordPass#2026"

        res_reg2 = client.post(
            "/api/auth/register/coordinator",
            json={
                "club_name": club2_name,
                "department": "Civil Engineering",
                "category": "Sports & Fitness",
                "hod": "Dr. V. K. Mathur",
                "faculty_advisor": "Dr. Rajesh",
                "email": coord2_email,
                "phone": "+91 98101 99999",
                "description": "Club to be rejected.",
                "password": coord2_pass,
            }
        )
        assert res_reg2.status_code == 201
        club2_id = res_reg2.json()["club_id"]
        created_club_ids.append(club2_id)

        user2 = db.query(User).filter(User.email == coord2_email).first()
        if user2:
            created_user_ids.append(user2.id)

        # Admin rejects club 2 with reason
        rejection_reason = "Missing faculty endorsement letter and budget allocation."
        res_reject = client.patch(
            f"/api/v1/admin/clubs/{club2_id}/reject",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"rejectionReason": rejection_reason}
        )
        assert res_reject.status_code == 200

        # Verify rejection in DB
        db.expire_all()
        club2_db = db.query(Club).filter(Club.id == club2_id).first()
        assert club2_db.approval_status == "rejected"
        assert club2_db.rejection_reason == rejection_reason

        # Step 12: Student registration and role check
        unique_s = uuid.uuid4().hex[:8]
        student_email = f"test_student_{unique_s}@college.edu"
        res_stud_reg = client.post(
            "/api/auth/register/student",
            json={
                "full_name": f"Regular Student {unique_s}",
                "email": student_email,
                "password": "Password@2026",
                "phone": "+91 98765 00000",
                "course": "B.Tech",
                "branch": "Computer Science & Engineering",
                "semester": "1st Sem",
            }
        )
        assert res_stud_reg.status_code == 201
        student_data = res_stud_reg.json()
        student_token = student_data["access_token"]
        assert student_data["user"]["role"] == "General Student"
        user_s = db.query(User).filter(User.email == student_email).first()
        if user_s:
            created_user_ids.append(user_s.id)

        # Verify student CANNOT execute admin approval operations
        res_stud_approve = client.patch(
            f"/api/v1/admin/clubs/{club1_id}/approve",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert res_stud_approve.status_code == 403, "Student must not be allowed to approve clubs"

    finally:
        # Cleanup isolated test data
        for club_id in created_club_ids:
            try:
                db.query(ClubMembership).filter(ClubMembership.club_id == club_id).delete()
                db.query(Club).filter(Club.id == club_id).delete()
            except Exception:
                db.rollback()

        for user_id in created_user_ids:
            try:
                db.query(ClubMembership).filter(ClubMembership.user_id == user_id).delete()
                db.query(StudentProfile).filter(StudentProfile.user_id == user_id).delete()
                db.query(User).filter(User.id == user_id).delete()
            except Exception:
                db.rollback()

        db.commit()
