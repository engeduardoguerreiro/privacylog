# App Android (APK) do PrivacyLog

O app e um **TWA (Trusted Web Activity)**: um "casco" Android que abre
`https://www.privacylog.com.br` em tela cheia, sem barra de navegador.

**O conteudo do app e o proprio site.** Cada deploy na Vercel ja aparece no
app — so e preciso gerar um APK novo quando mudar icone, nome ou versao.

---

## Caminho rapido (recomendado)

Ha um script que faz os passos 1 a 3 de uma vez: instala o Java se faltar, cria
a chave, mostra a impressao digital e cadastra os secrets no GitHub.

No PowerShell, dentro da pasta do projeto:

```powershell
powershell -ExecutionPolicy Bypass -File scriptscriar-chave-android.ps1
```

Voce so digita a senha da chave. Ao final ele imprime a linha SHA256 que deve
ser enviada ao Claude. Os passos manuais abaixo ficam como referencia.

---
## Passo 1 - Criar a chave de assinatura (uma unica vez)

A chave identifica o app como oficialmente seu. **Se ela for perdida, nao e
possivel publicar atualizacoes** do app para quem ja instalou: guarde o arquivo
e a senha com cuidado (gerenciador de senhas + backup).

Precisa do `keytool`, que vem com o Java. Se nao tiver Java instalado, baixe o
**Temurin JDK 17** em <https://adoptium.net>.

Rode no terminal, **fora da pasta do projeto** (a chave nunca deve ser
versionada):

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore privacylog.keystore \
  -alias privacylog \
  -keyalg RSA -keysize 2048 -validity 10000
```

Ele vai pedir:

- **senha do keystore** — escolha uma forte e guarde;
- nome, organizacao, cidade, estado, pais (pode ser os dados da empresa);
- confirme com `sim`.

> Use a **mesma senha** para o keystore e para a chave (o Bubblewrap espera
> assim). Se o keytool perguntar a senha da chave, apenas pressione Enter para
> reaproveitar a do keystore.

## Passo 2 — Pegar a impressao digital SHA-256

```bash
keytool -list -v -keystore privacylog.keystore -alias privacylog
```

Copie a linha **`SHA256:`** (algo como `AB:CD:EF:...`). Esse valor **e publico**
— ele so declara qual chave assinou o app oficial. Envie para mim: eu coloco em
`app/.well-known/assetlinks.json/route.ts`, que e o que faz o Android confiar no
app e esconder a barra de endereco.

## Passo 3 — Cadastrar os segredos no GitHub

Em **github.com/engeduardoguerreiro/privacylog → Settings → Secrets and
variables → Actions → New repository secret**, crie os tres:

| Secret | Conteudo |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | o arquivo da chave convertido em base64 (comando abaixo) |
| `ANDROID_KEYSTORE_PASSWORD` | a senha do keystore |
| `ANDROID_KEY_PASSWORD` | a senha da chave (normalmente a mesma) |

Para gerar o base64 do arquivo:

```bash
base64 -w0 privacylog.keystore > privacylog.keystore.base64
```

No Windows (PowerShell):

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("privacylog.keystore")) | Set-Content privacylog.keystore.base64
```

Abra o `.txt` gerado, copie todo o conteudo e cole no secret.
**Apague o arquivo base64 depois** — ele equivale a propria chave.

## Passo 4 — Gerar o APK

No GitHub: aba **Actions → "APK Android (TWA)" → Run workflow**.

Campos:

- **version**: versao visivel (ex.: `1.0.0`);
- **version_code**: numero inteiro, **sempre maior** que o da versao anterior;
- **publish**: deixe marcado para publicar em Releases.

Ao terminar, o APK fica publicado em Releases e o site ja o distribui em
`/baixar-app` — o link aponta sempre para a versao mais recente.

---

## Como o usuario instala

- **Android**: entra em `/baixar-app`, toca em baixar, autoriza "instalar apps
  desta fonte" e instala. O aviso e normal fora da Play Store.
- **iPhone**: nao existe APK. A pagina mostra o passo a passo do Safari
  ("Adicionar a Tela de Inicio"), que instala o PWA.

## Manutencao

| Mudou o que | Precisa gerar APK novo? |
| --- | --- |
| Conteudo, paginas, precos, layout | Nao — atualiza sozinho |
| Icone, nome do app, cor da splash | Sim |
| Dominio do site | Sim (e refazer o assetlinks) |

## Se quiser publicar na Play Store depois

O mesmo build ja gera o `app-release-bundle.aab`, formato exigido pela loja.
Seria necessario: conta de desenvolvedor Google Play (US$ 25, pagamento unico),
politica de privacidade publicada e a classificacao de conteudo adequada.
