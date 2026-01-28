"""
Clear all gigs and applications from MongoDB database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "profhub"


async def clear_data():
    """Clear all gigs and applications from database"""
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
    
    print(f"\nClearing data from database: {DATABASE_NAME}")
    
    # Get collections
    gigs = db.get_collection("gigs")
    applications = db.get_collection("applications")
    
    # Count before deletion
    gigs_count_before = await gigs.count_documents({})
    apps_count_before = await applications.count_documents({})
    
    print(f"\nBefore deletion:")
    print(f"  - Gigs: {gigs_count_before}")
    print(f"  - Applications: {apps_count_before}")
    
    # Delete all documents
    print("\nDeleting all gigs...")
    result_gigs = await gigs.delete_many({})
    print(f"  ✓ Deleted {result_gigs.deleted_count} gigs")
    
    print("\nDeleting all applications...")
    result_apps = await applications.delete_many({})
    print(f"  ✓ Deleted {result_apps.deleted_count} applications")
    
    # Count after deletion
    gigs_count_after = await gigs.count_documents({})
    apps_count_after = await applications.count_documents({})
    
    print(f"\nAfter deletion:")
    print(f"  - Gigs: {gigs_count_after}")
    print(f"  - Applications: {apps_count_after}")
    
    print("\n✓ Data cleared successfully!")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(clear_data())
