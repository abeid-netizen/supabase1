#!/usr/bin/env node

// This script provides guidance for setting up Supabase with this project

console.log(`
=====================================
Supabase Setup Guide
=====================================

1. Create a Supabase account:
   - Go to https://supabase.com/
   - Sign up for a free account
   - Create a new project

2. Get your project credentials:
   - In your Supabase dashboard, go to Project Settings > API
   - Copy your Project URL and anon key

3. Create a .env file:
   - Copy .env.example to .env
   - Replace the placeholder values with your actual Supabase credentials

4. Run database migrations:
   - Install the Supabase CLI: npm install -g supabase
   - Link your project: supabase link --project-ref YOUR_PROJECT_ID
   - Run migrations: supabase db push

5. Start the development server:
   - Run: npm run dev
   - Visit: http://localhost:8080

For detailed documentation, visit: https://supabase.com/docs
`);