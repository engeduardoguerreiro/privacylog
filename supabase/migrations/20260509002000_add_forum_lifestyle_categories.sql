with states as (
  select id, estado, nome
  from public.forum_categories
  where parent_id is null
    and estado in ('SP', 'MG', 'RJ', 'PR', 'SC', 'RS')
),
kinds as (
  select *
  from (values
    (
      'freelancer',
      'Acompanhantes Freelancers',
      'acompanhantes-freelancers',
      'Relatos, dúvidas e recomendações sobre acompanhantes freelancers em '
    ),
    (
      'swing',
      'Casas de Swing',
      'casas-de-swing',
      'Relatos, dúvidas e recomendações sobre casas de swing em '
    )
  ) as kind(tipo, nome, slug_part, descricao_prefix)
)
insert into public.forum_categories (nome, slug, descricao, parent_id, estado, tipo)
select
  kinds.nome,
  lower(states.estado) || '-' || kinds.slug_part,
  kinds.descricao_prefix || states.nome || '.',
  states.id,
  states.estado,
  kinds.tipo
from states
cross join kinds
on conflict (slug) do update
set nome = excluded.nome,
    descricao = excluded.descricao,
    parent_id = excluded.parent_id,
    estado = excluded.estado,
    tipo = excluded.tipo;
