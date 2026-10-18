"""Event model conforming to DATABASE_SCHEMA.md."""

import uuid
from datetime import datetime, date, timezone

from sqlalchemy import String, Integer, Text, Date, DateTime, Boolean, ForeignKey, Index
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
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    stage: Mapped[str] = mapped_column(
        String(20), nullable=False, default="upcoming"
    )  # upcoming | open | closed | past | cancelled
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="Upcoming"
    )  # Upcoming | Open | Closed | Past | Cancelled

    # Membership restriction flag
    restrict_club_members: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Team configuration
    is_team_event: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    min_team_size: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    max_team_size: Mapped[int] = mapped_column(Integer, nullable=False, default=4)

    # Schedules & Location
    event_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    end_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    time_display: Mapped[str] = mapped_column(String(50), nullable=False, default="09:00 AM - 05:00 PM")
    venue: Mapped[str] = mapped_column(String(150), nullable=False)
    venue_room: Mapped[str | None] = mapped_column(String(50), nullable=True)

    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    registered_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    turnout_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    eligibility: Mapped[str] = mapped_column(String(255), nullable=False, default="All Students")
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)

    registration_opens_at: Mapped[date | None] = mapped_column(Date, nullable=True)
    registration_closes_at: Mapped[date | None] = mapped_column(Date, nullable=True)

    created_by: Mapped[str | None] = mapped_column(
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
    registrations = relationship("EventRegistration", back_populates="event", cascade="all, delete-orphan", lazy="select")
    rules_list = relationship("EventRule", back_populates="event", cascade="all, delete-orphan", lazy="selectin", order_by="EventRule.rule_order")
    teams = relationship("EventTeam", back_populates="event", cascade="all, delete-orphan", lazy="select")
    winners = relationship("EventWinner", back_populates="event", cascade="all, delete-orphan", lazy="select", order_by="EventWinner.rank_position")
    certificates = relationship("Certificate", back_populates="event", lazy="select")

    # Compatibility property for date string format
    @property
    def date(self) -> str:
        return self.event_date.isoformat() if self.event_date else ""

    __table_args__ = (
        Index("idx_events_stage_date", "stage", "event_date"),
        Index("idx_events_club_id", "club_id"),
        Index("idx_events_category", "category"),
    )
