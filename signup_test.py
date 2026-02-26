import requests
import uuid
import json

def test_signup():
    url = "https://jobninjas.ai/api/auth/signup"
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "email": email,
        "password": "Password123!",
        "name": "Test User",
        "turnstile_token": "XXXX", # This will likely fail Turnstile
        "referral_code": ""
    }
    
    print(f"Testing signup for: {email}")
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_signup()
