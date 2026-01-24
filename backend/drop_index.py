import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def drop_index():
    load_dotenv('backend/.env')
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    try:
        await db.jobs.drop_index('externalId_1')
        print("Successfully dropped index externalId_1")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(drop_index())
