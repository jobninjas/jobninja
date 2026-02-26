import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(os.path.join("backend", ".env"))

def check_daily_usage_cols():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    client = create_client(url, key)
    
    try:
        # Fetch one row to see columns
        res = client.table("daily_usage").select("*").limit(1).execute()
        if res.data:
            print(f"Columns in 'daily_usage': {list(res.data[0].keys())}")
        else:
            print("Table 'daily_usage' is empty, checking columns via RPC/query...")
            # Fallback check
            res = client.rpc("get_columns", {"t_name": "daily_usage"}).execute()
            print(res.data)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_daily_usage_cols()
