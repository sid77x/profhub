from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from typing import List, Optional
from core.database import notifications_collection, applications_collection
from schemas.notification import NotificationCreate, NotificationResponse

router = APIRouter()


@router.get("/notifications/{user_id}", response_model=List[NotificationResponse])
async def get_user_notifications(user_id: str):
    """Get all notifications for a user"""
    notifications = []
    async for notification in notifications_collection.find(
        {"user_id": user_id}
    ).sort("created_at", -1):  # Most recent first
        notification["id"] = str(notification["_id"])
        del notification["_id"]
        notifications.append(notification)
    return notifications


@router.get("/notifications/{user_id}/unread")
async def get_unread_count(user_id: str):
    """Get count of unread notifications"""
    count = await notifications_collection.count_documents({
        "user_id": user_id,
        "read": False
    })
    return {"unread_count": count}


@router.put("/notifications/{notification_id}/read")
async def mark_notification_as_read(notification_id: str):
    """Mark a notification as read"""
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid notification ID"
        )
    
    result = await notifications_collection.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"read": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"success": True}


@router.put("/notifications/{user_id}/mark-all-read")
async def mark_all_as_read(user_id: str):
    """Mark all notifications as read for a user"""
    result = await notifications_collection.update_many(
        {"user_id": user_id, "read": False},
        {"$set": {"read": True}}
    )
    
    return {"success": True, "modified_count": result.modified_count}


@router.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: str):
    """Delete a notification"""
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid notification ID"
        )
    
    result = await notifications_collection.delete_one(
        {"_id": ObjectId(notification_id)}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"success": True}


async def create_or_update_application_notification(professor_id: str, gig_id: str, gig_title: str):
    """Create or update notification for new application"""
    from datetime import datetime
    
    # Check if there's already a pending application notification for this gig
    existing = await notifications_collection.find_one({
        "user_id": professor_id,
        "user_type": "professor",
        "metadata.gig_id": gig_id,
        "metadata.notification_type": "new_applications",
        "read": False
    })
    
    if existing:
        # Update existing notification - increment count
        current_count = existing.get("metadata", {}).get("count", 1)
        new_count = current_count + 1
        
        await notifications_collection.update_one(
            {"_id": existing["_id"]},
            {
                "$set": {
                    "message": f"You have {new_count} new applications for {gig_title}",
                    "created_at": datetime.utcnow(),
                    "metadata.count": new_count
                }
            }
        )
    else:
        # Create new notification
        notification = {
            "user_id": professor_id,
            "user_type": "professor",
            "title": "New Application",
            "message": f"You have 1 new application for {gig_title}",
            "type": "info",
            "read": False,
            "link": f"/professor/gigs/{gig_id}/applications",
            "metadata": {
                "gig_id": gig_id,
                "notification_type": "new_applications",
                "count": 1
            },
            "created_at": datetime.utcnow()
        }
        await notifications_collection.insert_one(notification)


async def create_application_status_notification(
    student_id: str, 
    gig_id: str, 
    gig_title: str, 
    status: str
):
    """Create notification for application status change"""
    from datetime import datetime
    
    if status == "accepted":
        notification = {
            "user_id": student_id,
            "user_type": "student",
            "title": "Application Accepted",
            "message": f"Your application for {gig_title} has been accepted!",
            "type": "success",
            "read": False,
            "link": f"/student/gigs/{gig_id}",
            "metadata": {
                "gig_id": gig_id,
                "notification_type": "application_accepted"
            },
            "created_at": datetime.utcnow()
        }
    elif status == "rejected":
        notification = {
            "user_id": student_id,
            "user_type": "student",
            "title": "Application Update",
            "message": f"Your application for {gig_title} was not selected this time.",
            "type": "warning",
            "read": False,
            "link": f"/student/gigs/{gig_id}",
            "metadata": {
                "gig_id": gig_id,
                "notification_type": "application_rejected"
            },
            "created_at": datetime.utcnow()
        }
    else:
        return  # Don't create notification for pending status
    
    await notifications_collection.insert_one(notification)


async def create_gig_lifecycle_notifications(
    gig_id: str,
    gig_title: str,
    lifecycle: str,
    paused_reason: Optional[str] = None,
):
    """Notify all applicants when a gig is put on hold, reactivated, or cancelled/closed."""
    from datetime import datetime

    if lifecycle == "on-hold":
        title = "Gig Put On Hold"
        msg = f"The gig '{gig_title}' has been put on hold."
        if paused_reason:
            msg += f" Reason: {paused_reason}"
        ntype = "warning"
        ncode = "gig_on_hold"
    elif lifecycle == "reactivated":
        title = "Gig Reactivated"
        msg = f"The gig '{gig_title}' is active again and accepting progress/applications."
        ntype = "success"
        ncode = "gig_reactivated"
    elif lifecycle in ["closed", "cancelled"]:
        title = "Gig Cancelled"
        msg = f"The gig '{gig_title}' has been cancelled/closed by the professor."
        ntype = "warning"
        ncode = "gig_cancelled"
    else:
        return

    applicant_ids: set[str] = set()
    async for app in applications_collection.find({"gig_id": gig_id}):
        sid = app.get("student_id")
        if sid:
            applicant_ids.add(sid)

    if not applicant_ids:
        return

    docs = []
    for student_id in applicant_ids:
        docs.append(
            {
                "user_id": student_id,
                "user_type": "student",
                "title": title,
                "message": msg,
                "type": ntype,
                "read": False,
                "link": "/student/applications",
                "metadata": {
                    "gig_id": gig_id,
                    "notification_type": ncode,
                    "gig_status": lifecycle,
                },
                "created_at": datetime.utcnow(),
            }
        )

    if docs:
        await notifications_collection.insert_many(docs)
