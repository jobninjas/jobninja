
import requests
import sys

session_id = "c4f25fe-1c8c-4540-808c-f12a6b341d51"
api_url = "https://jobninjas.ai/api"

print(f"Checking session {session_id} on production API...")

# Check session details
url = f"{api_url}/interview/session/{session_id}"
print(f"GET {url}")
try:
    resp = requests.get(url, timeout=10)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text}")
except Exception as e:
    print(f"Error: {e}")

# Try to check health again too
print(f"\nChecking health...")
try:
    resp = requests.get(f"{api_url}/health-check", timeout=10)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text}")
except Exception as e:
    print(f"Error: {e}")
