create table if not exists trades (
  id uuid primary key default gen_random_uuid(),
  intake_id text unique not null,
  queue_number int not null,
  qr_slug text unique not null,
  shopify_customer_id text,
  customer_name text,
  customer_phone text,
  customer_email text,
  sortswift_order_no text,
  est_item_count int,
  notes text,
  status text not null default 'OPEN',
  checkin_at timestamptz default now(),
  started_at timestamptz,
  ready_at timestamptz,
  paid_at timestamptz,
  staff_checkin text,
  staff_processor text,
  staff_cashier text,
  cash_value_cents int,
  credit_value_cents int,
  payout_type text,
  meta jsonb default '{}'::jsonb
);
create table if not exists trade_events (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid references trades(id) on delete cascade,
  event_type text,
  payload jsonb,
  actor text,
  created_at timestamptz default now()
);
create table if not exists store_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  shopify_customer_id text not null,
  delta_cents int not null,
  reason text,
  reference text,
  actor text,
  created_at timestamptz default now()
);
