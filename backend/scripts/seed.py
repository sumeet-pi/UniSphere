"""Seed script to populate initial campus benchmark data conforming to DATABASE_SCHEMA.md."""

import uuid
from datetime import date, datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import engine, SessionLocal
from app.db.base import Base
import app.models  # load all models
from app.models.user import User
from app.models.student_profile import StudentProfile, StudentSkill, StudentInterest
from app.models.club import Club
from app.models.club_gallery import ClubGallery
from app.models.membership import ClubMembership
from app.models.event import Event
from app.models.event_details import EventRule, EventWinner, Certificate
from app.models.registration import EventRegistration
from app.models.task import CoordinatorTask
from app.models.announcement import Announcement
from app.core.security import hash_password


def seed_database():
    """Seed initial demonstration state matching frontend expectations."""
    # Ensure all tables exist
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        # 1. Seed Users
        # u1: Maan Saab / Dr. Sharma (Coordinator)
        u1 = db.query(User).filter(User.id == "u1").first()
        if not u1:
            u1 = User(
                id="u1",
                email="coordinator@college.edu",
                password_hash=hash_password("Admin@2026"),
                name="Maan Saab",
                phone="+91 98765 00001",
                role="CLUB_COORDINATOR",
                is_active=True,
                status="active",
            )
            db.add(u1)

        # u5: Vikram Singh (General Student)
        u5 = db.query(User).filter(User.id == "u5").first()
        if not u5:
            u5 = User(
                id="u5",
                email="vikram.singh@college.edu",
                password_hash=hash_password("Password@2026"),
                name="Vikram Singh",
                phone="+91 98765 43210",
                role="GENERAL_STUDENT",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb",
                is_active=True,
                status="active",
            )
            db.add(u5)
            db.flush()

            # Seed Student Profile for u5
            sp5 = StudentProfile(
                user_id="u5",
                class_roll_no="CS24089",
                university_roll_no="2400100345",
                course="B.Tech",
                branch="Computer Science & Engineering",
                semester="4th Sem",
                academic_year="2nd Year",
                department="Computer Science & Engineering",
                admission_year=2024,
                graduating_year=2028,
                blood_group="B+",
                emergency_contact="+91 98111 22233",
                bio="2nd Year Computer Science undergraduate passionate about full-stack engineering and competitive programming.",
                github_url="https://github.com/vikram-singh",
                linkedin_url="https://linkedin.com/in/vikram-singh-dev",
                co_curricular_hours=16.0,
            )
            db.add(sp5)

            skills = ["JavaScript", "React", "Node.js", "Python", "Tailwind CSS", "Git & GitHub", "Data Structures"]
            for s in skills:
                db.add(StudentSkill(user_id="u5", skill_name=s))

            interests = ["Hackathons", "Web Development", "Robotics", "Public Speaking", "System Design"]
            for i in interests:
                db.add(StudentInterest(user_id="u5", interest_name=i))

        # u_admin: University Administrator
        u_admin = db.query(User).filter(User.email == "admin@college.edu").first()
        if not u_admin:
            u_admin = User(
                id="u_admin_001",
                email="admin@college.edu",
                password_hash=hash_password("Admin@2026"),
                name="University Administrator",
                phone="+91 98100 00000",
                role="ADMIN",
                is_active=True,
                status="active",
            )
            db.add(u_admin)

        # Additional benchmark student u6 & u7 for autocomplete search testing
        u6 = db.query(User).filter(User.id == "u6").first()
        if not u6:
            u6 = User(
                id="u6",
                email="ayush.sharma@college.edu",
                password_hash=hash_password("Password@2026"),
                name="Ayush Sharma",
                phone="+91 98111 22334",
                role="GENERAL_STUDENT",
                avatar_url="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
                is_active=True,
                status="active",
            )
            db.add(u6)
            db.flush()
            db.add(StudentProfile(
                user_id="u6",
                class_roll_no="CS24012",
                university_roll_no="2400100112",
                course="B.Tech",
                branch="Computer Science & Engineering",
                semester="4th Sem",
                academic_year="2nd Year",
                department="Computer Science & Engineering",
                admission_year=2024,
                graduating_year=2028,
            ))

        u7 = db.query(User).filter(User.id == "u7").first()
        if not u7:
            u7 = User(
                id="u7",
                email="priya.roy@college.edu",
                password_hash=hash_password("Password@2026"),
                name="Priya Roy",
                phone="+91 98222 33445",
                role="GENERAL_STUDENT",
                avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330",
                is_active=True,
                status="active",
            )
            db.add(u7)
            db.flush()
            db.add(StudentProfile(
                user_id="u7",
                class_roll_no="CS25034",
                university_roll_no="2400100456",
                course="B.Tech",
                branch="Computer Science & Engineering",
                semester="4th Sem",
                academic_year="2nd Year",
                department="Computer Science & Engineering",
                admission_year=2024,
                graduating_year=2028,
            ))

        db.flush()

        # 2. Seed Clubs (c1 Byte Warriors, c2 Robotics Society, c3 Literary Club, c4 E-Cell)
        c1 = db.query(Club).filter(Club.id == "c1").first()
        if not c1:
            c1 = Club(
                id="c1",
                club_code="BW-CSE-2026",
                name="Byte Warriors",
                category="Computer Science",
                department="Computer Science & Engineering",
                description="The official coding and technology club of the CSE Department.",
                about_mission="Byte Warriors is dedicated to fostering coding culture, open-source contribution, and competitive programming excellence.",
                faculty_advisor_name="Dr. Sharma",
                hod_name="Dr. V. K. Mathur",
                logo_url="https://api.dicebear.com/7.x/shapes/svg?seed=ByteWarriors",
                banner_url="https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
                email="bytewarriors@college.edu",
                phone="+91 98765 00001",
                website_url="https://bytewarriors.college.edu",
                founded_year=2021,
                approval_status="approved",
                status="ACTIVE",
            )
            db.add(c1)

        c2 = db.query(Club).filter(Club.id == "c2").first()
        if not c2:
            c2 = Club(
                id="c2",
                club_code="RS-ENG-2026",
                name="Robotics Society",
                category="Engineering",
                department="Mechanical & Electronics Engineering",
                description="Pioneering student innovation in autonomous robotics and IoT automation.",
                about_mission="Designing cutting-edge robots, participating in national challenges, and mentoring hardware enthusiasts.",
                faculty_advisor_name="Prof. Mehta",
                hod_name="Dr. K. S. Rao",
                logo_url="https://api.dicebear.com/7.x/shapes/svg?seed=Robotics",
                banner_url="https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
                approval_status="approved",
                status="ACTIVE",
            )
            db.add(c2)

        c3 = db.query(Club).filter(Club.id == "c3").first()
        if not c3:
            c3 = Club(
                id="c3",
                club_code="LC-ART-2026",
                name="Literary Club",
                category="Arts & Culture",
                department="Humanities & Applied Sciences",
                description="Campus forum for debate, literary writing, poetry, and public speaking.",
                about_mission="Encouraging articulate expression, elocution, and literary publications across the university.",
                faculty_advisor_name="Dr. Iyer",
                hod_name="Dr. M. Banerjee",
                logo_url="https://api.dicebear.com/7.x/shapes/svg?seed=Literary",
                banner_url="https://images.unsplash.com/photo-1457369804613-52c61a468e7d",
                approval_status="approved",
                status="ACTIVE",
            )
            db.add(c3)

        c4 = db.query(Club).filter(Club.id == "c4").first()
        if not c4:
            c4 = Club(
                id="c4",
                club_code="EC-ENT-2026",
                name="E-Cell",
                category="Entrepreneurship",
                department="Management Studies",
                description="Igniting student startup culture, venture incubation, and angel investment pitches.",
                about_mission="Empowering student founders with venture mentorship, pitching showcases, and investor networking.",
                faculty_advisor_name="Prof. Desai",
                hod_name="Dr. S. K. Gupta",
                logo_url="https://api.dicebear.com/7.x/shapes/svg?seed=ECell",
                banner_url="https://images.unsplash.com/photo-1559136555-9303baea8ebd",
                approval_status="approved",
                status="ACTIVE",
            )
            db.add(c4)

        # Seed Pending Club (c_pending) for Admin testing
        cp = db.query(Club).filter(Club.id == "c_pending").first()
        if not cp:
            cp = Club(
                id="c_pending",
                club_code="FINTECH-2026",
                name="FinTech & Blockchain Society",
                category="Finance & Technology",
                department="Management & Computer Applications",
                description="Pioneering student financial literacy, blockchain architectures, and quantitative trading.",
                about_mission="Advancing Web3 protocols, decentralized finance research, and algorithmic trading models.",
                faculty_advisor_name="Dr. Neha Verma",
                hod_name="Dr. V. K. Mathur",
                logo_url="https://api.dicebear.com/7.x/shapes/svg?seed=FinTech",
                banner_url="https://images.unsplash.com/photo-1639762681485-074b7f938ba0",
                email="fintech.society@college.edu",
                phone="+91 98101 23456",
                approval_status="requested",
                status="Requested",
            )
            db.add(cp)

        db.flush()

        # 3. Seed Memberships
        # u1 is Coordinator of c1
        m1 = db.query(ClubMembership).filter(ClubMembership.club_id == "c1", ClubMembership.user_id == "u1").first()
        if not m1:
            db.add(ClubMembership(
                club_id="c1",
                user_id="u1",
                role="COORDINATOR",
                designation="Head Student Coordinator",
                status="ACTIVE",
            ))

        # u7 is member of c1 (for testing teammate is club member restriction)
        m7 = db.query(ClubMembership).filter(ClubMembership.club_id == "c1", ClubMembership.user_id == "u7").first()
        if not m7:
            db.add(ClubMembership(
                club_id="c1",
                user_id="u7",
                role="MEMBER",
                designation="General Member",
                status="ACTIVE",
            ))

        # 4. Seed Events
        e1 = db.query(Event).filter(Event.id == "e1").first()
        if not e1:
            e1 = Event(
                id="e1",
                club_id="c1",
                title="Campus Hackathon 2026",
                category="Hackathon",
                stage="open",
                status="Open",
                event_date=date(2026, 10, 24),
                start_time="09:00 AM",
                end_time="05:00 PM",
                time_display="09:00 AM - 05:00 PM",
                venue="Main Auditorium & CS Labs",
                capacity=200,
                registered_count=1,
                turnout_count=0,
                description="Annual 24-hour hackathon with AI, Web3, and HealthTech tracks.",
                eligibility="All Students",
                image_url="https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
                restrict_club_members=True,
                is_team_event=True,
                min_team_size=2,
                max_team_size=4,
            )
            db.add(e1)
            db.flush()

            # Event rules
            db.add(EventRule(event_id="e1", rule_order=1, rule_text="Teams of 2-4 members allowed"))
            db.add(EventRule(event_id="e1", rule_order=2, rule_text="Bring verified college ID card"))
            db.add(EventRule(event_id="e1", rule_order=3, rule_text="Original code only; pre-built projects disqualified"))

        e2 = db.query(Event).filter(Event.id == "e2").first()
        if not e2:
            e2 = Event(
                id="e2",
                club_id="c1",
                title="Algorithm Arena 2025",
                category="Technical",
                stage="past",
                status="Past",
                event_date=date(2025, 11, 20),
                start_time="02:00 PM",
                end_time="06:00 PM",
                time_display="02:00 PM - 06:00 PM",
                venue="Seminar Hall A",
                capacity=120,
                registered_count=115,
                turnout_count=110,
                description="Competitive algorithmic contest covering advanced dynamic programming, trees, and graphs.",
                eligibility="CSE & IT Students",
                image_url="https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
                restrict_club_members=True,
                is_team_event=False,
            )
            db.add(e2)
            db.flush()

            # Winners
            db.add(EventWinner(
                event_id="e2",
                rank_position=1,
                rank_display="1st Place",
                winner_name="Siddharth Varma",
                branch="CSE 4th Year",
                prize="₹12,000 + Merit Medal",
                project_title="AI Diagnostics Engine",
            ))
            db.add(EventWinner(
                event_id="e2",
                rank_position=2,
                rank_display="2nd Place",
                winner_name="Megha Roy",
                branch="CSE 3rd Year",
                prize="₹8,000 + Merit Medal",
                project_title="Decentralized Micro-Grid",
            ))

            # Certificate for u5
            db.add(Certificate(
                id="cert_e2_u5",
                credential_id="UNIS-CERT-E2-2025-CS24089",
                event_id="e2",
                user_id="u5",
                type="COMPLETION",
                student_name="Vikram Singh",
                class_roll_no="CS24089",
                course_branch="B.Tech in Computer Science & Engineering",
                event_title="Algorithm Arena 2025",
                club_name="Byte Warriors",
                faculty_advisor_name="Dr. Sharma",
                hod_name="Dr. V. K. Mathur",
                issue_date=date(2025, 11, 20),
                naac_criterion="5.3",
                status="ISSUED",
            ))

        # 5. Seed Tasks for c1
        t1 = db.query(CoordinatorTask).filter(CoordinatorTask.id == "t1").first()
        if not t1:
            db.add(CoordinatorTask(
                id="t1",
                club_id="c1",
                title="Finalize Guest Speaker & Keynote Schedule",
                description="Confirm accommodation with campus hospitality lounge.",
                category="Technical",
                priority="High",
                assignee="Aarav Patel (Technical Lead)",
                due_date=date(2026, 10, 24),
                status="in_progress",
            ))
            db.add(CoordinatorTask(
                id="t2",
                club_id="c1",
                title="Arrange Refreshments for Judges",
                description="Finalize canteen meal coupons.",
                category="Logistics",
                priority="Low",
                assignee="Neha Gupta (Event Manager)",
                due_date=date(2026, 10, 28),
                status="pending",
            ))

        # 6. Seed Announcements for c1
        a1 = db.query(Announcement).filter(Announcement.id == "a1").first()
        if not a1:
            db.add(Announcement(
                id="a1",
                club_id="c1",
                title="Flagship Campus Hackathon 2026 Tracks Announced",
                content="The organizing committee has finalized the 4 tracks: AI & HealthTech, Web3, Smart Cities, and Open Innovation.",
                category="Event Alert",
                priority="High",
                audience="All Campus Students",
                author="Dr. Sharma (Faculty Advisor)",
                publish_date=date(2026, 10, 15),
                is_pinned=True,
            ))

        db.commit()
        print("Database seed completed successfully.")


if __name__ == "__main__":
    seed_database()
