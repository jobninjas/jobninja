
import requests
import time
import sys

URL = "https://jobninjas.ai/api/debug/sync-jobs"
# URL = "https://jobninjas.ai/api/debug/config-check"
# Also try the railway URL directly in case of DNS lag
URL_RAILWAY = "https://nova-ninjas-production.up.railway.app/api/debug/sync-jobs"

print(f"Polling {URL}...")

for i in range(24): # 2 minutes (24 * 5s)
    try:
        # Try main domain
        print(f"Attempt {i+1}...", end=" ")
        resp = requests.get(URL, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if "config" in data:
                print(f"\n✅ Success! New code is live.")
                print(f"Config: {data.get('config')}")
                print(f"Sync Details: {data.get('sync_details')}")
                sys.exit(0)
            else:
                print(f"Status 200, but unexpected response: {data}")
        elif resp.status_code == 500:
             print(f"Status 500! Error content: {resp.text}")
             # We want to see this error
        else:
            print(f"Status: {resp.status_code}")
            
            # Try railway domain if main fails
            try:
                resp2 = requests.get(URL_RAILWAY, timeout=10)
                if resp2.status_code == 200:
                    print(f"\n✅ Success on Railway domain! Status 200.")
                    print(resp2.json())
                    sys.exit(0)
            except:
                pass

    except Exception as e:
        print(f"Error: {e}")
    
    time.sleep(5)

print("\n❌ Timeout: Deployment took too long or endpoint not found.")
sys.exit(1)
