"""Student profile, skills, and interests models conforming to DATABASE_SCHEMA.md."""

from datetime import datetime, timezone
from sqlalchemy import String, Integer, Numeric, Text, DateTime, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    class_roll_no: Mapped[str] = mapped_column(String(50), nullable=False)
    university_roll_no: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    course: Mapped[str] = mapped_column(String(50), nullable=False, default="B.Tech")
    branch: Mapped[str] = mapped_column(String(100), nullable=False)
    semester: Mapped[str] = mapped_column(String(20), nullable=False, default="4th Sem")
    academic_year: Mapped[str] = mapped_column(String(20), nullable=False, default="2nd Year")
    department: Mapped[str] = mapped_column(String(150), nullable=False)
    admission_year: Mapped[int] = mapped_column(Integer, nullable=False, default=2024)
    graduating_year: Mapped[int] = mapped_column(Integer, nullable=False, default=2028)

    @property
    def graduation_year(self) -> int:
        return self.graduating_year

    @graduation_year.setter
    def graduation_year(self, value: int):
        self.graduating_year = value

    blood_group: Mapped[str | None] = mapped_column(String(10), nullable=True, default="B+")
    emergency_contact: Mapped[str | None] = mapped_column(String(25), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    github_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    co_curricular_hours: Mapped[float] = mapped_column(Numeric(5, 1), nullable=False, default=0.0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user = relationship("User", back_populates="student_profile")
    skills = relationship("StudentSkill", back_populates="profile", cascade="all, delete-orphan", lazy="selectin")
    interests = relationship("StudentInterest", back_populates="profile", cascade="all, delete-orphan", lazy="selectin")

    __table_args__ = (
        Index("idx_student_univ_roll", "university_roll_no"),
        Index("idx_student_class_roll", "class_roll_no"),
        Index("idx_student_dept_branch", "department", "branch"),
    )


class StudentSkill(Base):
    __tablename__ = "student_skills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("student_profiles.user_id", ondelete="CASCADE"), nullable=False
    )
    skill_name: Mapped[str] = mapped_column(String(100), nullable=False)

    profile = relationship("StudentProfile", back_populates="skills")

    __table_args__ = (
        UniqueConstraint("user_id", "skill_name", name="uq_student_skill"),
        Index("idx_student_skills_user", "user_id"),
    )


class StudentInterest(Base):
    __tablename__ = "student_interests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("student_profiles.user_id", ondelete="CASCADE"), nullable=False
    )
    interest_name: Mapped[str] = mapped_column(String(100), nullable=False)

    profile = relationship("StudentProfile", back_populates="interests")

    __table_args__ = (
        UniqueConstraint("user_id", "interest_name", name="uq_student_interest"),
    )
