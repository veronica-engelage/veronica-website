import argparse
import csv
import json
from pathlib import Path


def parse_args():
    p = argparse.ArgumentParser(description="Build current-month Sanity marketStatMonthly NDJSON.")
    p.add_argument("--core-current", required=True, help="Path to RDC_Inventory_Core_Metrics_Zip.csv")
    p.add_argument("--hotness-history", required=True, help="Path to RDC_Inventory_Hotness_Metrics_Zip_History.csv")
    p.add_argument("--zips", required=True, help="Comma list of ZIPs or path to a text file with ZIPs")
    p.add_argument("--out", required=True, help="Output NDJSON path")
    return p.parse_args()


def load_zips(zips_arg: str):
    p = Path(zips_arg)
    if p.exists():
        return sorted({line.strip() for line in p.read_text().splitlines() if line.strip()})
    return sorted({z.strip() for z in zips_arg.split(",") if z.strip()})


def to_num(v):
    if v is None:
        return None
    v = str(v).strip()
    if v == "":
        return None
    try:
        return float(v)
    except ValueError:
        return None


def main():
    args = parse_args()
    zips_needed = load_zips(args.zips)

    # Load hotness history into a lookup
    hot = {}
    with Path(args.hotness_history).open("r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            zipc = row.get("postal_code")
            if zipc not in zips_needed:
                continue
            month_raw = row.get("month_date_yyyymm", "")
            if len(month_raw) < 6:
                continue
            month = f"{month_raw[0:4]}-{month_raw[4:6]}"
            hot[(zipc, month)] = {
                "marketHotnessScore": row.get("hotness_score"),
                "marketHotnessRank": row.get("hotness_rank"),
            }

    out_path = Path(args.out)
    count = 0
    with Path(args.core_current).open("r", newline="", encoding="utf-8") as f, out_path.open(
        "w", encoding="utf-8"
    ) as g:
        reader = csv.DictReader(f)
        for row in reader:
            zipc = row.get("postal_code")
            if zipc not in zips_needed:
                continue
            month_raw = row.get("month_date_yyyymm", "")
            if len(month_raw) < 6:
                continue
            month = f"{month_raw[0:4]}-{month_raw[4:6]}"

            h = hot.get((zipc, month), {})

            doc = {
                "_type": "marketStatMonthly",
                "zip": zipc,
                "month": month,
                "medianListingPrice": to_num(row.get("median_listing_price")),
                "medianListingPriceYoY": to_num(row.get("median_listing_price_yy")),
                "medianListingPriceMoM": to_num(row.get("median_listing_price_mm")),
                "pricePerSqft": to_num(row.get("median_listing_price_per_square_foot")),
                "activeListingCount": to_num(row.get("active_listing_count")),
                "activeListingCountYoY": to_num(row.get("active_listing_count_yy")),
                "pendingListingCount": to_num(row.get("pending_listing_count")),
                "medianDaysOnMarket": to_num(row.get("median_days_on_market")),
                "inventoryMonths": None,
                "marketHotnessScore": to_num(h.get("marketHotnessScore")),
                "marketHotnessRank": to_num(h.get("marketHotnessRank")),
                "sourceLabel": "Realtor.com® Economic Research",
                "sourceUrl": "https://www.realtor.com/research/data/",
                "notes": "Imported from current-month ZIP dataset",
            }

            g.write(json.dumps(doc, ensure_ascii=False) + "\n")
            count += 1

    print(f"Wrote {count} documents to {out_path}")


if __name__ == "__main__":
    main()
