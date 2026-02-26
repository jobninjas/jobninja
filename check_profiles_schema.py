import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

try:
    # Try to get one row to see columns
    res = supabase.table("profiles").select("*").limit(1).execute()
    if res.data:
        print("Columns in 'profiles':")
        print(list(res.data[0].keys()))
    else:
        print("No data in 'profiles' table to inspect columns.")
        # Fallback to a query that might fail but show info?
        # Or just describe it if possible.
except Exception as e:
    print(f"Error: {e}")
