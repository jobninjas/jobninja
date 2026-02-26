
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

def check_table(table_name):
    print(f"\n--- Checking table: {table_name} ---")
    try:
        res = supabase.table(table_name).select("*").limit(1).execute()
        if res.data:
            print(f"Columns for {table_name}:")
            for k in res.data[0].keys():
                print(f" - {k}")
        else:
            print(f"Table '{table_name}' is empty (but exists).")
    except Exception as e:
        print(f"Error checking '{table_name}': {e}")

check_table("saved_resumes")
check_table("profiles")
check_table("interview_resumes")
