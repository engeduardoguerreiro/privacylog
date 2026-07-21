alter table public.studio_clinics
  add column if not exists studio_path text,
  add column if not exists clinic_subdomain text unique,
  add column if not exists custom_domain text unique,
  add column if not exists custom_domain_included_until date,
  add column if not exists domain_renewal_note text,
  add column if not exists domain_status text not null default 'not_configured';

create table if not exists public.studio_domain_mappings (
  id bigint generated always as identity primary key,
  clinic_id bigint not null references public.studio_clinics(id) on delete cascade,
  hostname text not null unique,
  domain_type text not null default 'subdomain',
  status text not null default 'pending',
  is_primary boolean not null default false,
  included_until date,
  renewal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists studio_domain_mappings_clinic_idx
  on public.studio_domain_mappings(clinic_id);

create index if not exists studio_domain_mappings_hostname_idx
  on public.studio_domain_mappings(hostname);

alter table public.studio_plans
  add column if not exists digital_address jsonb not null default '{}'::jsonb;

update public.studio_plans
set
  features = '["Site da clinica", "Pagina studio.privacylog.com.br/nomedaclinica", "Sem subdominio proprio", "Fotos ilimitadas", "Profissionais ilimitados", "WhatsApp", "Pagina de parceiras"]'::jsonb,
  digital_address = '{"title":"Endereco Studio","value":"studio.privacylog.com.br/nomedaclinica","note":"Nao inclui subdominio proprio."}'::jsonb
where slug = 'essential';

update public.studio_plans
set
  features = '["Tudo do Essencial", "Subdominio nomedaclinica.privacylog.com.br incluso", "Disponibilidade diaria", "Status WhatsApp", "SEO por cidade", "Estatisticas"]'::jsonb,
  digital_address = '{"title":"Subdominio incluso","value":"nomedaclinica.privacylog.com.br","note":"O sistema mapeia o subdominio para a pagina publica da clinica."}'::jsonb
where slug = 'premium';

update public.studio_plans
set
  features = '["Tudo do Premium", "Dominio proprio gratuito no primeiro ano", "Renovacao cobrada conforme o registrador apos o primeiro ano", "Destaque Studio", "Destaque Lounge", "Carrossel Forum", "Suporte VIP"]'::jsonb,
  digital_address = '{"title":"Dominio proprio incluso","value":"www.nomedaclinica.com.br","note":"Dominio gratuito no primeiro ano; renovacao cobrada conforme o registrador."}'::jsonb
where slug = 'black';

update public.studio_clinics
set
  studio_path = coalesce(studio_path, 'studio.privacylog.com.br/' || slug),
  clinic_subdomain = case
    when plan in ('premium', 'black') and clinic_subdomain is null
      then slug || '.privacylog.com.br'
    else clinic_subdomain
  end,
  custom_domain = case
    when slug = 'maison-aurora' and custom_domain is null
      then 'www.maisonaurora.com.br'
    else custom_domain
  end,
  custom_domain_included_until = case
    when plan = 'black' and custom_domain_included_until is null
      then (current_date + interval '1 year')::date
    else custom_domain_included_until
  end,
  domain_renewal_note = case
    when plan = 'black' and domain_renewal_note is null
      then 'Dominio gratuito no primeiro ano. Apos o primeiro ano, a renovacao sera cobrada conforme o valor do registrador.'
    else domain_renewal_note
  end,
  domain_status = case
    when plan = 'essential' then 'studio_path'
    when plan = 'premium' then 'subdomain_ready'
    when plan = 'black' then 'custom_domain_ready'
    else domain_status
  end;

insert into public.studio_domain_mappings (
  clinic_id,
  hostname,
  domain_type,
  status,
  is_primary,
  included_until,
  renewal_note
)
select
  id,
  clinic_subdomain,
  'subdomain',
  'active',
  plan = 'premium',
  null,
  null
from public.studio_clinics
where clinic_subdomain is not null
on conflict (hostname) do update
set
  clinic_id = excluded.clinic_id,
  domain_type = excluded.domain_type,
  status = excluded.status,
  is_primary = excluded.is_primary;

insert into public.studio_domain_mappings (
  clinic_id,
  hostname,
  domain_type,
  status,
  is_primary,
  included_until,
  renewal_note
)
select
  id,
  custom_domain,
  'custom_domain',
  'pending_dns',
  plan = 'black',
  custom_domain_included_until,
  coalesce(
    domain_renewal_note,
    'Dominio gratuito no primeiro ano. Apos o primeiro ano, a renovacao sera cobrada conforme o valor do registrador.'
  )
from public.studio_clinics
where custom_domain is not null
on conflict (hostname) do update
set
  clinic_id = excluded.clinic_id,
  domain_type = excluded.domain_type,
  status = excluded.status,
  is_primary = excluded.is_primary,
  included_until = excluded.included_until,
  renewal_note = excluded.renewal_note;

alter table public.studio_domain_mappings enable row level security;

grant select on table public.studio_domain_mappings to anon, authenticated;
grant insert, update, delete on table public.studio_domain_mappings to authenticated;

do $$
begin
  if to_regclass('public.studio_domain_mappings_id_seq') is not null then
    grant usage, select on sequence public.studio_domain_mappings_id_seq to authenticated;
  end if;
end $$;

drop policy if exists "Studio domain mappings are public for active clinics" on public.studio_domain_mappings;
create policy "Studio domain mappings are public for active clinics"
on public.studio_domain_mappings
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.studio_clinics clinic
    where clinic.id = studio_domain_mappings.clinic_id
      and (clinic.status = 'approved' or clinic.owner_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "Studio admins manage domain mappings" on public.studio_domain_mappings;
create policy "Studio admins manage domain mappings"
on public.studio_domain_mappings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
