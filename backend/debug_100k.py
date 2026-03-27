import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from supabase_service import SupabaseService
from dotenv import load_dotenv

load_dotenv(".env")
client = SupabaseService.get_client()

print("Total jobs in DB:", client.table("jobs").select("job_id", count="exact").limit(1).execute().count)

# Count by source
sources = client.table("jobs").select("source").limit(1000).execute().data
from collections import Counter
c = Counter(s.get("source", "NO_SOURCE") for s in sources)
print("Top 1000 sources:", dict(c))

# Latest 2 jobs
latest = client.table("jobs").select("job_id, title, source, created_at").order("created_at", desc=True).limit(2).execute().data
print("Latest jobs:", latest)
