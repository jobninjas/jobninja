import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def check_stats():
    load_dotenv('backend/.env')
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    total = await db.jobs.count_documents({})
    print(f"TOTAL JOBS: {total}")
    
    sources = await db.jobs.distinct('source')
    for s in sources:
        count = await db.jobs.count_documents({'source': s})
        print(f"Source {s}: {count}")

if __name__ == "__main__":
    asyncio.run(check_stats())
