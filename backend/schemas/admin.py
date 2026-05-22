from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class AdminResponse(BaseModel):
    id: str
    name: str
    email: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None


class AdminToken(BaseModel):
    access_token: str
    token_type: str
    admin_id: str
    admin_name: str


class ProfessorData(BaseModel):
    """For admin viewing professor data"""
    id: str
    name: str
    email: str
    department: str
    qualification: str
    college_name: Optional[str] = None
    experience_years: Optional[int] = None
    is_verified: bool = True
    gigs_posted: int = 0
    created_at: datetime


class StudentData(BaseModel):
    """For admin viewing student data"""
    id: str
    name: str
    email: str
    registration_number: str
    year: int
    cgpa: float
    college_name: str
    is_verified: bool = True
    applications_submitted: int = 0
    created_at: datetime


class GigData(BaseModel):
    """For admin viewing gig data"""
    id: str
    title: str
    professor_id: str
    professor_name: str
    status: str
    created_at: datetime
    applications_count: int = 0
    is_approved: bool = True


class ApplicationData(BaseModel):
    """For admin viewing application data"""
    id: str
    student_name: str
    student_email: str
    gig_title: str
    gig_id: str
    status: str
    applied_at: datetime


class OnboardProfessorRequest(BaseModel):
    """For admin onboarding a professor"""
    name: str
    email: EmailStr
    password: str
    department: str
    qualification: str
    college_name: Optional[str] = None
    research_areas: Optional[str] = None
    experience_years: Optional[int] = None
    previous_publications: Optional[str] = None


class OnboardStudentRequest(BaseModel):
    """For admin onboarding a student"""
    name: str
    email: EmailStr
    password: str
    year: int
    cgpa: float
    registration_number: str
    college_name: str


class OnboardResponse(BaseModel):
    message: str
    user_id: str
    email: str
