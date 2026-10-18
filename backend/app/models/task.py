"""Coordinator Task model."""

import uuid
from datetime import datetime, date, timezone
from sqlalchemy import String, Text, Date, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CoordinatorTask(Base):
    __tablename__ = "coordinator_tasks"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    club_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(30), nullable=False, default="General")
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="Medium")
    assignee: Mapped[str] = mapped_column(String(150), nullable=False)
    assigned_user_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending | in_progress | completed
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
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

    club = relationship("Club", back_populates="tasks")

    __table_args__ = (
        Index("idx_tasks_club_status", "club_id", "status"),
        Index("idx_tasks_due_date", "due_date"),
    )
