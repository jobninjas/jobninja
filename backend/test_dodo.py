import asyncio
from dodopayments import AsyncDodoPayments
import json

async def test_dodo_checkout():
    DODO_PRICING = {
        'ai-monthly': 'pdt_0NZUIq5YeOwMHJLTzi24o',
        'ai-yearly': 'pdt_0NZdskVVIhaRIFib0pvKX',
        'ai-pro-plus': 'pdt_0NZdskeTK6brGEax0h2cX',
        'ai-pro-max': 'pdt_0NZdskimkgkJlRKi7MK0g'
    }
    
    plan_id = "ai-monthly"
    email = "test.dodo@jobninjas.ai"
    name = "Test User"
    
    print(f"Testing Dodo API for plan: {plan_id}")
    try:
        # Key from server.py hardcoded logic
        dodo_client = AsyncDodoPayments(bearer_token="VlSrQp7v8yEwy3UB.Lzvf3GZC-wqETu11N-S8paVhoWjfyJfUHmPVDi-6g8HrvTaC")
        
        try:
            print("1. Creating customer...")
            cust = await dodo_client.customers.create(email=email, name=name)
            customer_id = cust.customer_id
            print(f"  Created customer: {customer_id}")
        except Exception as e:
            print(f"  Customer creation failed: {e}")
            customer_id = None
            
        print("2. Creating subscription link...")
        create_kwargs = {
            "billing": {"country": "US", "city": "NY", "state": "NY", "street": "Broadway", "zipcode": "10001"},
            "product_id": DODO_PRICING[plan_id],
            "quantity": 1,
            "payment_link": True,
            "trial_period_days": 7,
            "return_url": "http://localhost:3000/dashboard?dodo_success=true"
        }
        
        if customer_id:
            create_kwargs["customer"] = {"customer_id": customer_id}
        else:
            create_kwargs["customer"] = {"email": email}
            
        link = await dodo_client.subscriptions.create(**create_kwargs)
        
        # Test serialization of the SDK output
        try:
            url = getattr(link, 'payment_link', getattr(link, 'url', None))
            print(f"  Success! URL: {url}")
        except Exception as e:
             print(f"  Serialization failed: {e}")
             
    except Exception as overall_e:
        print(f"CRITICAL SDK ERROR: {overall_e}")

if __name__ == "__main__":
    asyncio.run(test_dodo_checkout())
