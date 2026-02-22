"""
Job Sync Service - Fetches jobs from Adzuna and JSearch APIs
Uses Supabase for storage and synchronization tracking.
"""

import os
import aiohttp
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging

from supabase_service import SupabaseService

logger = logging.getLogger(__name__)

class JobSyncService:
    def __init__(self, db=None):
        # db is kept for legacy signature but ignored in favor of SupabaseService
        self.db = db
        # Strip whitespace to handle copy-paste errors in env vars
        self.adzuna_app_id = os.getenv("ADZUNA_APP_ID", "").strip()
        self.adzuna_app_key = os.getenv("ADZUNA_APP_KEY", "").strip()
        self.rapidapi_key = os.getenv("RAPIDAPI_KEY", "").strip()
        
    async def sync_adzuna_jobs(self, query: str = "software engineer", max_days_old: int = 3) -> int:
        """Fetch jobs from Adzuna API and sync to Supabase"""
        try:
            if not self.adzuna_app_id or not self.adzuna_app_key:
                logger.warning("Adzuna API credentials not configured")
                return 0
            
            # List of high-intent queries to cycle through
            queries = [
                "software engineer", "visa sponsorship", "h1b friendly",
                "work visa", "data scientist", "product manager",
                "project manager", "business analyst", "devops engineer",
                "full stack developer"
            ]
            
            total_jobs_added = 0
            
            async with aiohttp.ClientSession() as session:
                for q in queries:
                    try:
                        url = "https://api.adzuna.com/v1/api/jobs/us/search/1"
                        params = {
                            "app_id": self.adzuna_app_id,
                            "app_key": self.adzuna_app_key,
                            "results_per_page": 50,
                            "what": q,
                            "max_days_old": max_days_old,  # Only jobs from last 3 days (72 hours)
                            "sort_by": "date"
                        }
                        
                        async with session.get(url, params=params, timeout=30) as response:
                            if response.status != 200:
                                logger.error(f"Adzuna error for query '{q}': {response.status}")
                                continue
                                
                            data = await response.json()
                    
                            jobs_added_this_query = 0
                            for job_data in data.get("results", []):
                                job = self._normalize_adzuna_job(job_data)
                                if await self._is_usa_job(job):
                                    categorized_job = await self._categorize_job(job)
                                    # Add tag based on query for easier filtering if needed
                                    if "visa" in q or "h1b" in q:
                                        if "visa-sponsoring" not in categorized_job.get("categories", []):
                                             categorized_job.setdefault("categories", []).append("visa-sponsoring")
                                             
                                    if await self._save_job(categorized_job):
                                        jobs_added_this_query += 1
                                        
                            total_jobs_added += jobs_added_this_query
                            logger.info(f"Adzuna query '{q}': {jobs_added_this_query} new jobs added")
                            
                            # Small delay to be nice to the API
                            await asyncio.sleep(1)
                            
                    except Exception as e:
                        logger.error(f"Error in Adzuna loop for '{q}': {e}")
                        continue
            
            # Update sync status in Supabase
            SupabaseService.update_job_sync_status("adzuna", {
                "last_sync": datetime.utcnow().isoformat(),
                "jobs_added": total_jobs_added,
                "status": "success"
            })
            
            logger.info(f"Adzuna sync cycle completed: {total_jobs_added} total jobs added across {len(queries)} queries")
            return total_jobs_added
            
        except Exception as e:
            logger.error(f"Adzuna sync failed: {str(e)}")
            SupabaseService.update_job_sync_status("adzuna", {
                "last_sync": datetime.utcnow().isoformat(),
                "status": "failed",
                "error": str(e)
            })
            return 0
    
    async def sync_jsearch_jobs(self, query: str = "software engineer") -> int:
        """Fetch jobs from JSearch API and sync to Supabase"""
        try:
            if not self.rapidapi_key:
                logger.warning("RapidAPI key not configured")
                return 0
            
            url = "https://jsearch.p.rapidapi.com/search"
            headers = {
                "X-RapidAPI-Key": self.rapidapi_key,
                "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
            }
            params = {
                "query": query,
                "page": "1",
                "num_pages": "1",
                "date_posted": "today",
                "country": "us"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers, params=params, timeout=30) as response:
                    response.raise_for_status()
                    data = await response.json()
            
            jobs_added = 0
            for job_data in data.get("data", []):
                job = self._normalize_jsearch_job(job_data)
                if await self._is_usa_job(job):
                    categorized_job = await self._categorize_job(job)
                    if await self._save_job(categorized_job):
                        jobs_added += 1
            
            SupabaseService.update_job_sync_status("jsearch", {
                "last_sync": datetime.utcnow().isoformat(),
                "jobs_added": jobs_added,
                "status": "success"
            })
            
            logger.info(f"JSearch sync completed: {jobs_added} jobs added")
            return jobs_added
            
        except Exception as e:
            logger.error(f"JSearch sync failed: {str(e)}")
            SupabaseService.update_job_sync_status("jsearch", {
                "last_sync": datetime.utcnow().isoformat(),
                "status": "failed",
                "error": str(e)
            })
            return 0
    
    def _normalize_adzuna_job(self, job_data: Dict) -> Dict:
        """Normalize Adzuna job data to common format"""
        location_obj = job_data.get("location", {})
        display_name = location_obj.get("display_name", "")
        area = location_obj.get("area", [])
        
        # Improves location string for strict USA filtering
        # Adzuna area format: ["US", "Illinois", "DuPage County", "Naperville"]
        if area and "US" in area:
            # If it's a US job, ensure "United States" is in the location string
            if "United States" not in display_name and "USA" not in display_name:
                display_name = f"{display_name}, United States"
                
        return {
            "job_id": f"adzuna_{job_data.get('id', '')}",
            "source": "adzuna",
            "title": job_data.get("title", ""),
            "company": job_data.get("company", {}).get("display_name", ""),
            "location": display_name,
            "description": job_data.get("description", ""),
            "source_url": job_data.get("redirect_url", ""),
            "salary_min": int(job_data.get("salary_min")) if job_data.get("salary_min") else None,
            "salary_max": int(job_data.get("salary_max")) if job_data.get("salary_max") else None,
            "posted_at": job_data.get("created"),
            "contract_type": job_data.get("contract_type"),
            "created_at": datetime.utcnow().isoformat()
        }
    
    def _normalize_jsearch_job(self, job_data: Dict) -> Dict:
        """Normalize JSearch job data to common format"""
        return {
            "job_id": f"jsearch_{job_data.get('job_id', '')}",
            "source": "jsearch",
            "title": job_data.get("job_title", ""),
            "company": job_data.get("employer_name", ""),
            "location": f"{job_data.get('job_city', '')}, {job_data.get('job_state', '')}",
            "description": job_data.get("job_description", ""),
            "source_url": job_data.get("job_apply_link", ""),
            "salary_min": int(job_data.get("job_min_salary")) if job_data.get("job_min_salary") else None,
            "salary_max": int(job_data.get("job_max_salary")) if job_data.get("job_max_salary") else None,
            "posted_at": job_data.get("job_posted_at_datetime_utc"),
            "contract_type": job_data.get("job_employment_type"),
            "created_at": datetime.utcnow().isoformat()
        }
    
    async def _is_usa_job(self, job: Dict) -> bool:
        """Strict USA-only filtering"""
        location = job.get("location", "").lower()
        
        # Explicit rejection of non-USA countries
        non_usa_indicators = [
            "uk", "gb", "united kingdom", "england", "scotland", "wales",
            "canada", "toronto", "vancouver", "montreal",
            "india", "bangalore", "mumbai", "delhi", "hyderabad",
            "australia", "sydney", "melbourne",
            "germany", "berlin", "munich",
            "france", "paris",
            "china", "cn", "beijing", "shanghai",
            "japan", "jp", "tokyo",
            "singapore", "sg",
            "ireland", "ie", "dublin",
            "netherlands", "nl", "amsterdam",
            "remote - worldwide", "remote worldwide", "anywhere"
        ]
        
        # REJECT if contains any non-USA indicator
        for indicator in non_usa_indicators:
            if indicator in location:
                return False
        
        # Positive USA indicators
        usa_keywords = ["united states", "usa", "u.s.", "us,", ", us"]
        if any(keyword in location for keyword in usa_keywords):
            return True
        
        # USA state names and abbreviations (comprehensive list)
        usa_states = {
            # Full names
            "alabama", "alaska", "arizona", "arkansas", "california", "colorado",
            "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho",
            "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana",
            "maine", "maryland", "massachusetts", "michigan", "minnesota",
            "mississippi", "missouri", "montana", "nebraska", "nevada",
            "new hampshire", "new jersey", "new mexico", "new york",
            "north carolina", "north dakota", "ohio", "oklahoma", "oregon",
            "pennsylvania", "rhode island", "south carolina", "south dakota",
            "tennessee", "texas", "utah", "vermont", "virginia", "washington",
            "west virginia", "wisconsin", "wyoming",
            # Abbreviations
            "al", "ak", "az", "ar", "ca", "co", "ct", "de", "fl", "ga",
            "hi", "id", "il", "in", "ia", "ks", "ky", "la", "me", "md",
            "ma", "mi", "mn", "ms", "mo", "mt", "ne", "nv", "nh", "nj",
            "nm", "ny", "nc", "nd", "oh", "ok", "or", "pa", "ri", "sc",
            "sd", "tn", "tx", "ut", "vt", "va", "wa", "wv", "wi", "wy"
        }
        
        # Check for state names/abbreviations in location
        location_parts = [part.strip().lower() for part in location.split(",")]
        for part in location_parts:
            if part in usa_states:
                return True
            # Check if part contains a state name
            for state in usa_states:
                if state in part:
                    return True
        
        # Default to REJECT if we can't confirm it's USA
        return False
    
    async def _categorize_job(self, job: Dict) -> Dict:
        """Categorize job for specialized tags"""
        description = job.get("description", "").lower()
        salary_max = job.get("salary_max", 0) or 0
        
        categories = []
        
        # High-paying (>$150k)
        if salary_max > 150000:
            categories.append("high_paying")
        
        # Sponsorship
        sponsorship_keywords = ["visa", "sponsorship", "h1b", "green card", "work authorization"]
        if any(keyword in description for keyword in sponsorship_keywords):
            categories.append("sponsoring")
        
        # Startups
        startup_keywords = ["startup", "early stage", "seed", "series a", "series b"]
        if any(keyword in description for keyword in startup_keywords):
            categories.append("startup")
        
        job["categories"] = categories
        
        return job
    
    async def _save_job(self, job: Dict) -> bool:
        """Save job to Supabase with deduplication via upsert"""
        try:
            res = SupabaseService.upsert_job(job)
            return True if res else False
        except Exception as e:
            logger.error(f"Error saving job: {str(e)}")
            return False
    
    
    async def get_sync_status(self) -> Dict:
        """Get status of last sync operations from Supabase"""
        statuses = SupabaseService.get_job_sync_status()
        status_dict = {s["source"]: s for s in statuses}
        
        # Get counts via Admin Stats helper
        stats = SupabaseService.get_admin_stats()
        
        return {
            "adzuna": status_dict.get("adzuna", {"status": "never_run"}),
            "jsearch": status_dict.get("jsearch", {"status": "never_run"}),
            "total_jobs": stats.get("total_jobs", 0),
            "jobs_last_hour": 0 # Not easily available without separate count
        }
    
    async def cleanup_old_jobs(self) -> int:
        """Remove jobs older than 72 hours from Supabase"""
        try:
            client = SupabaseService.get_client()
            if not client: return 0
            
            cutoff_date = (datetime.utcnow() - timedelta(hours=72)).isoformat()
            res = client.table("jobs").delete().lt("created_at", cutoff_date).execute()
            
            deleted_count = len(res.data) if res.data else 0
            
            logger.info(f"Cleanup completed: {deleted_count} old jobs removed (older than 72 hours)")
            
            SupabaseService.update_job_sync_status("cleanup", {
                "last_sync": datetime.utcnow().isoformat(),
                "jobs_deleted": deleted_count,
                "status": "success"
            })
            
            return deleted_count
            
        except Exception as e:
            logger.error(f"Cleanup failed: {str(e)}")
            SupabaseService.update_job_sync_status("cleanup", {
                "last_sync": datetime.utcnow().isoformat(),
                "status": "failed",
                "error": str(e)
            })
            return 0
    
    async def cleanup_non_usa_jobs(self) -> int:
        """Remove jobs with non-USA indicators via Supabase ILIKE"""
        # This is harder to do in a single call in Supabase than MongoDB regex
        # but we can filter by common non-USA indicators
        return 0 # Placeholder for now as _is_usa_job handles it during sync
