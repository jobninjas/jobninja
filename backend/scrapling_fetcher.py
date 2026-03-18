import asyncio
import aiohttp
import logging
import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Any
from scrapling.spiders import Spider, Response
from job_fetcher import sanitize_description, detect_visa_sponsorship, detect_startup, HIGH_PAY_THRESHOLD, format_salary_range

logger = logging.getLogger("scrapling_fetcher")

def generate_job_id(source: str, title: str, company: str) -> str:
    unique_string = f"{source}-{title}-{company}".lower()
    return hashlib.md5(unique_string.encode()).hexdigest()[:16]

class MultiSourceSpider(Spider):
    name = "multi_source_spider"
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.scraped_jobs = []

    async def parse(self, response: Response):
        # This will be overridden or called by specific site logic
        pass

class TheMuseSpider(MultiSourceSpider):
    """Spider for The Muse (uses their public API-like endpoints)"""
    name = "the_muse"
    start_urls = ["https://www.themuse.com/api/public/jobs?page=0&desc=true"]

    async def parse(self, response: Response):
        try:
            data = response.json()
            jobs = data.get("results", [])
            for job in jobs:
                title = job.get("name", "")
                company = job.get("company", {}).get("name", "Unknown")
                location = ", ".join([loc.get("name") for loc in job.get("locations", [])])
                content = job.get("contents", "")
                
                desc_clean = sanitize_description(content)
                visa_friendly = detect_visa_sponsorship(desc_clean)
                is_startup = detect_startup(desc_clean, company)
                
                job_data = {
                    "externalId": f"muse-{job.get('id')}",
                    "title": title,
                    "company": company,
                    "location": location,
                    "description": desc_clean,
                    "sourceUrl": job.get("refs", {}).get("landing_page", ""),
                    "source": "the_muse",
                    "type": "remote" if "remote" in location.lower() else "onsite",
                    "visaTags": ["visa-sponsoring"] if visa_friendly else [],
                    "categoryTags": ["startup"] if is_startup else [],
                    "createdAt": datetime.now(timezone.utc),
                    "isActive": True,
                    "country": "us"
                }
                self.scraped_jobs.append(job_data)
        except Exception as e:
            logger.error(f"Error parsing The Muse: {e}")

class FindWorkSpider(MultiSourceSpider):
    """Spider for FindWork"""
    name = "findwork"
    start_urls = ["https://findwork.dev/api/jobs/"]

    async def parse(self, response: Response):
        try:
            data = response.json()
            jobs = data.get("results", [])
            for job in jobs:
                title = job.get("role", "")
                company = job.get("company_name", "Unknown")
                location = job.get("location", "Remote")
                desc = job.get("description", "")
                desc_clean = sanitize_description(desc)
                
                job_data = {
                    "externalId": f"findwork-{job.get('id')}",
                    "title": title,
                    "company": company,
                    "location": location,
                    "description": desc_clean,
                    "sourceUrl": job.get("url", ""),
                    "source": "findwork",
                    "type": "remote" if job.get("remote") else "onsite",
                    "createdAt": datetime.now(timezone.utc),
                    "isActive": True,
                    "country": "us"
                }
                self.scraped_jobs.append(job_data)
        except Exception as e:
            logger.error(f"Error parsing FindWork: {e}")

class IndeedSpider(MultiSourceSpider):
    """Spider for Indeed (Direct scraping)"""
    name = "indeed"
    start_urls = ["https://www.indeed.com/jobs?q=software+engineer&l=Remote"]

    async def parse(self, response: Response):
        try:
            # Indeed job cards usually have a specific data-attribute or class
            cards = response.css('div.job_seen_beacon')
            for card in cards:
                title = card.css('h2.jobTitle span::text').get()
                company = card.css('span.companyName::text').get() or card.css('span[data-testid="company-name"]::text').get()
                location = card.css('div.companyLocation::text').get() or card.css('div[data-testid="text-location"]::text').get()
                link = card.css('a.jcs-JobTitle::attr(href)').get()
                
                if title and company:
                    job_data = {
                        "externalId": f"indeed-{generate_job_id('indeed', title, company)}",
                        "title": title.strip(),
                        "company": company.strip(),
                        "location": location.strip() if location else "Remote",
                        "description": "Click link for details",
                        "sourceUrl": f"https://www.indeed.com{link}" if link and not link.startswith('http') else link,
                        "source": "indeed",
                        "type": "remote",
                        "createdAt": datetime.now(timezone.utc),
                        "isActive": True,
                        "country": "us"
                    }
                    self.scraped_jobs.append(job_data)
        except Exception as e:
            logger.error(f"Error parsing Indeed: {e}")

class DiceSpider(MultiSourceSpider):
    """Spider for Dice"""
    name = "dice"
    start_urls = ["https://www.dice.com/jobs?q=software+engineer"]

    async def parse(self, response: Response):
        try:
            # Dice uses search-card or d-card
            cards = response.css('d-card')
            for card in cards:
                title = card.css('a.card-title-link::text').get()
                company = card.css('a.card-company-link::text').get()
                location = card.css('span.card-location::text').get()
                link = card.css('a.card-title-link::attr(href)').get()
                
                if title and company:
                    job_data = {
                        "externalId": f"dice-{generate_job_id('dice', title, company)}",
                        "title": title.strip(),
                        "company": company.strip(),
                        "location": location.strip() if location else "USA",
                        "description": "Click link for details",
                        "sourceUrl": link,
                        "source": "dice",
                        "type": "onsite",
                        "createdAt": datetime.now(timezone.utc),
                        "isActive": True,
                        "country": "us"
                    }
                    self.scraped_jobs.append(job_data)
        except Exception as e:
            logger.error(f"Error parsing Dice: {e}")

class ZipRecruiterSpider(MultiSourceSpider):
    """Spider for ZipRecruiter"""
    name = "ziprecruiter"
    start_urls = ["https://www.ziprecruiter.com/jobs-search?search=software+engineer"]

    async def parse(self, response: Response):
        try:
            # Try different selectors
            cards = response.css('div.job_result') or response.css('div.job_content') or response.css('article.job_result')
            for card in cards:
                title = card.css('h2.title::text').get() or card.css('span.job_title::text').get() or card.css('.job_title::text').get()
                company = card.css('a.company_name::text').get() or card.css('span.company_name::text').get() or card.css('.company::text').get()
                location = card.css('span.location::text').get() or card.css('.location::text').get()
                link = card.css('a.job_link::attr(href)').get() or card.css('a::attr(href)').get()
                
                if title and company:
                    job_data = {
                        "externalId": f"zip-{generate_job_id('zip', title, company)}",
                        "title": title.strip(),
                        "company": company.strip(),
                        "location": location.strip() if location else "Remote",
                        "description": "Click link for details",
                        "sourceUrl": link,
                        "source": "ziprecruiter",
                        "type": "remote" if "remote" in (location or "").lower() else "onsite",
                        "createdAt": datetime.now(timezone.utc),
                        "isActive": True,
                        "country": "us"
                    }
                    self.scraped_jobs.append(job_data)
                    yield job_data
        except Exception as e:
            logger.error(f"Error parsing ZipRecruiter: {e}")

async def fetch_jobicy_jobs():
    """Fetch jobs from Jobicy (Remote jobs API)"""
    url = "https://jobicy.com/api/v2/remote-jobs"
    jobs = []
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=20) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    # Jobicy returns a list of jobs in 'jobs' field or directly
                    job_list = data.get("jobs", []) if isinstance(data, dict) else data
                    for job in job_list:
                        title = job.get("jobTitle", "")
                        company = job.get("companyName", "Unknown")
                        location = job.get("jobLocation", "Remote")
                        desc_clean = sanitize_description(job.get("jobDescription", ""))
                        
                        jobs.append({
                            "externalId": f"jobicy-{job.get('id')}",
                            "title": title,
                            "company": company,
                            "location": location,
                            "description": desc_clean,
                            "sourceUrl": job.get("url", ""),
                            "source": "jobicy",
                            "type": "remote",
                            "createdAt": datetime.now(timezone.utc),
                            "isActive": True,
                            "country": "us"
                        })
                    logger.info(f"✅ Jobicy: Fetched {len(jobs)} jobs")
                else:
                    logger.error(f"Jobicy API error: {resp.status}")
    except Exception as e:
        logger.error(f"Error fetching Jobicy: {e}")
    return jobs

async def run_spiders():
    """Run all spiders and return consolidated results"""
    all_all_jobs = []
    
    # 1. Fetch via direct APIs (Reliable)
    all_all_jobs.extend(await fetch_themuse_jobs())
    all_all_jobs.extend(await fetch_findwork_jobs())
    all_all_jobs.extend(await fetch_jobicy_jobs())
    
    # 2. Fetch via Scrapling for traditional sites
    spiders = [
        IndeedSpider(),
        DiceSpider(),
        ZipRecruiterSpider()
    ]
    
    def run_spider_sync(s):
        try:
            logger.info(f"Starting spider sync: {s.name}")
            s.start()
            return s.scraped_jobs
        except Exception as e:
            logger.error(f"Spider {s.name} failed in sync: {e}")
            return []

    for s in spiders:
        try:
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(run_spider_sync, s, timeout=30)
                jobs = future.result()
                all_all_jobs.extend(jobs)
        except Exception as e:
            logger.error(f"Execution error for {s.name}: {e}")
            
    return all_all_jobs

if __name__ == "__main__":
    asyncio.run(run_spiders())
