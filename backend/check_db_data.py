
import os
from supabase import create_client

def check_data():
    url = "https://zvcvlfthffidmwkhhhfn.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2Y3ZsZnRoZmZpZG13a2hoaGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTY3NzQzOSwiZXhwIjoyMDg3MjUzNDM5fQ.9c11b8RMMeSR6BiUF8E_83zoIcY2MtdGY_V_TKGd6qw"
    
    supabase = create_client(url, key)
    try:
        # Get last 10 resumes
        res = supabase.table("saved_resumes").select("*").order("created_at", desc=True).limit(10).execute()
        print("\n--- RECENT RESUMES ---")
        if res.data:
            for r in res.data:
                print(f"ID: {r['id']}, Name: {r['resume_name']}, User: {r['user_email']}, System: {r['is_system_generated']}, Created: {r['created_at']}")
        else:
            print("  NO DATA")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_data()
