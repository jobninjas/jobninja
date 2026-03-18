
import os, asyncio, json
from supabase import create_client
from dotenv import load_dotenv
load_dotenv()

async def inspect():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    client = create_client(url, key)
    
    print("Inspecting 'evaluation_reports' table...")
    try:
        # Try to get one row to see columns
        res = client.table("evaluation_reports").select("*").limit(1).execute()
        if res.data:
            print("Columns found:", list(res.data[0].keys()))
        else:
            print("No data in evaluation_reports. Trying to find table info via RPC or just schema.")
            # If no data, we can try to insert a dummy row and catch error or just guess.
            # But usually select * works even if empty? Wait, it returns [] if empty.
            print("Table might be empty.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(inspect())
