"""
Setup script to create admin users
Run with: python -m backend.setup_admins or python setup_admins.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import asyncio
from datetime import datetime
import pymongo
from core.config import settings
from core.auth import get_password_hash

async def setup_admins():
    """Create initial admin users"""
    # Use synchronous MongoDB connection for setup
    client = pymongo.MongoClient(settings.mongodb_url)
    database = client[settings.database_name]
    admins_collection = database.get_collection("admins")
    
    admins_data = [
        {
            "name": "Shivli Dimri",
            "email": "shivli.admin@profhub.com",
            "password": "admin123"
        },
        {
            "name": "Siddhant Chutke",
            "email": "siddhant.admin@profhub.com",
            "password": "admin123"
        }
    ]
    
    for admin in admins_data:
        existing = admins_collection.find_one({"email": admin["email"]})
        if existing:
            print(f"✓ Admin {admin['name']} already exists")
            continue
        
        admin_doc = {
            "name": admin["name"],
            "email": admin["email"],
            "password_hash": get_password_hash(admin["password"]),
            "is_active": True,
            "created_at": datetime.utcnow(),
            "last_login": None
        }
        
        result = admins_collection.insert_one(admin_doc)
        print(f"✓ Created admin: {admin['name']} ({admin['email']})")
        print(f"  Password: {admin['password']}")
    
    client.close()
    print("\n✅ Admin setup complete! You can now login at http://localhost:5173/profhub")

if __name__ == "__main__":
    asyncio.run(setup_admins())
