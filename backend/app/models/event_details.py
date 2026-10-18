"""Event rules, teams, team members, winners, and certificates models."""

import uuid
from datetime import datetime, date, timezone
from sqlalchemy import String, Integer, Text, Date, DateTime, Boolean, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class EventRule(Base):
    __tablename__ = "event_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    rule_order: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    rule_text: Mapped[str] = mapped_column(String(500), nullable=False)

    event = relationship("Event", back_populates="rules_list")


class EventTeam(Base):
    __tablename__ = "event_teams"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    team_name: Mapped[str] = mapped_column(String(150), nullable=False)
    team_lead_user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    pass_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="CONFIRMED")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    event = relationship("Event", back_populates="teams")
    team_lead = relationship("User", foreign_keys=[team_lead_user_id])
    members = relationship("EventTeamMember", back_populates="team", cascade="all, delete-orphan")
    registrations = relationship("EventRegistration", back_populates="team")

    __table_args__ = (
        UniqueConstraint("event_id", "team_name", name="uq_event_team_name"),
        Index("idx_event_teams_event", "event_id"),
    )


class EventTeamMember(Base):
    __tablename__ = "event_team_members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    team_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("event_teams.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="MEMBER")  # LEAD | MEMBER
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    team = relationship("EventTeam", back_populates="members")
    user = relationship("User")

    __table_args__ = (
        UniqueConstraint("team_id", "user_id", name="uq_team_user"),
        Index("idx_team_members_user", "user_id"),
    )


class EventWinner(Base):
    __tablename__ = "event_winners"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    rank_position: Mapped[int] = mapped_column(Integer, nullable=False)
    rank_display: Mapped[str] = mapped_column(String(30), nullable=False)
    winner_name: Mapped[str] = mapped_column(String(150), nullable=False)
    user_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    branch: Mapped[str] = mapped_column(String(100), nullable=False)
    prize: Mapped[str] = mapped_column(String(100), nullable=False)
    project_title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    declared_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    event = relationship("Event", back_populates="winners")
    user = relationship("User")

    __table_args__ = (
        Index("idx_winners_event", "event_id", "rank_position"),
    )


class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    credential_id: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    event_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("events.id", ondelete="RESTRICT"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[str] = mapped_column(String(30), nullable=False, default="COMPLETION")
    student_name: Mapped[str] = mapped_column(String(150), nullable=False)
    class_roll_no: Mapped[str] = mapped_column(String(50), nullable=False)
    course_branch: Mapped[str] = mapped_column(String(150), nullable=False)
    event_title: Mapped[str] = mapped_column(String(200), nullable=False)
    club_name: Mapped[str] = mapped_column(String(150), nullable=False)
    faculty_advisor_name: Mapped[str] = mapped_column(String(150), nullable=False)
    hod_name: Mapped[str] = mapped_column(String(150), nullable=False)
    issue_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    naac_criterion: Mapped[str] = mapped_column(String(20), nullable=False, default="5.3")
    pdf_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="ISSUED")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    event = relationship("Event", back_populates="certificates")
    user = relationship("User", back_populates="certificates")

    __table_args__ = (
        Index("idx_cert_credential_id", "credential_id"),
        Index("idx_cert_user_id", "user_id"),
    )
