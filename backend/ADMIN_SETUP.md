# Admin Panel Setup Guide

## 🔧 Setup Instructions

### Step 1: Create Admin Accounts
Run this command in the backend folder:

```bash
cd backend
python setup_admins.py
```

This will create two admin accounts:
- **Admin 1**: Shivli Dimri (shivli.admin@profhub.com)
- **Admin 2**: Siddhant Chutke (siddhant.admin@profhub.com)
- **Default Password**: admin123

### Step 2: Access Admin Panel
Navigate to `http://localhost:5173/profhub` in your browser

### Step 3: Login
Use either admin email and the default password to login

## 📊 Admin Features

### Overview Tab
- View system statistics
- See total professors, students, gigs, applications
- Monitor open/closed gigs and application statuses

### Professors Tab
- View all professors with their details
- See number of gigs each professor posted
- **Deboard professors** (removes them and all their gigs)

### Students Tab  
- View all students with their details
- See student registration numbers, CGPA, and applications
- **Deboard students** (removes them and their applications)

### Gigs Tab
- View all gigs in the system
- See gig details, professor info, and application counts
- View gig status (open/closed)

### Applications Tab
- View all student applications
- See application status (pending/approved/rejected)
- Track student-to-gig relationships

## 🔐 Security Notes
- Change the default password immediately after first login
- Store credentials securely
- Only admins should have access to the admin panel

## 🚀 Database Collections
Admin system uses a new `admins` collection in MongoDB with fields:
- name
- email
- password_hash (hashed with bcrypt)
- is_active
- created_at
- last_login
