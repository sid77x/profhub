"""
Clear all student accounts from MongoDB database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "profhub"


async def clear_students():
    """Clear all student accounts from database"""
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
    
    print(f"\nClearing students from database: {DATABASE_NAME}")
    
    # Get collection
    students = db.get_collection("students")
    
    # Count before deletion
    students_count_before = await students.count_documents({})
    
    print(f"\nBefore deletion:")
    print(f"  - Students: {students_count_before}")
    
    # Delete all documents
    print("\nDeleting all students...")
    result = await students.delete_many({})
    print(f"  ✓ Deleted {result.deleted_count} students")
    
    # Count after deletion
    students_count_after = await students.count_documents({})
    
    print(f"\nAfter deletion:")
    print(f"  - Students: {students_count_after}")
    
    print("\n✓ Student database cleared successfully!")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(clear_students())
