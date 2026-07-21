alter table public.studio_professionals
  add column if not exists whatsapp text,
  add column if not exists availability_text text,
  add column if not exists is_available_today boolean not null default false;

update storage.buckets
set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
where id = 'studio-professional-photos';

create table if not exists public.studio_clinic_admins (
  id bigint generated always as identity primary key,
  clinic_id bigint not null references public.studio_clinics(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'clinic_admin',
  created_at timestamptz not null default now(),
  unique (clinic_id, user_id)
);

create index if not exists studio_clinic_admins_user_idx
  on public.studio_clinic_admins(user_id);

alter table public.studio_clinic_admins enable row level security;

grant select, insert, update, delete on table public.studio_clinic_admins to authenticated;

do $$
begin
  if to_regclass('public.studio_clinic_admins_id_seq') is not null then
    grant usage, select on sequence public.studio_clinic_admins_id_seq to authenticated;
  end if;
end $$;

create or replace function public.can_manage_studio_clinic(target_clinic_id bigint)
returns boolean
language sql
stable
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.studio_clinics clinic
      where clinic.id = target_clinic_id
        and clinic.owner_id = auth.uid()
        and public.has_product_access('studio')
    )
    or exists (
      select 1
      from public.studio_clinic_admins admin_link
      where admin_link.clinic_id = target_clinic_id
        and admin_link.user_id = auth.uid()
        and public.has_product_access('studio')
    );
$$;

drop policy if exists "Studio clinic admins read own links" on public.studio_clinic_admins;
create policy "Studio clinic admins read own links"
on public.studio_clinic_admins
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Studio platform admins manage clinic links" on public.studio_clinic_admins;
create policy "Studio platform admins manage clinic links"
on public.studio_clinic_admins
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
