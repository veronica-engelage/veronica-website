#!/usr/bin/env python3
import csv, json, re, uuid, urllib.parse, urllib.request, os, sys
from pathlib import Path

PROJECT_ID = 'uyzjzo0o'
DATASET = 'production'
API_VERSION = '2024-06-01'

CSV_PATH = Path(os.environ.get('NEIGHBORHOOD_COPY_CSV', '/Users/veronicaengelage/Projects/veronica-website/CharlestonNeighborhoodsGuide.cleaned.csv'))
OUT_PATH = Path(os.environ.get('NEIGHBORHOOD_COPY_NDJSON', '/Users/veronicaengelage/Projects/veronica-website/neighborhood-copy-88.patches.ndjson'))
TOKEN = os.environ.get('SANITY_AUTH_TOKEN')

if not CSV_PATH.exists():
    raise SystemExit(f'CSV not found: {CSV_PATH}')
if not TOKEN:
    raise SystemExit('Missing SANITY_AUTH_TOKEN')

def fetch_slug_map():
    out = {}

    def merge_results(results):
        for doc in results:
            slug = doc.get('slug')
            doc_id = doc.get('_id')
            if slug and doc_id:
                out.setdefault(slug, []).append(doc_id)

    # Published docs
    query_pub = '*[_type == "neighborhood" && !(_id match "drafts.*")]{_id, "slug": slug.current}'
    url_pub = (
        f'https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/query/{DATASET}'
        f'?query={urllib.parse.quote(query_pub)}&perspective=published'
    )
    req_pub = urllib.request.Request(url_pub, headers={'Authorization': f'Bearer {TOKEN}'})
    with urllib.request.urlopen(req_pub, timeout=30) as resp:
        data_pub = json.load(resp)
    merge_results(data_pub.get('result', []))

    # Draft docs (explicit)
    query_draft = '*[_type == "neighborhood" && _id match "drafts.*"]{_id, "slug": slug.current}'
    url_draft = (
        f'https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/query/{DATASET}'
        f'?query={urllib.parse.quote(query_draft)}&perspective=drafts'
    )
    req_draft = urllib.request.Request(url_draft, headers={'Authorization': f'Bearer {TOKEN}'})
    with urllib.request.urlopen(req_draft, timeout=30) as resp:
        data_draft = json.load(resp)
    merge_results(data_draft.get('result', []))

    return out

faq_split_re = re.compile(r'\n?Q:\s*', re.MULTILINE)

def parse_faqs(text):
    text = (text or '').strip()
    if not text:
        return []
    if not text.lstrip().startswith('Q:'):
        return []
    parts = faq_split_re.split(text)
    faqs = []
    for part in parts:
        if not part.strip():
            continue
        if 'A:' in part:
            q, a = part.split('A:', 1)
            faqs.append({'q': q.strip(), 'a': a.strip()})
        else:
            faqs.append({'q': part.strip(), 'a': ''})
    return faqs


def text_to_blocks(text):
    text = (text or '').strip()
    if not text:
        return None
    parts = [p.strip() for p in re.split(r'\n\s*\n', text) if p.strip()]
    blocks = []
    for p in parts:
        blocks.append({
            '_type': 'block',
            '_key': uuid.uuid4().hex,
            'style': 'normal',
            'children': [
                {
                    '_type': 'span',
                    '_key': uuid.uuid4().hex,
                    'text': p,
                }
            ],
        })
    return blocks

slug_to_ids = fetch_slug_map()

rows = []
with CSV_PATH.open('r', encoding='utf-8-sig', newline='') as f:
    reader = csv.DictReader(f)
    for row in reader:
        rows.append(row)

patches = []
missing = []
for r in rows:
    slug = (r.get('slug') or '').strip()
    doc_ids = slug_to_ids.get(slug)
    if not doc_ids:
        missing.append(slug or r.get('name',''))
        continue

    faqs = parse_faqs(r.get('faqs',''))
    faq_items = [{'_type':'faqItem','_key':uuid.uuid4().hex,'question':f['q'],'answer':f['a']} for f in faqs]

    for doc_id in doc_ids:
        patch = {
            'patch': {
                'id': doc_id,
                'set': {
                    'summary': r.get('summary','') or None,
                    'overview': text_to_blocks(r.get('overview','')),
                    'lifestyle': text_to_blocks(r.get('lifestyle','')),
                    'buyerInsights': text_to_blocks(r.get('buyerInsights','')),
                    'sellerInsights': text_to_blocks(r.get('sellerInsights','')),
                    'highlights': [h.strip() for h in (r.get('highlights','') or '').split(',') if h.strip()],
                    'amenities': [a.strip() for a in (r.get('amenities','') or '').split(',') if a.strip()],
                    'faqs': faq_items,
                    'bestFor': r.get('bestFor','') or None,
                },
            }
        }
        patches.append(patch)

with OUT_PATH.open('w', encoding='utf-8') as f:
    for p in patches:
        mutation = {"_type": "mutation", "mutations": [p]}
        f.write(json.dumps(mutation))
        f.write('\n')

print(f'Wrote {len(patches)} patches to {OUT_PATH}')
if missing:
    print('Missing slugs:', missing[:20], '... total', len(missing))
