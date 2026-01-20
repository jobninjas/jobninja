import asyncio
import sys
import os
import json

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from document_generator import generate_expert_documents

async def test_tailoring():
    base_resume = """
Veereddy Sairam Reddy
Email: veereddy@jobninjas.org
Experience:
Senior Software Engineer at TechCorp (2020-Present)
- Built a recommendation engine using Python and Scikit-learn.
- Managed a team of 5 developers.
- Optimized database queries reducing latency by 40%.

Software Engineer at AppDev Inc (2018-2020)
- Developed REST APIs using Node.js and Express.
- Implemented CI/CD pipelines using GitHub Actions.

Skills: Python, Java, JavaScript, AWS, Docker, Kubernetes, SQL, NoSQL.
Education: MS in Computer Science, University of Texas.
    """

    job_description = """
Senior Machine Learning Engineer (GenAI Focus)
We are looking for an expert to build LLM-powered applications.
Requirements:
- Strong experience with Python, PyTorch, and LLM frameworks (LangChain, LlamaIndex).
- Experience building and deploying Generative AI solutions.
- Knowledge of Vector Databases and ML orchestration.
- 5+ years of experience in ML/DL.
    """

    print("--- Starting Tailoring Test ---")
    result = await generate_expert_documents(base_resume, job_description)
    
    if not result:
        print("FAILED: No result returned from AI")
        return

    print("\n--- AI Result Keys ---")
    print(result.keys())

    print("\n--- Alignment Highlights ---")
    print(result.get('alignment_highlights', 'MISSING'))

    print("\n--- ATS Resume Preview (First 500 chars) ---")
    resume_text = result.get('ats_resume', '')
    print(resume_text[:500])


    # Validation checks
    print("\n--- Validation ---")
    
    # 1. Check for Skill Categories (Step 4)
    has_lang = "Languages:" in resume_text
    has_etl = "Data/ETL:" in resume_text
    has_cloud = "Cloud:" in resume_text
    print(f"Skill Groups Present: {has_lang and has_etl and has_cloud}")

    # 2. Check for Alignment Highlights
    has_highlights = "alignment_highlights" in result and len(result['alignment_highlights']) > 10
    print(f"Alignment Highlights Exist: {has_highlights}")

    # 3. Check for hyphen bullets
    has_hyphens = "- " in resume_text
    print(f"Uses Hyphen Bullets: {has_hyphens}")

    # 4. Check for Structured Data
    has_json = "resume_json" in result
    print(f"Has Structured JSON: {has_json}")

    if all([has_lang, has_etl, has_cloud, has_highlights, has_hyphens, has_json]):
        print("\nSUCCESS: Structured tailoring pipeline verified.")
    else:
        print("\nPARTIAL SUCCESS: Check content manually.")

if __name__ == "__main__":
    asyncio.run(test_tailoring())
