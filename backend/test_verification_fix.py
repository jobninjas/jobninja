import asyncio
import os
from urllib.parse import unquote
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent))

from server import send_welcome_email

async def test_link_encoding():
    print("Testing verification link encoding...")
    test_email = "test+ninja@example.com"
    test_token = "test-token-123"
    
    # We need to mock send_email_resend to capture the html_content
    import server
    original_send_email = server.send_email_resend
    captured_html = []
    
    async def mock_send_email(to_email, subject, html_content):
        captured_html.append(html_content)
        return True
        
    server.send_email_resend = mock_send_email
    
    try:
        await send_welcome_email("Test User", test_email, test_token)
        
        if not captured_html:
            print("❌ Failed to capture HTML content")
            return
            
        html = captured_html[0]
        # Look for the verify link
        import re
        link_match = re.search(r'href="(.*?/verify-email\?.*?)"', html)
        if link_match:
            link = link_match.group(1)
            print(f"Captured Link: {link}")
            
            if "email=test%2Bninja%40example.com" in link:
                print("✅ Email is correctly URL-encoded in the link")
            else:
                print("❌ Email is NOT correctly URL-encoded in the link")
        else:
            print("❌ Could not find verification link in HTML")
            
    finally:
        server.send_email_resend = original_send_email

if __name__ == "__main__":
    asyncio.run(test_link_encoding())
