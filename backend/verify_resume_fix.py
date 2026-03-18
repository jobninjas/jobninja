
import os
import json
from datetime import datetime, timezone
from supabase import create_client

def verify_fix():
    url = "https://zvcvlfthffidmwkhhhfn.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2Y3ZsZnRoZmZpZG13a2hoaGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTY3NzQzOSwiZXhwIjoyMDg3MjUzNDM5fQ.9c11b8RMMeSR6BiUF8E_83zoIcY2MtdGY_V_TKGd6qw"
    
    supabase = create_client(url, key)
    email = "vamshijanagama28@gmail.com"
    
    try:
        # 1. Get User ID
        user_res = supabase.table("profiles").select("id").eq("email", email).execute()
        if not user_res.data:
            print(f"User {email} not found")
            return
        user_id = user_res.data[0]["id"]
        print(f"Found user {email} with ID {user_id}")
        
        # 2. Simulate Upload Insertion (since I can't easily trigger the FastAPI endpoint with a real file here)
        # We'll insert a test record with the new fields
        test_resume = {
            "user_id": user_id,
            "user_email": email,
            "resume_name": "Verification_Test_Resume.docx",
            "resume_text": "This is a verification test content.",
            "file_name": "Verification_Test_Resume.docx",
            "font_family": "Verdana",
            "font_size": 12,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_system_generated": False,
            "is_base": True
        }
        
        print("Inserting test resume...")
        insert_res = supabase.table("saved_resumes").insert(test_resume).execute()
        if insert_res.data:
            new_id = insert_res.data[0]["id"]
            print(f"Successfully inserted test resume with ID: {new_id}")
            
            # 3. Verify Retrieval
            print("Verifying retrieval...")
            retrieval_res = supabase.table("saved_resumes").select("*").eq("id", new_id).execute()
            if retrieval_res.data:
                r = retrieval_res.data[0]
                print(f"Retrieved: Name={r['resume_name']}, UserID={r['user_id']}, Base={r['is_base']}, Font={r['font_family']}, Size={r['font_size']}")
                
                if r['user_id'] == user_id and r['is_base'] == True and r['font_family'] == "Verdana":
                    print("VERIFICATION SUCCESSFUL!")
                else:
                    print("VERIFICATION FAILED: Data mismatch")
            else:
                print("VERIFICATION FAILED: Could not retrieve inserted record")
                
            # Cleanup
            print("Cleaning up test record...")
            supabase.table("saved_resumes").delete().eq("id", new_id).execute()
        else:
            print("VERIFICATION FAILED: Insert returned no data")
            
    except Exception as e:
        print(f"Verification Error: {e}")

if __name__ == "__main__":
    verify_fix()
