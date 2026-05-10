# Robô MapaGP

Ferramenta local para coletar dados autorizados do MapaGP, normalizar para o modelo do PrivacyLog e importar na tabela `clinicas`.

## Prévia

```bash
npm run mapagp:preview
```

Com limite para teste:

```bash
npm run mapagp:preview -- --limit=10
```

Exportando JSON para revisão:

```bash
npm run mapagp:preview -- --out=.privacylog-imports/mapagp-preview.json
```

## Importação

Defina a chave server-side do Supabase no `.env.local`:

```bash
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

Depois rode:

```bash
npm run mapagp:import
```

Por segurança, duplicados por telefone, endereço ou nome/cidade são ignorados. Para atualizar cadastros existentes:

```bash
npm run mapagp:import -- --update-existing
```

## Filtros úteis

```bash
npm run mapagp:preview -- --include=clinica,boate,prive
npm run mapagp:preview -- --include=clinica,massagem,boate,prive
npm run mapagp:preview -- --delay=600
```

## O que o robô grava

- `nome`
- `contato`
- `site`
- `endereco`, `bairro`, `cidade`, `estado`
- `lat`, `lng`
- `tipo`
- `plano = free`
- preços de 30 e 60 minutos normal/forista quando disponíveis
- horários no formato usado pelo PrivacyLog
- subcategoria no fórum e link em `clinicas.forum`

O robô não copia avaliações, comentários, imagens ou conteúdo editorial de terceiros.
