# PRD — Order & Delivery Tracking Dashboard

## Problem
East Asian Traders tracks deliveries on a physical whiteboard — one chain at a time, no consolidated view, no weekly breakdown, no unit-level data. Stock-outs happen because demand patterns are invisible.

## Target Users
- **Management** — monthly performance review, stock purchase planning
- **Operations staff** — daily spreadsheet import, exception review
- **Sales/merchandising** — store delivery history, product distribution

## Core Objects
`channels` → `chains` → `stores` → `deliveries` → `delivery_items` ← `products`
Supporting: `orders`, `import_logs`, `import_exceptions`

## MVP Must-Haves
- [ ] Master data screens: channels, chains, stores, products (CRUD)
- [ ] Spreadsheet upload → validate → preview → import (upsert, no duplicates)
- [ ] Import log showing rows processed / inserted / updated / rejected
- [ ] Import exception list with row-level error detail
- [ ] Monthly overview dashboard: 7 summary cards + weekly breakdown table (Weeks 1–5)
- [ ] Channel, chain, store, product breakdown tables
- [ ] Chain → Store → Product drill-down with weekly cells
- [ ] Product → Chain → Store drill-down with weekly cells
- [ ] Delivery-level detail view
- [ ] Linked filters (month, week, channel, chain, store, brand, product, status)
- [ ] CSV export of any filtered table
- [ ] Last-updated timestamp visible on every dashboard page

## Non-Goals (v1)
Inventory levels, stock-cover calculations, reorder suggestions, route/driver management, invoice generation, AI forecasting, multi-tenant SaaS.

## Success Criteria
An operations user uploads the week's spreadsheet; the system validates rows, rejects unknowns, upserts valid records, and the monthly dashboard immediately shows the correct unique-delivery count, total units, and per-week breakdown — matching a manual tally of the source file.
