import urllib.request
import json
import urllib.error

url = "http://localhost:8000/api/dodo-checkout"
data = json.dumps({"plan_id": "ai-yearly"}).encode('utf-8')
headers = {'Content-Type': 'application/json', 'token': 'dummy_token'}
req = urllib.request.Request(url, data=data, headers=headers, method='POST')

try:
    response = urllib.request.urlopen(req)
    print("Success:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
except Exception as e:
    print("Error:", e)
