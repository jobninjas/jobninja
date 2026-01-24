import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Add current directory to path
sys.path.append(os.getcwd())

from job_apis.rss_service import RSSJobService
from job_apis.job_aggregator import JobAggregator

async def test_rss():
    load_dotenv('backend/.env')
    
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'novaninjas')
    
    if not mongo_url:
        print("Error: MONGO_URL not found in .env")
        return

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("--- Testing RSS Job Service (Remote Sources) ---")
    rss_service = RSSJobService()
    
    for name, url in rss_service.feeds.items():
        print(f"\nTesting {name} RSS...")
        jobs = await rss_service.fetch_jobs_from_feed(url, name)
        print(f"{name} Jobs Found: {len(jobs)}")
        if jobs:
            print(f"Sample {name} Job: '{jobs[0]['title']}' at '{jobs[0]['company']}'")

    print("\n--- Testing RSS Integration in Aggregator ---")
    aggregator = JobAggregator(db)
    
    # Run aggregation for RSS only
    stats = await aggregator.aggregate_all_jobs(
        use_adzuna=False,
        use_jsearch=False,
        use_usajobs=False,
        use_rss=True
    )
    
    print("\nAggregation Stats for RSS:")
    print(f"RSS Jobs Fetched: {stats.get('rss')}")
    print(f"Total Unique: {stats.get('total_unique')}")
    print(f"Total Stored/Updated: {stats.get('total_stored')}")
    if stats.get('errors'):
        print(f"Errors: {stats['errors']}")

if __name__ == "__main__":
    asyncio.run(test_rss())
