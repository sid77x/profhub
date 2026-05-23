from fastapi import APIRouter, HTTPException, status, Request
from pydantic import EmailStr
from datetime import datetime
from typing import List
from bson import ObjectId

from core.config import settings
from core.database import professors_collection, students_collection, gigs_collection, applications_collection, admins_collection
from core.auth import verify_password, get_password_hash, create_access_token
from core.audit import log_audit_action, get_audit_logs, get_audit_stats
from core.admin_auth import verify_admin_token, get_client_ip
from schemas.admin import AdminLogin, AdminResponse, AdminToken, ProfessorData, StudentData, GigData, ApplicationData, OnboardProfessorRequest, OnboardStudentRequest, OnboardResponse
from schemas.audit import AuditLogResponse, AuditStatsResponse

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
    
    token = create_access_token({"id": str(admin["_id"]), "email": admin["email"], "name": admin["name"], "role": "admin"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "admin_id": str(admin["_id"]),
        "admin_name": admin["name"]
    }


# ======================== PROFESSOR MANAGEMENT ========================

@router.get("/professors", response_model=List[ProfessorData])
async def get_all_professors(request: Request):
    """Get all professors"""
    # Verify admin token
    auth_header = request.headers.get("Authorization", "").replace("Bearer ", "")
    admin_info = await verify_admin_token(auth_header)
    
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
async def delete_professor(professor_id: str, request: Request):
    """Delete/deboard a professor and all their gigs"""
    # Verify admin token
    auth_header = request.headers.get("Authorization", "").replace("Bearer ", "")
    admin_info = await verify_admin_token(auth_header)
    
    try:
        prof_id = ObjectId(professor_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid professor ID")
    
    professor = await professors_collection.find_one({"_id": prof_id})
    if not professor:
        raise HTTPException(status_code=404, detail="Professor not found")
    
    prof_name = professor.get("name", "Unknown")
    prof_email = professor.get("email", "Unknown")
    
    # Delete professor's gigs and associated applications
    gigs = await gigs_collection.find({"professor_id": prof_id}).to_list(None)
    for gig in gigs:
        await applications_collection.delete_many({"gig_id": gig["_id"]})
    
    await gigs_collection.delete_many({"professor_id": prof_id})
    await professors_collection.delete_one({"_id": prof_id})
    
    # Log the action
    await log_audit_action(
        admin_id=admin_info.get("id"),
        admin_name=admin_info.get("name", "Unknown"),
        admin_email=admin_info.get("email", "Unknown"),
        action="deboard_professor",
        resource_type="professor",
        resource_id=professor_id,
        resource_name=prof_email,
        details={"professor_name": prof_name, "gigs_deleted": len(gigs)},
        status="success",
        ip_address=get_client_ip(request)
    )
    
    return {"message": f"Professor {prof_name} has been deboarded"}


# ======================== STUDENT MANAGEMENT ========================

@router.get("/students", response_model=List[StudentData])
async def get_all_students(request: Request):
    """Get all students"""
    # Verify admin token
    auth_header = request.headers.get("Authorization", "").replace("Bearer ", "")
    admin_info = await verify_admin_token(auth_header)
    
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
async def delete_student(student_id: str, request: Request):
    """Delete/deboard a student and their applications"""
    # Verify admin token
    auth_header = request.headers.get("Authorization", "").replace("Bearer ", "")
    admin_info = await verify_admin_token(auth_header)
    
    try:
        stud_id = ObjectId(student_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid student ID")
    
    student = await students_collection.find_one({"_id": stud_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    stud_name = student.get("name", "Unknown")
    stud_email = student.get("email", "Unknown")
    
    # Delete student's applications
    apps_deleted = await applications_collection.count_documents({"student_id": stud_id})
    await applications_collection.delete_many({"student_id": stud_id})
    await students_collection.delete_one({"_id": stud_id})
    
    # Log the action
    await log_audit_action(
        admin_id=admin_info.get("id"),
        admin_name=admin_info.get("name", "Unknown"),
        admin_email=admin_info.get("email", "Unknown"),
        action="deboard_student",
        resource_type="student",
        resource_id=student_id,
        resource_name=stud_email,
        details={"student_name": stud_name, "applications_deleted": apps_deleted},
        status="success",
        ip_address=get_client_ip(request)
    )
    
    return {"message": f"Student {stud_name} has been deboarded"}


# ======================== GIG MANAGEMENT ========================

@router.get("/gigs", response_model=List[GigData])
async def get_all_gigs(request: Request):
    """Get all gigs with application counts"""
    # Verify admin token
    auth_header = request.headers.get("Authorization", "").replace("Bearer ", "")
    admin_info = await verify_admin_token(auth_header)
    
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
async def delete_gig(gig_id: str, request: Request):
    """Delete a gig and its applications"""
    # Verify admin token
    auth_header = request.headers.get("Authorization", "").replace("Bearer ", "")
    admin_info = await verify_admin_token(auth_header)
    
    try:
        g_id = ObjectId(gig_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid gig ID")
    
    gig = await gigs_collection.find_one({"_id": g_id})
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    
    gig_title = gig.get("title", "Unknown")
    
    # Delete all applications for this gig
    apps_deleted = await applications_collection.count_documents({"gig_id": g_id})
    await applications_collection.delete_many({"gig_id": g_id})
    await gigs_collection.delete_one({"_id": g_id})
    
    # Log the action
    await log_audit_action(
        admin_id=admin_info.get("id"),
        admin_name=admin_info.get("name", "Unknown"),
        admin_email=admin_info.get("email", "Unknown"),
        action="delete_gig",
        resource_type="gig",
        resource_id=gig_id,
        resource_name=gig_title,
        details={"applications_deleted": apps_deleted},
        status="success",
        ip_address=get_client_ip(request)
    )
    
    return {"message": f"Gig '{gig_title}' has been deleted"}


# ======================== APPLICATION MANAGEMENT ========================

@router.get("/applications", response_model=List[ApplicationData])
async def get_all_applications(request: Request):
    """Get all applications"""
    # Verify admin token
    auth_header = request.headers.get("Authorization", "").replace("Bearer ", "")
    admin_info = await verify_admin_token(auth_header)
    
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
async def delete_application(application_id: str, request: Request):
    """Delete an application"""
    # Verify admin token
    auth_header = request.headers.get("Authorization", "").replace("Bearer ", "")
    admin_info = await verify_admin_token(auth_header)
    
    try:
        app_id = ObjectId(application_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid application ID")
    
    app = await applications_collection.find_one({"_id": app_id})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    await applications_collection.delete_one({"_id": app_id})
    
    # Log the action
    await log_audit_action(
        admin_id=admin_info.get("id"),
        admin_name=admin_info.get("name", "Unknown"),
        admin_email=admin_info.get("email", "Unknown"),
        action="delete_application",
        resource_type="application",
        resource_id=application_id,
        status="success",
        ip_address=get_client_ip(request)
    )
    
    return {"message": "Application has been deleted"}


# ======================== DASHBOARD STATS ========================

@router.get("/stats")
async def get_admin_stats(request: Request):
    """Get overall system statistics"""
    # Verify admin token
    auth_header = request.headers.get("Authorization", "").replace("Bearer ", "")
    admin_info = await verify_admin_token(auth_header)
    
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


# ======================== ONBOARDING ENDPOINTS ========================

@router.post("/professors/onboard", response_model=OnboardResponse)
async def onboard_professor(request_body: OnboardProfessorRequest, request: Request):
    """Admin onboard a new professor without OTP verification"""
    # Verify admin token
    auth_header = request.headers.get("Authorization", "").replace("Bearer ", "")
    admin_info = await verify_admin_token(auth_header)
    
    # Check if email already exists
    existing_prof = await professors_collection.find_one({"email": request_body.email})
    if existing_prof:
        await log_audit_action(
            admin_id=admin_info.get("id"),
            admin_name=admin_info.get("name", "Unknown"),
            admin_email=admin_info.get("email", "Unknown"),
            action="onboard_professor",
            resource_type="professor",
            resource_name=request_body.email,
            status="failed",
            error_message="Email already registered",
            ip_address=get_client_ip(request)
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create professor document
    professor_doc = {
        "name": request_body.name,
        "email": request_body.email,
        "password_hash": get_password_hash(request_body.password),
        "department": request_body.department,
        "qualification": request_body.qualification,
        "college_name": request_body.college_name,
        "research_areas": request_body.research_areas,
        "experience_years": request_body.experience_years,
        "previous_publications": request_body.previous_publications,
        "created_at": datetime.utcnow(),
        "bio": None,
        "expertise": []
    }
    
    result = await professors_collection.insert_one(professor_doc)
    
    # Log the action
    await log_audit_action(
        admin_id=admin_info.get("id"),
        admin_name=admin_info.get("name", "Unknown"),
        admin_email=admin_info.get("email", "Unknown"),
        action="onboard_professor",
        resource_type="professor",
        resource_id=str(result.inserted_id),
        resource_name=request_body.email,
        details={"professor_name": request_body.name, "department": request_body.department},
        status="success",
        ip_address=get_client_ip(request)
    )
    
    return {
        "message": f"Professor {request_body.name} has been onboarded successfully",
        "user_id": str(result.inserted_id),
        "email": request_body.email
    }


@router.post("/students/onboard", response_model=OnboardResponse)
async def onboard_student(request_body: OnboardStudentRequest, request: Request):
    """Admin onboard a new student without OTP verification"""
    # Verify admin token
    auth_header = request.headers.get("Authorization", "").replace("Bearer ", "")
    admin_info = await verify_admin_token(auth_header)
    
    # Check if email already exists
    existing_student = await students_collection.find_one({"email": request_body.email})
    if existing_student:
        await log_audit_action(
            admin_id=admin_info.get("id"),
            admin_name=admin_info.get("name", "Unknown"),
            admin_email=admin_info.get("email", "Unknown"),
            action="onboard_student",
            resource_type="student",
            resource_name=request_body.email,
            status="failed",
            error_message="Email already registered",
            ip_address=get_client_ip(request)
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if registration number already exists
    existing_reg = await students_collection.find_one({"registration_number": request_body.registration_number})
    if existing_reg:
        await log_audit_action(
            admin_id=admin_info.get("id"),
            admin_name=admin_info.get("name", "Unknown"),
            admin_email=admin_info.get("email", "Unknown"),
            action="onboard_student",
            resource_type="student",
            resource_name=request_body.email,
            status="failed",
            error_message="Registration number already exists",
            ip_address=get_client_ip(request)
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration number already exists"
        )
    
    # Create student document
    student_doc = {
        "name": request_body.name,
        "email": request_body.email,
        "password": request_body.password,  # Using plain text field as per student model
        "year": request_body.year,
        "cgpa": request_body.cgpa,
        "registration_number": request_body.registration_number,
        "college_name": request_body.college_name,
        "created_at": datetime.utcnow(),
        "skills": [],
        "resume_url": None,
        "bio": None,
        "id_card_image": None
    }
    
    result = await students_collection.insert_one(student_doc)
    
    # Log the action
    await log_audit_action(
        admin_id=admin_info.get("id"),
        admin_name=admin_info.get("name", "Unknown"),
        admin_email=admin_info.get("email", "Unknown"),
        action="onboard_student",
        resource_type="student",
        resource_id=str(result.inserted_id),
        resource_name=request_body.email,
        details={"student_name": request_body.name, "year": request_body.year, "registration_number": request_body.registration_number},
        status="success",
        ip_address=get_client_ip(request)
    )
    
    return {
        "message": f"Student {request_body.name} has been onboarded successfully",
        "user_id": str(result.inserted_id),
        "email": request_body.email
    }


# ======================== AUDIT LOGGING ENDPOINTS ========================

@router.get("/audit-logs", response_model=list[AuditLogResponse])
async def view_audit_logs(
    request: Request,
    action: str = None,
    resource_type: str = None,
    admin_id: str = None,
    limit: int = 50
):
    """Get filtered audit logs (admin only)"""
    # Verify admin token
    auth_header = request.headers.get("Authorization", "").replace("Bearer ", "")
    admin_info = await verify_admin_token(auth_header)
    
    # Fetch audit logs
    logs = await get_audit_logs(
        limit=limit,
        action=action,
        resource_type=resource_type,
        admin_id=admin_id
    )
    
    return logs


@router.get("/audit-stats", response_model=AuditStatsResponse)
async def view_audit_stats(request: Request):
    """Get audit log statistics (admin only)"""
    # Verify admin token
    auth_header = request.headers.get("Authorization", "").replace("Bearer ", "")
    admin_info = await verify_admin_token(auth_header)
    
    stats = await get_audit_stats()
    
    return AuditStatsResponse(**stats)


@router.post("/audit-logs/export")
async def export_audit_logs(request: Request, days: int = 30):
    """Export audit logs to CSV (admin only)"""
    # Verify admin token
    auth_header = request.headers.get("Authorization", "").replace("Bearer ", "")
    admin_info = await verify_admin_token(auth_header)
    
    from datetime import timedelta
    import csv
    from io import StringIO
    
    # Get logs from the last N days
    start_date = datetime.utcnow() - timedelta(days=days)
    logs = await get_audit_logs(limit=10000)
    
    # Filter by date range
    filtered_logs = [log for log in logs if log.get("timestamp") >= start_date]
    
    # Create CSV
    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        "timestamp", "admin_name", "admin_email", "action", 
        "resource_type", "resource_name", "status"
    ])
    writer.writeheader()
    
    for log in filtered_logs:
        writer.writerow({
            "timestamp": log.get("timestamp"),
            "admin_name": log.get("admin_name"),
            "admin_email": log.get("admin_email"),
            "action": log.get("action"),
            "resource_type": log.get("resource_type"),
            "resource_name": log.get("resource_name"),
            "status": log.get("status")
        })
    
    # Log this export action
    await log_audit_action(
        admin_id=admin_info.get("id"),
        admin_name=admin_info.get("name", "Unknown"),
        admin_email=admin_info.get("email", "Unknown"),
        action="export_audit_logs",
        resource_type="audit_log",
        details={"days": days, "record_count": len(filtered_logs)},
        status="success",
        ip_address=get_client_ip(request)
    )
    
    return {
        "message": "Audit logs exported successfully",
        "record_count": len(filtered_logs),
        "export_date": datetime.utcnow().isoformat(),
        "csv_data": output.getvalue()
    }

