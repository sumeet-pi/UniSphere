"""Event registration model conforming to DATABASE_SCHEMA.md."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, Boolean, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    pass_code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    event_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    team_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("event_teams.id", ondelete="SET NULL"), nullable=True
    )
    is_team_lead: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="CONFIRMED"
    )  # CONFIRMED | WAITLISTED | CHECKED_IN | CANCELLED

    registered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    checked_in_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    event = relationship("Event", back_populates="registrations")
    user = relationship("User", back_populates="registrations")
    team = relationship("EventTeam", back_populates="registrations")

    __table_args__ = (
        UniqueConstraint("event_id", "user_id", name="uq_event_user_registration"),
        Index("idx_reg_user_status", "user_id", "status"),
        Index("idx_reg_pass_code", "pass_code"),
        Index("idx_reg_team", "team_id"),
    )
