"""Club membership model conforming to DATABASE_SCHEMA.md."""

import uuid
from datetime import datetime, date, timezone

from sqlalchemy import String, Integer, Date, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ClubMembership(Base):
    __tablename__ = "club_memberships"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    club_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(
        String(30), nullable=False, default="MEMBER"
    )  # MEMBER | CORE_TEAM | COORDINATOR | LEAD | FACULTY_ADVISOR
    designation: Mapped[str] = mapped_column(
        String(100), nullable=False, default="General Member"
    )
    joined_date: Mapped[date] = mapped_column(
        Date, nullable=False, default=date.today
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="ACTIVE"
    )  # ACTIVE | ALUMNI | SUSPENDED | left

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="memberships")
    club = relationship("Club", back_populates="memberships")

    @property
    def club_role(self) -> str:
        return self.role.lower() if self.role else ""

    @club_role.setter
    def club_role(self, val: str):
        self.role = val.upper() if val else "MEMBER"



    __table_args__ = (
        UniqueConstraint("club_id", "user_id", name="uq_club_user_membership"),
        Index("idx_membership_club_role", "club_id", "role"),
        Index("idx_membership_user_status", "user_id", "status"),
    )
