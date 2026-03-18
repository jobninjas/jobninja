import requests

print("Testing DELETE endpoint on localhost")
url = "http://localhost:8000/api/resumes/12345678-1234-1234-1234-123456789012"
response = requests.delete(url)
print(f"Status Code: {response.status_code}")
print(f"Response Body: {response.text}")
