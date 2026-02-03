# Match Score Calculation Endpoint for JobNinjas Extension

from pydantic import BaseModel
from typing import Optional

class MatchScoreRequest(BaseModel):
    job_title: str
    company: str
    description: str

class MatchScoreResponse(BaseModel):
    match_score: int
    keywords_matched: int
    keywords_total: int
    keywords_present: list
    keywords_missing: list
    recommendation: str

@api_router.post("/jobs/match-score")
async def calculate_job_match_score(
    request: MatchScoreRequest,
    user: dict = Depends(get_current_user)
):
    """
    Calculate match score between user's resume and job description.
    Used by the LinkedIn extension to show match scores on job pages.
    """
    try:
        logger.info(f"Calculating match score for {user.get('email')}: {request.job_title} at {request.company}")
        
        # Get user's latest resume data
        user_profile = user.get("person", {})
        user_skills = user.get("skills", {})
        user_experience = user.get("employment_history", [])
        user_education = user.get("education", [])
        
        # Extract key skills and requirements from job description
        job_desc_lower = request.description.lower()
        
        # Common tech/job keywords to search for
        all_keywords = {
            "technical": ["python", "javascript", "java", "react", "node", "sql", "aws", "docker", "kubernetes", 
                         "machine learning", "ai", "data", "api", "frontend", "backend", "full stack", "devops",
                         "typescript", "angular", "vue", "mongodb", "postgresql", "redis", "jenkins", "git"],
            "soft": ["leadership", "communication", "teamwork", "agile", "scrum", "problem solving", 
                    "project management", "collaboration", "analytical"],
            "degree": ["bachelor", "master", "phd", "degree", "bs", "ms", "mba"],
            "experience": ["years", "experience", "senior", "junior", "lead", "principal", "staff"]
        }
        
        # Build user's keyword profile from their data
        user_keywords = set()
        
        # Add skills
        if isinstance(user_skills, dict):
            for skill_category in user_skills.values():
                if isinstance(skill_category, list):
                    user_keywords.update([s.lower() for s in skill_category])
                elif isinstance(skill_category, str):
                    user_keywords.update(skill_category.lower().split(", "))
        elif isinstance(user_skills, list):
            user_keywords.update([s.lower() for s in user_skills])
        
        # Add technologies from experience
        for exp in user_experience:
            if exp.get("description"):
                # Extract common tech words
                desc_lower = exp["description"].lower()
                for tech in all_keywords["technical"]:
                    if tech in desc_lower:
                        user_keywords.add(tech)
        
        # Check for degree
        has_degree = any(edu.get("degree") for edu in user_education)
        
       # Find matching keywords
        keywords_present = []
        keywords_missing = []
        
        # Check all keyword categories
        for category_keywords in all_keywords.values():
            for keyword in category_keywords:
                if keyword in job_desc_lower:
                    if keyword in user_keywords or (keyword in ["bachelor", "master", "degree"] and has_degree):
                        keywords_present.append(keyword)
                    else:
                        keywords_missing.append(keyword)
        
        # Calculate match score
        total_keywords = len(keywords_present) + len(keywords_missing)
        if total_keywords == 0:
            # Fallback: basic score based on years of experience
            user_years = len(user_experience)
            match_score = min(70, 40 + (user_years * 5))
            keywords_present = ["experience"]
            keywords_missing = []
            total_keywords = 8
        else:
            match_score = min(99, int((len(keywords_present) / max(total_keywords, 1)) * 100))
        
        # Generate recommendation
        if match_score >= 70:
            recommendation = "Great match! Your resume aligns well with this role."
        elif match_score >= 50:
            recommendation = "Good potential! Consider tailoring your resume to highlight relevant skills."
        else:
            recommendation = "This role may be a stretch. Focus on roles that better match your background."
        
        return {
            "match_score": match_score,
            "keywords_matched": len(keywords_present),
            "keywords_total": min(total_keywords, 8),  # Cap at 8 for display
            "keywords_present": keywords_present[:8],
            "keywords_missing": keywords_missing[:8],
            "recommendation": recommendation
        }
        
    except Exception as e:
        logger.error(f"Error calculating match score: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to calculate match score: {str(e)}")


# Add these lines to server.py after the other AI endpoints (around line 1500+)
