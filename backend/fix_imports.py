"""
Uncomment render_preview_text_from_json import at line 4697
"""
filepath = "backend/server.py"

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Line 4697 (0-indexed: 4696) 
line_idx = 4696
old = lines[line_idx].strip()
print(f"Line {line_idx+1}: '{old}'")

if old.startswith("#"):
    lines[line_idx] = "        from document_generator import render_preview_text_from_json\n"
    print(f"-> Uncommented")
else:
    print("Already uncommented, skipping")

with open(filepath, "w", encoding="utf-8") as f:
    f.writelines(lines)

print("Done!")
