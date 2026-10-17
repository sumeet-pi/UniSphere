"""Club membership model."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ClubMembership(Base):
    __tablename__ = "club_memberships"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    club_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="approved"
    )  # pending | approved | rejected | left
    club_role: Mapped[str] = mapped_column(
        String(30), nullable=False, default="member"
    )  # member | coordinator | faculty_head

    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="memberships")
    club = relationship("Club", back_populates="memberships")

    __table_args__ = (
        UniqueConstraint("user_id", "club_id", name="uq_user_club"),
        Index("ix_membership_club", "club_id"),
        Index("ix_membership_user", "user_id"),
    )
