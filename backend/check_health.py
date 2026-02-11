import requests

URLS = [
    "https://jobninjas.ai/",
    "https://jobninjas.ai/api/health", # Assuming this exists or returns 404
    "https://jobninjas.ai/api/jobs"
]

for url in URLS:
    try:
        resp = requests.get(url, timeout=10)
        print(f"{url}: {resp.status_code}")
    except Exception as e:
        print(f"{url}: Error {e}")
