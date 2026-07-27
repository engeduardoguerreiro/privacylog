# PrivacyLog

Ecossistema premium com Next.js App Router, Supabase, Google Maps e Vercel.

## Produtos

- `privacylog.com.br`: hub institucional do grupo PrivacyLog.
- `lounge.privacylog.com.br`: PrivacyLog Lounge, mapa e diretorio de locais.
- `forum.privacylog.com.br`: PrivacyLog Forum, comunidade, topicos e relatos.
- `club.privacylog.com.br`: PrivacyLog Club, classificados premium 18+.
- `studio.privacylog.com.br`: PrivacyLog Studio, sites e presenca digital para clinicas e casas parceiras.

## Ambiente local

```bash
npm run dev
```

Acesse:

- `http://localhost:3000`
- `http://localhost:3000/lounge`
- `http://localhost:3000/forum`
- `http://localhost:3000/club`
- `http://localhost:3000/studio`

## Subdominios em producao

O projeto usa `proxy.ts` para detectar o `host` e reescrever internamente:

- `lounge.privacylog.com.br/*` -> `/lounge/*`
- `forum.privacylog.com.br/*` -> `/forum/*`
- `club.privacylog.com.br/*` -> `/club/*`
- `studio.privacylog.com.br/*` -> `/studio/*`
- `privacylog.com.br/*` -> `/`

Na Vercel, adicione no mesmo projeto:

- `privacylog.com.br`
- `www.privacylog.com.br`
- `lounge.privacylog.com.br`
- `forum.privacylog.com.br`
- `club.privacylog.com.br`
- `studio.privacylog.com.br`

No DNS da Hostinger, aponte todos para a Vercel conforme a tela de dominios do
projeto. Normalmente:

- dominio raiz com registro `A` para o IP indicado pela Vercel, ou registros
  recomendados pela propria Vercel.
- `www`, `lounge`, `forum`, `club` e `studio` como `CNAME` para o destino
  indicado pela Vercel.

## Variaveis de ambiente

```env
NEXT_PUBLIC_SITE_URL=https://privacylog.com.br
NEXT_PUBLIC_LOUNGE_URL=https://lounge.privacylog.com.br
NEXT_PUBLIC_FORUM_URL=https://forum.privacylog.com.br
NEXT_PUBLIC_CLUB_URL=https://club.privacylog.com.br
NEXT_PUBLIC_STUDIO_URL=https://studio.privacylog.com.br
PRIVACYLOG_HOME_MODE=construction
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_PRIVACYLOG_WHATSAPP=
AGE_VERIFICATION_PROVIDER=
AGE_VERIFICATION_API_KEY=
AGE_VERIFICATION_WEBHOOK_SECRET=
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_WEBHOOK_SECRET=
```

`PRIVACYLOG_HOME_MODE` controla a home principal:

- `construction` ou vazio: mostra a pagina de suspense/em construcao.
- `live`: volta para a home original com os quatro modulos.

Para pagamentos do Club, cadastre no Mercado Pago uma notificacao/webhook apontando
para `https://privacylog.com.br/api/club/mercadopago/webhook`. O sistema libera
o plano somente quando o pagamento volta como aprovado.

## Banco

O projeto reaproveita:

- `clinicas`
- `forum_categories`
- `forum_topics`
- `forum_replies`
- `profiles`

Migracoes novas prepararam:

- `reports`
- `banner_ads`
- `age_verifications`
- limites de midia do Club: 6 fotos, 3 videos de ate 10 segundos e 1 audio de ate 8 segundos
- fluxo de verificacao de maioridade para anuncios explicitos
- Studio: `studio_clinics`, `studio_clinic_photos`, `studio_professionals`,
  `studio_professional_photos`, `studio_professional_availability`,
  `studio_leads`, `studio_plans`, `studio_whatsapp_status_assets`,
  `studio_whatsapp_settings`, `studio_page_views`, `studio_whatsapp_clicks`
- Dominios Studio: `studio_domain_mappings` e campos em `studio_clinics`
  para `studio_path`, `clinic_subdomain`, `custom_domain`, vencimento incluso e
  aviso de renovacao.
- Buckets Studio: `studio-clinic-logos`, `studio-clinic-photos`,
  `studio-professional-photos`, `studio-status-assets`

O forum atual segue usando `forum_ads` para o banner principal ja existente, sem
criar multiplos espacos de anuncio.

## Rotas principais

Lounge:

- `/lounge`
- `/lounge/mapa`
- `/lounge/clinicas`
- `/lounge/clinicas/[id]`
- `/lounge/cidade/[slug]`
- `/lounge/categorias`
- `/lounge/anunciar`
- `/lounge/planos`

Forum:

- `/forum`
- `/forum/categorias`
- `/forum/categorias/[slug]`
- `/forum/topicos`
- `/forum/topicos/[id]`
- `/forum/novo-topico`
- `/forum/regras`
- `/forum/perfil`

Studio:

- `/studio`
- `/studio/planos`
- `/studio/clinicas`
- `/studio/clinicas/[slug]`
- `/studio/modelos`
- `/studio/portfolio`
- `/studio/solicitar-site`
- `/studio/login`
- `/studio/cadastro`
- `/studio/painel`
- `/studio/painel/perfil`
- `/studio/painel/massagistas`
- `/studio/painel/disponibilidade`
- `/studio/painel/fotos`
- `/studio/painel/site`
- `/studio/painel/estatisticas`
- `/studio/painel/plano`
- `/studio/painel/suporte`
- `/admin/studio`
- `/admin/studio/clinicas`
- `/admin/studio/massagistas`
- `/admin/studio/planos`
- `/admin/studio/leads`
- `/admin/studio/templates`
- `/admin/studio/banners`
- `/admin/studio/relatorios`

Rotas antigas importantes foram preservadas para nao quebrar links publicados.

## PrivacyLog Studio

O Studio vende sites premium para clinicas, prives, lounges e casas adultas.
A primeira versao inclui home B2B, planos sem setup, clinicas parceiras, pagina
publica de clinica, painel protegido por login, gerador seguro de Status
WhatsApp em PNG e Admin Studio.

Regras de endereco digital dos planos:

- Essencial: pagina em `studio.privacylog.com.br/nomedaclinica`, sem subdominio proprio.
- Premium: subdominio incluso em `nomedaclinica.privacylog.com.br`, reescrito pelo `proxy.ts` para a pagina publica da clinica.
- Black: dominio proprio gratuito no primeiro ano, por exemplo `www.nomedaclinica.com.br`; apos o primeiro ano, a renovacao sera cobrada conforme o valor do registrador.

Para subdominios de clinicas Premium, configure na Vercel um wildcard ou adicione
os dominios individualmente. No DNS, use `*.privacylog.com.br` como `CNAME` para
o destino indicado pela Vercel quando quiser escalar muitos subdominios.

Para dominios Black, adicione o dominio customizado no mesmo projeto Vercel e
aponte o DNS conforme a instrucao da Vercel. O proxy esta preparado para mapear
o host customizado para a pagina publica da clinica cadastrada.

Para publicar o banco, rode a migracao:

```txt
supabase/migrations/20260512160000_privacylog_studio_schema.sql
supabase/migrations/20260512170000_studio_domain_routing.sql
```

Depois confira no Supabase:

- RLS habilitado nas tabelas `studio_*`.
- Buckets de storage criados.
- Usuario administrador com permissao via `public.is_admin()`.
- Dominio `studio.privacylog.com.br` adicionado no mesmo projeto Vercel.
