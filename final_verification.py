
import os
import sys
from dotenv import load_dotenv
load_dotenv('backend/.env')

from supabase import create_client, Client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in backend/.env")
    sys.exit(1)

supabase: Client = create_client(url, key)

print(f"Connecting to Supabase at {url}")

def check_table(table_name):
    print(f"\n--- Checking table: {table_name} ---")
    try:
        # Fetch 1 row to see keys
        res = supabase.table(table_name).select("*").limit(1).execute()
        if res.data:
            columns = list(res.data[0].keys())
            print(f"FOUND {len(columns)} columns:")
            print(", ".join(columns))
            return columns
        else:
            # Table is empty, so we need to use a different way to check columns if possible
            # or just assume if no error, the table exists.
            # But the error 'Could not find the question_count column' implies PostgREST
            # cache is stale or column is missing.
            print("Table is empty. Checking if query for 'question_count' fails...")
            try:
                supabase.table(table_name).select("question_count").limit(0).execute()
                print("SUCCESS: 'question_count' column exists!")
                return ["question_count"]
            except Exception as e2:
                print(f"ERROR: 'question_count' column check failed: {e2}")
                return []
    except Exception as e:
        print(f"Error checking {table_name}: {e}")
        return None

session_cols = check_table("interview_sessions")
resume_cols = check_table("interview_resumes")

critical_cols = ["question_count", "resume_id", "user_id", "status"]
missing = [c for c in critical_cols if c not in (session_cols or [])]

if not missing:
    print("\nFINAL RESULT: SUCCESS - All critical columns found!")
else:
    print(f"\nFINAL RESULT: FAILURE - Missing columns: {missing}")
