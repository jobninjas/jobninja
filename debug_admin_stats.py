import os
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone

dotenv_path = os.path.join('backend', '.env')
load_dotenv(dotenv_path)

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

def get_admin_stats_debug():
    client = supabase
    try:
        thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        print(f"Thirty days ago: {thirty_days_ago}")
        
        # --- Users ---
        all_users = client.table("profiles").select("id, plan, created_at", count="exact").execute()
        total_users = all_users.count
        print(f"Total Users Count: {total_users}")
        print(f"Data length: {len(all_users.data) if all_users.data else 0}")
        
        recent_users = sum(1 for r in (all_users.data or []) if r.get("created_at") and r["created_at"] >= thirty_days_ago)
        print(f"Recent Users: {recent_users}")
        
        pro_plans = {"pro", "unlimited", "ai-yearly", "ai-monthly"}
        pro_count = sum(1 for r in (all_users.data or []) if (r.get("plan") or "").lower() in pro_plans)
        print(f"Pro Count: {pro_count}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_admin_stats_debug()
