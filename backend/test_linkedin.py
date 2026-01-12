import aiohttp
import asyncio

async def test():
    url = "https://www.linkedin.com/jobs-guest/jobs/api/jobListing/4337062466"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.linkedin.com/jobs/view/4337062466/"
    }
    try:
        async with aiohttp.ClientSession(headers=headers) as s:
            async with s.get(url, allow_redirects=True) as r:
                print(f"Status: {r.status}")
                if r.status == 200:
                    content = await r.text()
                    print(f"Length: {len(content)}")
                    print(f"Sample: {content[:1000]}")
                else:
                    print(f"Failed with status: {r.status}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
