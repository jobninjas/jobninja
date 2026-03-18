
import sys
import os
from unittest.mock import MagicMock

# Mock ResumeDataSchema and its nested models
class MockHeader:
    def __init__(self, full_name, target_role, city_state, phone, email, linkedin, portfolio):
        self.full_name = full_name
        self.target_role = target_role
        self.city_state = city_state
        self.phone = phone
        self.email = email
        self.linkedin = linkedin
        self.portfolio = portfolio

class MockCoreSkills:
    def __init__(self, languages, data_etl, cloud, databases, devops_tools, other):
        self.languages = languages
        self.data_etl = data_etl
        self.cloud = cloud
        self.databases = databases
        self.devops_tools = devops_tools
        self.other = other

class MockEducation:
    def __init__(self, degree, major, university, year):
        self.degree = degree
        self.major = major
        self.university = university
        self.year = year

class MockResumeData:
    def __init__(self, full_name, target_role, city_state, phone, email, summary, skills, education):
        self.header = MockHeader(full_name, target_role, city_state, phone, email, "linkedin.com/in/test", "portfolio.com")
        self.target_role = target_role
        self.target_title = target_role
        self.positioning_statement = summary
        self.core_skills = MockCoreSkills(*skills)
        self.education = education
        self.experience = []
        self.projects = []
        self.certifications = []

def test_rendering():
    from document_generator import _render_ats_with_dynamic_skills, render_ats_resume_from_json
    
    edu = [MockEducation("Master of Science", "Computer Science", "Stanford University", "2023")]
    skills = [["Python", "Go"], ["Spark"], ["AWS"], ["PostgreSQL"], ["Docker"], ["Agile"]]
    
    # CASE 1: Normal Data
    resume_正常的 = MockResumeData("Sairam Veereddy", "Agentic Developer", "Cupertino, CA", "217-862-4693", "test@test.com", "Expert in AI.", skills, edu)
    
    # CASE 2: Undefined Data
    resume_undefined = MockResumeData("undefinedSairam Veereddy", "undefinedAgentic Developer", "Cupertino, CA", "undefined", "test@test.com", "Expert in AI.", skills, edu)
    
    print("--- TESTING _render_ats_with_dynamic_skills (Normal) ---")
    print(_render_ats_with_dynamic_skills(resume_正常的, ["Languages", "ETL", "Cloud", "DBs", "DevOps", "Other"]))
    
    print("\n--- TESTING _render_ats_with_dynamic_skills (Undefined) ---")
    print(_render_ats_with_dynamic_skills(resume_undefined, ["Languages", "ETL", "Cloud", "DBs", "DevOps", "Other"]))

    print("\n--- TESTING render_ats_resume_from_json (Normal) ---")
    print(render_ats_resume_from_json(resume_正常的))

if __name__ == "__main__":
    # Add backend to path so document_generator can find its siblings
    sys.path.append(os.path.abspath("backend"))
    test_rendering()
