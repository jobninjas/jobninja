import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add current directory to path
sys.path.append(os.getcwd())

from job_apis.jsearch_service import JSearchService
from job_apis.usajobs_service import USAJobsService

async def test_apis():
    load_dotenv()
    
    print("--- Testing JSearch API ---")
    jsearch = JSearchService()
    if not jsearch.api_key:
        print("Error: RAPIDAPI_KEY not found in .env")
    else:
        result = await jsearch.fetch_jobs(query="software engineer", location="United States", page=1)
        if result.get("error"):
            print(f"JSearch Error: {result['error']}")
        else:
            print(f"JSearch Success: Found {len(result.get('jobs', []))} jobs")
            if result.get("jobs"):
                print(f"Sample Job: {result['jobs'][0]['title']} at {result['jobs'][0]['company']}")

    print("\n--- Testing USAJobs API ---")
    usajobs = USAJobsService()
    if not usajobs.api_key:
        print("Error: USAJOBS_API_KEY not found in .env")
    else:
        result = await usajobs.fetch_jobs(keyword="engineer", location="Washington, DC", page=1)
        if result.get("error"):
            print(f"USAJobs Error: {result['error']}")
        else:
            print(f"USAJobs Success: Found {len(result.get('jobs', []))} jobs")
            if result.get("jobs"):
                print(f"Sample Job: {result['jobs'][0]['title']} at {result['jobs'][0]['company']}")

if __name__ == "__main__":
    asyncio.run(test_apis())
