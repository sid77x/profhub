from pydantic import BaseModel, EmailStr
from typing import List, Optional


class StudentBase(BaseModel):
    name: str
    email: EmailStr
    reg_no: str
    department: str
    year: int
    cgpa: float
    college_name: Optional[str] = None


class StudentCreate(StudentBase):
    password: str
    id_card_image: Optional[str] = None  # Base64 encoded image


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    cgpa: Optional[float] = None
    college_name: Optional[str] = None
    skills: Optional[List[str]] = None
    resume_url: Optional[str] = None
    bio: Optional[str] = None
    id_card_image: Optional[str] = None  # Base64 encoded image


class StudentLogin(BaseModel):
    email: EmailStr
    password: str


class StudentResponse(StudentBase):
    id: str
    skills: List[str] = []
    resume_url: Optional[str] = None
    bio: Optional[str] = None
    cgpa: float
    id_card_image: Optional[str] = None

    class Config:
        from_attributes = True
