from pydantic import BaseModel, EmailStr
from typing import List, Optional


class StudentBase(BaseModel):
    name: str
    email: EmailStr
    reg_no: str
    department: str
    year: Optional[int] = None
    cgpa: Optional[float] = None
    college_name: Optional[str] = None
    previous_publications: Optional[str] = None


class StudentCreate(StudentBase):
    year: int
    cgpa: float
    password: str


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    cgpa: Optional[float] = None
    college_name: Optional[str] = None
    skills: Optional[List[str]] = None
    resume_url: Optional[str] = None
    bio: Optional[str] = None
    previous_publications: Optional[str] = None


class StudentLogin(BaseModel):
    email: EmailStr
    password: str


class StudentResponse(StudentBase):
    id: str
    skills: List[str] = []
    resume_url: Optional[str] = None
    bio: Optional[str] = None
    cgpa: Optional[float] = None

    class Config:
        from_attributes = True
