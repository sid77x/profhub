from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

client = AsyncIOMotorClient(settings.mongodb_url)
database = client[settings.database_name]

# Collections
professors_collection = database.get_collection("professors")
gigs_collection = database.get_collection("gigs")
applications_collection = database.get_collection("applications")
notifications_collection = database.get_collection("notifications")


async def get_database():
    return database
