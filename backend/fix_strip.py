"""
Fix script: Add .strip() to all os.environ.get("RESEND_API_KEY") and
os.environ.get("FROM_EMAIL") calls in server.py to prevent newline/CR
characters from corrupting HTTP headers.
"""
import re

filepath = "backend/server.py"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Count occurrences before
count_key = content.count('os.environ.get("RESEND_API_KEY")')
count_email = content.count('os.environ.get("FROM_EMAIL"')
print(f"Found {count_key} RESEND_API_KEY gets, {count_email} FROM_EMAIL gets")

# Fix: Add .strip() after os.environ.get("RESEND_API_KEY") if not already stripped
# Pattern: os.environ.get("RESEND_API_KEY") NOT followed by .strip()
content = re.sub(
    r'os\.environ\.get\("RESEND_API_KEY"\)(?!\.strip)',
    'os.environ.get("RESEND_API_KEY", "").strip()',
    content
)

# Fix: os.environ.get("RESEND_API_KEY", "") NOT followed by .strip()
content = re.sub(
    r'os\.environ\.get\("RESEND_API_KEY", ""\)(?!\.strip)',
    'os.environ.get("RESEND_API_KEY", "").strip()',
    content
)

# Fix FROM_EMAIL gets that aren't already stripped
# Match os.environ.get("FROM_EMAIL", "...") not followed by .strip()
content = re.sub(
    r'os\.environ\.get\("FROM_EMAIL", "([^"]*?)"\)(?!\.strip)',
    r'os.environ.get("FROM_EMAIL", "\1").strip()',
    content
)

# Verify
count_key_after = content.count('.strip()')
print(f"Total .strip() calls after fix: {count_key_after}")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Done! server.py updated.")

# Verify the changes
with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines, 1):
        if "RESEND_API_KEY" in line and "environ" in line:
            print(f"  Line {i}: {line.strip()}")
        if "FROM_EMAIL" in line and "environ" in line:
            print(f"  Line {i}: {line.strip()}")
