from fastapi import APIRouter, HTTPException, status
from pydantic import EmailStr
from datetime import datetime
from typing import List
from bson import ObjectId

from core.config import settings
from core.database import professors_collection, students_collection, gigs_collection, applications_collection, admins_collection
from core.auth import verify_password, get_password_hash, create_access_token
from schemas.admin import AdminLogin, AdminResponse, AdminToken, ProfessorData, StudentData, GigData, ApplicationData

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/login", response_model=AdminToken)
async def admin_login(request: AdminLogin):
    """Admin login endpoint"""
    admin = await admins_collection.find_one({"email": request.email})
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if not admin.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin account is disabled"
        )
    
    if not verify_password(request.password, admin.get("password_hash")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Update last login
    await admins_collection.update_one(
        {"_id": admin["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    token = create_access_token({"id": str(admin["_id"]), "email": admin["email"], "role": "admin"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "admin_id": str(admin["_id"]),
        "admin_name": admin["name"]
    }


# ======================== PROFESSOR MANAGEMENT ========================

@router.get("/professors", response_model=List[ProfessorData])
async def get_all_professors():
    """Get all professors"""
    professors = await professors_collection.find().to_list(None)
    gig_counts = {}
    for gig in await gigs_collection.find().to_list(None):
        prof_id = str(gig.get("professor_id"))
        gig_counts[prof_id] = gig_counts.get(prof_id, 0) + 1
    
    return [
        {
            "id": str(p["_id"]),
            "name": p.get("name", ""),
            "email": p.get("email", ""),
            "department": p.get("department", ""),
            "qualification": p.get("qualification", ""),
            "college_name": p.get("college_name"),
            "experience_years": p.get("experience_years"),
            "is_verified": True,
            "gigs_posted": gig_counts.get(str(p["_id"]), 0),
            "created_at": p.get("created_at", datetime.utcnow())
        }
        for p in professors
    ]


@router.delete("/professors/{professor_id}")
async def delete_professor(professor_id: str):
    """Delete/deboard a professor and all their gigs"""
    try:
        prof_id = ObjectId(professor_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid professor ID")
    
    professor = await professors_collection.find_one({"_id": prof_id})
    if not professor:
        raise HTTPException(status_code=404, detail="Professor not found")
    
    # Delete professor's gigs and associated applications
    gigs = await gigs_collection.find({"professor_id": prof_id}).to_list(None)
    for gig in gigs:
        await applications_collection.delete_many({"gig_id": gig["_id"]})
    
    await gigs_collection.delete_many({"professor_id": prof_id})
    await professors_collection.delete_one({"_id": prof_id})
    
    return {"message": f"Professor {professor.get('name')} has been deboarded"}


# ======================== STUDENT MANAGEMENT ========================

@router.get("/students", response_model=List[StudentData])
async def get_all_students():
    """Get all students"""
    students = await students_collection.find().to_list(None)
    app_counts = {}
    for app in await applications_collection.find().to_list(None):
        student_id = str(app.get("student_id"))
        app_counts[student_id] = app_counts.get(student_id, 0) + 1
    
    return [
        {
            "id": str(s["_id"]),
            "name": s.get("name", ""),
            "email": s.get("email", ""),
            "registration_number": s.get("registration_number", ""),
            "year": s.get("year", 0),
            "cgpa": s.get("cgpa", 0.0),
            "college_name": s.get("college_name", ""),
            "is_verified": True,
            "applications_submitted": app_counts.get(str(s["_id"]), 0),
            "created_at": s.get("created_at", datetime.utcnow())
        }
        for s in students
    ]


@router.delete("/students/{student_id}")
async def delete_student(student_id: str):
    """Delete/deboard a student and their applications"""
    try:
        stud_id = ObjectId(student_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid student ID")
    
    student = await students_collection.find_one({"_id": stud_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Delete student's applications
    await applications_collection.delete_many({"student_id": stud_id})
    await students_collection.delete_one({"_id": stud_id})
    
    return {"message": f"Student {student.get('name')} has been deboarded"}


# ======================== GIG MANAGEMENT ========================

@router.get("/gigs", response_model=List[GigData])
async def get_all_gigs():
    """Get all gigs with application counts"""
    gigs = await gigs_collection.find().to_list(None)
    
    result = []
    for gig in gigs:
        prof = await professors_collection.find_one({"_id": gig.get("professor_id")})
        app_count = await applications_collection.count_documents({"gig_id": gig["_id"]})
        
        result.append({
            "id": str(gig["_id"]),
            "title": gig.get("title", ""),
            "professor_id": str(gig.get("professor_id", "")),
            "professor_name": prof.get("name", "") if prof else "Unknown",
            "status": gig.get("status", "open"),
            "created_at": gig.get("created_at", datetime.utcnow()),
            "applications_count": app_count,
            "is_approved": True
        })
    
    return result


@router.delete("/gigs/{gig_id}")
async def delete_gig(gig_id: str):
    """Delete a gig and its applications"""
    try:
        g_id = ObjectId(gig_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid gig ID")
    
    gig = await gigs_collection.find_one({"_id": g_id})
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    
    # Delete all applications for this gig
    await applications_collection.delete_many({"gig_id": g_id})
    await gigs_collection.delete_one({"_id": g_id})
    
    return {"message": f"Gig '{gig.get('title')}' has been deleted"}


# ======================== APPLICATION MANAGEMENT ========================

@router.get("/applications", response_model=List[ApplicationData])
async def get_all_applications():
    """Get all applications"""
    applications = await applications_collection.find().to_list(None)
    
    result = []
    for app in applications:
        student = await students_collection.find_one({"_id": app.get("student_id")})
        gig = await gigs_collection.find_one({"_id": app.get("gig_id")})
        
        result.append({
            "id": str(app["_id"]),
            "student_name": student.get("name", "") if student else "Unknown",
            "student_email": student.get("email", "") if student else "Unknown",
            "gig_title": gig.get("title", "") if gig else "Unknown",
            "gig_id": str(app.get("gig_id", "")),
            "status": app.get("status", "pending"),
            "applied_at": app.get("created_at", datetime.utcnow())
        })
    
    return result


@router.delete("/applications/{application_id}")
async def delete_application(application_id: str):
    """Delete an application"""
    try:
        app_id = ObjectId(application_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid application ID")
    
    app = await applications_collection.find_one({"_id": app_id})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    await applications_collection.delete_one({"_id": app_id})
    return {"message": "Application has been deleted"}


# ======================== DASHBOARD STATS ========================

@router.get("/stats")
async def get_admin_stats():
    """Get overall system statistics"""
    professors_count = await professors_collection.count_documents({})
    students_count = await students_collection.count_documents({})
    gigs_count = await gigs_collection.count_documents({})
    applications_count = await applications_collection.count_documents({})
    
    # Open gigs
    open_gigs = await gigs_collection.count_documents({"status": "open"})
    closed_gigs = await gigs_collection.count_documents({"status": "closed"})
    
    # Pending applications
    pending_apps = await applications_collection.count_documents({"status": "pending"})
    approved_apps = await applications_collection.count_documents({"status": "approved"})
    rejected_apps = await applications_collection.count_documents({"status": "rejected"})
    
    return {
        "total_professors": professors_count,
        "total_students": students_count,
        "total_gigs": gigs_count,
        "total_applications": applications_count,
        "open_gigs": open_gigs,
        "closed_gigs": closed_gigs,
        "pending_applications": pending_apps,
        "approved_applications": approved_apps,
        "rejected_applications": rejected_apps
    }
