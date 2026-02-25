
import os
import sys
from dotenv import load_dotenv
load_dotenv('backend/.env')

from groq import Groq

api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    api_key = os.environ.get("GROQ_API_KEY_1") or os.environ.get("GROQ_API_KEY_2")

if not api_key:
    print("GROQ_API_KEY not found")
    sys.exit(1)

print(f"Testing Groq with key starting with: {api_key[:10]}...")

try:
    client = Groq(api_key=api_key)
    chat_completion = client.chat.completions.create(
        messages=[{"role": "user", "content": "Say hello"}],
        model="llama-3.3-70b-versatile",
    )
    print("✅ Groq Success!")
    print(f"Reply: {chat_completion.choices[0].message.content}")
except Exception as e:
    print(f"❌ Groq FAILED: {e}")
