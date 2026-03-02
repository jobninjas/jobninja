from dodopayments import DodoPayments
def main():
    client = DodoPayments(bearer_token="VlSrQp7v8yEwy3UB.Lzvf3GZC-wqETu11N-S8paVhoWjfyJfUHmPVDi-6g8HrvTaC")
    try:
        # 1. Create Customer
        cust = client.customers.create(email="test-trial7@example.com", name="Test User")
        print("Customer Created:", cust.customer_id)
        
        # 2. Create Payment link with customer_id
        link = client.payments.create(
            billing={"city": "NY", "country": "US", "state": "NY", "street": "Broadway", "zipcode": "10001"},
            customer={"customer_id": cust.customer_id},
            product_cart=[{"product_id": "pdt_0NZdskVVIhaRIFib0pvKX", "quantity": 1}],
            payment_link=True,
            return_url="https://jobninjas.org/dashboard?dodo_success=true"
        )
        print("Payment Link URL:", link.payment_link)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
