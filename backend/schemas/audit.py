from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class AuditLogRequest(BaseModel):
    """Schema for creating audit logs"""
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    resource_name: Optional[str] = None
    details: Optional[dict] = None
    status: str = "success"
    error_message: Optional[str] = None


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


class AuditLogsFilterRequest(BaseModel):
    """Filter for audit logs"""
    action: Optional[str] = None
    resource_type: Optional[str] = None
    admin_id: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    limit: int = 50


class AuditStatsResponse(BaseModel):
    """Audit statistics"""
    total_actions: int
    actions_today: int
    actions_this_week: int
    actions_by_admin: dict
