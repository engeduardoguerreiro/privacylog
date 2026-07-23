-- ============================================================
-- PrivacyLog - Corrige o schema do sistema de clinicas
-- ============================================================
-- Cole TUDO no Supabase > SQL Editor e execute uma vez.
--
-- SEGURO DE RODAR: todos os "create table" usam IF NOT EXISTS e as
-- policies fazem "drop policy if exists" antes de recriar. Nao apaga
-- dados nem recria tabelas que ja existem.
--
-- Resolve as tabelas que a API nao encontrava (PGRST205):
--   studio_professional_availability, studio_leads, studio_plans,
--   studio_domain_mappings, studio_whatsapp_settings,
--   studio_whatsapp_status_assets
-- ============================================================

-- ---------- 1/2: schema principal do sistema de clinicas ----------
create table if not exists public.studio_clinics (
  id bigint generated always as identity primary key,
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text,
  short_description text,
  business_type text,
  city text,
  state text,
  neighborhood text,
  address text,
  latitude numeric,
  longitude numeric,
  whatsapp text,
  phone text,
  instagram text,
  website text,
  logo_url text,
  main_image_url text,
  status text not null default 'pending',
  plan text not null default 'essential',
  is_partner boolean not null default true,
  is_featured boolean not null default false,
  is_verified boolean not null default false,
  opening_hours jsonb not null default '[]'::jsonb,
  payment_methods jsonb not null default '[]'::jsonb,
  services jsonb not null default '[]'::jsonb,
  rules text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_clinic_photos (
  id bigint generated always as identity primary key,
  clinic_id bigint not null references public.studio_clinics(id) on delete cascade,
  image_url text not null,
  caption text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.studio_professionals (
  id bigint generated always as identity primary key,
  clinic_id bigint not null references public.studio_clinics(id) on delete cascade,
  stage_name text not null,
  slug text not null,
  age integer,
  short_description text,
  bio text,
  main_photo_url text,
  status text not null default 'active',
  is_featured boolean not null default false,
  is_public boolean not null default true,
  tags jsonb not null default '[]'::jsonb,
  services jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, slug)
);

create table if not exists public.studio_professional_photos (
  id bigint generated always as identity primary key,
  professional_id bigint not null references public.studio_professionals(id) on delete cascade,
  image_url text not null,
  position integer not null default 0,
  is_main boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.studio_professional_availability (
  id bigint generated always as identity primary key,
  clinic_id bigint not null references public.studio_clinics(id) on delete cascade,
  professional_id bigint not null references public.studio_professionals(id) on delete cascade,
  available_date date not null,
  start_time time,
  end_time time,
  status text not null default 'available_today',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (professional_id, available_date)
);

create table if not exists public.studio_leads (
  id bigint generated always as identity primary key,
  clinic_name text,
  responsible_name text,
  whatsapp text,
  city text,
  neighborhood text,
  business_type text,
  has_photos boolean,
  has_domain boolean,
  professionals_count integer,
  interested_plan text,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.studio_plans (
  id bigint generated always as identity primary key,
  name text not null,
  slug text unique not null,
  price numeric not null,
  setup_price numeric not null default 0,
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.studio_whatsapp_status_assets (
  id bigint generated always as identity primary key,
  clinic_id bigint not null references public.studio_clinics(id) on delete cascade,
  availability_date date not null,
  image_url text,
  caption text,
  status text not null default 'generated',
  created_at timestamptz not null default now()
);

create table if not exists public.studio_whatsapp_settings (
  id bigint generated always as identity primary key,
  clinic_id bigint not null references public.studio_clinics(id) on delete cascade,
  whatsapp_number text,
  responsible_name text,
  responsible_phone text,
  default_message text,
  status_caption_template text,
  integration_type text not null default 'manual',
  api_provider text,
  api_token_encrypted text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_page_views (
  id bigint generated always as identity primary key,
  clinic_id bigint references public.studio_clinics(id) on delete cascade,
  path text,
  visitor_ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.studio_whatsapp_clicks (
  id bigint generated always as identity primary key,
  clinic_id bigint references public.studio_clinics(id) on delete cascade,
  professional_id bigint references public.studio_professionals(id) on delete set null,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists studio_clinics_slug_idx on public.studio_clinics(slug);
create index if not exists studio_clinics_status_city_idx on public.studio_clinics(status, city);
create index if not exists studio_clinics_plan_idx on public.studio_clinics(plan);
create index if not exists studio_clinic_photos_clinic_idx on public.studio_clinic_photos(clinic_id, position);
create index if not exists studio_professionals_clinic_idx on public.studio_professionals(clinic_id, status);
create index if not exists studio_professional_photos_professional_idx on public.studio_professional_photos(professional_id, position);
create index if not exists studio_availability_clinic_date_idx on public.studio_professional_availability(clinic_id, available_date);
create index if not exists studio_leads_created_at_idx on public.studio_leads(created_at desc);
create index if not exists studio_page_views_clinic_created_idx on public.studio_page_views(clinic_id, created_at desc);
create index if not exists studio_whatsapp_clicks_clinic_created_idx on public.studio_whatsapp_clicks(clinic_id, created_at desc);

alter table if exists public.clinicas
  add column if not exists studio_clinic_id bigint references public.studio_clinics(id) on delete set null,
  add column if not exists privacylog_black boolean not null default false;

alter table if exists public.forum_ads
  add column if not exists studio_clinic_id bigint references public.studio_clinics(id) on delete set null,
  add column if not exists plan text,
  add column if not exists priority integer not null default 0;

insert into public.studio_plans (name, slug, price, setup_price, features)
values
  ('Essencial', 'essential', 97, 0, '["Site da clinica", "Fotos ilimitadas", "Profissionais ilimitados", "WhatsApp", "Pagina de parceiras"]'::jsonb),
  ('Premium', 'premium', 197, 0, '["Tudo do Essencial", "Disponibilidade diaria", "Status WhatsApp", "SEO por cidade", "Estatisticas"]'::jsonb),
  ('Black', 'black', 397, 0, '["Tudo do Premium", "Destaque Studio", "Destaque Lounge", "Carrossel Forum", "Suporte VIP"]'::jsonb)
on conflict (slug) do update
set
  name = excluded.name,
  price = excluded.price,
  setup_price = excluded.setup_price,
  features = excluded.features,
  is_active = true;

insert into public.studio_clinics (
  name,
  slug,
  description,
  short_description,
  business_type,
  city,
  state,
  neighborhood,
  address,
  whatsapp,
  logo_url,
  main_image_url,
  status,
  plan,
  is_partner,
  is_featured,
  is_verified,
  opening_hours,
  payment_methods,
  services,
  rules
)
values (
  'Maison Aurora',
  'maison-aurora',
  'Clinica ficticia de demonstracao do PrivacyLog Studio.',
  'Vitrine premium com disponibilidade do dia.',
  'clinica',
  'Sao Paulo',
  'SP',
  'Jardins',
  'Endereco reservado - Jardins',
  '5511999999999',
  '/brand/logo-studio.png',
  '/brand/logo-studio.png',
  'approved',
  'black',
  true,
  true,
  true,
  '[{"day":"Segunda","hours":"11:00 as 23:00"},{"day":"Terca","hours":"11:00 as 23:00"},{"day":"Quarta","hours":"11:00 as 23:00"},{"day":"Quinta","hours":"11:00 as 23:00"},{"day":"Sexta","hours":"11:00 as 23:00"},{"day":"Sabado","hours":"12:00 as 20:00"},{"day":"Domingo","hours":"12:00 as 20:00"}]'::jsonb,
  '["PIX","Cartao","Dinheiro"]'::jsonb,
  '["Massagens","Lounges privativos","Reservas"]'::jsonb,
  'Atendimento somente para maiores de 18 anos.'
)
on conflict (slug) do nothing;

alter table public.studio_clinics enable row level security;
alter table public.studio_clinic_photos enable row level security;
alter table public.studio_professionals enable row level security;
alter table public.studio_professional_photos enable row level security;
alter table public.studio_professional_availability enable row level security;
alter table public.studio_leads enable row level security;
alter table public.studio_plans enable row level security;
alter table public.studio_whatsapp_status_assets enable row level security;
alter table public.studio_whatsapp_settings enable row level security;
alter table public.studio_page_views enable row level security;
alter table public.studio_whatsapp_clicks enable row level security;

grant select on table public.studio_clinics to anon, authenticated;
grant select on table public.studio_clinic_photos to anon, authenticated;
grant select on table public.studio_professionals to anon, authenticated;
grant select on table public.studio_professional_photos to anon, authenticated;
grant select on table public.studio_professional_availability to anon, authenticated;
grant select on table public.studio_plans to anon, authenticated;
grant insert on table public.studio_leads to anon, authenticated;
grant insert on table public.studio_page_views to anon, authenticated;
grant insert on table public.studio_whatsapp_clicks to anon, authenticated;
grant insert, update, delete on table public.studio_clinics to authenticated;
grant insert, update, delete on table public.studio_clinic_photos to authenticated;
grant insert, update, delete on table public.studio_professionals to authenticated;
grant insert, update, delete on table public.studio_professional_photos to authenticated;
grant insert, update, delete on table public.studio_professional_availability to authenticated;
grant select, update, delete on table public.studio_leads to authenticated;
grant insert, update, delete on table public.studio_plans to authenticated;
grant select, insert, update, delete on table public.studio_whatsapp_status_assets to authenticated;
grant select, insert, update, delete on table public.studio_whatsapp_settings to authenticated;
grant select on table public.studio_page_views to authenticated;
grant select on table public.studio_whatsapp_clicks to authenticated;

do $$
declare
  seq_name text;
begin
  for seq_name in
    select quote_ident(sequence_schema) || '.' || quote_ident(sequence_name)
    from information_schema.sequences
    where sequence_schema = 'public'
      and sequence_name like 'studio_%'
  loop
    execute 'grant usage, select on sequence ' || seq_name || ' to authenticated';
  end loop;

  if to_regclass('public.studio_leads_id_seq') is not null then
    grant usage, select on sequence public.studio_leads_id_seq to anon;
  end if;

  if to_regclass('public.studio_page_views_id_seq') is not null then
    grant usage, select on sequence public.studio_page_views_id_seq to anon;
  end if;

  if to_regclass('public.studio_whatsapp_clicks_id_seq') is not null then
    grant usage, select on sequence public.studio_whatsapp_clicks_id_seq to anon;
  end if;
end $$;

drop policy if exists "Studio approved clinics are public" on public.studio_clinics;
create policy "Studio approved clinics are public"
on public.studio_clinics
for select
to anon, authenticated
using (status = 'approved' or owner_id = auth.uid() or public.is_admin());

drop policy if exists "Studio owners manage clinics" on public.studio_clinics;
create policy "Studio owners manage clinics"
on public.studio_clinics
for all
to authenticated
using (owner_id = auth.uid() or public.is_admin())
with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "Studio plans are public" on public.studio_plans;
create policy "Studio plans are public"
on public.studio_plans
for select
to anon, authenticated
using (is_active = true or public.is_admin());

drop policy if exists "Studio admins manage plans" on public.studio_plans;
create policy "Studio admins manage plans"
on public.studio_plans
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Studio public clinic children" on public.studio_clinic_photos;
create policy "Studio public clinic children"
on public.studio_clinic_photos
for select
to anon, authenticated
using (
  exists (
    select 1 from public.studio_clinics clinic
    where clinic.id = studio_clinic_photos.clinic_id
      and (clinic.status = 'approved' or clinic.owner_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "Studio owners manage clinic photos" on public.studio_clinic_photos;
create policy "Studio owners manage clinic photos"
on public.studio_clinic_photos
for all
to authenticated
using (
  exists (
    select 1 from public.studio_clinics clinic
    where clinic.id = studio_clinic_photos.clinic_id
      and (clinic.owner_id = auth.uid() or public.is_admin())
  )
)
with check (
  exists (
    select 1 from public.studio_clinics clinic
    where clinic.id = studio_clinic_photos.clinic_id
      and (clinic.owner_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "Studio public professionals" on public.studio_professionals;
create policy "Studio public professionals"
on public.studio_professionals
for select
to anon, authenticated
using (
  is_public = true
  and exists (
    select 1 from public.studio_clinics clinic
    where clinic.id = studio_professionals.clinic_id
      and (clinic.status = 'approved' or clinic.owner_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "Studio owners manage professionals" on public.studio_professionals;
create policy "Studio owners manage professionals"
on public.studio_professionals
for all
to authenticated
using (
  exists (
    select 1 from public.studio_clinics clinic
    where clinic.id = studio_professionals.clinic_id
      and (clinic.owner_id = auth.uid() or public.is_admin())
  )
)
with check (
  exists (
    select 1 from public.studio_clinics clinic
    where clinic.id = studio_professionals.clinic_id
      and (clinic.owner_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "Studio public professional photos" on public.studio_professional_photos;
create policy "Studio public professional photos"
on public.studio_professional_photos
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.studio_professionals professional
    join public.studio_clinics clinic on clinic.id = professional.clinic_id
    where professional.id = studio_professional_photos.professional_id
      and professional.is_public = true
      and (clinic.status = 'approved' or clinic.owner_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "Studio owners manage professional photos" on public.studio_professional_photos;
create policy "Studio owners manage professional photos"
on public.studio_professional_photos
for all
to authenticated
using (
  exists (
    select 1
    from public.studio_professionals professional
    join public.studio_clinics clinic on clinic.id = professional.clinic_id
    where professional.id = studio_professional_photos.professional_id
      and (clinic.owner_id = auth.uid() or public.is_admin())
  )
)
with check (
  exists (
    select 1
    from public.studio_professionals professional
    join public.studio_clinics clinic on clinic.id = professional.clinic_id
    where professional.id = studio_professional_photos.professional_id
      and (clinic.owner_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "Studio availability public" on public.studio_professional_availability;
create policy "Studio availability public"
on public.studio_professional_availability
for select
to anon, authenticated
using (
  exists (
    select 1 from public.studio_clinics clinic
    where clinic.id = studio_professional_availability.clinic_id
      and (clinic.status = 'approved' or clinic.owner_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "Studio owners manage availability" on public.studio_professional_availability;
create policy "Studio owners manage availability"
on public.studio_professional_availability
for all
to authenticated
using (
  exists (
    select 1 from public.studio_clinics clinic
    where clinic.id = studio_professional_availability.clinic_id
      and (clinic.owner_id = auth.uid() or public.is_admin())
  )
)
with check (
  exists (
    select 1 from public.studio_clinics clinic
    where clinic.id = studio_professional_availability.clinic_id
      and (clinic.owner_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "Studio leads insert public" on public.studio_leads;
create policy "Studio leads insert public"
on public.studio_leads
for insert
to anon, authenticated
with check (true);

drop policy if exists "Studio leads admin readable" on public.studio_leads;
create policy "Studio leads admin readable"
on public.studio_leads
for select
to authenticated
using (public.is_admin());

drop policy if exists "Studio leads admin update" on public.studio_leads;
create policy "Studio leads admin update"
on public.studio_leads
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Studio status assets owner readable" on public.studio_whatsapp_status_assets;
create policy "Studio status assets owner readable"
on public.studio_whatsapp_status_assets
for select
to authenticated
using (
  exists (
    select 1 from public.studio_clinics clinic
    where clinic.id = studio_whatsapp_status_assets.clinic_id
      and (clinic.owner_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "Studio owners manage status assets" on public.studio_whatsapp_status_assets;
create policy "Studio owners manage status assets"
on public.studio_whatsapp_status_assets
for all
to authenticated
using (
  exists (
    select 1 from public.studio_clinics clinic
    where clinic.id = studio_whatsapp_status_assets.clinic_id
      and (clinic.owner_id = auth.uid() or public.is_admin())
  )
)
with check (
  exists (
    select 1 from public.studio_clinics clinic
    where clinic.id = studio_whatsapp_status_assets.clinic_id
      and (clinic.owner_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "Studio owners manage whatsapp settings" on public.studio_whatsapp_settings;
create policy "Studio owners manage whatsapp settings"
on public.studio_whatsapp_settings
for all
to authenticated
using (
  exists (
    select 1 from public.studio_clinics clinic
    where clinic.id = studio_whatsapp_settings.clinic_id
      and (clinic.owner_id = auth.uid() or public.is_admin())
  )
)
with check (
  exists (
    select 1 from public.studio_clinics clinic
    where clinic.id = studio_whatsapp_settings.clinic_id
      and (clinic.owner_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "Studio analytics insert public" on public.studio_page_views;
create policy "Studio analytics insert public"
on public.studio_page_views
for insert
to anon, authenticated
with check (true);

drop policy if exists "Studio whatsapp clicks insert public" on public.studio_whatsapp_clicks;
create policy "Studio whatsapp clicks insert public"
on public.studio_whatsapp_clicks
for insert
to anon, authenticated
with check (true);

drop policy if exists "Studio analytics owner readable" on public.studio_page_views;
create policy "Studio analytics owner readable"
on public.studio_page_views
for select
to authenticated
using (
  exists (
    select 1 from public.studio_clinics clinic
    where clinic.id = studio_page_views.clinic_id
      and (clinic.owner_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "Studio click analytics owner readable" on public.studio_whatsapp_clicks;
create policy "Studio click analytics owner readable"
on public.studio_whatsapp_clicks
for select
to authenticated
using (
  exists (
    select 1 from public.studio_clinics clinic
    where clinic.id = studio_whatsapp_clicks.clinic_id
      and (clinic.owner_id = auth.uid() or public.is_admin())
  )
);

insert into storage.buckets (id, name, public)
values
  ('studio-clinic-logos', 'studio-clinic-logos', true),
  ('studio-clinic-photos', 'studio-clinic-photos', true),
  ('studio-professional-photos', 'studio-professional-photos', true),
  ('studio-status-assets', 'studio-status-assets', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Studio storage public read" on storage.objects;
create policy "Studio storage public read"
on storage.objects
for select
to anon, authenticated
using (bucket_id in (
  'studio-clinic-logos',
  'studio-clinic-photos',
  'studio-professional-photos',
  'studio-status-assets'
));

drop policy if exists "Studio owners upload own folder" on storage.objects;
create policy "Studio owners upload own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in (
    'studio-clinic-logos',
    'studio-clinic-photos',
    'studio-professional-photos',
    'studio-status-assets'
  )
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

drop policy if exists "Studio owners update own folder" on storage.objects;
create policy "Studio owners update own folder"
on storage.objects
for update
to authenticated
using (
  bucket_id in (
    'studio-clinic-logos',
    'studio-clinic-photos',
    'studio-professional-photos',
    'studio-status-assets'
  )
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
)
with check (
  bucket_id in (
    'studio-clinic-logos',
    'studio-clinic-photos',
    'studio-professional-photos',
    'studio-status-assets'
  )
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

drop policy if exists "Studio owners delete own folder" on storage.objects;
create policy "Studio owners delete own folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id in (
    'studio-clinic-logos',
    'studio-clinic-photos',
    'studio-professional-photos',
    'studio-status-assets'
  )
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);


-- ---------- 2/2: dominios/subdominios das clinicas ----------
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


-- ---------- 3/3: recarrega o cache de schema da API ----------
notify pgrst, 'reload schema';
