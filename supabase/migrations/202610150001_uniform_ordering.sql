create extension if not exists pgcrypto with schema extensions;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null default '',
  school_id text not null default '',
  grade text not null default '',
  course text not null default 'BS Information Technology',
  role text not null default 'Student' check (role in ('Student', 'Finance', 'Administrator')),
  active boolean not null default true,
  order_updates boolean not null default true,
  promotions boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course text not null,
  category text not null default 'Uniforms',
  color text not null default 'Campus colors',
  price_etb numeric(10, 2) not null check (price_etb > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (course, name)
);

create table if not exists public.product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.catalog_products (id) on delete restrict,
  size_label text not null,
  stock integer not null default 0 check (stock >= 0),
  minimum integer not null default 0 check (minimum >= 0),
  unique (product_id, size_label)
);

create table if not exists public.app_settings (
  id integer primary key check (id = 1),
  settings jsonb not null default '{
    "orderingEnabled": true,
    "orderDeadline": "",
    "maxItemsPerOrder": 0,
    "paymentMethods": ["Cash at campus", "GCash"],
    "paymentInstructions": "Choose a payment method at checkout. Finance will confirm your payment before your order is prepared.",
    "announcement": "",
    "terms": "Please check your order details before submitting. Orders are subject to stock availability and campus payment confirmation."
  }'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.uniform_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.profiles (id) on delete restrict,
  status text not null default 'Awaiting payment'
    check (status in ('Awaiting payment', 'Processing', 'Ready for pickup', 'Completed', 'Cancelled')),
  total numeric(12, 2) not null check (total >= 0),
  payment_method text not null,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.uniform_orders (id) on delete cascade,
  product_id uuid references public.catalog_products (id) on delete set null,
  size_id uuid references public.product_sizes (id) on delete restrict,
  product_name text not null,
  course text not null,
  size_label text not null,
  quantity integer not null check (quantity > 0),
  unit_price_php numeric(12, 2) not null check (unit_price_php > 0)
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.uniform_orders (id) on delete cascade,
  changed_by uuid references public.profiles (id) on delete set null,
  previous_status text,
  next_status text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.order_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.uniform_orders (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  request_type text not null check (request_type in ('Exchange', 'Return')),
  message text not null default '',
  status text not null default 'Open' check (status in ('Open', 'Resolved', 'Declined')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.order_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  order_id uuid references public.uniform_orders (id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists uniform_orders_user_submitted_idx
  on public.uniform_orders (user_id, submitted_at desc);
create index if not exists uniform_orders_status_submitted_idx
  on public.uniform_orders (status, submitted_at desc);
create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists order_status_history_order_idx
  on public.order_status_history (order_id, created_at);
create index if not exists order_requests_status_created_idx on public.order_requests (status, created_at desc);
create unique index if not exists order_requests_one_open_per_order_idx
  on public.order_requests (order_id) where status = 'Open';
create index if not exists order_notifications_user_created_idx
  on public.order_notifications (user_id, created_at desc);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do update set
    email = excluded.email,
    name = case when public.profiles.name = '' then excluded.name else public.profiles.name end;
  return new;
end;
$$;

do $$
declare
  realtime_table text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach realtime_table in array array[
      'uniform_orders',
      'product_sizes',
      'order_requests',
      'order_notifications',
      'order_status_history',
      'app_settings'
    ]
    loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = realtime_table
      ) then
        execute format('alter publication supabase_realtime add table public.%I', realtime_table);
      end if;
    end loop;
  end if;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.active
  );
$$;

create or replace function public.has_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.active and p.role = any (allowed_roles)
  );
$$;

alter table public.profiles enable row level security;
alter table public.catalog_products enable row level security;
alter table public.product_sizes enable row level security;
alter table public.app_settings enable row level security;
alter table public.uniform_orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.order_requests enable row level security;
alter table public.order_notifications enable row level security;

create policy "Profiles are visible to their owner and staff"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(array['Finance', 'Administrator']));
create policy "Users update only their own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid() and active)
  with check (id = auth.uid() and active);
grant select on public.profiles to authenticated;
grant update (name, school_id, grade, course, order_updates, promotions) on public.profiles to authenticated;

create policy "Active catalog is visible to signed-in users"
  on public.catalog_products for select to authenticated
  using (active and public.is_active_user());
create policy "Admins manage catalog products"
  on public.catalog_products for all to authenticated
  using (public.has_role(array['Administrator']))
  with check (public.has_role(array['Administrator']));

create policy "Active sizes are visible to signed-in users"
  on public.product_sizes for select to authenticated
  using (
    public.is_active_user()
    and exists (
      select 1 from public.catalog_products p
      where p.id = product_id and (p.active or public.has_role(array['Administrator']))
    )
  );
create policy "Admins manage product sizes"
  on public.product_sizes for all to authenticated
  using (public.has_role(array['Administrator']))
  with check (public.has_role(array['Administrator']));

create policy "Active users read ordering settings"
  on public.app_settings for select to authenticated using (public.is_active_user());

create policy "Owners and staff read orders"
  on public.uniform_orders for select to authenticated
  using (
    public.is_active_user()
    and (user_id = auth.uid() or public.has_role(array['Finance', 'Administrator']))
  );

create policy "Owners and staff read order lines"
  on public.order_items for select to authenticated
  using (
    public.is_active_user()
    and exists (
      select 1 from public.uniform_orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or public.has_role(array['Finance', 'Administrator']))
    )
  );

create policy "Owners and staff read order status history"
  on public.order_status_history for select to authenticated
  using (
    public.is_active_user()
    and exists (
      select 1 from public.uniform_orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or public.has_role(array['Finance', 'Administrator']))
    )
  );

create policy "Owners and staff read order requests"
  on public.order_requests for select to authenticated
  using (
    public.is_active_user()
    and (user_id = auth.uid() or public.has_role(array['Finance', 'Administrator']))
  );

create policy "Users read their own notifications"
  on public.order_notifications for select to authenticated
  using (user_id = auth.uid() and public.is_active_user());
create policy "Users mark their own notifications read"
  on public.order_notifications for update to authenticated
  using (user_id = auth.uid() and public.is_active_user())
  with check (user_id = auth.uid() and public.is_active_user());
grant select on public.catalog_products, public.product_sizes, public.app_settings,
  public.uniform_orders, public.order_items, public.order_status_history,
  public.order_requests, public.order_notifications
  to authenticated;
grant update (read_at) on public.order_notifications to authenticated;

create or replace function public.notify_order_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  notification_text text;
begin
  if tg_table_name = 'uniform_orders' then
    if tg_op = 'INSERT' then
      notification_text := 'Your order ' || new.order_number || ' was received.';
    elsif new.status is distinct from old.status then
      notification_text := 'Order ' || new.order_number || ' is now ' || lower(new.status) || '.';
    else
      return new;
    end if;
    insert into public.order_notifications (user_id, order_id, message)
    select new.user_id, new.id, notification_text
    from public.profiles p
    where p.id = new.user_id and p.order_updates;
    return new;
  end if;

  if tg_op = 'INSERT' then
    notification_text := 'Your ' || lower(new.request_type) || ' request for order '
      || (select o.order_number from public.uniform_orders o where o.id = new.order_id)
      || ' was submitted.';
  elsif new.status is distinct from old.status then
    notification_text := 'Your ' || lower(new.request_type) || ' request is now '
      || lower(new.status) || '.';
  else
    return new;
  end if;
  insert into public.order_notifications (user_id, order_id, message)
  select new.user_id, new.order_id, notification_text
  from public.profiles p
  where p.id = new.user_id and p.order_updates;
  return new;
end;
$$;

drop trigger if exists notify_order_owner on public.uniform_orders;
create trigger notify_order_owner
after insert or update of status on public.uniform_orders
for each row execute function public.notify_order_owner();

create or replace function public.record_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.order_status_history (order_id, changed_by, previous_status, next_status)
    values (
      new.id,
      auth.uid(),
      case when tg_op = 'INSERT' then null else old.status end,
      new.status
    );
  end if;
  return new;
end;
$$;

drop trigger if exists record_order_status on public.uniform_orders;
create trigger record_order_status
after insert or update of status on public.uniform_orders
for each row execute function public.record_order_status();

drop trigger if exists notify_order_request_owner on public.order_requests;
create trigger notify_order_request_owner
after insert or update of status on public.order_requests
for each row execute function public.notify_order_owner();

create or replace function public.place_uniform_order(p_items jsonb, p_payment_method text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  settings_value jsonb;
  line jsonb;
  product_row public.catalog_products%rowtype;
  size_row public.product_sizes%rowtype;
  order_id uuid := gen_random_uuid();
  order_ref text := 'ORD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  item_count integer := 0;
  line_quantity integer;
  line_price numeric(12, 2);
  total_value numeric(12, 2) := 0;
  deadline_value timestamptz;
begin
  if not public.is_active_user() or not public.has_role(array['Student']) then
    raise exception 'Only active student accounts can place orders.';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'Order items must be provided as a list.';
  end if;
  if jsonb_array_length(p_items) = 0 then
    raise exception 'Add at least one item before checking out.';
  end if;

  select settings into settings_value from public.app_settings where id = 1;
  if coalesce((settings_value ->> 'orderingEnabled')::boolean, false) is false then
    raise exception 'Ordering is currently closed.';
  end if;
  if coalesce(settings_value ->> 'orderDeadline', '') <> '' then
    deadline_value := (settings_value ->> 'orderDeadline')::timestamptz;
    if deadline_value < now() then
      raise exception 'The order deadline has passed.';
    end if;
  end if;
  if p_payment_method is null
    or not (coalesce(settings_value -> 'paymentMethods', '[]'::jsonb) ? p_payment_method) then
    raise exception 'Choose an available payment method.';
  end if;

  for line in select value from jsonb_array_elements(p_items)
  loop
    if coalesce(line ->> 'quantity', '') !~ '^[1-9][0-9]*$' then
      raise exception 'Every order quantity must be a positive whole number.';
    end if;
    line_quantity := (line ->> 'quantity')::integer;
    item_count := item_count + line_quantity;
  end loop;
  if item_count > 500 then
    raise exception 'An order cannot contain more than 500 items.';
  end if;
  if coalesce((settings_value ->> 'maxItemsPerOrder')::integer, 0) > 0
    and item_count > (settings_value ->> 'maxItemsPerOrder')::integer then
    raise exception 'This order exceeds the campus item limit.';
  end if;

  insert into public.uniform_orders (id, order_number, user_id, total, payment_method)
  values (order_id, order_ref, auth.uid(), 0, p_payment_method);

  for line in select value from jsonb_array_elements(p_items)
  loop
    line_quantity := (line ->> 'quantity')::integer;
    select ps.* into size_row
    from public.product_sizes ps
    join public.catalog_products cp on cp.id = ps.product_id
    where ps.id = (line ->> 'size_id')::uuid
      and cp.id = (line ->> 'product_id')::uuid
      and cp.active
    for update of ps;
    if not found then
      raise exception 'A selected uniform or size is no longer available.';
    end if;
    if size_row.stock < line_quantity then
      raise exception 'Not enough stock remains for size %.', size_row.size_label;
    end if;
    select * into product_row from public.catalog_products where id = size_row.product_id;
    line_price := round(product_row.price_etb * 0.386086, 2);
    update public.product_sizes set stock = stock - line_quantity where id = size_row.id;
    insert into public.order_items (
      order_id, product_id, size_id, product_name, course, size_label, quantity, unit_price_php
    ) values (
      order_id, product_row.id, size_row.id, product_row.name, product_row.course,
      size_row.size_label, line_quantity, line_price
    );
    total_value := total_value + line_price * line_quantity;
  end loop;

  update public.uniform_orders set total = total_value where id = order_id;
  return order_id;
end;
$$;

create or replace function public.cancel_own_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  order_row public.uniform_orders%rowtype;
  item_row record;
begin
  if not public.is_active_user() or not public.has_role(array['Student']) then
    raise exception 'Only active student accounts can cancel orders.';
  end if;
  select * into order_row from public.uniform_orders
  where id = p_order_id and user_id = auth.uid()
  for update;
  if not found then raise exception 'Order not found.'; end if;
  if order_row.status <> 'Awaiting payment' then
    raise exception 'Only orders awaiting payment can be cancelled directly. Contact the campus shop for help.';
  end if;
  for item_row in
    select size_id, quantity from public.order_items where order_id = p_order_id
  loop
    update public.product_sizes
    set stock = stock + item_row.quantity
    where id = item_row.size_id;
  end loop;
  update public.uniform_orders set status = 'Cancelled', updated_at = now()
  where id = p_order_id;
end;
$$;

create or replace function public.update_order_status(p_order_id uuid, p_next_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_status text;
  valid_transition boolean := false;
begin
  if not public.has_role(array['Finance', 'Administrator']) then
    raise exception 'Finance or administrator access is required.';
  end if;
  select status into current_status from public.uniform_orders where id = p_order_id for update;
  if not found then raise exception 'Order not found.'; end if;
  valid_transition := (current_status = 'Awaiting payment' and p_next_status = 'Processing')
    or (current_status = 'Processing' and p_next_status = 'Ready for pickup')
    or (current_status = 'Ready for pickup' and p_next_status = 'Completed');
  if not valid_transition then raise exception 'That order status transition is not allowed.'; end if;
  update public.uniform_orders
  set status = p_next_status, updated_at = now()
  where id = p_order_id;
end;
$$;

create or replace function public.create_order_request(
  p_order_id uuid,
  p_type text,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  order_row public.uniform_orders%rowtype;
  request_id uuid;
begin
  if not public.has_role(array['Student']) then raise exception 'Student access is required.'; end if;
  if p_type not in ('Exchange', 'Return') then raise exception 'Choose an exchange or return request.'; end if;
  select * into order_row from public.uniform_orders
  where id = p_order_id and user_id = auth.uid();
  if not found then raise exception 'Order not found.'; end if;
  if order_row.status not in ('Ready for pickup', 'Completed') then
    raise exception 'Exchange and return requests are available after an order is ready.';
  end if;
  if exists (
    select 1 from public.order_requests r
    where r.order_id = p_order_id and r.status = 'Open'
  ) then
    raise exception 'This order already has an open request.';
  end if;
  insert into public.order_requests (order_id, user_id, request_type, message)
  values (p_order_id, auth.uid(), p_type, left(trim(coalesce(p_message, '')), 1000))
  returning id into request_id;
  return request_id;
end;
$$;

create or replace function public.resolve_order_request(p_request_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role(array['Finance', 'Administrator']) then
    raise exception 'Finance or administrator access is required.';
  end if;
  if p_status not in ('Resolved', 'Declined') then raise exception 'Invalid request outcome.'; end if;
  update public.order_requests
  set status = p_status, resolved_at = now()
  where id = p_request_id and status = 'Open';
  if not found then raise exception 'Open request not found.'; end if;
end;
$$;

create or replace function public.admin_save_catalog_product(
  p_product_id uuid,
  p_name text,
  p_course text,
  p_category text,
  p_color text,
  p_price_etb numeric,
  p_sizes jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_id uuid := coalesce(p_product_id, gen_random_uuid());
  size_value jsonb;
begin
  if not public.has_role(array['Administrator']) then raise exception 'Administrator access is required.'; end if;
  if trim(coalesce(p_name, '')) = '' or trim(coalesce(p_course, '')) = ''
    or trim(coalesce(p_category, '')) = '' or trim(coalesce(p_color, ''))
    or p_price_etb is null or p_price_etb <= 0
    or jsonb_typeof(p_sizes) is distinct from 'array'
    or case
      when jsonb_typeof(p_sizes) = 'array' then jsonb_array_length(p_sizes) = 0
      else true
    end then
    raise exception 'Complete all product details and add at least one size.';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_sizes) value
    where jsonb_typeof(value -> 'label') is distinct from 'string'
      or trim(coalesce(value ->> 'label', '')) = ''
      or coalesce(value ->> 'stock', '') !~ '^[0-9]+$'
      or coalesce(value ->> 'minimum', '') !~ '^[0-9]+$'
  ) then raise exception 'Sizes and stock values must be valid non-negative numbers.'; end if;
  if exists (
    select 1
    from jsonb_array_elements(p_sizes) as sizes(value)
    group by trim(value ->> 'label')
    having count(*) > 1
  ) then raise exception 'Each size must be listed only once.'; end if;

  insert into public.catalog_products (id, name, course, category, color, price_etb, active)
  values (saved_id, trim(p_name), trim(p_course), trim(p_category), trim(p_color), p_price_etb, true)
  on conflict (id) do update set
    name = excluded.name,
    course = excluded.course,
    category = excluded.category,
    color = excluded.color,
    price_etb = excluded.price_etb,
    active = true;

  for size_value in select value from jsonb_array_elements(p_sizes)
  loop
    insert into public.product_sizes (product_id, size_label, stock, minimum)
    values (
      saved_id,
      trim(size_value ->> 'label'),
      (size_value ->> 'stock')::integer,
      (size_value ->> 'minimum')::integer
    )
    on conflict (product_id, size_label) do update set
      stock = excluded.stock,
      minimum = excluded.minimum;
  end loop;
  update public.product_sizes
  set stock = 0
  where product_id = saved_id
    and not exists (
      select 1 from jsonb_array_elements(p_sizes) value
      where trim(value ->> 'label') = public.product_sizes.size_label
    );
  return saved_id;
end;
$$;

create or replace function public.admin_adjust_stock(p_size_id uuid, p_delta integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  stock_value integer;
begin
  if not public.has_role(array['Administrator']) then raise exception 'Administrator access is required.'; end if;
  if p_delta is null or p_delta = 0 or p_delta < -5000 or p_delta > 5000 then
    raise exception 'Choose a stock adjustment from 1 to 5000 units.';
  end if;
  update public.product_sizes
  set stock = stock + p_delta
  where id = p_size_id and stock + p_delta >= 0
  returning stock into stock_value;
  if not found then raise exception 'Stock could not be adjusted; refresh and try again.'; end if;
  return stock_value;
end;
$$;

create or replace function public.admin_list_profiles()
returns table (id uuid, name text, email text, role text, group_name text, status text, initials text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role(array['Administrator']) then raise exception 'Administrator access is required.'; end if;
  return query
  select p.id, p.name, p.email, p.role, p.school_id,
    case
      when not p.active then 'Paused'
      when u.email_confirmed_at is null then 'Invited'
      else 'Active'
    end,
    upper(left(coalesce(nullif(p.name, ''), p.email), 1))
      || upper(left(split_part(coalesce(nullif(p.name, ''), p.email), ' ', 2), 1))
  from public.profiles p
  join auth.users u on u.id = p.id
  order by p.created_at desc;
end;
$$;

create or replace function public.admin_set_profile_access(p_user_id uuid, p_active boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_role text;
  target_active boolean;
begin
  perform 1 from public.app_settings where id = 1 for update;
  if not public.has_role(array['Administrator']) then raise exception 'Administrator access is required.'; end if;
  if p_user_id = auth.uid() and not p_active then raise exception 'You cannot pause your own administrator account.'; end if;
  select role, active into target_role, target_active
  from public.profiles where id = p_user_id for update;
  if not found then raise exception 'Account not found.'; end if;
  if not p_active and target_active and target_role = 'Administrator'
    and (select count(*) from public.profiles where active and role = 'Administrator') <= 1 then
    raise exception 'The last active administrator cannot be paused.';
  end if;
  update public.profiles set active = p_active where id = p_user_id;
end;
$$;

create or replace function public.admin_set_profile_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_role text;
  target_active boolean;
begin
  perform 1 from public.app_settings where id = 1 for update;
  if not public.has_role(array['Administrator']) then raise exception 'Administrator access is required.'; end if;
  if p_role not in ('Student', 'Finance', 'Administrator') then raise exception 'Choose a valid account role.'; end if;
  if p_user_id = auth.uid() and p_role <> 'Administrator' then raise exception 'You cannot remove your own administrator role.'; end if;
  select role, active into target_role, target_active
  from public.profiles where id = p_user_id for update;
  if not found then raise exception 'Account not found.'; end if;
  if target_active and target_role = 'Administrator' and p_role <> 'Administrator'
    and (select count(*) from public.profiles where active and role = 'Administrator') <= 1 then
    raise exception 'The last active administrator cannot be demoted.';
  end if;
  update public.profiles set role = p_role where id = p_user_id;
end;
$$;

create or replace function public.admin_save_settings(p_settings jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role(array['Administrator']) then raise exception 'Administrator access is required.'; end if;
  if jsonb_typeof(p_settings) is distinct from 'object'
    or jsonb_typeof(p_settings -> 'orderingEnabled') is distinct from 'boolean'
    or jsonb_typeof(p_settings -> 'paymentMethods') is distinct from 'array'
    or case
      when coalesce(p_settings ->> 'maxItemsPerOrder', '') ~ '^[0-9]+$'
        then (p_settings ->> 'maxItemsPerOrder')::numeric > 500
      else true
    end
    or length(coalesce(p_settings ->> 'announcement', '')) > 240
    or length(coalesce(p_settings ->> 'terms', '')) > 1500 then
    raise exception 'One or more campus settings are invalid.';
  end if;
  if exists (
    select 1
    from jsonb_array_elements_text(p_settings -> 'paymentMethods') as methods(method)
    where method is null or method not in ('Cash at campus', 'GCash', 'Bank transfer')
  ) then raise exception 'One or more payment methods are not supported.'; end if;
  if coalesce(p_settings ->> 'orderDeadline', '') <> ''
    and (p_settings ->> 'orderDeadline')::timestamptz is null then
    raise exception 'Enter a valid order deadline.';
  end if;
  update public.app_settings set settings = p_settings, updated_at = now() where id = 1;
end;
$$;

revoke all on function public.place_uniform_order(jsonb, text) from public;
revoke all on function public.cancel_own_order(uuid) from public;
revoke all on function public.update_order_status(uuid, text) from public;
revoke all on function public.create_order_request(uuid, text, text) from public;
revoke all on function public.resolve_order_request(uuid, text) from public;
revoke all on function public.admin_save_catalog_product(uuid, text, text, text, text, numeric, jsonb) from public;
revoke all on function public.admin_adjust_stock(uuid, integer) from public;
revoke all on function public.admin_list_profiles() from public;
revoke all on function public.admin_set_profile_access(uuid, boolean) from public;
revoke all on function public.admin_set_profile_role(uuid, text) from public;
revoke all on function public.admin_save_settings(jsonb) from public;
grant execute on function public.place_uniform_order(jsonb, text) to authenticated;
grant execute on function public.cancel_own_order(uuid) to authenticated;
grant execute on function public.update_order_status(uuid, text) to authenticated;
grant execute on function public.create_order_request(uuid, text, text) to authenticated;
grant execute on function public.resolve_order_request(uuid, text) to authenticated;
grant execute on function public.admin_save_catalog_product(uuid, text, text, text, text, numeric, jsonb) to authenticated;
grant execute on function public.admin_adjust_stock(uuid, integer) to authenticated;
grant execute on function public.admin_list_profiles() to authenticated;
grant execute on function public.admin_set_profile_access(uuid, boolean) to authenticated;
grant execute on function public.admin_set_profile_role(uuid, text) to authenticated;
grant execute on function public.admin_save_settings(jsonb) to authenticated;

insert into public.catalog_products (course, name, category, color, price_etb)
values
  ('BS Nursing', 'Nursing Uniform - Set A', 'Uniforms', 'Nursing blue', 2570),
  ('BS Nursing', 'Nursing Uniform - Set B (Clinical)', 'Uniforms', 'Clinical white', 2878.40),
  ('BS Nursing', 'Laboratory Gown', 'Layers', 'White', 620),
  ('BS Medical Laboratory Sciences', 'MedTech Uniform - Set A', 'Uniforms', 'MedTech blue', 2570),
  ('BS Medical Laboratory Sciences', 'Laboratory Gown', 'Layers', 'White', 620),
  ('BS Psychology', 'Psychology Uniform - Set A', 'Uniforms', 'Campus colors', 3180),
  ('BS Radiologic Technology', 'RadTech Uniform - Set A', 'Uniforms', 'RadTech blue', 2570),
  ('BS Radiologic Technology', 'Protective Apron', 'Layers', 'Lead gray', 480),
  ('BS Accountancy', 'Accountancy Uniform - Set A', 'Uniforms', 'Campus colors', 3180),
  ('BS Business Administration – Financial Management', 'Business Administration – Financial Management Uniform - Set A', 'Uniforms', 'Campus colors', 3180),
  ('BS Business Administration – Marketing Management', 'Business Administration – Marketing Management Uniform - Set A', 'Uniforms', 'Campus colors', 3180),
  ('BS Hospitality Management', 'Hospitality Management Uniform - Set A', 'Uniforms', 'Campus colors', 3180),
  ('BS Tourism Management', 'Tourism Management Uniform - Set A', 'Uniforms', 'Campus colors', 3180),
  ('Bachelor of Elementary Education', 'Elementary Education Uniform - Set A', 'Uniforms', 'Campus colors', 3540),
  ('Bachelor of Secondary Education – Filipino', 'Secondary Education – Filipino Uniform - Set A', 'Uniforms', 'Campus colors', 3180),
  ('Bachelor of Secondary Education – English', 'Secondary Education – English Uniform - Set A', 'Uniforms', 'Campus colors', 3180),
  ('BS Criminology', 'Criminology Uniform - Set A', 'Uniforms', 'Campus colors', 2570),
  ('BS Information Technology', 'Information Technology Uniform - Set A', 'Uniforms', 'Campus colors', 2570)
on conflict (course, name) do nothing;

do $$
declare
  product_row record;
  size_value jsonb;
  sizes_value jsonb;
begin
  for product_row in
    select id, name, course from public.catalog_products
  loop
    if product_row.name = 'Laboratory Gown' and product_row.course = 'BS Nursing' then
      sizes_value := '[{"label":"Free Size","stock":15,"minimum":3}]'::jsonb;
    elsif product_row.name = 'Laboratory Gown' then
      sizes_value := '[{"label":"S","stock":6,"minimum":2},{"label":"M","stock":10,"minimum":3},{"label":"L","stock":8,"minimum":2},{"label":"XL","stock":4,"minimum":1}]'::jsonb;
    elsif product_row.name = 'Protective Apron' then
      sizes_value := '[{"label":"M","stock":5,"minimum":1},{"label":"L","stock":5,"minimum":1},{"label":"XL","stock":3,"minimum":1}]'::jsonb;
    elsif product_row.name = 'Nursing Uniform - Set B (Clinical)' then
      sizes_value := '[{"label":"S","stock":4,"minimum":1},{"label":"M","stock":7,"minimum":2},{"label":"L","stock":5,"minimum":1},{"label":"XL","stock":2,"minimum":1}]'::jsonb;
    elsif product_row.name = 'MedTech Uniform - Set A' then
      sizes_value := '[{"label":"S","stock":5,"minimum":1},{"label":"M","stock":9,"minimum":2},{"label":"L","stock":6,"minimum":2},{"label":"XL","stock":3,"minimum":1}]'::jsonb;
    elsif product_row.name = 'Psychology Uniform - Set A' then
      sizes_value := '[{"label":"XS","stock":4,"minimum":1},{"label":"S","stock":7,"minimum":2},{"label":"M","stock":10,"minimum":3},{"label":"L","stock":5,"minimum":1},{"label":"XL","stock":2,"minimum":1}]'::jsonb;
    elsif product_row.name = 'RadTech Uniform - Set A' then
      sizes_value := '[{"label":"S","stock":3,"minimum":1},{"label":"M","stock":6,"minimum":2},{"label":"L","stock":4,"minimum":1},{"label":"XL","stock":2,"minimum":1}]'::jsonb;
    else
      sizes_value := '[{"label":"XS","stock":5,"minimum":1},{"label":"S","stock":8,"minimum":2},{"label":"M","stock":12,"minimum":3},{"label":"L","stock":6,"minimum":2},{"label":"XL","stock":3,"minimum":1}]'::jsonb;
    end if;

    for size_value in select value from jsonb_array_elements(sizes_value)
    loop
      insert into public.product_sizes (product_id, size_label, stock, minimum)
      values (
        product_row.id,
        size_value ->> 'label',
        (size_value ->> 'stock')::integer,
        (size_value ->> 'minimum')::integer
      )
      on conflict (product_id, size_label) do nothing;
    end loop;
  end loop;
end;
$$;
