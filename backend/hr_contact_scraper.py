import asyncio
import aiohttp
import re
from bs4 import BeautifulSoup
import logging
import json
import os
from typing import Optional
from dotenv import load_dotenv

# Import unified_api_call and clean_json_response
from resume_analyzer import unified_api_call, clean_json_response

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local')
load_dotenv(env_path)
logger = logging.getLogger(__name__)

async def search_duckduckgo_for_recruiters(company_name: str, max_results: int = 3):
    """
    Search DuckDuckGo HTML version for recruiters at the given company.
    Query: site:linkedin.com/in "Company Name" (Recruiter OR "Talent Acquisition" OR HR)
    """
    query = f'site:linkedin.com/in "{company_name}" (Recruiter OR "Talent Acquisition" OR HR)'
    url = f"https://html.duckduckgo.com/html/?q={query.replace(' ', '+')}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://duckduckgo.com/"
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status != 200:
                    logger.error(f"DuckDuckGo search failed with status {resp.status}")
                    return []
                html = await resp.text()

        soup = BeautifulSoup(html, "html.parser")
        results = soup.find_all("a", class_="result__url", limit=10)
        snippets = soup.find_all("a", class_="result__snippet", limit=10)
        
        contacts = []
        for i in range(min(len(results), len(snippets), max_results + 3)):
            link_text = results[i].text.strip() # Usually contains "Name - Title - Company | LinkedIn"
            snippet = snippets[i].text.strip()
            
            # Clean up the name from typical LinkedIn title formats
            clean_name = link_text.split("-")[0].split("|")[0].strip()
            
            # Ignore cases where the search didn't return a person
            if "linkedin.com" in clean_name.lower() or "jobs" in clean_name.lower():
                continue
                
            contacts.append({
                "raw_name_title": clean_name,
                "snippet": snippet
            })
            
            if len(contacts) >= max_results:
                break
                
        return contacts
    except Exception as e:
        logger.error(f"Error scraping DuckDuckGo: {str(e)}")
        return []

def _get_fallback_contacts(company_name: str, domain: Optional[str] = None):
    clean_company = re.sub(r'[^a-zA-Z0-9]', '', company_name).lower()
    domain = domain or f"{clean_company}.com"
    return [
        {
            "name": "Talent Acquisition Team",
            "role": "Recruiting Department",
            "email": f"careers@{domain}"
        },
        {
            "name": "HR Department",
            "role": "Human Resources",
            "email": f"hr@{domain}"
        }
    ]

async def enrich_hr_contacts_with_llm(company_name: str, domain: Optional[str], raw_contacts: list):
    """
    Pass the raw search results to the LLM to format them into clean Name, Role, Email JSON objects.
    """
    if not raw_contacts:
        return _get_fallback_contacts(company_name, domain)
        
    try:
        domain_to_use = domain or f"{re.sub(r'[^a-zA-Z0-9]', '', company_name).lower()}.com"
        
        system_prompt = (
            "You are an expert lead enrichment JSON API.\n"
            "Given a list of raw search snippets indicating recruiters at a company, "
            f"your job is to extract their clean Full Name, their exact Role (e.g., 'Technical Recruiter'), and intelligently GUESS their corporate email address based on the domain '{domain_to_use}'.\n"
            "Typical formats are first.last@domain.com, first@domain.com, or flast@domain.com.\n"
            "Output MUST be valid JSON ONLY.\n"
            "The JSON MUST represent an object with a single key 'contacts' whose value is an array of objects. Each object must have keys: 'name', 'role', 'email'."
        )
        
        user_prompt = f"Company: {company_name}\nRaw Snippets:\n"
        for idx, contact in enumerate(raw_contacts):
            user_prompt += f"{idx+1}. Title text: {contact['raw_name_title']} | Snippet: {contact['snippet']}\n"
            
        response_text = await unified_api_call(
            prompt=user_prompt,
            system_prompt=system_prompt,
            model="llama-3.3-70b-versatile",
            json_mode=True,
            temperature=0.3,
            max_tokens=600
        )
        
        if not response_text:
            return _get_fallback_contacts(company_name, domain)
            
        json_text = clean_json_response(response_text)
        data = json.loads(json_text)
        
        if "contacts" in data:
            return data["contacts"]
        elif isinstance(data, list):
            return data
            
        for key in data.values():
            if isinstance(key, list):
                return key
                
        return _get_fallback_contacts(company_name, domain)
        
    except Exception as e:
        logger.error(f"Error enriching contacts with LLM for {company_name}: {str(e)}")
        return _get_fallback_contacts(company_name, domain)

async def get_hr_contacts(company_name: str, domain: Optional[str] = None):
    """
    Main entry point to fetch and enrich HR contacts.
    """
    raw_contacts = await search_duckduckgo_for_recruiters(company_name)
    enriched_contacts = await enrich_hr_contacts_with_llm(company_name, domain, raw_contacts)
    
    if not enriched_contacts:
        return _get_fallback_contacts(company_name, domain)
        
    return enriched_contacts

if __name__ == "__main__":
    import sys
    company = sys.argv[1] if len(sys.argv) > 1 else "Cloudflare"
    print(f"Fetching HR contacts for {company}...")
    loop = asyncio.get_event_loop()
    result = loop.run_until_complete(get_hr_contacts(company))
    print(json.dumps(result, indent=2))
