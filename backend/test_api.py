import urllib.request, json
try:
    req = urllib.request.Request('http://localhost:8000/api/jobs/test/hr_contacts', data=b'{"company":"Google"}', headers={'Content-Type': 'application/json'})
    res = urllib.request.urlopen(req)
    print(res.read().decode())
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print(e.read().decode())
