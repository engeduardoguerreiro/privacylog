-- Assinatura das casas assinantes (Mercado Pago, recorrencia mensal).
-- Idempotente: pode rodar mais de uma vez sem efeito colateral.

create table if not exists public.studio_subscriptions (
  id bigserial primary key,
  clinic_id bigint not null references public.studio_clinics(id) on delete cascade,
  plan text not null,
  status text not null default 'pending',
  provider text not null default 'mercadopago',
  preapproval_id text unique,
  payer_email text,
  amount numeric(10, 2),
  current_period_end timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists studio_subscriptions_clinic_idx
  on public.studio_subscriptions (clinic_id);

create index if not exists studio_subscriptions_preapproval_idx
  on public.studio_subscriptions (preapproval_id);

-- Resumo na propria clinica: as listagens publicas ja leem studio_clinics,
-- entao evita um join a cada pagina.
alter table public.studio_clinics
  add column if not exists subscription_status text not null default 'none';

alter table public.studio_clinics
  add column if not exists subscription_until timestamptz;

-- Avisos recebidos do provedor: auditoria e idempotencia (o Mercado Pago
-- reenvia a mesma notificacao ate receber 200).
create table if not exists public.studio_billing_events (
  id bigserial primary key,
  provider text not null default 'mercadopago',
  event_id text not null,
  event_type text,
  payload jsonb,
  processed_at timestamptz not null default now(),
  unique (provider, event_id)
);

-- Cobranca so e escrita pelo service role (que ignora RLS).
alter table public.studio_subscriptions enable row level security;
alter table public.studio_billing_events enable row level security;

-- A casa enxerga apenas a propria assinatura.
drop policy if exists "studio_subscriptions_owner_read" on public.studio_subscriptions;
create policy "studio_subscriptions_owner_read"
  on public.studio_subscriptions
  for select
  using (
    exists (
      select 1
      from public.studio_clinics c
      where c.id = studio_subscriptions.clinic_id
        and c.owner_id = auth.uid()
    )
  );

notify pgrst, 'reload schema';
