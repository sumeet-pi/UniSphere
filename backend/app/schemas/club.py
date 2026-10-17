"""Club schemas."""

from pydantic import BaseModel, Field


class ClubResponse(BaseModel):
    id: str
    name: str
    slug: str
    category: str
    description: str | None = None
    logo_url: str | None = None
    banner_url: str | None = None
    faculty_head: str | None = None
    status: str
    member_count: int = 0
    upcoming_events_count: int = 0
    # Frontend compat aliases
    logo: str | None = None
    banner: str | None = None
    memberCount: int = 0
    facultyHead: str | None = None
    upcomingEventsCount: int = 0
    coreTeam: list = []

    model_config = {"from_attributes": True}


class ClubCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    category: str = Field(..., min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=2000)
    logo_url: str | None = None
    banner_url: str | None = None
    faculty_head: str | None = None


class ClubUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=200)
    category: str | None = None
    description: str | None = None
    logo_url: str | None = None
    banner_url: str | None = None
    faculty_head: str | None = None
    status: str | None = None
