-- ============================================================
-- PrivacyLog — RESET dos cadastros (deixa o banco limpo)
-- ============================================================
-- ATENCAO: isto APAGA DADOS de forma irreversivel.
-- Rode no Supabase → SQL Editor. Revise antes de executar.
--
-- O que este script faz:
--   1. Esvazia as tabelas de CADASTROS (clinicas, modelos, leads,
--      perfis, fotos, analytics) do sistema de clinicas + mapa.
--   2. Esvazia tambem as tabelas legadas de Club/Forum (produtos removidos).
--   3. NAO mexe em tabelas de CONFIGURACAO (studio_plans, categories,
--      cities, city_neighborhoods) — se quiser zerar tambem, veja o bloco
--      opcional no final.
--   4. NAO apaga as contas de login (auth.users). Isso e feito pelo
--      painel do Supabase (Authentication → Users) — ver instrucoes.
-- ============================================================

do $$
declare
  t text;
  alvo text[] := array[
    -- sistema de clinicas (studio)
    'studio_page_views',
    'studio_whatsapp_clicks',
    'studio_whatsapp_status_assets',
    'studio_whatsapp_settings',
    'studio_professional_availability',
    'studio_professional_photos',
    'studio_professionals',
    'studio_clinic_photos',
    'studio_clinic_admins',
    'studio_domain_mappings',
    'studio_leads',
    'studio_clinics',
    'studio_profiles',
    -- mapa / lounge
    'clinicas',
    'lounge_profiles',
    -- perfis / acesso por ecossistema
    'profiles',
    'ecosystem_admins',
    'admin_users',
    'admin_audit_logs',
    'admin_logs',
    -- legado Club (produto removido)
    'ad_audios','ad_videos','ad_photos','ad_services','ad_tags','ads',
    'club_favorites','favorites','reviews','reports','boosts','payments',
    'club_subscriptions','legal_acceptances','age_verifications','banner_ads',
    'club_profiles','city_neighborhoods',
    -- legado Forum (produto removido)
    'forum_replies','forum_topics','forum_clinic_models','forum_categories',
    'forum_ads','forum_profiles'
  ];
begin
  foreach t in array alvo loop
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
      execute format('truncate table public.%I restart identity cascade;', t);
      raise notice 'limpa: %', t;
    end if;
  end loop;
end $$;

-- ------------------------------------------------------------
-- OPCIONAL: zerar tambem as tabelas de configuracao/referencia.
-- Descomente se quiser mesmo apagar planos, categorias e cidades.
-- ------------------------------------------------------------
-- truncate table public.studio_plans, public.categories, public.cities restart identity cascade;
