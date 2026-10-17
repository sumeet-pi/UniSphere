"""Models package — import all models so SQLAlchemy resolves all relationships."""

from app.models.user import User
from app.models.club import Club
from app.models.membership import ClubMembership
from app.models.event import Event
from app.models.registration import EventRegistration
from app.models.announcement import Announcement
from app.models.audit_log import AuditLog

__all__ = [
    "User",
    "Club",
    "ClubMembership",
    "Event",
    "EventRegistration",
    "Announcement",
    "AuditLog",
]
