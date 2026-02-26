import os
from supabase import create_client
from dotenv import load_dotenv

# Point explicitly to the backend/.env
dotenv_path = os.path.join('backend', '.env')
load_dotenv(dotenv_path)

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print(f"FAILED: URL or Key missing. URL={url}, Key={'present' if key else 'missing'}")
    exit(1)

supabase = create_client(url, key)

print(f"Connected to Supabase: {url}")

tables = ["profiles", "jobs", "applications", "saved_resumes", "daily_usage"]

for table in tables:
    try:
        res = supabase.table(table).select("*", count="exact").limit(5).execute()
        print(f"\n--- Table '{table}': {res.count} rows ---")
        if res.data:
            for i, row in enumerate(res.data):
                email = row.get('email') or row.get('user_email') or row.get('name')
                print(f"  [{i}] {email}")
        else:
            print("  (No data)")
    except Exception as e:
        print(f"Table '{table}': Error - {e}")
