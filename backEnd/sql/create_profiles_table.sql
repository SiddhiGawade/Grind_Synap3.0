-- Supabase profiles table schema
-- Run this in your Supabase SQL editor to create the profiles table

-- Create profiles table to store user metadata
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role text not null check (role in ('participant', 'judge', 'creator', 'organizer')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for better query performance
create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_role_idx on public.profiles (role);
create unique index if not exists profiles_email_unique_idx on public.profiles (lower(email));

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies for RLS
-- Users can read their own profile
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

-- Users can update their own profile (except role - role changes should be admin-only)
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Allow service role to manage all profiles (for backend operations)
create policy "Service role can manage profiles" on public.profiles
  for all using (auth.role() = 'service_role');

-- Create function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'participant')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically create profile when user signs up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to update updated_at on profile changes
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();
