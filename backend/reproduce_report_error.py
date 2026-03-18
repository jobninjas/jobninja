
import sys, os, asyncio, json
from dotenv import load_dotenv
load_dotenv()
sys.path.append(os.getcwd())

from interview_service import InterviewOrchestrator, AIService
from supabase_service import SupabaseService

async def reproduce(session_id):
    print(f"DEBUG: Reproducing report for session {session_id}")
    orchestrator = InterviewOrchestrator(session_id)
    try:
        # Try the actual method used by the server
        print("DEBUG: Calling orchestrator.finalize_and_generate_report()...")
        report_result = await orchestrator.finalize_and_generate_report()
        print("SUCCESS: Report generated!")
        print(f"DEBUG: Output Keys: {list(report_result.keys())}")
        
    except Exception as e:
        print(f"FAILURE: Finalize failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    session_id = "768c3435-b5bc-4438-a863-9c1c5cf8a7a2"
    asyncio.run(reproduce(session_id))
