import requests
import json

BASE_URL = "https://nova-ninjas-production.up.railway.app"
EXPORT_URL = f"{BASE_URL}/api/admin/all-users-export?admin_key=jobninjas2025admin"
UPDATE_URL = f"{BASE_URL}/api/admin/update-user-plan"

def test_admin_actions():
    print("--- 1. Checking Export Endpoint ---")
    try:
        response = requests.get(EXPORT_URL)
        if response.status_code != 200:
            print(f"❌ Export Failed: {response.status_code}")
            return
        
        data = response.json()
        users = data.get('users', [])
        print(f"Total Users: {len(users)}")
        
        if not users:
            print("No users.")
            return

        # Check for 'plan' field
        sample_user = users[0]
        if 'plan' in sample_user:
            print(f"✅ 'plan' field found. Value: {sample_user['plan']}")
        else:
            print("❌ 'plan' field MISSING. Backend NOT updated.")
            return
            
        # Find a test user to update
        test_user = next((u for u in users if "test" in u.get("email", "").lower()), None)
        
        if not test_user:
            print("No test user found for safe testing.")
            test_user = users[0] # Fallback, but be careful
            print(f"Using first user: {test_user['email']}")
        else:
            print(f"Using test user: {test_user['email']} (ID: {test_user.get('id')})")

        print("\n--- 2. Testing Update Plan ---")
        user_id = test_user.get('id') # Should be string ID
        if not user_id:
            print("❌ User has no ID!")
            return

        payload = {
            "admin_key": "jobninjas2025admin",
            "user_id": user_id,
            "plan": "free_byok"
        }
        
        print(f"Sending PATCH to {UPDATE_URL}")
        print(f"Payload: {json.dumps(payload)}")
        
        response = requests.patch(UPDATE_URL, json=payload)
        
        print(f"Status Code: {response.status_code}")
        try:
            print(f"Response: {response.json()}")
        except:
            print(f"Response Text: {response.text}")
            
        if response.status_code == 200:
            print("✅ Update Successful!")
        elif response.status_code == 405:
             print("❌ 405 Method Not Allowed. (Maybe PATCH not supported/redeployed?)")
        elif response.status_code == 404:
             print("❌ 404 Not Found. (Endpoint not redeployed?)")
        else:
             print("❌ Update Failed.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_admin_actions()
