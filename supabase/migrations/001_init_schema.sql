-- Create products table
create table products (
  id uuid default gen_random_uuid() primary key,
  name varchar(255) not null,
  price decimal(10,2) not null,
  quantity integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transactions table
create table transactions (
  id uuid default gen_random_uuid() primary key,
  customer_name varchar(255) not null,
  total_amount decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transaction_items table
create table transaction_items (
  id uuid default gen_random_uuid() primary key,
  transaction_id uuid references transactions(id) on delete cascade,
  product_id uuid references products(id),
  quantity integer not null,
  price decimal(10,2) not null
);

-- Create indexes
create index on products(name);
create index on transactions(created_at);
create index on transaction_items(transaction_id);
create index on transaction_items(product_id);

-- Enable RLS (Row Level Security)
alter table products enable row level security;
alter table transactions enable row level security;
alter table transaction_items enable row level security;

-- Create policies for products
create policy "Users can view products" on products for select using (true);
create policy "Users can insert products" on products for insert with check (true);
create policy "Users can update products" on products for update using (true);
create policy "Users can delete products" on products for delete using (true);

-- Create policies for transactions
create policy "Users can view transactions" on transactions for select using (true);
create policy "Users can insert transactions" on transactions for insert with check (true);

-- Create policies for transaction_items
create policy "Users can view transaction items" on transaction_items for select using (true);
create policy "Users can insert transaction items" on transaction_items for insert with check (true);