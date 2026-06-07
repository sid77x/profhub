from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel


class ChatConversationResponse(BaseModel):
    id: str
    conversation_key: str
    gig_id: str
    gig_title: str
    professor_id: str
    professor_name: str
    student_id: str
    student_name: str
    application_id: str
    unlocked: bool = True
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    created_at: datetime
    other_participant_id: str
    other_participant_name: str
    other_participant_type: Literal["professor", "student"]


class ChatMessageCreate(BaseModel):
    sender_id: str
    sender_type: Literal["professor", "student"]
    message: str


class ChatMessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    sender_type: Literal["professor", "student"]
    sender_name: str
    message: str
    created_at: datetime
