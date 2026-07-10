# Tasks

## Sprint 1 — Database foundation and master data
**Goal:** All tables exist, constraints enforced, demo data visible without login.
- [ ] Create migration SQL: channels, chains, stores, products, orders, deliveries, delivery_items
- [ ] Create import_logs, import_exceptions, audit_logs tables
- [ ] Enable RLS on all tables; add permissive v1 policies
- [ ] Seed 3 channels, 4 chains, 6 stores, 6 products, 6 deliveries, 13 delivery items
- [ ] Verify: `select count(*) from delivery_items` returns 13 without auth
- [ ] Scaffold Next.js project with Supabase client; confirm env vars load

**Definition of Done:** All tables created; demo rows readable via Supabase table editor and via the app's Supabase client without a session token.

---

## Sprint 2 — Spreadsheet import engine *(core engine)*
**Goal:** Upload a file → valid rows land in the database → invalid rows listed with reasons.
- [ ] File upload component (CSV + xlsx accepted; max 10 MB)
- [ ] Server API route: parse file with `xlsx` library, return row preview (first 10 rows)
- [ ] Validation logic: missing delivery_ref, invalid date, unknown store_code, unknown product_code, non-numeric or negative units, invalid status, chain-store mismatch
- [ ] Upsert: match on `source_row_id`; fallback `delivery_ref + product_code + line_number`; insert new, update changed, skip unchanged
- [ ] Write `import_log` (counts + status + timestamp)
- [ ] Write `import_exceptions` for each rejected row (field-level error message)
- [ ] Import result screen: counts summary + scrollable exception table
- [ ] Loading state during parse and import; error state if server fails

**Definition of Done:** Upload a 20-row test file with 2 known-bad rows → 18 items upserted → 2 exceptions listed with correct error types → re-upload same file → 0 new rows inserted (all skipped).

---

## Sprint 3 — Monthly overview dashboard ✦ v1 functional milestone ✦
**Goal:** The main dashboard renders correct live data for demo and real imports.
- [ ] Summary cards: total deliveries, total units, chains served, stores served, products delivered, avg units/delivery, last-updated timestamp
- [ ] Weekly breakdown table (W1–W5) sourced from `delivery_month` + `reporting_week`
- [ ] Bar chart with toggle: deliveries vs units by week
- [ ] Channel breakdown table (deliveries, units, chains, stores)
- [ ] Chain breakdown table (deliveries, units, stores served, products delivered)
- [ ] Store breakdown table (deliveries, units, products delivered)
- [ ] Product breakdown table (deliveries, units, chains, stores)
- [ ] Month filter (default: current month); delivery_status filter (default: completed)
- [ ] Loading skeleton, empty state ("No deliveries for selected month"), error state on all tables
- [ ] Homepage renders demo data without login

**Definition of Done:** Open app URL unauthenticated → see July 2026 dashboard with correct aggregates from seed data; import a new file → cards update; select a different month with no data → empty state shown (not blank page).

---

## Sprint 4 — Drill-down views and filters
**Goal:** Chain → Store → Product and Product → Chain → Store paths fully navigable.
- [ ] Chain detail page: summary cards + chain-by-store weekly matrix (deliveries + units per cell)
- [ ] Store detail within chain: store-by-product weekly matrix + delivery-level detail table
- [ ] Product detail page: summary cards + product-by-chain weekly matrix + product-by-chain-by-store matrix
- [ ] Delivery-level detail table (date, ref, product, units; optional: order number, status, invoice)
- [ ] Linked filter panel: channel → chain → store cascade; brand → product cascade
- [ ] Additional filters: date range, week, location, state, SKU, delivery status
- [ ] Search bar: delivery ref, order number, store name/code, chain, product name/code
- [ ] Sort on all breakdown columns
- [ ] All new screens: loading, empty, error states

**Definition of Done:** Navigate chain AEON → store AEON Mid Valley → W1 cell shows 1 delivery / 54 units (matching seed data counting rules); product filter limits matrix to selected product only.

---

## Sprint 5 — Export, import history, and master data screens
**Goal:** Staff can export any table and review all past imports.
- [ ] CSV export button on every filtered table (server-streamed; delivery and units columns separate)
- [ ] Import history screen: paginated list of import_logs (file name, status, counts, timestamp)
- [ ] Import exceptions screen: filterable list by import_log, severity, error_type
- [ ] Master data screens: channels, chains, stores, products (read-only list views)
- [ ] Delivery records screen: searchable full delivery list with all filters applied
- [ ] Empty state on import history when no imports yet

**Definition of Done:** Filter dashboard to W2 July 2026 → click Export → CSV downloads with correct rows and column headers; import history shows both seed import logs.

---

## Sprint 6 — Lock it down
**Goal:** Real users can log in; access is restricted by role; demo remains visible.
- [ ] Supabase Auth: email/password login and signup
- [ ] `profiles` table: `user_id`, `role` (admin/management/operations/readonly)
- [ ] Replace permissive RLS with owner/role-scoped policies on all tables
- [ ] Upload route: require authenticated session with Operations or Admin role
- [ ] Master data edit: Admin only
- [ ] User management screen (Admin): list users, assign roles
- [ ] Audit log writes for: import, upsert batch, bulk delete, role change
- [ ] Public demo route `/demo` remains readable without login using read-only seed data

**Definition of Done:** Unauthenticated request to POST `/api/import` returns 401; logged-in Read-Only user can view dashboard but sees no upload button; Admin can change another user's role and the change appears in audit_logs.

---

## Gantt (sprint → calendar week estimate)
```
Sprint 1 — DB foundation         W1
Sprint 2 — Import engine         W2
Sprint 3 — Overview dashboard    W3      ← v1 functional
Sprint 4 — Drill-downs           W4
Sprint 5 — Export & history      W5
Sprint 6 — Lock it down          W6
```
