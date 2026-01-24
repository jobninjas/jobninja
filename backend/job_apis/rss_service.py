"""
RSS Job Service - Free & Unlimited
Fetches jobs from RSS feeds (RemoteOK, Remotive, We Work Remotely, etc.)
"""
import aiohttp
import logging
import feedparser
from typing import List, Dict, Any, Optional
from datetime import datetime
import re

logger = logging.getLogger(__name__)

class RSSJobService:
    def __init__(self):
        # Reliable Remote Job RSS Feeds - Comprehensive List
        self.feeds = {
            "RemoteOK": "https://remoteok.com/remote-jobs.rss",
            "Remotive": "https://remotive.com/remote-jobs/feed",
            "WWR_All": "https://weworkremotely.com/remote-jobs.rss",
            "WWR_Programming": "https://weworkremotely.com/categories/remote-programming-jobs.rss",
            "WWR_Design": "https://weworkremotely.com/categories/remote-design-jobs.rss",
            "WWR_Marketing": "https://weworkremotely.com/categories/remote-sales-and-marketing-jobs.rss",
            "WWR_Product": "https://weworkremotely.com/categories/remote-product-jobs.rss",
            "WWR_Support": "https://weworkremotely.com/categories/remote-customer-support-jobs.rss",
            "WWR_Management": "https://weworkremotely.com/categories/remote-management-and-finance-jobs.rss",
            "WWR_DevOps": "https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss",
            "WWR_Other": "https://weworkremotely.com/categories/all-other-remote-jobs.rss"
        }

    async def fetch_jobs_from_feed(self, url: str, source_name: str) -> List[Dict[str, Any]]:
        """
        Fetch and parse jobs from a specific RSS feed URL
        """
        try:
            logger.info(f"Fetching RSS feed: {url}")
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Referer": "https://www.google.com/",
            }
            async with aiohttp.ClientSession(headers=headers) as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=20)) as response:
                    if response.status != 200:
                        logger.error(f"RSS feed error {response.status} for {url}")
                        return []
                    
                    content = await response.read()
                    feed = feedparser.parse(content)
                    
                    normalized_jobs = []
                    for entry in feed.entries:
                        # Normalize entry to job schema
                        title_full = entry.get('title', 'Unknown Title')
                        
                        # Source-specific company/title extraction
                        company, title = self._parse_title(title_full, source_name, entry)
                        
                        job = {
                            "title": title,
                            "company": company,
                            "location": "Remote",
                            "description": entry.get('summary', '') or entry.get('description', ''),
                            "url": entry.get('link', ''),
                            "salary": "", # RSS feeds rarely have salary
                            "datePosted": entry.get('published', datetime.now().isoformat()),
                            "source": f"RSS-{source_name}",
                            "workType": "Remote",
                            "sponsorship": "Unknown"
                        }
                        normalized_jobs.append(job)
                        
                    logger.info(f"Fetched {len(normalized_jobs)} jobs from {source_name} RSS")
                    return normalized_jobs
                    
        except Exception as e:
            logger.error(f"Error fetching RSS feed {url}: {e}")
            return []

    def _parse_title(self, title_full: str, source: str, entry: Any) -> tuple:
        """Parse company and job title from feed entry"""
        
        # Default fallback
        company = "Unknown Company"
        title = title_full

        if source == "Remotive":
            # Remotive often puts the company in the author field or uses "Title - Company"
            company = entry.get('author', 'Unknown Company')
            if " - " in title_full:
                parts = title_full.split(" - ")
                title = parts[0].strip()
                company = parts[1].strip()
        
        elif source == "RemoteOK":
            # RemoteOK often uses "Title at Company"
            if " at " in title_full:
                parts = title_full.split(" at ")
                title = parts[0].strip()
                company = parts[1].strip()
        
        elif source.startswith("WWR"):
            # WWR often uses "Company: Title" or "Company is hiring a Title"
            if ": " in title_full:
                parts = title_full.split(": ")
                company = parts[0].strip()
                title = parts[1].strip()
            elif " is hiring a " in title_full:
                parts = title_full.split(" is hiring a ")
                company = parts[0].strip()
                title = parts[1].strip()
            elif " is hiring an " in title_full:
                parts = title_full.split(" is hiring an ")
                company = parts[0].strip()
                title = parts[1].strip()
                
        # Clean tags from Remotive title if they exist (e.g. "Title [Marketing]")
        title = re.sub(r'\[.*?\]', '', title).strip()
        
        return company, title

    async def fetch_popular_usa_jobs(self) -> List[Dict[str, Any]]:
        """
        Fetch jobs from all configured RSS feeds
        """
        all_jobs = []
        for name, url in self.feeds.items():
            jobs = await self.fetch_jobs_from_feed(url, name)
            all_jobs.extend(jobs)
        return all_jobs
