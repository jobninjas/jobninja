"""
Interview Prep Service - AI-powered mock interviews
Uses Groq for AI and Supabase for storage
"""
import json
import os
import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging

try:
    from groq import Groq
except ImportError:
    Groq = None
    print("Warning: groq module not found. Interview features will be disabled.")

from supabase_service import SupabaseService

logger = logging.getLogger(__name__)

# Initialize Groq client
if Groq:
    try:
        groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))
    except Exception as e:
        print(f"Failed to initialize Groq client: {e}")
        groq_client = None
else:
    groq_client = None


class InterviewPrompts:
    """Interview prompts for different stages"""
    
    INITIAL_QUESTION = """
    You are an expert interviewer for JobNinjas.ai. 
    TASK: Generate the FIRST mock interview question based on the candidate's Resume and the Job Description (JD).
    
    CANDIDATE PROFILE:
    {{profile}}
    
    JOB DESCRIPTION:
    {{jd}}
    
    CONSTRAINTS:
    1. Do NOT invent facts about the candidate.
    2. Start with a brief, friendly greeting as an AI Mock Interviewer.
    3. The first question should usually be a high-level "Tell me about yourself" or a specific "Why this role?" grounded in their experience.
    4. Keep the question concise.
    
    OUTPUT FORMAT:
    You must return a valid JSON object matching this schema:
    {
      "intro": "Brief welcome message",
      "question": "The actual question text",
      "intent": "motivation|role_fit",
      "hint": "What you're looking for in a good answer"
    }
    """
    
    NEXT_TURN = """
    You are an expert interviewer.
    CONTEXT:
    - User Identity: {{profile}}
    - Job Priorities: {{jd}}
    - Question History: {{history}}
    - Last Answer: {{lastAnswer}}
    
    TASK: Decide whether to ask a follow-up question or move to the next topic.
    LOGIC:
    1. If the last answer was vague, lacked metrics, or didn't follow the STAR structure, ask a targeted follow-up to "drill down".
    2. If the answer was sufficient, move to a new topic (Skill Drill-down, Behavioral, or Situational).
    3. Rotation Strategy: Motivation -> Project Deep Dive -> JD Skill -> Behavioral -> Situational.
    
    CONSTRAINTS:
    1. Reference specific claims from the last answer if asking a follow-up.
    2. Do NOT repeat questions.
    
    OUTPUT FORMAT:
    Return valid JSON only:
    {
      "question": "The next question text",
      "type": "follow_up|new_topic",
      "topic": "The category of the question",
      "critique_of_last_answer": "Internal note on what was missing (be honest)"
    }
    """
    
    FINAL_REPORT = """
    You are a Senior Recruiter and Interview Coach.
    TASK: Analyze the full interview transcript and generate a structured evaluation report.
    
    INPUTS:
    - Resume: {{profile}}
    - JD: {{jd}}
    - Full Transcript: {{transcript}}
    
    REQUIRED SECTIONS:
    1. Overall Summary
    2. Key Strengths (3-5 items)
    3. Gaps vs JD (areas where the user didn't hit keywords or requirements)
    4. Repetition Patterns (detect filler words or repeated filler phrases)
    5. Scoring (0-10 on Clarity, STAR structure, Impact/Metrics, Role Alignment)
    6. Role-Fit Score (0-100)
    7. Top 10 Actionable Fixes
    8. Rewrite: Take the two "weakest" answers and provide a "Best Possible" version grounded in the candidate's actual resume facts.
    
    CONSTRAINTS:
    - Cite specific quotes from the transcript when giving feedback.
    - Be constructive but direct.
    
    OUTPUT FORMAT:
    Return valid JSON only with these fields:
    {
      "summary": "string",
      "strengths": ["string"],
      "gaps": ["string"],
      "repetition": "string",
      "scores": {"clarity": 0-10, "star": 0-10, "impact": 0-10, "roleAlignment": 0-10},
      "roleFitScore": 0-100,
      "actionableFixes": ["string"],
      "rewrittenAnswers": [{"original": "string", "improved": "string"}]
    }
    """


class AIService:
    """Groq AI service wrapper"""
    
    @staticmethod
    def chat(prompt: str, json_mode: bool = True) -> str:
        """Call Groq chat API"""
        try:
            if not groq_client:
                raise ValueError("Groq client not initialized")
                
            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"} if json_mode else None
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"Groq chat failed: {e}")
            raise
    
    @staticmethod
    def transcribe_audio(audio_file) -> str:
        """Transcribe audio using Groq Whisper"""
        try:
            if not groq_client:
                raise ValueError("Groq client not initialized")

            transcription = groq_client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-large-v3",
                response_format="text"
            )
            return transcription
        except Exception as e:
            logger.error(f"Groq transcription failed: {e}")
            raise


class InterviewOrchestrator:
    """Manages interview flow and AI interactions"""
    
    def __init__(self, session_id: str):
        self.session_id = session_id
    
    async def get_session(self) -> Optional[Dict[str, Any]]:
        """Get session with resume and turns from Supabase"""
        session = SupabaseService.get_interview_session(self.session_id)
        if not session:
            return None
        
        # Get resume
        if session.get('resume_id'):
            resume = SupabaseService.get_interview_resume(session['resume_id'])
            session['resume'] = resume
        
        # Get turns
        turns = SupabaseService.get_interview_turns(self.session_id)
        session['turns'] = turns
        
        return session
    
    async def generate_initial_question(self) -> Dict[str, Any]:
        """Generate the first interview question"""
        session = await self.get_session()
        if not session:
            raise ValueError("Session not found")
        
        resume = session.get('resume', {})
        profile = resume.get('parsed_text', '')
        
        prompt = InterviewPrompts.INITIAL_QUESTION\
            .replace('{{profile}}', profile)\
            .replace('{{jd}}', session.get('job_description', ''))
        
        response = AIService.chat(prompt, json_mode=True)
        result = json.loads(response)
        
        # Save the turn in Supabase
        SupabaseService.insert_interview_turn({
            "session_id": self.session_id,
            "turn_number": 1,
            "question_text": result.get('question', ''),
            "answer_text": None,
            "created_at": datetime.utcnow().isoformat()
        })
        
        # Update session count
        SupabaseService.update_interview_session(
            self.session_id,
            {"question_count": 1}
        )
        
        return result
    
    async def process_answer_and_get_next(self, answer_text: str) -> Dict[str, Any]:
        """Process answer and generate next question"""
        session = await self.get_session()
        if not session:
            raise ValueError("Session not found")
        
        turns = session.get('turns', [])
        current_turn_number = len(turns)
        
        # Update current turn with answer
        if turns:
            last_turn = turns[-1]
            SupabaseService.update_interview_turn(
                last_turn['id'],
                {"answer_text": answer_text}
            )
        
        # Check if we reached target questions
        question_count = session.get('question_count', 0)
        target_questions = session.get('target_questions', 5)
        
        if question_count >= target_questions:
            return {"status": "completed"}
        
        # Generate next question
        resume = session.get('resume', {})
        profile = resume.get('parsed_text', '')
        
        history = "\n\n".join([
            f"Q: {t.get('question_text', '')}\nA: {t.get('answer_text', '')}"
            for t in turns if t.get('answer_text')
        ])
        
        prompt = InterviewPrompts.NEXT_TURN\
            .replace('{{profile}}', profile)\
            .replace('{{jd}}', session.get('job_description', ''))\
            .replace('{{history}}', history)\
            .replace('{{lastAnswer}}', answer_text)
        
        response = AIService.chat(prompt, json_mode=True)
        result = json.loads(response)
        
        # Create next turn
        SupabaseService.insert_interview_turn({
            "session_id": self.session_id,
            "turn_number": current_turn_number + 1,
            "question_text": result.get('question', ''),
            "answer_text": None,
            "created_at": datetime.utcnow().isoformat()
        })
        
        # Update session count
        SupabaseService.update_interview_session(
            self.session_id,
            {"question_count": question_count + 1}
        )
        
        return {"status": "active", **result}
    
    async def finalize_and_generate_report(self) -> Dict[str, Any]:
        """Finalize interview and generate evaluation report"""
        session = await self.get_session()
        if not session:
            raise ValueError("Session not found")
        
        resume = session.get('resume', {})
        profile = resume.get('parsed_text', '')
        turns = session.get('turns', [])
        
        transcript = "\n\n".join([
            f"Q: {t.get('question_text', '')}\nA: {t.get('answer_text', '')}"
            for t in turns if t.get('answer_text')
        ])
        
        prompt = InterviewPrompts.FINAL_REPORT\
            .replace('{{profile}}', profile)\
            .replace('{{jd}}', session.get('job_description', ''))\
            .replace('{{transcript}}', transcript)
        
        response = AIService.chat(prompt, json_mode=True)
        result = json.loads(response)
        
        # Save report
        report_data = {
            "session_id": self.session_id,
            "summary": result.get('summary', ''),
            "strengths": result.get('strengths', []),
            "gaps": result.get('gaps', []),
            "repetition_feedback": result.get('repetition', ''),
            "scores": result.get('scores', {}),
            "rewritten_answers": result.get('rewrittenAnswers', []),
            "role_fit_score": result.get('roleFitScore', 0),
            "created_at": datetime.utcnow().isoformat()
        }
        
        report = SupabaseService.insert_evaluation_report(report_data)
        report_id = report.get('id') if report else None
        
        # Update session status
        if report_id:
            SupabaseService.update_interview_session(
                self.session_id,
                {"status": "completed", "report_id": report_id}
            )
            report['id'] = report_id
        
        return report
