# ResearchConnect

A comprehensive platform connecting professors with students for research collaboration opportunities. Professors can post research gigs, and students can browse and apply to opportunities that match their interests and qualifications.

## Features

### For Professors
- **Dashboard**: Overview of all research gigs (open, closed, on-hold)
- **Profile Management**: Manage academic profile and research interests
- **Post Gigs**: Create detailed research opportunities with requirements
- **Manage Applications**: Review and manage student applications
- **Track Projects**: Monitor status of ongoing and completed research projects

### For Students
- **Browse Opportunities**: Discover research gigs across departments
- **Detailed Search**: Filter by area of study, technologies, timeline
- **Apply Seamlessly**: Submit applications with cover letters
- **Track Applications**: Monitor status of submitted applications
- **Profile Management**: Showcase skills, experience, and resume

## Prerequisites

Before you begin, ensure you have the following installed:
- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** and npm - [Download Node.js](https://nodejs.org/)
- **MongoDB 5.0+** - [Download MongoDB](https://www.mongodb.com/try/download/community)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ProfHub
```

### 2. Backend Setup

#### Navigate to backend directory:
```bash
cd backend
```

#### Create and activate virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

#### Install Python dependencies:
```bash
pip install -r requirements.txt
```

#### Start MongoDB:
Make sure MongoDB is running on `mongodb://localhost:27017`

```bash
# Windows (if installed as service)
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
# or
mongod --dbpath /path/to/data/directory
```

#### Initialize the database:
```bash
python init_mongodb.py
```

This will:
- Create the `profhub` database
- Set up collections (professors, students, gigs, applications)
- Create necessary indexes for optimal performance

#### Start the backend server:
```bash
uvicorn main:app --reload
```

The API will be available at:
- **API**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

#### Install Node.js dependencies:
```bash
npm install
```

#### Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

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

## Tech Stack

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

## API Endpoints

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

## Authentication

The application uses JWT (JSON Web Tokens) for authentication:
- Passwords are hashed using bcrypt
- Tokens are stored in browser's localStorage
- Protected routes require valid authentication
- Separate authentication flows for professors and students

## Configuration

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
   - Go to Dashboard -> Create Gig
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

## Database Schema

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

## Deployment

### Production Considerations
- Set up environment variables for sensitive data
- Use a production-grade MongoDB instance (MongoDB Atlas)
- Configure proper CORS origins
- Enable HTTPS
- Use a process manager (PM2, systemd)
- Set up proper logging and monitoring

## License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines here]

## 📧 Contact

[Add contact information here]
