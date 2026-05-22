from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from core.config import settings
from core.database import professors_collection, otp_collection
from core.auth import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from core.email import send_otp_email
from core.otp import generate_otp, hash_otp
from schemas.auth import LoginRequest, RegisterOtpRequest, Token
from schemas.otp import OtpRequestRequest, OtpVerifyRequest, OtpSendResponse
from schemas.professor import ProfessorResponse
from datetime import datetime, timedelta

router = APIRouter()


@router.post("/register", status_code=status.HTTP_400_BAD_REQUEST)
async def register_deprecated():
    """Deprecated: use OTP registration endpoints"""
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Use /api/auth/register/request-otp and /api/auth/register/verify-otp"
    )


@router.post("/register/request-otp", response_model=OtpSendResponse)
async def request_register_otp(request: RegisterOtpRequest):
    """Send OTP for professor registration"""
    existing = await professors_collection.find_one({"email": request.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    otp = generate_otp()
    otp_doc = {
        "email": request.email,
        "user_type": "professor",
        "otp_hash": hash_otp(otp),
        "attempts": 0,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(minutes=settings.otp_expiry_minutes),
        "payload": {
            "name": request.name,
            "email": request.email,
            "hashed_password": get_password_hash(request.password),
            "department": request.department,
            "college_name": request.college_name,
            "qualification": request.qualification,
            "research_areas": request.research_areas,
            "experience_years": request.experience_years,
            "previous_publications": request.previous_publications,
        }
    }

    await otp_collection.delete_many({"email": request.email, "user_type": "professor"})
    await otp_collection.insert_one(otp_doc)

    try:
        send_otp_email(request.email, otp, "professor", settings.otp_expiry_minutes)
    except Exception as exc:
        await otp_collection.delete_many({"email": request.email, "user_type": "professor"})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send OTP email: {exc}"
        )

    return {
        "message": "OTP sent to email",
        "expires_in_seconds": settings.otp_expiry_minutes * 60
    }


@router.post("/register/verify-otp", response_model=ProfessorResponse)
async def verify_register_otp(request: OtpVerifyRequest):
    """Verify OTP and create professor account"""
    otp_doc = await otp_collection.find_one({"email": request.email, "user_type": "professor"})
    if not otp_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP not found or expired"
        )

    if otp_doc.get("expires_at") and otp_doc["expires_at"] < datetime.utcnow():
        await otp_collection.delete_many({"email": request.email, "user_type": "professor"})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired"
        )

    if otp_doc.get("attempts", 0) >= settings.otp_max_attempts:
        await otp_collection.delete_many({"email": request.email, "user_type": "professor"})
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

    professor_payload = otp_doc.get("payload", {})
    result = await professors_collection.insert_one(professor_payload)
    created_professor = await professors_collection.find_one({"_id": result.inserted_id})
    created_professor["id"] = str(created_professor["_id"])

    await otp_collection.delete_many({"email": request.email, "user_type": "professor"})

    return created_professor


@router.post("/login", response_model=Token)
async def login(request: LoginRequest):
    """Login with email and password"""
    # Find professor by email
    professor = await professors_collection.find_one({"email": request.email})
    
    if not professor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(request.password, professor["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": professor["email"], "id": str(professor["_id"])},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "professor_id": str(professor["_id"])}


@router.get("/me", response_model=ProfessorResponse)
async def get_current_user(token: str):
    """Get current logged in user"""
    from core.auth import decode_access_token
    
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    professor = await professors_collection.find_one({"email": email})
    if professor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    professor["id"] = str(professor["_id"])
    return professor


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str
    confirm_password: str


@router.post("/forgot-password/request-otp", response_model=OtpSendResponse)
async def request_forgot_password_otp(request: OtpRequestRequest):
    """Send OTP for password reset"""
    professor = await professors_collection.find_one({"email": request.email})
    if not professor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not registered"
        )

    otp = generate_otp()
    otp_doc = {
        "email": request.email,
        "user_type": "professor",
        "otp_type": "forgot_password",
        "otp_hash": hash_otp(otp),
        "attempts": 0,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(minutes=settings.otp_expiry_minutes),
    }

    await otp_collection.delete_many({"email": request.email, "user_type": "professor", "otp_type": "forgot_password"})
    await otp_collection.insert_one(otp_doc)

    try:
        send_otp_email(request.email, otp, "professor", settings.otp_expiry_minutes)
    except Exception as exc:
        await otp_collection.delete_many({"email": request.email, "user_type": "professor", "otp_type": "forgot_password"})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send OTP email: {exc}"
        )

    return {
        "message": "OTP sent to email",
        "expires_in_seconds": settings.otp_expiry_minutes * 60
    }


@router.post("/forgot-password/reset", response_model=Token)
async def reset_password(request: ResetPasswordRequest):
    """Verify OTP and reset password"""
    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )

    otp_doc = await otp_collection.find_one({"email": request.email, "user_type": "professor", "otp_type": "forgot_password"})
    if not otp_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP not found or expired"
        )

    if otp_doc.get("expires_at") and otp_doc["expires_at"] < datetime.utcnow():
        await otp_collection.delete_many({"email": request.email, "user_type": "professor", "otp_type": "forgot_password"})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired"
        )

    if otp_doc.get("attempts", 0) >= settings.otp_max_attempts:
        await otp_collection.delete_many({"email": request.email, "user_type": "professor", "otp_type": "forgot_password"})
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

    new_hashed_password = get_password_hash(request.new_password)
    result = await professors_collection.update_one(
        {"email": request.email},
        {"$set": {"hashed_password": new_hashed_password}}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor not found"
        )

    professor = await professors_collection.find_one({"email": request.email})
    await otp_collection.delete_many({"email": request.email, "user_type": "professor", "otp_type": "forgot_password"})

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": professor["email"], "id": str(professor["_id"])},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer", "professor_id": str(professor["_id"])}
