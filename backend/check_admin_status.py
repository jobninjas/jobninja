
import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "novaninjas")

async def check_user(email):
    print(f"Connecting to {DB_NAME}...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print(f"Checking user: {email}")
    user = await db.users.find_one({"email": email})
    
    if user:
        print(f"✅ Found User:")
        print(f"   Name: {user.get('name')}")
        print(f"   Email: {user.get('email')}")
        print(f"   Role: {user.get('role')}  <-- THIS MUST BE 'admin'")
        print(f"   ID: {user.get('_id')}")
        print(f"   Plan: {user.get('plan')}")
    else:
        print("❌ User not found!")

    client.close()

if __name__ == "__main__":
    asyncio.run(check_user("srkreddy452@gmail.com"))
