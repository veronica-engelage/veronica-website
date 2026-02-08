import argparse
import json
import os
import sys
from pathlib import Path
from urllib import request, parse


def parse_args():
    p = argparse.ArgumentParser(description="Build ZIP centroid map using Mapbox Geocoding.")
    p.add_argument("--zips", required=True, help="Comma list of ZIPs or path to text file with one ZIP per line")
    p.add_argument("--token", required=True, help="Mapbox public token")
    p.add_argument("--out", required=True, help="Output JSON file")
    return p.parse_args()


def load_zips(zips_arg: str):
    p = Path(zips_arg)
    if p.exists():
        return sorted({line.strip() for line in p.read_text().splitlines() if line.strip()})
    return sorted({z.strip() for z in zips_arg.split(",") if z.strip()})


def geocode_zip(zipc: str, token: str):
    url = (
        "https://api.mapbox.com/geocoding/v5/mapbox.places/"
        + parse.quote(zipc)
        + ".json?types=postcode&country=US&limit=1&access_token="
        + parse.quote(token)
    )
    with request.urlopen(url, timeout=20) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    features = data.get("features", [])
    if not features:
        return None
    center = features[0].get("center")
    if not center or len(center) != 2:
        return None
    # center is [lng, lat]
    return {"lng": center[0], "lat": center[1]}


def main():
    args = parse_args()
    zips = load_zips(args.zips)
    out = {}
    for z in zips:
        try:
            coord = geocode_zip(z, args.token)
            if coord:
                out[z] = coord
                print(f"{z}: {coord['lat']}, {coord['lng']}")
            else:
                print(f"{z}: no result", file=sys.stderr)
        except Exception as e:
            print(f"{z}: error {e}", file=sys.stderr)
    Path(args.out).write_text(json.dumps(out, indent=2), encoding="utf-8")
    print(f"Wrote {len(out)} ZIP centroids to {args.out}")


if __name__ == "__main__":
    main()
