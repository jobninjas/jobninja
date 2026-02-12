
import requests

# Local backend URL
URL = "http://localhost:8000/api/jobs"

def test_jobs():
    params = {
        "page": 1,
        "limit": 20,
        "country": "us"
    }
    # Simulate headers sent by frontend
    headers = {
        # Frontend sends token if available, or null/empty if not?
        # Let's try without token first
    }
    
    try:
        print(f"GET {URL} with params {params}")
        resp = requests.get(URL, params=params, headers=headers)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 422:
            print("422 Details:", resp.json())
        else:
            print("Success/Other:", resp.text[:200])
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_jobs()
