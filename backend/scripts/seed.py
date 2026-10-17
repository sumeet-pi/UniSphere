"""Seed script — insert demo data for development.

Run: python -m scripts.seed

Safe to run multiple times — checks for existing data before inserting.
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.db.base import Base
from app.models.user import User
from app.models.club import Club
from app.models.membership import ClubMembership
from app.models.event import Event
from app.models.announcement import Announcement
from app.models.registration import EventRegistration
from app.models.audit_log import AuditLog


def seed():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "vikram.cs24@college.edu").first():
            print("✓ Database already seeded. Skipping.")
            return

        print("🌱 Seeding UniSphere database...")

        # ── Users ──
        student = User(
            id="u5",
            full_name="Vikram Singh",
            email="vikram.cs24@college.edu",
            password_hash=hash_password("Password@2026"),
            role="student",
            phone="+91 98991 23488",
            course="B.Tech",
            branch="Computer Science & Engineering",
            semester="5th Sem",
            class_roll_no="CS-42",
            university_roll_no="2401020088",
        )
        coordinator = User(
            id="u1",
            full_name="Dr. Sharma",
            email="sharma.cse@college.edu",
            password_hash=hash_password("ClubAdmin#2026"),
            role="organizer",
            phone="+91 98101 11111",
        )
        student2 = User(
            id="u2",
            full_name="Aarav Kumar",
            email="aarav.cs24@college.edu",
            password_hash=hash_password("Password@2026"),
            role="student",
            course="B.Tech",
            branch="Computer Science & Engineering",
            semester="5th Sem",
        )
        db.add_all([student, coordinator, student2])
        db.flush()
        print("  ✓ Users created")

        # ── Clubs ──
        club1 = Club(
            id="c1",
            name="Byte Warriors",
            slug="byte-warriors",
            category="Computer Science",
            description="The official coding and technology club of the CSE Department. We organize hackathons, coding contests, and tech talks.",
            logo_url="https://api.dicebear.com/7.x/shapes/svg?seed=ByteWarriors&backgroundColor=0a5c36,18181b",
            banner_url="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000",
            faculty_head="Dr. Sharma",
            creator_id="u1",
        )
        club2 = Club(
            id="c2",
            name="Robotics Society",
            slug="robotics-society",
            category="Engineering",
            description="Building the future, one robot at a time. Join us for hands-on hardware projects and robotics competitions.",
            logo_url="https://api.dicebear.com/7.x/shapes/svg?seed=Robotics&backgroundColor=b91c1c,18181b",
            banner_url="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000",
            faculty_head="Prof. Mehta",
        )
        club3 = Club(
            id="c3",
            name="Literary Club",
            slug="literary-club",
            category="Arts & Culture",
            description="A community for writers, readers, and poets. We host open mics, debates, and literature festivals.",
            logo_url="https://api.dicebear.com/7.x/shapes/svg?seed=Literary&backgroundColor=4338ca,18181b",
            banner_url="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1000",
            faculty_head="Dr. Iyer",
        )
        club4 = Club(
            id="c4",
            name="E-Cell",
            slug="e-cell",
            category="Entrepreneurship",
            description="Fostering the spirit of entrepreneurship. Get mentorship, pitch ideas, and build startups.",
            logo_url="https://api.dicebear.com/7.x/shapes/svg?seed=ECell&backgroundColor=f59e0b,18181b",
            banner_url="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=1000",
            faculty_head="Prof. Desai",
        )
        db.add_all([club1, club2, club3, club4])
        db.flush()
        print("  ✓ Clubs created")

        # ── Memberships ──
        m1 = ClubMembership(user_id="u1", club_id="c1", status="approved", club_role="coordinator")
        m2 = ClubMembership(user_id="u2", club_id="c1", status="approved", club_role="coordinator")
        m3 = ClubMembership(user_id="u5", club_id="c1", status="approved", club_role="member")
        db.add_all([m1, m2, m3])
        db.flush()
        print("  ✓ Memberships created")

        # ── Events ──
        event1 = Event(
            id="e1",
            club_id="c1",
            title="Hackathon 2026",
            description="A 12-hour coding marathon to solve real-world problems. Great prizes to be won!",
            date="2026-11-20",
            time="09:00 AM - 09:00 PM",
            venue="Main Lab 3, CSE Block",
            capacity=100,
            registered_count=0,
            status="published",
            eligibility="Open to all years and departments",
            rules='["Teams of 2-4 members", "Bring your own laptops", "Original code only"]',
            image_url="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000",
            creator_id="u1",
        )
        event2 = Event(
            id="e2",
            club_id="c1",
            title="Web Development Workshop",
            description="Learn the basics of React and Tailwind CSS in this hands-on workshop.",
            date="2026-11-25",
            time="02:00 PM - 05:00 PM",
            venue="Seminar Hall B",
            capacity=60,
            registered_count=0,
            status="published",
            eligibility="Beginners welcome",
            rules='["Laptop required"]',
            image_url="https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=1000",
            creator_id="u1",
        )
        event3 = Event(
            id="e3",
            club_id="c2",
            title="Line Follower Robot Challenge",
            description="Build and race an autonomous line follower robot.",
            date="2026-12-05",
            time="10:00 AM - 04:00 PM",
            venue="College Courtyard",
            capacity=40,
            registered_count=0,
            status="published",
            eligibility="Engineering Students",
            rules='["Standard kit allowed", "Max dimensions 15x15cm"]',
            image_url="https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&q=80&w=1000",
        )
        event4 = Event(
            id="e4",
            club_id="c1",
            title="Debugging Challenge",
            description="Find and fix bugs in C++ and Python code snippets.",
            date="2026-08-15",
            time="11:00 AM - 01:00 PM",
            venue="Online",
            capacity=200,
            registered_count=150,
            status="published",
            eligibility="All students",
            rules='["Individual participation"]',
            image_url="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000",
        )
        # A full event for testing
        event5 = Event(
            id="e5",
            club_id="c3",
            title="Poetry Slam 2026",
            description="Annual poetry slam competition. Express yourself!",
            date="2026-11-30",
            time="04:00 PM - 07:00 PM",
            venue="Open Air Theatre",
            capacity=2,
            registered_count=2,
            status="published",
            eligibility="All students",
            rules='["Original poems only", "3 minutes per poem"]',
            image_url="https://images.unsplash.com/photo-1473649085228-583485e6e4d7?auto=format&fit=crop&q=80&w=1000",
        )
        db.add_all([event1, event2, event3, event4, event5])
        db.flush()
        print("  ✓ Events created")

        # ── Announcements ──
        ann1 = Announcement(
            id="a1",
            club_id="c1",
            title="Call for Core Team Applications",
            body="Byte Warriors is recruiting for the new academic year! Apply now to be part of the core team.",
            status="published",
            creator_id="u1",
        )
        ann2 = Announcement(
            id="a2",
            club_id="c1",
            title="Hackathon Registration Closing Soon",
            body="Only 5 spots left for Hackathon 2026. Register ASAP!",
            status="published",
            creator_id="u1",
        )
        db.add_all([ann1, ann2])
        db.flush()
        print("  ✓ Announcements created")

        db.commit()
        print("\n✅ Seed complete!")
        print("\n📋 Demo Credentials:")
        print("  Student:     vikram.cs24@college.edu / Password@2026")
        print("  Coordinator: sharma.cse@college.edu  / ClubAdmin#2026")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
