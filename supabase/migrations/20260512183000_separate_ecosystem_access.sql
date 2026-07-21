-- Separate access records for each PrivacyLog product while preserving one
-- Supabase Auth project. A user only receives access to a product when the
-- matching product profile exists and is active. Ecosystem admins bypass all
-- product gates.

create table if not exists public.ecosystem_admins (
  email text primary key,
  full_access boolean not null default true,
  can_forum boolean not null default true,
  can_lounge boolean not null default true,
  can_club boolean not null default true,
  can_studio boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.ecosystem_admins (
  email,
  full_access,
  can_forum,
  can_lounge,
  can_club,
  can_studio,
  active
)
values (
  'contato@privacylog.com.br',
  true,
  true,
  true,
  true,
  true,
  true
)
on conflict (email) do update
set
  full_access = true,
  can_forum = true,
  can_lounge = true,
  can_club = true,
  can_studio = true,
  active = true,
  updated_at = now();

create table if not exists public.forum_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text unique,
  role text not null default 'member',
  status text not null default 'active',
  nickname_changed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lounge_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'advertiser',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.club_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'model',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'clinic_owner',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.forum_profiles
  add column if not exists nickname text unique,
  add column if not exists role text not null default 'member',
  add column if not exists status text not null default 'active',
  add column if not exists nickname_changed_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.lounge_profiles
  add column if not exists role text not null default 'advertiser',
  add column if not exists status text not null default 'active',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.club_profiles
  add column if not exists role text not null default 'model',
  add column if not exists status text not null default 'active',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.studio_profiles
  add column if not exists role text not null default 'clinic_owner',
  add column if not exists status text not null default 'active',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists forum_profiles_status_idx on public.forum_profiles(status);
create index if not exists lounge_profiles_status_idx on public.lounge_profiles(status);
create index if not exists club_profiles_status_idx on public.club_profiles(status);
create index if not exists studio_profiles_status_idx on public.studio_profiles(status);

insert into public.forum_profiles (
  user_id,
  nickname,
  role,
  status,
  nickname_changed_at,
  created_at,
  updated_at
)
select
  coalesce(profile.user_id, profile.id),
  profile.nickname,
  'member',
  'active',
  profile.nickname_changed_at,
  coalesce(profile.created_at, now()),
  coalesce(profile.updated_at, now())
from public.profiles profile
where coalesce(profile.user_id, profile.id) is not null
  and profile.nickname is not null
on conflict (user_id) do update
set
  nickname = coalesce(excluded.nickname, public.forum_profiles.nickname),
  updated_at = now();

create or replace function public.is_ecosystem_admin(target_product text default null)
returns boolean
language sql
stable
set search_path = public
as $$
  with current_identity as (
    select lower(coalesce(auth.jwt() ->> 'email', '')) as email
  )
  select coalesce(
    nullif(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'owner')
    or coalesce(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
    or (select email from current_identity) = 'contato@privacylog.com.br'
    or exists (
      select 1
      from public.ecosystem_admins ecosystem_admin
      join current_identity on current_identity.email = lower(ecosystem_admin.email)
      where ecosystem_admin.active = true
        and (
          ecosystem_admin.full_access = true
          or target_product is null
          or case lower(target_product)
            when 'forum' then ecosystem_admin.can_forum
            when 'lounge' then ecosystem_admin.can_lounge
            when 'club' then ecosystem_admin.can_club
            when 'studio' then ecosystem_admin.can_studio
            else false
          end
        )
    ),
    false
  );
$$;

grant execute on function public.is_ecosystem_admin(text) to anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select coalesce(
    public.is_ecosystem_admin(null)
    or exists (
      select 1
      from public.admin_users admin_user
      where admin_user.active = true
        and lower(admin_user.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    ),
    false
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.has_product_access(product_name text)
returns boolean
language plpgsql
stable
set search_path = public
as $$
declare
  product text := lower(btrim(coalesce(product_name, '')));
begin
  if auth.uid() is null then
    return false;
  end if;

  if public.is_ecosystem_admin(product) then
    return true;
  end if;

  if product = 'forum' then
    return exists (
      select 1 from public.forum_profiles
      where user_id = auth.uid()
        and status = 'active'
    );
  elsif product = 'lounge' then
    return exists (
      select 1 from public.lounge_profiles
      where user_id = auth.uid()
        and status = 'active'
    );
  elsif product = 'club' then
    return exists (
      select 1 from public.club_profiles
      where user_id = auth.uid()
        and status = 'active'
    );
  elsif product = 'studio' then
    return exists (
      select 1 from public.studio_profiles
      where user_id = auth.uid()
        and status = 'active'
    );
  end if;

  return false;
end;
$$;

grant execute on function public.has_product_access(text) to anon, authenticated;

create or replace function public.create_product_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  product text := lower(coalesce(new.raw_user_meta_data ->> 'product', ''));
  account_type text := lower(coalesce(new.raw_user_meta_data ->> 'account_type', ''));
  raw_nickname text := nullif(btrim(coalesce(new.raw_user_meta_data ->> 'nickname', '')), '');
  fallback_nickname text := 'usuario-' || substr(replace(new.id::text, '-', ''), 1, 8);
begin
  if product = '' and account_type = 'club_model' then
    product := 'club';
  end if;

  if product = 'forum' then
    insert into public.forum_profiles (user_id, nickname, role, status)
    values (new.id, coalesce(raw_nickname, fallback_nickname), 'member', 'active')
    on conflict (user_id) do update
    set
      nickname = coalesce(excluded.nickname, public.forum_profiles.nickname),
      status = 'active',
      updated_at = now();

    insert into public.profiles (id, nickname)
    values (new.id, coalesce(raw_nickname, fallback_nickname))
    on conflict (id) do update
    set
      nickname = coalesce(excluded.nickname, public.profiles.nickname),
      updated_at = now();
  elsif product = 'lounge' then
    insert into public.lounge_profiles (user_id, role, status)
    values (new.id, 'advertiser', 'active')
    on conflict (user_id) do update set status = 'active', updated_at = now();
  elsif product = 'club' then
    insert into public.club_profiles (user_id, role, status)
    values (new.id, 'model', 'active')
    on conflict (user_id) do update set status = 'active', updated_at = now();
  elsif product = 'studio' then
    insert into public.studio_profiles (user_id, role, status)
    values (new.id, 'clinic_owner', 'active')
    on conflict (user_id) do update set status = 'active', updated_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists create_product_profile_after_signup on auth.users;
create trigger create_product_profile_after_signup
after insert on auth.users
for each row execute function public.create_product_profile_for_new_user();

alter table public.ecosystem_admins enable row level security;
alter table public.forum_profiles enable row level security;
alter table public.lounge_profiles enable row level security;
alter table public.club_profiles enable row level security;
alter table public.studio_profiles enable row level security;

grant select on table public.ecosystem_admins to authenticated;

grant select (user_id, nickname) on table public.forum_profiles to anon;
grant select, insert, update on table public.forum_profiles to authenticated;
grant select, insert, update on table public.lounge_profiles to authenticated;
grant select, insert, update on table public.club_profiles to authenticated;
grant select, insert, update on table public.studio_profiles to authenticated;

drop policy if exists "Ecosystem admins read own access" on public.ecosystem_admins;
create policy "Ecosystem admins read own access"
on public.ecosystem_admins
for select
to authenticated
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or nullif(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'owner')
  or coalesce(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
);

drop policy if exists "Ecosystem admins manage access" on public.ecosystem_admins;
create policy "Ecosystem admins manage access"
on public.ecosystem_admins
for all
to authenticated
using (
  nullif(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'owner')
  or coalesce(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
  or lower(coalesce(auth.jwt() ->> 'email', '')) = 'contato@privacylog.com.br'
)
with check (
  nullif(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'owner')
  or coalesce(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
  or lower(coalesce(auth.jwt() ->> 'email', '')) = 'contato@privacylog.com.br'
);

drop policy if exists "Public forum nicknames are readable" on public.forum_profiles;
create policy "Public forum nicknames are readable"
on public.forum_profiles
for select
to anon, authenticated
using (true);

drop policy if exists "Forum users insert own profile" on public.forum_profiles;
create policy "Forum users insert own profile"
on public.forum_profiles
for insert
to authenticated
with check (user_id = auth.uid() or public.is_ecosystem_admin('forum'));

drop policy if exists "Forum users update own profile" on public.forum_profiles;
create policy "Forum users update own profile"
on public.forum_profiles
for update
to authenticated
using (user_id = auth.uid() or public.is_ecosystem_admin('forum'))
with check (user_id = auth.uid() or public.is_ecosystem_admin('forum'));

drop policy if exists "Lounge users read own profile" on public.lounge_profiles;
create policy "Lounge users read own profile"
on public.lounge_profiles
for select
to authenticated
using (user_id = auth.uid() or public.is_ecosystem_admin('lounge'));

drop policy if exists "Lounge users insert own profile" on public.lounge_profiles;
create policy "Lounge users insert own profile"
on public.lounge_profiles
for insert
to authenticated
with check (user_id = auth.uid() or public.is_ecosystem_admin('lounge'));

drop policy if exists "Lounge users update own profile" on public.lounge_profiles;
create policy "Lounge users update own profile"
on public.lounge_profiles
for update
to authenticated
using (user_id = auth.uid() or public.is_ecosystem_admin('lounge'))
with check (user_id = auth.uid() or public.is_ecosystem_admin('lounge'));

drop policy if exists "Club users read own profile" on public.club_profiles;
create policy "Club users read own profile"
on public.club_profiles
for select
to authenticated
using (user_id = auth.uid() or public.is_ecosystem_admin('club'));

drop policy if exists "Club users insert own profile" on public.club_profiles;
create policy "Club users insert own profile"
on public.club_profiles
for insert
to authenticated
with check (user_id = auth.uid() or public.is_ecosystem_admin('club'));

drop policy if exists "Club users update own profile" on public.club_profiles;
create policy "Club users update own profile"
on public.club_profiles
for update
to authenticated
using (user_id = auth.uid() or public.is_ecosystem_admin('club'))
with check (user_id = auth.uid() or public.is_ecosystem_admin('club'));

drop policy if exists "Studio users read own profile" on public.studio_profiles;
create policy "Studio users read own profile"
on public.studio_profiles
for select
to authenticated
using (user_id = auth.uid() or public.is_ecosystem_admin('studio'));

drop policy if exists "Studio users insert own profile" on public.studio_profiles;
create policy "Studio users insert own profile"
on public.studio_profiles
for insert
to authenticated
with check (user_id = auth.uid() or public.is_ecosystem_admin('studio'));

drop policy if exists "Studio users update own profile" on public.studio_profiles;
create policy "Studio users update own profile"
on public.studio_profiles
for update
to authenticated
using (user_id = auth.uid() or public.is_ecosystem_admin('studio'))
with check (user_id = auth.uid() or public.is_ecosystem_admin('studio'));

drop policy if exists "Authenticated users can create visible topics" on public.forum_topics;
create policy "Authenticated users can create visible topics"
on public.forum_topics
for insert
to authenticated
with check (
  public.has_product_access('forum')
  and category_id is not null
  and user_id is not null
  and auth.uid() = user_id
  and length(btrim(titulo)) between 4 and 120
  and length(btrim(conteudo)) between 10 and 8000
  and (nota is null or (nota >= 1 and nota <= 5))
  and coalesce(oculto, false) = false
  and coalesce(fixado, false) = false
  and coalesce(trancado, false) = false
);

drop policy if exists "Authenticated users can create visible replies" on public.forum_replies;
create policy "Authenticated users can create visible replies"
on public.forum_replies
for insert
to authenticated
with check (
  public.has_product_access('forum')
  and topic_id is not null
  and user_id is not null
  and auth.uid() = user_id
  and length(btrim(conteudo)) between 2 and 8000
  and coalesce(oculto, false) = false
  and exists (
    select 1
    from public.forum_topics topic
    where topic.id = forum_replies.topic_id
      and coalesce(topic.oculto, false) = false
      and coalesce(topic.trancado, false) = false
  )
);

create or replace function public.enforce_forum_topic_security()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null or new.user_id is null or new.user_id <> auth.uid() then
    raise exception 'login_required' using errcode = 'P0001';
  end if;

  if not public.has_product_access('forum') then
    raise exception 'forum_access_required' using errcode = 'P0001';
  end if;

  if not public.is_admin() and exists (
    select 1
    from public.forum_topics topic
    where topic.user_id = new.user_id
      and topic.created_at > now() - interval '60 seconds'
  ) then
    raise exception 'topic_rate_limit'
      using errcode = 'P0001',
            detail = 'Aguarde 60 segundos antes de criar outro topico.';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_forum_reply_security()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null or new.user_id is null or new.user_id <> auth.uid() then
    raise exception 'login_required' using errcode = 'P0001';
  end if;

  if not public.has_product_access('forum') then
    raise exception 'forum_access_required' using errcode = 'P0001';
  end if;

  if not public.is_admin() and exists (
    select 1
    from public.forum_replies reply
    where reply.user_id = new.user_id
      and reply.created_at > now() - interval '30 seconds'
  ) then
    raise exception 'reply_rate_limit'
      using errcode = 'P0001',
            detail = 'Aguarde 30 segundos antes de responder novamente.';
  end if;

  return new;
end;
$$;

drop policy if exists "Read approved ads" on public.ads;
create policy "Read approved ads"
on public.ads
for select
to anon, authenticated
using (
  status = 'approved'
  or public.is_admin()
  or (user_id = auth.uid() and public.has_product_access('club'))
);

drop policy if exists "Users insert own pending ads" on public.ads;
create policy "Users insert own pending ads"
on public.ads
for insert
to authenticated
with check (
  user_id = auth.uid()
  and status = 'pending'
  and public.has_product_access('club')
);

drop policy if exists "Users update own ads" on public.ads;
create policy "Users update own ads"
on public.ads
for update
to authenticated
using (public.is_admin() or (user_id = auth.uid() and public.has_product_access('club')))
with check (public.is_admin() or (user_id = auth.uid() and public.has_product_access('club')));

drop policy if exists "Users delete own ads" on public.ads;
create policy "Users delete own ads"
on public.ads
for delete
to authenticated
using (public.is_admin() or (user_id = auth.uid() and public.has_product_access('club')));

drop policy if exists "Users manage own favorites" on public.favorites;
create policy "Users manage own favorites"
on public.favorites
for all
to authenticated
using (user_id = auth.uid() and public.has_product_access('club'))
with check (user_id = auth.uid() and public.has_product_access('club'));

create or replace function public.can_manage_studio_clinic_owner(clinic_owner uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select public.is_admin()
    or (
      clinic_owner = auth.uid()
      and public.has_product_access('studio')
    );
$$;

create or replace function public.can_manage_studio_clinic(target_clinic_id bigint)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.studio_clinics clinic
    where clinic.id = target_clinic_id
      and public.can_manage_studio_clinic_owner(clinic.owner_id)
  );
$$;

grant execute on function public.can_manage_studio_clinic_owner(uuid) to anon, authenticated;
grant execute on function public.can_manage_studio_clinic(bigint) to anon, authenticated;

drop policy if exists "Studio approved clinics are public" on public.studio_clinics;
create policy "Studio approved clinics are public"
on public.studio_clinics
for select
to anon, authenticated
using (status = 'approved' or public.can_manage_studio_clinic_owner(owner_id));

drop policy if exists "Studio owners manage clinics" on public.studio_clinics;
create policy "Studio owners manage clinics"
on public.studio_clinics
for all
to authenticated
using (public.can_manage_studio_clinic_owner(owner_id))
with check (public.can_manage_studio_clinic_owner(owner_id));

drop policy if exists "Studio owners manage clinic photos" on public.studio_clinic_photos;
create policy "Studio owners manage clinic photos"
on public.studio_clinic_photos
for all
to authenticated
using (public.can_manage_studio_clinic(clinic_id))
with check (public.can_manage_studio_clinic(clinic_id));

drop policy if exists "Studio owners manage professionals" on public.studio_professionals;
create policy "Studio owners manage professionals"
on public.studio_professionals
for all
to authenticated
using (public.can_manage_studio_clinic(clinic_id))
with check (public.can_manage_studio_clinic(clinic_id));

drop policy if exists "Studio owners manage professional photos" on public.studio_professional_photos;
create policy "Studio owners manage professional photos"
on public.studio_professional_photos
for all
to authenticated
using (
  exists (
    select 1
    from public.studio_professionals professional
    where professional.id = studio_professional_photos.professional_id
      and public.can_manage_studio_clinic(professional.clinic_id)
  )
)
with check (
  exists (
    select 1
    from public.studio_professionals professional
    where professional.id = studio_professional_photos.professional_id
      and public.can_manage_studio_clinic(professional.clinic_id)
  )
);

drop policy if exists "Studio owners manage availability" on public.studio_professional_availability;
create policy "Studio owners manage availability"
on public.studio_professional_availability
for all
to authenticated
using (public.can_manage_studio_clinic(clinic_id))
with check (public.can_manage_studio_clinic(clinic_id));

drop policy if exists "Studio owners manage status assets" on public.studio_whatsapp_status_assets;
create policy "Studio owners manage status assets"
on public.studio_whatsapp_status_assets
for all
to authenticated
using (public.can_manage_studio_clinic(clinic_id))
with check (public.can_manage_studio_clinic(clinic_id));

drop policy if exists "Studio owners manage whatsapp settings" on public.studio_whatsapp_settings;
create policy "Studio owners manage whatsapp settings"
on public.studio_whatsapp_settings
for all
to authenticated
using (public.can_manage_studio_clinic(clinic_id))
with check (public.can_manage_studio_clinic(clinic_id));
