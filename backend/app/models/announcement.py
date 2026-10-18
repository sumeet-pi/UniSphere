"""Announcement model conforming to DATABASE_SCHEMA.md."""

import uuid
from datetime import datetime, date, timezone

from sqlalchemy import String, Text, Date, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Announcement(Base):
    __tablename__ = "announcements"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    club_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="published"
    )
    title: Mapped[str] = mapped_column(String(250), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(
        String(30), nullable=False, default="General Notice"
    )  # Event Alert | Recruitment | Workshop | General Notice
    priority: Mapped[str] = mapped_column(
        String(20), nullable=False, default="Normal"
    )  # High | Normal | Low
    audience: Mapped[str] = mapped_column(
        String(50), nullable=False, default="All Campus Students"
    )  # All Campus Students | Club Members Only | Event Attendees
    author: Mapped[str] = mapped_column(String(150), nullable=False)
    author_user_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    publish_date: Mapped[date] = mapped_column(
        Date, nullable=False, default=date.today
    )
    is_pinned: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    club = relationship("Club", back_populates="announcements")

    __table_args__ = (
        Index("idx_announcements_club", "club_id", "publish_date"),
        Index("idx_announcements_feed", "priority", "publish_date"),
    )
