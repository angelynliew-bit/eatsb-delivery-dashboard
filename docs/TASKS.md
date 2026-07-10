# Tasks & Sprints

## Sprint 1 — Database & Master Data CRUD
**Goal:** All tables exist; channels, chains, stores, products can be created, edited, and listed. App renders with seed data — no login required.

- [ ] Apply migration SQL (all tables, RLS v1 policies, seed data)
- [ ] `/master-data/channels` — list + create + edit channel
- [ ] `/master-data/chains` — list + create + edit chain (linked to channel)
- [ ] `/master-data/stores` — list + create + edit store (linked to chain)
- [ ] `/master-data/products` — list + create + edit product
- [ ] Empty, loading, and error states on all list screens
- [ ] Confirm each form persists to DB and list reflects change on reload

**Definition of Done:** All four master-data lists render seed rows; a new store can be created and immediately appears in the list after a hard refresh.

---

## Sprint 2 — Import Engine (Core Engine) ★ v1 functional milestone
**Goal:** Spreadsheet upload → validate → preview → commit → import log. This is the app's core action.

- [ ] `/import` screen: file picker (xlsx/csv), upload button
- [ ] `POST /api/import/preview` — parse with SheetJS, validate all rows, return preview JSON (valid rows, rejected rows with reasons)
- [ ] Preview table: valid rows green, rejected rows red with error detail
- [ ] `POST /api/import/commit` — upsert deliveries + delivery_items (keyed on source_row_id; fallback delivery_ref+product_code+line_number); write import_log
- [ ] Duplicate row → update not insert; unchanged row → skip
- [ ] `/import-history` — list import_logs with counts
- [ ] `/import-exceptions` — list rejected rows per import log, with raw_data and error_detail
- [ ] All states: uploading, validating, previewing, committing, done, error

**Definition of Done:** Upload a 20-row test file with 2 invalid rows → preview shows 18 green / 2 red → commit → import_log shows 18 inserted / 2 rejected → re-upload same file → import_log shows 0 inserted / 18 updated / 2 rejected (no new rows created).

---

## Sprint 3 — Monthly Overview Dashboard
**Goal:** Main dashboard shows 7 summary cards + weekly breakdown table + channel/chain/store/product breakdown tables.

- [ ] `/` (homepage) — monthly overview, default = current month
- [ ] Summary cards: total unique deliveries, total units, chains served, stores served, products delivered, avg units/delivery, last import timestamp
- [ ] Weekly summary table (W1–W5): deliveries + units columns
- [ ] Bar/line chart toggle (deliveries vs units) by week
- [ ] Channel breakdown table
- [ ] Chain breakdown table
- [ ] Store breakdown table
- [ ] Product breakdown table
- [ ] Month filter; all other filters (channel, chain, store, brand, product, status, date range, week)
- [ ] Linked filter behaviour: channel limits chain; chain limits store; brand limits product
- [ ] Loading skeleton, empty state (no deliveries for selected period), error state

**Definition of Done:** Select any month with seed data → all 7 cards show correct numbers confirmed against direct DB count queries; weekly totals sum to monthly total.

---

## Sprint 4 — Drill-Down Views & Export
**Goal:** Chain→Store→Product and Product→Chain→Store drill-downs; delivery-level detail; CSV export.

- [ ] `/chain/[id]` — chain summary cards + store-by-week table (cells: deliveries + units) + product table
- [ ] `/chain/[id]/store/[storeId]` — store summary + product-by-week table + delivery-level detail table
- [ ] `/product/[id]` — product summary cards + chain-by-week table
- [ ] `/product/[id]/chain/[chainId]` — chain summary + store-by-week table (product-scoped only)
- [ ] Delivery-level detail table: date, delivery_ref, product, units; optional columns toggle
- [ ] CSV export button on every table (exports all rows matching active filters)
- [ ] Breadcrumb navigation on all drill-down pages
- [ ] All states: loading, empty (no deliveries), error

**Definition of Done:** Navigate chain → store → product → see delivery records; counts match the overview dashboard for the same month and filters; CSV download contains correct columns and row count.

---

## Sprint 5 — Lock It Down (Auth & Per-User RLS)
**Goal:** Real login; role-based access; data isolated to authenticated users.

- [ ] Enable Supabase Auth; add login/signup pages
- [ ] `profiles` table with `role` column (administrator/management/operations/read_only)
- [ ] Replace v1 permissive RLS policies with `auth.uid() = user_id` owner policies on all tables
- [ ] Server-side role checks in API routes; UI hides restricted actions
- [ ] User management screen (administrator only)
- [ ] Smoke-test all screens still work post-RLS change

**Definition of Done:** Unauthenticated request to `/api/import/commit` returns 401; management-role user cannot access master-data edit screens; operations-role user can upload and view but not edit master data.

---

## Gantt (Sprint → Weeks)
```
Sprint 1 — Master Data CRUD        Week 1
Sprint 2 — Import Engine ★          Week 2–3
Sprint 3 — Monthly Dashboard        Week 4
Sprint 4 — Drill-Downs & Export     Week 5–6
Sprint 5 — Lock It Down             Week 7
```
