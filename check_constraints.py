import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(os.path.join("backend", ".env"))

def list_constraints():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    client = create_client(url, key)
    
    # RPC to get constraints on a table
    # Since we don't have a direct RPC, we can query information_schema if we have permission,
    # or just try dropping a few common ones. 
    # Actually, let's try a direct query via "RPC" if user has one, or just a raw SQL execution if possible.
    # Supabase doesn't allow raw SQL via client. 
    # But wait, the error message CALLED it "profiles_id_fkey". 
    
    # Let's try to verify if it's still there by catching a specific error.
    try:
        # Try to insert a row with a random ID
        import uuid
        res = client.table("profiles").insert({"id": str(uuid.uuid4()), "email": "test@test.com"}).execute()
        print("✅ Insert worked! Constraint is GONE.")
    except Exception as e:
        print(f"❌ Insert failed as expected: {e}")

if __name__ == "__main__":
    list_constraints()
