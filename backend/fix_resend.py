"""
Fix resend_verification to send emails synchronously (await) instead of via BackgroundTasks.
Also fix the dead code in send_welcome_email (return False after raise e is unreachable).
"""

filepath = "backend/server.py"

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Fix 1: In resend_verification, replace background_tasks.add_task with await
# Lines 1494-1501 (0-indexed: 1493-1500)
# Look for the background_tasks.add_task block and replace it
found_resend = False
for i in range(len(lines)):
    if "# Send email in background" in lines[i] and "background_tasks.add_task" in lines[i+1]:
        # Check if this is in the resend_verification function
        if i > 1470 and i < 1510:  # Near the resend_verification function
            found_resend = True
            # Replace lines i through i+6 (the background task block)
            new_lines = [
                "        # Send email synchronously so errors surface immediately\n",
                "        try:\n",
                "            result = await send_welcome_email(\n",
                "                user[\"name\"],\n",
                "                user[\"email\"],\n",
                "                verification_token,\n",
                "                user.get(\"referral_code\"),\n",
                "            )\n",
                "            logger.info(f\"RESEND RESULT for {user['email']}: {result}\")\n",
                "        except Exception as email_err:\n",
                "            logger.error(f\"RESEND EMAIL FAILED for {user['email']}: {email_err}\")\n",
                "            raise HTTPException(status_code=500, detail=f\"Email sending failed: {str(email_err)}\")\n",
            ]
            # Find end of the add_task block (line with just ")")
            end = i + 1
            while end < len(lines) and ")" not in lines[end] or "add_task" in lines[end]:
                end += 1
            # Include the closing paren line  
            end += 1
            
            print(f"Replacing lines {i+1}-{end+1} (resend_verification background task)")
            lines[i:end] = new_lines
            break

if not found_resend:
    print("WARNING: Could not find resend_verification background task block!")

# Fix 2: Remove dead code (return False after raise e) in send_welcome_email
for i in range(len(lines)):
    if "raise e" in lines[i] and i + 1 < len(lines) and "return False" in lines[i+1]:
        print(f"Removing dead code at line {i+2}: {lines[i+1].strip()}")
        lines[i+1] = ""  # Remove the dead return False

with open(filepath, "w", encoding="utf-8") as f:
    f.writelines(lines)

print("Done! server.py updated.")

# Verify
with open(filepath, "r", encoding="utf-8") as f:
    all_lines = f.readlines()
    for i in range(1490, min(1520, len(all_lines))):
        print(f"{i+1}: {all_lines[i].rstrip()}")
