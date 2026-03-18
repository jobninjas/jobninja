
import os, asyncio, json
from supabase import create_client
from dotenv import load_dotenv
load_dotenv()

async def check_all():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    client = create_client(url, key)
    
    tables = ["interview_sessions", "interview_turns", "evaluation_reports"]
    for table in tables:
        print(f"Checking table: {table}")
        try:
            res = client.table(table).select("*").limit(1).execute()
            if res.data:
                print(f"Columns in {table}:", list(res.data[0].keys()))
            else:
                print(f"Table {table} is empty. Cannot infer columns.")
        except Exception as e:
            print(f"Error checking {table}: {e}")

if __name__ == "__main__":
    asyncio.run(check_all())
