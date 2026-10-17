"""Announcement schemas."""

from datetime import datetime
from pydantic import BaseModel, Field


class AnnouncementResponse(BaseModel):
    id: str
    club_id: str
    title: str
    body: str | None = None
    status: str
    created_at: datetime
    # Frontend compat
    clubId: str = ""
    date: str = ""
    content: str | None = None

    model_config = {"from_attributes": True}


class AnnouncementCreateRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=300)
    body: str | None = Field(default=None, max_length=5000)
    event_id: str | None = None
    status: str = "published"
