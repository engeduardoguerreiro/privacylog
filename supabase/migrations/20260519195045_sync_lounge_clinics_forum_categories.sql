create or replace function public.sync_lounge_clinic_forum_category()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  parent_category_id bigint;
  forum_category_id bigint;
  normalized_tipo text;
  normalized_estado text;
  state_name text;
  state_slug text;
  type_name text;
  type_slug text;
  clinic_slug text;
begin
  normalized_tipo := lower(nullif(btrim(coalesce(new.tipo, '')), ''));
  normalized_estado := upper(nullif(btrim(coalesce(new.estado, '')), ''));

  if normalized_estado not in ('SP', 'MG', 'RJ', 'PR', 'SC', 'RS')
    or normalized_tipo not in ('clinica', 'massagem', 'boate', 'prive') then
    return new;
  end if;

  state_name := case normalized_estado
    when 'SP' then 'São Paulo'
    when 'MG' then 'Minas Gerais'
    when 'RJ' then 'Rio de Janeiro'
    when 'PR' then 'Paraná'
    when 'SC' then 'Santa Catarina'
    when 'RS' then 'Rio Grande do Sul'
    else normalized_estado
  end;

  state_slug := case normalized_estado
    when 'SP' then 'sao-paulo'
    when 'MG' then 'minas-gerais'
    when 'RJ' then 'rio-de-janeiro'
    when 'PR' then 'parana'
    when 'SC' then 'santa-catarina'
    when 'RS' then 'rio-grande-do-sul'
    else lower(normalized_estado)
  end;

  type_name := case normalized_tipo
    when 'clinica' then 'Clínicas'
    when 'massagem' then 'Massagens'
    when 'boate' then 'Boates'
    when 'prive' then 'Privês'
    else initcap(normalized_tipo)
  end;

  type_slug := case normalized_tipo
    when 'clinica' then 'clinicas'
    when 'massagem' then 'massagens'
    when 'boate' then 'boates'
    when 'prive' then 'prives'
    else normalized_tipo
  end;

  insert into public.forum_categories (nome, slug, descricao, parent_id, estado, tipo, clinic_id)
  values (
    state_name,
    state_slug,
    'Forum regional do ' || state_name,
    null,
    normalized_estado,
    null,
    null
  )
  on conflict (slug) do update
  set nome = excluded.nome,
      descricao = excluded.descricao,
      estado = excluded.estado,
      tipo = excluded.tipo,
      clinic_id = excluded.clinic_id;

  insert into public.forum_categories (nome, slug, descricao, parent_id, estado, tipo, clinic_id)
  select
    type_name,
    lower(normalized_estado) || '-' || type_slug,
    type_name || ' e relatos da regiao - ' || state_name,
    state_category.id,
    normalized_estado,
    normalized_tipo,
    null
  from public.forum_categories state_category
  where state_category.slug = state_slug
  on conflict (slug) do update
  set nome = excluded.nome,
      descricao = excluded.descricao,
      parent_id = excluded.parent_id,
      estado = excluded.estado,
      tipo = excluded.tipo,
      clinic_id = excluded.clinic_id
  returning id into parent_category_id;

  if parent_category_id is null then
    select id into parent_category_id
    from public.forum_categories
    where slug = lower(normalized_estado) || '-' || type_slug
    limit 1;
  end if;

  if parent_category_id is null then
    return new;
  end if;

  clinic_slug := normalized_tipo || '-' || new.id || '-' || coalesce(
    nullif(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            lower(unaccent(coalesce(new.nome, 'local'))),
            '[^a-z0-9]+',
            '-',
            'g'
          ),
          '(^-|-$)',
          '',
          'g'
        ),
        '-+',
        '-',
        'g'
      ),
      ''
    ),
    'local'
  );

  update public.forum_categories
  set nome = coalesce(nullif(btrim(new.nome), ''), 'Local sem nome'),
      slug = clinic_slug,
      descricao = 'Discussoes e avaliacoes sobre ' || coalesce(nullif(btrim(new.nome), ''), 'este local'),
      parent_id = parent_category_id,
      estado = normalized_estado,
      tipo = normalized_tipo
  where clinic_id = new.id
  returning id into forum_category_id;

  if forum_category_id is null then
    insert into public.forum_categories (
      nome,
      slug,
      descricao,
      parent_id,
      clinic_id,
      estado,
      tipo
    )
    values (
      coalesce(nullif(btrim(new.nome), ''), 'Local sem nome'),
      clinic_slug,
      'Discussoes e avaliacoes sobre ' || coalesce(nullif(btrim(new.nome), ''), 'este local'),
      parent_category_id,
      new.id,
      normalized_estado,
      normalized_tipo
    )
    on conflict (slug) do update
    set nome = excluded.nome,
        descricao = excluded.descricao,
        parent_id = excluded.parent_id,
        clinic_id = excluded.clinic_id,
        estado = excluded.estado,
        tipo = excluded.tipo
    returning id into forum_category_id;
  end if;

  if forum_category_id is not null then
    new.forum := '/forum/categoria/' || forum_category_id;
  end if;

  return new;
end;
$$;

revoke all on function public.sync_lounge_clinic_forum_category() from public;
revoke all on function public.sync_lounge_clinic_forum_category() from anon;
revoke all on function public.sync_lounge_clinic_forum_category() from authenticated;

drop trigger if exists sync_lounge_clinic_forum_category on public.clinicas;
create trigger sync_lounge_clinic_forum_category
before insert or update of nome, estado, tipo, forum on public.clinicas
for each row
execute function public.sync_lounge_clinic_forum_category();

update public.clinicas
set nome = nome
where estado in ('SP', 'MG', 'RJ', 'PR', 'SC', 'RS')
  and tipo in ('clinica', 'massagem', 'boate', 'prive');
