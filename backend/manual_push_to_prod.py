import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from job_sync_service import JobSyncService

# Load Env
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
if not MONGO_URL:
    print("❌ MONGO_URL not found in .env")
    exit(1)

print(f"Connecting to MongoDB: {MONGO_URL.split('@')[-1]}")

async def run_manual_sync():
    try:
        # Connect to DB
        client = AsyncIOMotorClient(MONGO_URL)
        db = client.get_default_database() # Uses database from connection string
        
        print("✅ DB Connected")
        
        service = JobSyncService(db)
        
        print("🚀 Starting Adzuna Sync...")
        count_adzuna = await service.sync_adzuna_jobs()
        print(f"✅ Adzuna Sync Done: {count_adzuna} jobs added")
        
        print("🚀 Starting JSearch Sync...")
        count_jsearch = await service.sync_jsearch_jobs()
        print(f"✅ JSearch Sync Done: {count_jsearch} jobs added")
        
        print("🎉 MANUAL SYNC COMPLETE")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(run_manual_sync())
