import dodopayments
import inspect
from dodopayments import DodoPayments
client = DodoPayments(bearer_token="VlSrQp7v8yEwy3UB.Lzvf3GZC-wqETu11N-S8paVhoWjfyJfUHmPVDi-6g8HrvTaC")
try:
    print("Does client have products?", hasattr(client, "products"))
    if hasattr(client, "products"):
        sig = inspect.signature(client.products.create)
        for name, param in sig.parameters.items():
            print(f"{name}: {param.annotation}")
except Exception as e:
    print(repr(e))
