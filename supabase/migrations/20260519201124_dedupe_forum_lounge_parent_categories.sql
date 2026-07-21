with duplicated_groups as (
  select
    parent_id,
    estado,
    tipo,
    lower(estado) || '-' ||
      case tipo
        when 'clinica' then 'clinicas'
        when 'massagem' then 'massagens'
        when 'boate' then 'boates'
        when 'prive' then 'prives'
        else tipo
      end as preferred_slug
  from public.forum_categories
  where parent_id is not null
    and clinic_id is null
    and estado in ('SP', 'MG', 'RJ', 'PR', 'SC', 'RS')
    and tipo in ('clinica', 'massagem', 'boate', 'prive')
  group by parent_id, estado, tipo
  having count(*) > 1
),
canonical_categories as (
  select
    group_row.parent_id,
    group_row.estado,
    group_row.tipo,
    coalesce(
      max(category.id) filter (where category.slug = group_row.preferred_slug),
      min(category.id)
    ) as canonical_id
  from duplicated_groups group_row
  join public.forum_categories category
    on category.parent_id = group_row.parent_id
   and category.estado = group_row.estado
   and category.tipo = group_row.tipo
   and category.clinic_id is null
  group by group_row.parent_id, group_row.estado, group_row.tipo
),
duplicate_categories as (
  select duplicate.id, canonical.canonical_id
  from canonical_categories canonical
  join public.forum_categories duplicate
    on duplicate.parent_id = canonical.parent_id
   and duplicate.estado = canonical.estado
   and duplicate.tipo = canonical.tipo
   and duplicate.clinic_id is null
   and duplicate.id <> canonical.canonical_id
),
move_child_categories as (
  update public.forum_categories child
  set parent_id = duplicate.canonical_id
  from duplicate_categories duplicate
  where child.parent_id = duplicate.id
  returning child.id
),
move_topics as (
  update public.forum_topics topic
  set category_id = duplicate.canonical_id
  from duplicate_categories duplicate
  where topic.category_id = duplicate.id
  returning topic.id
)
delete from public.forum_categories category
using duplicate_categories duplicate
where category.id = duplicate.id;

update public.forum_categories category
set
  nome = case category.tipo
    when 'clinica' then 'Clínicas'
    when 'massagem' then 'Massagens'
    when 'boate' then 'Boates'
    when 'prive' then 'Privês'
    else category.nome
  end,
  descricao = case category.tipo
    when 'clinica' then 'Clínicas e relatos da região - ' || state_category.nome
    when 'massagem' then 'Casas de massagem e relatos da região - ' || state_category.nome
    when 'boate' then 'Boates e relatos da região - ' || state_category.nome
    when 'prive' then 'Privês e relatos da região - ' || state_category.nome
    else category.descricao
  end
from public.forum_categories state_category
where category.parent_id = state_category.id
  and category.clinic_id is null
  and category.estado in ('SP', 'MG', 'RJ', 'PR', 'SC', 'RS')
  and category.tipo in ('clinica', 'massagem', 'boate', 'prive');
