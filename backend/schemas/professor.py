from pydantic import BaseModel, EmailStr
from typing import Optional


class ProfessorBase(BaseModel):
    name: str
    department: str
    email: EmailStr
    college_name: Optional[str] = None
    qualification: str
    research_areas: Optional[str] = None
    experience_years: Optional[int] = None
    previous_publications: Optional[str] = None


class ProfessorCreate(ProfessorBase):
    pass


class ProfessorUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    email: Optional[EmailStr] = None
    college_name: Optional[str] = None
    qualification: Optional[str] = None
    research_areas: Optional[str] = None
    experience_years: Optional[int] = None
    previous_publications: Optional[str] = None


class ProfessorResponse(ProfessorBase):
    id: str

    class Config:
        from_attributes = True
