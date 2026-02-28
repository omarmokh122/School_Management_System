import urllib.request
import json

try:
    req = urllib.request.Request("http://127.0.0.1:8000/api/v1/teachers")
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Body:", response.read().decode())
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print("Error Body:", e.read().decode())
