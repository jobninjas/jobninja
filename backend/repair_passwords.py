import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from supabase import create_client
from dotenv import load_dotenv

async def repair():
    load_dotenv('.env')
    
    # Mongo connection
    mongo_url = os.environ.get('MONGO_URL')
    mongo_client = AsyncIOMotorClient(mongo_url, tlsAllowInvalidCertificates=True)
    db = mongo_client[os.environ.get('DB_NAME', 'novaninjas')]
    
    # Supabase connection
    sb_url = os.environ.get('SUPABASE_URL')
    sb_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    supabase = create_client(sb_url, sb_key)
    
    print("🚀 Repairing password hashes for users...")
    
    # 1. Fetch all users from Mongo who have a password
    cursor = db.users.find({"password_hash": {"$exists": True}, "email": {"$exists": True}})
    mongo_users = await cursor.to_list(length=1000)
    print(f"Found {len(mongo_users)} users in MongoDB with passwords.")
    
    repaired_count = 0
    skipped_count = 0
    
    for user in mongo_users:
        email = user['email'].strip().lower()
        password_hash = user.get('password') # In Mongo it was stored in 'password' field often
        if not password_hash:
            password_hash = user.get('password_hash')
            
        if not password_hash:
            print(f"Skipping {email}: No password hash found in Mongo document.")
            skipped_count += 1
            continue
            
        # 2. Check if user exists in Supabase profiles
        res = supabase.table("profiles").select("id, email, password_hash").eq("email", email).execute()
        
        if res.data:
            sb_user = res.data[0]
            # Only update if current hash is missing or different (though usually we just want it present)
            if not sb_user.get('password_hash'):
                update_res = supabase.table("profiles").update({"password_hash": password_hash}).eq("email", email).execute()
                if update_res.data:
                    print(f"✅ Repaired {email}: Hash attached.")
                    repaired_count += 1
                else:
                    print(f"❌ Failed to update {email}")
            else:
                # print(f"ℹ️ {email} already has a hash, skipping.")
                skipped_count += 1
        else:
            # print(f"⚠️ {email} not found in Supabase profiles, skipping.")
            skipped_count += 1
            
    print(f"\n✅ Repair complete! Repaired: {repaired_count}, Skipped/Already OK: {skipped_count}")
    mongo_client.close()

if __name__ == "__main__":
    asyncio.run(repair())
