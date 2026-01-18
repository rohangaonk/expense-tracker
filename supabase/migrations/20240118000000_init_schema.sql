-- Create a table for public profiles using Supabase structure
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS) for profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create expenses table
create table expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  amount decimal(10,2) not null,
  currency text default 'INR' not null,
  category text not null,
  description text not null,
  merchant text,
  payment_method text, -- 'cash', 'card', 'upi', 'wallet', 'bank_transfer'
  tags text[],
  date date not null,
  time time,
  is_synced boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for expenses
alter table expenses enable row level security;

create policy "Users can view own expenses." on expenses
  for select using (auth.uid() = user_id);

create policy "Users can insert own expenses." on expenses
  for insert with check (auth.uid() = user_id);

create policy "Users can update own expenses." on expenses
  for update using (auth.uid() = user_id);

create policy "Users can delete own expenses." on expenses
  for delete using (auth.uid() = user_id);

-- Create sync_queue table for offline support
create table sync_queue (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  operation text not null check (operation in ('create', 'update', 'delete')),
  table_name text not null,
  record_id uuid not null,
  data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  synced_at timestamp with time zone
);

-- RLS for sync_queue
alter table sync_queue enable row level security;

create policy "Users can view own sync queue." on sync_queue
  for select using (auth.uid() = user_id);

create policy "Users can insert own sync queue items." on sync_queue
  for insert with check (auth.uid() = user_id);

create policy "Users can update own sync queue items." on sync_queue
  for update using (auth.uid() = user_id);

create policy "Users can delete own sync queue items." on sync_queue
  for delete using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
