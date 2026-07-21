-- Beta security hardening.
-- The legacy profiles table is only a public nickname fallback for forum
-- authors. It must not expose e-mail, roles, or profile metadata through the
-- anon/authenticated PostgREST roles.

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;

grant select (id, nickname) on table public.profiles to anon;
grant select (id, nickname, nickname_changed_at, created_at, updated_at)
on table public.profiles to authenticated;
grant insert (id, nickname) on table public.profiles to authenticated;
grant update (nickname, nickname_changed_at, updated_at)
on table public.profiles to authenticated;

drop policy if exists "Public profiles expose nickname only" on public.profiles;
create policy "Public profiles expose nickname only"
on public.profiles
for select
to anon, authenticated
using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
