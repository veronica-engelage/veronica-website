import json
import sys
from urllib import request

# Usage: python3 scripts/revalidate-paths.py http://localhost:3000 secret /neighborhoods /neighborhoods/old-village-mount-pleasant

def main():
    if len(sys.argv) < 4:
        print("Usage: python3 scripts/revalidate-paths.py <base_url> <secret> <path...>")
        sys.exit(1)

    base_url = sys.argv[1].rstrip("/")
    secret = sys.argv[2]
    paths = sys.argv[3:]

    payload = json.dumps({"secret": secret, "paths": paths}).encode("utf-8")

    req = request.Request(
        f"{base_url}/api/revalidate",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with request.urlopen(req) as resp:
        print(resp.read().decode("utf-8"))


if __name__ == "__main__":
    main()
