
import os, asyncio, json, uuid
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime
load_dotenv()

async def test_insert():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    client = create_client(url, key)
    
    session_id = "768c3435-b5bc-4438-a863-9c1c5cf8a7a2"
    report_id = str(uuid.uuid4())
    
    report_data = {
        "id": report_id,
        "session_id": session_id,
        "summary": "Test Summary",
        "strengths": ["test"],
        "gaps": ["test"],
        "repetition_feedback": "test",
        "scores": {"comm": 10},
        "rewritten_answers": [{"q": "test", "o": "test", "i": "test"}],
        "role_fit_score": 90,
        "created_at": datetime.utcnow().isoformat()
    }
    
    print(f"Attempting to insert report {report_id} for session {session_id}...")
    try:
        res = client.table("evaluation_reports").insert(report_data).execute()
        print("SUCCESS: Report inserted!")
        print(f"Data: {res.data}")
    except Exception as e:
        print(f"FAILURE: Insert failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_insert())
