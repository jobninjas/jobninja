import dodopayments
from dodopayments import DodoPayments
client = DodoPayments(bearer_token="VlSrQp7v8yEwy3UB.Lzvf3GZC-wqETu11N-S8paVhoWjfyJfUHmPVDi-6g8HrvTaC")
try:
    payment = client.payments.create(
        billing={"country": "US", "city": "NY", "state": "NY", "street": "Broadway", "zipcode": "10001"},
        customer={"email": "test@example.com", "name": "Test User"},
        product_cart=[{"product_id": "pdt_0NZdskVVIhaRIFib0pvKX", "quantity": 1}],
        payment_link=True,
        return_url="https://jobninjas.org/dashboard"
    )
    print("Success. URL:", payment.payment_link)
except Exception as e:
    print("Error:", repr(e))
