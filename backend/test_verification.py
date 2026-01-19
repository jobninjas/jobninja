import requests
import json
import uuid

API_URL = "http://localhost:8000"

def test_verification_enforcement():
    print("Testing verification enforcement...")
    
    # 1. Sign up a new user (default is_verified=False)
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    signup_payload = {
        "email": email,
        "password": "Password123!",
        "name": "Test User"
    }
    
    print(f"Signing up new user: {email}")
    response = requests.post(f"{API_URL}/api/auth/signup", json=signup_payload)
    if response.status_code != 200:
        print(f"Signup failed: {response.text}")
        return
    
    auth_data = response.json()
    token = auth_data['token']
    user_id = auth_data['user']['id']
    
    print(f"User ID: {user_id}")
    print(f"Initial verification status: {auth_data['user'].get('is_verified', False)}")
    
    # 2. Try to use a protected endpoint (e.g., generate resume)
    print("\nTesting protected endpoint /api/generate/resume (should fail)...")
    generate_payload = {
        "userId": user_id,
        "resume_text": "Sample Resume",
        "job_description": "Sample Job",
        "job_title": "Engineer",
        "company": "Test Co",
        "analysis": {}
    }
    
    response = requests.post(f"{API_URL}/api/generate/resume", json=generate_payload, headers={"token": token})
    print(f"Status Code: {response.status_code}")
    if response.status_code == 403:
        print("SUCCESS: Endpoint correctly returned 403 Forbidden for unverified user.")
        print(f"Message: {response.json().get('detail')}")
    else:
        print(f"FAILURE: Expected 403, got {response.status_code}")
        
    # 3. Test resend-verification
    print("\nTesting /api/auth/resend-verification...")
    response = requests.post(f"{API_URL}/api/auth/resend-verification", headers={"token": token})
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("SUCCESS: Resend verification endpoint works.")
    else:
        print(f"FAILURE: Resend verification failed: {response.text}")

if __name__ == "__main__":
    test_verification_enforcement()
