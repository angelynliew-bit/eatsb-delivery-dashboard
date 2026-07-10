# Security

## Secret Handling
- Supabase service-role key used only in Next.js API routes (server-side); never sent to browser.
- Public anon key used only for client-side reads that RLS already restricts.
- All secrets in Vercel environment variables; never in source code or client bundles.

## Permission Model (v1 → lock-down)
| Sprint | State |
|---|---|
| v1 (demo) | Permissive RLS policies — all tables readable/writable without login. Safe for internal demo only, no real business data yet. |
| Lock-down | Supabase Auth enabled; RLS policies replaced with `auth.uid() = user_id`; role column on profiles drives UI gating. |

## Roles (enforced at lock-down)
- **Administrator** — full CRUD including master data and user management
- **Management** — read dashboards, drill-downs, export; view import status
- **Operations** — upload spreadsheets, review imports/exceptions, view dashboards
- **Read-Only** — view dashboards and drill-down details only

Role checks are enforced server-side (RLS + API route middleware); the UI hides buttons as a convenience only — security does not depend on it.

## Approved Tools Rule
API routes call named Supabase query functions only. No dynamic `eval`, no raw SQL from user input, no unrestricted file execution.

## Audit Principle
Every import commit, status change, and master-data edit writes an audit row. Audit rows are insert-only — no update or delete RLS policy on audit_logs.
