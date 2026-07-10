# Intelligence Layer

## v1 — Rule-Based Only
All metrics are deterministic SQL aggregations. No ML in v1.

## Messy Inputs Handled
- Store names that drift from master data → warning, not block (code is authoritative)
- Product names that drift → same warning
- Same product appearing multiple times in one delivery → summed units, one delivery counted
- Deleted spreadsheet rows → flagged for review, not auto-deleted

## Computed Fields (import time)
```json
{
  "delivery_month": 7,
  "delivery_year": 2026,
  "reporting_week": 2,
  "validation_status": "valid"
}
```
Week band rule: day 1–7 → W1, 8–14 → W2, 15–21 → W3, 22–28 → W4, 29+ → W5.

## Events to Track
- Row imported (valid/rejected)
- Delivery upserted (new/updated)
- Filter applied on dashboard
- Export triggered
- Exception acknowledged

## Scoring (Later)
- Delivery frequency score per store (deliveries ÷ weeks active)
- Volume trend: current month vs prior month per product/store
- Low-activity flag: store with zero deliveries in current week

## Ranking (Later)
- Highest-volume chain, store, product surfaced on summary cards
- Declining-volume products flagged for management review

## v1 vs Later
**v1:** week-band calc, duplicate detection, name-drift warnings, exception classification.
**Later:** trend scoring, low-stock flags, reorder quantity suggestions (rule-based before any ML).
