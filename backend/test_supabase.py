import os
from supabase import create_client
from dotenv import load_dotenv
import time

load_dotenv(".env.local")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
client = create_client(url, key)

print("Fetching count...")
t0 = time.time()
try:
    res = client.table("jobs").select("*", count="exact").limit(0).execute()
    print("Count:", res.count)
except Exception as e:
    print("Error:", e)
print(f"Time: {time.time() - t0:.2f}s")
