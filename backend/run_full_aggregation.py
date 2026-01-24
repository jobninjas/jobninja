import asyncio
import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Add current directory to path
import sys
sys.path.append(os.getcwd())

from job_apis.job_aggregator import JobAggregator

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_aggregation():
    load_dotenv()
    
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'novaninjas')
    
    if not mongo_url:
        print("Error: MONGO_URL not found in .env")
        return

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("--- Starting Full Job Aggregation ---")
    aggregator = JobAggregator(db)
    
    # Run full aggregation for JSearch and USAJobs
    # Skip Adzuna as requested
    stats = await aggregator.aggregate_all_jobs(
        use_adzuna=False,
        use_jsearch=True,
        use_usajobs=True,
        max_adzuna_pages=0,
        max_jsearch_queries=15 # Comprehensive search
    )
    
    print("\n--- Aggregation Summary ---")
    print(f"Total Fetched: {stats.get('total_fetched')}")
    print(f"Total Unique: {stats.get('total_unique')}")
    print(f"Total Stored/Updated: {stats.get('total_stored')}")
    if stats.get('errors'):
        print(f"Errors: {stats['errors']}")
    
    # Get final stats
    final_stats = await aggregator.get_job_stats()
    print(f"\nTotal Jobs in DB: {final_stats.get('total_jobs')}")

if __name__ == "__main__":
    asyncio.run(run_aggregation())
