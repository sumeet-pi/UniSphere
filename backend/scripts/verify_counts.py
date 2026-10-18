import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import func
from app.db.session import SessionLocal
from app.models.user import User
from app.models.student_profile import StudentProfile, StudentSkill, StudentInterest
from app.models.club import Club
from app.models.club_gallery import ClubGallery
from app.models.membership import ClubMembership
from app.models.event import Event
from app.models.event_details import EventRule, EventTeam, EventTeamMember, EventWinner, Certificate
from app.models.registration import EventRegistration
from app.models.task import CoordinatorTask
from app.models.announcement import Announcement

from app.db.session import engine, SessionLocal
engine.echo = False

db = SessionLocal()

print("=" * 60)
print("NEON POSTGRESQL DIRECT DATABASE VERIFICATION")
print("=" * 60)

# Check all non-demo users
original_users = db.query(User).filter(User.email.in_([
    "aman1@gmail.com", "aman@gmail.com", "admin@college.edu"
])).all()
print("\n--- Non-Demo Users (Must be untouched) ---")
for u in original_users:
    print(f"  User: {u.email} | Role: {u.role} | Active: {u.is_active} | Name: {u.name}")

# Total counts in DB
print("\n--- Total Counts in Database ---")
tables = [
    ("Users (Total)", User),
    ("Student Profiles", StudentProfile),
    ("Student Skills", StudentSkill),
    ("Student Interests", StudentInterest),
    ("Clubs", Club),
    ("Club Memberships", ClubMembership),
    ("Events", Event),
    ("Event Rules", EventRule),
    ("Event Registrations", EventRegistration),
    ("Event Teams", EventTeam),
    ("Event Team Members", EventTeamMember),
    ("Event Winners", EventWinner),
    ("Certificates", Certificate),
    ("Coordinator Tasks", CoordinatorTask),
    ("Announcements", Announcement),
    ("Club Gallery Items", ClubGallery),
]

for label, model in tables:
    count = db.query(func.count()).select_from(model).scalar()
    print(f"  {label:<25}: {count}")

# Check demo accounts
print("\n--- Sample Demo Accounts ---")
demo_admin = db.query(User).filter(User.email == "admin@demo.unisphere.edu").first()
print(f"  Admin: {demo_admin.email if demo_admin else 'NOT FOUND'} (Role: {demo_admin.role if demo_admin else 'N/A'})")

demo_coord = db.query(User).filter(User.role == "CLUB_COORDINATOR").all()
print(f"  Coordinators found: {len(demo_coord)}")
for c in demo_coord:
    print(f"    - {c.email} ({c.name})")

demo_students = db.query(User).filter(User.role == "GENERAL_STUDENT").count()
print(f"  Students found: {demo_students}")

# Check clubs
print("\n--- Seeded Clubs ---")
clubs = db.query(Club).all()
for c in clubs:
    print(f"  - [{c.club_code}] {c.name} (Status: {c.status}, Approval: {c.approval_status})")

# Check events sample
print("\n--- Sample Events ---")
events = db.query(Event).limit(5).all()
for e in events:
    print(f"  - [{e.id}] {e.title} (Status: {e.status}, Venue: {e.venue})")

db.close()
