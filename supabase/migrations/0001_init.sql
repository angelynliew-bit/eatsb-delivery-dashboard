create table if not exists channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table channels enable row level security;
drop policy if exists "channels_v1_read" on channels;
create policy "channels_v1_read" on channels for select using (true);
drop policy if exists "channels_v1_write" on channels;
create policy "channels_v1_write" on channels for all using (true) with check (true);

create table if not exists chains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  channel_id uuid references channels(id),
  chain_code text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

alter table chains enable row level security;
drop policy if exists "chains_v1_read" on chains;
create policy "chains_v1_read" on chains for select using (true);
drop policy if exists "chains_v1_write" on chains;
create policy "chains_v1_write" on chains for all using (true) with check (true);

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  chain_id uuid references chains(id),
  store_code text not null unique,
  name text not null,
  location text,
  state text,
  created_at timestamptz not null default now()
);

alter table stores enable row level security;
drop policy if exists "stores_v1_read" on stores;
create policy "stores_v1_read" on stores for select using (true);
drop policy if exists "stores_v1_write" on stores;
create policy "stores_v1_write" on stores for all using (true) with check (true);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  product_code text not null unique,
  name text not null,
  brand text,
  created_at timestamptz not null default now()
);

alter table products enable row level security;
drop policy if exists "products_v1_read" on products;
create policy "products_v1_read" on products for select using (true);
drop policy if exists "products_v1_write" on products;
create policy "products_v1_write" on products for all using (true) with check (true);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  order_number text,
  store_id uuid references stores(id),
  created_at timestamptz not null default now()
);

alter table orders enable row level security;
drop policy if exists "orders_v1_read" on orders;
create policy "orders_v1_read" on orders for select using (true);
drop policy if exists "orders_v1_write" on orders;
create policy "orders_v1_write" on orders for all using (true) with check (true);

create table if not exists import_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  filename text,
  imported_at timestamptz not null default now(),
  rows_processed int not null default 0,
  rows_inserted int not null default 0,
  rows_updated int not null default 0,
  rows_rejected int not null default 0,
  status text not null default 'success',
  created_at timestamptz not null default now()
);

alter table import_logs enable row level security;
drop policy if exists "import_logs_v1_read" on import_logs;
create policy "import_logs_v1_read" on import_logs for select using (true);
drop policy if exists "import_logs_v1_write" on import_logs;
create policy "import_logs_v1_write" on import_logs for all using (true) with check (true);

create table if not exists deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  delivery_ref text not null,
  delivery_date date not null,
  delivery_month int,
  delivery_year int,
  reporting_week int,
  store_id uuid references stores(id),
  order_id uuid references orders(id),
  status text not null default 'completed',
  invoice_number text,
  customer_ref text,
  entered_by text,
  import_log_id uuid references import_logs(id),
  created_at timestamptz not null default now(),
  unique (delivery_ref, store_id)
);

alter table deliveries enable row level security;
drop policy if exists "deliveries_v1_read" on deliveries;
create policy "deliveries_v1_read" on deliveries for select using (true);
drop policy if exists "deliveries_v1_write" on deliveries;
create policy "deliveries_v1_write" on deliveries for all using (true) with check (true);

create table if not exists delivery_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  delivery_id uuid references deliveries(id),
  product_id uuid references products(id),
  units_delivered numeric not null check (units_delivered >= 0),
  source_row_id text,
  line_number int,
  import_log_id uuid references import_logs(id),
  created_at timestamptz not null default now()
);

alter table delivery_items enable row level security;
drop policy if exists "delivery_items_v1_read" on delivery_items;
create policy "delivery_items_v1_read" on delivery_items for select using (true);
drop policy if exists "delivery_items_v1_write" on delivery_items;
create policy "delivery_items_v1_write" on delivery_items for all using (true) with check (true);

create table if not exists import_exceptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  import_log_id uuid references import_logs(id),
  source_row_id text,
  raw_data jsonb,
  error_type text,
  error_detail text,
  created_at timestamptz not null default now()
);

alter table import_exceptions enable row level security;
drop policy if exists "import_exceptions_v1_read" on import_exceptions;
create policy "import_exceptions_v1_read" on import_exceptions for select using (true);
drop policy if exists "import_exceptions_v1_write" on import_exceptions;
create policy "import_exceptions_v1_write" on import_exceptions for all using (true) with check (true);

insert into channels (id, name) values
  ('11111111-0000-0000-0000-000000000001', 'Supermarket'),
  ('11111111-0000-0000-0000-000000000002', 'Convenience Store'),
  ('11111111-0000-0000-0000-000000000003', 'Independent Grocer')
on conflict (name) do nothing;

insert into chains (id, channel_id, chain_code, name) values
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'CHN-MYDIN', 'Mydin'),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'CHN-AEON', 'AEON'),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002', 'CHN-99SPD', '99 Speedmart')
on conflict (chain_code) do nothing;

insert into stores (id, chain_id, store_code, name, location, state) values
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'STR-MYDIN-USJ', 'Mydin USJ', 'USJ, Subang Jaya', 'Selangor'),
  ('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 'STR-AEON-TAIPAN', 'AEON Taipan', 'USJ, Subang Jaya', 'Selangor'),
  ('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002', 'STR-AEON-WANGSA', 'AEON Wangsa Maju', 'Wangsa Maju', 'Kuala Lumpur'),
  ('33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000003', 'STR-99-PJ', '99 Speedmart PJ', 'Petaling Jaya', 'Selangor')
on conflict (store_code) do nothing;

insert into products (id, product_code, name, brand) values
  ('44444444-0000-0000-0000-000000000001', 'SKU-7D-MANGO-100', '7D Dried Mangoes 100g', '7D'),
  ('44444444-0000-0000-0000-000000000002', 'SKU-7D-THIN-80', '7D Mango Thins 80g', '7D'),
  ('44444444-0000-0000-0000-000000000003', 'SKU-SINA-56', 'Sina Original 56g', 'Sina'),
  ('44444444-0000-0000-0000-000000000004', 'SKU-SINA-SPICY-56', 'Sina Spicy 56g', 'Sina')
on conflict (product_code) do nothing;

insert into import_logs (id, filename, imported_at, rows_processed, rows_inserted, rows_updated, rows_rejected, status) values
  ('55555555-0000-0000-0000-000000000001', 'deliveries_july_2026_w1.xlsx', now() - interval '6 days', 24, 24, 0, 0, 'success'),
  ('55555555-0000-0000-0000-000000000002', 'deliveries_july_2026_w2.xlsx', now() - interval '1 day', 18, 16, 0, 2, 'partial')
on conflict do nothing;

insert into deliveries (id, delivery_ref, delivery_date, delivery_month, delivery_year, reporting_week, store_id, status, import_log_id) values
  ('66666666-0000-0000-0000-000000000001', 'DO-1001', '2026-07-03', 7, 2026, 1, '33333333-0000-0000-0000-000000000001', 'completed', '55555555-0000-0000-0000-000000000001'),
  ('66666666-0000-0000-0000-000000000002', 'DO-1002', '2026-07-05', 7, 2026, 1, '33333333-0000-0000-0000-000000000002', 'completed', '55555555-0000-0000-0000-000000000001'),
  ('66666666-0000-0000-0000-000000000003', 'DO-1003', '2026-07-07', 7, 2026, 1, '33333333-0000-0000-0000-000000000003', 'completed', '55555555-0000-0000-0000-000000000001'),
  ('66666666-0000-0000-0000-000000000004', 'DO-1004', '2026-07-10', 7, 2026, 2, '33333333-0000-0000-0000-000000000001', 'completed', '55555555-0000-0000-0000-000000000002'),
  ('66666666-0000-0000-0000-000000000005', 'DO-1005', '2026-07-12', 7, 2026, 2, '33333333-0000-0000-0000-000000000004', 'completed', '55555555-0000-0000-0000-000000000002')
on conflict do nothing;

insert into delivery_items (delivery_id, product_id, units_delivered, source_row_id, line_number, import_log_id) values
  ('66666666-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', 24, 'ROW-001', 1, '55555555-0000-0000-0000-000000000001'),
  ('66666666-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000003', 18, 'ROW-002', 2, '55555555-0000-0000-0000-000000000001'),
  ('66666666-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000002', 12, 'ROW-003', 3, '55555555-0000-0000-0000-000000000001'),
  ('66666666-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000001', 36, 'ROW-004', 1, '55555555-0000-0000-0000-000000000001'),
  ('66666666-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000004', 24, 'ROW-005', 2, '55555555-0000-0000-0000-000000000001'),
  ('66666666-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000002', 48, 'ROW-006', 1, '55555555-0000-0000-0000-000000000001'),
  ('66666666-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000003', 30, 'ROW-007', 2, '55555555-0000-0000-0000-000000000001'),
  ('66666666-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000001', 48, 'ROW-008', 1, '55555555-0000-0000-0000-000000000002'),
  ('66666666-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000003', 24, 'ROW-009', 2, '55555555-0000-0000-0000-000000000002'),
  ('66666666-0000-0000-0000-000000000005', '44444444-0000-0000-0000-000000000002', 60, 'ROW-010', 1, '55555555-0000-0000-0000-000000000002'),
  ('66666666-0000-0000-0000-000000000005', '44444444-0000-0000-0000-000000000004', 36, 'ROW-011', 2, '55555555-0000-0000-0000-000000000002')
on conflict do nothing;

insert into import_exceptions (import_log_id, source_row_id, raw_data, error_type, error_detail) values
  ('55555555-0000-0000-0000-000000000002', 'ROW-EX-001', '{"delivery_ref":"DO-1006","store_code":"STR-UNKNOWN","product_code":"SKU-7D-MANGO-100","units_delivered":12}', 'UNKNOWN_STORE', 'Store code STR-UNKNOWN not found in master data'),
  ('55555555-0000-0000-0000-000000000002', 'ROW-EX-002', '{"delivery_ref":"DO-1007","store_code":"STR-AEON-TAIPAN","product_code":"SKU-UNKNOWN","units_delivered":6}', 'UNKNOWN_PRODUCT', 'Product code SKU-UNKNOWN not found in master data')
on conflict do nothing;