-- Nordan Risk Partners — leads + events tracking (Neon Postgres)
--
-- Run this once after connecting Neon to the Vercel project.
-- Open Neon Console → SQL Editor → paste this whole file → Run.
-- All statements are idempotent so re-running is safe.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'lead_source') then
    create type lead_source as enum (
      'kontakt',
      'hero',
      'analyse',
      'hole_in_one',
      'sign'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type lead_status as enum (
      'new',
      'partial',
      'completed',
      'quoted',
      'won',
      'lost'
    );
  end if;
end $$;

create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  source lead_source not null,
  status lead_status default 'new' not null,
  name text,
  email text not null,
  phone text,
  company text,
  cvr text,
  audit_id text,
  payload jsonb default '{}'::jsonb not null,
  notes text
);

create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references leads(id) on delete cascade,
  created_at timestamptz default now() not null,
  type text not null,
  metadata jsonb default '{}'::jsonb not null
);

create index if not exists leads_created_at_idx on leads (created_at desc);
create index if not exists leads_email_idx on leads (email);
create index if not exists leads_audit_id_idx on leads (audit_id);
create index if not exists leads_status_idx on leads (status);
create index if not exists events_lead_id_idx on events (lead_id);
create index if not exists events_created_at_idx on events (created_at desc);

-- Auto-bump updated_at when leads row changes.
create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_touch on leads;
create trigger leads_touch
  before update on leads
  for each row
  execute function touch_updated_at();

-- Neon connection uses DATABASE_URL with full credentials. We never expose
-- a public-facing client to the DB, so RLS isn't necessary.
