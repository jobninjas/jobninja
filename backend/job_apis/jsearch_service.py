"""
JSearch API Service (via RapidAPI) - Free Tier: 100 requests/day
Fetches jobs from multiple sources including Indeed, LinkedIn, Glassdoor
"""
import aiohttp
import logging
import os
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class JSearchService:
    def __init__(self):
        self.api_key = os.getenv('RAPIDAPI_KEY')
        self.base_url = "https://jsearch.p.rapidapi.com/search"
        self.headers = {
            "X-RapidAPI-Key": self.api_key,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
        }
        
    async def fetch_jobs(
        self,
        query: str = "software engineer",
        location: str = "United States",
        page: int = 1,
        num_pages: int = 1
    ) -> Dict[str, Any]:
        """
        Fetch jobs from JSearch API
        
        Args:
            query: Job search query
            location: Location (default: "United States")
            page: Page number
            num_pages: Number of pages to fetch in this call
            
        Returns:
            Dictionary with 'jobs' list and metadata
        """
        if not self.api_key:
            logger.error("RapidAPI key not configured")
            return {"jobs": [], "error": "API key missing"}
            
        try:
            params = {
                "query": f"{query} in {location}",
                "page": str(page),
                "num_pages": str(num_pages),
                "date_posted": "all"
            }
            
            logger.info(f"Fetching JSearch jobs - Query: {query}, Location: {location}, Page: {page}")
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    self.base_url,
                    headers=self.headers,
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=20)
                ) as response:
                    if response.status != 200:
                        logger.error(f"JSearch API error: {response.status}")
                        text = await response.text()
                        logger.error(f"Response: {text[:200]}")
                        return {"jobs": [], "error": f"API returned status {response.status}"}
                        
                    data = await response.json()
                    
                    # Normalize job data
                    normalized_jobs = []
                    for job in data.get('data', []):
                        # Filter for USA jobs only
                        job_city = job.get('job_city') or ''
                        job_state = job.get('job_state') or ''
                        job_country = job.get('job_country') or ''
                        location_str = f"{job_city} {job_state} {job_country}"
                        if not any(k in location_str.lower() for k in ['united states', 'usa', 'us']):
                            continue
                            
                        normalized_job = {
                            "title": job.get('job_title', 'Unknown Title'),
                            "company": job.get('employer_name', 'Unknown Company'),
                            "location": f"{job.get('job_city', '')}, {job.get('job_state', 'USA')}".strip(', '),
                            "description": job.get('job_description', ''),
                            "url": job.get('job_apply_link') or job.get('job_google_link', ''),
                            "salary": self._format_salary(
                                job.get('job_min_salary'),
                                job.get('job_max_salary'),
                                job.get('job_salary_period')
                            ),
                            "datePosted": job.get('job_posted_at_datetime_utc', datetime.now().isoformat()),
                            "source": "JSearch",
                            "workType": job.get('job_employment_type', 'Full-time'),
                            "sponsorship": "Yes" if job.get('job_is_remote') else "Unknown"
                        }
                        normalized_jobs.append(normalized_job)
                        
                    logger.info(f"Fetched {len(normalized_jobs)} USA jobs from JSearch")
                    
                    return {
                        "jobs": normalized_jobs,
                        "total": len(normalized_jobs),
                        "page": page,
                        "source": "JSearch"
                    }
                    
        except Exception as e:
            logger.error(f"Error fetching JSearch jobs: {e}")
            return {"jobs": [], "error": str(e)}
            
    def _format_salary(
        self,
        min_salary: Optional[float],
        max_salary: Optional[float],
        period: Optional[str]
    ) -> str:
        """Format salary with period"""
        if not min_salary and not max_salary:
            return ""
            
        period_str = ""
        if period:
            period_str = f"/{period.lower()}" if period.lower() in ['hour', 'year', 'month'] else ""
            
        if min_salary and max_salary:
            return f"${int(min_salary):,} - ${int(max_salary):,}{period_str}"
        elif min_salary:
            return f"${int(min_salary):,}+{period_str}"
        elif max_salary:
            return f"Up to ${int(max_salary):,}{period_str}"
        return ""
        
    async def fetch_multiple_queries(
        self,
        queries: List[str] = None,
        location: str = "United States",
        pages_per_query: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Fetch jobs for multiple search queries
        
        Args:
            queries: List of search queries (e.g., ["software engineer", "data scientist"])
            location: Location filter
            pages_per_query: Pages to fetch per query
            
        Returns:
            List of all jobs from all queries
        """
        if queries is None:
            queries = [
                "software engineer",
                "data scientist",
                "product manager",
                "marketing manager",
                "sales representative"
            ]
            
        all_jobs = []
        
        for query in queries:
            for page in range(1, pages_per_query + 1):
                result = await self.fetch_jobs(query=query, location=location, page=page)
                jobs = result.get('jobs', [])
                
                if not jobs:
                    break
                    
                all_jobs.extend(jobs)
                logger.info(f"Query '{query}' page {page}: {len(jobs)} jobs. Total: {len(all_jobs)}")
                
        return all_jobs
