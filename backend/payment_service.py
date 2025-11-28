import stripe
import os
from fastapi import HTTPException
from typing import Optional

# Initialize Stripe
stripe_secret_key = os.environ.get('STRIPE_SECRET_KEY')
if stripe_secret_key and not stripe_secret_key.startswith('sk_test_your'):
    stripe.api_key = stripe_secret_key
else:
    stripe.api_key = None  # Demo mode - no real Stripe calls

# Price mapping - maps internal plan IDs to Stripe Price IDs
PRICE_IDS = {
    '1': os.environ.get('STRIPE_PRICE_STARTER'),  # Starter plan
    '2': os.environ.get('STRIPE_PRICE_PRO'),      # Pro plan
    '3': os.environ.get('STRIPE_PRICE_URGENT'),   # Urgent plan
}

def create_checkout_session(
    plan_id: str,
    user_email: str,
    user_id: str,
    success_url: str,
    cancel_url: str
) -> dict:
    """
    Create a Stripe Checkout Session for subscription.
    
    Stripe Checkout automatically handles:
    - Credit/Debit cards
    - Apple Pay (if available on device)
    - Google Pay
    - Cash App Pay (US only)
    """
    
    # Check if Stripe is configured
    if not stripe.api_key:
        raise HTTPException(
            status_code=400, 
            detail="Stripe is not configured. Please add STRIPE_SECRET_KEY to backend/.env file. See /app/STRIPE_SETUP_GUIDE.md for instructions."
        )
    
    price_id = PRICE_IDS.get(str(plan_id))
    if not price_id or price_id.startswith('price_') and 'id_here' in price_id:
        raise HTTPException(
            status_code=400, 
            detail=f"Stripe Price ID not configured for plan {plan_id}. Please add STRIPE_PRICE_STARTER, STRIPE_PRICE_PRO, and STRIPE_PRICE_URGENT to backend/.env file. See /app/STRIPE_SETUP_GUIDE.md"
        )
    
    try:
        # Create Stripe Checkout Session
        checkout_session = stripe.checkout.Session.create(
            customer_email=user_email,
            client_reference_id=user_id,  # Store user ID for webhook
            payment_method_types=['card'],  # Stripe auto-enables Apple Pay, Google Pay, Cash App
            line_items=[
                {
                    'price': price_id,
                    'quantity': 1,
                }
            ],
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
            # Enable payment method options
            payment_method_options={
                'card': {
                    'setup_future_usage': 'off_session',
                }
            },
            # Metadata for tracking
            metadata={
                'user_id': user_id,
                'plan_id': plan_id,
            },
            # Automatic tax calculation (optional)
            # automatic_tax={'enabled': True},
        )
        
        return {
            'sessionId': checkout_session.id,
            'url': checkout_session.url,
            'status': 'created'
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

def verify_webhook_signature(payload: bytes, sig_header: str) -> dict:
    """
    Verify Stripe webhook signature and return event.
    """
    webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
        return event
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

def create_customer_portal_session(customer_id: str, return_url: str) -> dict:
    """
    Create a Stripe Customer Portal session for managing subscription.
    Allows customers to:
    - Update payment method
    - View invoices
    - Cancel subscription
    """
    try:
        portal_session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url,
        )
        return {'url': portal_session.url}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
