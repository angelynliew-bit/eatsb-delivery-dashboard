# Intelligence Layer

## Messy Inputs
- Spreadsheet store names drift ("AEON Mid Valley" vs "Aeon MidValley") → authoritative `store_code` is the match key
- Product names abbreviated inconsistently → `product_code` / SKU is the match key
- Carton quantities entered instead of units → validation rejects non-numeric; warning if units suspiciously round (e.g. multiples of 24)
- Missing delivery ref → hard block

## Auto-Structure on Import (server-side, rule-based)
```json
{
  "source_row_id": "ROW-2026-07-0042",
  "resolved_store_id": "uuid",
  "resolved_product_id": "uuid",
  "reporting_week": 2,
  "delivery_month": 7,
  "delivery_year": 2026,
  "validation_status": "valid",
  "warnings": ["store_name_mismatch"]
}
```

## Events Tracked
- Row imported (valid / rejected / skipped)
- Delivery item upserted
- Import log created
- Exception flagged
- Export generated

## Scoring Rules (v1 — rule-based, no ML)
- **Store delivery frequency score** = deliveries in period ÷ weeks in period (shows cadence)
- **Product concentration** = units to top store ÷ total units for product (flags dependency)
- **Week-on-week delta** = (this week units − last week units) ÷ last week units × 100

All scores are calculated in SQL at query time; no stored AI fields in v1.

## What Gets Ranked
- Chains by total units (descending)
- Stores by delivery frequency
- Products by units delivered
- Weeks by units for trend display

## v1 vs Later
**v1:** all scoring is deterministic SQL — no AI dependency. 
**Later:** predicted weekly demand field on `products` table → store as `predicted_units_next_week numeric`, `predicted_units_source text`, `predicted_units_confidence numeric`, `predicted_units_review_status text default 'unreviewed'`.
