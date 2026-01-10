import aiohttp
import logging
import re
from typing import Dict, Any, Optional
from bs4 import BeautifulSoup
from resume_analyzer import call_groq_api, clean_json_response
import json

logger = logging.getLogger(__name__)

async def fetch_url_content(url: str) -> Optional[str]:
    """Fetch raw HTML content from a URL"""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }
    try:
        async with aiohttp.ClientSession(headers=headers) as session:
            async with session.get(url, timeout=15, allow_redirects=True) as response:
                if response.status != 200:
                    logger.error(f"Failed to fetch URL {url}: Status {response.status}")
                    return None
                return await response.text()
    except Exception as e:
        logger.error(f"Error fetching URL {url}: {e}")
        return None

def extract_main_text(html: str) -> str:
    """Extract readable text from HTML, removing scripts and styles"""
    soup = BeautifulSoup(html, 'html.parser')
    
    # Remove script and style elements
    for script_or_style in soup(["script", "style", "nav", "footer", "header", "aside"]):
        script_or_style.decompose()

    # Get text
    text = soup.get_text(separator=' ')
    
    # Break into lines and remove leading/trailing whitespace
    lines = (line.strip() for line in text.splitlines())
    # Break multi-headlines into a line each
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    # Drop blank lines
    text = '\n'.join(chunk for chunk in chunks if chunk)
    
    # Limit text length to avoid overwhelmed AI context (approx 10k chars)
    return text[:12000]

async def scrape_job_description(url: str) -> Dict[str, Any]:
    """
    Scrape a job URL and use AI to extract the job description.
    """
    html = await fetch_url_content(url)
    if not html:
        return {"success": False, "error": "Could not access the URL. The site might be blocking scrapers."}

    raw_text = extract_main_text(html)
    
    prompt = f"""
Extract the job title, company name, and full job description from the following raw text scraped from a job board URL ({url}).

RAW TEXT:
{raw_text}

Return ONLY valid JSON with this structure:
{{
    "success": true,
    "jobTitle": "...",
    "company": "...",
    "description": "...",
    "location": "...",
    "salary": "..."
}}

If you cannot find clear job information, return:
{{
    "success": false,
    "error": "Could not identify job information in the page content."
}}

Important:
- The description should be the full job details, responsibilities, and requirements.
- Use newlines in the description for readability.
- Clean up any residual website navigation text.
"""

    try:
        response_text = await call_groq_api(prompt)
        if not response_text:
            return {"success": False, "error": "AI extraction failed."}
        
        json_text = clean_json_response(response_text)
        result = json.loads(json_text)
        return result
    except Exception as e:
        logger.error(f"Error extracting job data from URL: {e}")
        return {"success": False, "error": f"Failed to parse page content: {str(e)}"}
