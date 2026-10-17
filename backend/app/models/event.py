"""Event model."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, DateTime, Integer, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Event(Base):
    __tablename__ = "events"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    club_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    date: Mapped[str] = mapped_column(String(20), nullable=False)  # YYYY-MM-DD
    time: Mapped[str] = mapped_column(String(50), nullable=True)  # display string
    start_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    end_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    venue: Mapped[str] = mapped_column(String(300), nullable=True)
    capacity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    registered_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    registration_deadline: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft"
    )  # draft | published | cancelled | completed
    eligibility: Mapped[str | None] = mapped_column(String(300), nullable=True)
    rules: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array as string
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    creator_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    club = relationship("Club", back_populates="events")
    registrations = relationship("EventRegistration", back_populates="event", lazy="select")

    __table_args__ = (
        Index("ix_events_club", "club_id"),
        Index("ix_events_status", "status"),
        Index("ix_events_date", "date"),
    )
