"""Models package — import all models so SQLAlchemy resolves all relationships."""

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
from app.models.audit_log import AuditLog

__all__ = [
    "User",
    "StudentProfile",
    "StudentSkill",
    "StudentInterest",
    "Club",
    "ClubGallery",
    "ClubMembership",
    "Event",
    "EventRule",
    "EventTeam",
    "EventTeamMember",
    "EventWinner",
    "Certificate",
    "EventRegistration",
    "CoordinatorTask",
    "Announcement",
    "AuditLog",
]
