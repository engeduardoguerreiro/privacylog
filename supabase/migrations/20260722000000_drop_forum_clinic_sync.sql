-- ============================================================
-- Remove o sync legado de clinicas -> forum_categories
-- ============================================================
-- O produto Forum foi removido do PrivacyLog. O trigger abaixo
-- criava/atualizava categorias de forum a cada clinica inserida
-- em public.clinicas e passou a quebrar todas as insercoes com:
--   insert or update on table "forum_categories" violates
--   foreign key constraint "forum_categories_clinic_id_fkey"
--
-- Removendo o trigger, o cadastro/importacao de clinicas do mapa
-- volta a funcionar normalmente.
-- ============================================================

drop trigger if exists sync_lounge_clinic_forum_category on public.clinicas;
drop function if exists public.sync_lounge_clinic_forum_category();
