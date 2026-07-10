# Data Model

## channels
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | owner scope (v2) |
| channel_code | text unique not null | e.g. CH-SUP |
| channel_name | text not null | e.g. Supermarket |
| created_at | timestamptz | |

## chains
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| chain_code | text unique not null | |
| chain_name | text not null | |
| channel_id | uuid FK → channels | |
| created_at | timestamptz | |

## stores
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| store_code | text unique not null | authoritative key |
| store_name | text not null | |
| chain_id | uuid FK → chains | |
| location | text | |
| state | text | |
| is_active | boolean default true | |
| created_at | timestamptz | |

## products
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| product_code | text unique not null | authoritative key |
| product_name | text not null | |
| brand | text | |
| sku | text | |
| is_active | boolean default true | |
| created_at | timestamptz | |

## orders
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| order_number | text | |
| customer_reference | text | |
| chain_id | uuid FK → chains | |
| store_id | uuid FK → stores | |
| order_date | date | |
| created_at | timestamptz | |

## deliveries
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| delivery_ref | text unique not null | |
| delivery_date | date not null | |
| delivery_month | integer not null | |
| delivery_year | integer not null | |
| reporting_week | integer 1–5 not null | derived on import |
| order_id | uuid FK → orders nullable | |
| chain_id | uuid FK → chains | |
| store_id | uuid FK → stores | |
| channel_id | uuid FK → channels | |
| delivery_status | text default 'completed' | completed/cancelled/partial |
| invoice_number | text | |
| entered_by | text | |
| created_at | timestamptz | |

## delivery_items
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| delivery_id | uuid FK → deliveries not null | |
| product_id | uuid FK → products not null | |
| units_delivered | numeric ≥ 0 not null | individual units, not cartons |
| source_row_id | text unique | primary upsert key |
| source_line_number | integer | fallback key component |
| last_modified_date | date | |
| import_timestamp | timestamptz | |
| validation_status | text default 'valid' | |
| created_at | timestamptz | |

## import_logs
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| file_name | text | |
| import_status | text | pending/success/partial/failed |
| rows_processed | integer | |
| rows_inserted | integer | |
| rows_updated | integer | |
| rows_rejected | integer | |
| rows_skipped | integer | |
| warnings | integer | |
| completed_at | timestamptz | |
| notes | text | |
| created_at | timestamptz | |

## import_exceptions
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| import_log_id | uuid FK → import_logs | |
| source_row_id | text | |
| source_line_number | integer | |
| raw_delivery_ref | text | |
| raw_store_code | text | |
| raw_product_code | text | |
| raw_delivery_date | text | |
| raw_units | text | |
| error_type | text not null | e.g. UNKNOWN_STORE |
| error_message | text not null | |
| severity | text default 'error' | error/warning |
| created_at | timestamptz | |

## audit_logs
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| action | text not null | e.g. IMPORT, UPSERT, DELETE |
| table_name | text not null | |
| record_id | uuid | |
| old_values | jsonb | |
| new_values | jsonb | |
| ip_address | text | |
| created_at | timestamptz | |

## RLS
All tables: permissive v1 policies (select + all for everyone). 
Lock-down sprint: replace with `auth.uid() = user_id` policies; role checks via a `profiles` table.

## Key Relationships
`channel` 1→N `chain` 1→N `store` 1→N `deliveries` 1→N `delivery_items` N→1 `product`
