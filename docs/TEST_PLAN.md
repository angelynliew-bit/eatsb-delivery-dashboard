# Test Plan

## Success Scenario (manual walkthrough)
1. Open `/master-data/stores` → confirm seed stores list loads (not empty, not error).
2. Create a new store; hard-refresh → new store appears.
3. Open `/import` → upload `test_20rows_2invalid.xlsx`.
4. Preview: confirm 18 rows shown green, 2 rows shown red with specific error reasons (e.g. "Unknown store code").
5. Click Commit → success toast → open Import History → find log row showing processed=20, inserted=18, rejected=2.
6. Open Import Exceptions → confirm 2 rows with raw data and error detail.
7. Re-upload same file → log shows updated=18, inserted=0, rejected=2. No duplicate delivery_items created.
8. Open `/` (dashboard) → select the test month → verify 7 summary cards. Cross-check "Total Units" card against `SELECT SUM(units_delivered) FROM delivery_items` in Supabase SQL editor.
9. Verify weekly table: W1+W2+W3+W4+W5 total = card total.
10. Click a chain name → chain drill-down loads; store-by-week cells sum to chain total.
11. Click a product → product drill-down loads; chain cells sum to product total.
12. Navigate to a store detail page → delivery-level table lists individual deliveries with correct date and units.
13. Apply month filter on dashboard → cards update; weekly table updates.
14. Apply channel filter → chain list narrows correctly.
15. Click Export CSV on any table → file downloads; row count matches table displayed.

## Empty State Tests
- Select a future month with no deliveries → all cards show 0; tables show "No deliveries for this period".
- New chain with no deliveries → drill-down shows empty state message, not an error.

## Error State Tests
- Upload a file with wrong columns → API returns validation error; preview shows 0 valid rows and a clear top-level error message.
- Upload a file where all delivery references are missing → all rows rejected; import_log status = 'failed'.
- Disconnect network mid-commit → page shows error toast; no partial write (API route is transactional).

## Counting Rule Tests
- Delivery DO-1008 with 3 products → store-level count = 1 delivery, 54 units.
- Same product in DO-1008 twice → counts as 1 product delivery, units summed.
- Re-import DO-1008 with changed units → delivery_item updated, not duplicated.
- Cancelled delivery → excluded from dashboard counts when filter = 'completed'.
