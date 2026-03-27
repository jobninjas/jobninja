import urllib.request
from urllib.error import HTTPError
import json

try:
    req = urllib.request.Request("http://127.0.0.1:8000/api/jobs")
    res = urllib.request.urlopen(req)
    print(res.read().decode())
except HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(e.read().decode())
except Exception as e:
    print("Other error:", e)
