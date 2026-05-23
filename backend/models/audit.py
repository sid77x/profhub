from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class AuditLog(BaseModel):
    """Audit log model for tracking admin actions"""
    id: Optional[str] = None
    admin_id: str
    admin_name: str
    admin_email: str
    action: str  # "onboard_professor", "deboard_student", "view_professors", etc
    resource_type: str  # "professor", "student", "gig", "application"
    resource_id: Optional[str] = None  # ID of affected resource
    resource_name: Optional[str] = None  # Name/email of affected resource
    details: Optional[dict] = None  # Additional context (old values, new values, etc)
    status: str = "success"  # "success" or "failure"
    error_message: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime = None
    
    class Config:
        from_attributes = True


class AuditLogResponse(BaseModel):
    """Response model for audit logs"""
    id: str
    admin_name: str
    admin_email: str
    action: str
    resource_type: str
    resource_name: Optional[str] = None
    status: str
    timestamp: datetime


class AuditStatsResponse(BaseModel):
    """Audit statistics"""
    total_actions: int
    actions_today: int
    actions_this_week: int
    actions_by_admin: dict
