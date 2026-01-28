from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class NotificationBase(BaseModel):
    user_id: str  # professor_id or student_id
    user_type: Literal["professor", "student"]
    title: str
    message: str
    type: Literal["info", "success", "warning"]
    read: bool = False
    link: Optional[str] = None  # Where to navigate when clicked
    metadata: Optional[dict] = None  # For storing gig_id, application_id, count, etc.
    created_at: datetime = Field(default_factory=datetime.utcnow)


class NotificationCreate(BaseModel):
    user_id: str
    user_type: Literal["professor", "student"]
    title: str
    message: str
    type: Literal["info", "success", "warning"] = "info"
    link: Optional[str] = None
    metadata: Optional[dict] = None


class NotificationResponse(NotificationBase):
    id: str

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
