
import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "novaninjas")

async def drop_jobs():
    print(f"Connecting to {DB_NAME}...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🧨 Dropping 'jobs' collection to free physical space...")
    try:
        await db.drop_collection("jobs")
        print("✅ Collection 'jobs' dropped.")
    except Exception as e:
        print(f"Error dropping collection: {e}")

    # Verify size
    try:
        stats = await db.command("dbStats")
        print(f"📉 New Data Size: {stats['dataSize'] / 1024 / 1024:.2f} MB")
        print(f"📉 New Storage Size: {stats['storageSize'] / 1024 / 1024:.2f} MB")
    except Exception as e:
        print(f"Could not get dbStats: {e}")

    client.close()

if __name__ == "__main__":
    asyncio.run(drop_jobs())
