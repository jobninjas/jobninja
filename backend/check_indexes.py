import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def check_indexes():
    load_dotenv('backend/.env')
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    indexes = await db.jobs.index_information()
    print("CURRENT INDEXES:")
    for name, info in indexes.items():
        print(f"Name: {name}, Keys: {info['key']}, Unique: {info.get('unique', False)}")

if __name__ == "__main__":
    asyncio.run(check_indexes())
