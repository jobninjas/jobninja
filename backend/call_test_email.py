import httpx
import asyncio

async def test_diagnostic_email():
    url = "http://localhost:8000/api/debug/test-email"
    email = "filas99010@medevsa.com" # User's email from screenshot
    
    print(f"Calling diagnostic endpoint: {url} for {email}")
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, params={"email": email})
            print(f"Status Code: {response.status_code}")
            print(f"Response Body: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_diagnostic_email())
