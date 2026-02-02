-- Users Table
-- Supabase handles auth.users, but we need a public profile table.
-- We use a trigger to automatically create a profile when a new user signs up.

create table public.users (
  id uuid references auth.users not null primary key,
  name text,
  email text unique not null,
  plan text default 'free' check (plan in ('free', 'pro', 'business')),
  credits int default 3,
  stripe_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;

-- Policies
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- Projects Table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  width numeric not null,
  height numeric not null,
  design_json jsonb default '{}'::jsonb,
  settings_json jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.projects enable row level security;

-- Policies
create policy "Users can CRUD their own projects" on public.projects
  for all using (auth.uid() = user_id);

-- Exports Table
create table public.exports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null,
  file_url text not null,
  type text check (type in ('svg', 'dxf')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.exports enable row level security;

-- Policies
create policy "Users can view their own exports" on public.exports
  for select using (auth.uid() = user_id);

-- Subscriptions Table (Sync with Stripe)
create table public.subscriptions (
  id text primary key, -- Stripe Subscription ID
  user_id uuid references public.users(id) on delete cascade not null,
  status text check (status in ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
  plan text not null,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- Policies
create policy "Users can view their own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Trigger to create user profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_users_updated_at before update on public.users for each row execute procedure update_updated_at_column();
create trigger update_projects_updated_at before update on public.projects for each row execute procedure update_updated_at_column();
