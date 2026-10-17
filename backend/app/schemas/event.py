"""Event schemas."""

from pydantic import BaseModel, Field
import json


class EventResponse(BaseModel):
    id: str
    club_id: str
    title: str
    description: str | None = None
    date: str
    time: str | None = None
    venue: str | None = None
    capacity: int | None = None
    registered_count: int = 0
    status: str
    eligibility: str | None = None
    rules: list[str] = []
    image_url: str | None = None
    # Frontend compat aliases
    clubId: str = ""
    clubName: str = ""
    registeredCount: int = 0
    image: str | None = None

    model_config = {"from_attributes": True}


class EventCreateRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=300)
    description: str | None = Field(default=None, max_length=5000)
    date: str = Field(..., min_length=10, max_length=10)  # YYYY-MM-DD
    time: str | None = Field(default=None, max_length=50)
    start_time: str | None = None
    end_time: str | None = None
    venue: str | None = Field(default=None, max_length=300)
    capacity: int | None = Field(default=None, gt=0)
    registration_deadline: str | None = None
    status: str = Field(default="published")
    eligibility: str | None = None
    rules: str | None = None  # comma-separated string
    image_url: str | None = None
    category: str | None = None  # not stored on event, but accepted from form


class EventUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    date: str | None = None
    time: str | None = None
    venue: str | None = None
    capacity: int | None = None
    status: str | None = None
    eligibility: str | None = None
    rules: str | None = None
    image_url: str | None = None
