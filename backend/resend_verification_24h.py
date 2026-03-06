"""
One-time script: Resend verification/welcome emails to all users
who signed up in the last 24 hours.

Usage:
  cd backend
  python resend_verification_24h.py
"""

import asyncio
import os
import aiohttp
from datetime import datetime, timezone, timedelta
from urllib.parse import quote
import uuid
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
FROM_EMAIL = "jobNinjas <hello@jobninjas.io>"  # Verified Resend sender domain
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://www.jobninjas.ai")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not all([RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY]):
    print("❌ Missing env vars: RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY")
    exit(1)

# Safeguard against sending localhost links in production
if "localhost" in FRONTEND_URL:
    print(f"⚠️  WARNING: FRONTEND_URL is set to {FRONTEND_URL}")
    proceed = input("This will send localhost links to users. Is this intended? (y/n): ")
    if proceed.lower() != 'y':
        print("Aborting.")
        exit(0)


async def send_verification_email(name: str, email: str, token: str, referral_code: str = None):
    """Send verification email via Resend."""
    encoded_email = quote(email)
    verify_link = (
        f"{FRONTEND_URL}/verify-email?token={token}&email={encoded_email}"
        if token
        else f"{FRONTEND_URL}/dashboard"
    )
    invite_link = (
        f"{FRONTEND_URL}/signup?ref={referral_code}"
        if referral_code
        else f"{FRONTEND_URL}/signup"
    )

    html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; background: #f9fafb; margin: 0; padding: 0; }}
    .container {{ max-width: 600px; margin: 30px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
    .header {{ padding: 24px 40px; border-bottom: 1px solid #f3f4f6; }}
    .logo {{ font-size: 22px; font-weight: 800; color: #2563eb; text-decoration: none; }}
    .body {{ padding: 40px; text-align: center; }}
    .emoji {{ font-size: 72px; display: block; margin-bottom: 20px; }}
    h1 {{ font-size: 26px; color: #111827; margin: 0 0 12px; }}
    p {{ color: #4b5563; font-size: 15px; line-height: 1.6; }}
    .btn {{ display: inline-block; margin-top: 24px; background: #2563eb; color: #fff !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; }}
    .footer {{ padding: 24px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #f3f4f6; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="{FRONTEND_URL}" class="logo">jobNinjas</a>
    </div>
    <div class="body">
      <span class="emoji">✉️</span>
      <h1>Welcome to jobNinjas, {name}!</h1>
      <p>Thanks for joining us. Please confirm your email address so we know you're reachable.</p>
      <a href="{verify_link}" class="btn">Confirm my email address</a>
      <p style="margin-top:32px; font-size:13px; color:#9ca3af;">
        Or invite friends: <a href="{invite_link}">{invite_link}</a>
      </p>
    </div>
    <div class="footer">jobNinjas · hello@jobninjas.io</div>
  </div>
</body>
</html>
"""

    async with aiohttp.ClientSession() as session:
        async with session.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
            json={
                "from": FROM_EMAIL,
                "to": [email],
                "subject": f"Welcome to jobNinjas, {name}! Please confirm your email 🥷",
                "html": html,
            },
        ) as resp:
            result = await resp.json()
            if resp.status == 200:
                print(f"  ✅ Sent to {email}")
                return True
            else:
                print(f"  ❌ Failed for {email}: {result}")
                return False


async def main():
    import httpx

    # Fetch users created in last 24 hours from Supabase
    since = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    print(f"📋 Fetching users created since: {since}")

    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    }

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SUPABASE_URL}/rest/v1/profiles",
            headers=headers,
            params={
                "select": "id,email,name,verification_token,referral_code,is_verified,auth_method,created_at",
                "created_at": f"gte.{since}",
                "order": "created_at.desc",
            },
        )

    if resp.status_code != 200:
        print(f"❌ Supabase error: {resp.text}")
        return

    users = resp.json()
    print(f"✅ Found {len(users)} users registered in last 24 hours\n")

    sent = 0
    skipped = 0

    for user in users:
        email = user.get("email")
        name = user.get("name") or "there"
        token = user.get("verification_token")
        referral_code = user.get("referral_code")
        is_verified = user.get("is_verified", False)
        auth_method = user.get("auth_method", "")

        # Skip already-verified email users (Google users are auto-verified, still send)
        if is_verified and auth_method != "google":
            print(f"  ⏭️  Skipping {email} (already verified)")
            skipped += 1
            continue

        # If token is missing, generate one and update DB
        if not token:
            print(f"  🆕 Generating missing token for {email}...")
            token = str(uuid.uuid4())
            update_resp = await client.patch(
                f"{SUPABASE_URL}/rest/v1/profiles",
                headers=headers,
                params={"email": f"eq.{email}"},
                json={"verification_token": token}
            )
            if update_resp.status_code not in [200, 204]:
                print(f"  ❌ Failed to update token for {email}: {update_resp.text}")
                continue

        print(f"  📧 Sending to {email} (auth: {auth_method or 'email'}, verified: {is_verified})")
        ok = await send_verification_email(name, email, token, referral_code)
        if ok:
            sent += 1

        # Small delay to avoid Resend rate limits
        await asyncio.sleep(0.3)

    print(f"\n🎉 Done! Sent: {sent} | Skipped: {skipped} | Total: {len(users)}")


if __name__ == "__main__":
    asyncio.run(main())
