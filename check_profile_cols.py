import os
from supabase import create_client
from dotenv import load_dotenv

dotenv_path = os.path.join('backend', '.env')
load_dotenv(dotenv_path)

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

try:
    res = supabase.table("profiles").select("*").limit(1).execute()
    if res.data:
        cols = list(res.data[0].keys())
        print(f"--- Columns in 'profiles' ({len(cols)}) ---")
        for col in sorted(cols):
            print(f"- {col}")
        for c in ['password_hash', 'verification_token', 'referral_code', 'referred_by', 'created_at']:
            print(f"Required Column '{c}' exists: {c in cols}")
    else:
        print("No data in profiles to check columns.")
except Exception as e:
    print(f"Error checking columns: {e}")
