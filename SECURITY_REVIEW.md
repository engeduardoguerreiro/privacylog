# Revisão de Segurança e Performance — PrivacyLog

Data: 2026-07-25 · Escopo: repositório completo + produção (privacylog.vercel.app)
Metodologia: OWASP Top 10, revisão de código, análise de dependências, testes de endpoints.

---

## 1. Resumo executivo

O projeto já parte de uma base de segurança **sólida**: headers HTTP completos (CSP,
HSTS, X-Frame-Options), `service_role` restrita ao servidor, JWT em cookies HttpOnly,
rotas administrativas protegidas, isolamento multi-inquilino por `owner_id` nas server
actions, e nenhum `dangerouslySetInnerHTML`/`eval`.

Não foram encontradas vulnerabilidades **críticas**. Foram corrigidos problemas de
severidade **alta** (dependências vulneráveis) e **média** (endpoint de diagnóstico
expondo configuração, endpoints de analytics graváveis sem rate limit). Uma chave
pública do Google Maps versionada foi **sinalizada** para rotação/restrição (não
removida do código para não derrubar o mapa de produção antes da env estar setada).

Nenhuma alteração destrutiva foi feita no banco ou na produção.

---

## 2. Stack identificada

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16.2.6 (App Router, Turbopack), React 19.2.4 |
| Linguagem | TypeScript 5 |
| Estilo | CSS Modules + Tailwind v4 |
| Auth / BD | Supabase (`@supabase/ssr`) — Postgres + RLS, Auth, Storage |
| Admin no servidor | `service_role` via `createAdminClient` (nunca no cliente) |
| Pagamento | Mercado Pago (assinatura recorrente `preapproval` + webhook HMAC) |
| Mapa | Google Maps JS API (cliente) |
| Hospedagem | Vercel (cron) + GitHub |

---

## 3. Vulnerabilidades e correções

### 3.1 Críticas
Nenhuma encontrada.

### 3.2 Altas

**A1 — Dependências vulneráveis (`sharp`, `ws`)**
- Risco: `sharp` <0.35 herda CVEs do libvips (processamento de imagem malformada →
  possível crash/DoS); o upload de fotos processa imagens de donos autenticados.
  `ws` <8.20.1 tem DoS por exaustão de memória.
- Arquivos: `package.json`, `package-lock.json`.
- Correção: `sharp` (dep direta, usada em `app/studio/clinicas/[slug]/admin/*`)
  atualizado para **0.35.3**; `ws` para **8.21.1** (`npm audit fix`, não-breaking).
- Validação: `npm ls`, import de `sharp` OK (0.35.3), build de produção passa.
- Residual: o Next 16.2.6 empacota `sharp@0.34.5` para o otimizador de imagens.
  Mitigado porque (a) os uploads são re-codificados pelo nosso `sharp` 0.35.3 antes de
  ir ao Storage e (b) `images.remotePatterns` restringe fontes ao nosso Storage.
  Recomenda-se atualizar o Next para um patch 16.2.x que traga o sharp corrigido.

### 3.3 Médias

**M1 — `/api/health` expunha a configuração de ambiente**
- Risco: retornava quais variáveis (`MERCADOPAGO_*`, `SUPABASE_*`, etc.) estavam
  setadas e a URL do Supabase — reconhecimento para um atacante.
- Arquivo: `app/api/health/route.ts` (era um endpoint de debug temporário).
- Correção: **removido**.
- Validação: `GET /api/health` → 404.

**M2 — Endpoints de analytics graváveis sem auth nem rate limit**
- Risco: `POST /api/studio/analytics/view` e `/whatsapp-click` gravam com
  `service_role` a partir de dados do cliente, sem autenticação — permite inflar
  métricas de uma casa e encher as tabelas (indisponibilidade/custo).
- Arquivos: `app/api/studio/analytics/view/route.ts`,
  `app/api/studio/analytics/whatsapp-click/route.ts`.
- Correção: **rate limit por IP** (120/min); ao estourar, ignora sem gravar e sem erro.
  Validação de `clinicId` (inteiro positivo) já existia.
- Validação: 130 requisições rápidas → 119 gravadas, 11 barradas.
- Observação: o rate limit é em memória (por instância serverless). Ver recomendações.

**M3 — Chave do Google Maps versionada no código**
- Risco: `components/Map.tsx` traz uma chave `AIzaSy…` hardcoded. É uma chave
  `NEXT_PUBLIC` (client-side por natureza, já exposta no bundle), então o risco extra
  de estar no código é baixo — porém, se não estiver **restrita** por referrer no
  Google Cloud, pode ser abusada (roubo de cota/billing).
- Status: **NÃO removida** — a produção usa essa chave como fallback (o Vercel não tem
  a env setada); removê-la agora derrubaria o mapa. Marcada com comentário para
  remoção após a env estar em produção. Ações necessárias na seção 10 e 11.

### 3.4 Baixas

- **B1** — `lib/supabase/config.ts` tem fallbacks hardcoded (URL do projeto +
  `publishable key`). São **públicos** (não segredos); limpeza opcional.
- **B2** — Lint: `setState` dentro de `useEffect` em `components/studio/Lightbox.tsx`
  (padrão válido de detecção de mount para o portal — mantido); import morto
  `studioClinics` em `lib/studio/db.ts` (**corrigido**).

---

## 4. Auditoria OWASP (itens verificados sem achado)

| Item | Situação |
|---|---|
| SQL/NoSQL Injection | Consultas parametrizadas via supabase-js; sem SQL cru no app |
| XSS (refletido/armazenado/DOM) | Sem `dangerouslySetInnerHTML`/`eval`; React escapa; query do Maps com `encodeURIComponent` |
| CSRF | Server Actions do Next (tokens de ação); sem endpoints mutáveis por GET |
| SSRF | `fetch` apenas para hosts fixos (API do Mercado Pago); imagens restritas a `*.supabase.co` |
| IDOR / Broken Access Control | Server actions do painel resolvem a casa por `owner_id` da sessão, nunca por id do cliente; alteração/exclusão de modelo confere `clinic_id` do dono |
| Escalada de privilégio | Owner não define `plan`/`status`/`subscription_status` (campos explícitos); admin por e-mail/`app_metadata` |
| Mass assignment | `text(formData, chave)` explícito; sem spread do corpo no INSERT/UPDATE |
| Open redirect | `getSafeNextPath` exige `/` e barra `//`; redirects do proxy têm host fixo |
| Auth / sessão | JWT em cookie HttpOnly (Supabase SSR); login/cadastro com rate limit |
| Segredos no cliente | `service_role` só no servidor; cliente usa `publishable key` |
| Headers de segurança | CSP, HSTS, X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy — já configurados em `next.config.ts` |
| CORS | Sem CORS permissivo nas rotas de API |
| Cookies | Geridos pelo `@supabase/ssr` (HttpOnly/Secure/SameSite) |
| Webhook | HMAC `x-signature` verificado em tempo constante; fail-closed 401 |
| Rotas admin | `app/admin/layout.tsx` exige `getCurrentUser` + `isAdminUser` |
| Vazamento de dados | `studio_leads`: INSERT público, SELECT só admin (RLS) |
| Path traversal / command injection | Sem acesso a FS por input do usuário; sem exec de comando |

---

## 5. Isolamento multi-inquilino (casas)

Verificado no código: `app/studio/painel/actions.ts` e `lib/studio/owner.ts` resolvem
a casa **sempre** por `owner_id = auth.uid()` (sessão), ignorando qualquer id vindo do
formulário; mutações em modelos conferem que a modelo pertence à casa do dono
(`assertProfessionalOwnership`). Um dono não consegue ler/alterar/excluir dados de
outra casa manipulando URL, id ou corpo da requisição.

---

## 6. Performance

**Bom hoje:** `next/image` (dimensionado, otimizado), `next/font` (não bloqueante),
`select` com colunas específicas (não `*`), consultas em paralelo (`Promise.all`),
sitemap com ISR (`revalidate=3600`).

**Aplicadas nesta revisão:**
- **Home → ISR (`revalidate=60`)** em vez de `force-dynamic`: o HTML+dados passam a
  ser cacheados e regenerados a cada 60s (TTFB muito menor, menos carga no BD). A
  disponibilidade do dia fica no máximo 60s defasada — aceitável para a home. O
  cabeçalho autenticado continua correto (hidrata no cliente). Arquivo: `app/page.tsx`.
- **Over-fetch da página da clínica corrigido:** `getApprovedStudioClinicBySlug`
  carregava **todas** as casas (com joins) só para renderizar uma; agora consulta
  apenas a casa pedida por slug. Arquivo: `lib/studio/db.ts`. Resultado idêntico,
  bem mais rápido e escalável.

**Recomendações ainda pendentes (risco/infra):**
- `app/globals.css` (~23 mil linhas) → dividir por seção. **Não feito**: o arquivo
  tem seletores compartilhados (ex.: `.club-*` junto de `.studio-*`) e `.forum-*`
  ainda em uso (`app/lounge/anunciar`); remoção segura exige trabalho seletor a
  seletor.
- Rate limit persistente (Upstash Redis) → requer conta/credenciais do cliente.
- O mapa carrega as 151 casas de uma vez (aceitável agora; clusterizar se crescer).

---

## 7. Banco / Supabase

- RLS: revisada nas migrations (`studio_leads` público-insert/admin-read; perfis de
  produto com `is_ecosystem_admin()`). **Recomenda-se** uma auditoria de RLS ao vivo
  no dashboard (não foi possível introspecção via ferramentas).
- `SECURITY DEFINER`: `is_ecosystem_admin()` e o trigger de signup — revisados, com
  `search_path = public` fixado (bom contra hijack de search_path).
- Storage: buckets de fotos são de leitura pública (necessário para exibir). Uploads
  passam por server action com `service_role`, **não** pelo cliente. **Recomenda-se**
  confirmar no dashboard que os buckets **não** permitem INSERT/UPDATE por `anon`.
- `service_role`: nunca exposta ao navegador (confirmado).

---

## 8. Resultados dos testes

| Teste | Resultado |
|---|---|
| Type check (`tsc --noEmit`) | ✅ limpo |
| Lint (`npm run lint`) | 2 achados pré-existentes (1 corrigido, 1 mantido — padrão válido) |
| Build de produção (`next build`) | ✅ 38 páginas geradas |
| `GET /api/health` | ✅ 404 (removido) |
| `POST /analytics/view` válido / inválido | ✅ 200 / 400 |
| Rate limit analytics | ✅ 130 req → 119 gravadas, 11 barradas |
| Webhook sem assinatura | ✅ 401 |
| Páginas (home, mapa, clínica, planos, login) | ✅ 200 |
| Cadastro (signUp → cria studio_profiles) | ✅ funcionando |
| Isolamento entre casas | ✅ verificado no código (owner-scoped) |

Não executados (sem infra/UI): testes automatizados (projeto não tem suíte);
recuperação de senha ponta a ponta (fluxo existe, sem UI de "esqueci a senha").

---

## 9. Arquivos modificados / migrations

Modificados:
- `app/api/health/route.ts` — **removido**
- `app/api/studio/analytics/view/route.ts` — rate limit por IP
- `app/api/studio/analytics/whatsapp-click/route.ts` — rate limit por IP
- `lib/studio/db.ts` — remove import morto
- `components/Map.tsx` — comentário sinalizando a chave do Maps (sem mudança funcional)
- `package.json` / `package-lock.json` — `sharp`→0.35.3, `ws`→8.21.1

Migrations criadas nesta revisão: nenhuma (sem alteração de schema).

---

## 10. Segredos a revogar (sem revelar valores)

- **Chave da API do Google Maps** em `components/Map.tsx` — chave pública client-side.
  **Rotacionar** no Google Cloud e **restringir** (referrer HTTP + apenas Maps JS API).
  Nenhum segredo de servidor (service_role, tokens do Mercado Pago) está exposto no
  código ou versionado.

---

## 11. Configurações externas ainda necessárias

- **Vercel → Environment Variables:** setar `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (chave
  rotacionada). Depois disso, remover o fallback hardcoded de `components/Map.tsx`.
  (Pendências anteriores já sinalizadas: `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`.)
- **Google Cloud Console:** restringir a chave do Maps por referrer
  (`privacylog.vercel.app`, `privacylog.com.br`) e por API.
- **Supabase:** confirmar que os buckets de Storage não permitem escrita por `anon`;
  auditoria de RLS ao vivo.

---

## 12. Não corrigível automaticamente com segurança

- `sharp@0.34.5` empacotado pelo Next → requer atualização do Next (arriscado agora).
- Auditoria completa de RLS/policies de Storage → requer o dashboard/SQL do Supabase.
- CSP usa `'unsafe-inline'`/`'unsafe-eval'` (exigidos por Next/Maps) → só removível com
  CSP baseada em nonce (mudança de arquitetura).

---

## 13. Recomendações futuras

1. Rotacionar + restringir a chave do Maps e movê-la para env (seção 11).
2. Rate limit persistente (ex.: Upstash Redis) — o atual é por instância serverless.
3. CSP com nonce para eliminar `unsafe-inline`/`unsafe-eval`.
4. Dividir `globals.css` por seção (performance + manutenção).
5. ISR curto nas páginas sem dado ao vivo (TTFB).
6. Atualizar o Next para o último patch 16.2.x (corrige o sharp empacotado) com testes.
7. Adicionar uma suíte de testes automatizados (auth, isolamento, endpoints).

---

## 14. Checklist para implantação segura

- [ ] Rotacionar a chave do Google Maps e restringir no Google Cloud.
- [ ] Setar `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` no Vercel (chave nova).
- [ ] Setar `NEXT_PUBLIC_SITE_URL` e `CRON_SECRET` no Vercel.
- [ ] Confirmar no Supabase que buckets de Storage não aceitam escrita anônima.
- [ ] Rodar `npm audit` após deps atualizadas e revisar residuais.
- [ ] `npm run build` verde antes do deploy.
- [ ] Testar mapa, cadastro, login e checkout após o deploy.
- [ ] Confirmar que dados privados não aparecem em HTML/JS/logs.
- [ ] Backup do banco antes de qualquer migration (`node scripts/db-backup.mjs`).
