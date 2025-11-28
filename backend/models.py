from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class CheckoutRequest(BaseModel):
    plan_id: str
    user_email: str
    user_id: str

class SubscriptionData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    plan_id: str
    stripe_customer_id: str
    stripe_subscription_id: str
    stripe_price_id: str
    status: str  # active, past_due, canceled, incomplete
    current_period_end: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class WebhookEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: str
    event_data: dict
    processed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
