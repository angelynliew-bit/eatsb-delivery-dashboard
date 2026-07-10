# Security

## Secret Handling
- Supabase service-role key lives only in server-side environment variables (`SUPABASE_SERVICE_ROLE_KEY`)
- Client-side code uses only the anon key with RLS as the permission boundary
- No secrets in `console.log`, error responses, or client bundles
- File uploads processed server-side; raw file bytes never sent to the client after parsing

## Permission Model (v1 — demo open)
All tables have permissive RLS: any request can read and write. 
This is intentional for the demo sprint — no real business data is in the system yet.

## Permission Model (lock-down sprint)
| Role | Can do |
|---|---|
| Administrator | Full access: master data, users, delete, role assignment |
| Management | Read all dashboards, drill-downs, export; view import logs |
| Operations | Upload spreadsheets, view import logs and exceptions, read dashboards |
| Read-Only | View dashboards and drill-down detail only |

Roles stored in a `profiles` table (`user_id uuid`, `role text`). 
RLS policies check `auth.uid() = user_id` for writes; role checks done in server API routes via `profiles` lookup. 
Agent actions inherit the authenticated user's role — an Operations user's import job cannot escalate to admin actions.

## Approved Tools Rule
Only the named tools in `AGENTIC_LAYER.md` may be called by automated processes. 
No `run_any`, `eval`, or dynamic SQL construction from user-supplied strings.

## Audit Principle
Every import, upsert batch, bulk delete, role change, and export is written to `audit_logs` before the operation completes. A failed operation still writes its attempt. Audit rows are append-only — no update or delete policy on `audit_logs`.

## Data Loss Risk
If a task involves permanent deletion of delivery history or changes to store/product codes: **stop and get a human administrator to confirm**. The system flags deleted rows for review rather than auto-deleting.
