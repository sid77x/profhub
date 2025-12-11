from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from core.database import gigs_collection
from schemas.gig import GigCreate, GigUpdate, GigClose, GigHold, GigResponse

router = APIRouter()


@router.post("/gigs", response_model=GigResponse, status_code=status.HTTP_201_CREATED)
async def create_gig(gig: GigCreate):
    """Create a new gig"""
    gig_dict = gig.model_dump()
    gig_dict["status"] = "open"  # Set default status
    result = await gigs_collection.insert_one(gig_dict)
    created_gig = await gigs_collection.find_one({"_id": result.inserted_id})
    created_gig["id"] = str(created_gig["_id"])
    return created_gig


@router.get("/gigs", response_model=list[GigResponse])
async def list_all_gigs(status: str = None, professor_id: str = None):
    """List all gigs (public endpoint for students) with optional filters"""
    query = {}
    if status:
        query["status"] = status
    if professor_id:
        query["professor_id"] = professor_id
    
    gigs = []
    async for gig in gigs_collection.find(query):
        gig["id"] = str(gig["_id"])
        gigs.append(gig)
    return gigs


@router.get("/gigs/professor/{professor_id}", response_model=list[GigResponse])
async def get_professor_gigs(professor_id: str):
    """Get all gigs for a specific professor"""
    gigs = []
    async for gig in gigs_collection.find({"professor_id": professor_id}):
        gig["id"] = str(gig["_id"])
        gigs.append(gig)
    return gigs


@router.get("/gigs/{gig_id}", response_model=GigResponse)
async def get_gig(gig_id: str):
    """Get gig details by ID"""
    if not ObjectId.is_valid(gig_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid gig ID"
        )
    
    gig = await gigs_collection.find_one({"_id": ObjectId(gig_id)})
    if not gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gig not found"
        )
    gig["id"] = str(gig["_id"])
    return gig


@router.put("/gigs/{gig_id}", response_model=GigResponse)
async def update_gig(gig_id: str, gig_update: GigUpdate):
    """Update gig details"""
    if not ObjectId.is_valid(gig_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid gig ID"
        )
    
    # Update only provided fields
    update_data = gig_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    result = await gigs_collection.update_one(
        {"_id": ObjectId(gig_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gig not found"
        )
    
    gig = await gigs_collection.find_one({"_id": ObjectId(gig_id)})
    gig["id"] = str(gig["_id"])
    return gig


@router.put("/gigs/{gig_id}/close", response_model=GigResponse)
async def close_gig(gig_id: str, close_data: GigClose):
    """Mark gig as closed"""
    if not ObjectId.is_valid(gig_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid gig ID"
        )
    
    update_dict = {"status": "closed"}
    if close_data.publication_link:
        update_dict["publication_link"] = close_data.publication_link
    if close_data.publication_venue:
        update_dict["publication_venue"] = close_data.publication_venue
    
    result = await gigs_collection.update_one(
        {"_id": ObjectId(gig_id)},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gig not found"
        )
    
    gig = await gigs_collection.find_one({"_id": ObjectId(gig_id)})
    gig["id"] = str(gig["_id"])
    return gig


@router.put("/gigs/{gig_id}/hold", response_model=GigResponse)
async def put_gig_on_hold(gig_id: str, hold_data: GigHold):
    """Put gig on hold with a reason"""
    if not ObjectId.is_valid(gig_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid gig ID"
        )
    
    result = await gigs_collection.update_one(
        {"_id": ObjectId(gig_id)},
        {"$set": {"status": "on-hold", "paused_reason": hold_data.paused_reason}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gig not found"
        )
    
    gig = await gigs_collection.find_one({"_id": ObjectId(gig_id)})
    gig["id"] = str(gig["_id"])
    return gig


@router.put("/gigs/{gig_id}/activate", response_model=GigResponse)
async def activate_gig(gig_id: str):
    """Activate gig from on-hold status"""
    if not ObjectId.is_valid(gig_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid gig ID"
        )
    
    result = await gigs_collection.update_one(
        {"_id": ObjectId(gig_id)},
        {"$set": {"status": "open", "paused_reason": None}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gig not found"
        )
    
    gig = await gigs_collection.find_one({"_id": ObjectId(gig_id)})
    gig["id"] = str(gig["_id"])
    return gig


@router.delete("/gigs/{gig_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gig(gig_id: str):
    """Delete a gig"""
    if not ObjectId.is_valid(gig_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid gig ID"
        )
    
    result = await gigs_collection.delete_one({"_id": ObjectId(gig_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gig not found"
        )
    
    return None
