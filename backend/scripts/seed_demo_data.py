"""
UniSphere Demo Data Seeder

This script populates the UniSphere platform with realistic mock data for demonstrations.
It creates demo students, clubs, memberships, events, announcements, tasks, certificates, and winners.

The script is idempotent: running it multiple times will reuse existing demo records.

Data is isolated using a @demo.unisphere.edu email domain and prefixed IDs.
"""

import uuid
import os
import random
import sys
from datetime import date, datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

# Ensure the backend package directory is on sys.path when running from scripts/
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.db.session import engine, SessionLocal
from app.db.base import Base
import app.models  # Load all SQLAlchemy models
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
from app.core.security import hash_password

# Demo configuration
DEMO_EMAIL_DOMAIN = "@demo.unisphere.edu"

# Prefix for demo IDs
ID_PREFIX = "demo"
DEMO_PASSWORD = "Demo@2026"


def generate_demo_email(username: str) -> str:
    """Generate a demo email address."""
    return f"{username}{DEMO_EMAIL_DOMAIN}"


def parse_time_str(time_str: str):
    """Parse a time string like '09:00 AM' into a datetime.time object."""
    try:
        return datetime.strptime(time_str, "%H:%M %p").time()
    except (ValueError, TypeError):
        return None


def create_or_get_user(db, user_id, email, name, phone, role, status_val="active", password=DEMO_PASSWORD):
    """Create a user or return existing one. Idempotent and safe for existing records."""
    user = db.query(User).filter(or_(User.id == user_id, User.email == email)).first()
    if user:
        # Check if this is an isolated demo user
        is_demo = user.email.endswith(DEMO_EMAIL_DOMAIN) or user.id.startswith(f"{ID_PREFIX}_")
        if is_demo:
            user.role = role
            user.status = status_val
            user.is_active = True
            db.flush()
        # Never mutate credentials or roles of existing non-demo users!
        return user, False  # False = not newly created

    user = User(
        id=user_id,
        email=email,
        password_hash=hash_password(password),
        name=name,
        role=role,
        is_active=True,
        status=status_val,
        created_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.flush()
    return user, True  # True = newly created


def create_or_get_student_profile(db, user_id, roll_no, univ_roll, course, branch, semester,
                                  academic_year, department, admission_year=2024, graduating_year=2028,
                                  bio="", github=None, linkedin=None, co_curricular_hours=16.0):
    """Create a student profile or return existing one."""
    profile = db.query(StudentProfile).filter(
        or_(StudentProfile.user_id == user_id, StudentProfile.university_roll_no == univ_roll)
    ).first()
    if profile:
        return profile, False
    profile = StudentProfile(
        user_id=user_id,
        class_roll_no=roll_no,
        university_roll_no=univ_roll,
        course=course,
        branch=branch,
        semester=semester,
        academic_year=academic_year,
        department=department,
        admission_year=admission_year,
        graduating_year=graduating_year,
        blood_group="B+" if user_id.endswith("3") else ("O+" if user_id.endswith("7") else "A+"),
        emergency_contact=f"+91 98111 {user_id[-4:]}",
        bio=bio,
        github_url=github,
        linkedin_url=linkedin,
        co_curricular_hours=co_curricular_hours,
        created_at=datetime.now(timezone.utc),
    )
    db.add(profile)
    db.flush()
    return profile, True


def seed_database():
    """Seed the database with realistic demo data for platform demonstrations."""
    # Ensure all tables exist
    Base.metadata.create_all(bind=engine)

    # Counters for summary
    created_counts = {}
    skipped_counts = {}

    def track_created(entity_type):
        created_counts[entity_type] = created_counts.get(entity_type, 0) + 1

    def track_skipped(entity_type):
        skipped_counts[entity_type] = skipped_counts.get(entity_type, 0) + 1

    with SessionLocal() as db:
        try:
            # ============================================================================
            # 1. SEED DEMO USERS (ADMIN, COORDINATORS, STUDENTS)
            # ============================================================================

            # Admin
            admin_email = generate_demo_email("admin")
            admin_user = db.query(User).filter(User.email == admin_email).first()
            if not admin_user:
                admin_user = User(
                    id=f"{ID_PREFIX}_ADMIN",
                    email=admin_email,
                    password_hash=hash_password("Admin@2026"),
                    name="Demo University Administrator",
                    phone="+91 98100 00000",
                    role="ADMIN",
                    is_active=True,
                    status="active",
                    created_at=datetime.now(timezone.utc),
                )
                db.add(admin_user)
                track_created("admin_users")
            else:
                track_skipped("admin_users")

            # Demo Coordinators (3)
            coordinators_defs = [
                {
                    "id": f"{ID_PREFIX}_C1",
                    "email": generate_demo_email("arjunmehta"),
                    "name": "Dr. Arjun Mehta",
                    "phone": "+91 98765 11111",
                },
                {
                    "id": f"{ID_PREFIX}_C2",
                    "email": generate_demo_email("nehakapoor"),
                    "name": "Dr. Neha Kapoor",
                    "phone": "+91 98765 22222",
                },
                {
                    "id": f"{ID_PREFIX}_C3",
                    "email": generate_demo_email("kunalverma"),
                    "name": "Dr. Kunal Verma",
                    "phone": "+91 98765 33333",
                },
            ]
            for cd in coordinators_defs:
                user, created = create_or_get_user(
                    db, cd["id"], cd["email"], cd["name"], cd["phone"],
                    role="CLUB_COORDINATOR", status_val="active",
                    password="Coordinator@2026"
                )
                if created:
                    track_created("coordinator_users")
                else:
                    track_skipped("coordinator_users")

            # Demo Students (40)
            student_names_first = [
                "Riya", "Karan", "Sneha", "Rohan", "Meera", "Aditya", "Simran", "Vivek",
                "Ananya", "Ravi", "Priya", "Amit", "Neha", "Saurabh", "Divya", "Manish",
                "Pooja", "Nikhil", "Tanvi", "Raj", "Sneha", "Karan", "Riya", "Vivek",
                "Ananya", "Ravi", "Simran", "Meera", "Aditya", "Priya", "Amit", "Neha",
                "Saurabh", "Divya", "Manish", "Pooja", "Nikhil", "Tanvi", "Raj",
            ]
            student_names_last = [
                "Sharma", "Verma", "Iyer", "Pillai", "Kapoor", "Patel", "Singh", "Kumar",
                "Das", "Roy", "Shah", "Joshi", "Mehta", "Kapadia", "Trivedi", "Gupta",
                "Reddy", "Chaudhary", "Thakur", "Yadav",
            ]
            branches = ["Computer Science", "Information Technology", "Electronics", "Mechanical",
                        "Computer Science", "Electronics"]
            courses = ["B.Tech", "B.Tech", "B.Tech", "B.Tech", "B.Sc", "M.Tech"]
            departments = [
                "Computer Science & Engineering",
                "Information Technology",
                "Electronics Engineering",
                "Mechanical Engineering",
                "Computer Science & Engineering",
                "Electronics Engineering",
            ]
            semesters = ["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem", "7th Sem", "8th Sem"]

            students_data = []
            for i in range(1, 41):
                student_id = f"{ID_PREFIX}_S{i:03d}"
                roll_no = f"CS24{i:03d}"
                univ_roll = f"240{i:06d}"

                first_name = student_names_first[(i - 1) % len(student_names_first)]
                last_name = student_names_last[(i - 1) % len(student_names_last)]
                name = f"{first_name} {last_name}"

                # Avoid name collisions by appending a suffix if needed
                branch_idx = (i - 1) % len(branches)
                course_idx = (i - 1) % len(courses)

                email = generate_demo_email(student_id.lower())

                user, created = create_or_get_user(
                    db, student_id, email, name, f"+91 98765 {i:04d}",
                    role="GENERAL_STUDENT", status_val="active",
                    password="Student@2026"
                )
                if created:
                    track_created("student_users")
                else:
                    track_skipped("student_users")

                # Create profile if missing
                profile, prof_created = create_or_get_student_profile(
                    db, student_id, roll_no, univ_roll,
                    courses[course_idx], branches[branch_idx],
                    semesters[(i - 1) % len(semesters)],
                    f"{(i % 3) + 1}st Year",
                    departments[branch_idx],
                    bio=f"{courses[course_idx]} student passionate about technology and innovation.",
                    github=f"https://github.com/{name.replace(' ', '-').lower()}",
                    linkedin=f"https://linkedin.com/in/{name.replace(' ', '-').lower()}",
                    co_curricular_hours=round(15.0 + (i % 5) * 2.5, 1),
                )

                # Add avatar
                if created:
                    user.avatar_url = f"https://api.dicebear.com/7.x/shapes/svg?seed={name.replace(' ', '')}"

                # Add skills and interests idempotently
                skills_pool = ["Python", "JavaScript", "React", "Node.js", "Data Structures",
                               "Algorithms", "Machine Learning", "Database Systems", "C++", "Java"]
                interests_pool = ["Hackathons", "Open Source", "Robotics", "Web Dev",
                                   "Competitive Programming", "AI/ML", "Photography", "Design"]
                for s in skills_pool[:3]:
                    existing_skill = db.query(StudentSkill).filter(
                        StudentSkill.user_id == student_id,
                        StudentSkill.skill_name == s
                    ).first()
                    if not existing_skill:
                        db.add(StudentSkill(user_id=student_id, skill_name=s))
                for int_name in interests_pool[:3]:
                    existing_int = db.query(StudentInterest).filter(
                        StudentInterest.user_id == student_id,
                        StudentInterest.interest_name == int_name
                    ).first()
                    if not existing_int:
                        db.add(StudentInterest(user_id=student_id, interest_name=int_name))

                students_data.append({
                    "id": student_id,
                    "email": email,
                    "name": name,
                    "branch": branches[branch_idx],
                    "course": courses[course_idx],
                    "roll_no": roll_no,
                    "univ_roll": univ_roll,
                })

            db.flush()

            # ============================================================================
            # 2. SEED DEMO CLUBS (10 clubs)
            # ============================================================================
            clubs_data = [
                {
                    "id": f"{ID_PREFIX}_AI",
                    "club_code": "AIML-2026",
                    "name": "AI & Machine Learning Club",
                    "category": "Artificial Intelligence",
                    "department": "Computer Science & Engineering",
                    "description": "Exploring artificial intelligence, machine learning, and neural networks to advance campus innovation.",
                    "about_mission": "We aim to democratize access to AI education and tools through workshops, projects, and research collaborations.",
                    "faculty_advisor": "Dr. Arjun Mehta",
                    "hod_name": "Dr. V. K. Mathur",
                    "approval_status": "approved",
                    "status": "ACTIVE",
                    "email": "ai.club@demo.unisphere.edu",
                    "phone": "+91 98765 11111",
                    "website_url": "https://demo.unisphere.edu/ai-club",
                    "coordinator_id": f"{ID_PREFIX}_C1",
                },
                {
                    "id": f"{ID_PREFIX}_WEB",
                    "club_code": "WEB-2026",
                    "name": "Web Development Club",
                    "category": "Web Development",
                    "department": "Computer Science & Engineering",
                    "description": "Advancing full-stack web development skills, modern frameworks, and industry-standard practices.",
                    "about_mission": "Building practical web applications and sharing knowledge about the latest web technologies and frameworks.",
                    "faculty_advisor": "Dr. Neha Kapoor",
                    "hod_name": "Dr. V. K. Mathur",
                    "approval_status": "approved",
                    "status": "ACTIVE",
                    "email": "web.club@demo.unisphere.edu",
                    "phone": "+91 98765 22222",
                    "website_url": "https://web.club.demo.unisphere.edu",
                    "coordinator_id": f"{ID_PREFIX}_C2",
                },
                {
                    "id": f"{ID_PREFIX}_CYBER",
                    "club_code": "CYBER-2026",
                    "name": "Cybersecurity Club",
                    "category": "Cybersecurity",
                    "department": "Computer Science & Engineering",
                    "description": "Enhancing campus security awareness through CTF competitions, workshops, and practical training.",
                    "about_mission": "Preparing students for cybersecurity challenges and industry certifications through hands-on experience.",
                    "faculty_advisor": "Dr. Rohan Pillai",
                    "hod_name": "Dr. V. K. Mathur",
                    "approval_status": "approved",
                    "status": "ACTIVE",
                    "email": "cyber.club@demo.unisphere.edu",
                    "phone": "+91 98765 44444",
                    "website_url": "https://cyber.club.demo.unisphere.edu",
                    "coordinator_id": f"{ID_PREFIX}_C1",
                },
                {
                    "id": f"{ID_PREFIX}_ROBOT",
                    "club_code": "ROBO-2026",
                    "name": "Robotics Club",
                    "category": "Robotics",
                    "department": "Mechanical & Electronics Engineering",
                    "description": "Building autonomous robots, participating in national challenges, and mentoring hardware enthusiasts.",
                    "about_mission": "Designing cutting-edge robots for competitions and real-world applications while fostering technical skills.",
                    "faculty_advisor": "Dr. Sneha Iyer",
                    "hod_name": "Dr. K. S. Rao",
                    "approval_status": "approved",
                    "status": "ACTIVE",
                    "email": "robotics.club@demo.unisphere.edu",
                    "phone": "+91 98765 55555",
                    "website_url": "https://robotics.club.demo.unisphere.edu",
                    "coordinator_id": f"{ID_PREFIX}_C2",
                },
                {
                    "id": f"{ID_PREFIX}_CP",
                    "club_code": "CP-2026",
                    "name": "Coding and Competitive Programming Club",
                    "category": "Competitive Programming",
                    "department": "Computer Science & Engineering",
                    "description": "Mastering algorithmic problem-solving and competitive programming techniques for tech interviews.",
                    "about_mission": "Building algorithmic thinking and problem-solving abilities through contests and practice.",
                    "faculty_advisor": "Dr. Vikram Aditya",
                    "hod_name": "Dr. V. K. Mathur",
                    "approval_status": "approved",
                    "status": "ACTIVE",
                    "email": "cp.club@demo.unisphere.edu",
                    "phone": "+91 98765 66666",
                    "website_url": "https://cp.club.demo.unisphere.edu",
                    "coordinator_id": f"{ID_PREFIX}_C3",
                },
                {
                    "id": f"{ID_PREFIX}_CULTURAL",
                    "club_code": "CULT-2026",
                    "name": "Cultural Society",
                    "category": "Culture & Arts",
                    "department": "Humanities & Applied Sciences",
                    "description": "Campus forum for debate, literary writing, poetry, cultural events, and artistic expression.",
                    "about_mission": "Encouraging articulate expression, elocution, literary publications, and cultural celebrations.",
                    "faculty_advisor": "Dr. Meera Nandan",
                    "hod_name": "Dr. M. Banerjee",
                    "approval_status": "approved",
                    "status": "ACTIVE",
                    "email": "cultural.society@demo.unisphere.edu",
                    "phone": "+91 98765 77777",
                    "website_url": "https://cultural.society.demo.unisphere.edu",
                    "coordinator_id": f"{ID_PREFIX}_C3",
                },
                {
                    "id": f"{ID_PREFIX}_ENTRE",
                    "club_code": "ENT-2026",
                    "name": "Entrepreneurship Club",
                    "category": "Entrepreneurship",
                    "department": "Management Studies",
                    "description": "Igniting student startup culture, venture incubation, and angel investment pitches.",
                    "about_mission": "Empowering student founders with venture mentorship and investor networking opportunities.",
                    "faculty_advisor": "Dr. Kunal Verma",
                    "hod_name": "Dr. S. K. Gupta",
                    "approval_status": "requested",
                    "status": "Requested",
                    "email": "entreclub@demo.unisphere.edu",
                    "phone": "+91 98765 88888",
                    "website_url": "https://entreclub.demo.unisphere.edu",
                    "coordinator_id": f"{ID_PREFIX}_C3",
                },
                {
                    "id": f"{ID_PREFIX}_PHOTO",
                    "club_code": "PHOTO-2026",
                    "name": "Photography Club",
                    "category": "Arts & Photography",
                    "department": "Humanities & Applied Sciences",
                    "description": "Exploring the art of photography through campus events and workshops.",
                    "about_mission": "Developing visual storytelling skills and creating a community of photography enthusiasts.",
                    "faculty_advisor": "Dr. Anita Sharma",
                    "hod_name": "Dr. M. Banerjee",
                    "approval_status": "approved",
                    "status": "ACTIVE",
                    "email": "photo.club@demo.unisphere.edu",
                    "phone": "+91 98765 99999",
                    "website_url": "https://photo.club.demo.unisphere.edu",
                    "coordinator_id": f"{ID_PREFIX}_C1",
                },
                {
                    "id": f"{ID_PREFIX}_ENV",
                    "club_code": "ENV-2026",
                    "name": "Environmental Awareness Club",
                    "category": "Environment",
                    "department": "Environmental Science",
                    "description": "Promoting sustainable practices and environmental consciousness on campus.",
                    "about_mission": "Creating awareness about environmental issues and organizing campus green initiatives.",
                    "faculty_advisor": "Dr. Sunita Rao",
                    "hod_name": "Dr. P. K. Singh",
                    "approval_status": "approved",
                    "status": "ACTIVE",
                    "email": "env.club@demo.unisphere.edu",
                    "phone": "+91 98765 00011",
                    "website_url": "https://env.club.demo.unisphere.edu",
                    "coordinator_id": f"{ID_PREFIX}_C2",
                },
                {
                    "id": f"{ID_PREFIX}_GAMEDEV",
                    "club_code": "GAME-2026",
                    "name": "Game Development Club",
                    "category": "Game Development",
                    "department": "Computer Science & Engineering",
                    "description": "Creating interactive games and learning game development technologies.",
                    "about_mission": "Building game development skills and creating engaging gaming experiences for the campus.",
                    "faculty_advisor": "Dr. Amit Jain",
                    "hod_name": "Dr. V. K. Mathur",
                    "approval_status": "approved",
                    "status": "ACTIVE",
                    "email": "gamedev.club@demo.unisphere.edu",
                    "phone": "+91 98765 00012",
                    "website_url": "https://gamedev.club.demo.unisphere.edu",
                    "coordinator_id": f"{ID_PREFIX}_C3",
                },
            ]

            for cd in clubs_data:
                club = db.query(Club).filter(or_(Club.id == cd["id"], Club.club_code == cd["club_code"])).first()
                if not club:
                    club = Club(
                        id=cd["id"],
                        club_code=cd["club_code"],
                        name=cd["name"],
                        category=cd["category"],
                        department=cd["department"],
                        description=cd["description"],
                        about_mission=cd["about_mission"],
                        faculty_advisor_name=cd["faculty_advisor"],
                        faculty_advisor_id=cd.get("coordinator_id"),
                        hod_name=cd["hod_name"],
                        logo_url=f"https://api.dicebear.com/7.x/shapes/svg?seed={cd['name'].replace(' ', '')}",
                        banner_url="https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
                        email=cd["email"],
                        phone=cd["phone"],
                        website_url=cd["website_url"],
                        instagram_url=f"https://instagram.com/{cd['name'].replace(' ', '').lower()}",
                        linkedin_url=f"https://linkedin.com/company/{cd['name'].replace(' ', '-').lower()}",
                        founded_year=2021,
                        approval_status=cd["approval_status"],
                        status="ACTIVE" if cd["approval_status"] == "approved" else "ACTIVE",
                        created_at=datetime.now(timezone.utc),
                    )
                    db.add(club)
                    track_created("clubs")
                else:
                    track_skipped("clubs")

            db.flush()

            # ============================================================================
            # 3. SEED CLUB MEMBERSHIPS (80-120 records)
            # ============================================================================
            all_clubs = db.query(Club).filter(Club.id.like(f"{ID_PREFIX}%")).order_by(Club.id).all()

            # Coordinators become COORDINATOR members of all their clubs
            for coord in coordinators_defs:
                assigned_clubs = [c for c in clubs_data if c.get("coordinator_id") == coord["id"]]
                for coord_club in assigned_clubs:
                    existing = db.query(ClubMembership).filter(
                        ClubMembership.club_id == coord_club["id"],
                        ClubMembership.user_id == coord["id"]
                    ).first()
                    if not existing:
                        db.add(ClubMembership(
                            club_id=coord_club["id"],
                            user_id=coord["id"],
                            role="COORDINATOR",
                            designation="Faculty Club Coordinator",
                            joined_date=date.today(),
                            status="ACTIVE",
                            created_at=datetime.now(timezone.utc),
                        ))
                        track_created("club_memberships")
                    else:
                        track_skipped("club_memberships")

            # Each student joins 2-4 clubs deterministically
            for s_num, student in enumerate(students_data, start=1):
                num_clubs = 2 + (s_num % 3)  # 2 to 4 clubs
                chosen_clubs = [all_clubs[(s_num + offset) % len(all_clubs)] for offset in range(num_clubs)]

                for club in chosen_clubs:
                    existing = db.query(ClubMembership).filter(
                        ClubMembership.club_id == club.id,
                        ClubMembership.user_id == student["id"]
                    ).first()
                    if existing:
                        track_skipped("club_memberships")
                        continue

                    # 15% core team deterministically
                    if (s_num * 7 + int(hash(club.id) % 100)) % 6 == 0:
                        role = "CORE_TEAM"
                        core_designations = ["Event Lead", "Tech Lead", "Outreach Lead", "Design Lead", "Content Lead"]
                        designation = core_designations[s_num % len(core_designations)]
                    else:
                        role = "MEMBER"
                        gen_designations = ["General Member", "Active Participant", "Volunteer"]
                        designation = gen_designations[s_num % len(gen_designations)]

                    db.add(ClubMembership(
                        club_id=club.id,
                        user_id=student["id"],
                        role=role,
                        designation=designation,
                        joined_date=date.today() - timedelta(days=(s_num * 3) % 90),
                        status="ACTIVE",
                        created_at=datetime.now(timezone.utc),
                    ))
                    track_created("club_memberships")

            db.flush()

            # ============================================================================
            # 4. SEED EVENTS (18 events covering all states)
            # ============================================================================
            events_data = [
                # AI & ML Club — upcoming, open, past
                {
                    "id": f"{ID_PREFIX}_E1",
                    "club_id": f"{ID_PREFIX}_AI",
                    "title": "Campus Hackathon 2026",
                    "category": "Hackathon",
                    "stage": "upcoming",
                    "status": "Open",
                    "event_date": date(2026, 10, 24),
                    "time_display": "09:00 AM - 05:00 PM",
                    "start_str": "09:00 AM",
                    "end_str": "05:00 PM",
                    "venue": "Main Auditorium & CS Labs",
                    "capacity": 200,
                    "description": "Annual 24-hour hackathon with AI, Web3, and HealthTech tracks.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
                    "restrict_club_members": False,
                    "is_team_event": True,
                    "min_team_size": 2,
                    "max_team_size": 4,
                },
                {
                    "id": f"{ID_PREFIX}_E2",
                    "club_id": f"{ID_PREFIX}_AI",
                    "title": "Algorithm Arena 2025",
                    "category": "Competition",
                    "stage": "past",
                    "status": "Past",
                    "event_date": date(2025, 11, 20),
                    "time_display": "02:00 PM - 06:00 PM",
                    "start_str": "02:00 PM",
                    "end_str": "06:00 PM",
                    "venue": "Seminar Hall A",
                    "capacity": 120,
                    "registered_count": 115,
                    "turnout_count": 110,
                    "description": "Competitive algorithmic contest covering advanced dynamic programming, trees, and graphs.",
                    "eligibility": "CSE & IT Students",
                    "image_url": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
                    "restrict_club_members": True,
                    "is_team_event": False,
                },
                {
                    "id": f"{ID_PREFIX}_E3",
                    "club_id": f"{ID_PREFIX}_AI",
                    "title": "Generative AI Workshop",
                    "category": "Workshop",
                    "stage": "upcoming",
                    "status": "Upcoming",
                    "event_date": date(2026, 10, 30),
                    "time_display": "10:00 AM - 01:00 PM",
                    "start_str": "10:00 AM",
                    "end_str": "01:00 PM",
                    "venue": "CS Lab 3",
                    "capacity": 30,
                    "description": "Hands-on workshop on large language models, prompt engineering, and AI safety.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-1677442136019-2931a0f974e5",
                    "restrict_club_members": False,
                    "is_team_event": False,
                },
                {
                    "id": f"{ID_PREFIX}_E4",
                    "club_id": f"{ID_PREFIX}_AI",
                    "title": "Deep Learning Summer School",
                    "category": "Workshop",
                    "stage": "past",
                    "status": "Past",
                    "event_date": date(2025, 7, 15),
                    "time_display": "09:00 AM - 04:00 PM",
                    "start_str": "09:00 AM",
                    "end_str": "04:00 PM",
                    "venue": "AI Research Center",
                    "capacity": 50,
                    "registered_count": 48,
                    "turnout_count": 45,
                    "description": "Intensive three-day workshop covering deep learning frameworks and applications.",
                    "eligibility": "CSE & IT Students",
                    "image_url": "https://images.unsplash.com/photo-1518770660439-c94235e2b4d4",
                    "restrict_club_members": False,
                    "is_team_event": False,
                },

                # Web Dev Club — hackathon, workshop, cancelled
                {
                    "id": f"{ID_PREFIX}_E5",
                    "club_id": f"{ID_PREFIX}_WEB",
                    "title": "Full-Stack Hackathon 2026",
                    "category": "Hackathon",
                    "stage": "open",
                    "status": "Open",
                    "event_date": date(2026, 11, 7),
                    "time_display": "08:00 AM - 08:00 PM",
                    "start_str": "08:00 AM",
                    "end_str": "08:00 PM",
                    "venue": "Innovation Center",
                    "capacity": 150,
                    "description": "48-hour web development marathon building full-stack applications.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-1555949963-ff9fe0c870da",
                    "restrict_club_members": False,
                    "is_team_event": True,
                    "min_team_size": 3,
                    "max_team_size": 5,
                },
                {
                    "id": f"{ID_PREFIX}_E6",
                    "club_id": f"{ID_PREFIX}_WEB",
                    "title": "Modern CSS Workshop",
                    "category": "Workshop",
                    "stage": "upcoming",
                    "status": "Upcoming",
                    "event_date": date(2026, 10, 28),
                    "time_display": "02:00 PM - 05:00 PM",
                    "start_str": "02:00 PM",
                    "end_str": "05:00 PM",
                    "venue": "CS Lab 1",
                    "capacity": 25,
                    "description": "Advanced CSS3 techniques, animations, responsive design, and modern layout frameworks.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-1558655146-d09347b6b1c6",
                    "restrict_club_members": False,
                    "is_team_event": False,
                },
                {
                    "id": f"{ID_PREFIX}_E7",
                    "club_id": f"{ID_PREFIX}_WEB",
                    "title": "React Hooks Deep Dive",
                    "category": "Workshop",
                    "stage": "past",
                    "status": "Past",
                    "event_date": date(2026, 9, 10),
                    "time_display": "03:00 PM - 06:00 PM",
                    "start_str": "03:00 PM",
                    "end_str": "06:00 PM",
                    "venue": "Online (Zoom)",
                    "capacity": 30,
                    "registered_count": 28,
                    "turnout_count": 26,
                    "description": "Deep dive into React Hooks, context API, and state management patterns.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-1522199670076-2b9e6e9e1e73",
                    "restrict_club_members": False,
                    "is_team_event": False,
                },
                {
                    "id": f"{ID_PREFIX}_E8",
                    "club_id": f"{ID_PREFIX}_WEB",
                    "title": "Web Accessibility Bootcamp (Cancelled)",
                    "category": "Workshop",
                    "stage": "cancelled",
                    "status": "Cancelled",
                    "event_date": date(2026, 11, 12),
                    "time_display": "10:00 AM - 01:00 PM",
                    "start_str": "10:00 AM",
                    "end_str": "01:00 PM",
                    "venue": "CS Lab 1",
                    "capacity": 30,
                    "description": "This workshop has been cancelled due to unforeseen circumstances.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-1508606572321-901ea5d65a56",
                    "restrict_club_members": False,
                    "is_team_event": False,
                },

                # Cybersecurity Club — competition, seminar, cancelled
                {
                    "id": f"{ID_PREFIX}_E9",
                    "club_id": f"{ID_PREFIX}_CYBER",
                    "title": "CTF Cybersecurity Challenge",
                    "category": "Competition",
                    "stage": "open",
                    "status": "Open",
                    "event_date": date(2026, 11, 5),
                    "time_display": "09:00 AM - 05:00 PM",
                    "start_str": "09:00 AM",
                    "end_str": "05:00 PM",
                    "venue": "Computer Security Lab",
                    "capacity": 40,
                    "description": "Capture The Flag cybersecurity competition with multiple challenges.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-1614728263123-4c7e3c2b2c3c",
                    "restrict_club_members": False,
                    "is_team_event": True,
                    "min_team_size": 1,
                    "max_team_size": 3,
                },
                {
                    "id": f"{ID_PREFIX}_E10",
                    "club_id": f"{ID_PREFIX}_CYBER",
                    "title": "Ethical Hacking Seminar",
                    "category": "Seminar",
                    "stage": "upcoming",
                    "status": "Upcoming",
                    "event_date": date(2026, 11, 10),
                    "time_display": "11:00 AM - 01:00 PM",
                    "start_str": "11:00 AM",
                    "end_str": "01:00 PM",
                    "venue": "Seminar Hall B",
                    "capacity": 50,
                    "description": "Seminar on ethical hacking techniques, penetration testing, and security auditing.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-1505336534512-65dcffeb351d",
                    "restrict_club_members": False,
                    "is_team_event": False,
                },
                {
                    "id": f"{ID_PREFIX}_E11",
                    "club_id": f"{ID_PREFIX}_CYBER",
                    "title": "Cybersecurity Quiz (Cancelled)",
                    "category": "Competition",
                    "stage": "cancelled",
                    "status": "Cancelled",
                    "event_date": date(2026, 11, 18),
                    "time_display": "02:00 PM - 04:00 PM",
                    "start_str": "02:00 PM",
                    "end_str": "04:00 PM",
                    "venue": "Online (Google Meet)",
                    "capacity": 100,
                    "description": "Online cybersecurity quiz competition has been cancelled.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-1563981838572-2d51b7e1f709",
                    "restrict_club_members": False,
                    "is_team_event": False,
                },

                # Robotics Club — competition, workshop, past
                {
                    "id": f"{ID_PREFIX}_E12",
                    "club_id": f"{ID_PREFIX}_ROBOT",
                    "title": "Robotics Buildathon",
                    "category": "Competition",
                    "stage": "upcoming",
                    "status": "Open",
                    "event_date": date(2026, 11, 8),
                    "time_display": "09:00 AM - 05:00 PM",
                    "start_str": "09:00 AM",
                    "end_str": "05:00 PM",
                    "venue": "Robotics Lab",
                    "capacity": 60,
                    "description": "Build and program robots for various challenges and tasks.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-1581264336207-01e7b75d2f41",
                    "restrict_club_members": False,
                    "is_team_event": True,
                    "min_team_size": 2,
                    "max_team_size": 4,
                },
                {
                    "id": f"{ID_PREFIX}_E13",
                    "club_id": f"{ID_PREFIX}_ROBOT",
                    "title": "Introduction to ROS Workshop",
                    "category": "Workshop",
                    "stage": "upcoming",
                    "status": "Upcoming",
                    "event_date": date(2026, 11, 16),
                    "time_display": "02:00 PM - 05:00 PM",
                    "start_str": "02:00 PM",
                    "end_str": "05:00 PM",
                    "venue": "Robotics Lab",
                    "capacity": 25,
                    "description": "Introduction to Robot Operating System (ROS) and autonomous navigation.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-1560199575-928117c34e3d",
                    "restrict_club_members": False,
                    "is_team_event": False,
                },
                {
                    "id": f"{ID_PREFIX}_E14",
                    "club_id": f"{ID_PREFIX}_ROBOT",
                    "title": "Line Follower Challenge",
                    "category": "Competition",
                    "stage": "past",
                    "status": "Past",
                    "event_date": date(2026, 8, 20),
                    "time_display": "10:00 AM - 02:00 PM",
                    "start_str": "10:00 AM",
                    "end_str": "02:00 PM",
                    "venue": "Makerspace",
                    "capacity": 30,
                    "registered_count": 28,
                    "turnout_count": 25,
                    "description": "Annual robotics line-follower competition with cash prizes.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-151968139-010223930362",
                    "restrict_club_members": False,
                    "is_team_event": False,
                },

                # CP Club — competition, workshop, past
                {
                    "id": f"{ID_PREFIX}_E15",
                    "club_id": f"{ID_PREFIX}_CP",
                    "title": "Algorithmic Coding Contest",
                    "category": "Competition",
                    "stage": "open",
                    "status": "Open",
                    "event_date": date(2026, 11, 1),
                    "time_display": "10:00 AM - 02:00 PM",
                    "start_str": "10:00 AM",
                    "end_str": "02:00 PM",
                    "venue": "Seminar Hall C",
                    "capacity": 80,
                    "description": "Regional-level algorithmic problem-solving contest.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-1516321318840-05f5113071e4",
                    "restrict_club_members": False,
                    "is_team_event": False,
                },
                {
                    "id": f"{ID_PREFIX}_E16",
                    "club_id": f"{ID_PREFIX}_CP",
                    "title": "Graph Theory Masterclass",
                    "category": "Workshop",
                    "stage": "upcoming",
                    "status": "Upcoming",
                    "event_date": date(2026, 11, 12),
                    "time_display": "02:00 PM - 04:00 PM",
                    "start_str": "02:00 PM",
                    "end_str": "04:00 PM",
                    "venue": "CS Lab 2",
                    "capacity": 35,
                    "description": "In-depth workshop on graph algorithms and their applications.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-1516321318840-05f5113071e4",
                    "restrict_club_members": False,
                    "is_team_event": False,
                },
                {
                    "id": f"{ID_PREFIX}_E17",
                    "club_id": f"{ID_PREFIX}_CP",
                    "title": "CodeSprint Monthly Challenge",
                    "category": "Competition",
                    "stage": "past",
                    "status": "Past",
                    "event_date": date(2026, 6, 15),
                    "time_display": "11:00 AM - 03:00 PM",
                    "start_str": "11:00 AM",
                    "end_str": "03:00 PM",
                    "venue": "Seminar Hall C",
                    "capacity": 100,
                    "registered_count": 95,
                    "turnout_count": 90,
                    "description": "Monthly coding sprint focusing on dynamic programming and greedy algorithms.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-1516321318840-05f5113071e4",
                    "restrict_club_members": True,
                    "is_team_event": False,
                },

                # Cultural Club — festival, workshop, past
                {
                    "id": f"{ID_PREFIX}_E18",
                    "club_id": f"{ID_PREFIX}_CULTURAL",
                    "title": "Cultural Fest 2026",
                    "category": "Festival",
                    "stage": "upcoming",
                    "status": "Open",
                    "event_date": date(2026, 11, 15),
                    "time_display": "09:00 AM - 06:00 PM",
                    "start_str": "09:00 AM",
                    "end_str": "06:00 PM",
                    "venue": "Main Ground",
                    "capacity": 300,
                    "description": "Annual cultural festival with dance, music, drama, and art performances.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-1493225457280-7e5c7c6b1c6c",
                    "restrict_club_members": False,
                    "is_team_event": False,
                },
                {
                    "id": f"{ID_PREFIX}_E19",
                    "club_id": f"{ID_PREFIX}_CULTURAL",
                    "title": "Dance Workshop",
                    "category": "Workshop",
                    "stage": "upcoming",
                    "status": "Upcoming",
                    "event_date": date(2026, 11, 18),
                    "time_display": "03:00 PM - 05:00 PM",
                    "start_str": "03:00 PM",
                    "end_str": "05:00 PM",
                    "venue": "Dance Studio",
                    "capacity": 20,
                    "description": "Traditional and contemporary dance workshop for all skill levels.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-1517558937187-45c9d3a8e43c",
                    "restrict_club_members": False,
                    "is_team_event": False,
                },
                {
                    "id": f"{ID_PREFIX}_E20",
                    "club_id": f"{ID_PREFIX}_CULTURAL",
                    "title": "Annual Drama Festival",
                    "category": "Festival",
                    "stage": "past",
                    "status": "Past",
                    "event_date": date(2026, 4, 10),
                    "time_display": "06:00 PM - 09:00 PM",
                    "start_str": "06:00 PM",
                    "end_str": "09:00 PM",
                    "venue": "Main Auditorium",
                    "capacity": 250,
                    "registered_count": 230,
                    "turnout_count": 225,
                    "description": "Annual drama festival featuring student productions across multiple genres.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-1507833743816-284528a02afc",
                    "restrict_club_members": False,
                    "is_team_event": False,
                },

                # Photography Club — event
                {
                    "id": f"{ID_PREFIX}_E21",
                    "club_id": f"{ID_PREFIX}_PHOTO",
                    "title": "Photography Walk",
                    "category": "Event",
                    "stage": "upcoming",
                    "status": "Upcoming",
                    "event_date": date(2026, 10, 26),
                    "time_display": "06:00 PM - 08:00 PM",
                    "start_str": "06:00 PM",
                    "end_str": "08:00 PM",
                    "venue": "Campus Lake",
                    "capacity": 15,
                    "description": "Photography walk around campus with expert guidance.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-1501785888041-af3ef17a5a8c",
                    "restrict_club_members": False,
                    "is_team_event": False,
                },

                # Environmental Club — activity
                {
                    "id": f"{ID_PREFIX}_E22",
                    "club_id": f"{ID_PREFIX}_ENV",
                    "title": "Campus Tree Plantation",
                    "category": "Activity",
                    "stage": "upcoming",
                    "status": "Open",
                    "event_date": date(2026, 10, 27),
                    "time_display": "09:00 AM - 12:00 PM",
                    "start_str": "09:00 AM",
                    "end_str": "12:00 PM",
                    "venue": "College Main Garden",
                    "capacity": 50,
                    "description": "Campus tree plantation drive to promote environmental awareness.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-1542601906399-0b3b8b9c8b8c",
                    "restrict_club_members": False,
                    "is_team_event": False,
                },

                # GameDev Club — game jam
                {
                    "id": f"{ID_PREFIX}_E23",
                    "club_id": f"{ID_PREFIX}_GAMEDEV",
                    "title": "Game Jam 2026",
                    "category": "Competition",
                    "stage": "upcoming",
                    "status": "Upcoming",
                    "event_date": date(2026, 11, 14),
                    "time_display": "10:00 AM - 10:00 PM",
                    "start_str": "10:00 AM",
                    "end_str": "10:00 PM",
                    "venue": "Computer Lab",
                    "capacity": 30,
                    "description": "48-hour game development jam creating innovative games.",
                    "eligibility": "All Students",
                    "image_url": "https://images.unsplash.com/photo-1493711328938-a61ba6a39c5d",
                    "restrict_club_members": False,
                    "is_team_event": True,
                    "min_team_size": 2,
                    "max_team_size": 4,
                },
            ]

            for ed in events_data:
                event = db.query(Event).filter(Event.id == ed["id"]).first()
                if not event:
                    event = Event(
                        id=ed["id"],
                        club_id=ed["club_id"],
                        title=ed["title"],
                        category=ed["category"],
                        stage=ed["stage"],
                        status=ed["status"],
                        restrict_club_members=ed.get("restrict_club_members", False),
                        is_team_event=ed.get("is_team_event", False),
                        min_team_size=ed.get("min_team_size", 1),
                        max_team_size=ed.get("max_team_size", 4),
                        event_date=ed["event_date"],
                        start_time=datetime.combine(ed["event_date"], parse_time_str(ed["start_str"])) if ed.get("start_str") else None,
                        end_time=datetime.combine(ed["event_date"], parse_time_str(ed["end_str"])) if ed.get("end_str") else None,
                        time_display=ed.get("time_display", "09:00 AM - 05:00 PM"),
                        venue=ed["venue"],
                        venue_room=ed.get("venue_room"),
                        capacity=ed.get("capacity", 100),
                        registered_count=ed.get("registered_count", 0),
                        turnout_count=ed.get("turnout_count", 0),
                        description=ed["description"],
                        eligibility=ed.get("eligibility", "All Students"),
                        image_url=ed["image_url"],
                        registration_opens_at=ed.get("registration_opens_at"),
                        registration_closes_at=ed.get("registration_closes_at"),
                        created_by=f"{ID_PREFIX}_C1" if ed["club_id"] == f"{ID_PREFIX}_AI" else f"{ID_PREFIX}_C2",
                        created_at=datetime.now(timezone.utc),
                    )
                    db.add(event)
                    track_created("events")
                else:
                    track_skipped("events")

            db.flush()

            # 5. Seed Event Rules for events that need them
            for event_id in [f"{ID_PREFIX}_E1", f"{ID_PREFIX}_E2", f"{ID_PREFIX}_E5", f"{ID_PREFIX}_E9", f"{ID_PREFIX}_E12", f"{ID_PREFIX}_E15", f"{ID_PREFIX}_E18"]:
                event = db.query(Event).filter(Event.id == event_id).first()
                if event:
                    rules = [
                        "Teams of 2-4 members allowed" if event.is_team_event else "Individual participation only",
                        "Bring verified college ID card",
                        "Original code only; pre-built projects disqualified"
                    ]
                    for idx, rule_text in enumerate(rules, start=1):
                        rule = db.query(EventRule).filter(EventRule.event_id == event_id, EventRule.rule_order == idx).first()
                        if not rule:
                            rule = EventRule(
                                event_id=event_id,
                                rule_order=idx,
                                rule_text=rule_text,
                            )
                            db.add(rule)
                            track_created("event_rules")
                        else:
                            track_skipped("event_rules")

            db.flush()

            # 6. Seed Event Registrations
            # Only register genuine student users (GENERAL_STUDENT)
            demo_students = [s for s in students_data]

            for ed in events_data:
                event_id = ed["id"]
                event = db.query(Event).filter(Event.id == event_id).first()
                if not event:
                    continue

                if event.stage == "past":
                    target_registrations = min(25, event.capacity)
                elif event.stage in ("open", "upcoming"):
                    target_registrations = min(12, event.capacity // 2)
                else:
                    target_registrations = min(5, event.capacity // 5)

                # Filter students: skip club members if restrict_club_members is True
                eligible_students = []
                for student in demo_students:
                    membership = db.query(ClubMembership).filter(
                        ClubMembership.club_id == event.club_id,
                        ClubMembership.user_id == student["id"],
                        ClubMembership.status == "ACTIVE"
                    ).first()
                    if event.restrict_club_members and membership:
                        continue
                    eligible_students.append(student)

                # Register eligible students deterministically
                for reg_idx, student in enumerate(eligible_students[:target_registrations]):
                    existing_reg = db.query(EventRegistration).filter(
                        EventRegistration.event_id == event_id,
                        EventRegistration.user_id == student["id"]
                    ).first()
                    if existing_reg:
                        track_skipped("event_registrations")
                        continue

                    roll_no = student["roll_no"]
                    pass_code = f"PASS-{event_id.replace('demo_', '').upper()}-2026-{roll_no}"

                    reg_status = "CONFIRMED"
                    checked_in_time = None
                    if event.stage == "past":
                        reg_status = "CHECKED_IN"
                        checked_in_time = datetime.combine(event.event_date, parse_time_str(ed.get("start_str", "09:00 AM")) or datetime.min.time())

                    registration = EventRegistration(
                        pass_code=pass_code,
                        event_id=event_id,
                        user_id=student["id"],
                        is_team_lead=False,
                        status=reg_status,
                        checked_in_at=checked_in_time,
                        registered_at=datetime.now(timezone.utc),
                    )
                    db.add(registration)
                    track_created("event_registrations")

                db.flush()

                # Update registered and turnout counts
                actual_count = db.query(func.count(EventRegistration.id)).filter(
                    EventRegistration.event_id == event_id,
                    EventRegistration.status != "CANCELLED"
                ).scalar() or 0
                event.registered_count = actual_count

                if event.stage == "past":
                    checked_in_count = db.query(func.count(EventRegistration.id)).filter(
                        EventRegistration.event_id == event_id,
                        EventRegistration.status == "CHECKED_IN"
                    ).scalar() or 0
                    event.turnout_count = checked_in_count

            db.flush()

            # 7. Seed Event Teams for team events
            team_event_ids = [e["id"] for e in events_data if e.get("is_team_event") and e.get("stage") != "cancelled"]
            for event_id in team_event_ids:
                event = db.query(Event).filter(Event.id == event_id).first()
                if not event or not event.is_team_event:
                    continue

                # Eligible students for this club's event
                all_eligible = []
                for s in students_data:
                    membership = db.query(ClubMembership).filter(
                        ClubMembership.club_id == event.club_id,
                        ClubMembership.user_id == s["id"],
                        ClubMembership.status == "ACTIVE"
                    ).first()
                    if not (event.restrict_club_members and membership):
                        all_eligible.append(s)

                if len(all_eligible) < 6:
                    continue

                # Create 2 teams per team event with distinct team leads and members
                for team_idx in range(1, 3):
                    team_name = f"Team Alpha {team_idx}" if team_idx == 1 else f"Team Beta {team_idx}"
                    lead_student = all_eligible[(team_idx * 4) % len(all_eligible)]
                    team_pass = f"TEAM-{event_id.replace('demo_', '').upper()}-T{team_idx}-2026"

                    existing_team = db.query(EventTeam).filter(
                        EventTeam.event_id == event_id,
                        EventTeam.team_name == team_name
                    ).first()

                    if not existing_team:
                        team = EventTeam(
                            event_id=event_id,
                            team_name=team_name,
                            team_lead_user_id=lead_student["id"],
                            pass_code=team_pass,
                            status="CONFIRMED",
                            created_at=datetime.now(timezone.utc),
                        )
                        db.add(team)
                        db.flush()
                        track_created("event_teams")
                    else:
                        team = existing_team
                        track_skipped("event_teams")

                    # Team lead in EventTeamMember
                    lead_tm = db.query(EventTeamMember).filter(
                        EventTeamMember.team_id == team.id,
                        EventTeamMember.user_id == lead_student["id"]
                    ).first()
                    if not lead_tm:
                        db.add(EventTeamMember(
                            team_id=team.id,
                            user_id=lead_student["id"],
                            role="LEAD",
                            joined_at=datetime.now(timezone.utc),
                        ))

                    # Team lead in EventRegistration
                    lead_reg = db.query(EventRegistration).filter(
                        EventRegistration.event_id == event_id,
                        EventRegistration.user_id == lead_student["id"]
                    ).first()
                    if not lead_reg:
                        roll_no = lead_student["roll_no"]
                        lead_reg = EventRegistration(
                            pass_code=f"PASS-{event_id.replace('demo_', '').upper()}-2026-{roll_no}-TL",
                            event_id=event_id,
                            user_id=lead_student["id"],
                            team_id=team.id,
                            is_team_lead=True,
                            status="CONFIRMED",
                            registered_at=datetime.now(timezone.utc),
                        )
                        db.add(lead_reg)
                    else:
                        lead_reg.team_id = team.id
                        lead_reg.is_team_lead = True

                    # Teammates (2 teammates)
                    teammate_pool = [s for s in all_eligible if s["id"] != lead_student["id"]]
                    teammates = [
                        teammate_pool[(team_idx * 4 + 1) % len(teammate_pool)],
                        teammate_pool[(team_idx * 4 + 2) % len(teammate_pool)],
                    ]

                    for tm in teammates:
                        # EventRegistration for teammate
                        tm_reg = db.query(EventRegistration).filter(
                            EventRegistration.event_id == event_id,
                            EventRegistration.user_id == tm["id"]
                        ).first()
                        if not tm_reg:
                            roll_no = tm["roll_no"]
                            tm_reg = EventRegistration(
                                pass_code=f"PASS-{event_id.replace('demo_', '').upper()}-2026-{roll_no}-TM{team_idx}",
                                event_id=event_id,
                                user_id=tm["id"],
                                team_id=team.id,
                                is_team_lead=False,
                                status="CONFIRMED",
                                registered_at=datetime.now(timezone.utc),
                            )
                            db.add(tm_reg)
                        else:
                            tm_reg.team_id = team.id

                        # Team member
                        existing_tm = db.query(EventTeamMember).filter(
                            EventTeamMember.team_id == team.id,
                            EventTeamMember.user_id == tm["id"]
                        ).first()
                        if not existing_tm:
                            db.add(EventTeamMember(
                                team_id=team.id,
                                user_id=tm["id"],
                                role="MEMBER",
                                joined_at=datetime.now(timezone.utc),
                            ))

                # Update registered_count
                event.registered_count = (db.query(func.count(EventRegistration.id)).filter(
                    EventRegistration.event_id == event_id,
                    EventRegistration.status != "CANCELLED"
                ).scalar() or 0)

            db.flush()

            # 8. Seed Event Winners and Certificates for past events
            past_events = [e for e in events_data if e["stage"] == "past"]
            for ed in past_events:
                event_id = ed["id"]
                event = db.query(Event).filter(Event.id == event_id).first()
                if not event:
                    continue

                # Create winners
                winners_defs = [
                    {"rank": 1, "display": "1st Place", "default_name": "Siddharth Varma",
                     "user_id": f"{ID_PREFIX}_S003", "branch": "CSE 4th Year",
                     "prize": "₹12,000 + Merit Medal", "project": "AI Diagnostics Engine"},
                    {"rank": 2, "display": "2nd Place", "default_name": "Megha Roy",
                     "user_id": f"{ID_PREFIX}_S011", "branch": "CSE 3rd Year",
                     "prize": "₹8,000 + Merit Medal", "project": "Decentralized Micro-Grid"},
                    {"rank": 3, "display": "3rd Place", "default_name": "Ravi Sharma",
                     "user_id": f"{ID_PREFIX}_S007", "branch": "ECE 4th Year",
                     "prize": "₹5,000 Certificate", "project": "Smart Home Automation"},
                ]

                for wd in winners_defs:
                    existing = db.query(EventWinner).filter(
                        EventWinner.event_id == event_id,
                        EventWinner.rank_position == wd["rank"]
                    ).first()
                    if not existing:
                        winner_user = db.query(User).filter(User.id == wd["user_id"]).first()
                        w_name = winner_user.name if winner_user else wd["default_name"]
                        db.add(EventWinner(
                            event_id=event_id,
                            rank_position=wd["rank"],
                            rank_display=wd["display"],
                            winner_name=w_name,
                            user_id=wd["user_id"],
                            branch=wd["branch"],
                            prize=wd["prize"],
                            project_title=wd["project"],
                            declared_at=datetime.now(timezone.utc),
                        ))
                        track_created("event_winners")
                    else:
                        track_skipped("event_winners")

                # Create certificates for participants of this past event
                registrations = db.query(EventRegistration).filter(
                    EventRegistration.event_id == event_id,
                    EventRegistration.status == "CHECKED_IN"
                ).all()

                for reg in registrations:
                    cert_id = f"cert_{event_id}_{reg.user_id}"
                    cred_id = f"UNIS-CERT-{event_id.replace(ID_PREFIX + '_', '').upper()}-2025-{reg.user_id.replace(ID_PREFIX + '_', '').upper()}"
                    existing_cert = db.query(Certificate).filter(
                        or_(Certificate.id == cert_id, Certificate.credential_id == cred_id)
                    ).first()
                    if not existing_cert:
                        user = db.query(User).filter(User.id == reg.user_id).first()
                        profile = db.query(StudentProfile).filter(StudentProfile.user_id == reg.user_id).first()
                        club = db.query(Club).filter(Club.id == event.club_id).first()

                        cert = Certificate(
                            id=cert_id,
                            credential_id=cred_id,
                            event_id=event_id,
                            user_id=reg.user_id,
                            type="COMPLETION",
                            student_name=user.name if user else "Demo Student",
                            class_roll_no=profile.class_roll_no if profile else "CS24089",
                            course_branch=f"{profile.course} in {profile.branch}" if profile else "B.Tech in CSE",
                            event_title=event.title,
                            club_name=club.name if club else "Demo Club",
                            faculty_advisor_name=club.faculty_advisor_name if club else "Dr. Sharma",
                            hod_name=club.hod_name if club else "Dr. V. K. Mathur",
                            issue_date=event.event_date,
                            naac_criterion="5.3",
                            status="ISSUED",
                            created_at=datetime.now(timezone.utc),
                        )
                        db.add(cert)
                        track_created("certificates")
                    else:
                        track_skipped("certificates")

            db.flush()

            # 9. Seed Coordinator Tasks (15 tasks across clubs)
            tasks_data = [
                {"id": f"{ID_PREFIX}_T1", "club_id": f"{ID_PREFIX}_AI", "title": "Finalize Guest Speaker Schedule",
                 "description": "Confirm keynote speakers and panelists for the hackathon.",
                 "category": "Technical", "priority": "High", "assignee": "Aarav Patel",
                 "due_date": date(2026, 10, 22), "status": "in_progress", "created_by": f"{ID_PREFIX}_C1"},
                {"id": f"{ID_PREFIX}_T2", "club_id": f"{ID_PREFIX}_AI", "title": "Arrange Refreshments",
                 "description": "Finalize canteen meal coupons for judges and volunteers.",
                 "category": "Logistics", "priority": "Low", "assignee": "Neha Gupta",
                 "due_date": date(2026, 10, 26), "status": "pending", "created_by": f"{ID_PREFIX}_C1"},
                {"id": f"{ID_PREFIX}_T3", "club_id": f"{ID_PREFIX}_AI", "title": "Set Up Live Streaming",
                 "description": "Configure YouTube/Twitch stream for hackathon demos.",
                 "category": "Technical", "priority": "High", "assignee": "Rohan Mehta",
                 "due_date": date(2026, 10, 23), "status": "completed", "created_by": f"{ID_PREFIX}_C1"},
                {"id": f"{ID_PREFIX}_T4", "club_id": f"{ID_PREFIX}_WEB", "title": "Configure Registration Portal",
                 "description": "Set up hackathon registration forms and payment gateway.",
                 "category": "Technical", "priority": "High", "assignee": "Vikram Singh",
                 "due_date": date(2026, 11, 4), "status": "in_progress", "created_by": f"{ID_PREFIX}_C2"},
                {"id": f"{ID_PREFIX}_T5", "club_id": f"{ID_PREFIX}_WEB", "title": "Recruit Hackathon Judges",
                 "description": "Find and onboard industry judges for the hackathon.",
                 "category": "Logistics", "priority": "Medium", "assignee": "Meera Nandan",
                 "due_date": date(2026, 11, 4), "status": "pending", "created_by": f"{ID_PREFIX}_C2"},
                {"id": f"{ID_PREFIX}_T6", "club_id": f"{ID_PREFIX}_WEB", "title": "Prepare Participant Swag",
                 "description": "Order and pack participant welcome kits and swag bags.",
                 "category": "Logistics", "priority": "Low", "assignee": "Priya Desai",
                 "due_date": date(2026, 11, 5), "status": "pending", "created_by": f"{ID_PREFIX}_C2"},
                {"id": f"{ID_PREFIX}_T7", "club_id": f"{ID_PREFIX}_CYBER", "title": "Prepare CTF Challenge Servers",
                 "description": "Deploy and configure CTF challenge servers with Docker.",
                 "category": "Technical", "priority": "High", "assignee": "Rohit Bansal",
                 "due_date": date(2026, 11, 3), "status": "in_progress", "created_by": f"{ID_PREFIX}_C1"},
                {"id": f"{ID_PREFIX}_T8", "club_id": f"{ID_PREFIX}_CYBER", "title": "Verify Network Setup",
                 "description": "Test isolated network environment for CTF challenges.",
                 "category": "Technical", "priority": "High", "assignee": "Sneha Gupta",
                 "due_date": date(2026, 11, 4), "status": "pending", "created_by": f"{ID_PREFIX}_C1"},
                {"id": f"{ID_PREFIX}_T9", "club_id": f"{ID_PREFIX}_ROBOT", "title": "Source Robotics Kits",
                 "description": "Finalize hardware procurement for the buildathon.",
                 "category": "Logistics", "priority": "Medium", "assignee": "Amit Kumar",
                 "due_date": date(2026, 11, 6), "status": "in_progress", "created_by": f"{ID_PREFIX}_C2"},
                {"id": f"{ID_PREFIX}_T10", "club_id": f"{ID_PREFIX}_ROBOT", "title": "Recruit Mentors",
                 "description": "Contact senior students and industry mentors for buildathon.",
                 "category": "Logistics", "priority": "Medium", "assignee": "Pooja Patel",
                 "due_date": date(2026, 11, 5), "status": "completed", "created_by": f"{ID_PREFIX}_C2"},
                {"id": f"{ID_PREFIX}_T11", "club_id": f"{ID_PREFIX}_CP", "title": "Set Up Online Judge",
                 "description": "Configure Codeforces integration for the coding contest.",
                 "category": "Technical", "priority": "High", "assignee": "Karan Malik",
                 "due_date": date(2026, 10, 31), "status": "in_progress", "created_by": f"{ID_PREFIX}_C3"},
                {"id": f"{ID_PREFIX}_T12", "club_id": f"{ID_PREFIX}_CULTURAL", "title": "Book Stage Equipment",
                 "description": "Reserve sound system, lights, and stage for cultural fest.",
                 "category": "Logistics", "priority": "Medium", "assignee": "Riya S.",
                 "due_date": date(2026, 11, 13), "status": "pending", "created_by": f"{ID_PREFIX}_C3"},
                {"id": f"{ID_PREFIX}_T13", "club_id": f"{ID_PREFIX}_CULTURAL", "title": "Arrange Cultural Performers",
                 "description": "Finalize list of dance and music performers for the fest.",
                 "category": "Logistics", "priority": "High", "assignee": "Tanvi P.",
                 "due_date": date(2026, 11, 10), "status": "completed", "created_by": f"{ID_PREFIX}_C3"},
                {"id": f"{ID_PREFIX}_T14", "club_id": f"{ID_PREFIX}_PHOTO", "title": "Organize Photography Walk",
                 "description": "Plan route and assign volunteer guides for the walk.",
                 "category": "Technical", "priority": "Low", "assignee": "Nikhil R.",
                 "due_date": date(2026, 10, 25), "status": "pending", "created_by": f"{ID_PREFIX}_C1"},
                {"id": f"{ID_PREFIX}_T15", "club_id": f"{ID_PREFIX}_ENV", "title": "Plan Tree Plantation Drive",
                 "description": "Organize volunteer schedules and plant species selection.",
                 "category": "Activity", "priority": "Medium", "assignee": "Divya M.",
                 "due_date": date(2026, 10, 26), "status": "completed", "created_by": f"{ID_PREFIX}_C2"},
            ]

            for td in tasks_data:
                task = db.query(CoordinatorTask).filter(CoordinatorTask.id == td["id"]).first()
                if not task:
                    task = CoordinatorTask(
                        id=td["id"],
                        club_id=td["club_id"],
                        title=td["title"],
                        description=td["description"],
                        category=td["category"],
                        priority=td["priority"],
                        assignee=td["assignee"],
                        assigned_user_id=td["created_by"],
                        due_date=td["due_date"],
                        status=td["status"],
                        created_by=td["created_by"],
                        created_at=datetime.now(timezone.utc),
                    )
                    if td["status"] == "completed":
                        task.completed_at = datetime.now(timezone.utc)
                    db.add(task)
                    track_created("tasks")
                else:
                    # Update status to ensure consistency
                    task.status = td["status"]
                    if task.status == "completed":
                        task.completed_at = datetime.now(timezone.utc) if not task.completed_at else task.completed_at
                    track_skipped("tasks")

            # 10. Seed Announcements (8 announcements across clubs)
            announcements_data = [
                {"id": f"{ID_PREFIX}_A1", "club_id": f"{ID_PREFIX}_AI",
                 "title": "Campus Hackathon 2026 Tracks Announced",
                 "content": "The organizing committee has finalized the 4 tracks: AI & HealthTech, Web3, Smart Cities, and Open Innovation.",
                 "category": "Event Alert", "priority": "High", "audience": "All Campus Students",
                 "author": "Dr. Sharma (Faculty Advisor)", "publish_date": date(2026, 10, 15), "is_pinned": True},
                {"id": f"{ID_PREFIX}_A2", "club_id": f"{ID_PREFIX}_AI",
                 "title": "Hackathon Registration Closing Soon",
                 "content": "Team registration closes at midnight. Limited seats available!",
                 "category": "Event Alert", "priority": "High", "audience": "All Campus Students",
                 "author": "Aarav Patel (Technical Lead)", "publish_date": date(2026, 10, 20), "is_pinned": True},
                {"id": f"{ID_PREFIX}_A3", "club_id": f"{ID_PREFIX}_WEB",
                 "title": "Full-Stack Hackathon Submission Guidelines",
                 "content": "Updated project submission requirements and evaluation criteria are now available.",
                 "category": "Event Alert", "priority": "Medium", "audience": "All Campus Students",
                 "author": "Neha Kapoor (Coordinator)", "publish_date": date(2026, 10, 21), "is_pinned": False},
                {"id": f"{ID_PREFIX}_A4", "club_id": f"{ID_PREFIX}_WEB",
                 "title": "Web Dev Study Group - Weekly Meetings",
                 "content": "Join our weekly study group for collaborative learning on web frameworks.",
                 "category": "General Notice", "priority": "Normal", "audience": "Club Members Only",
                 "author": "Vikram Singh (Tech Lead)", "publish_date": date(2026, 10, 22), "is_pinned": False},
                {"id": f"{ID_PREFIX}_A5", "club_id": f"{ID_PREFIX}_CYBER",
                 "title": "CTF Challenge Hints Released",
                 "content": "Hints for the easier challenges are now available on the challenge portal.",
                 "category": "Event Alert", "priority": "Low", "audience": "All Campus Students",
                 "author": "Rohan Pillai (Coordinator)", "publish_date": date(2026, 10, 23), "is_pinned": False},
                {"id": f"{ID_PREFIX}_A6", "club_id": f"{ID_PREFIX}_CP",
                 "title": "Weekly Problem Solving Sessions",
                 "content": "CP Club hosts weekly problem-solving sessions every Thursday at 5 PM.",
                 "category": "General Notice", "priority": "Normal", "audience": "All Campus Students",
                 "author": "Aditya Kapoor (Coordinator)", "publish_date": date(2026, 10, 24), "is_pinned": False},
                {"id": f"{ID_PREFIX}_A7", "club_id": f"{ID_PREFIX}_CULTURAL",
                 "title": "Cultural Fest Auditions Schedule",
                 "content": "Dance, music, and drama auditions for Cultural Fest are scheduled this week.",
                 "category": "Event Alert", "priority": "High", "audience": "All Campus Students",
                 "author": "Meera Nandan (Cultural Head)", "publish_date": date(2026, 10, 25), "is_pinned": True},
                {"id": f"{ID_PREFIX}_A8", "club_id": f"{ID_PREFIX}_PHOTO",
                 "title": "Photography Workshop This Saturday",
                 "content": "Basic photography workshop for beginners. Bring your cameras!",
                 "category": "Workshop", "priority": "Normal", "audience": "All Campus Students",
                 "author": "Anita Sharma (Coordinator)", "publish_date": date(2026, 10, 26), "is_pinned": False},
            ]

            for ad in announcements_data:
                announcement = db.query(Announcement).filter(Announcement.id == ad["id"]).first()
                if not announcement:
                    announcement = Announcement(
                        id=ad["id"],
                        club_id=ad["club_id"],
                        status="published",
                        title=ad["title"],
                        content=ad["content"],
                        category=ad["category"],
                        priority=ad["priority"],
                        audience=ad["audience"],
                        author=ad["author"],
                        author_user_id=f"{ID_PREFIX}_C1",
                        publish_date=ad["publish_date"],
                        is_pinned=ad["is_pinned"],
                        created_at=datetime.now(timezone.utc),
                    )
                    db.add(announcement)
                    track_created("announcements")
                else:
                    track_skipped("announcements")

            # 11. Seed Club Gallery Items
            for club in all_clubs:
                for item_idx in range(1, 5):
                    caption_text = f"Event photo {item_idx} from {club.name} activities"
                    existing = db.query(ClubGallery).filter(
                        ClubGallery.club_id == club.id,
                        ClubGallery.caption == caption_text
                    ).first()
                    if not existing:
                        db.add(ClubGallery(
                            club_id=club.id,
                            image_url=f"https://images.unsplash.com/photo-15{1000 + item_idx * 17}-1640x1080",
                            caption=caption_text,
                            uploaded_at=datetime.now(timezone.utc),
                        ))
                        track_created("club_gallery_items")
                    else:
                        track_skipped("club_gallery_items")

            db.flush()

            # Commit all changes
            db.commit()

            # ========================================================================
            # SUMMARY REPORT
            # =========================================================================
            print("\n" + "=" * 80)
            print("UNISPHERE DEMO DATA SEEDING COMPLETED SUCCESSFULLY!")
            print("=" * 80)

            print("\nSUMMARY OF RECORDS:")
            print("-" * 60)
            for entity, count in [
                ("Admin Users", created_counts.get("admin_users", 0)),
                ("Coordinator Users", created_counts.get("coordinator_users", 0)),
                ("Student Users", created_counts.get("student_users", 0)),
                ("Clubs", created_counts.get("clubs", 0)),
                ("Club Memberships", created_counts.get("club_memberships", 0)),
                ("Events", created_counts.get("events", 0)),
                ("Event Rules", created_counts.get("event_rules", 0)),
                ("Event Registrations", created_counts.get("event_registrations", 0)),
                ("Event Teams", created_counts.get("event_teams", 0)),
                ("Event Winners", created_counts.get("event_winners", 0)),
                ("Certificates", created_counts.get("certificates", 0)),
                ("Coordinator Tasks", created_counts.get("tasks", 0)),
                ("Announcements", created_counts.get("announcements", 0)),
                ("Club Gallery Items", created_counts.get("club_gallery_items", 0)),
            ]:
                print(f"  [+] {entity}: {count}")

            skipped_total = sum(skipped_counts.values())
            if skipped_counts:
                print("\nRecords reused (already existed):")
                for entity, count in skipped_counts.items():
                    print(f"     {entity}: {count}")

            print("\n" + "=" * 80)
            print("DEMO ACCOUNTS & LOGIN CREDENTIALS")
            print("=" * 80)
            print(f"\n[Admin]       {generate_demo_email('admin')}     / Admin@2026")
            print(f"[Coordinator] {generate_demo_email('arjunmehta')} / Coordinator@2026")
            print(f"[Coordinator] {generate_demo_email('nehakapoor')} / Coordinator@2026")
            print(f"[Coordinator] {generate_demo_email('kunalverma')} / Coordinator@2026")
            print(f"[Student]     {students_data[0]['email']} / Student@2026")
            print(f"[Student 2]   {students_data[1]['email']} / Student@2026" if len(students_data) > 1 else "")

            print("\n" + "=" * 80)
            print("VERIFIED DATA COUNTS (DIRECT FROM DATABASE):")
            print("-" * 60)
            actual_users = db.query(func.count(User.id)).filter(User.email.like(f"%{DEMO_EMAIL_DOMAIN}")).scalar() or 0
            actual_clubs = db.query(func.count(Club.id)).filter(Club.id.like(f"{ID_PREFIX}%")).scalar() or 0
            actual_memberships = db.query(func.count(ClubMembership.id)).filter(ClubMembership.club_id.like(f"{ID_PREFIX}%")).scalar() or 0
            actual_events = db.query(func.count(Event.id)).filter(Event.club_id.like(f"{ID_PREFIX}%")).scalar() or 0
            actual_rules = db.query(func.count(EventRule.id)).filter(
                EventRule.event_id.in_(
                    db.query(Event.id).filter(Event.club_id.like(f"{ID_PREFIX}%"))
                )
            ).scalar() or 0
            actual_regs = db.query(func.count(EventRegistration.id)).filter(
                EventRegistration.event_id.in_(
                    db.query(Event.id).filter(Event.club_id.like(f"{ID_PREFIX}%"))
                )
            ).scalar() or 0
            actual_teams = db.query(func.count(EventTeam.id)).filter(
                EventTeam.event_id.in_(
                    db.query(Event.id).filter(Event.club_id.like(f"{ID_PREFIX}%"))
                )
            ).scalar() or 0
            actual_anns = db.query(func.count(Announcement.id)).filter(Announcement.club_id.like(f"{ID_PREFIX}%")).scalar() or 0
            actual_tasks = db.query(func.count(CoordinatorTask.id)).filter(CoordinatorTask.club_id.like(f"{ID_PREFIX}%")).scalar() or 0
            actual_certs = db.query(func.count(Certificate.id)).filter(
                Certificate.event_id.in_(
                    db.query(Event.id).filter(Event.club_id.like(f"{ID_PREFIX}%"))
                )
            ).scalar() or 0
            actual_winners = db.query(func.count(EventWinner.id)).filter(
                EventWinner.event_id.in_(
                    db.query(Event.id).filter(Event.club_id.like(f"{ID_PREFIX}%"))
                )
            ).scalar() or 0
            actual_gallery = db.query(func.count(ClubGallery.id)).filter(
                ClubGallery.club_id.like(f"{ID_PREFIX}%")
            ).scalar() or 0

            print(f"  Users:              {actual_users}")
            print(f"  Clubs:              {actual_clubs}")
            print(f"  Memberships:        {actual_memberships}")
            print(f"  Events:             {actual_events}")
            print(f"  Event Rules:        {actual_rules}")
            print(f"  Registrations:      {actual_regs}")
            print(f"  Event Teams:        {actual_teams}")
            print(f"  Announcements:      {actual_anns}")
            print(f"  Coordinator Tasks:  {actual_tasks}")
            print(f"  Certificates:       {actual_certs}")
            print(f"  Event Winners:      {actual_winners}")
            print(f"  Club Gallery Items: {actual_gallery}")

            print("\n[+] Demo data is isolated using @demo.unisphere.edu emails.")
            print("    No existing real records were modified or deleted.")
            print("    Re-running this script will safely reuse existing demo records.")
            print("\n[+] The platform is ready for demonstration!")
            print("    Backend: http://localhost:8000")
            print("    Frontend: http://localhost:5173")
            print("    API Docs: http://localhost:8000/docs")

        except Exception as e:
            print(f"\nERROR seeding demo data: {str(e)}")
            db.rollback()
            raise


if __name__ == "__main__":
    seed_database()