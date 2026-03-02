from dodopayments import DodoPayments
import inspect
client = DodoPayments(bearer_token="VlSrQp7v8yEwy3UB.Lzvf3GZC-wqETu11N-S8paVhoWjfyJfUHmPVDi-6g8HrvTaC")
print(inspect.signature(client.subscriptions.create))
for name, param in inspect.signature(client.subscriptions.create).parameters.items():
    print(name, param.annotation)
