"""
Audit logging helper functions for tracking admin actions
"""
from datetime import datetime
from typing import Optional, Dict, Any
from bson import ObjectId
from core.database import audit_logs_collection


async def log_audit_action(
    admin_id: str,
    admin_name: str,
    admin_email: str,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    resource_name: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    status: str = "success",
    error_message: Optional[str] = None,
    ip_address: Optional[str] = None
) -> str:
    """
    Log an admin action for audit trail
    
    Args:
        admin_id: ID of the admin performing the action
        admin_name: Name of the admin
        admin_email: Email of the admin
        action: Type of action (e.g., "onboard_professor", "deboard_student")
        resource_type: Type of resource affected (e.g., "professor", "student", "gig")
        resource_id: ID of the affected resource
        resource_name: Name/email of the affected resource
        details: Additional context data
        status: Success or failure
        error_message: Error message if failed
        ip_address: Client IP address
    
    Returns:
        Inserted log document ID
    """
    audit_log = {
        "admin_id": str(admin_id),
        "admin_name": admin_name,
        "admin_email": admin_email,
        "action": action,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "resource_name": resource_name,
        "details": details or {},
        "status": status,
        "error_message": error_message,
        "ip_address": ip_address,
        "timestamp": datetime.utcnow()
    }
    
    result = await audit_logs_collection.insert_one(audit_log)
    return str(result.inserted_id)


async def get_audit_logs(
    limit: int = 50,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    admin_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> list:
    """Get filtered audit logs"""
    query = {}
    
    if action:
        query["action"] = action
    if resource_type:
        query["resource_type"] = resource_type
    if admin_id:
        query["admin_id"] = str(admin_id)
    
    if start_date or end_date:
        date_query = {}
        if start_date:
            date_query["$gte"] = start_date
        if end_date:
            date_query["$lte"] = end_date
        query["timestamp"] = date_query
    
    logs = await audit_logs_collection.find(query).sort("timestamp", -1).limit(limit).to_list(None)
    
    return [
        {
            "id": str(log["_id"]),
            "admin_name": log.get("admin_name"),
            "admin_email": log.get("admin_email"),
            "action": log.get("action"),
            "resource_type": log.get("resource_type"),
            "resource_name": log.get("resource_name"),
            "status": log.get("status"),
            "timestamp": log.get("timestamp"),
            "details": log.get("details")
        }
        for log in logs
    ]


async def get_audit_stats() -> dict:
    """Get audit log statistics"""
    from datetime import timedelta
    
    now = datetime.utcnow()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = today - timedelta(days=7)
    
    total_count = await audit_logs_collection.count_documents({})
    today_count = await audit_logs_collection.count_documents({"timestamp": {"$gte": today}})
    week_count = await audit_logs_collection.count_documents({"timestamp": {"$gte": week_ago}})
    
    # Count by admin
    admin_stats = await audit_logs_collection.aggregate([
        {"$group": {"_id": "$admin_name", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]).to_list(None)
    
    actions_by_admin = {stat["_id"]: stat["count"] for stat in admin_stats}
    
    return {
        "total_actions": total_count,
        "actions_today": today_count,
        "actions_this_week": week_count,
        "actions_by_admin": actions_by_admin
    }
