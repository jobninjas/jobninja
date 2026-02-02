import asyncio
import aiohttp
import json
import os

API_URL = "http://localhost:8000" # Adjusted for local dev

async def test_ats_target(target_score):
    print(f"\n--- Testing Target ATS Score: {target_score}% ---")
    
    # Mock data for testing
    resume_text = "Experienced software engineer with skills in Python, React, and AWS. Managed team of 5."
    job_description = "Seeking a Senior AI Developer with expertise in LLMs, PyTorch, and cloud deployments. Must have experience with vector databases."
    
    payload = {
        "resume_text": resume_text,
        "job_description": job_description,
        "target_score": target_score
    }
    
    # Since /api/scan/analyze expects Form/File, we'll try to reach a mock or the actual if it were running
    # For verification within this agent, I'll inspect the prompt logic in resume_analyzer.py which I already did.
    # But a script helps document the expected behavior.
    
    print(f"Goal: Achieve ~{target_score}% match score.")
    print(f"Expected Keywords: Market-standard AI and LLM terms.")

if __name__ == "__main__":
    asyncio.run(test_ats_target(90))
    asyncio.run(test_ats_target(95))
    asyncio.run(test_ats_target(100))
