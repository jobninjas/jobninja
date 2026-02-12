
import requests
import time

URL_SYNC = "https://nova-ninjas-production.up.railway.app/api/debug/force-sync"
URL_DEBUG = "https://nova-ninjas-production.up.railway.app/api/debug/jobs"

def trigger_sync():
    print(f"Triggering sync at {URL_SYNC}...")
    try:
        resp = requests.post(URL_SYNC)
        print(f"Response: {resp.status_code} - {resp.text}")
        
        if resp.status_code == 200:
            print("Sync started. Waiting 60 seconds for jobs to populate...")
            time.sleep(60)
            
            print("Checking debug stats...")
            stats = requests.get(URL_DEBUG).json()
            print("Debug Stats:", stats)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    trigger_sync()
