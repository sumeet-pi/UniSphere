import sys
from pathlib import Path
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.db.session import engine, SessionLocal
engine.echo = False
from app.models.user import User
from app.models.club import Club
from app.models.membership import ClubMembership

db = SessionLocal()

print("--- User aman1@gmail.com ---")
u = db.query(User).filter(User.email == "aman1@gmail.com").first()
if u:
    print(f"ID: {u.id}, Name: {u.name}, Email: {u.email}, Role: {u.role}, Phone: {u.phone}")

print("\n--- Club Cyber Defenders ---")
c = db.query(Club).filter(Club.club_code == "CLB-CSE-9236").first()
if c:
    print(f"ID: {c.id}")
    print(f"Name: {c.name}")
    print(f"Code: {c.club_code}")
    print(f"Email: {c.email}")
    print(f"Faculty Advisor Name: {c.faculty_advisor_name}")
    print(f"Faculty Advisor ID: {c.faculty_advisor_id}")
    print(f"HOD Name: {c.hod_name}")
    print(f"Department: {c.department}")

print("\n--- Memberships for aman1 ---")
if u:
    mems = db.query(ClubMembership).filter(ClubMembership.user_id == u.id).all()
    for m in mems:
        print(f"Club ID: {m.club_id}, Role: {m.role}, Designation: {m.designation}, Status: {m.status}")

db.close()
