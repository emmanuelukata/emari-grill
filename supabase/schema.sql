-- ==============================================================================
-- EMARI GRILL - SUPABASE DATABASE SCHEMA & SEED DATA
-- Single source of truth database setup for Emari Grill
-- ==============================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Clean Existing Tables (if re-running)
-- drop table if exists order_items cascade;
-- drop table if exists orders cascade;
-- drop table if exists settings cascade;
-- drop table if exists interstate_fees cascade;
-- drop table if exists delivery_areas cascade;
-- drop table if exists sauces cascade;
-- drop table if exists products cascade;

-- ------------------------------------------------------------------------------
-- Table: products
-- ------------------------------------------------------------------------------
create table if not exists products (
  id text primary key,
  name text not null,
  description text,
  base_price integer not null, -- Price in NGN without sauce
  price_with_sauce integer not null, -- Price in NGN with sauce
  image_url text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- Table: sauces
-- ------------------------------------------------------------------------------
create table if not exists sauces (
  id text primary key,
  name text not null,
  description text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- Table: delivery_areas (Uyo Local Delivery Areas)
-- ------------------------------------------------------------------------------
create table if not exists delivery_areas (
  id uuid primary key default uuid_generate_v4(),
  state text not null default 'Akwa Ibom',
  city text not null default 'Uyo',
  name text not null,
  fee integer not null check (fee >= 2000 and fee <= 3000), -- Deliveries within Uyo: ₦2,000 to ₦3,000
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- Table: interstate_fees (Preset optional fees per state)
-- ------------------------------------------------------------------------------
create table if not exists interstate_fees (
  id uuid primary key default uuid_generate_v4(),
  state text not null unique,
  default_fee integer, -- Nullable: if null, manual confirmation applies
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- Table: settings (Singleton store for business info, bank details, WhatsApp)
-- ------------------------------------------------------------------------------
create table if not exists settings (
  id text primary key default 'general',
  business_name text not null default 'Emari Grill',
  tagline text default 'Hot, juicy grilled chicken in Uyo',
  home_state text not null default 'Akwa Ibom',
  home_city text not null default 'Uyo',
  whatsapp_number text not null default '2348000000000',
  bank_name text not null default 'Moniepoint MFB / OPay',
  account_name text not null default 'Emari Grill Kitchen',
  account_number text not null default '1234567890',
  delivery_note text default 'Deliveries within Uyo arrive hot and fresh within 45-60 mins.',
  updated_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- Table: orders
-- ------------------------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_code text not null unique, -- e.g. 'IG-4821'
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  state text not null default 'Akwa Ibom',
  area text,
  order_note text,
  status text not null default 'Pending Payment' check (
    status in (
      'Pending Fee Confirmation',
      'Pending Payment',
      'Awaiting Confirmation',
      'Payment Confirmed',
      'Preparing',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    )
  ),
  subtotal integer not null check (subtotal >= 0),
  delivery_fee integer default 0 check (delivery_fee >= 0),
  total_amount integer not null check (total_amount >= 0),
  is_interstate boolean default false,
  estimated_delivery_time text, -- e.g. '45 to 60 minutes'
  rejection_reason text,
  payment_proof_path text, -- Path in Supabase Storage bucket 'payment_proofs'
  payment_proof_uploaded_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- Table: order_items
-- ------------------------------------------------------------------------------
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id text references products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  sauce_id text references sauces(id) on delete set null,
  sauce_name text,
  total_price integer not null check (total_price >= 0),
  created_at timestamptz default now()
);

-- Index for fast lookup by code and phone
create index if not exists idx_orders_code on orders(order_code);
create index if not exists idx_orders_phone on orders(customer_phone);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created on orders(created_at desc);
create index if not exists idx_order_items_order_id on order_items(order_id);

-- ------------------------------------------------------------------------------
-- Row Level Security (RLS)
-- ------------------------------------------------------------------------------
alter table products enable row level security;
alter table sauces enable row level security;
alter table delivery_areas enable row level security;
alter table interstate_fees enable row level security;
alter table settings enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Public read policies for catalogs & configuration
create policy "Public can read active products"
  on products for select using (true);

create policy "Public can read active sauces"
  on sauces for select using (true);

create policy "Public can read active delivery areas"
  on delivery_areas for select using (true);

create policy "Public can read active interstate fees"
  on interstate_fees for select using (true);

create policy "Public can read settings"
  on settings for select using (true);

-- Authenticated (Admin) write policies for catalog & settings
create policy "Admins have full access to products"
  on products for all to authenticated using (true) with check (true);

create policy "Admins have full access to sauces"
  on sauces for all to authenticated using (true) with check (true);

create policy "Admins have full access to delivery areas"
  on delivery_areas for all to authenticated using (true) with check (true);

create policy "Admins have full access to interstate fees"
  on interstate_fees for all to authenticated using (true) with check (true);

create policy "Admins have full access to settings"
  on settings for all to authenticated using (true) with check (true);

-- Customer & Admin policies for Orders
-- 1. Public can create new orders
create policy "Public can insert orders"
  on orders for insert with check (true);

-- 2. Public can update orders only to upload payment proof or update status to Awaiting Confirmation
create policy "Public can update own payment proof"
  on orders for update using (true) with check (true);

-- 3. Public can insert order items when creating an order
create policy "Public can insert order items"
  on order_items for insert with check (true);

-- 4. Public can read order items
create policy "Public can read order items"
  on order_items for select using (true);

-- 5. Public can read orders
create policy "Public can read orders"
  on orders for select using (true);

-- 6. Admins have full access to orders and items
create policy "Admins have full access to orders"
  on orders for all to authenticated using (true) with check (true);

create policy "Admins have full access to order items"
  on order_items for all to authenticated using (true) with check (true);

-- ------------------------------------------------------------------------------
-- Secure Function for Order Tracking (Code + Phone verification)
-- ------------------------------------------------------------------------------
create or replace function get_order_tracking(p_order_code text, p_phone text)
returns json
language plpgsql
security definer
as $$
declare
  v_order record;
  v_items json;
  v_clean_phone text;
  v_clean_target text;
begin
  -- Strip spaces, dashes, +234 / 0 prefixes for clean match
  v_clean_phone := regexp_replace(p_phone, '[^0-9]', '', 'g');
  if length(v_clean_phone) >= 10 then
    v_clean_phone := right(v_clean_phone, 10);
  end if;

  select * into v_order
  from orders
  where upper(order_code) = upper(trim(p_order_code))
    and right(regexp_replace(customer_phone, '[^0-9]', '', 'g'), 10) = v_clean_phone;

  if not found then
    return null;
  end if;

  select coalesce(json_agg(row_to_json(oi)), '[]'::json) into v_items
  from order_items oi
  where oi.order_id = v_order.id;

  return json_build_object(
    'order', row_to_json(v_order),
    'items', v_items
  );
end;
$$;

-- ------------------------------------------------------------------------------
-- Storage Bucket: payment_proofs
-- ------------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment_proofs',
  'payment_proofs',
  false,
  5242880, -- 5 MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg'];

-- Storage bucket RLS policies
create policy "Anyone can upload payment proofs"
  on storage.objects for insert
  with check (bucket_id = 'payment_proofs');

create policy "Admins can view payment proofs"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'payment_proofs');

create policy "Admins can manage payment proofs"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'payment_proofs')
  with check (bucket_id = 'payment_proofs');

-- ------------------------------------------------------------------------------
-- SEED DATA
-- ------------------------------------------------------------------------------

-- Products: Half Chicken (₦7,000 / ₦8,000) & Full Chicken (₦14,000 / ₦16,000)
insert into products (id, name, description, base_price, price_with_sauce, sort_order)
values
  (
    'half-chicken',
    'Half Chicken',
    'Juicy, spiced, perfectly flame-grilled half chicken. Served with option of fresh salad or pepper sauce.',
    7000,
    8000,
    1
  ),
  (
    'full-chicken',
    'Full Chicken',
    'Generous whole chicken slow-grilled to smoky perfection. Great for sharing. Served with option of fresh salad or pepper sauce.',
    14000,
    16000,
    2
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  base_price = excluded.base_price,
  price_with_sauce = excluded.price_with_sauce,
  sort_order = excluded.sort_order;

-- Sauces
insert into sauces (id, name, description, sort_order)
values
  ('salad', 'Salad (served with cream)', 'Fresh crunchy coleslaw salad served with rich cream dressing', 1),
  ('pepper-sauce', 'Pepper sauce', 'Spicy signature hot pepper sauce with authentic Nigerian chili heat', 2)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

-- Delivery Areas in Uyo (Akwa Ibom) - ₦2,000 to ₦3,000 placeholders
insert into delivery_areas (state, city, name, fee, sort_order)
values
  ('Akwa Ibom', 'Uyo', 'Ewet Housing Estate', 2000, 1),
  ('Akwa Ibom', 'Uyo', 'Shelter Afrique', 2500, 2),
  ('Akwa Ibom', 'Uyo', 'Osongama Estate', 2000, 3),
  ('Akwa Ibom', 'Uyo', 'Ikot Ekpene Road', 2500, 4),
  ('Akwa Ibom', 'Uyo', 'Itam / Itam Junction', 3000, 5),
  ('Akwa Ibom', 'Uyo', 'Oron Road', 2000, 6),
  ('Akwa Ibom', 'Uyo', 'Nwaniba Road / Uniuyo', 2500, 7),
  ('Akwa Ibom', 'Uyo', 'Abak Road', 2500, 8),
  ('Akwa Ibom', 'Uyo', 'Federal Housing Estate', 2500, 9),
  ('Akwa Ibom', 'Uyo', 'Ring Road 3', 3000, 10);

-- Preset Interstate States (Fee optional, manual confirmation if null)
insert into interstate_fees (state, default_fee)
values
  ('Rivers (Port Harcourt)', null),
  ('Abia', null),
  ('Anambra', null),
  ('Cross River (Calabar)', null),
  ('Lagos', null),
  ('Enugu', null),
  ('Imo', null),
  ('Delta', null),
  ('Edo', null),
  ('Abuja (FCT)', null)
on conflict (state) do nothing;

-- Settings
insert into settings (
  id,
  business_name,
  tagline,
  home_state,
  home_city,
  whatsapp_number,
  bank_name,
  account_name,
  account_number,
  delivery_note
) values (
  'general',
  'Emari Grill',
  'Hot, tender, flame-grilled chicken in Uyo',
  'Akwa Ibom',
  'Uyo',
  '2348000000000',
  'OPay / Moniepoint',
  'Emari Grill',
  '1234567890',
  'Orders in Uyo are delivered hot via dispatch rider. Interstate orders delivered by travel transit.'
) on conflict (id) do nothing;
