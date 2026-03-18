import sys
sys.path.append(r"c:\Users\vsair\Downloads\novasquar-main\novasquad-main\nova-ninjas\backend")

from core.supabase_service import SupabaseService
import uuid

print("Testing direct Supabase INSERT and DELETE")
client = SupabaseService.get_client()

# Insert a dummy record
dummy_id = str(uuid.uuid4())
new_resume = {
    "id": dummy_id,
    "user_email": "test_delete_bot@example.com",
    "resume_name": "Test Delete Me",
    "resume_text": "This is a test resume to verify delete behavior.",
    "is_system_generated": False
}

try:
    print(f"Inserting dummy record with ID {dummy_id}")
    res = client.table("saved_resumes").insert(new_resume).execute()
    print("Insert response data:", res.data)
    
    print("Now deleting the record...")
    del_res = client.table("saved_resumes").delete().eq("id", dummy_id).execute()
    print("Delete response data:", del_res.data)
except Exception as e:
    print(f"Error during test: {e}")
