
import os, asyncio, json, uuid
from supabase import create_client
from dotenv import load_dotenv
load_dotenv()

async def find_cols():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    client = create_client(url, key)
    
    session_id = "768c3435-b5bc-4438-a863-9c1c5cf8a7a2"
    report_id = str(uuid.uuid4())
    
    # Try minimal insert
    print("Testing minimal insert (id, session_id)...")
    try:
        res = client.table("evaluation_reports").insert({"id": report_id, "session_id": session_id}).execute()
        print("SUCCESS: Minimal insert worked!")
        # If success, we can see the full row to see all column names (default nulls)
        res_full = client.table("evaluation_reports").select("*").eq("id", report_id).execute()
        if res_full.data:
            print("Actual columns in DB:", list(res_full.data[0].keys()))
        
        # Cleanup
        client.table("evaluation_reports").delete().eq("id", report_id).execute()
    except Exception as e:
        print(f"FAILURE: Minimal insert failed: {e}")

if __name__ == "__main__":
    asyncio.run(find_cols())
