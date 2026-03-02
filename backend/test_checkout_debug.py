import asyncio
import os
from dodopayments import AsyncDodoPayments

async def main():
    try:
        dodo_client = AsyncDodoPayments(bearer_token="VlSrQp7v8yEwy3UB.Lzvf3GZC-wqETu11N-S8paVhoWjfyJfUHmPVDi-6g8HrvTaC")
        
        email = "test-trial7@example.com"
        print(f"Testing customer creation for {email}")
        try:
            cust = await dodo_client.customers.create(email=email)
            print("Customer Created:", cust.customer_id)
        except Exception as e:
            print(f"Failed to create customer: {e}")
            import traceback
            traceback.print_exc()

    except Exception as e:
        pass

if __name__ == "__main__":
    asyncio.run(main())
