"""Pydantic schemas conforming to API_SPECIFICATION.md for UniSphere."""

from datetime import datetime, date
from typing import Any, List, Optional, Union
from pydantic import BaseModel, EmailStr, Field


# ============================================================================
# 1. AUTHENTICATION & IDENTITY SCHEMAS
# ============================================================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class StudentSignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None
    role: str = Field(default="GENERAL_STUDENT")
    course: str = Field(default="B.Tech")
    branch: str = Field(default="Computer Science & Engineering")
    semester: str = Field(default="4th Sem")
    classRollNo: str = Field(..., min_length=1)
    universityRollNo: str = Field(..., min_length=1)
    department: str = Field(default="Computer Science & Engineering")


class UserContextResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    phone: Optional[str] = None
    avatarUrl: Optional[str] = None
    registeredEventIds: List[str] = Field(default_factory=list)
    joinedClubIds: List[str] = Field(default_factory=list)
    clubId: Optional[str] = None
    managedClubId: Optional[str] = None
    clubName: Optional[str] = None
    clubCode: Optional[str] = None
    department: Optional[str] = None
    clubRole: Optional[str] = None


class UserUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    avatarUrl: Optional[str] = None



# ============================================================================
# 2. STUDENT PROFILE & IDENTITY SCHEMAS
# ============================================================================

class StudentProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    course: str = "B.Tech"
    branch: str = "Computer Science & Engineering"
    sem: str = "4th Sem"
    year: str = "2nd Year"
    classRollNo: str
    universityRollNo: str
    department: str
    admissionYear: int = 2024
    graduatingYear: int = 2028
    avatar: Optional[str] = None
    bio: Optional[str] = None
    bloodGroup: Optional[str] = "B+"
    emergencyContact: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    coCurricularHours: float = 0.0
    targetHours: float = 40.0
    skills: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)


class StudentProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
    bloodGroup: Optional[str] = None
    emergencyContact: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None


class StudentIdCardResponse(BaseModel):
    institutionName: str = "UNISPHERE UNIVERSITY"
    academicSession: str = "SESSION 2024-28"
    name: str
    course: str
    classRollNo: str
    universityRollNo: str
    semesterYear: str
    department: str
    bloodGroup: str
    avatar: Optional[str] = None
    barcodeString: str
    barcodeVisual: str = "||| | |||| | |||||| || | |||| ||"
    isValidated: bool = True


class StudentSearchItem(BaseModel):
    id: str
    name: str
    classRollNo: str
    universityRollNo: str
    email: str
    phone: Optional[str] = None
    course: str
    branch: str
    year: str
    department: str
    avatar: Optional[str] = None
    isClubMember: bool = False
    isAlreadyRegistered: bool = False


# ============================================================================
# 3. CLUBS & PUBLIC PROFILE SCHEMAS
# ============================================================================

class ClubItemResponse(BaseModel):
    id: str
    clubCode: str
    name: str
    category: str
    department: str
    facultyAdvisor: str
    hod: str
    memberCount: int = 0
    upcomingEventsCount: int = 0
    description: str
    logo: str
    banner: str


class ClubRegistrationRequest(BaseModel):
    name: Optional[str] = None
    clubName: Optional[str] = None
    category: str
    department: str
    coordinatorTeacher: Optional[str] = None
    facultyAdvisor: Optional[str] = None
    hod: str
    email: EmailStr
    phone: str
    password: str = Field(..., min_length=6)
    description: str


class ClubUpdateRequest(BaseModel):
    clubCode: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    about: Optional[str] = None
    facultyAdvisor: Optional[str] = None
    hod: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    banner: Optional[str] = None
    logo: Optional[str] = None
    category: Optional[str] = None
    department: Optional[str] = None


# ============================================================================
# 4. CLUB MEMBERSHIP SCHEMAS
# ============================================================================

class ClubMemberItem(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    course: Optional[str] = None
    branch: Optional[str] = None
    semester: Optional[str] = None
    classRollNo: Optional[str] = None
    role: str
    designation: str
    status: str
    joinedDate: str


class ClubMembersListResponse(BaseModel):
    totalMembers: int
    coreTeamCount: int
    generalMemberCount: int
    members: List[ClubMemberItem]


class MemberRoleUpdateRequest(BaseModel):
    role: str  # MEMBER | CORE_TEAM | COORDINATOR | LEAD
    designation: str


class MemberAddRequest(BaseModel):
    userId: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = "MEMBER"  # MEMBER | CORE_TEAM | COORDINATOR | LEAD
    designation: Optional[str] = "General Member"
    collegeId: Optional[str] = None
    department: Optional[str] = "Computer Science & Engineering"
    year: Optional[str] = "2nd Year"


# ============================================================================
# 5. EVENTS & LIFECYCLE SCHEMAS
# ============================================================================

class EventItemResponse(BaseModel):
    id: str
    clubId: str
    clubName: str
    title: str
    category: str
    stage: str
    status: str
    date: str
    time: str
    venue: str
    capacity: int
    registeredCount: int = 0
    description: str
    image: str
    restrictClubMembers: bool = True
    isTeamEvent: bool = False
    minTeamSize: int = 1
    maxTeamSize: int = 4
    isRegistered: bool = False
    isClubMember: bool = False
    canRegister: bool = True
    restrictionReason: Optional[str] = None
    rules: List[str] = Field(default_factory=list)


class EventCreateRequest(BaseModel):
    title: str = Field(..., min_length=2)
    category: str
    stage: str = "open"
    restrictClubMembers: bool = True
    isTeamEvent: bool = False
    minTeamSize: int = 1
    maxTeamSize: int = 4
    date: str  # YYYY-MM-DD
    time: str  # e.g. "09:00 AM - 05:00 PM"
    venue: str
    capacity: int = Field(..., gt=0)
    description: str
    eligibility: str = "All Students"
    image: str
    rules: List[str] = Field(default_factory=list)


class EventStageTransitionRequest(BaseModel):
    stage: str  # upcoming | open | closed | past | cancelled
    status: Optional[str] = None


# ============================================================================
# 6. RSVP, TEAM RSVP & DIGITAL PASSES
# ============================================================================

class QuickRSVPResponse(BaseModel):
    registrationId: str
    eventId: str
    eventTitle: str
    passCode: str
    attendeeName: str
    classRollNo: str
    status: str
    reportingTime: str
    venue: str


class TeamRSVPRequest(BaseModel):
    teamName: str = Field(..., min_length=2)
    teammateUserIds: List[str] = Field(default_factory=list)


class TeamRSVPResponse(BaseModel):
    teamId: str
    teamName: str
    teamPassCode: str
    eventTitle: str
    teamLead: dict
    members: List[dict]


class CheckInResponse(BaseModel):
    studentName: str
    classRollNo: str
    checkInTime: str


# ============================================================================
# 7. WINNERS & CERTIFICATES SCHEMAS
# ============================================================================

class WinnerItem(BaseModel):
    rankPosition: Optional[Union[int, str]] = 1
    rank: Optional[Union[int, str]] = None
    position: Optional[str] = None
    name: Optional[str] = None
    teamName: Optional[str] = None
    teamMembers: Optional[List[str]] = None
    branch: Optional[str] = "Computer Science & Engineering"
    prize: Optional[str] = "Certificate & Trophy"
    projectTitle: Optional[str] = None


class DeclareWinnersRequest(BaseModel):
    winners: Optional[List[WinnerItem]] = None
    podium: Optional[List[WinnerItem]] = None


class CertificateVerificationResponse(BaseModel):
    credentialId: str
    eventTitle: str
    clubName: str
    studentName: str
    classRollNo: str
    courseBranch: str
    date: str
    facultyAdvisor: str
    hod: str
    naacCriterion: str = "5.3"
    status: str = "ISSUED"
    verificationUrl: str


# ============================================================================
# 8. TASKS & ANNOUNCEMENTS SCHEMAS
# ============================================================================

class TaskItemResponse(BaseModel):
    id: str
    clubId: str
    title: str
    description: Optional[str] = None
    category: str = "General"
    priority: str = "Medium"
    assignee: str
    dueDate: str
    status: str


class TaskCreateRequest(BaseModel):
    title: str = Field(..., min_length=2)
    description: Optional[str] = None
    category: str = "General"
    priority: str = "Medium"
    assignee: str
    dueDate: str  # YYYY-MM-DD


class TaskStatusUpdateRequest(BaseModel):
    status: str  # pending | in_progress | completed


class AnnouncementItemResponse(BaseModel):
    id: str
    clubId: str
    clubName: str
    title: str
    category: str
    priority: str
    audience: str
    author: str
    date: str
    content: str


class AnnouncementCreateRequest(BaseModel):
    title: str = Field(..., min_length=2)
    category: str = "General Notice"
    priority: str = "Normal"
    audience: str = "All Campus Students"
    author: Optional[str] = None
    content: str
    isPinned: Optional[bool] = False


# ============================================================================
# 9. ADMIN GOVERNANCE SCHEMAS
# ============================================================================

class PendingClubItem(BaseModel):
    id: str
    referenceId: str
    name: str
    category: str
    department: str
    facultyAdvisor: str
    hod: str
    email: str
    phone: str
    clubCode: str
    approvalStatus: str
    status: str
    submittedAt: str


class AdminRejectClubRequest(BaseModel):
    rejectionReason: Optional[str] = None
    reason: Optional[str] = None


ClubRejectRequest = AdminRejectClubRequest

