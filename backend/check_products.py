import json
import os
from dodopayments import DodoPayments
client = DodoPayments(bearer_token="VlSrQp7v8yEwy3UB.Lzvf3GZC-wqETu11N-S8paVhoWjfyJfUHmPVDi-6g8HrvTaC")
products = client.products.list()
for p in products.items:
    print(f"Product: {p.name}")
    print(p.model_dump_json(indent=2))
