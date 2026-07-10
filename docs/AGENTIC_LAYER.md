# Agentic Layer

## v1 Scope
No autonomous agents in v1. All actions are user-initiated.

## Action Risk Levels

### Low — Auto-execute
- Parse uploaded spreadsheet and produce preview (no DB write)
- Classify validation errors and assign error_type
- Compute week band and reporting period fields
- Generate CSV export from filtered query

### Medium — Light approval (user confirms before execute)
- Commit import: upsert delivery_items and deliveries from previewed rows
- Mark import_exception as acknowledged
- Update a master data record (store, product, chain)

### High — Always requires explicit approval
- Bulk re-import an entire month (overwrites existing records)
- Mark a delivery as cancelled (changes status, affects counts)

### Critical — Human only
- Delete a delivery or delivery_item permanently
- Delete a master data record (store/product/chain)
- Any bulk delete operation

## Named Tools (Later Sprints)
- `validate_spreadsheet_row(row)` → returns error list
- `upsert_delivery_item(row)` → idempotent upsert
- `generate_export(filters)` → returns CSV stream
- `flag_exception(import_log_id, row_id, reason)` → writes import_exceptions

## Audit Log Fields
| Field | Value |
|---|---|
| actor_user_id | who triggered |
| action | e.g. import_committed |
| object_type | delivery / delivery_item / import_log |
| object_id | affected row id |
| before_state | jsonb snapshot |
| after_state | jsonb snapshot |
| timestamp | timestamptz |

Every medium/high/critical action writes an audit row before and after execution.
