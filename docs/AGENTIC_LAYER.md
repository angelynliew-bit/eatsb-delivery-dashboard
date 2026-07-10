# Agentic Layer

## v1 — No autonomous agents. All actions are human-initiated.

## Action Risk Classification

### Low risk — auto-execute on confirmed import
- Parse uploaded file and return preview table
- Validate rows against master data
- Calculate `reporting_week`, `delivery_month`, `delivery_year`
- Write `import_log` row
- Write `import_exceptions` rows

### Medium risk — user clicks Confirm after preview
- Upsert delivery_items (insert / update existing rows)
- Flag cancelled rows (set `delivery_status = 'cancelled'`)
*Approval flow: preview shown → user reviews → user clicks **Confirm Import** → upsert executes → result summary shown.*

### High risk — explicit user action required
- Bulk-delete delivery records flagged as deleted in source spreadsheet
*Flow: system flags rows as `deleted_pending_review`; admin reviews list; admin clicks **Confirm Delete** per batch.*

### Critical — human only, no automation
- Permanent deletion of historical delivery records
- Changes to master store or product codes
- Role changes for other users
*These actions require a named administrator and are logged in `audit_logs` with `old_values` and `new_values`.*

## Named Tools (v1)
- `parse_spreadsheet(file)` → row array
- `validate_rows(rows)` → {valid[], rejected[], warnings[]}
- `upsert_delivery_items(valid_rows, import_log_id)` → counts
- `export_csv(query_params)` → streamed CSV

## Audit Log Fields
`action | table_name | record_id | old_values (jsonb) | new_values (jsonb) | user_id | ip_address | created_at`

## Later
- Scheduled daily import trigger (Mon–Sat) calling `parse_spreadsheet` + `upsert_delivery_items` automatically
- Low-stock alert agent: reads stock cover < threshold → drafts reorder suggestion → Operations approves before any PO is raised
