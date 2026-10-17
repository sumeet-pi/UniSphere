"""Registration schemas."""

from datetime import datetime
from pydantic import BaseModel


class RegistrationResponse(BaseModel):
    id: str
    event_id: str
    user_id: str
    status: str
    registered_at: datetime

    model_config = {"from_attributes": True}


class MyRegistrationResponse(BaseModel):
    """Registration details enriched with event info for the student view."""
    id: str
    event_id: str
    status: str
    registered_at: datetime
    # Event details
    event_title: str = ""
    event_date: str = ""
    event_time: str | None = None
    event_venue: str | None = None
    event_club_name: str = ""
    event_club_id: str = ""
    event_image: str | None = None
    event_description: str | None = None
    event_status: str = ""


class RegistrationCreateResponse(BaseModel):
    id: str
    event_id: str
    user_id: str
    status: str
    registered_at: datetime
    message: str = "Successfully registered for the event."

    model_config = {"from_attributes": True}
