
import re

def calculate_job_match_score_NEW(job_title, description, user):
    job_desc_lower = description.lower()
    
    # NEW EXPANDED KEYWORDS
    all_keywords = {
        "technical": [
            "python", "javascript", "java", "react", "node", "sql", "aws", "docker", "kubernetes", 
            "machine learning", "ml", "ai", "artificial intelligence", "data science", "data", "api", 
            "frontend", "backend", "full stack", "devops", "typescript", "angular", "vue", 
            "mongodb", "postgresql", "redis", "jenkins", "git", "nlp", "llm", "large language models",
            "pytorch", "tensorflow", "scikit-learn", "deep learning", "neural networks", 
            "c++", "c#", "go", "rust", "cloud", "terraform", "graphql", "microservices"
        ],
        "soft": ["leadership", "communication", "teamwork", "agile", "scrum", "problem solving", 
                "project management", "collaboration", "analytical"],
        "degree": ["bachelor", "master", "phd", "degree", "bs", "ms", "mba"],
        "experience": ["years", "experience", "senior", "junior", "lead", "principal", "staff"]
    }
    
    user_skills = user.get("skills", {})
    user_experience = user.get("experience", [])
    user_education = user.get("education", [])
    user_text = (user.get("resume_text") or "").lower()

    user_keywords = set()
    if user_text:
        text_tokens = set(re.findall(r'\b\w{2,}\b', user_text))
        user_keywords.update(text_tokens)

    if isinstance(user_skills, dict):
        for skill_category in user_skills.values():
            if isinstance(skill_category, list):
                user_keywords.update([s.lower() for s in skill_category])
            elif isinstance(skill_category, str):
                user_keywords.update([s.strip().lower() for s in skill_category.split(",")])

    experience = user_experience or user.get("employment_history", [])
    for exp in experience:
        if isinstance(exp, dict):
            exp_text = f"{exp.get('title', '')} {exp.get('description', '')}".lower()
            user_keywords.add(exp.get('title', '').lower())
            for tech in all_keywords["technical"]:
                if tech in exp_text:
                    user_keywords.add(tech)

    keywords_present = []
    keywords_missing = []
    
    for category_keywords in all_keywords.values():
        for keyword in category_keywords:
            if keyword in job_desc_lower:
                is_present = False
                if keyword in user_keywords:
                    is_present = True
                else:
                    if " " in keyword and keyword in user_text:
                        is_present = True
                            
                if is_present:
                    keywords_present.append(keyword)
                else:
                    keywords_missing.append(keyword)
    
    # SCORING
    job_title_lower = job_title.lower()
    user_title = user.get("target_role", "").lower()
    
    title_match = False
    if user_title:
        job_title_words = set(re.findall(r'\b\w{3,}\b', job_title_lower))
        user_title_words = set(re.findall(r'\b\w{3,}\b', user_title))
        if job_title_words.intersection(user_title_words):
            title_match = True
    
    total_keywords = len(keywords_present) + len(keywords_missing)
    keyword_score = 0
    if total_keywords > 0:
        keyword_score = (len(keywords_present) / total_keywords) * 100
    
    if total_keywords == 0:
        user_exp_len = len(experience)
        match_score = min(70, 45 + (user_exp_len * 5))
    else:
        if title_match:
            match_score = 65 + min(int(keyword_score * 0.34), 34)
        else:
            match_score = min(75, int(keyword_score * 0.8))
            
    return match_score, keywords_present, keywords_missing

# Test Case: AI Engineer
user = {
    "target_role": "AI Developer",
    "resume_text": "Experienced developer focused on Artificial Intelligence and Machine Learning. Expert in Python, LLMs, and Pytorch.",
    "skills": {"technical": ["Python", "AI", "Machine Learning", "LLM", "PyTorch"]},
    "experience": [{"title": "Senior AI Developer", "description": "Led development of LLMs."}],
    "education": [{"degree": "Master"}]
}

# Scenario 1: Match for "Artificial Intelligence"
job_title = "AI Engineer"
description = "looking for Artificial Intelligence expert with neural networks experience."

score, present, missing = calculate_job_match_score_NEW(job_title, description, user)
print(f"Role: {job_title}")
print(f"Desc: {description}")
print(f"Score: {score}%")
print(f"Present: {present}")
print(f"Missing: {missing}")

# Scenario 2: Broad technical match
job_title2 = "Python Backend Developer"
description2 = "Build robust APIs using Python and SQL."
score2, present2, missing2 = calculate_job_match_score_NEW(job_title2, description2, user)
print(f"\nRole 2: {job_title2}")
print(f"Score 2: {score2}%")
print(f"Present 2: {present2}")
