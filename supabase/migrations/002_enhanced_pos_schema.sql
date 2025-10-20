-- Create categories table
create table categories (
  id uuid default gen_random_uuid() primary key,
  name varchar(255) not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create suppliers table
create table suppliers (
  id uuid default gen_random_uuid() primary key,
  name varchar(255) not null,
  contact_person varchar(255),
  phone varchar(50),
  email varchar(255),
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enhanced products table with category and supplier references
create table products (
  id uuid default gen_random_uuid() primary key,
  name varchar(255) not null,
  description text,
  price decimal(10,2) not null,
  cost decimal(10,2) default 0.00,
  quantity integer not null default 0,
  min_stock_level integer default 0,
  category_id uuid references categories(id),
  supplier_id uuid references suppliers(id),
  barcode varchar(100) unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create customers table
create table customers (
  id uuid default gen_random_uuid() primary key,
  name varchar(255) not null,
  phone varchar(50),
  email varchar(255),
  address text,
  loyalty_points integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enhanced transactions table with customer reference
create table transactions (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references customers(id),
  customer_name varchar(255),
  total_amount decimal(10,2) not null,
  discount_amount decimal(10,2) default 0.00,
  tax_amount decimal(10,2) default 0.00,
  payment_method varchar(50) not null, -- cash, card, mobile
  status varchar(50) default 'completed', -- completed, pending, cancelled
  reference_number varchar(100) unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enhanced transaction_items table with more details
create table transaction_items (
  id uuid default gen_random_uuid() primary key,
  transaction_id uuid references transactions(id) on delete cascade,
  product_id uuid references products(id),
  quantity integer not null,
  unit_price decimal(10,2) not null,
  total_price decimal(10,2) not null,
  discount_amount decimal(10,2) default 0.00
);

-- Create expenses table
create table expenses (
  id uuid default gen_random_uuid() primary key,
  description varchar(255) not null,
  amount decimal(10,2) not null,
  category varchar(100),
  payment_method varchar(50),
  receipt_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create employees table
create table employees (
  id uuid default gen_random_uuid() primary key,
  name varchar(255) not null,
  email varchar(255) unique,
  phone varchar(50),
  role varchar(100) not null, -- admin, cashier, manager
  salary decimal(10,2),
  hire_date date,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create sessions table for tracking user sessions
create table sessions (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references employees(id),
  start_time timestamp with time zone default timezone('utc'::text, now()) not null,
  end_time timestamp with time zone,
  opening_balance decimal(10,2) default 0.00,
  closing_balance decimal(10,2) default 0.00,
  notes text
);

-- Create indexes for better performance
create index on products(category_id);
create index on products(supplier_id);
create index on products(barcode);
create index on transactions(customer_id);
create index on transactions(created_at);
create index on transaction_items(transaction_id);
create index on transaction_items(product_id);
create index on expenses(created_at);
create index on sessions(employee_id);
create index on sessions(start_time);

-- Enable RLS (Row Level Security)
alter table categories enable row level security;
alter table suppliers enable row level security;
alter table customers enable row level security;
alter table expenses enable row level security;
alter table employees enable row level security;
alter table sessions enable row level security;

-- Create policies for categories
create policy "Users can view categories" on categories for select using (true);
create policy "Users can insert categories" on categories for insert with check (true);
create policy "Users can update categories" on categories for update using (true);
create policy "Users can delete categories" on categories for delete using (true);

-- Create policies for suppliers
create policy "Users can view suppliers" on suppliers for select using (true);
create policy "Users can insert suppliers" on suppliers for insert with check (true);
create policy "Users can update suppliers" on suppliers for update using (true);
create policy "Users can delete suppliers" on suppliers for delete using (true);

-- Create policies for customers
create policy "Users can view customers" on customers for select using (true);
create policy "Users can insert customers" on customers for insert with check (true);
create policy "Users can update customers" on customers for update using (true);
create policy "Users can delete customers" on customers for delete using (true);

-- Create policies for expenses
create policy "Users can view expenses" on expenses for select using (true);
create policy "Users can insert expenses" on expenses for insert with check (true);
create policy "Users can update expenses" on expenses for update using (true);
create policy "Users can delete expenses" on expenses for delete using (true);

-- Create policies for employees
create policy "Users can view employees" on employees for select using (true);
create policy "Users can insert employees" on employees for insert with check (true);
create policy "Users can update employees" on employees for update using (true);
create policy "Users can delete employees" on employees for delete using (true);