import requests
import json

API_URL = "http://localhost:8000"

def test_download_headers():
    print("Testing /api/generate/resume with special characters in company name...")
    
    payload = {
        "userId": "test_user",
        "resume_text": "Test Resume Content",
        "job_description": "Test Job Description",
        "job_title": "Software Engineer",
        "company": "O'Reilly & Associates; Ltd.",
        "analysis": {}
    }
    
    try:
        response = requests.post(f"{API_URL}/api/generate/resume", json=payload)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            content_disposition = response.headers.get("Content-Disposition")
            content_type = response.headers.get("Content-Type")
            
            print(f"Content-Disposition: {content_disposition}")
            print(f"Content-Type: {content_type}")
            
            expected_filename = 'filename="Optimized_Resume_O_Reilly___Associates__Ltd_.docx"'
            # Note: My backend sanitize logic replaces ' ' with '_' and removes '"'
            # But the frontend does more. Let's see what the backend does:
            # safe_company = request.company.replace(' ', '_').replace('"', '')
            # So O'Reilly & Associates; Ltd. -> O'Reilly_&_Associates;_Ltd.
            
            if 'filename="' in content_disposition and content_disposition.endswith('.docx"'):
                print("SUCCESS: Filename is correctly quoted and has .docx extension.")
            else:
                print("FAILURE: Filename is not correctly quoted or missing extension.")
        else:
            print(f"FAILURE: Server returned error {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"ERROR: Could not connect to server: {e}")

if __name__ == "__main__":
    test_download_headers()
