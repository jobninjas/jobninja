import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

def check_all_tables():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("Missing env vars")
        return

    client = create_client(url, key)
    tables = ["profiles", "applications", "interview_sessions", "daily_usage", "saved_resumes"]
    
    for table in tables:
        try:
            res = client.table(table).select("*", count="exact").limit(1).execute()
            print(f"✅ Table '{table}': {res.count} rows")
        except Exception as e:
            print(f"❌ Table '{table}': FAILED - {e}")

if __name__ == "__main__":
    check_all_tables()
