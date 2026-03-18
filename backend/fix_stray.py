"""
Remove the stray ) at line 1505 of server.py
"""
filepath = "backend/server.py"

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Line 1505 (0-indexed: 1504) should be the stray ")"
print(f"Line 1505: '{lines[1504].rstrip()}'")

if lines[1504].strip() == ")":
    lines[1504] = ""
    print("Removed stray ')'")
else:
    print("WARNING: Line 1505 is not just ')'. Skipping.")

with open(filepath, "w", encoding="utf-8") as f:
    f.writelines(lines)

# Verify
with open(filepath, "r", encoding="utf-8") as f:
    all_lines = f.readlines()
    for i in range(1490, min(1520, len(all_lines))):
        print(f"{i+1}: {all_lines[i].rstrip()}")
