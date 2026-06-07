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


class GoogleStudentAuthRequest(BaseModel):
    email: EmailStr
    google_uid: str
    name: Optional[str] = None
    photo_url: Optional[str] = None


class GoogleStudentAuthResponse(BaseModel):
    exists: bool
    needs_registration: bool
    student_id: Optional[str] = None
    student: Optional["StudentResponse"] = None
    message: str


class GoogleStudentRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    google_uid: str
    reg_no: str
    department: str
    year: int
    cgpa: float
    college_name: str
    previous_publications: Optional[str] = None
    photo_url: Optional[str] = None


class StudentResponse(StudentBase):
    id: str
    skills: List[str] = []
    resume_url: Optional[str] = None
    bio: Optional[str] = None
    cgpa: Optional[float] = None

    class Config:
        from_attributes = True
