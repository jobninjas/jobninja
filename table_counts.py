import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

tables = ["profiles", "jobs", "applications", "saved_resumes", "daily_usage"]

for table in tables:
    try:
        res = supabase.table(table).select("*", count="exact").limit(0).execute()
        print(f"Table '{table}': {res.count} rows")
    except Exception as e:
        print(f"Table '{table}': Error - {e}")
