from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from bson import ObjectId
from datetime import datetime, timedelta
import hashlib

from core.config import settings
from core.database import database, gigs_collection, applications_collection, otp_collection
from core.email import send_otp_email
from core.otp import generate_otp, hash_otp
from schemas.otp import OtpRequestRequest, OtpVerifyRequest, OtpSendResponse
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
        "cgpa": doc.get("cgpa"),
        "college_name": doc.get("college_name"),
        "previous_publications": doc.get("previous_publications"),
        "skills": doc.get("skills", []),
        "resume_url": doc.get("resume_url"),
        "bio": doc.get("bio"),
        "id_card_image": doc.get("id_card_image"),
    }


@router.post("/students/register", status_code=status.HTTP_400_BAD_REQUEST)
async def register_student_deprecated():
    """Deprecated: use OTP registration endpoints"""
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Use /api/students/register/request-otp and /api/students/register/verify-otp"
    )


@router.post("/students/register/request-otp", response_model=OtpSendResponse, status_code=status.HTTP_200_OK)
async def request_student_register_otp(student: StudentCreate):
    """Send OTP for student registration"""
    existing = await students_collection.find_one({"email": student.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    existing_reg = await students_collection.find_one({"reg_no": student.reg_no})
    if existing_reg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration number already exists"
        )

    otp = generate_otp()
    otp_doc = {
        "email": student.email,
        "user_type": "student",
        "otp_hash": hash_otp(otp),
        "attempts": 0,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(minutes=settings.otp_expiry_minutes),
        "payload": {
            **student.model_dump(exclude={"password"}),
            "password": hash_password(student.password),
            "skills": [],
            "resume_url": None,
            "bio": None,
            "id_card_image": student.id_card_image,
            "created_at": datetime.utcnow()
        }
    }

    await otp_collection.delete_many({"email": student.email, "user_type": "student"})
    await otp_collection.insert_one(otp_doc)

    try:
        send_otp_email(student.email, otp, "student", settings.otp_expiry_minutes)
    except Exception as exc:
        await otp_collection.delete_many({"email": student.email, "user_type": "student"})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send OTP email: {exc}"
        )

    return {
        "message": "OTP sent to email",
        "expires_in_seconds": settings.otp_expiry_minutes * 60
    }


@router.post("/students/register/verify-otp", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def verify_student_register_otp(request: OtpVerifyRequest):
    """Verify OTP and create student account"""
    otp_doc = await otp_collection.find_one({"email": request.email, "user_type": "student"})
    if not otp_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP not found or expired"
        )

    if otp_doc.get("expires_at") and otp_doc["expires_at"] < datetime.utcnow():
        await otp_collection.delete_many({"email": request.email, "user_type": "student"})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired"
        )

    if otp_doc.get("attempts", 0) >= settings.otp_max_attempts:
        await otp_collection.delete_many({"email": request.email, "user_type": "student"})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP attempt limit exceeded"
        )

    if hash_otp(request.otp) != otp_doc.get("otp_hash"):
        await otp_collection.update_one(
            {"_id": otp_doc["_id"]},
            {"$inc": {"attempts": 1}}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )

    student_payload = otp_doc.get("payload", {})
    result = await students_collection.insert_one(student_payload)
    created_doc = await students_collection.find_one({"_id": result.inserted_id})

    await otp_collection.delete_many({"email": request.email, "user_type": "student"})

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


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str
    confirm_password: str


@router.post("/students/forgot-password/request-otp", response_model=OtpSendResponse)
async def request_student_forgot_password_otp(request: OtpRequestRequest):
    """Send OTP for student password reset"""
    student = await students_collection.find_one({"email": request.email})
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not registered"
        )

    otp = generate_otp()
    otp_doc = {
        "email": request.email,
        "user_type": "student",
        "otp_type": "forgot_password",
        "otp_hash": hash_otp(otp),
        "attempts": 0,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(minutes=settings.otp_expiry_minutes),
    }

    await otp_collection.delete_many({"email": request.email, "user_type": "student", "otp_type": "forgot_password"})
    await otp_collection.insert_one(otp_doc)

    try:
        send_otp_email(request.email, otp, "student", settings.otp_expiry_minutes)
    except Exception as exc:
        await otp_collection.delete_many({"email": request.email, "user_type": "student", "otp_type": "forgot_password"})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send OTP email: {exc}"
        )

    return {
        "message": "OTP sent to email",
        "expires_in_seconds": settings.otp_expiry_minutes * 60
    }


@router.post("/students/forgot-password/reset")
async def reset_student_password(request: ResetPasswordRequest):
    """Verify OTP and reset student password"""
    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )

    otp_doc = await otp_collection.find_one({"email": request.email, "user_type": "student", "otp_type": "forgot_password"})
    if not otp_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP not found or expired"
        )

    if otp_doc.get("expires_at") and otp_doc["expires_at"] < datetime.utcnow():
        await otp_collection.delete_many({"email": request.email, "user_type": "student", "otp_type": "forgot_password"})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired"
        )

    if otp_doc.get("attempts", 0) >= settings.otp_max_attempts:
        await otp_collection.delete_many({"email": request.email, "user_type": "student", "otp_type": "forgot_password"})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP attempt limit exceeded"
        )

    if hash_otp(request.otp) != otp_doc.get("otp_hash"):
        await otp_collection.update_one(
            {"_id": otp_doc["_id"]},
            {"$inc": {"attempts": 1}}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )

    new_hashed_password = hash_password(request.new_password)
    result = await students_collection.update_one(
        {"email": request.email},
        {"$set": {"password": new_hashed_password}}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    student = await students_collection.find_one({"email": request.email})
    await otp_collection.delete_many({"email": request.email, "user_type": "student", "otp_type": "forgot_password"})

    token_data = {"sub": str(student["_id"]), "type": "student"}
    access_token = create_access_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "student_id": str(student["_id"]),
        "message": "Password reset successfully"
    }
