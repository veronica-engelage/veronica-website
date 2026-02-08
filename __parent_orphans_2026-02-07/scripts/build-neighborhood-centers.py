import argparse
import json
from pathlib import Path
from urllib import request, parse

CHARLESTON_BBOX = "-80.3,32.5,-79.4,33.1"  # coarse bbox to keep results local
PROXIMITY = "-79.9311,32.7765"  # downtown Charleston


def parse_args():
    p = argparse.ArgumentParser(description="Geocode neighborhood centers and emit patch NDJSON.")
    p.add_argument("--mapbox-token", required=True, help="Mapbox public token")
    p.add_argument("--input", required=True, help="Path to neighborhoods NDJSON (with name/municipality/slug)")
    p.add_argument("--out", required=True, help="Output NDJSON patch file")
    p.add_argument("--dry-run", action="store_true", help="Do not write file, only print results")
    return p.parse_args()


def http_get_json(url, headers=None):
    req = request.Request(url, headers=headers or {})
    try:
        with request.urlopen(req, timeout=20) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        if hasattr(e, "read"):
            try:
                body = e.read().decode("utf-8")
                print("Sanity error body:", body)
            except Exception:
                pass
        raise


def map_city(municipality: str) -> str:
    if municipality in {"Charleston Peninsula", "West Ashley", "James Island", "Johns Island"}:
        return "Charleston, SC"
    return f"{municipality}, SC"


def geocode_center(name: str, municipality: str, token: str):
    query = f"{name}, {map_city(municipality)}"
    url = (
        "https://api.mapbox.com/geocoding/v5/mapbox.places/"
        + parse.quote(query)
        + ".json?types=neighborhood,place,locality&limit=1"
        + f"&bbox={CHARLESTON_BBOX}&proximity={PROXIMITY}"
        + "&country=US"
        + "&access_token="
        + parse.quote(token)
    )
    data = http_get_json(url)
    features = data.get("features", [])
    if not features:
        return None
    center = features[0].get("center")
    if not center or len(center) != 2:
        return None
    return {"lng": center[0], "lat": center[1], "label": features[0].get("place_name")}


def make_patch(slug, lat, lng):
    return {
        "_type": "mutation",
        "patch": {
            "query": '*[_type=="neighborhood" && slug.current==$slug]',
            "params": {"slug": slug},
            "set": {
                "map": {
                    "centerLat": lat,
                    "centerLng": lng,
                }
            },
        },
    }


def main():
    args = parse_args()
    rows = []
    with Path(args.input).open("r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            rows.append(json.loads(line))

    patches = []
    for row in rows:
        name = row.get("name")
        muni = row.get("municipality")
        slug = row.get("slug", {}).get("current") if isinstance(row.get("slug"), dict) else None
        if not name or not muni or not slug:
            continue

        center = geocode_center(name, muni, args.mapbox_token)
        if not center:
            print(f"No result: {name} ({muni})")
            continue

        if args.dry_run:
            print(f"{name} -> {center['lat']}, {center['lng']} | {center.get('label')}")
            continue

        patches.append(make_patch(slug, center["lat"], center["lng"]))
        print(f"Prepared patch for {name} -> {center['lat']}, {center['lng']}")

    if not args.dry_run:
        Path(args.out).write_text(
            "\n".join(json.dumps(p, ensure_ascii=False) for p in patches),
            encoding="utf-8",
        )
        print(f"Wrote {len(patches)} patches to {args.out}")


if __name__ == "__main__":
    main()
