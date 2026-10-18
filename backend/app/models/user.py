"""User model conforming to DATABASE_SCHEMA.md."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Boolean, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    role: Mapped[str] = mapped_column(
        String(30), nullable=False, default="GENERAL_STUDENT"
    )  # GENERAL_STUDENT | CLUB_COORDINATOR | FACULTY_HEAD | ADMIN
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Legacy alias / status tracking
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="active"
    )  # active | disabled | pending

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan", lazy="selectin")
    memberships = relationship("ClubMembership", back_populates="user", lazy="select")
    registrations = relationship("EventRegistration", back_populates="user", lazy="select")
    certificates = relationship("Certificate", back_populates="user", lazy="select")

    # Property alias for compatibility with code that accesses full_name
    @property
    def full_name(self) -> str:
        return self.name

    @full_name.setter
    def full_name(self, value: str):
        self.name = value

    @property
    def course(self) -> str | None:
        return self.student_profile.course if self.student_profile else None

    @course.setter
    def course(self, value: str | None):
        if self.student_profile is None:
            from app.models.student_profile import StudentProfile
            self.student_profile = StudentProfile(user_id=self.id)
        self.student_profile.course = value

    @property
    def branch(self) -> str | None:
        return self.student_profile.branch if self.student_profile else None

    @branch.setter
    def branch(self, value: str | None):
        if self.student_profile is None:
            from app.models.student_profile import StudentProfile
            self.student_profile = StudentProfile(user_id=self.id)
        self.student_profile.branch = value

    @property
    def semester(self) -> str | None:
        return self.student_profile.semester if self.student_profile else None

    @semester.setter
    def semester(self, value: str | None):
        if self.student_profile is None:
            from app.models.student_profile import StudentProfile
            self.student_profile = StudentProfile(user_id=self.id)
        self.student_profile.semester = value

    @property
    def class_roll_no(self) -> str | None:
        return self.student_profile.class_roll_no if self.student_profile else None

    @class_roll_no.setter
    def class_roll_no(self, value: str | None):
        if self.student_profile is None:
            from app.models.student_profile import StudentProfile
            self.student_profile = StudentProfile(user_id=self.id)
        self.student_profile.class_roll_no = value

    @property
    def university_roll_no(self) -> str | None:
        return self.student_profile.university_roll_no if self.student_profile else None

    @university_roll_no.setter
    def university_roll_no(self, value: str | None):
        if self.student_profile is None:
            from app.models.student_profile import StudentProfile
            self.student_profile = StudentProfile(user_id=self.id)
        self.student_profile.university_roll_no = value

    __table_args__ = (
        Index("idx_users_role", "role"),
        Index("idx_users_email", "email"),
    )

