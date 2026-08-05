-- Disponibilidade honesta das modelos.
--
-- Problema: studio_professionals.status tinha default 'available_today', entao
-- toda modelo cadastrada ja nascia se declarando "disponivel hoje" sem a casa
-- nunca ter marcado nada. A home contava essas modelos como disponiveis.
--
-- Correcao: o padrao passa a ser 'unavailable' (sem disponibilidade declarada).
-- A casa declara a disponibilidade no painel (aba Disponibilidade). A modelo
-- continua visivel no catalogo — visibilidade e controlada por is_public.

-- 1) Novo padrao para futuros cadastros (nao altera linhas existentes).
alter table public.studio_professionals
  alter column status set default 'unavailable';

-- 2) Reset unico: 'available_today' era o valor automatico e nao distingue
--    "a casa marcou" de "veio do default". Zera para que a disponibilidade
--    passe a existir apenas quando declarada de fato no painel.
--    Nao mexe em quem esta 'available_now', 'booked' ou 'unavailable'.
update public.studio_professionals
   set status = 'unavailable',
       updated_at = now()
 where status = 'available_today';
