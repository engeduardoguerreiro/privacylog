insert into public.forum_categories (
  nome,
  slug,
  descricao,
  parent_id,
  estado,
  tipo,
  clinic_id
)
values (
  'Avisos e Regras Gerais',
  'avisos-e-regras-gerais',
  'Comunicados oficiais, regras de conduta e orientações importantes para usar o fórum PrivacyLog com segurança.',
  null,
  null,
  'avisos',
  null
)
on conflict (slug) do update
set nome = excluded.nome,
    descricao = excluded.descricao,
    parent_id = excluded.parent_id,
    estado = excluded.estado,
    tipo = excluded.tipo,
    clinic_id = excluded.clinic_id;
