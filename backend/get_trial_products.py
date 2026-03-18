import os
from dodopayments import DodoPayments
client = DodoPayments(bearer_token="VlSrQp7v8yEwy3UB.Lzvf3GZC-wqETu11N-S8paVhoWjfyJfUHmPVDi-6g8HrvTaC")

with open('trial_products.txt', 'w') as f:
    for pro in client.products.list().items:
        if "Trial" in pro.name:
            f.write(f"{pro.name} - {pro.product_id}\n")
