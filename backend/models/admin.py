from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class Admin(BaseModel):
    """Admin model for system administration"""
    id: Optional[str] = None
    name: str
    email: EmailStr
    password_hash: str
    is_active: bool = True
    created_at: datetime = None
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True
