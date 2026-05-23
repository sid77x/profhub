# ProfHub - Research Collaboration Platform

A comprehensive platform connecting professors with students for research collaboration opportunities. Professors can post research gigs, and students can browse and apply to opportunities that match their interests and qualifications.

## 🎯 Project Overview

**ProfHub** streamlines the process of matching professors' research needs with talented students:
- **Professors** post research opportunities with specific requirements
- **Students** discover and apply to research positions
- **Admins** manage the platform (onboard/deboard users, track audit logs)

## 🏗️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.8+)
- **Database**: MongoDB
- **Authentication**: JWT tokens with role-based access
- **Email**: SMTP (Gmail) for OTP notifications
- **Features**: OTP verification, audit logging, admin dashboard

### Frontend
- **Framework**: React with TypeScript
- **UI Framework**: Tailwind CSS + Framer Motion
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router

## 📦 Project Structure

```
profhub/
├── backend/
│   ├── api/routers/          # API endpoints
│   ├── core/                 # Config, auth, database, utilities
│   ├── models/               # Data models (Pydantic)
│   ├── schemas/              # Request/response schemas
│   ├── main.py               # FastAPI app entry point
│   └── requirements.txt       # Python dependencies
└── frontend/
    ├── src/
    │   ├── api/              # API client methods
    │   ├── components/       # Reusable components
    │   ├── pages/            # Page components
    │   ├── store/            # Zustand stores
    │   └── App.tsx           # Main app component
    └── package.json          # NPM dependencies
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB (running locally or cloud)

### Backend Setup
See [backend/README.md](./backend/README.md) for detailed instructions

```bash
cd backend
pip install -r requirements.txt
python init_mongodb.py
uvicorn main:app --reload
```

**Backend runs on**: `http://localhost:8000`

### Frontend Setup
See [frontend/README.md](./frontend/README.md) for detailed instructions

```bash
cd frontend
npm install
npm run dev
```

**Frontend runs on**: `http://localhost:5173`

## 🔐 Authentication

- **Professors**: Email/password with OTP verification
- **Students**: Email/password with OTP verification
- **Admins**: Email/password (no OTP required, direct admin creation)
- **JWT Tokens**: 30-day expiry, role-based access control

## 📊 Admin Features

### Admin Dashboard (`/profhub`)
- **Credentials**: 
  - Email: `shivli.admin@profhub.com` | Password: `admin123`
  - Email: `siddhant.admin@profhub.com` | Password: `admin123`

### Admin Capabilities
- **Onboard/Deboard**: Manage professors and students
- **Manage Resources**: Delete gigs and applications
- **View Statistics**: System-wide metrics and analytics
- **Audit Logs**: Track all admin actions with timestamps

## 🔍 Audit Logging

All admin actions are automatically logged:
- ✅ Onboard professor/student
- ✅ Deboard professor/student
- ✅ Delete gig/application
- ✅ Export audit logs

Access audit logs in the admin dashboard's "Audit Logs" tab.

## 📝 API Documentation

Once backend is running, visit: `http://localhost:8000/docs`

### Key Endpoints
- `POST /auth/register/request-otp` - Request OTP for registration
- `POST /auth/register/verify-otp` - Verify OTP and create account
- `POST /gigs` - Create a research gig (professors only)
- `GET /gigs` - Browse available gigs
- `POST /applications` - Apply to a gig (students only)
- `POST /admin/login` - Admin authentication
- `GET /admin/audit-logs` - View audit logs

## 🛠️ Development

### Database Initialization
```bash
cd backend
python init_mongodb.py
```

### Create Admin Accounts
```bash
cd backend
python setup_admins.py
```

### Clear Audit Logs (if needed)
Audit logs are stored in MongoDB. To query or export them, use the admin dashboard.

## 📋 Features by User Type

### Professors
- Create research gigs with detailed requirements
- Review student applications
- Manage gig status (open/closed/on-hold)
- View profile and applications
- Forgot password recovery via OTP

### Students
- Browse research opportunities
- Apply to gigs with custom cover letters
- Track application status
- Manage profile and skills
- Forgot password recovery via OTP

### Admins
- Onboard new professors/students (bypassing registration)
- Deboard users (cascading delete of related data)
- Delete gigs and applications
- Export system statistics
- Monitor all actions via audit logs

## 🚨 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB is running
mongod --version
```

### Backend Errors
Check logs in terminal running `uvicorn main:app --reload`

### Frontend Errors
Check browser console (F12 → Console tab)

## 📚 Documentation
- [Backend README](./backend/README.md) - Backend setup and API details
- [Frontend README](./frontend/README.md) - Frontend setup and development

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

Built with ❤️ for research collaboration.

npm install
```

#### Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
ProfHub/
├── backend/                  # FastAPI Backend
│   ├── api/
│   │   └── routers/
│   │       ├── auth.py       # Authentication endpoints
│   │       ├── professor.py  # Professor CRUD operations
│   │       ├── student.py    # Student CRUD operations
│   │       ├── gigs.py       # Research gig management
│   │       └── applications.py # Application handling
│   ├── core/
│   │   ├── config.py         # Application settings
│   │   └── db.py             # Database connection
│   ├── schemas/
│   │   ├── professor.py      # Professor data models
│   │   ├── student.py        # Student data models
│   │   ├── gig.py            # Gig data models
│   │   └── application.py    # Application data models
│   ├── main.py               # FastAPI application entry
│   ├── init_mongodb.py       # Database initialization
│   └── requirements.txt      # Python dependencies
│
└── frontend/                 # React + TypeScript Frontend
    ├── src/
    │   ├── api/              # API integration layer
    │   ├── components/
    │   │   └── Layout/
    │   │       ├── ProfessorLayout.tsx
    │   │       └── StudentLayout.tsx
    │   ├── pages/
    │   │   ├── professor/    # Professor pages
    │   │   │   ├── Dashboard.tsx
    │   │   │   ├── Profile.tsx
    │   │   │   ├── CreateGig.tsx
    │   │   │   └── ...
    │   │   ├── student/      # Student pages
    │   │   │   ├── StudentDashboard.tsx
    │   │   │   ├── BrowseGigs.tsx
    │   │   │   ├── GigDetail.tsx
    │   │   │   └── StudentProfile.tsx
    │   │   └── auth/         # Authentication pages
    │   ├── store/            # Zustand state management
    │   │   ├── authStore.ts
    │   │   ├── professorStore.ts
    │   │   └── studentStore.ts
    │   ├── types/            # TypeScript type definitions
    │   ├── App.tsx           # Main application component
    │   └── main.tsx          # Application entry point
    ├── package.json          # Node.js dependencies
    └── vite.config.ts        # Vite configuration
```

## 💻 Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **MongoDB** - NoSQL database for flexible data storage
- **Motor** - Async MongoDB driver for Python
- **Pydantic** - Data validation using Python type annotations
- **Passlib** - Password hashing with bcrypt
- **Python-Jose** - JWT token creation and validation

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management with persistence
- **React Router** - Declarative routing
- **Axios** - Promise-based HTTP client
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/professor/register` - Register new professor
- `POST /api/auth/professor/login` - Professor login
- `POST /api/auth/student/register` - Register new student
- `POST /api/auth/student/login` - Student login

### Professors
- `GET /api/professors/{id}` - Get professor profile
- `PUT /api/professors/{id}` - Update professor profile

### Students
- `GET /api/students/{id}` - Get student profile
- `PUT /api/students/{id}` - Update student profile
- `GET /api/students/{id}/applications` - Get student's applications

### Gigs
- `GET /api/gigs` - List all gigs (with filters)
- `GET /api/gigs/{id}` - Get gig details
- `GET /api/gigs/professor/{professor_id}` - List professor's gigs
- `POST /api/gigs` - Create new gig
- `PUT /api/gigs/{id}` - Update gig
- `PATCH /api/gigs/{id}/status` - Update gig status
- `DELETE /api/gigs/{id}` - Delete gig

### Applications
- `POST /api/applications` - Submit application
- `GET /api/applications/gig/{gig_id}` - Get applications for a gig
- `PATCH /api/applications/{id}/status` - Update application status

## 🔒 Authentication

The application uses JWT (JSON Web Tokens) for authentication:
- Passwords are hashed using bcrypt
- Tokens are stored in browser's localStorage
- Protected routes require valid authentication
- Separate authentication flows for professors and students

## ⚙️ Configuration

### Backend Configuration (`backend/core/config.py`)
```python
mongodb_url: str = "mongodb://localhost:27017"  # MongoDB connection string
database_name: str = "profhub"                   # Database name
cors_origins: list = [                           # Allowed origins
    "http://localhost:5173",
    "http://localhost:3000"
]
```

### Frontend Configuration
The API base URL is set to `http://localhost:8000/api` in the frontend code.

## 🧪 Testing the Application

### Quick Test Flow

1. **Start both servers** (backend and frontend)

2. **Register as Professor**:
   - Navigate to `http://localhost:5173/professor/register`
   - Fill in professor details and register
   - Login with credentials

3. **Create a Research Gig**:
   - Go to Dashboard → Create Gig
   - Fill in gig details (title, description, requirements)
   - Submit the gig

4. **Register as Student** (use a different browser or incognito):
   - Navigate to `http://localhost:5173/student/register`
   - Fill in student details and register
   - Login with credentials

5. **Browse and Apply**:
   - Browse available gigs
   - View gig details
   - Submit application with cover letter

6. **Review Applications** (as professor):
   - View applications for your gigs
   - Accept or reject applications

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
# Windows
sc query MongoDB

# Linux/Mac
systemctl status mongod
```

### Port Already in Use
```bash
# Backend (port 8000)
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9

# Frontend (port 5173)
# Similar process for port 5173
```

### Python Virtual Environment Issues
```bash
# Deactivate and recreate
deactivate
rm -rf venv  # or rmdir /s venv on Windows
python -m venv venv
# Activate and reinstall dependencies
```

## 📝 Database Schema

### Collections
- **professors**: Professor profiles and academic information
- **students**: Student profiles and academic details
- **gigs**: Research opportunity postings
- **applications**: Student applications to gigs

### Key Indexes
- `email` (unique) on professors and students
- `reg_no` (unique) on students
- `professor_id` on gigs
- `gig_id` and `student_id` on applications

## 🚀 Deployment

### Production Considerations
- Set up environment variables for sensitive data
- Use a production-grade MongoDB instance (MongoDB Atlas)
- Configure proper CORS origins
- Enable HTTPS
- Use a process manager (PM2, systemd)
- Set up proper logging and monitoring

## 📄 License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines here]

## 📧 Contact

[Add contact information here]
