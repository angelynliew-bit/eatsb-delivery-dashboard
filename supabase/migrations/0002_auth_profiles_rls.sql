create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'read_only' check (role in ('administrator', 'management', 'operations', 'read_only')),
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select role from public.profiles where user_id = auth.uid()),
    'read_only'
  );
$$;

drop policy if exists "profiles_select_own_or_admin" on profiles;
create policy "profiles_select_own_or_admin"
on profiles for select
to authenticated
using (auth.uid() = user_id or public.current_user_role() = 'administrator');

drop policy if exists "profiles_admin_write" on profiles;
create policy "profiles_admin_write"
on profiles for all
to authenticated
using (public.current_user_role() = 'administrator')
with check (public.current_user_role() = 'administrator');

drop policy if exists "channels_v1_write" on channels;
drop policy if exists "channels_v1_read" on channels;
drop policy if exists "chains_v1_write" on chains;
drop policy if exists "chains_v1_read" on chains;
drop policy if exists "stores_v1_write" on stores;
drop policy if exists "stores_v1_read" on stores;
drop policy if exists "products_v1_write" on products;
drop policy if exists "products_v1_read" on products;
drop policy if exists "orders_v1_write" on orders;
drop policy if exists "orders_v1_read" on orders;
drop policy if exists "deliveries_v1_write" on deliveries;
drop policy if exists "deliveries_v1_read" on deliveries;
drop policy if exists "delivery_items_v1_write" on delivery_items;
drop policy if exists "delivery_items_v1_read" on delivery_items;
drop policy if exists "import_logs_v1_write" on import_logs;
drop policy if exists "import_logs_v1_read" on import_logs;
drop policy if exists "import_exceptions_v1_write" on import_exceptions;
drop policy if exists "import_exceptions_v1_read" on import_exceptions;
drop policy if exists "channels_authenticated_read" on channels;
drop policy if exists "chains_authenticated_read" on chains;
drop policy if exists "stores_authenticated_read" on stores;
drop policy if exists "products_authenticated_read" on products;
drop policy if exists "orders_authenticated_read" on orders;
drop policy if exists "deliveries_authenticated_read" on deliveries;
drop policy if exists "delivery_items_authenticated_read" on delivery_items;
drop policy if exists "import_logs_authenticated_read" on import_logs;
drop policy if exists "import_exceptions_authenticated_read" on import_exceptions;
drop policy if exists "master_data_admin_write" on channels;
drop policy if exists "chains_admin_write" on chains;
drop policy if exists "stores_admin_write" on stores;
drop policy if exists "products_admin_write" on products;
drop policy if exists "orders_operations_admin_write" on orders;
drop policy if exists "deliveries_operations_admin_write" on deliveries;
drop policy if exists "delivery_items_operations_admin_write" on delivery_items;
drop policy if exists "import_logs_operations_admin_write" on import_logs;
drop policy if exists "import_exceptions_operations_admin_write" on import_exceptions;

create policy "channels_authenticated_read" on channels for select to authenticated using (true);
create policy "chains_authenticated_read" on chains for select to authenticated using (true);
create policy "stores_authenticated_read" on stores for select to authenticated using (true);
create policy "products_authenticated_read" on products for select to authenticated using (true);
create policy "orders_authenticated_read" on orders for select to authenticated using (true);
create policy "deliveries_authenticated_read" on deliveries for select to authenticated using (true);
create policy "delivery_items_authenticated_read" on delivery_items for select to authenticated using (true);
create policy "import_logs_authenticated_read" on import_logs for select to authenticated using (
  public.current_user_role() in ('administrator', 'management', 'operations')
);
create policy "import_exceptions_authenticated_read" on import_exceptions for select to authenticated using (
  public.current_user_role() in ('administrator', 'operations')
);

create policy "master_data_admin_write" on channels
for all to authenticated
using (public.current_user_role() = 'administrator')
with check (public.current_user_role() = 'administrator');

create policy "chains_admin_write" on chains
for all to authenticated
using (public.current_user_role() = 'administrator')
with check (public.current_user_role() = 'administrator');

create policy "stores_admin_write" on stores
for all to authenticated
using (public.current_user_role() = 'administrator')
with check (public.current_user_role() = 'administrator');

create policy "products_admin_write" on products
for all to authenticated
using (public.current_user_role() = 'administrator')
with check (public.current_user_role() = 'administrator');

create policy "orders_operations_admin_write" on orders
for all to authenticated
using (public.current_user_role() in ('administrator', 'operations'))
with check (public.current_user_role() in ('administrator', 'operations'));

create policy "deliveries_operations_admin_write" on deliveries
for all to authenticated
using (public.current_user_role() in ('administrator', 'operations'))
with check (public.current_user_role() in ('administrator', 'operations'));

create policy "delivery_items_operations_admin_write" on delivery_items
for all to authenticated
using (public.current_user_role() in ('administrator', 'operations'))
with check (public.current_user_role() in ('administrator', 'operations'));

create policy "import_logs_operations_admin_write" on import_logs
for all to authenticated
using (public.current_user_role() in ('administrator', 'operations'))
with check (public.current_user_role() in ('administrator', 'operations'));

create policy "import_exceptions_operations_admin_write" on import_exceptions
for all to authenticated
using (public.current_user_role() in ('administrator', 'operations'))
with check (public.current_user_role() in ('administrator', 'operations'));
