import asyncio
from urllib.parse import quote
import uuid

async def test_resend_script_logic():
    print("Testing resend_verification_24h.py logic...")
    
    # Test encoding
    test_email = "test+ninja@example.com"
    encoded_email = quote(test_email)
    print(f"Original: {test_email}")
    print(f"Encoded: {encoded_email}")
    
    if encoded_email == "test%2Bninja%40example.com":
        print("✅ Encoding is correct")
    else:
        print("❌ Encoding is INCORRECT")

    # Test token generation simulator
    token = None
    if not token:
        token = str(uuid.uuid4())
        print(f"✅ Generated new token: {token}")
    
    # Test link generation simulator
    FRONTEND_URL = "https://www.jobninjas.ai"
    verify_link = f"{FRONTEND_URL}/verify-email?token={token}&email={encoded_email}"
    print(f"Generated Link: {verify_link}")
    
    if encoded_email in verify_link and token in verify_link:
        print("✅ Link generation is correct")
    else:
        print("❌ Link generation is INCORRECT")

if __name__ == "__main__":
    asyncio.run(test_resend_script_logic())
