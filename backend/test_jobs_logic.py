import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add current directory to path
sys.path.append(os.getcwd())
sys.path.append(str(Path(os.getcwd()) / "backend"))

# Mocking some dependencies if needed
os.environ["ENVIRONMENT"] = "development"

async def test_endpoint_logic():
    print("--- Testing /api/jobs logic ---")
    try:
        from backend.supabase_service import SupabaseService
        from backend.server import _format_supabase_job, _calculate_match_score
        
        print("Imports successful.")
        
        # Test basic fetch
        print("Fetching jobs...")
        jobs = SupabaseService.get_jobs(limit=5)
        print(f"Fetched {len(jobs)} jobs.")
        
        if jobs:
            print("Formatting first job...")
            formatted = _format_supabase_job(jobs[0])
            print("Formatting successful.")
            
            print("Calculating match score...")
            score = _calculate_match_score(formatted, None)
            print(f"Match score: {score}")
            
        print("SUCCESS: Endpoint logic works locally.")
        
    except Exception as e:
        import traceback
        print(f"FAILURE: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    load_dotenv()
    asyncio.run(test_endpoint_logic())
