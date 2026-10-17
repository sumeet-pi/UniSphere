"""Event registration model."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    event_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="confirmed"
    )  # confirmed | cancelled

    registered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    cancelled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    event = relationship("Event", back_populates="registrations")
    user = relationship("User", back_populates="registrations")

    __table_args__ = (
        # Only one active (non-cancelled) registration per user per event
        UniqueConstraint("event_id", "user_id", name="uq_event_user_registration"),
        Index("ix_registration_event", "event_id"),
        Index("ix_registration_user", "user_id"),
    )
