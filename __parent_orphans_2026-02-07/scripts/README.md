# Market Stats Import Helper

This helper converts Realtor.com ZIP history CSVs into Sanity NDJSON.

## Usage

```bash
python3 scripts/build-market-stats-ndjson.py \
  --core-history /path/to/RDC_Inventory_Core_Metrics_Zip_History.csv \
  --hotness-history /path/to/RDC_Inventory_Hotness_Metrics_Zip_History.csv \
  --zips 29401,29403,29407 \
  --out /path/to/market-stats.ndjson
```

You can also pass a text file for `--zips` with one ZIP per line.

## Import into Sanity

```bash
XDG_CONFIG_HOME=/Users/veronicaengelage/Projects/veronica-website/.config \
SANITY_AUTH_TOKEN=YOUR_TOKEN \
npx sanity dataset import /path/to/market-stats.ndjson production
```

## Current Month Helper

```bash
python3 scripts/build-current-month-ndjson.py \
  --core-current /path/to/RDC_Inventory_Core_Metrics_Zip.csv \
  --hotness-history /path/to/RDC_Inventory_Hotness_Metrics_Zip_History.csv \
  --zips /path/to/zips.txt \
  --out /path/to/current-month.ndjson
```

Import the file the same way via `npx sanity dataset import`.

## Revalidate Helper

Add `REVALIDATE_SECRET` to `.env.local` in the Next app.

```bash
REVALIDATE_SECRET=your-secret
```

Then trigger a refresh:

```bash
python3 scripts/revalidate-paths.py http://localhost:3000 your-secret /neighborhoods /neighborhoods/old-village-mount-pleasant
```
