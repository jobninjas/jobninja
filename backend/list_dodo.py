import json
import os
from dodopayments import DodoPayments
client = DodoPayments(bearer_token="VlSrQp7v8yEwy3UB.Lzvf3GZC-wqETu11N-S8paVhoWjfyJfUHmPVDi-6g8HrvTaC")
products = client.products.list()
res = {p.name: p.product_id for p in products.items}
with open("dodo_products.json", "w") as f:
    json.dump(res, f)
