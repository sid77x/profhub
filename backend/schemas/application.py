from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class ApplicationBase(BaseModel):
    student_name: str
    student_email: EmailStr
    student_year: Optional[str] = None
    student_cgpa: Optional[str] = None
    resume_link: str
    cover_letter: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    gig_id: str
    student_id: Optional[str] = None  # Optional for backward compatibility


class ApplicationResponse(ApplicationBase):
    id: str
    gig_id: str
    student_id: Optional[str] = None
    status: str
    applied_at: datetime

    class Config:
        from_attributes = True
