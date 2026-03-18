
import os
import json
from supabase import create_client

def check_columns():
    url = "https://zvcvlfthffidmwkhhhfn.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2Y3ZsZnRoZmZpZG13a2hoaGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTY3NzQzOSwiZXhwIjoyMDg3MjUzNDM5fQ.9c11b8RMMeSR6BiUF8E_83zoIcY2MtdGY_V_TKGd6qw"
    
    supabase = create_client(url, key)
    try:
        # saved_resumes
        res = supabase.table("saved_resumes").select("*").limit(1).execute()
        print("\n--- SAVED_RESUMES ---")
        if res.data and len(res.data) > 0:
            cols = sorted(list(res.data[0].keys()))
            for c in cols:
                print(f"  - {c}")
        else:
            print("  NO DATA")
            
        # profiles
        res_prof = supabase.table("profiles").select("*").limit(1).execute()
        print("\n--- PROFILES ---")
        if res_prof.data and len(res_prof.data) > 0:
            cols = sorted(list(res_prof.data[0].keys()))
            for c in cols:
                print(f"  - {c}")
        else:
            print("  NO DATA")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_columns()
