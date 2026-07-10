# PRD — Order and Delivery Tracking Dashboard

## Problem
East Asian Traders tracks deliveries on a physical whiteboard. There is no consolidated view across channels, chains, stores, products, weeks, or months. Stock shortages occur because product movement is invisible until it is too late.

## Target Users
- **Management** — monthly performance review, stock-purchase decisions
- **Operations staff** — daily import, exception correction, record search
- **Sales / merchandising** — store delivery history, product distribution by chain

## Core Objects
`channel` → `chain` → `store` → `delivery` → `delivery_item` ← `product`
`import_log` → `import_exception`

## MVP Must-Haves
- [ ] CSV/Excel file upload with row-level preview
- [ ] Validation: reject missing refs, unknown store/product codes, invalid dates, negative units
- [ ] Upsert logic: insert new, update changed, skip unchanged, flag cancelled; no duplicate delivery items
- [ ] Import log (counts: processed / inserted / updated / rejected) and exception list
- [ ] Monthly overview: summary cards + Week 1–5 breakdown table + weekly chart
- [ ] Channel, chain, store, and product breakdown tables
- [ ] Chain → Store → Product drill-down with weekly matrix cells (deliveries + units)
- [ ] Product → Chain → Store drill-down with weekly matrix cells
- [ ] Delivery-level detail table
- [ ] Linked filters: month, week, channel → chain → store, brand → product, status
- [ ] CSV export for every filtered table
- [ ] Last-updated timestamp visible on dashboard
- [ ] All screens viewable without login (demo-first); auth added in lock-down sprint

## Non-Goals (v1)
Inventory levels, purchase orders, stock cover, reorder suggestions, route planning, driver management, invoice generation, AI forecasting.

## Success Criterion
An operations user uploads a 20-row delivery spreadsheet for July 2026. The system rejects 2 invalid rows (listed in exceptions), inserts 18 new delivery-item records, and the monthly dashboard immediately reflects the correct delivery counts, unit totals, and weekly breakdown — without any manual calculation.
