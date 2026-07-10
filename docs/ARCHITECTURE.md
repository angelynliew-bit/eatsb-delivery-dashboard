# Architecture

## Stack
- **Frontend** Next.js 14 (App Router) — Vercel
- **Database + Auth** Supabase (Postgres + RLS)
- **File parsing** `xlsx` library (server-side API route)
- **Styling** Tailwind CSS + shadcn/ui
- **Export** server-streamed CSV response

## What is Built Now vs Later
**Now:** master data tables, import engine, monthly dashboard, drill-downs, filters, CSV export 
**Later:** auth/roles, audit log, inventory module, automated scheduled import, ERP integration

## Key User Action — Import Flow (step by step)
1. Operations staff selects an Excel/CSV file and clicks **Upload**.
2. Server API route parses the file using `xlsx`; returns a preview of first 10 rows.
3. Staff clicks **Import**; server validates every row against `channels`, `chains`, `stores`, `products` master tables.
4. Valid rows are upserted into `deliveries` and `delivery_items` using `source_row_id` as the unique key.
5. Invalid rows are written to `import_exceptions` with a field-level error message.
6. One `import_log` row is written with final counts and status.
7. Dashboard queries re-execute; summary cards and tables refresh from live database aggregates.
8. Operations staff sees import result and opens the exception list for any rejected rows.

## Layer Plan
1. **Data layer** — Postgres tables + constraints + RLS enforce all counting rules at database level.
2. **App logic layer** — Server API routes own import, validation, and upsert; all aggregation SQL runs server-side.
3. **Presentation layer** — Next.js pages render dashboard views; no business logic in components.
4. **Intelligence layer (later)** — Demand trend scoring and reorder suggestions sit on top; removing them does not break any core function.

## Counting Rules (enforced in SQL)
- Delivery count = `count(distinct delivery_ref)` filtered to `delivery_status = 'completed'`
- Units = `sum(units_delivered)` on `delivery_items`
- Product delivery count = `count(distinct delivery_id)` per product
- Reporting week derived from delivery date: days 1–7 = W1, 8–14 = W2, 15–21 = W3, 22–28 = W4, 29+ = W5
