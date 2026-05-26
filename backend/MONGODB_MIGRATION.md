# MongoDB Migration Complete

## What Changed
- **Removed**: SQLite + SQLAlchemy
- **Added**: MongoDB + Motor (async MongoDB driver)

## Setup Instructions

### 1. Install MongoDB
Download and install MongoDB Community Server from:
https://www.mongodb.com/try/download/community

Or use MongoDB Atlas (cloud version):
https://www.mongodb.com/cloud/atlas

### 2. Start MongoDB (Local Installation)

**Windows:**
```powershell
# MongoDB should start automatically as a service
# If not, run:
net start MongoDB

# Or manually:
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

**Linux/Mac:**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or manually:
mongod --dbpath ~/data/db
```

### 3. Configure Connection (Optional)

Update `backend/core/config.py` if your MongoDB is not running on default settings:

```python
mongodb_url: str = "mongodb://localhost:27017"  # Default
database_name: str = "profhub"
```

For MongoDB Atlas (cloud), use:
```python
mongodb_url: str = "mongodb+srv://username:password@cluster.mongodb.net/"
```

### 4. Start Backend Server

```powershell
cd backend
uvicorn main:app --reload
```

## Key Changes

### Models
- All models now use Pydantic BaseModel instead of SQLAlchemy
- IDs are now strings (MongoDB ObjectId) instead of integers
- No more foreign key constraints (document-based)

### API Routes
- All routes are now async (using `async def`)
- No more `db` dependency injection
- ObjectId validation for ID parameters

### Collections
- `professors` - Professor profiles
- `gigs` - Research gigs
- `applications` - Student applications

## Migration Notes

1. **No automatic migration**: MongoDB is schema-less, but you'll need to create new accounts
2. **ObjectIds**: All IDs are now 24-character hex strings (e.g., "507f1f77bcf86cd799439011")
3. **No foreign keys**: Relationships are maintained via string references
4. **Async operations**: All database operations are asynchronous

## Testing the Setup

Once MongoDB is running, test the API:

```bash
# Health check
curl http://localhost:8000/health

# Register a new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Professor",
    "email": "test@university.edu",
    "password": "password123",
    "department": "Computer Science",
    "qualification": "PhD"
  }'
```
