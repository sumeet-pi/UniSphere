"""Club model conforming to DATABASE_SCHEMA.md."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Club(Base):
    __tablename__ = "clubs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    club_code: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True, default=lambda: f"CLB-{uuid.uuid4().hex[:6].upper()}"
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    department: Mapped[str] = mapped_column(String(150), nullable=False, default="Computer Science & Engineering")
    description: Mapped[str] = mapped_column(String(300), nullable=False, default="College student activity club.")
    about_mission: Mapped[str | None] = mapped_column(Text, nullable=True)
    faculty_advisor_name: Mapped[str] = mapped_column(String(150), nullable=False, default="Dr. Sharma")
    faculty_advisor_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    hod_name: Mapped[str] = mapped_column(String(150), nullable=False, default="Dr. V. K. Mathur")
    logo_url: Mapped[str] = mapped_column(String(500), nullable=False, default="https://images.unsplash.com/photo-1511578314322-379afb476865")
    banner_url: Mapped[str] = mapped_column(String(500), nullable=False, default="https://images.unsplash.com/photo-1523580494863-6f3031224c94")
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(25), nullable=True)
    website_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    instagram_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    discord_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    github_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    founded_year: Mapped[int] = mapped_column(Integer, nullable=False, default=2021)

    @property
    def faculty_head(self) -> str:
        return self.faculty_advisor_name

    @faculty_head.setter
    def faculty_head(self, value: str):
        self.faculty_advisor_name = value

    @property
    def coordinator_id(self) -> str | None:
        return self.faculty_advisor_id

    @coordinator_id.setter
    def coordinator_id(self, value: str | None):
        self.faculty_advisor_id = value

    @property
    def creator_id(self) -> str | None:
        return self.faculty_advisor_id

    @creator_id.setter
    def creator_id(self, value: str | None):
        self.faculty_advisor_id = value


    # Administrative approval lifecycle
    approval_status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="requested"
    )  # requested | approved | rejected
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    approved_by: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="ACTIVE"
    )  # ACTIVE | PROBATION | INACTIVE

    # Compatibility slug property
    slug: Mapped[str | None] = mapped_column(String(200), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    memberships = relationship("ClubMembership", back_populates="club", cascade="all, delete-orphan", lazy="select")
    events = relationship("Event", back_populates="club", cascade="all, delete-orphan", lazy="select")
    announcements = relationship("Announcement", back_populates="club", cascade="all, delete-orphan", lazy="select")
    gallery_items = relationship("ClubGallery", back_populates="club", cascade="all, delete-orphan", lazy="select")
    tasks = relationship("CoordinatorTask", back_populates="club", cascade="all, delete-orphan", lazy="select")

    __table_args__ = (
        Index("idx_clubs_approval_status", "approval_status"),
        Index("idx_clubs_code", "club_code"),
        Index("idx_clubs_category", "category"),
        Index("idx_clubs_department", "department"),
    )
