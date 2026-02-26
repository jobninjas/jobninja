import os
from supabase import create_client
from dotenv import load_dotenv

dotenv_path = os.path.join('backend', '.env')
load_dotenv(dotenv_path)

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

try:
    # Get total count
    res = supabase.table("profiles").select("*", count="exact").execute()
    print(f"Total Users: {res.count}")
    
    # List top 10
    print("\n--- Top 10 Profiles ---")
    for r in res.data[:10]:
        print(f"Email: {r.get('email')}, Plan: {r.get('plan')}, Created: {r.get('created_at')}")

except Exception as e:
    print(f"Error: {e}")
