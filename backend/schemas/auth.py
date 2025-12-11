from pydantic import BaseModel, EmailStr
from typing import Optional


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: str
    college_name: Optional[str] = None
    qualification: str
    research_areas: Optional[str] = None
    experience_years: Optional[int] = None
    previous_publications: Optional[str] = None
