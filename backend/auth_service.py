from fastapi import APIRouter, Request, HTTPException, Depends, Header, BackgroundTasks
import jwt
import bcrypt
import uuid
import os
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
from pydantic import BaseModel
from supabase_service import SupabaseService

# Initialize Router
auth_router = APIRouter(prefix="/auth")
logger = logging.getLogger(__name__)

# Security Config (shared/extracted)
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-key-do-not-use-in-prod")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

# Models
class UserSignup(BaseModel):
    email: str
    password: str
    name: str
    referral_code: Optional[str] = None
    turnstile_token: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str
    turnstile_token: Optional[str] = None

# Helper functions extracted from server.py (placeholders for now to allow import)
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password: return False
    try:
        if hashed_password.startswith("$2b$"):
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        return False
    except Exception: return False

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

@auth_router.post("/login")
async def login(credentials: UserLogin, request: Request):
    # Logic extracted from server.py...
    email_clean = credentials.email.lower().strip()
    user = SupabaseService.get_user_by_email(email_clean)
    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token(data={"sub": user["email"], "id": user.get("id")})
    return {"success": True, "user": user, "token": token}

# Additional routes like /signup, /verify-email will go here...
