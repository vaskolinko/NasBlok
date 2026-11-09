"""SQLAlchemy modeli po podatkovnem modelu iz docs/03-podatkovni-model.md."""

import enum
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


# --- Naštevni tipi ---

class MemberRole(str, enum.Enum):
    MANAGER = "MANAGER"
    REPRESENTATIVE = "REPRESENTATIVE"
    OWNER = "OWNER"
    TENANT = "TENANT"
    CONTRACTOR = "CONTRACTOR"


class IssueCategory(str, enum.Enum):
    PLUMBING = "PLUMBING"
    ELECTRICAL = "ELECTRICAL"
    ELEVATOR = "ELEVATOR"
    HEATING = "HEATING"
    OTHER = "OTHER"


class IssueUrgency(str, enum.Enum):
    LOW = "LOW"
    NORMAL = "NORMAL"
    URGENT = "URGENT"


class IssueStatus(str, enum.Enum):
    REPORTED = "REPORTED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"


class PollMajority(str, enum.Enum):
    HALF = "HALF"
    THREE_QUARTERS = "THREE_QUARTERS"
    ALL = "ALL"


class PollStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"


class PollResult(str, enum.Enum):
    ADOPTED = "ADOPTED"
    REJECTED = "REJECTED"


class VoteChoice(str, enum.Enum):
    YES = "YES"
    NO = "NO"
    ABSTAIN = "ABSTAIN"


def created_at_column() -> Mapped[datetime]:
    return mapped_column(DateTime(timezone=True), server_default=func.now())


# --- Tabele ---

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    created_at: Mapped[datetime] = created_at_column()


class Building(Base):
    __tablename__ = "buildings"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    address: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = created_at_column()


class Unit(Base):
    __tablename__ = "units"
    __table_args__ = (UniqueConstraint("building_id", "label"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    building_id: Mapped[int] = mapped_column(ForeignKey("buildings.id"))
    label: Mapped[str] = mapped_column(String(100))


class BuildingMember(Base):
    __tablename__ = "building_members"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    building_id: Mapped[int] = mapped_column(ForeignKey("buildings.id"))
    unit_id: Mapped[int | None] = mapped_column(ForeignKey("units.id"))
    role: Mapped[MemberRole] = mapped_column(Enum(MemberRole, native_enum=False, length=20))


class Invitation(Base):
    __tablename__ = "invitations"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(32), unique=True)
    building_id: Mapped[int] = mapped_column(ForeignKey("buildings.id"))
    unit_id: Mapped[int | None] = mapped_column(ForeignKey("units.id"))
    role: Mapped[MemberRole] = mapped_column(Enum(MemberRole, native_enum=False, length=20))
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Contractor(Base):
    __tablename__ = "contractors"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    company_name: Mapped[str] = mapped_column(String(255))
    specialty: Mapped[IssueCategory | None] = mapped_column(Enum(IssueCategory, native_enum=False, length=20))
    phone: Mapped[str | None] = mapped_column(String(50))
    created_at: Mapped[datetime] = created_at_column()


class Issue(Base):
    __tablename__ = "issues"

    id: Mapped[int] = mapped_column(primary_key=True)
    building_id: Mapped[int] = mapped_column(ForeignKey("buildings.id"))
    unit_id: Mapped[int | None] = mapped_column(ForeignKey("units.id"))  # prazno = skupni del stavbe
    reported_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    contractor_id: Mapped[int | None] = mapped_column(ForeignKey("contractors.id"))
    category: Mapped[IssueCategory] = mapped_column(Enum(IssueCategory, native_enum=False, length=20))
    urgency: Mapped[IssueUrgency] = mapped_column(
        Enum(IssueUrgency, native_enum=False, length=20), default=IssueUrgency.NORMAL
    )
    status: Mapped[IssueStatus] = mapped_column(
        Enum(IssueStatus, native_enum=False, length=20), default=IssueStatus.REPORTED
    )
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    photo_url: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = created_at_column()


class IssueHistory(Base):
    __tablename__ = "issue_history"

    id: Mapped[int] = mapped_column(primary_key=True)
    issue_id: Mapped[int] = mapped_column(ForeignKey("issues.id"))
    changed_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    from_status: Mapped[IssueStatus | None] = mapped_column(Enum(IssueStatus, native_enum=False, length=20))
    to_status: Mapped[IssueStatus] = mapped_column(Enum(IssueStatus, native_enum=False, length=20))
    note: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = created_at_column()


class Poll(Base):
    __tablename__ = "polls"

    id: Mapped[int] = mapped_column(primary_key=True)
    building_id: Mapped[int] = mapped_column(ForeignKey("buildings.id"))
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    majority: Mapped[PollMajority] = mapped_column(Enum(PollMajority, native_enum=False, length=20))
    status: Mapped[PollStatus] = mapped_column(
        Enum(PollStatus, native_enum=False, length=20), default=PollStatus.OPEN
    )
    closes_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    result: Mapped[PollResult | None] = mapped_column(Enum(PollResult, native_enum=False, length=20))
    created_at: Mapped[datetime] = created_at_column()


class Vote(Base):
    __tablename__ = "votes"
    # eno stanovanje lahko pri posameznem glasovanju odda samo en glas
    __table_args__ = (UniqueConstraint("poll_id", "unit_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    poll_id: Mapped[int] = mapped_column(ForeignKey("polls.id"))
    unit_id: Mapped[int] = mapped_column(ForeignKey("units.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    choice: Mapped[VoteChoice] = mapped_column(Enum(VoteChoice, native_enum=False, length=20))
    created_at: Mapped[datetime] = created_at_column()


class Announcement(Base):
    __tablename__ = "announcements"

    id: Mapped[int] = mapped_column(primary_key=True)
    building_id: Mapped[int] = mapped_column(ForeignKey("buildings.id"))
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(100))
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = created_at_column()


class AnnouncementRead(Base):
    __tablename__ = "announcement_reads"

    announcement_id: Mapped[int] = mapped_column(ForeignKey("announcements.id"), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    read_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
