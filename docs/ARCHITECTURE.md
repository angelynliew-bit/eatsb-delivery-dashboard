# Architecture

## Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Database:** Supabase (Postgres + RLS)
- **File storage:** Supabase Storage (uploaded spreadsheets)
- **Hosting:** Vercel
- **Spreadsheet parsing:** SheetJS (xlsx) in a Next.js API route

## Now vs Later
**Now:** master data CRUD, spreadsheet import engine, monthly/weekly dashboard, chain→store→product and product→chain→store drill-downs, export.
**Later:** inventory stock levels, stock-cover weeks, reorder alerts, accounting integration.

## Key Action Flow — Spreadsheet Import
1. Operations user selects an Excel/CSV file in the Import screen.
2. Browser sends file to `/api/import` (Next.js API route).
3. SheetJS parses each row into a typed object.
4. API validates every row against master data (store codes, product codes, chain-store and channel-chain relationships).
5. Valid rows are upserted into `delivery_items` (keyed on `source_row_id`, fallback: `delivery_ref + product_code + line_number`); `deliveries` header rows upserted in parallel.
6. Invalid rows written to `import_exceptions` with error reason.
7. `import_logs` record is created: counts of processed / inserted / updated / rejected.
8. Dashboard queries read from `delivery_items` with pre-aggregated views — no runtime spreadsheet parsing.

## Layer Plan
1. **Database** — tables, constraints, RLS policies (truth lives here).
2. **App logic** — import engine, counting rules (distinct delivery refs), week-band calculation (1–7→W1 … 29+→W5).
3. **Smart features** — demand trend flags, reorder suggestions (later sprints).

The dashboard and import engine work entirely without any AI component.
