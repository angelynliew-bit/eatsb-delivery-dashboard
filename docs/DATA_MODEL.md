# Data Model

## channels
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | owner scope (nullable v1) |
| name | text unique not null | e.g. Supermarket |
| created_at | timestamptz | |

## chains
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| channel_id | uuid FK → channels | |
| chain_code | text unique not null | |
| name | text not null | |
| created_at | timestamptz | |

## stores
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| chain_id | uuid FK → chains | |
| store_code | text unique not null | authoritative key |
| name | text not null | |
| location | text | |
| state | text | |
| created_at | timestamptz | |

## products
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| product_code | text unique not null | authoritative key |
| name | text not null | |
| brand | text | |
| created_at | timestamptz | |

## orders
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| order_number | text | |
| store_id | uuid FK → stores | |
| created_at | timestamptz | |

## deliveries
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| delivery_ref | text not null | unique per delivery |
| delivery_date | date not null | used for week/month calc |
| delivery_month | int | computed on import |
| delivery_year | int | computed on import |
| reporting_week | int | 1–5, computed on import |
| store_id | uuid FK → stores | |
| order_id | uuid FK → orders nullable | |
| status | text | completed/partial/cancelled |
| invoice_number | text | |
| customer_ref | text | |
| entered_by | text | |
| import_log_id | uuid FK → import_logs | |
| created_at | timestamptz | |

## delivery_items
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| delivery_id | uuid FK → deliveries | |
| product_id | uuid FK → products | |
| units_delivered | numeric not null | individual units, not cartons |
| source_row_id | text | preferred upsert key |
| line_number | int | fallback upsert key |
| import_log_id | uuid FK → import_logs | |
| created_at | timestamptz | |

## import_logs
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| filename | text | |
| imported_at | timestamptz | |
| rows_processed | int | |
| rows_inserted | int | |
| rows_updated | int | |
| rows_rejected | int | |
| status | text | success/partial/failed |
| created_at | timestamptz | |

## import_exceptions
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| import_log_id | uuid FK → import_logs | |
| source_row_id | text | |
| raw_data | jsonb | full row as parsed |
| error_type | text | validation rule name |
| error_detail | text | human-readable message |
| created_at | timestamptz | |

## Relationships
- channel 1→N chains 1→N stores 1→N deliveries 1→N delivery_items N←1 products
- deliveries N←1 orders (optional)
- import_logs 1→N deliveries, 1→N delivery_items, 1→N import_exceptions

## RLS
All tables: RLS enabled. v1 permissive policies (select/all using true). Lock-down sprint replaces with `auth.uid() = user_id`.

## AI Fields
No AI-generated fields in v1. Future demand-score fields will carry `value`, `source`, `confidence numeric`, `review_status text default 'unreviewed'`.
