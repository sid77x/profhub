from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Notification(BaseModel):
    id: str
    user_id: str
    user_type: str
    title: str
    message: str
    type: str
    read: bool
    link: Optional[str]
    metadata: Optional[dict]
    created_at: datetime
