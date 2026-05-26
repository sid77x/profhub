"""
Check notifications in the database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

MONGODB_URL = settings.mongodb_url
DATABASE_NAME = settings.database_name


async def check_notifications():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    notifications = db.get_collection("notifications")
    
    count = await notifications.count_documents({})
    print(f"Total notifications: {count}")
    
    print("\nAll notifications:")
    async for notif in notifications.find({}):
        print(f"\n- ID: {notif['_id']}")
        print(f"  User ID: {notif.get('user_id')}")
        print(f"  User Type: {notif.get('user_type')}")
        print(f"  Title: {notif.get('title')}")
        print(f"  Message: {notif.get('message')}")
        print(f"  Read: {notif.get('read')}")
        print(f"  Created: {notif.get('created_at')}")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(check_notifications())
