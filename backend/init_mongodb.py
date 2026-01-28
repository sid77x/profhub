"""
Initialize MongoDB database and create indexes for ProfHub
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "profhub"


async def init_db():
    """Initialize database with indexes"""
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    print(f"Connecting to MongoDB at {MONGODB_URL}...")
    
    # Test connection
    try:
        await client.admin.command('ping')
        print("✓ Connected to MongoDB successfully!")
    except Exception as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        return
    
    print(f"\nInitializing database: {DATABASE_NAME}")
    
    # Create collections and indexes
    print("\n1. Setting up 'professors' collection...")
    professors = db.get_collection("professors")
    await professors.create_index("email", unique=True)
    print("   ✓ Created unique index on 'email'")
    
    print("\n2. Setting up 'gigs' collection...")
    gigs = db.get_collection("gigs")
    await gigs.create_index("professor_id")
    await gigs.create_index("status")
    print("   ✓ Created index on 'professor_id'")
    print("   ✓ Created index on 'status'")
    
    print("\n3. Setting up 'students' collection...")
    students = db.get_collection("students")
    await students.create_index("email", unique=True)
    await students.create_index("reg_no", unique=True)
    print("   ✓ Created unique index on 'email'")
    print("   ✓ Created unique index on 'reg_no'")
    
    print("\n4. Setting up 'applications' collection...")
    applications = db.get_collection("applications")
    await applications.create_index("gig_id")
    await applications.create_index("student_email")
    await applications.create_index("student_id")
    await applications.create_index("status")
    print("   ✓ Created index on 'gig_id'")
    print("   ✓ Created index on 'student_email'")
    print("   ✓ Created index on 'student_id'")
    print("   ✓ Created index on 'status'")
    
    print("\n5. Setting up 'notifications' collection...")
    notifications = db.get_collection("notifications")
    await notifications.create_index("user_id")
    await notifications.create_index("read")
    await notifications.create_index([("user_id", 1), ("read", 1)])
    await notifications.create_index("created_at")
    print("   ✓ Created index on 'user_id'")
    print("   ✓ Created index on 'read'")
    print("   ✓ Created compound index on 'user_id' and 'read'")
    print("   ✓ Created index on 'created_at'")
    
    # Show database stats
    print("\n" + "="*50)
    print("Database Statistics:")
    print("="*50)
    
    collections = await db.list_collection_names()
    print(f"Collections: {', '.join(collections) if collections else 'None yet'}")
    
    prof_count = await professors.count_documents({})
    students_count = await students.count_documents({})
    gigs_count = await gigs.count_documents({})
    apps_count = await applications.count_documents({})
    notif_count = await notifications.count_documents({})
    
    print(f"\nDocument counts:")
    print(f"  - Professors: {prof_count}")
    print(f"  - Students: {students_count}")
    print(f"  - Gigs: {gigs_count}")
    print(f"  - Applications: {apps_count}")
    print(f"  - Notifications: {notif_count}")
    
    print("\n✓ Database initialization complete!")
    print(f"\nYou can now start your backend server:")
    print(f"  cd backend")
    print(f"  uvicorn main:app --reload")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(init_db())
