from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from core.database import applications_collection, gigs_collection
from schemas.application import ApplicationCreate, ApplicationResponse
from .notifications import create_or_update_application_notification, create_application_status_notification

router = APIRouter()


@router.post("/applications", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(application: ApplicationCreate):
    """Submit a new application for a gig"""
    from datetime import datetime
    
    application_dict = application.model_dump()
    application_dict["status"] = "pending"
    application_dict["applied_at"] = datetime.utcnow()
    
    print(f"Creating application: gig_id={application_dict.get('gig_id')}, student_id={application_dict.get('student_id')}")
    
    result = await applications_collection.insert_one(application_dict)
    created_application = await applications_collection.find_one({"_id": result.inserted_id})
    created_application["id"] = str(created_application["_id"])
    
    # Get gig details for notification
    gig = await gigs_collection.find_one({"_id": ObjectId(application_dict["gig_id"])})
    if gig:
        # Create or update notification for professor
        await create_or_update_application_notification(
            professor_id=gig["professor_id"],
            gig_id=application_dict["gig_id"],
            gig_title=gig["title"]
        )
    
    return created_application


@router.get("/applications/gig/{gig_id}", response_model=list[ApplicationResponse])
async def get_gig_applications(gig_id: str):
    """Get all applications for a specific gig"""
    applications = []
    async for application in applications_collection.find({"gig_id": gig_id}):
        application["id"] = str(application["_id"])
        applications.append(application)
    return applications


@router.get("/applications/check/{gig_id}/{student_id}")
async def check_application_exists(gig_id: str, student_id: str):
    """Check if a student has already applied to a gig"""
    print(f"Checking application: gig_id={gig_id}, student_id={student_id}")
    
    existing = await applications_collection.find_one({
        "gig_id": gig_id,
        "student_id": student_id
    })
    
    print(f"Found existing application: {existing is not None}")
    
    if existing:
        existing["id"] = str(existing["_id"])
        del existing["_id"]
        return {"has_applied": True, "application": existing}
    
    return {"has_applied": False, "application": None}


@router.put("/applications/{application_id}/status")
async def update_application_status(application_id: str, status: str):
    """Update application status (accept/reject)"""
    print(f"Updating application {application_id} to status: {status}")
    
    if not ObjectId.is_valid(application_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid application ID"
        )
    
    if status not in ["pending", "accepted", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status: {status}. Must be pending, accepted, or rejected"
        )
    
    # Get application before update to get student_id and gig_id
    application_before = await applications_collection.find_one({"_id": ObjectId(application_id)})
    if not application_before:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    result = await applications_collection.update_one(
        {"_id": ObjectId(application_id)},
        {"$set": {"status": status}}
    )
    
    print(f"Update result: matched={result.matched_count}, modified={result.modified_count}")
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    application = await applications_collection.find_one({"_id": ObjectId(application_id)})
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found after update"
        )
    
    # Create notification for student if status changed
    if status in ["accepted", "rejected"]:
        gig = await gigs_collection.find_one({"_id": ObjectId(application_before["gig_id"])})
        if gig:
            await create_application_status_notification(
                student_id=application_before["student_id"],
                gig_id=application_before["gig_id"],
                gig_title=gig["title"],
                status=status
            )
    
    application["id"] = str(application["_id"])
    del application["_id"]
    print(f"Returning application: {application}")
    return application
