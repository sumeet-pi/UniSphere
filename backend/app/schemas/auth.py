"""Auth request/response schemas."""

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    """Student registration request schema."""
    full_name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    phone: str | None = Field(default=None, max_length=20)
    course: str | None = Field(default=None, max_length=50)
    branch: str | None = Field(default=None, max_length=100)
    semester: str | None = Field(default=None, max_length=20)
    class_roll_no: str | None = Field(default=None, max_length=30)
    university_roll_no: str | None = Field(default=None, max_length=30)


# Backward compatibility alias
StudentSignupRequest = SignupRequest


class CoordinatorSignupRequest(BaseModel):
    """Club coordinator registration request schema."""
    club_name: str = Field(..., min_length=2, max_length=200)
    department: str = Field(..., min_length=2, max_length=100)
    category: str = Field(..., min_length=2, max_length=100)
    hod: str = Field(..., min_length=2, max_length=200)
    faculty_advisor: str = Field(..., min_length=2, max_length=200)
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=25)
    description: str | None = Field(default=None, max_length=2000)
    password: str = Field(..., min_length=8, max_length=128)


class CoordinatorSignupResponse(BaseModel):
    """Club coordinator registration response schema (pending approval)."""
    message: str
    status: str = "pending_approval"
    reference_id: str
    club_id: str
    club_name: str
    department: str
    category: str
    hod: str
    faculty_advisor: str
    email: str
    phone: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    status: str
    phone: str | None = None
    course: str | None = None
    branch: str | None = None
    semester: str | None = None
    class_roll_no: str | None = None
    university_roll_no: str | None = None
    # Frontend compatibility fields
    name: str | None = None  # alias for full_name
    clubId: str | None = None
    managedClubId: str | None = None
    clubRole: str | None = None

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UserUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    phone: str | None = None
    email: EmailStr | None = None
    avatarUrl: str | None = None

