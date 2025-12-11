from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from typing import List
from datetime import datetime
import hashlib

from core.database import database, professors_collection, gigs_collection, applications_collection
from schemas.student import StudentCreate, StudentResponse, StudentLogin, StudentUpdate
from core.auth import create_access_token

router = APIRouter()

# Create students collection reference
students_collection = database["students"]


def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return hashlib.sha256(plain_password.encode("utf-8")).hexdigest() == hashed_password


def student_doc_to_response(doc) -> dict:
    """Convert MongoDB document to response format"""
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "email": doc["email"],
        "reg_no": doc["reg_no"],
        "department": doc["department"],
        "year": doc["year"],
        "college_name": doc.get("college_name"),
        "skills": doc.get("skills", []),
        "resume_url": doc.get("resume_url"),
        "bio": doc.get("bio"),
    }


@router.post("/students/register", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def register_student(student: StudentCreate):
    """Register a new student"""
    # Check if email already exists
    existing = await students_collection.find_one({"email": student.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if reg_no already exists
    existing_reg = await students_collection.find_one({"reg_no": student.reg_no})
    if existing_reg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration number already exists"
        )
    
    # Create student document
    student_dict = student.model_dump(exclude={"password"})
    student_dict["password"] = hash_password(student.password)
    student_dict["skills"] = []
    student_dict["resume_url"] = None
    student_dict["bio"] = None
    student_dict["created_at"] = datetime.utcnow()
    
    result = await students_collection.insert_one(student_dict)
    created_doc = await students_collection.find_one({"_id": result.inserted_id})
    
    return student_doc_to_response(created_doc)


@router.post("/students/login")
async def login_student(credentials: StudentLogin):
    """Student login"""
    student_doc = await students_collection.find_one({"email": credentials.email})
    
    if not student_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    stored_hash = student_doc.get("password")
    if not stored_hash or not verify_password(credentials.password, stored_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    token_data = {"sub": str(student_doc["_id"]), "type": "student"}
    access_token = create_access_token(token_data)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "student_id": str(student_doc["_id"]),
        "student": student_doc_to_response(student_doc)
    }


@router.get("/students/{student_id}", response_model=StudentResponse)
async def get_student(student_id: str):
    """Get student by ID"""
    try:
        oid = ObjectId(student_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid student ID")
    
    doc = await students_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return student_doc_to_response(doc)


@router.put("/students/{student_id}", response_model=StudentResponse)
async def update_student(student_id: str, update_data: StudentUpdate):
    """Update student profile"""
    try:
        oid = ObjectId(student_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid student ID")
    
    # Build update dictionary
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No data to update")
    
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await students_collection.find_one_and_update(
        {"_id": oid},
        {"$set": update_dict},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return student_doc_to_response(result)


@router.get("/students/{student_id}/applications")
async def get_student_applications(student_id: str):
    """Get all applications submitted by a student"""
    try:
        oid = ObjectId(student_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid student ID")
    
    # Verify student exists
    student = await students_collection.find_one({"_id": oid})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Find applications by student_id or by email (for backward compatibility)
    applications = []
    async for app in applications_collection.find({
        "$or": [
            {"student_id": student_id},
            {"student_email": student["email"]}
        ]
    }):
        # Get gig details
        gig = await gigs_collection.find_one({"_id": ObjectId(app["gig_id"])})
        
        app_data = {
            "id": str(app["_id"]),
            "gig_id": app["gig_id"],
            "student_name": app["student_name"],
            "student_email": app["student_email"],
            "student_year": app.get("student_year"),
            "student_cgpa": app.get("student_cgpa"),
            "resume_link": app["resume_link"],
            "cover_letter": app.get("cover_letter"),
            "status": app["status"],
            "applied_at": app["applied_at"],
            "gig": None
        }
        
        if gig:
            app_data["gig"] = {
                "id": str(gig["_id"]),
                "title": gig["title"],
                "description": gig.get("description"),
                "status": gig["status"]
            }
        
        applications.append(app_data)
    
    return applications
