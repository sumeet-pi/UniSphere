import pytest
from app.db.session import SessionLocal
from app.models.user import User
from app.models.club import Club
from app.models.membership import ClubMembership
from app.models.event import Event
from app.models.registration import EventRegistration
from app.models.event_details import Certificate, EventWinner
from app.core.security import verify_password


@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_existing_non_demo_users_unmodified(db):
    """Confirm existing non-demo records are preserved and unmodified."""
    non_demo_emails = ["aman@gmail.com", "admin@college.edu", "aman1@gmail.com"]
    for email in non_demo_emails:
        user = db.query(User).filter(User.email == email).first()
        assert user is not None, f"Non-demo user {email} was deleted!"
        assert user.is_active is True, f"Non-demo user {email} was deactivated!"


def test_demo_accounts_authentication(db):
    """Verify demo accounts exist and their preset passwords match."""
    demo_creds = [
        ("admin@demo.unisphere.edu", "Admin@2026", "ADMIN"),
        ("arjunmehta@demo.unisphere.edu", "Coordinator@2026", "CLUB_COORDINATOR"),
        ("demo_s001@demo.unisphere.edu", "Student@2026", "GENERAL_STUDENT"),
    ]
    for email, password, expected_role in demo_creds:
        user = db.query(User).filter(User.email == email).first()
        assert user is not None, f"Demo account {email} not found"
        assert user.role == expected_role, f"Role mismatch for {email}"
        assert verify_password(password, user.password_hash), f"Password hash mismatch for {email}"


def test_seeded_clubs_and_events_exist(db):
    """Verify minimum seeded clubs and events."""
    demo_clubs = db.query(Club).filter(Club.id.like("demo_%")).all()
    assert len(demo_clubs) == 10, f"Expected 10 demo clubs, found {len(demo_clubs)}"

    demo_events = db.query(Event).filter(Event.club_id.like("demo_%")).all()
    assert len(demo_events) == 23, f"Expected 23 demo events, found {len(demo_events)}"


def test_referential_integrity_memberships(db):
    """Verify that every seeded club membership points to a valid user and club."""
    memberships = db.query(ClubMembership).filter(ClubMembership.club_id.like("demo_%")).all()
    assert len(memberships) >= 100, f"Expected at least 100 demo memberships, found {len(memberships)}"

    valid_user_ids = {u[0] for u in db.query(User.id).all()}
    valid_club_ids = {c[0] for c in db.query(Club.id).all()}

    for m in memberships:
        assert m.user_id in valid_user_ids, f"Membership {m.id} has invalid user_id {m.user_id}"
        assert m.club_id in valid_club_ids, f"Membership {m.id} has invalid club_id {m.club_id}"


def test_referential_integrity_event_registrations(db):
    """Verify that event registrations point to valid students and events."""
    registrations = db.query(EventRegistration).all()
    assert len(registrations) >= 300, f"Expected >= 300 registrations, found {len(registrations)}"

    valid_user_ids = {u[0] for u in db.query(User.id).all()}
    valid_event_ids = {e[0] for e in db.query(Event.id).all()}

    for r in registrations:
        assert r.user_id in valid_user_ids, f"Registration {r.id} has invalid user_id {r.user_id}"
        assert r.event_id in valid_event_ids, f"Registration {r.id} has invalid event_id {r.event_id}"


def test_certificates_and_winners_referential_integrity(db):
    """Verify that certificates and winners point to valid users and events."""
    certificates = db.query(Certificate).all()
    assert len(certificates) == 150, f"Expected 150 certificates, found {len(certificates)}"

    valid_user_ids = {u[0] for u in db.query(User.id).all()}
    valid_event_ids = {e[0] for e in db.query(Event.id).all()}

    for c in certificates:
        assert c.user_id in valid_user_ids, f"Certificate {c.id} has invalid user_id {c.user_id}"
        assert c.event_id in valid_event_ids, f"Certificate {c.id} has invalid event_id {c.event_id}"
