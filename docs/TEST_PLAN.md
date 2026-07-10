# Test Plan

## v1 Success Scenario (manual)
**Scenario:** Operations staff imports a July delivery file; management reviews the dashboard.

### Steps
1. Open app URL (no login). Confirm July 2026 dashboard loads with seed data summary cards and weekly table.
2. Navigate to Chain → AEON → AEON Mid Valley. Confirm W1 cell shows 1 delivery / 54 units.
3. Navigate to Product → 7D Dried Mangoes 100g. Confirm it appears in AEON and 99 Speedmart rows.
4. Click **Import**. Upload `test_import_valid.xlsx` (18 valid rows, 2 invalid rows).
5. Confirm preview table shows first 10 rows before import runs.
6. Click **Confirm Import**. Confirm result: 18 inserted, 0 updated, 2 rejected, 0 skipped.
7. Open Import Exceptions. Confirm 2 rows listed with correct `error_type` (e.g. UNKNOWN_STORE, MISSING_DELIVERY_REF).
8. Dashboard summary cards reflect updated totals.
9. Re-upload same file. Confirm result: 0 inserted, 0 updated, 18 skipped.
10. Apply filter: Week 2, channel Supermarket. Confirm tables show only W2 supermarket data.
11. Click Export on filtered chain breakdown table. Confirm CSV downloads with correct columns and row count.
12. Open Import History. Confirm two import log entries with correct counts.

### Pass Criteria
- All 12 steps complete without browser errors
- Database row counts match expected values after each step
- No duplicate delivery items after re-upload
- Weekly cell values match counting rules (distinct delivery_ref for counts; sum for units)

---

## Empty / Error Cases

| Case | Expected behaviour |
|---|---|
| Select month with no deliveries | "No deliveries for this month" message on every table; cards show 0 |
| Upload file with all invalid rows | 0 inserted; all rows in exceptions; import_status = 'failed' |
| Upload file > 10 MB | Client rejects before upload; error message shown |
| Upload file missing required columns (no delivery_ref column) | Server returns structured error listing missing columns; no import_log created |
| Network error mid-import | Partial rows not committed; import_log status = 'failed'; existing data unchanged |
| Filter chain with no deliveries in selected month | Store table shows empty state; not a blank white page |
| Unknown store code in spreadsheet | Row rejected with error_type = UNKNOWN_STORE; store code shown in exception detail |
| Negative units_delivered in spreadsheet | Row rejected with error_type = INVALID_UNITS |
| Same product twice in one delivery (two source rows) | One product delivery counted; units summed |
| Cancelled delivery | Excluded from default dashboard (completed filter); visible when status filter = all |
