from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

client = AsyncIOMotorClient(settings.mongodb_url)
database = client[settings.database_name]

# Collections
professors_collection = database.get_collection("professors")
students_collection = database.get_collection("students")
gigs_collection = database.get_collection("gigs")
applications_collection = database.get_collection("applications")
notifications_collection = database.get_collection("notifications")
otp_collection = database.get_collection("email_otps")
admins_collection = database.get_collection("admins")
audit_logs_collection = database.get_collection("audit_logs")


async def get_database():
    return database
