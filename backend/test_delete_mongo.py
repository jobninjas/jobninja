import requests

print("Testing DELETE endpoint on localhost with legacy MongoDB ID")
url = "http://localhost:8000/api/resumes/65f0123456789abcdef01234"
response = requests.delete(url)
print(f"Status Code: {response.status_code}")
print(f"Response Body: {response.text}")
