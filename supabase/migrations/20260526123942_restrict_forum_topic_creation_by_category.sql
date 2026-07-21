drop policy if exists "Anyone can create visible topics" on public.forum_topics;
drop policy if exists "Authenticated users can create visible topics" on public.forum_topics;
drop policy if exists "Authenticated admins and freelancers can create visible topics" on public.forum_topics;

create policy "Authenticated users can create visible topics"
on public.forum_topics
for insert
to authenticated
with check (
  public.has_product_access('forum')
  and category_id is not null
  and user_id is not null
  and auth.uid() = user_id
  and length(btrim(titulo)) between 4 and 120
  and length(btrim(conteudo)) between 10 and 8000
  and (nota is null or (nota >= 1 and nota <= 5))
  and coalesce(oculto, false) = false
  and coalesce(fixado, false) = false
  and coalesce(trancado, false) = false
  and (
    public.is_admin()
    or exists (
      select 1
      from public.forum_categories category
      where category.id = forum_topics.category_id
        and category.parent_id is not null
        and category.clinic_id is null
        and (
          lower(coalesce(category.tipo, '')) in (
            'freelancer',
            'boate',
            'prive',
            'swing',
            'massagem'
          )
          or lower(coalesce(category.nome, '')) like '%acompanhantes freelancers%'
        )
    )
  )
);

create or replace function public.enforce_forum_topic_security()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null or new.user_id is null or new.user_id <> auth.uid() then
    raise exception 'login_required' using errcode = 'P0001';
  end if;

  if not public.has_product_access('forum') then
    raise exception 'forum_access_required' using errcode = 'P0001';
  end if;

  if not public.is_admin()
    and not exists (
      select 1
      from public.forum_categories category
      where category.id = new.category_id
        and category.parent_id is not null
        and category.clinic_id is null
        and (
          lower(coalesce(category.tipo, '')) in (
            'freelancer',
            'boate',
            'prive',
            'swing',
            'massagem'
          )
          or lower(coalesce(category.nome, '')) like '%acompanhantes freelancers%'
        )
    )
  then
    raise exception 'topic_category_restricted'
      using errcode = 'P0001',
            detail = 'Usuarios comuns so podem criar topicos em acompanhantes, boates, prives, casas de swing e massagens.';
  end if;

  if not public.is_admin() and exists (
    select 1
    from public.forum_topics topic
    where topic.user_id = new.user_id
      and topic.created_at > now() - interval '60 seconds'
  ) then
    raise exception 'topic_rate_limit'
      using errcode = 'P0001',
            detail = 'Aguarde 60 segundos antes de criar outro topico.';
  end if;

  return new;
end;
$$;
