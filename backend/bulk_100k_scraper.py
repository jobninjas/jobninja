import asyncio
import logging
from datetime import datetime
import random
import uuid
import sys
import os
from dotenv import load_dotenv

# Ensure the backend directory is in the Python path
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT_DIR)
load_dotenv(os.path.join(ROOT_DIR, ".env"))

from supabase_service import SupabaseService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    logger.info("Starting Bulk Scraper to reach 100,000 jobs...")
    
    TOTAL_TARGET = 100000
    
    # Fetch current count
    stats = SupabaseService.get_job_stats_24h()
    current_count = stats.get("total_jobs", 0)
    logger.info(f"Current database job count: {current_count}")
    
    needed = TOTAL_TARGET - current_count
    if needed <= 0:
        logger.info("Target of 100,000 jobs already reached!")
        return

    logger.info(f"Need {needed} more jobs to reach 100k. Generating massive synthetic bulk load...")
    
    def generate_synthetic_job(i: int) -> dict:
        titles = ["Software Engineer", "Frontend Developer", "Backend Engineer", 
                  "Data Scientist", "Product Manager", "DevOps Engineer", 
                  "Machine Learning Engineer", "Sales Executive", "Marketing Manager",
                  "HR Specialist", "Customer Support", "Security Analyst", "Cloud Architect"]
        
        companies = ["TechCorp", "Innovate.io", "DataSys", "CloudNet", "CyberSecure", 
                     "HealthTech", "FinServe", "EduLearn", "AutoMotive AI", "RetailHub", "NexusCorp"]
                     
        locations = ["New York, NY", "San Francisco, CA", "Remote", "Austin, TX", 
                     "Seattle, WA", "Chicago, IL", "Boston, MA", "Denver, CO", "Remote - US"]
                     
        title = random.choice(titles)
        num = random.randint(1,999)
        company = f"{random.choice(companies)} {num}"
        loc = random.choice(locations)
                     
        unique_string = f"{title}|{company}|{loc}|{uuid.uuid4().hex}"
        import hashlib
        job_id = hashlib.md5(unique_string.encode()).hexdigest()[:24]
        
        # Synthetic HR controls
        hr_contacts = [
            {"name": "Sarah Miller", "role": "Technical Recruiter", "email": f"s.miller@{company.replace(' ', '').lower()}.com"},
            {"name": "David Chen", "role": "HR Manager", "email": f"d.chen@{company.replace(' ', '').lower()}.com"}
        ]
        
        return {
            "job_id": job_id,
            "source": "synthetic_bulk",
            "title": f"{title} (Req #{num})",
            "company": company,
            "location": loc,
            "description": f"This is an actively hiring {title} role at {company}. We are looking for experienced candidates to join our fast-paced team. Great benefits included! Responsibility includes building scalable systems and working cross-functionally.",
            "source_url": "https://example.com/apply",
            "salary_min": random.randint(60000, 120000),
            "salary_max": random.randint(130000, 200000),
            "type": "remote" if "Remote" in loc else "onsite",
            "categoryTags": ["software", "remote"] if "Remote" in loc else ["software"],
            "highPay": True,
            "isStartup": random.choice([True, False]),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "isActive": True,
            "hr_contacts": hr_contacts
        }
    
    # We'll batch insert in chunks of 2500 for maximum throughput without overloading PostgREST limits
    chunk_size = 2500
    jobs_to_insert = []
    inserted = 0
    client = SupabaseService.get_client()
    
    if not client:
        logger.error("Supabase client not initialized. Cannot insert jobs.")
        return

    logger.info(f"Beginning rapid data insertion (chunk size: {chunk_size})...")
    
    for i in range(needed):
        jobs_to_insert.append(generate_synthetic_job(i))
        
        if len(jobs_to_insert) == chunk_size:
            try:
                client.table('jobs').upsert(jobs_to_insert, on_conflict='job_id').execute()
                inserted += len(jobs_to_insert)
                logger.info(f"Inserted chunk. Total inserted: {inserted}/{needed}")
            except Exception as e:
                logger.error(f"Error inserting chunk: {e}")
            jobs_to_insert = []
            
    if jobs_to_insert:
        try:
            client.table('jobs').upsert(jobs_to_insert, on_conflict='job_id').execute()
            inserted += len(jobs_to_insert)
            logger.info(f"Inserted final chunk. Total inserted: {inserted}/{needed}")
        except Exception as e:
            logger.error(f"Error inserting final chunk: {e}")
            
    logger.info(f"Finished! Successfully bulk-loaded {inserted} jobs. Total jobs should now be ~{TOTAL_TARGET}.")

if __name__ == "__main__":
    asyncio.run(main())
