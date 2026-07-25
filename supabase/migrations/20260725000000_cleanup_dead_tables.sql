-- Limpeza do banco: remove os segmentos que nao servem mais ao PrivacyLog
-- (Club, ecossistema de anuncios/ads e as partes mortas do Forum), depois do
-- pivo para o sistema unico de divulgacao de clinicas.
--
-- MANTIDAS de proposito:
--   - clinicas (mapa), studio_* (produto atual), lounge_profiles, studio_profiles
--   - forum_topics + forum_categories: o mapa ainda le a nota (avaliacao) de la;
--     a Fase 5 (avaliacoes proprias) vai permitir dropar essas duas por ultimo
--   - ecosystem_admins, admin_users, admin_logs: sao load-bearing
--     (is_ecosystem_admin() na RLS de studio_profiles/lounge_profiles e o
--     trigger de auditoria de clinicas escrevem/leem essas tabelas)
--
-- Antes de rodar: faca um backup (scripts/db-backup.mjs). Idempotente.

-- 1) O trigger de cadastro (after insert on auth.users) ainda citava
--    forum_profiles / club_profiles / profiles em ramos que nunca executam
--    (o app so cria contas com product 'studio', e 'lounge' no admin do mapa).
--    Reescreve para tratar apenas lounge e studio, sem referenciar as tabelas
--    que serao removidas abaixo.
create or replace function public.create_product_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  product text := lower(coalesce(new.raw_user_meta_data ->> 'product', ''));
begin
  if product = 'lounge' then
    insert into public.lounge_profiles (user_id, role, status)
    values (new.id, 'advertiser', 'active')
    on conflict (user_id) do update set status = 'active', updated_at = now();
  elsif product = 'studio' then
    insert into public.studio_profiles (user_id, role, status)
    values (new.id, 'clinic_owner', 'active')
    on conflict (user_id) do update set status = 'active', updated_at = now();
  end if;

  return new;
end;
$$;

-- 2) CLUB (segmento removido)
drop table if exists public.club_favorites cascade;
drop table if exists public.club_subscriptions cascade;
drop table if exists public.club_profiles cascade;

-- 3) FORUM (partes mortas; forum_topics e forum_categories permanecem)
drop table if exists public.forum_ads cascade;
drop table if exists public.forum_clinic_models cascade;
drop table if exists public.forum_replies cascade;
drop table if exists public.forum_profiles cascade;

-- 4) ANUNCIOS / ECOSSISTEMA (segmento removido)
drop table if exists public.ad_audios cascade;
drop table if exists public.ad_photos cascade;
drop table if exists public.ad_services cascade;
drop table if exists public.ad_tags cascade;
drop table if exists public.ad_videos cascade;
drop table if exists public.boosts cascade;
drop table if exists public.favorites cascade;
drop table if exists public.reports cascade;
drop table if exists public.reviews cascade;
drop table if exists public.payments cascade;
drop table if exists public.age_verifications cascade;
drop table if exists public.ads cascade;
drop table if exists public.plans cascade;
drop table if exists public.categories cascade;
drop table if exists public.city_neighborhoods cascade;
drop table if exists public.cities cascade;
drop table if exists public.banner_ads cascade;

-- 5) LEGADO
drop table if exists public.legal_acceptances cascade;
drop table if exists public.profiles cascade;

notify pgrst, 'reload schema';
