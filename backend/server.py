from fastapi import FastAPI, APIRouter, Request, Header, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib
from models import CheckoutRequest, SubscriptionData, WebhookEvent
from payment_service import create_checkout_session, verify_webhook_signature, create_customer_portal_session


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class WaitlistEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    current_role: Optional[str] = None
    target_role: Optional[str] = None
    urgency: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WaitlistCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    current_role: Optional[str] = None
    target_role: Optional[str] = None
    urgency: Optional[str] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# ============ EMAIL HELPER ============

async def send_waitlist_email(name: str, email: str):
    """
    Send a confirmation email to users who join the waitlist.
    """
    try:
        smtp_host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
        smtp_port = int(os.environ.get('SMTP_PORT', 587))
        smtp_user = os.environ.get('SMTP_USER')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        from_email = os.environ.get('FROM_EMAIL', smtp_user)
        
        if not smtp_user or not smtp_password:
            logger.warning("SMTP credentials not configured, skipping email")
            return False
        
        # Create email message
        message = MIMEMultipart("alternative")
        message["Subject"] = "Welcome to Nova Ninjas Waitlist! 🥷"
        message["From"] = from_email
        message["To"] = email
        
        # Plain text version
        text_content = f"""
Hi {name},

Thank you for joining the Nova Ninjas waitlist!

We're excited to have you on board. You've taken the first step toward transforming your job search.

What happens next:
- We'll review your application
- You'll receive priority access when we launch
- Our team will reach out with personalized onboarding

In the meantime, feel free to reply to this email if you have any questions.

Best regards,
The Nova Ninjas Team

Human-powered job applications for serious job seekers
        """
        
        # HTML version
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .highlight {{ background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 14px; }}
        h1 {{ margin: 0; font-size: 28px; }}
        .emoji {{ font-size: 40px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emoji">🥷</div>
            <h1>Welcome to Nova Ninjas!</h1>
        </div>
        <div class="content">
            <p>Hi <strong>{name}</strong>,</p>
            
            <p>Thank you for joining the Nova Ninjas waitlist! We're excited to have you on board.</p>
            
            <div class="highlight">
                <strong>What happens next:</strong>
                <ul>
                    <li>✅ We'll review your application</li>
                    <li>✅ You'll receive priority access when we launch</li>
                    <li>✅ Our team will reach out with personalized onboarding</li>
                </ul>
            </div>
            
            <p>You've taken the first step toward transforming your job search. No more endless applications – let our human specialists handle the grind while you focus on interviews and skill-building.</p>
            
            <p>If you have any questions, simply reply to this email.</p>
            
            <p>Best regards,<br><strong>The Nova Ninjas Team</strong></p>
        </div>
        <div class="footer">
            <p>Human-powered job applications for serious job seekers</p>
        </div>
    </div>
</body>
</html>
        """
        
        message.attach(MIMEText(text_content, "plain"))
        message.attach(MIMEText(html_content, "html"))
        
        # Send email
        await aiosmtplib.send(
            message,
            hostname=smtp_host,
            port=smtp_port,
            start_tls=True,
            username=smtp_user,
            password=smtp_password,
        )
        
        logger.info(f"Waitlist confirmation email sent to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {str(e)}")
        return False

# ============ WAITLIST ENDPOINTS ============

@api_router.post("/waitlist", response_model=WaitlistEntry)
async def join_waitlist(input: WaitlistCreate):
    """
    Add a new entry to the waitlist.
    Stores contact info and job preferences.
    """
    waitlist_dict = input.model_dump()
    waitlist_obj = WaitlistEntry(**waitlist_dict)
    
    # Convert to dict and serialize datetime for MongoDB
    doc = waitlist_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.waitlist.insert_one(doc)
    logger.info(f"New waitlist entry: {waitlist_obj.email}")
    
    # Send confirmation email
    await send_waitlist_email(waitlist_obj.name, waitlist_obj.email)
    
    return waitlist_obj

@api_router.get("/waitlist", response_model=List[WaitlistEntry])
async def get_waitlist():
    """
    Get all waitlist entries (admin use).
    """
    entries = await db.waitlist.find({}, {"_id": 0}).to_list(1000)
    
    for entry in entries:
        if isinstance(entry.get('created_at'), str):
            entry['created_at'] = datetime.fromisoformat(entry['created_at'])
    
    return entries

# ============ PAYMENT ENDPOINTS ============

@api_router.post("/create-checkout-session")
async def create_checkout(request: CheckoutRequest):
    """
    Create a Stripe Checkout session for subscription.
    This endpoint creates a payment page where users can pay with:
    - Credit/Debit cards
    - Apple Pay (if available)
    - Google Pay
    - Cash App Pay
    """
    try:
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        
        session_data = create_checkout_session(
            plan_id=request.plan_id,
            user_email=request.user_email,
            user_id=request.user_id,
            success_url=f"{frontend_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_url}/payment/canceled"
        )
        
        return session_data
        
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/webhooks/stripe")
async def stripe_webhook(request: Request, stripe_signature: Optional[str] = Header(None)):
    """
    Webhook endpoint for Stripe events.
    Handles subscription lifecycle events:
    - checkout.session.completed: Customer completed payment
    - customer.subscription.updated: Subscription status changed
    - customer.subscription.deleted: Subscription canceled
    - invoice.payment_failed: Payment failed
    """
    payload = await request.body()
    
    try:
        # Verify webhook signature
        event = verify_webhook_signature(payload, stripe_signature)
        
        # Log the event
        webhook_event = WebhookEvent(
            event_type=event['type'],
            event_data=event['data']
        )
        await db.webhook_events.insert_one(webhook_event.model_dump())
        
        # Handle different event types
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            
            # Extract subscription data
            subscription_data = SubscriptionData(
                user_id=session.get('client_reference_id'),
                user_email=session.get('customer_email'),
                plan_id=session['metadata'].get('plan_id'),
                stripe_customer_id=session.get('customer'),
                stripe_subscription_id=session.get('subscription'),
                stripe_price_id=session['line_items']['data'][0]['price']['id'] if 'line_items' in session else '',
                status='active',
                current_period_end=datetime.fromtimestamp(session.get('expires_at', 0))
            )
            
            # Save to database
            await db.subscriptions.insert_one(subscription_data.model_dump())
            logger.info(f"Subscription created for user {subscription_data.user_id}")
        
        elif event['type'] == 'customer.subscription.updated':
            subscription = event['data']['object']
            
            # Update subscription status
            await db.subscriptions.update_one(
                {'stripe_subscription_id': subscription['id']},
                {'$set': {
                    'status': subscription['status'],
                    'current_period_end': datetime.fromtimestamp(subscription['current_period_end']),
                    'updated_at': datetime.utcnow()
                }}
            )
            logger.info(f"Subscription {subscription['id']} updated to {subscription['status']}")
        
        elif event['type'] == 'customer.subscription.deleted':
            subscription = event['data']['object']
            
            # Mark subscription as canceled
            await db.subscriptions.update_one(
                {'stripe_subscription_id': subscription['id']},
                {'$set': {
                    'status': 'canceled',
                    'updated_at': datetime.utcnow()
                }}
            )
            logger.info(f"Subscription {subscription['id']} canceled")
        
        elif event['type'] == 'invoice.payment_failed':
            invoice = event['data']['object']
            
            # Update subscription to past_due
            await db.subscriptions.update_one(
                {'stripe_subscription_id': invoice['subscription']},
                {'$set': {
                    'status': 'past_due',
                    'updated_at': datetime.utcnow()
                }}
            )
            logger.warning(f"Payment failed for subscription {invoice['subscription']}")
        
        # Mark event as processed
        await db.webhook_events.update_one(
            {'id': webhook_event.id},
            {'$set': {'processed': True}}
        )
        
        return JSONResponse(content={'status': 'success'})
        
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/create-portal-session")
async def create_portal(user_id: str):
    """
    Create a Stripe Customer Portal session.
    Allows customers to manage their subscription:
    - Update payment method
    - View invoices
    - Cancel subscription
    """
    try:
        # Get customer's subscription
        subscription = await db.subscriptions.find_one({'user_id': user_id})
        
        if not subscription:
            raise HTTPException(status_code=404, detail="No subscription found")
        
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        
        portal_data = create_customer_portal_session(
            customer_id=subscription['stripe_customer_id'],
            return_url=f"{frontend_url}/dashboard"
        )
        
        return portal_data
        
    except Exception as e:
        logger.error(f"Error creating portal session: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/subscription/{user_id}")
async def get_subscription(user_id: str):
    """Get user's current subscription."""
    subscription = await db.subscriptions.find_one({'user_id': user_id}, {'_id': 0})
    
    if not subscription:
        return {'status': 'none', 'message': 'No active subscription'}
    
    return subscription

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()