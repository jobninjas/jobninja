
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

try:
    # Fetch 1 row to see keys
    res = supabase.table("interview_turns").select("*").limit(1).execute()
    if res.data:
        print("Columns in 'interview_turns':", list(res.data[0].keys()))
    else:
        print("No rows in 'interview_turns', checking sessions for data...")
except Exception as e:
    print(f"Error checking 'interview_turns': {e}")

try:
    res = supabase.table("interview_sessions").select("*").limit(1).execute()
    if res.data:
        print("Columns in 'interview_sessions':", list(res.data[0].keys()))
    else:
        print("No rows in 'interview_sessions'")
except Exception as e:
    print(f"Error checking 'interview_sessions': {e}")
