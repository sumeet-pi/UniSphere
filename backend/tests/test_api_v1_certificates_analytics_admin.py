"""Tests for Winners, Certificates, Announcements, Analytics, NAAC Audits, and Admin Governance conforming to API_SPECIFICATION.md."""

import pytest
import uuid
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.club import Club
from app.models.event_details import Certificate

client = TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_api_v1_announcements_feed_and_coordinator_publish(db):
    # 1. Fetch public announcements feed
    feed_res = client.get("/api/v1/announcements?scope=All Campus")
    assert feed_res.status_code == 200
    feed_body = feed_res.json()
    assert feed_body["success"] is True
    assert isinstance(feed_body["data"], list)

    # 2. Coordinator publishes announcement
    coord_login = client.post("/api/v1/auth/login", json={"email": "sharma.cse@college.edu", "password": "ClubAdmin#2026"})
    coord_token = coord_login.json()["data"]["token"]
    coord_headers = {"Authorization": f"Bearer {coord_token}"}

    unique = uuid.uuid4().hex[:6]
    announcement_payload = {
        "title": f"Important Hackathon Orientation {unique}",
        "category": "Event Update",
        "priority": "HIGH",
        "audience": "All Campus Students",
        "isPinned": True,
        "content": "Mandatory briefing session on hackathon rubrics, hardware allowances, and mentor pairings.",
    }

    create_res = client.post(
        "/api/v1/clubs/c1/announcements",
        json=announcement_payload,
        headers=coord_headers,
    )
    assert create_res.status_code == 201
    created_data = create_res.json()["data"]
    assert created_data["title"] == announcement_payload["title"]
    assert created_data["priority"] == "HIGH"


def test_api_v1_analytics_summary_and_naac_audit(db):
    coord_login = client.post("/api/v1/auth/login", json={"email": "sharma.cse@college.edu", "password": "ClubAdmin#2026"})
    coord_token = coord_login.json()["data"]["token"]
    coord_headers = {"Authorization": f"Bearer {coord_token}"}

    # Authenticated summary query
    summary_res = client.get("/api/v1/clubs/c1/analytics/summary", headers=coord_headers)
    assert summary_res.status_code == 200
    summary_data = summary_res.json()["data"]
    assert "activeMembers" in summary_data
    assert "totalRegistrations" in summary_data
    assert "turnoutRate" in summary_data
    assert "attendanceFunnel" in summary_data
    assert "branchDiversity" in summary_data

    # NAAC Audit Criterion 5.3 report
    naac_res = client.get("/api/v1/clubs/c1/analytics/naac-audit", headers=coord_headers)
    assert naac_res.status_code == 200
    naac_data = naac_res.json()["data"]
    assert "criterion" in naac_data
    assert "records" in naac_data
    assert isinstance(naac_data["records"], list)

    # NAAC CSV Export
    csv_res = client.get("/api/v1/clubs/c1/analytics/naac-audit/export?format=csv", headers=coord_headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers.get("content-type", "")
    assert "NAAC_Criterion_5.3_Event_Audit" in csv_res.headers.get("content-disposition", "")


def test_api_v1_winners_and_certificates(db):
    # 1. Declare winners for completed/past event e3
    coord_login = client.post("/api/v1/auth/login", json={"email": "sharma.cse@college.edu", "password": "ClubAdmin#2026"})
    coord_token = coord_login.json()["data"]["token"]
    coord_headers = {"Authorization": f"Bearer {coord_token}"}

    winners_payload = {
        "podium": [
            {
                "rank": 1,
                "position": "1st Place (Winner)",
                "teamName": "ByteBusters",
                "teamMembers": ["Vikram Singh", "Ayush Sharma"],
                "projectTitle": "UniSphere Smart Campus Portal",
            },
            {
                "rank": 2,
                "position": "2nd Place (Runner Up)",
                "teamName": "CyberKnights",
                "teamMembers": ["Priya Roy"],
                "projectTitle": "Secure NFC Turnstile Access",
            }
        ]
    }

    declare_res = client.post(
        "/api/v1/events/e3/winners",
        json=winners_payload,
        headers=coord_headers,
    )
    assert declare_res.status_code in (200, 201)

    # 2. Fetch declared winners
    get_winners = client.get("/api/v1/events/e3/winners")
    assert get_winners.status_code == 200
    assert get_winners.json()["success"] is True

    # 2.5 Ensure test certificate exists for verification test
    from app.models.event_details import Certificate
    from datetime import date
    existing_cert = db.query(Certificate).filter(Certificate.credential_id == "CRT-2026-BW-1001").first()
    if not existing_cert:
        new_cert = Certificate(
            id=str(uuid.uuid4()),
            credential_id="CRT-2026-BW-1001",
            event_id="e3",
            user_id="u2",
            type="MERIT_PODIUM",
            student_name="Vikram Singh",
            class_roll_no="CS24089",
            course_branch="B.Tech Computer Science",
            event_title="HackWave 2026",
            club_name="Byte Warriors",
            faculty_advisor_name="Dr. Sharma",
            hod_name="Dr. Mukherjee",
            issue_date=date(2026, 3, 20),
            naac_criterion="5.3",
            status="ISSUED",
        )
        db.add(new_cert)
        db.commit()

    # 3. Public Certificate Lookup (CRT-2026-BW-1001)
    cert_res = client.get("/api/v1/certificates/CRT-2026-BW-1001")
    assert cert_res.status_code == 200
    cert_data = cert_res.json()["data"]
    assert cert_data["credentialId"] == "CRT-2026-BW-1001"
    assert "studentName" in cert_data
    assert "eventTitle" in cert_data

    # 4. Certificate PDF download
    pdf_res = client.get("/api/v1/certificates/CRT-2026-BW-1001/pdf")
    assert pdf_res.status_code == 200
    assert "application/pdf" in pdf_res.headers.get("content-type", "")
    assert len(pdf_res.content) > 1000


def test_api_v1_admin_governance_approval_rejection(db):
    # 1. Log in as ADMIN
    admin_login = client.post("/api/v1/auth/login", json={"email": "admin@college.edu", "password": "Admin@2026"})
    admin_token = admin_login.json()["data"]["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Get pending clubs queue
    pending_res = client.get("/api/v1/admin/clubs/pending", headers=admin_headers)
    assert pending_res.status_code == 200
    pending_list = pending_res.json()["data"]
    assert isinstance(pending_list, list)

    # 3. Register a temporary club to test approval
    unique = uuid.uuid4().hex[:6]
    reg_res = client.post(
        "/api/v1/clubs",
        json={
            "clubName": f"Aeromodelling Club {unique}",
            "category": "Aviation",
            "department": "Mechanical Engineering",
            "facultyAdvisor": "Dr. S. K. Roy",
            "hod": "Dr. V. K. Mathur",
            "email": f"aero_{unique}@college.edu",
            "phone": "+91 98111 55667",
            "password": "Password@2026",
            "description": "Designing radio-controlled UAVs and gliders.",
        },
    )
    assert reg_res.status_code == 201
    club_to_approve = reg_res.json()["data"]["id"]

    # 4. Admin approves club
    approve_res = client.patch(f"/api/v1/admin/clubs/{club_to_approve}/approve", headers=admin_headers)
    assert approve_res.status_code == 200
    assert approve_res.json()["data"]["approvalStatus"] == "approved"

    # 5. Register another temporary club to test rejection
    unique2 = uuid.uuid4().hex[:6]
    reg_res2 = client.post(
        "/api/v1/clubs",
        json={
            "clubName": f"Esports Society {unique2}",
            "category": "Gaming",
            "department": "Student Welfare",
            "facultyAdvisor": "Dr. K. L. Rao",
            "hod": "Dr. V. K. Mathur",
            "email": f"esports_{unique2}@college.edu",
            "phone": "+91 98111 88990",
            "password": "Password@2026",
            "description": "LAN tournaments and gaming events.",
        },
    )
    assert reg_res2.status_code == 201
    club_to_reject = reg_res2.json()["data"]["id"]

    # 6. Admin rejects club with required rationale
    reject_res = client.patch(
        f"/api/v1/admin/clubs/{club_to_reject}/reject",
        json={"reason": "Requires faculty advisor endorsement from physical education council."},
        headers=admin_headers,
    )
    assert reject_res.status_code == 200
    assert reject_res.json()["data"]["approvalStatus"] == "rejected"
