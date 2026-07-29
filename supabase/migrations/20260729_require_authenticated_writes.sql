-- Blocks unauthenticated HTTP requests made directly against Supabase.
-- The app currently uses the public anon key from the browser, so database
-- row-level security is the actual authorization boundary.

alter table public.sessions
add column if not exists user_id uuid references auth.users(id);

alter table public.sessions
alter column user_id set default auth.uid();

create table if not exists public.bankroll_adjustments (
	id uuid primary key default gen_random_uuid(),
	date date not null,
	amount numeric not null,
	type text not null check (type in ('deposit', 'withdrawal')),
	note text,
	created_at timestamptz not null default now(),
	user_id uuid references auth.users(id) default auth.uid()
);

alter table public.bankroll_adjustments
add column if not exists user_id uuid references auth.users(id);

alter table public.bankroll_adjustments
alter column user_id set default auth.uid();

create index if not exists sessions_user_id_idx on public.sessions (user_id);
create index if not exists bankroll_adjustments_user_id_idx on public.bankroll_adjustments (user_id);

alter table public.sessions enable row level security;
alter table public.bankroll_adjustments enable row level security;

drop policy if exists "Authenticated users can read sessions" on public.sessions;
drop policy if exists "Authenticated users can insert sessions" on public.sessions;
drop policy if exists "Authenticated users can update sessions" on public.sessions;
drop policy if exists "Authenticated users can delete sessions" on public.sessions;

create policy "Authenticated users can read sessions"
on public.sessions
for select
to authenticated
using (user_id = auth.uid());

create policy "Authenticated users can insert sessions"
on public.sessions
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Authenticated users can update sessions"
on public.sessions
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Authenticated users can delete sessions"
on public.sessions
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "Authenticated users can read bankroll adjustments" on public.bankroll_adjustments;
drop policy if exists "Authenticated users can insert bankroll adjustments" on public.bankroll_adjustments;
drop policy if exists "Authenticated users can update bankroll adjustments" on public.bankroll_adjustments;
drop policy if exists "Authenticated users can delete bankroll adjustments" on public.bankroll_adjustments;

create policy "Authenticated users can read bankroll adjustments"
on public.bankroll_adjustments
for select
to authenticated
using (user_id = auth.uid());

create policy "Authenticated users can insert bankroll adjustments"
on public.bankroll_adjustments
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Authenticated users can update bankroll adjustments"
on public.bankroll_adjustments
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Authenticated users can delete bankroll adjustments"
on public.bankroll_adjustments
for delete
to authenticated
using (user_id = auth.uid());

-- Existing rows need to be backfilled to an owner uuid in Supabase once you know
-- which authenticated user should own the historical data.