"""
USAJobs.gov API Service - Free & Unlimited
Fetches federal government jobs from official USA government API
"""
import aiohttp
import logging
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
import xml.etree.ElementTree as ET

logger = logging.getLogger(__name__)

class USAJobsService:
    def __init__(self):
        self.api_key = os.getenv('USAJOBS_API_KEY')  # Usually your email
        self.user_agent = os.getenv('USAJOBS_USER_AGENT', self.api_key)  # Same as API key
        self.base_url = "https://data.usajobs.gov/api/search"
        self.headers = {
            "Authorization-Key": self.api_key,
            "User-Agent": self.user_agent
        }
        
    async def fetch_jobs(
        self,
        keyword: Optional[str] = None,
        location: Optional[str] = None,
        page: int = 1,
        results_per_page: int = 500  # USAJobs allows up to 500
    ) -> Dict[str, Any]:
        """
        Fetch federal jobs from USAJobs.gov API
        
        Args:
            keyword: Job keyword
            location: Location (city, state, or leave None for all USA)
            page: Page number (1-indexed)
            results_per_page: Results per page (max 500)
            
        Returns:
            Dictionary with 'jobs' list and metadata
        """
        if not self.api_key:
            logger.error("USAJobs API key not configured")
            return {"jobs": [], "error": "API key missing"}
            
        try:
            params = {
                "ResultsPerPage": min(results_per_page, 500),
                "Page": page
            }
            
            if keyword:
                params["Keyword"] = keyword
            if location:
                params["LocationName"] = location
                
            logger.info(f"Fetching USAJobs - Page {page}, Keyword: {keyword}, Location: {location}")
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    self.base_url,
                    headers=self.headers,
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=20)
                ) as response:
                    if response.status != 200:
                        logger.error(f"USAJobs API error: {response.status}")
                        return {"jobs": [], "error": f"API returned status {response.status}"}
                        
                    data = await response.json()
                    
                    # Normalize job data
                    normalized_jobs = []
                    search_result = data.get('SearchResult', {})
                    
                    for item in search_result.get('SearchResultItems', []):
                        job = item.get('MatchedObjectDescriptor', {})
                        
                        # Extract location
                        locations = job.get('PositionLocation', [])
                        location_str = "USA"
                        if locations:
                            first_loc = locations[0]
                            city = first_loc.get('CityName', '')
                            state = first_loc.get('StateCode', '')
                            location_str = f"{city}, {state}" if city and state else state or "USA"
                            
                        # Extract salary
                        salary_min = job.get('PositionRemuneration', [{}])[0].get('MinimumRange', '')
                        salary_max = job.get('PositionRemuneration', [{}])[0].get('MaximumRange', '')
                        salary = self._format_salary(salary_min, salary_max)
                        
                        # Detect remote work
                        remote_indicator = job.get('PositionRemoteIndicator', [])
                        work_type = 'Remote' if remote_indicator and remote_indicator[0] else 'On-site'
                        
                        normalized_job = {
                            "title": job.get('PositionTitle', 'Unknown Title'),
                            "company": job.get('OrganizationName', 'US Federal Government'),
                            "location": location_str,
                            "description": self._clean_html(job.get('UserArea', {}).get('Details', {}).get('JobSummary', '')),
                            "url": job.get('PositionURI', ''),
                            "salary": salary,
                            "datePosted": job.get('PublicationStartDate', datetime.now().isoformat()),
                            "source": "USAJobs.gov",
                            "workType": work_type,
                            "sponsorship": "N/A"  # Federal jobs don't need sponsorship for US citizens
                        }
                        normalized_jobs.append(normalized_job)
                        
                    total_jobs = search_result.get('SearchResultCount', 0)
                    logger.info(f"Fetched {len(normalized_jobs)} federal jobs from USAJobs.gov")
                    
                    return {
                        "jobs": normalized_jobs,
                        "total": total_jobs,
                        "page": page,
                        "source": "USAJobs.gov"
                    }
                    
        except Exception as e:
            logger.error(f"Error fetching USAJobs: {e}")
            return {"jobs": [], "error": str(e)}
            
    def _format_salary(self, min_salary: str, max_salary: str) -> str:
        """Format salary range"""
        try:
            if min_salary and max_salary:
                return f"${int(float(min_salary)):,} - ${int(float(max_salary)):,}/year"
            elif min_salary:
                return f"${int(float(min_salary)):,}+/year"
            elif max_salary:
                return f"Up to ${int(float(max_salary)):,}/year"
        except (ValueError, TypeError):
            pass
        return ""
        
    def _clean_html(self, html_text: str) -> str:
        """Remove HTML tags from text"""
        if not html_text:
            return ""
        # Simple HTML tag removal
        import re
        clean = re.compile('<.*?>')
        return re.sub(clean, '', html_text).strip()
        
    async def fetch_all_pages(
        self,
        keyword: Optional[str] = None,
        location: Optional[str] = None,
        max_results: int = 10000
    ) -> List[Dict[str, Any]]:
        """
        Fetch all available federal jobs
        
        Args:
            keyword: Job keyword
            location: Location filter
            max_results: Maximum number of results to fetch
            
        Returns:
            List of all jobs
        """
        all_jobs = []
        page = 1
        results_per_page = 500
        
        while len(all_jobs) < max_results:
            result = await self.fetch_jobs(
                keyword=keyword,
                location=location,
                page=page,
                results_per_page=results_per_page
            )
            
            jobs = result.get('jobs', [])
            if not jobs:
                logger.info(f"No more federal jobs found at page {page}")
                break
                
            all_jobs.extend(jobs)
            logger.info(f"Total federal jobs collected: {len(all_jobs)}")
            
            # Check if we've reached the end
            total = result.get('total', 0)
            if len(all_jobs) >= total:
                break
                
            page += 1
            
        return all_jobs[:max_results]
