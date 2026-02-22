import requests
import json

# Test the /api/jobs endpoint
url = "http://127.0.0.1:8001/api/jobs?limit=5"

try:
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    data = response.json()
    if "jobs" in data and len(data["jobs"]) > 0:
        first_job = data["jobs"][0]
        print(f"First Job MatchScore: {first_job.get('matchScore')}")
        print(f"Recommended Filters: {data.get('recommendedFilters')}")
    else:
        print("No jobs returned in the response.")
except Exception as e:
    print(f"Error: {e}")
