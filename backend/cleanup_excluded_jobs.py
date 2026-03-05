import os
import asyncio
import logging
from supabase import create_client
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv("c:/Users/vsair/Downloads/novasquar-main/novasquad-main/nova-ninjas/backend/.env")

async def cleanup_jobs():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        logger.error("Missing Supabase credentials")
        return

    sb = create_client(url, key)
    
    excluded_keywords = ['adzuna', 'ziprecruiter', 'monster', 'dice', 'indeed']
    
    total_deleted = 0
    for keyword in excluded_keywords:
        logger.info(f"Cleaning up jobs from source/publisher containing '{keyword}'...")
        
        # 1. By source
        try:
            res1 = sb.table("jobs").delete().ilike("source", f"%{keyword}%").execute()
            count1 = len(res1.data) if res1.data else 0
            total_deleted += count1
        except Exception as e:
            logger.error(f"Error deleting by source for {keyword}: {e}")
            count1 = 0
        
        # 2. By source_url
        try:
            res2 = sb.table("jobs").delete().ilike("source_url", f"%{keyword}%").execute()
            count2 = len(res2.data) if res2.data else 0
            total_deleted += count2
        except Exception as e:
            logger.error(f"Error deleting by url for {keyword}: {e}")
            count2 = 0
        
        logger.info(f"Deleted {count1} + {count2} for keyword '{keyword}'")

    # --- LinkedIn Easy Apply Filter ---
    logger.info("Cleaning up likely LinkedIn Easy Apply jobs...")
    try:
        indicator_query = sb.table("jobs").select("id, source_url, description").ilike("source_url", "%linkedin.com/jobs/view%").execute()
        jobs = indicator_query.data or []
        
        ids_to_delete = []
        # Non-easy-apply indicators
        career_indicators = ['greenhouse.io', 'lever.co', 'ashbyhq.com', 'apply.', 'careers.', 'jobs.', 'workdayjobs.com', 'breezy.hr']
        
        for job in jobs:
            u = job.get('source_url', '').lower()
            desc = (job.get('description') or '').lower()
            # If it doesn't have a career site indicator OR mentions "easy apply"
            if not any(ind in u for ind in career_indicators) or "easy apply" in desc:
                ids_to_delete.append(job['id'])
                
        if ids_to_delete:
            # Delete in chunks
            chunk_size = 50
            for i in range(0, len(ids_to_delete), chunk_size):
                chunk = ids_to_delete[i:i+chunk_size]
                sb.table("jobs").delete().in_("id", chunk).execute()
            total_deleted += len(ids_to_delete)
            logger.info(f"Deleted {len(ids_to_delete)} likely LinkedIn Easy Apply jobs.")
    except Exception as e:
        logger.error(f"Error in LinkedIn cleanup: {e}")

    logger.info(f"Final Cleanup Result: {total_deleted} jobs removed.")

if __name__ == "__main__":
    asyncio.run(cleanup_jobs())
