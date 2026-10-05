-- Trava colunas privilegiadas contra escrita direta pelo PostgREST.
--
-- Problema: a policy "Studio owners manage clinics" (FOR ALL) so confere o
-- owner_id, e o papel authenticated tem INSERT/UPDATE na tabela inteira. Com a
-- publishable key e o proprio JWT, o dono conseguia gravar status='approved',
-- subscription_status='active', plan='black', is_verified etc. e furar a
-- moderacao e a cobranca. Do mesmo jeito, studio_profiles/lounge_profiles
-- aceitavam UPDATE em status, o que desfazia uma suspensao.
--
-- Correcao: um trigger em studio_clinics que so deixa service role e admin
-- mexerem nas colunas de moderacao, cobranca e dominio; e os perfis de produto
-- deixam de aceitar UPDATE pelo usuario. Idempotente.

-- 0) Marca de suspensao por cobranca ------------------------------------------

-- Separa "o admin suspendeu" de "a cobranca suspendeu": o webhook so religa a
-- casa que ele mesmo derrubou, e nunca publica uma casa ainda em revisao.
alter table public.studio_clinics
  add column if not exists suspended_for_billing boolean not null default false;

-- Casas hoje suspensas com cobranca em atraso/cancelada foram derrubadas
-- pelo webhook ou pelo cron (unico caminho que suspendia por cobranca).
update public.studio_clinics
   set suspended_for_billing = true
 where status = 'suspended'
   and subscription_status in ('past_due', 'canceled')
   and suspended_for_billing = false;

-- 1) studio_clinics: colunas privilegiadas ------------------------------------

create or replace function public.guard_studio_clinic_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Service role (server actions, webhook, cron) e admin seguem livres.
  if coalesce(auth.role(), '') = 'service_role'
     or current_user in ('postgres', 'supabase_admin')
     or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Casa criada pelo proprio dono sempre nasce em revisao e sem beneficios.
    new.status := 'pending';
    new.plan := 'essential';
    new.subscription_status := 'none';
    new.subscription_until := null;
    new.is_featured := false;
    new.is_verified := false;
    new.is_partner := true;
    new.clinic_subdomain := null;
    new.custom_domain := null;
    new.custom_domain_included_until := null;
    new.domain_status := 'not_configured';
    new.domain_renewal_note := null;
    new.suspended_for_billing := false;
    return new;
  end if;

  if new.owner_id is distinct from old.owner_id
     or new.status is distinct from old.status
     or new.plan is distinct from old.plan
     or new.subscription_status is distinct from old.subscription_status
     or new.subscription_until is distinct from old.subscription_until
     or new.is_featured is distinct from old.is_featured
     or new.is_verified is distinct from old.is_verified
     or new.is_partner is distinct from old.is_partner
     or new.slug is distinct from old.slug
     or new.studio_path is distinct from old.studio_path
     or new.clinic_subdomain is distinct from old.clinic_subdomain
     or new.custom_domain is distinct from old.custom_domain
     or new.custom_domain_included_until is distinct from old.custom_domain_included_until
     or new.domain_status is distinct from old.domain_status
     or new.domain_renewal_note is distinct from old.domain_renewal_note
     or new.suspended_for_billing is distinct from old.suspended_for_billing then
    raise exception 'Somente o administrador pode alterar moderacao, plano, cobranca ou dominio.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_studio_clinic_privileged_columns on public.studio_clinics;
create trigger guard_studio_clinic_privileged_columns
before insert or update on public.studio_clinics
for each row execute function public.guard_studio_clinic_privileged_columns();

-- 2) Perfis de produto: o usuario nao altera status nem role ------------------

revoke insert, update on table public.studio_profiles from authenticated;
revoke insert, update on table public.lounge_profiles from authenticated;

-- O app so cria o perfil (user_id); status e role ficam no default.
grant insert (user_id) on table public.studio_profiles to authenticated;
grant insert (user_id) on table public.lounge_profiles to authenticated;

-- 3) Idade minima das profissionais -------------------------------------------

-- NOT VALID: vale para todo INSERT/UPDATE daqui em diante sem travar a
-- migration caso exista linha antiga fora da regra. Depois de conferir os
-- dados, rode: alter table public.studio_professionals
--   validate constraint studio_professionals_age_adult;
alter table public.studio_professionals
  drop constraint if exists studio_professionals_age_adult;
alter table public.studio_professionals
  add constraint studio_professionals_age_adult
  check (age is null or age >= 18) not valid;

notify pgrst, 'reload schema';
