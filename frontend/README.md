# Frontend - ProfHub React App

React + TypeScript + Tailwind CSS frontend for the ProfHub research collaboration platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Backend API running on `http://localhost:8000`

### Setup

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Start Development Server
```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

#### 3. Build for Production
```bash
npm run build
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── auth.ts          # Authentication API calls
│   │   ├── gigs.ts          # Gig API calls
│   │   ├── applications.ts   # Application API calls
│   │   ├── professor.ts      # Professor API calls
│   │   ├── notifications.ts  # Notification API calls
│   │   └── axios.ts          # Axios instance config
│   ├── components/
│   │   ├── ProtectedRoute.tsx    # Auth guard
│   │   ├── ThemeToggle.tsx       # Dark mode toggle
│   │   ├── NotificationPanel.tsx # Notifications
│   │   ├── Card/
│   │   │   └── Card.tsx          # Reusable card
│   │   └── Layout/
│   │       ├── ProfessorLayout.tsx
│   │       └── StudentLayout.tsx
│   ├── pages/
│   │   ├── HomePage.tsx          # Landing page
│   │   ├── NotFound.tsx          # 404 page
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── professor/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CreateGig.tsx
│   │   │   ├── EditGig.tsx
│   │   │   ├── OpenGigs.tsx
│   │   │   ├── ClosedProjects.tsx
│   │   │   ├── OnHoldProjects.tsx
│   │   │   ├── ViewGigApplications.tsx
│   │   │   └── Profile.tsx
│   │   ├── student/
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── BrowseGigs.tsx
│   │   │   ├── GigDetail.tsx
│   │   │   ├── ProfessorProfile.tsx
│   │   │   ├── StudentProfile.tsx
│   │   │   ├── StudentLogin.tsx
│   │   │   └── StudentRegister.tsx
│   │   └── admin/
│   │       ├── AdminLogin.tsx
│   │       ├── AdminDashboard.tsx
│   │       ├── OnboardProfessorModal.tsx
│   │       ├── OnboardStudentModal.tsx
│   │       └── AuditLogs.tsx
│   ├── store/
│   │   ├── authStore.ts      # Auth state (Zustand)
│   │   ├── gigsStore.ts      # Gigs state
│   │   ├── professorStore.ts # Professor state
│   │   └── studentStore.ts   # Student state
│   ├── types/
│   │   ├── index.ts          # TypeScript interfaces
│   │   └── application.ts    # Application types
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   ├── index.css             # Global styles
│   └── vite-env.d.ts         # Vite type definitions
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── tailwind.config.js        # Tailwind CSS config
├── postcss.config.cjs        # PostCSS config
├── vite.config.ts            # Vite config
└── .gitignore                # Git ignore rules
```

## 🎨 UI Components

### Built-in Components
- **Card** - Reusable card container
- **ProtectedRoute** - Authentication guard
- **ThemeToggle** - Dark/light mode toggle
- **NotificationPanel** - Toast notifications

### Libraries
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Framer Motion** - Animations
- **React Hot Toast** - Notifications
- **React Router** - Navigation

## 🔐 Authentication

### Login Flows

#### Professor/Student
1. Request OTP → Email sent
2. Verify OTP → Account created/logged in
3. JWT token stored in localStorage
4. Token auto-included in all API calls

#### Forgot Password
1. Request password reset OTP
2. Verify OTP + set new password
3. Redirect to login

#### Admin
1. Email + Password login
2. JWT token with admin role
3. Access admin dashboard

### Token Storage
```typescript
localStorage.setItem('token', response.data.access_token);
localStorage.setItem('user_id', response.data.user_id);
localStorage.setItem('user_type', 'professor'); // or 'student'
```

## 📱 Pages Overview

### Public Pages
- `/` - Home page
- `/login` - Professor/Student login
- `/register` - Registration with OTP
- `/forgot-password` - Password reset

### Professor Pages
- `/professor/dashboard` - Dashboard
- `/professor/create-gig` - Create research gig
- `/professor/open-gigs` - View open gigs
- `/professor/closed-projects` - View closed projects
- `/professor/on-hold-projects` - View on-hold projects
- `/professor/gig/{id}/applications` - View applications
- `/professor/profile` - Profile management
- `/professor/edit-gig/{id}` - Edit gig

### Student Pages
- `/student/dashboard` - Dashboard
- `/student/browse-gigs` - Browse opportunities
- `/student/gig/{id}` - Gig details & apply
- `/student/profile` - Profile management
- `/student/applications` - View applications
- `/student/professor/{id}` - View professor profile

### Admin Pages
- `/profhub` - Admin login
- `/profhub/dashboard` - Admin dashboard
  - Overview tab (statistics)
  - Professors tab (onboard/deboard)
  - Students tab (onboard/deboard)
  - Gigs tab (view/delete)
  - Applications tab (view/delete)
  - Audit Logs tab (view/filter/export)

## 🎯 Key Features

### Professor Dashboard
- Create and manage research gigs
- Track project status (open/closed/on-hold)
- Review student applications
- Approve/reject applications
- View profile and research areas

### Student Dashboard
- Browse available research opportunities
- Apply to gigs with cover letters
- Track application status
- Manage profile and skills
- View professor profiles

### Admin Dashboard
- **Onboard**: Create professor/student accounts
- **Deboard**: Remove users (cascading delete)
- **Manage Gigs**: View and delete research gigs
- **Manage Applications**: View and delete applications
- **Audit Logs**: Track all admin actions
- **Statistics**: System-wide metrics

## 🌐 API Integration

### Axios Configuration
```typescript
// src/api/axios.ts
const instance = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000
});

// Auto-inject token
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API Calls Pattern
```typescript
// src/api/gigs.ts
export const apiGigs = {
  async getAll() {
    const { data } = await axios.get('/gigs');
    return data;
  },
  
  async create(gig: CreateGigRequest) {
    const { data } = await axios.post('/gigs', gig);
    return data;
  }
};
```

## 🎭 State Management (Zustand)

### Store Example
```typescript
// src/store/authStore.ts
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  login: (token, user) => set({ token, user }),
  logout: () => set({ token: null, user: null })
}));
```

## 🎨 Styling

### Tailwind Classes
- Global config in `tailwind.config.js`
- Custom colors, fonts, animations
- Dark mode support (class-based)
- Responsive breakpoints

### Custom Classes
```css
/* src/index.css */
.gradient-text { ... }
.shadow-glow { ... }
.bg-background { ... }
```

## 🔄 Component Patterns

### Protected Routes
```typescript
<ProtectedRoute requiredRole="professor">
  <ProfessorDashboard />
</ProtectedRoute>
```

### Form Handling
```typescript
const [formData, setFormData] = useState({...});
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const handleSubmit = async (e: React.FormEvent) => {
  setLoading(true);
  try {
    await api.method(formData);
    toast.success('Success!');
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

## 🚀 Building & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Build Output
```
dist/
├── index.html
├── assets/
│   ├── *.js
│   ├── *.css
│   └── *.svg
```

## 📦 Dependencies

See `package.json` for full list. Key packages:
- **react** - UI library
- **react-router-dom** - Routing
- **axios** - HTTP client
- **zustand** - State management
- **tailwindcss** - Styling
- **framer-motion** - Animations
- **react-hot-toast** - Notifications
- **lucide-react** - Icons
- **typescript** - Type safety

## 🛠️ Available Scripts

```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Run ESLint (if configured)
npm run type-check    # Check TypeScript errors
```

## 🐛 Debugging

### Browser DevTools
- F12 → Console for errors
- Network tab for API calls
- Application tab for localStorage
- React DevTools extension (recommended)

### Common Issues

**401 Unauthorized**
- Token expired → logout & login
- Token missing → check localStorage
- Admin token required → login as admin

**404 Not Found**
- Backend not running → start backend
- Wrong API URL → check axios config

**Network Error**
- CORS issue → check backend CORS config
- Wrong port → verify localhost:8000

## 🔗 Related Documentation
- [Main README](../README.md) - Project overview
- [Backend README](../backend/README.md) - Backend setup & API

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
