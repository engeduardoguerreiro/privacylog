# PrivacyLog - Inventario Geral do Projeto

Atualizado em: 11 de junho de 2026

Este documento consolida o estado atual do projeto PrivacyLog no workspace local:

`E:\ARQUIVOS EDUARDO\PRIVACYLOG`

Ele foi criado para servir como uma visao geral tecnica, comercial e operacional do sistema. Arquivos sensiveis como `.env.local` e `Senhas.txt` nao foram copiados nem detalhados aqui.

---

## 1. Resumo Executivo

O PrivacyLog e um ecossistema digital premium 18+ dividido em produtos independentes, mas publicados dentro do mesmo projeto Next.js:

- **PrivacyLog Home**: pagina principal do ecossistema.
- **PrivacyLog Lounge**: guia/mapa de clinicas, casas e locais premium.
- **PrivacyLog Forum**: comunidade, topicos, relatos e moderacao.
- **PrivacyLog Club**: classificados/perfis/anuncios 18+.
- **PrivacyLog Studio**: produto B2B para clinicas, com landing pages, painel administrativo e gestao de profissionais.
- **Admin PrivacyLog**: area interna para controlar Forum, Lounge, Club e Studio.

O projeto usa Next.js App Router, Supabase, Google Maps, Vercel e rotas por subdominio via `proxy.ts`.

---

## 2. Stack Principal

### Framework e runtime

- **Next.js**: `16.2.6`
- **React**: `19.2.4`
- **React DOM**: `19.2.4`
- **TypeScript**: `^5`
- **Tailwind CSS**: `^4`
- **PostCSS**: `8.5.14` via override

### Backend e dados

- **Supabase JS**: `^2.105.3`
- **Supabase SSR**: `^0.10.3`
- **Supabase Auth**
- **Supabase Storage**
- **Postgres com RLS**

### UI e experiencia

- **lucide-react**: icones
- **Swiper**: carrosseis
- **Sharp**: processamento/otimizacao de imagens
- **Google Maps API**: mapas do Lounge e localizacao

### Scripts do projeto

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run mapagp:preview
npm run mapagp:import
npm run club:seed-locations
```

No Windows, quando houver bloqueio de politica do PowerShell, use:

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
```

---

## 3. Estrutura de Pastas

Principais diretorios:

```txt
app/                 Rotas App Router do Next.js
components/          Componentes compartilhados e por produto
lib/                 Clientes Supabase, regras, helpers e dados
public/              Logos, imagens, assets e midias publicas
scripts/             Scripts utilitarios/importacao/seeds
src/                 Codigo auxiliar/legado quando usado
supabase/migrations/ SQL de banco, RLS e storage
docs/                Documentacao do projeto
```

Arquivos importantes na raiz:

```txt
AGENTS.md
README.md
package.json
next.config.ts
proxy.ts
tsconfig.json
eslint.config.mjs
postcss.config.mjs
```

Arquivos sensiveis que existem localmente e nao devem ser expostos:

```txt
.env.local
Senhas.txt
```

---

## 4. Regras Especiais do Projeto

O arquivo `AGENTS.md` alerta que esta versao do Next.js possui mudancas importantes:

- APIs e convencoes podem diferir do conhecimento comum.
- Antes de alterar codigo Next.js sensivel, consultar a documentacao local em `node_modules/next/dist/docs/`.

Regra pratica:

- Antes de refatorar rotas, proxy, server actions, middleware/proxy ou comportamento SSR/CSR, verificar a documentacao local do Next.js instalada no projeto.

---

## 5. Subdominios e Roteamento

O projeto usa `proxy.ts` para detectar o `host` e reescrever internamente os produtos:

```txt
privacylog.com.br              -> /
www.privacylog.com.br          -> /
lounge.privacylog.com.br       -> /lounge
forum.privacylog.com.br        -> /forum
club.privacylog.com.br         -> /club
studio.privacylog.com.br       -> /studio
```

O Studio tambem possui suporte para:

- subdominios de clinicas;
- dominios customizados;
- paginas publicas por slug.

---

## 6. Variaveis de Ambiente

O README lista as seguintes variaveis esperadas:

```env
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_LOUNGE_URL=
NEXT_PUBLIC_FORUM_URL=
NEXT_PUBLIC_CLUB_URL=
NEXT_PUBLIC_STUDIO_URL=
PRIVACYLOG_HOME_MODE=
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

Observacoes:

- `PRIVACYLOG_HOME_MODE=construction` exibe pagina em construcao na home.
- `PRIVACYLOG_HOME_MODE=live` ativa a home principal do ecossistema.
- As chaves reais nao devem ser documentadas nem versionadas.

---

## 7. Produtos do Ecossistema

## 7.1 PrivacyLog Home

Rota principal:

```txt
/
```

Funcao:

- Apresentar o ecossistema PrivacyLog.
- Direcionar para Lounge, Forum, Club e Studio.
- Pode operar em modo construcao ou live conforme `PRIVACYLOG_HOME_MODE`.

Arquivos principais:

```txt
app/page.tsx
app/layout.tsx
app/globals.css
components/shared/IntroLanding.tsx
components/shared/ProductCard.tsx
components/BrandLogo.tsx
```

---

## 7.2 PrivacyLog Lounge

Produto voltado para mapa e diretorio de locais premium.

Rotas principais:

```txt
/lounge
/lounge/mapa
/lounge/clinicas
/lounge/clinicas/[id]
/lounge/cidade/[slug]
/lounge/categorias
/lounge/anunciar
/lounge/planos
```

Arquivos principais:

```txt
app/lounge/page.tsx
app/lounge/layout.tsx
app/lounge/mapa/page.tsx
app/lounge/clinicas/page.tsx
app/lounge/clinicas/[id]/page.tsx
components/lounge/LoungeMap.tsx
components/lounge/LoungeCard.tsx
components/lounge/LoungeFilters.tsx
components/lounge/LoungePlanCard.tsx
```

Assets importantes:

```txt
public/lounge/lounge-hero.png
public/lounge/lounge-map-hero.png
public/lounge/lounge-location-map.png
```

Funcionalidades atuais:

- Pagina principal comercial do Lounge.
- Pagina de mapa com Google Maps.
- Lista de locais/clinicas.
- Pagina publica de clinica/local.
- Filtros por status, tipo, nota e valor.
- Cards e botoes de acao para site, WhatsApp, Forum e Uber.

Cuidados:

- Nao perder a chave Google Maps.
- No mobile, evitar que o mapa capture todo o scroll com um dedo.
- Manter a lista minimizavel para navegacao no mapa.
- A identidade visual recente do Lounge usa fundo claro, roxo, dourado e beige.

---

## 7.3 PrivacyLog Forum

Produto voltado para comunidade, topicos, relatos, avaliacoes e moderacao.

Rotas principais:

```txt
/forum
/forum/[slug]
/forum/categorias
/forum/categorias/[slug]
/forum/categoria/[id]
/forum/topicos
/forum/topicos/[id]
/forum/topico/[id]
/forum/novo
/forum/novo-topico
/forum/novo-topico/[categoryId]
/forum/avisos
/forum/avisos/[slug]
/forum/regras
/forum/perfil
```

Arquivos principais:

```txt
app/forum/page.tsx
app/forum/layout.tsx
app/forum/forum-data.ts
app/forum/forum-types.ts
app/forum/forum-utils.ts
app/forum/forum-permissions.ts
app/forum/ForumTopbar.tsx
app/forum/ForumSearch.tsx
app/forum/ForumStats.tsx
app/forum/TopicList.tsx
app/forum/ReplyCard.tsx
app/forum/RatingBadge.tsx
components/forum/ForumHero.tsx
components/forum/ForumCategoryCard.tsx
components/forum/ForumTopicCard.tsx
components/forum/ReplyForm.tsx
```

Funcionalidades atuais:

- Categorias por estados.
- Subcategorias dentro dos estados.
- Topicos e respostas.
- Comentarios com campos estilo Test Drive.
- Moderacao administrativa de topicos e comentarios.
- Regras de criacao de topicos por categoria.
- Banners e destaques.
- Layout visual novo em andamento, mais claro e roxo/dourado.

Regras importantes de permissao:

- Usuario comum nao deve criar estados.
- Usuario comum nao deve criar categorias dentro de estados.
- Usuario comum nao deve criar topicos novos dentro de clinicas.
- Dentro de clinicas, usuario comum deve apenas responder topico existente.
- Usuario comum pode criar topicos em categorias abertas como acompanhantes, boates, prives, casas de swing e massagens, conforme regra atual do produto.
- Admin pode mover, ocultar, restaurar e excluir comentarios.
- Admin pode excluir topicos.

---

## 7.4 PrivacyLog Club

Produto voltado para anuncios/perfis/classificados 18+.

Rotas principais:

```txt
/club
/club/anuncio/[slug]
/club/admin
/club/area-18
/club/cadastro
/club/cadastro/enviado
/club/categoria/[slug]
/club/cidade/[slug]
/club/contato
/club/cookies
/club/denunciar
/club/favoritos
/club/login
/club/painel
/club/precos
/club/privacidade
/club/publicar
/club/termos
/club/verificacao
```

Arquivos principais:

```txt
app/club/page.tsx
app/club/layout.tsx
app/club/actions.ts
app/club/model-auth-actions.ts
components/club/ClubHeader.tsx
components/club/ClubFooter.tsx
components/club/ClubDirectoryInteractive.tsx
components/club/AdCard.tsx
components/club/ClubPublishForm.tsx
components/club/CategoryTabs.tsx
components/club/CitySelector.tsx
components/club/FilterDrawer.tsx
components/club/FavoriteButton.tsx
components/club/PhotoGallery.tsx
components/club/ModelMediaShowcase.tsx
components/club/WhatsAppButton.tsx
components/club/ShareButton.tsx
components/club/ReportModal.tsx
components/club/ModelModerationPanel.tsx
lib/club/types.ts
lib/club/supabase-data.ts
lib/club/data.ts
lib/club/favorites.ts
lib/club/filter-groups.ts
lib/club/slug.ts
```

Funcionalidades atuais:

- Listagem de anuncios/perfis.
- Filtros por categoria, sexo, cidade, distancia e busca.
- Gate 18+.
- ECA Digital.
- Favoritos.
- Publicacao de anuncio.
- Painel do anunciante/modelo.
- Verificacao.
- Denuncia.
- Midias do perfil.
- WhatsApp.
- Moderacao administrativa.

Paleta atualmente definida para Club:

```txt
Fundo principal: #FAF7F0
Fundo quente secundario: #FFFAF4
Cards claros: #FFFDF8
Texto principal: #211329
Texto apoio: #5E5268
Dourado principal: #C9A24A
Dourado quente: #C9822A
Roxo principal: #7B2B8A
Roxo escuro: #5B1569
Vinho elegante: #5A1622
WhatsApp: #16A34A
```

Cuidados:

- Nao alterar a estrutura aprovada sem pedido explicito.
- Manter o marketplace com imagens grandes, mas navegavel.
- Evitar fontes exageradas no desktop e no mobile.
- Manter cards premium, com movimento/hover, mas sem pesar a pagina.

---

## 7.5 PrivacyLog Studio

Produto B2B para clinicas, prives, lounges e casas adultas criarem paginas premium com painel simples.

Rotas publicas/comerciais:

```txt
/studio
/studio/[slug]
/studio/clinicas
/studio/clinicas/[slug]
/studio/cadastro
/studio/contato
/studio/login
/studio/modelos
/studio/planos
/studio/portfolio
/studio/privacidade
/studio/solicitar-site
/studio/termos
```

Rotas da administracao da clinica:

```txt
/studio/clinicas/[slug]/admin/login
/studio/clinicas/[slug]/admin
/studio/clinicas/[slug]/admin/profissionais
/studio/clinicas/[slug]/admin/fotos
```

Rotas do painel Studio:

```txt
/studio/painel
/studio/painel/disponibilidade
/studio/painel/estatisticas
/studio/painel/fotos
/studio/painel/massagistas
/studio/painel/perfil
/studio/painel/plano
/studio/painel/site
/studio/painel/suporte
```

Arquivos principais:

```txt
app/studio/page.tsx
app/studio/layout.tsx
app/studio/clinicas/[slug]/page.tsx
app/studio/clinicas/[slug]/admin/page.tsx
app/studio/clinicas/[slug]/admin/login/page.tsx
app/studio/clinicas/[slug]/admin/profissionais/page.tsx
app/studio/clinicas/[slug]/admin/profissionais/actions.ts
app/studio/clinicas/[slug]/admin/fotos/page.tsx
app/studio/clinicas/[slug]/admin/fotos/actions.ts
components/studio/StudioHeader.tsx
components/studio/StudioFooter.tsx
components/studio/StudioHero.tsx
components/studio/ClinicLandingHeader.tsx
components/studio/ClinicLandingFooter.tsx
components/studio/ClinicPublicHero.tsx
components/studio/ClinicGallery.tsx
components/studio/ClinicCarousel.tsx
components/studio/ProfessionalCard.tsx
components/studio/ProfessionalForm.tsx
components/studio/ClinicDashboardChart.tsx
components/studio/StudioDashboardSidebar.tsx
lib/studio/types.ts
lib/studio/data.ts
lib/studio/db.ts
lib/studio/analytics.ts
lib/studio/domains.ts
```

Funcionalidades atuais:

- Home comercial do Studio.
- Planos comerciais.
- Vitrine de clinicas.
- Landing page independente da clinica.
- Header proprio da clinica.
- Hero proprio da clinica.
- CTA principal para WhatsApp.
- Galeria "Atmosfera da casa".
- Modelos/profissionais com fotos.
- Clique em foto para abrir maior.
- Painel administrativo da clinica.
- Login da clinica via Supabase Auth.
- Dashboard com visualizacoes, cliques no WhatsApp e modelos ativas.
- Grafico mensal/anual.
- Gestao de profissionais.
- Gestao das quatro fotos da clinica.
- Upload via Supabase Storage.
- Redimensionamento visual das imagens no site.

Planos atuais desejados:

### Essencial

- Sem divulgacao no Lounge/Forum.
- Se a clinica tiver dominio, utiliza o dominio.
- Se nao tiver dominio, utiliza subdominio.

### Black

- Divulgacao no Lounge e Forum.
- Suporte 24h.
- Dominio proprio incluso caso a clinica nao tenha.

---

## 8. Admin PrivacyLog

Rotas principais:

```txt
/admin
/admin/dashboard
/admin/forum
/admin/lounge
/admin/lounge/cadastrar
/admin/clinica/[id]
/admin/studio
/admin/studio/clinicas
/admin/studio/banners
/admin/studio/leads
/admin/studio/massagistas
/admin/studio/planos
/admin/studio/relatorios
/admin/studio/templates
```

Funcionalidades esperadas:

- Administrar Forum.
- Administrar Lounge.
- Administrar Studio.
- Cadastrar/editar clinicas.
- Organizar clinicas por categoria e ordem alfabetica.
- Vincular clinicas do Lounge ao Forum conforme tipo: clinica, prive, boate, massagem etc.
- Aprovar clinicas no Studio.
- Definir plano da clinica.
- Vincular administrador da clinica.
- Moderar topicos e comentarios.

---

## 9. APIs Internas

Rotas API localizadas:

```txt
/api/club/checkout
/api/club/mercadopago/webhook
/api/studio/analytics/view
/api/studio/analytics/whatsapp-click
```

Funcoes:

- Checkout do Club.
- Webhook Mercado Pago.
- Registro de visualizacoes do Studio.
- Registro de cliques em WhatsApp no Studio.

---

## 10. Banco de Dados e Supabase

O projeto usa Supabase/Postgres com migrations em:

```txt
supabase/migrations/
```

### Principais areas de banco

#### Forum

Tabelas e estruturas relacionadas:

```txt
forum_categories
forum_topics
forum_replies
forum_ads
forum_clinic_models
```

Recursos:

- RLS.
- Politicas de leitura publica.
- Politicas de criacao conforme permissao.
- Moderacao administrativa.
- Campos de relato/test drive em respostas.

#### Club

Tabelas e estruturas relacionadas:

```txt
categories
cities
city_neighborhoods
ads
ad_photos
ad_videos
ad_audios
ad_services
ad_tags
favorites
club_favorites
reviews
reports
plans
payments
boosts
legal_acceptances
age_verifications
club_subscriptions
admin_logs
```

Recursos:

- Publicacao de anuncios.
- Midias do anuncio.
- Planos e assinaturas.
- Favoritos.
- Denuncias.
- Verificacao de maioridade.
- Pagamentos via Mercado Pago.

#### Lounge

Estruturas reutilizadas:

```txt
clinicas
lounge_profiles
```

Recursos:

- Clinicas/locais.
- Mapa.
- Integracao com Forum.
- Sincronizacao de categorias do Forum com clinicas cadastradas.

#### Studio

Tabelas e estruturas relacionadas:

```txt
studio_clinics
studio_clinic_photos
studio_professionals
studio_professional_photos
studio_professional_availability
studio_leads
studio_plans
studio_whatsapp_status_assets
studio_whatsapp_settings
studio_page_views
studio_whatsapp_clicks
studio_domain_mappings
studio_clinic_admins
```

Buckets de storage esperados:

```txt
studio-clinic-logos
studio-clinic-photos
studio-professional-photos
studio-status-assets
```

Recursos:

- Landing pages de clinicas.
- Upload de fotos.
- Painel de clinica.
- Vinculo de admin da clinica.
- Analytics de visualizacoes.
- Analytics de clique em WhatsApp.
- Dominios e subdominios.

#### Acesso por ecossistema

Tabelas relacionadas:

```txt
ecosystem_admins
forum_profiles
lounge_profiles
club_profiles
studio_profiles
profiles
admin_users
admin_audit_logs
```

Objetivo:

- Separar acessos por produto.
- Permitir perfis diferentes por ecossistema.
- Controlar administradores.
- Registrar auditoria.

---

## 11. Migrations Importantes

Lista de migrations encontradas:

```txt
20260509000000_regional_forum_schema.sql
20260509001000_forum_ads.sql
20260509002000_add_forum_lifestyle_categories.sql
20260510015135_add_forum_general_rules_category.sql
20260510030133_harden_security_policies.sql
20260511000000_ecosystem_reports_banner_ads.sql
20260511010000_privacylog_club_schema.sql
20260512093000_club_media_limits.sql
20260512103000_club_age_verification_workflow.sql
20260512160000_privacylog_studio_schema.sql
20260512170000_studio_domain_routing.sql
20260512183000_separate_ecosystem_access.sql
20260513143000_club_favorites.sql
20260515150000_club_brazil_locations_and_publish_fields.sql
20260515160852_club_plan_subscriptions.sql
20260515175737_club_one_ad_per_account.sql
20260519015457_forum_reply_test_drive_fields.sql
20260519020851_restrict_forum_topic_creation.sql
20260519195045_sync_lounge_clinics_forum_categories.sql
20260519201124_dedupe_forum_lounge_parent_categories.sql
20260520144623_beta_security_profile_grants.sql
20260521123000_studio_clinic_admin_mvp.sql
20260526123942_restrict_forum_topic_creation_by_category.sql
20260526153201_ensure_studio_storage_buckets.sql
```

---

## 12. Seguranca e Compliance

Itens ja previstos no projeto:

- RLS nas principais tabelas.
- Supabase Auth.
- Separacao de perfis por produto.
- Admins por ecossistema.
- Admin master/plataforma.
- Denuncias.
- Regras do Forum.
- Gate 18+.
- ECA Digital.
- Politica de privacidade.
- Termos de uso.
- Politica de cookies.
- Verificacao de maioridade no Club.
- Logs administrativos.
- Rate limit em `lib/security/rate-limit.ts`.

Pontos de atencao antes de lancamento beta:

- Conferir RLS diretamente no Supabase.
- Conferir se todos os buckets necessarios existem.
- Garantir que `.env.local` e `Senhas.txt` nao sejam versionados.
- Conferir permissoes de `SUPABASE_SERVICE_ROLE_KEY`.
- Conferir webhook Mercado Pago.
- Conferir chave Google Maps em producao.
- Testar Fluxos 18+ no mobile e desktop.
- Revisar todos os formularios publicos contra spam.

---

## 13. Assets e Branding

Assets relevantes:

```txt
public/brand/
public/brand/clinic-actions/
public/forum/
public/lounge/
public/studio/
public/placeholders/
logo.png
logo-club.png
logo-forum.png
logo-lounge.png
logo-studio.png
```

Produtos possuem logos separados:

- PrivacyLog
- PrivacyLog Lounge
- PrivacyLog Forum
- PrivacyLog Club
- PrivacyLog Studio

Observacao:

- O favicon deve usar o logo correto da marca principal.
- As identidades visuais mais recentes caminham para fundo claro, roxo, dourado e tons quentes.

---

## 14. Paleta Visual Consolidada

Paleta clara usada nos produtos recentes:

```txt
Fundo principal: #FAF7F0
Fundo secundario quente: #FFFAF4
Cards: #FFFDF8
Texto principal: #211329
Texto alternativo: #1E1427
Texto de apoio: #5E5268
Texto cinza quente: #6B6258
Texto discreto: #746879
Dourado principal: #C9A24A
Dourado quente: #C9822A
Dourado claro: #F7C56F
Dourado medio: #E2A143
Dourado escuro: #8A5A12
Roxo principal: #7B2B8A
Roxo botao: #8B3AA0
Roxo escuro: #5B1569
Vinho elegante: #5A1622
Roxo fundo escuro: #2B1736
WhatsApp: #16A34A
WhatsApp suave: #22C55E
Borda dourada suave: rgba(201, 162, 74, 0.22)
Borda bege: rgba(235, 213, 178, 0.92)
Sombra roxa leve: rgba(61, 24, 78, 0.08)
```

Direcao:

- Menos preto absoluto.
- Mais fundo claro premium.
- Roxo como acao/navegacao.
- Dourado como detalhe premium.
- Verde apenas para WhatsApp/confirmacao.

---

## 15. Principais Componentes Compartilhados

```txt
components/BrandLogo.tsx
components/AgeGate.tsx
components/layout/MainHeader.tsx
components/layout/ProductHeader.tsx
components/layout/MobileMenu.tsx
components/layout/Footer.tsx
components/shared/IntroLanding.tsx
components/shared/ProductCard.tsx
components/shared/PremiumButton.tsx
components/shared/CookieBanner.tsx
components/shared/AgeGateModal.tsx
```

---

## 16. Fluxos Principais

### Fluxo Lounge

```txt
Usuario entra em /lounge
-> ve pagina principal
-> pesquisa local ou abre mapa
-> seleciona clinica/local
-> abre pagina da clinica
-> acessa site, WhatsApp, Forum ou Uber
```

### Fluxo Forum

```txt
Usuario entra em /forum
-> escolhe estado
-> escolhe categoria/subcategoria
-> acessa topico
-> responde topico existente
```

Admin:

```txt
Admin entra em /admin/forum
-> modera comentarios
-> move comentarios
-> oculta/restaura/exclui respostas
-> exclui topicos quando necessario
```

### Fluxo Club

```txt
Usuario entra em /club
-> confirma 18+
-> usa filtros/cidades/busca
-> abre anuncio/perfil
-> favorita, compartilha, denuncia ou chama WhatsApp
```

Anunciante:

```txt
Anunciante entra em /club/publicar
-> cadastra anuncio
-> envia midias
-> passa por verificacao/moderacao
-> administra via painel
```

### Fluxo Studio

```txt
PrivacyLog cadastra clinica
-> aprova clinica
-> vincula admin
-> clinica aparece na vitrine Studio
-> visitante abre landing page da clinica
-> visitante chama WhatsApp
```

Admin da clinica:

```txt
Clinica entra em /studio/clinicas/[slug]/admin/login
-> abre dashboard
-> gerencia profissionais
-> atualiza disponibilidade
-> atualiza fotos da clinica
```

---

## 17. Pagamentos

O Club possui integracao com Mercado Pago:

```txt
app/api/club/checkout/route.ts
app/api/club/mercadopago/webhook/route.ts
```

Variaveis relacionadas:

```env
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_WEBHOOK_SECRET=
```

Webhook esperado:

```txt
https://privacylog.com.br/api/club/mercadopago/webhook
```

---

## 18. Deploy

O projeto esta preparado para Vercel.

Comandos usuais:

```bash
npm run build
vercel
vercel --prod
```

Em Windows:

```powershell
npm.cmd run build
vercel --prod
```

Checklist antes de deploy:

- Rodar build.
- Conferir erros TypeScript/Next.
- Conferir variaveis no Vercel.
- Conferir Supabase URL e keys.
- Conferir Google Maps key.
- Conferir buckets Studio.
- Conferir dominios/subdominios.
- Conferir webhook Mercado Pago.

---

## 19. Pontos de Atencao Atuais

### Geral

- Continuar padronizando a identidade visual clara premium.
- Evitar fontes grandes demais no mobile.
- Evitar elementos que parecam "imagem colada".
- Manter menus mobile sempre em hamburger.
- Padronizar logo e favicon.
- Corrigir qualquer mojibake ou erro de portugues.

### Lounge

- Garantir mapa funcional.
- Garantir lista minimizavel no mobile.
- Garantir que o mapa nao bloqueie scroll da pagina.
- Atualizar paginas antigas para identidade nova clara.
- Manter pagina de clinica funcional sem alterar estrutura aprovada.

### Forum

- Aplicar identidade nova no Forum inteiro, nao apenas na home.
- Garantir menu hamburger no mobile.
- Garantir permissoes corretas de criacao de topicos.
- Remover categorias gerais duplicadas quando estados ja organizam categorias.
- Usar dados reais nas estatisticas e rodape.

### Club

- Manter estrutura atual aprovada.
- Reduzir escala visual onde estiver grande demais.
- Adicionar efeitos premium sem mudar fluxo.
- Evitar layout pesado.
- Garantir pagina da modelo com paleta nova, sem quebrar estrutura.

### Studio

- Manter pagina da clinica como landing premium.
- Melhorar telas administrativas com identidade da landing.
- Garantir upload via Storage.
- Garantir bucket `studio-clinic-photos`.
- Garantir dashboard com metricas de visualizacao, WhatsApp e modelos ativas.
- Planos comerciais devem ficar apenas Essencial e Black.

---

## 20. Comandos Uteis de Diagnostico

Listar rotas:

```powershell
Get-ChildItem app -Recurse -Filter page.tsx | ForEach-Object {
  $root=(Resolve-Path 'app').Path
  $rel=$_.FullName.Replace($root,'').Replace('\page.tsx','').Replace('\','/')
  if ($rel -eq '') { '/' } else { $rel }
} | Sort-Object
```

Listar arquivos:

```powershell
rg --files
```

Buscar texto:

```powershell
rg "texto" app components lib
```

Rodar build:

```powershell
npm.cmd run build
```

Rodar lint:

```powershell
npm.cmd run lint
```

Subir dev server:

```powershell
npm.cmd run dev
```

---

## 21. Resumo de Produto Para Apresentacao

O PrivacyLog e uma plataforma premium para o mercado adulto 18+, organizada em quatro frentes:

- **Lounge**: descoberta de locais, mapa, clinicas e casas verificadas.
- **Forum**: comunidade moderada, relatos, reputacao e discussoes.
- **Club**: classificados e perfis 18+ com filtros, midias, favoritos e WhatsApp.
- **Studio**: produto B2B para clinicas criarem paginas premium, gerirem profissionais e converterem visitantes em contatos via WhatsApp.

A proposta central e transformar um mercado visualmente desorganizado em um ecossistema mais confiavel, discreto, premium e facil de navegar.

---

## 22. Proximas Entregas Recomendadas

1. Revisao visual final mobile-first em Lounge, Forum, Club e Studio.
2. Auditoria Supabase RLS e Storage.
3. Teste completo de cadastro/publicacao no Club.
4. Teste completo de login/admin da clinica no Studio.
5. Teste completo de mapa e pagina de clinica no Lounge.
6. Teste de permissoes do Forum.
7. Revisao de textos em portugues.
8. Build final.
9. Deploy beta.
10. Checklist manual em producao.

---

## 23. Observacao Final

Este documento e um inventario vivo. Sempre que novas migrations, rotas ou produtos forem adicionados, atualizar este arquivo para manter o projeto compreensivel mesmo quando for retomado em outro computador.
