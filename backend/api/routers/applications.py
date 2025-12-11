from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from core.database import applications_collection
from schemas.application import ApplicationCreate, ApplicationResponse

router = APIRouter()


@router.post("/applications", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(application: ApplicationCreate):
    """Submit a new application for a gig"""
    from datetime import datetime
    
    application_dict = application.model_dump()
    application_dict["status"] = "pending"
    application_dict["applied_at"] = datetime.utcnow()
    
    result = await applications_collection.insert_one(application_dict)
    created_application = await applications_collection.find_one({"_id": result.inserted_id})
    created_application["id"] = str(created_application["_id"])
    return created_application


@router.get("/applications/gig/{gig_id}", response_model=list[ApplicationResponse])
async def get_gig_applications(gig_id: str):
    """Get all applications for a specific gig"""
    applications = []
    async for application in applications_collection.find({"gig_id": gig_id}):
        application["id"] = str(application["_id"])
        applications.append(application)
    return applications


@router.put("/applications/{application_id}/status")
async def update_application_status(application_id: str, status: str):
    """Update application status (accept/reject)"""
    if not ObjectId.is_valid(application_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid application ID"
        )
    
    if status not in ["pending", "accepted", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status"
        )
    
    result = await applications_collection.update_one(
        {"_id": ObjectId(application_id)},
        {"$set": {"status": status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    application = await applications_collection.find_one({"_id": ObjectId(application_id)})
    application["id"] = str(application["_id"])
    return application
