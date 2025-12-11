from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from core.database import professors_collection
from core.auth import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from schemas.auth import LoginRequest, RegisterRequest, Token
from schemas.professor import ProfessorResponse
from datetime import timedelta

router = APIRouter()


@router.post("/register", response_model=ProfessorResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest):
    """Register a new professor"""
    # Check if email already exists
    existing = await professors_collection.find_one({"email": request.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash the password
    hashed_password = get_password_hash(request.password)
    
    # Create new professor document
    professor_dict = {
        "name": request.name,
        "email": request.email,
        "hashed_password": hashed_password,
        "department": request.department,
        "college_name": request.college_name,
        "qualification": request.qualification,
        "research_areas": request.research_areas,
        "experience_years": request.experience_years,
        "previous_publications": request.previous_publications,
    }
    
    result = await professors_collection.insert_one(professor_dict)
    created_professor = await professors_collection.find_one({"_id": result.inserted_id})
    created_professor["id"] = str(created_professor["_id"])
    
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
