import os
import httpx
import asyncio
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / '.env')

async def list_resend_domains():
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        print("RESEND_API_KEY not found in .env")
        return

    print(f"Using API Key: {api_key[:10]}...")
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            # Check domains
            resp = await client.get("https://api.resend.com/domains", headers=headers)
            print(f"List Domains Status: {resp.status_code}")
            data = resp.json()
            for domain in data.get("data", []):
                print(f"- Domain: {domain.get('name')}, Status: {domain.get('status')}, Capabilities: {domain.get('capabilities')}")
            
            # Check API Key details (if possible, Resend doesn't have a direct 'me' endpoint for keys usually)
            # but we can try to send to a test sink
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(list_resend_domains())
