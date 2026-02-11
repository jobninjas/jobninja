
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
    print("Error: MONGO_URL not set")
    sys.exit(1)

async def inspect_db():
    print(f"Connecting to {DB_NAME}...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    output = []
    output.append(f"📊 Collection Sizes for {DB_NAME}:")
    collections = await db.list_collection_names()
    
    total_size = 0
    for col_name in collections:
        try:
            stats = await db.command("collStats", col_name)
            size_mb = stats['size'] / 1024 / 1024
            storage_mb = stats['storageSize'] / 1024 / 1024
            count = stats['count']
            total_size += storage_mb
            output.append(f"- {col_name:<25}: {count:>8} docs | {size_mb:>6.2f} MB (data) | {storage_mb:>6.2f} MB (storage)")
        except Exception as e:
            output.append(f"- {col_name}: Error getting stats")

    output.append(f"\nTotal Storage Size: {total_size:.2f} MB")
    
    output.append("\n🕵️ Sampling one job document:")
    job = await db.jobs.find_one()
    if job:
        output.append(f"ID: {job.get('_id')}")
        output.append(f"Created At: {job.get('created_at')} (Type: {type(job.get('created_at'))})")
        output.append(f"Source: {job.get('source')}")
    else:
        output.append("No jobs found.")
        
    with open("db_stats.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(output))
    
    print("Stats written to db_stats.txt")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(inspect_db())
