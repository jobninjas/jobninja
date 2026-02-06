import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load env vars
load_dotenv()

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "novaninjas")

if not MONGO_URL:
    print("Error: MONGO_URL not set in environment or .env file")
    sys.exit(1)

async def make_admin(email):
    print(f"Connecting to {DB_NAME}...")
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        user = await db.users.find_one({"email": email})
        if not user:
            print(f"User not found: {email}")
            return

        print(f"Found user: {user.get('name')} ({user.get('role', 'customer')})")
        
        result = await db.users.update_one(
            {"email": email},
            {"$set": {"role": "admin"}}
        )
        
        if result.modified_count > 0:
            print(f"Successfully updated {email} to ADMIN role.")
        else:
            print(f"User {email} was already an admin or update failed.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <email>")
        sys.exit(1)
        
    email = sys.argv[1]
    asyncio.run(make_admin(email))
