from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from core.database import professors_collection
from schemas.professor import ProfessorCreate, ProfessorUpdate, ProfessorResponse

router = APIRouter()


@router.post("/professors", response_model=ProfessorResponse, status_code=status.HTTP_201_CREATED)
async def create_professor(professor: ProfessorCreate):
    """Create a new professor profile"""
    # Check if email already exists
    existing = await professors_collection.find_one({"email": professor.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Professor with this email already exists"
        )
    
    professor_dict = professor.model_dump()
    result = await professors_collection.insert_one(professor_dict)
    created_professor = await professors_collection.find_one({"_id": result.inserted_id})
    created_professor["id"] = str(created_professor["_id"])
    return created_professor


@router.get("/professors/{professor_id}", response_model=ProfessorResponse)
async def get_professor(professor_id: str):
    """Get professor profile by ID"""
    if not ObjectId.is_valid(professor_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid professor ID"
        )
    
    professor = await professors_collection.find_one({"_id": ObjectId(professor_id)})
    if not professor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor not found"
        )
    professor["id"] = str(professor["_id"])
    return professor


@router.put("/professors/{professor_id}", response_model=ProfessorResponse)
async def update_professor(professor_id: str, professor_update: ProfessorUpdate):
    """Update professor profile"""
    if not ObjectId.is_valid(professor_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid professor ID"
        )
    
    # Update only provided fields
    update_data = professor_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    result = await professors_collection.update_one(
        {"_id": ObjectId(professor_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor not found"
        )
    
    professor = await professors_collection.find_one({"_id": ObjectId(professor_id)})
    professor["id"] = str(professor["_id"])
    return professor


@router.get("/professors", response_model=list[ProfessorResponse])
async def list_professors():
    """List all professors"""
    professors = []
    async for professor in professors_collection.find():
        professor["id"] = str(professor["_id"])
        professors.append(professor)
    return professors
