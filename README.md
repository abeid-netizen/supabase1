# Business POS System with Supabase

A modern Point of Sale system built with React, TypeScript, and Supabase.

## Features

- User authentication with Supabase Auth
- Inventory management
- Sales processing
- Transaction history
- Responsive UI with shadcn-ui components

## Tech Stack

- React + TypeScript
- Vite (build tool)
- Supabase (backend-as-a-service)
- shadcn-ui + Tailwind CSS (UI components)
- React Router (routing)

## Setup Instructions

### 1. Supabase Setup

1. Create a Supabase account at [supabase.com](https://supabase.com/)
2. Create a new project
3. Get your Project URL and anon key from the Supabase dashboard (Project Settings > API)

### 2. Environment Variables

Create a [.env](file:///E:/PROJECTS/LOVABLE/bulletproofPOS/sheet-point-dash-SUPABASE/.env) file in the root directory with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

Run the SQL commands in your Supabase SQL Editor to create the necessary tables:

```sql
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
```

## Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Visit `http://localhost:8080` in your browser

## Deployment

### Deploy to Netlify

1. Push your code to a GitHub repository
2. Sign up for a Netlify account at [netlify.com](https://netlify.com/)
3. Click "New site from Git" in your Netlify dashboard
4. Connect your GitHub repository
5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add your environment variables in the Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Deploy the site

### Manual Deployment

1. Build the project:
   ```
   npm run build
   ```

2. The built files will be in the `dist` directory
3. Upload these files to any static hosting service

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn-ui components
│   ├── DashboardCard.tsx
│   ├── LoginForm.tsx
│   └── Navigation.tsx
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
│   └── supabase.ts     # Supabase client configuration
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── Index.tsx
│   ├── InventoryDashboard.tsx
│   ├── NotFound.tsx
│   ├── SalesCart.tsx
│   └── SalesDashboard.tsx
├── services/           # Business logic and API services
│   ├── authService.ts
│   └── productService.ts
└── App.tsx             # Main app component
```