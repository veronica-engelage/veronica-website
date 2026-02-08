#!/usr/bin/env python3
import csv
import json
import os
import urllib.parse
import urllib.request

PROJECT_ID = "uyzjzo0o"
DATASET = "production"
API_VERSION = "2026-02-04"

CSV_PATH = "/Users/veronicaengelage/Projects/veronica-website/CharlestonNeighborhoodsGuide.cleaned.csv"
TOKEN = os.environ.get("SANITY_AUTH_TOKEN")

if not TOKEN:
    raise SystemExit("Missing SANITY_AUTH_TOKEN")


def fetch_docs(slugs):
    query = '*[_type == "neighborhood" && slug.current in $slugs]{ "slug": slug.current, summary, faqs[]{question, answer} }'
    url = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/query/{DATASET}"
    body = json.dumps({"query": query, "params": {"slugs": slugs}}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.load(resp)
    return data.get("result", [])


def csv_rows(path):
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


def faq_count_from_csv(text):
    if not text:
        return 0
    return text.count("\nQ: ") + 1


def main():
    rows = csv_rows(CSV_PATH)
    slugs = [r.get("slug", "").strip() for r in rows if r.get("slug")]

    docs_by_slug = {}
    chunk_size = 50
    for i in range(0, len(slugs), chunk_size):
        chunk = slugs[i : i + chunk_size]
        for doc in fetch_docs(chunk):
            if doc.get("slug"):
                docs_by_slug[doc["slug"]] = doc

    missing = []
    mismatches = []

    for row in rows:
        slug = (row.get("slug") or "").strip()
        if not slug:
            continue
        doc = docs_by_slug.get(slug)
        if not doc:
            missing.append(slug)
            continue
        if (doc.get("summary") or "") != (row.get("summary") or ""):
            mismatches.append({"slug": slug, "field": "summary"})
        csv_faqs = faq_count_from_csv(row.get("faqs") or "")
        doc_faqs = len(doc.get("faqs") or [])
        if csv_faqs != doc_faqs:
            mismatches.append({"slug": slug, "field": "faqs"})

    print(f"Checked {len(rows)} CSV rows")
    print(f"Missing docs in Sanity: {len(missing)}")
    if missing:
        print(missing[:20])
    print(f"Mismatches: {len(mismatches)}")
    if mismatches:
        print(mismatches[:20])


if __name__ == "__main__":
    main()
