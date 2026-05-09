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

-- ----------------------------------------------------------------------------
-- Funnel tracking — one row per browser-flow, advances as user progresses.
-- Lets admin see "people who entered CVR but didn't submit" and group by CVR.
-- ----------------------------------------------------------------------------

create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  client_id text not null unique,
  created_at timestamptz default now() not null,
  last_seen_at timestamptz default now() not null,
  source_path text,
  cvr text,
  company text,
  furthest_step text default 'started' not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  user_agent text,
  referrer text,
  metadata jsonb default '{}'::jsonb not null
);

create index if not exists sessions_client_id_idx on sessions (client_id);
create index if not exists sessions_cvr_idx on sessions (cvr);
create index if not exists sessions_last_seen_idx on sessions (last_seen_at desc);
create index if not exists sessions_furthest_step_idx on sessions (furthest_step);

-- Bump last_seen_at on every UPDATE.
create or replace function touch_last_seen_at() returns trigger as $$
begin
  new.last_seen_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists sessions_touch on sessions;
create trigger sessions_touch
  before update on sessions
  for each row
  execute function touch_last_seen_at();

-- Connect events to sessions (so we can replay an individual session's funnel).
alter table events
  add column if not exists session_id uuid references sessions(id) on delete set null;

create index if not exists events_session_id_idx on events (session_id);

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
