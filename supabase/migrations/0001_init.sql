create table if not exists channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  channel_code text not null unique,
  channel_name text not null
);
alter table channels enable row level security;
drop policy if exists "channels_v1_read" on channels;
create policy "channels_v1_read" on channels for select using (true);
drop policy if exists "channels_v1_write" on channels;
create policy "channels_v1_write" on channels for all using (true) with check (true);

create table if not exists chains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  chain_code text not null unique,
  chain_name text not null,
  channel_id uuid references channels(id)
);
alter table chains enable row level security;
drop policy if exists "chains_v1_read" on chains;
create policy "chains_v1_read" on chains for select using (true);
drop policy if exists "chains_v1_write" on chains;
create policy "chains_v1_write" on chains for all using (true) with check (true);

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  store_code text not null unique,
  store_name text not null,
  chain_id uuid references chains(id),
  location text,
  state text,
  is_active boolean not null default true
);
alter table stores enable row level security;
drop policy if exists "stores_v1_read" on stores;
create policy "stores_v1_read" on stores for select using (true);
drop policy if exists "stores_v1_write" on stores;
create policy "stores_v1_write" on stores for all using (true) with check (true);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  product_code text not null unique,
  product_name text not null,
  brand text,
  sku text,
  is_active boolean not null default true
);
alter table products enable row level security;
drop policy if exists "products_v1_read" on products;
create policy "products_v1_read" on products for select using (true);
drop policy if exists "products_v1_write" on products;
create policy "products_v1_write" on products for all using (true) with check (true);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  order_number text,
  customer_reference text,
  chain_id uuid references chains(id),
  store_id uuid references stores(id),
  order_date date
);
alter table orders enable row level security;
drop policy if exists "orders_v1_read" on orders;
create policy "orders_v1_read" on orders for select using (true);
drop policy if exists "orders_v1_write" on orders;
create policy "orders_v1_write" on orders for all using (true) with check (true);

create table if not exists deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  delivery_ref text not null,
  delivery_date date not null,
  delivery_month integer not null,
  delivery_year integer not null,
  reporting_week integer not null check (reporting_week between 1 and 5),
  order_id uuid references orders(id),
  chain_id uuid references chains(id),
  store_id uuid references stores(id),
  channel_id uuid references channels(id),
  delivery_status text not null default 'completed',
  invoice_number text,
  entered_by text,
  unique (delivery_ref)
);
alter table deliveries enable row level security;
drop policy if exists "deliveries_v1_read" on deliveries;
create policy "deliveries_v1_read" on deliveries for select using (true);
drop policy if exists "deliveries_v1_write" on deliveries;
create policy "deliveries_v1_write" on deliveries for all using (true) with check (true);

create table if not exists delivery_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  delivery_id uuid not null references deliveries(id),
  product_id uuid not null references products(id),
  units_delivered numeric not null check (units_delivered >= 0),
  source_row_id text,
  source_line_number integer,
  last_modified_date date,
  import_timestamp timestamptz,
  validation_status text not null default 'valid',
  unique (source_row_id)
);
alter table delivery_items enable row level security;
drop policy if exists "delivery_items_v1_read" on delivery_items;
create policy "delivery_items_v1_read" on delivery_items for select using (true);
drop policy if exists "delivery_items_v1_write" on delivery_items;
create policy "delivery_items_v1_write" on delivery_items for all using (true) with check (true);

create table if not exists import_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  file_name text,
  import_status text not null default 'pending',
  rows_processed integer not null default 0,
  rows_inserted integer not null default 0,
  rows_updated integer not null default 0,
  rows_rejected integer not null default 0,
  rows_skipped integer not null default 0,
  warnings integer not null default 0,
  completed_at timestamptz,
  notes text
);
alter table import_logs enable row level security;
drop policy if exists "import_logs_v1_read" on import_logs;
create policy "import_logs_v1_read" on import_logs for select using (true);
drop policy if exists "import_logs_v1_write" on import_logs;
create policy "import_logs_v1_write" on import_logs for all using (true) with check (true);

create table if not exists import_exceptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  import_log_id uuid references import_logs(id),
  source_row_id text,
  source_line_number integer,
  raw_delivery_ref text,
  raw_store_code text,
  raw_product_code text,
  raw_delivery_date text,
  raw_units text,
  error_type text not null,
  error_message text not null,
  severity text not null default 'error'
);
alter table import_exceptions enable row level security;
drop policy if exists "import_exceptions_v1_read" on import_exceptions;
create policy "import_exceptions_v1_read" on import_exceptions for select using (true);
drop policy if exists "import_exceptions_v1_write" on import_exceptions;
create policy "import_exceptions_v1_write" on import_exceptions for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  action text not null,
  table_name text not null,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text
);
alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into channels (id, channel_code, channel_name) values
  ('a1000000-0000-0000-0000-000000000001', 'CH-SUP', 'Supermarket'),
  ('a1000000-0000-0000-0000-000000000002', 'CH-CVS', 'Convenience Store'),
  ('a1000000-0000-0000-0000-000000000003', 'CH-IND', 'Independent Grocer')
on conflict (channel_code) do nothing;

insert into chains (id, chain_code, chain_name, channel_id) values
  ('b1000000-0000-0000-0000-000000000001', 'CHN-AEON', 'AEON', 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000002', 'CHN-MYDIN', 'Mydin', 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000003', 'CHN-99SPD', '99 Speedmart', 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000004', 'CHN-TESCO', 'Lotus''s (Tesco)', 'a1000000-0000-0000-0000-000000000001')
on conflict (chain_code) do nothing;

insert into stores (id, store_code, store_name, chain_id, location, state) values
  ('c1000000-0000-0000-0000-000000000001', 'STR-AEON-MJ', 'AEON Mid Valley', 'b1000000-0000-0000-0000-000000000001', 'Mid Valley Megamall', 'Kuala Lumpur'),
  ('c1000000-0000-0000-0000-000000000002', 'STR-AEON-AU2', 'AEON AU2 Setiawangsa', 'b1000000-0000-0000-0000-000000000001', 'AU2 Setiawangsa', 'Kuala Lumpur'),
  ('c1000000-0000-0000-0000-000000000003', 'STR-MYD-PJ', 'Mydin Petaling Jaya', 'b1000000-0000-0000-0000-000000000002', 'Petaling Jaya', 'Selangor'),
  ('c1000000-0000-0000-0000-000000000004', 'STR-99-TTDI', '99 Speedmart TTDI', 'b1000000-0000-0000-0000-000000000003', 'Taman Tun Dr Ismail', 'Kuala Lumpur'),
  ('c1000000-0000-0000-0000-000000000005', 'STR-99-SS2', '99 Speedmart SS2', 'b1000000-0000-0000-0000-000000000003', 'SS2 Petaling Jaya', 'Selangor'),
  ('c1000000-0000-0000-0000-000000000006', 'STR-LTS-SUBANG', 'Lotus''s Subang Jaya', 'b1000000-0000-0000-0000-000000000004', 'Subang Jaya', 'Selangor')
on conflict (store_code) do nothing;

insert into products (id, product_code, product_name, brand, sku) values
  ('d1000000-0000-0000-0000-000000000001', 'SKU-7DM100', '7D Dried Mangoes 100g', '7D', '7DM-100G'),
  ('d1000000-0000-0000-0000-000000000002', 'SKU-7DMT80', '7D Mango Thins 80g', '7D', '7DMT-80G'),
  ('d1000000-0000-0000-0000-000000000003', 'SKU-SINAO56', 'Sina Original 56g', 'Sina', 'SINA-O-56G'),
  ('d1000000-0000-0000-0000-000000000004', 'SKU-SINAM56', 'Sina Mango 56g', 'Sina', 'SINA-M-56G'),
  ('d1000000-0000-0000-0000-000000000005', 'SKU-7DPM150', '7D Premium Mango 150g', '7D', '7DPM-150G'),
  ('d1000000-0000-0000-0000-000000000006', 'SKU-SINAP80', 'Sina Pineapple 80g', 'Sina', 'SINA-P-80G')
on conflict (product_code) do nothing;

insert into deliveries (id, delivery_ref, delivery_date, delivery_month, delivery_year, reporting_week, chain_id, store_id, channel_id, delivery_status) values
  ('e1000000-0000-0000-0000-000000000001', 'DO-1001', '2026-07-03', 7, 2026, 1, 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'completed'),
  ('e1000000-0000-0000-0000-000000000002', 'DO-1002', '2026-07-05', 7, 2026, 1, 'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'completed'),
  ('e1000000-0000-0000-0000-000000000003', 'DO-1003', '2026-07-08', 7, 2026, 2, 'b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'completed'),
  ('e1000000-0000-0000-0000-000000000004', 'DO-1004', '2026-07-10', 7, 2026, 2, 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'completed'),
  ('e1000000-0000-0000-0000-000000000005', 'DO-1005', '2026-07-15', 7, 2026, 3, 'b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'completed'),
  ('e1000000-0000-0000-0000-000000000006', 'DO-1006', '2026-07-17', 7, 2026, 3, 'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'completed')
on conflict (delivery_ref) do nothing;

insert into delivery_items (delivery_id, product_id, units_delivered, source_row_id, source_line_number, validation_status) values
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 24, 'SEED-R001', 1, 'valid'),
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003', 18, 'SEED-R002', 2, 'valid'),
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 12, 'SEED-R003', 3, 'valid'),
  ('e1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000004', 36, 'SEED-R004', 1, 'valid'),
  ('e1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 24, 'SEED-R005', 2, 'valid'),
  ('e1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000005', 48, 'SEED-R006', 1, 'valid'),
  ('e1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000006', 30, 'SEED-R007', 2, 'valid'),
  ('e1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', 36, 'SEED-R008', 1, 'valid'),
  ('e1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002', 24, 'SEED-R009', 2, 'valid'),
  ('e1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000003', 60, 'SEED-R010', 1, 'valid'),
  ('e1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000005', 48, 'SEED-R011', 2, 'valid'),
  ('e1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000004', 36, 'SEED-R012', 1, 'valid'),
  ('e1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000006', 24, 'SEED-R013', 2, 'valid')
on conflict (source_row_id) do nothing;

insert into import_logs (file_name, import_status, rows_processed, rows_inserted, rows_updated, rows_rejected, rows_skipped, warnings, completed_at, notes) values
  ('deliveries_july_2026_v1.xlsx', 'success', 13, 13, 0, 0, 0, 0, now(), 'Initial seed import'),
  ('deliveries_june_2026_final.xlsx', 'success', 10, 10, 0, 0, 0, 1, now() - interval '30 days', 'June close-out import — 1 warning on missing state')
on conflict do nothing;