-- ============================================================
-- Tema da pagina publica da clinica
-- ============================================================
-- Cada clinica assinante escolhe um entre 5 temas. O layout e a
-- estrutura continuam sendo os do PrivacyLog; o tema muda apenas a
-- cor de acento e o tom do fundo (todos claros).
--
-- Valores: champagne (padrao) | bordo | esmeralda | ametista | grafite
--
-- Seguro de rodar: usa IF NOT EXISTS e nao altera dados existentes
-- (as clinicas ja cadastradas ficam com o tema padrao).
-- ============================================================

alter table public.studio_clinics
  add column if not exists theme text not null default 'champagne';

-- Recarrega o cache de schema da API
notify pgrst, 'reload schema';
