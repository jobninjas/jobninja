import os

def find_string(path, query):
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            for i, line in enumerate(f, 1):
                if query in line:
                    print(f"{i}: {line.strip()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("=== resume_analyzer imports ===")
    find_string("backend/server.py", "from resume_analyzer")
    print("=== document_generator imports ===")
    find_string("backend/server.py", "from document_generator")
    print("=== render_preview ===")
    find_string("backend/server.py", "render_preview_text_from_json")
    print("=== generate_optimized ===")
    find_string("backend/server.py", "generate_optimized_resume_content")
