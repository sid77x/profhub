# Backend - ProfHub API

FastAPI-based REST API for the ProfHub research collaboration platform.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- MongoDB (local or cloud)
- Virtual environment (recommended)

### Setup

#### 1. Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

#### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 3. Configure Environment
Create `.env` file in backend directory:
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=profhub
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_USE_TLS=true
SMTP_FROM_EMAIL=noreply@profhub.com
SMTP_FROM_NAME=ProfHub
```

#### 4. Initialize Database
```bash
python init_mongodb.py
```

Creates collections: professors, students, gigs, applications, notifications, email_otps, admins, audit_logs

#### 5. Create Admin Accounts (Optional)
```bash
python setup_admins.py
```

Creates two admin accounts:
- `shivli.admin@profhub.com` / `admin123`
- `siddhant.admin@profhub.com` / `admin123`

#### 6. Start Server
```bash
uvicorn main:app --reload
```

Server runs on: `http://localhost:8000`

## 📚 API Documentation

### Interactive Docs
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints

#### Authentication (Professors)
- `POST /auth/register/request-otp` - Request OTP
- `POST /auth/register/verify-otp` - Verify & register
- `POST /auth/login` - Login
- `POST /auth/forgot-password/request-otp` - Password reset OTP
- `POST /auth/forgot-password/reset` - Reset password

#### Authentication (Students)
- `POST /students/register/request-otp` - Request OTP
- `POST /students/register/verify-otp` - Verify & register
- `POST /students/login` - Login
- `POST /students/forgot-password/request-otp` - Password reset OTP
- `POST /students/forgot-password/reset` - Reset password

#### Gigs
- `GET /gigs` - List all gigs
- `POST /gigs` - Create gig (professor only)
- `GET /gigs/{gig_id}` - Get gig details
- `PUT /gigs/{gig_id}` - Update gig (owner only)
- `DELETE /gigs/{gig_id}` - Delete gig (owner only)

#### Applications
- `GET /applications` - List user applications
- `POST /applications` - Apply to gig (student only)
- `GET /applications/{app_id}` - Get application
- `PUT /applications/{app_id}` - Update status (professor only)

#### Admin
- `POST /admin/login` - Admin authentication
- `GET /admin/professors` - List professors
- `DELETE /admin/professors/{id}` - Deboard professor
- `GET /admin/students` - List students
- `DELETE /admin/students/{id}` - Deboard student
- `GET /admin/gigs` - List all gigs
- `DELETE /admin/gigs/{id}` - Delete gig
- `GET /admin/applications` - List all applications
- `DELETE /admin/applications/{id}` - Delete application
- `GET /admin/stats` - System statistics
- `POST /admin/professors/onboard` - Onboard professor
- `POST /admin/students/onboard` - Onboard student
- `GET /admin/audit-logs` - View audit logs
- `GET /admin/audit-stats` - Audit statistics
- `POST /admin/audit-logs/export` - Export logs to CSV

## 🏗️ Project Structure

```
backend/
├── api/
│   └── routers/
│       ├── auth.py           # Professor authentication
│       ├── student.py        # Student authentication
│       ├── gigs.py           # Gig management
│       ├── applications.py    # Application management
│       ├── admin.py          # Admin endpoints & audit logging
│       └── notifications.py   # Notification system
├── core/
│   ├── auth.py               # JWT & password hashing
│   ├── admin_auth.py         # Admin token verification
│   ├── config.py             # Settings & environment
│   ├── database.py           # MongoDB connection
│   ├── email.py              # SMTP email delivery
│   ├── otp.py                # OTP generation & hashing
│   └── audit.py              # Audit logging utilities
├── models/
│   ├── professor.py          # Professor data model
│   ├── student.py            # Student data model
│   ├── gig.py                # Gig data model
│   ├── application.py        # Application data model
│   ├── notification.py       # Notification data model
│   ├── admin.py              # Admin data model
│   └── audit.py              # Audit log data model
├── schemas/
│   ├── auth.py               # Auth request/response schemas
│   ├── gig.py                # Gig schemas
│   ├── application.py        # Application schemas
│   ├── admin.py              # Admin schemas
│   ├── professor.py          # Professor schemas
│   ├── student.py            # Student schemas
│   └── audit.py              # Audit log schemas
├── main.py                   # FastAPI app entry point
├── requirements.txt          # Python dependencies
├── init_mongodb.py           # Database initialization
├── setup_admins.py           # Admin account creation
└── clear_audit_logs.py       # Audit log clearing (temp)
```

## 🔐 Authentication

### JWT Tokens
- **Expiry**: 30 days
- **Claims**: id, email, role (admin/professor/student)
- **Signature**: HS256

### Admin Role
- Required for all `/admin/*` endpoints
- Set via `role: "admin"` JWT claim
- Non-admins receive 403 Forbidden

## 📊 Audit Logging

### Logged Actions
- ✅ Onboard professor/student
- ✅ Deboard professor/student
- ✅ Delete gig/application
- ✅ Export audit logs

### Audit Log Fields
- admin_id, admin_name, admin_email
- action, resource_type, resource_id
- status (success/failed), error_message
- timestamp (UTC), ip_address
- details (additional context)

### Access Logs
```bash
# View recent logs
GET /admin/audit-logs

# Filter by action
GET /admin/audit-logs?action=deboard_professor&limit=50

# Get statistics
GET /admin/audit-stats

# Export to CSV
POST /admin/audit-logs/export?days=30
```

## 📧 Email Configuration

### Gmail SMTP
1. Enable 2-Step Verification on Gmail account
2. Generate App Password (16 characters)
3. Use app password in `.env` as SMTP_PASSWORD

### OTP Settings
- **Length**: 5 digits
- **Expiry**: 5 minutes
- **Max Attempts**: 5 per OTP
- **Delivery**: SMTP email

## 🗄️ Database Collections

### professors
- _id, name, email, password_hash
- department, qualification, college_name
- research_areas, experience_years, previous_publications
- created_at, updated_at

### students
- _id, name, email, password
- year, cgpa, registration_number, college_name
- skills, resume_url, bio, id_card_image
- created_at, updated_at

### gigs
- _id, title, description, professor_id
- requirements, timeline, status
- created_at, updated_at

### applications
- _id, student_id, gig_id, cover_letter
- status (pending/approved/rejected)
- created_at, updated_at

### admins
- _id, name, email, password_hash
- is_active, created_at, last_login

### audit_logs
- _id, admin_id, admin_name, admin_email
- action, resource_type, resource_id, resource_name
- status, error_message, timestamp, ip_address
- details

### email_otps
- _id, email, user_type, otp_type
- otp_hash, attempts, created_at, expires_at

### notifications
- _id, user_id, user_type, message
- action_url, is_read, created_at

## 🛠️ Utilities

### OTP Module (`core/otp.py`)
```python
from core.otp import generate_otp, hash_otp

otp = generate_otp(length=5)  # "12345"
hashed = hash_otp(otp)        # SHA256 hex
```

### Email Module (`core/email.py`)
```python
from core.email import send_otp_email

await send_otp_email(
    to_email="user@example.com",
    otp="12345",
    user_type="professor",
    expires_minutes=5
)
```

### Audit Logging (`core/audit.py`)
```python
from core.audit import log_audit_action

await log_audit_action(
    admin_id="...",
    admin_name="...",
    action="onboard_professor",
    resource_type="professor",
    status="success"
)
```

## 🚨 Troubleshooting

### MongoDB Connection Error
```
MongoServerSelectionTimeoutError
```
**Solution**: Ensure MongoDB is running on localhost:27017

### SMTP Auth Failed
```
SMTPAuthenticationError
```
**Solution**: Check Gmail app password in `.env`

### Token Expired
```
401 Unauthorized
```
**Solution**: Logout and login again to get new token

### Admin Access Denied
```
403 Forbidden
```
**Solution**: Ensure token has `role: "admin"` claim

## 📝 Development Notes

### Adding New Endpoints
1. Create route in `api/routers/`
2. Add request/response schemas in `schemas/`
3. Add data models in `models/` if needed
4. Register route in `main.py`
5. Test via Swagger UI

### Database Migrations
Use MongoDB CLI or UI to modify collections directly. No ORM migrations needed.

### Logging
All logs are stored in MongoDB `audit_logs` collection. Query via admin endpoints.

## 📦 Dependencies

See `requirements.txt` for full list. Key packages:
- **fastapi** - Web framework
- **uvicorn** - ASGI server
- **motor** - Async MongoDB driver
- **pydantic** - Data validation
- **python-jose** - JWT handling
- **passlib** - Password hashing

## 🔗 Related Documentation
- [Main README](../README.md) - Project overview
- [Frontend README](../frontend/README.md) - Frontend setup
