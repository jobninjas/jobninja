"""
Adzuna Job API Service - Free Tier: 1,000 calls/month
Fetches jobs from Adzuna API with USA filtering
"""
import aiohttp
import logging
import os
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class AdzunaService:
    def __init__(self):
        self.app_id = os.getenv('ADZUNA_APP_ID')
        self.api_key = os.getenv('ADZUNA_API_KEY')
        self.base_url = "https://api.adzuna.com/v1/api/jobs/us/search"
        
    async def fetch_jobs(
        self, 
        keyword: Optional[str] = None,
        location: Optional[str] = None,
        page: int = 1,
        results_per_page: int = 50
    ) -> Dict[str, Any]:
        """
        Fetch jobs from Adzuna API
        
        Args:
            keyword: Search keyword (e.g., "software engineer")
            location: Location filter (e.g., "New York" or leave None for all USA)
            page: Page number (1-indexed)
            results_per_page: Results per page (max 50)
            
        Returns:
            Dictionary with 'jobs' list and metadata
        """
        if not self.app_id or not self.api_key:
            logger.error("Adzuna API credentials not configured")
            return {"jobs": [], "error": "API credentials missing"}
            
        try:
            url = f"{self.base_url}/{page}"
            
            params = {
                "app_id": self.app_id,
                "app_key": self.api_key,
                "results_per_page": min(results_per_page, 50),
                "content-type": "application/json"
            }
            
            # Add optional filters
            if keyword:
                params["what"] = keyword
            if location:
                params["where"] = location
                
            logger.info(f"Fetching Adzuna jobs - Page {page}, Keyword: {keyword}, Location: {location}")
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=15)) as response:
                    if response.status != 200:
                        logger.error(f"Adzuna API error: {response.status}")
                        return {"jobs": [], "error": f"API returned status {response.status}"}
                        
                    data = await response.json()
                    
                    # Normalize job data to our schema
                    normalized_jobs = []
                    for job in data.get('results', []):
                        normalized_job = {
                            "title": job.get('title', 'Unknown Title'),
                            "company": job.get('company', {}).get('display_name', 'Unknown Company'),
                            "location": job.get('location', {}).get('display_name', 'USA'),
                            "description": job.get('description', ''),
                            "url": job.get('redirect_url', ''),
                            "salary": self._format_salary(job.get('salary_min'), job.get('salary_max')),
                            "datePosted": job.get('created', datetime.now().isoformat()),
                            "source": "Adzuna",
                            "workType": self._detect_work_type(job.get('description', '')),
                            "sponsorship": "Unknown"
                        }
                        normalized_jobs.append(normalized_job)
                        
                    logger.info(f"Fetched {len(normalized_jobs)} jobs from Adzuna")
                    
                    return {
                        "jobs": normalized_jobs,
                        "total": data.get('count', 0),
                        "page": page,
                        "source": "Adzuna"
                    }
                    
        except Exception as e:
            logger.error(f"Error fetching Adzuna jobs: {e}")
            return {"jobs": [], "error": str(e)}
            
    def _format_salary(self, min_salary: Optional[float], max_salary: Optional[float]) -> str:
        """Format salary range"""
        if min_salary and max_salary:
            return f"${int(min_salary):,} - ${int(max_salary):,}"
        elif min_salary:
            return f"${int(min_salary):,}+"
        elif max_salary:
            return f"Up to ${int(max_salary):,}"
        return ""
        
    def _detect_work_type(self, description: str) -> str:
        """Detect work type from job description"""
        desc_lower = description.lower()
        if 'remote' in desc_lower or 'work from home' in desc_lower:
            return 'Remote'
        elif 'hybrid' in desc_lower:
            return 'Hybrid'
        return 'On-site'
        
    async def fetch_multiple_pages(
        self,
        keyword: Optional[str] = None,
        location: Optional[str] = None,
        max_pages: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Fetch multiple pages of jobs
        
        Args:
            keyword: Search keyword
            location: Location filter
            max_pages: Maximum number of pages to fetch
            
        Returns:
            List of all jobs from all pages
        """
        all_jobs = []
        
        for page in range(1, max_pages + 1):
            result = await self.fetch_jobs(keyword=keyword, location=location, page=page)
            
            jobs = result.get('jobs', [])
            if not jobs:
                logger.info(f"No more jobs found at page {page}")
                break
                
            all_jobs.extend(jobs)
            logger.info(f"Total jobs collected so far: {len(all_jobs)}")
            
        return all_jobs
