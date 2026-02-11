
import asyncio
import os
import sys
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load env vars
load_dotenv()

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "novaninjas")

if not MONGO_URL:
    print("Error: MONGO_URL not set")
    sys.exit(1)

async def force_cleanup():
    print(f"Connecting to {DB_NAME}...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # 1. Check collection stats if possible (skip if permissons issue)
    try:
        stats = await db.command("collStats", "jobs")
        print(f"Jobs Collection Size: {stats['size'] / 1024 / 1024:.2f} MB")
        print(f"Jobs Count: {stats['count']}")
    except Exception as e:
        print(f"Could not get stats: {e}")

    # 2. Define cutoff (3 days ago)
    cutoff_date = datetime.utcnow() - timedelta(days=3)
    cutoff_str = cutoff_date.isoformat()
    
    print(f"Deleting jobs older than {cutoff_str} AND jobs with missing dates...")

    # Query for old jobs (handling both datetime objects and strings)
    # AND missing/null dates
    query = {
        "$or": [
            {"created_at": {"$lt": cutoff_date}},
            {"created_at": {"$lt": cutoff_str}},
            {"created_at": None},
            {"created_at": {"$exists": False}}
        ]
    }
    
    # Count first
    count_to_delete = await db.jobs.count_documents(query)
    print(f"Found {count_to_delete} jobs to delete.")
    
    if count_to_delete > 0:
        # Delete
        result = await db.jobs.delete_many(query)
        print(f"Deleted {result.deleted_count} jobs.")
        
        # Also clean up resumes if they are huge? No, user data is precious.
    else:
        print("No old jobs found to delete.")
        
    # verify remaining
    remaining = await db.jobs.count_documents({})
    print(f"Remaining jobs: {remaining}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(force_cleanup())
