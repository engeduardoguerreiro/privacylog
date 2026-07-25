-- FIX urgente: recriar public.profiles.
--
-- A limpeza anterior (20260725000000) dropou profiles, mas existe um trigger
-- em auth.users criado FORA das migrations (padrao handle_new_user) que insere
-- em profiles a CADA cadastro, independente do product. Sem a tabela, todo
-- signup falha com "Database error saving new user".
--
-- profiles volta a ser mantida como load-bearing (igual a ecosystem_admins,
-- admin_users e admin_logs). Idempotente.

create table if not exists public.profiles (
  id uuid primary key,
  user_id uuid,
  nickname text,
  name text,
  email text,
  role text default 'user',
  nickname_changed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

notify pgrst, 'reload schema';
