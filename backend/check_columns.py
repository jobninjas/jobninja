from supabase_service import SupabaseService
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / '.env')

def check_columns():
    client = SupabaseService.get_client()
    if not client:
        print("Failed to get Supabase client")
        return
        
    try:
        # Get one row to see columns
        response = client.table("profiles").select("*").limit(1).execute()
        if response.data:
            print("Columns found in 'profiles' table:")
            print(list(response.data[0].keys()))
        else:
            print("No data in 'profiles' table to check columns")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_columns()
