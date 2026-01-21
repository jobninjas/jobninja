
import asyncio
import os
import re
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def check_user():
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    email = "srkreddy452@gmail.com"
    cursor = db.users.find({"email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}})
    users = await cursor.to_list(length=10)
    
    if users:
        print(f"Found {len(users)} users matching '{email}'")
        for i, user in enumerate(users):
            print(f"\n--- User {i+1} ---")
            print(f"ID: {user.get('_id')}")
            print(f"Email in DB: '{user.get('email')}'")
            print(f"Is Verified: {user.get('is_verified')}")
            print(f"Verification Token exists: {bool(user.get('verification_token'))}")
            print(f"Created At: {user.get('created_at')}")
    else:
        print(f"No users found matching '{email}'")

if __name__ == "__main__":
    asyncio.run(check_user())
