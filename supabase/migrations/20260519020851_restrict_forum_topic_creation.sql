drop policy if exists "Anyone can create visible topics" on public.forum_topics;
drop policy if exists "Authenticated users can create visible topics" on public.forum_topics;

create policy "Authenticated admins and freelancers can create visible topics"
on public.forum_topics
for insert
to authenticated
with check (
  category_id is not null
  and user_id is not null
  and (select auth.uid()) = user_id
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
        and (
          lower(coalesce(category.tipo, '')) = 'freelancer'
          or lower(coalesce(category.nome, '')) like '%acompanhantes freelancers%'
        )
    )
  )
);
