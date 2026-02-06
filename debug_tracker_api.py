import requests
import json
import time

URL = "https://nova-ninjas-production.up.railway.app/api/admin/all-users-export?admin_key=jobninjas2025admin"

def check_api():
    print(f"Fetching data from: {URL}")
    try:
        response = requests.get(URL)
        if response.status_code == 200:
            data = response.json()
            users = data.get('users', [])
            print(f"Total Users: {len(users)}")
            
            if not users:
                print("No users found.")
                return

            # Check the first user with a resume or job application
            sample_user = None
            for user in users:
                if user.get('has_resume') == 'Yes' or user.get('jobs_applied', 0) > 0:
                    sample_user = user
                    break
            
            if not sample_user:
                print("No active users found to check structure. Showing first user:")
                sample_user = users[0]

            print("\n--- Sample User Data Structure ---")
            print(json.dumps(sample_user, indent=2))
            
            # Validation
            has_jobs = 'jobs_applied' in sample_user
            has_resume_url = 'resume_url' in sample_user
            
            print("\n--- Verification ---")
            print(f"Field 'jobs_applied' present: {has_jobs}")
            print(f"Field 'resume_url' present: {has_resume_url}")
            
            if has_jobs and has_resume_url:
                print("\n✅ API is UPDATED and serving new fields!")
            else:
                print("\n❌ API is NOT updated yet (old version).")

        else:
            print(f"Error: Status Code {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    check_api()
