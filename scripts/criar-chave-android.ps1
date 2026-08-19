# Cria a chave de assinatura do app Android e cadastra os secrets no GitHub.
# Rode no PowerShell, a partir da pasta do projeto:
#     powershell -ExecutionPolicy Bypass -File scripts\criar-chave-android.ps1
#
# A SENHA que voce digitar NAO e gravada em lugar nenhum por este script:
# ela vai direto para o keytool e para o cofre de secrets do GitHub.

$ErrorActionPreference = "Stop"

$PastaChaves = Join-Path $env:USERPROFILE "PrivacyLog-Chaves"
$Keystore    = Join-Path $PastaChaves "privacylog.keystore"
$Alias       = "privacylog"

Write-Host ""
Write-Host "=== Chave de assinatura do app PrivacyLog ===" -ForegroundColor Cyan
Write-Host ""

# --- 1. Localiza o keytool (vem junto com o Java) -------------------------
$keytool = (Get-Command keytool -ErrorAction SilentlyContinue).Source
if (-not $keytool) {
  $candidatos = @(
    "$env:ProgramFiles\Eclipse Adoptium\*\bin\keytool.exe",
    "$env:ProgramFiles\Java\*\bin\keytool.exe",
    "$env:ProgramFiles\Android\Android Studio\jbr\bin\keytool.exe"
  )
  foreach ($c in $candidatos) {
    $achado = Get-ChildItem $c -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($achado) { $keytool = $achado.FullName; break }
  }
}

if (-not $keytool) {
  Write-Host "Java nao encontrado. Instalando o Temurin JDK 17 (uma unica vez)..." -ForegroundColor Yellow
  winget install --id EclipseAdoptium.Temurin.17.JDK --silent --accept-package-agreements --accept-source-agreements
  $achado = Get-ChildItem "$env:ProgramFiles\Eclipse Adoptium\*\bin\keytool.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $achado) {
    Write-Host "Instalacao concluida, mas o keytool nao foi localizado." -ForegroundColor Red
    Write-Host "FECHE E ABRA o PowerShell e rode este script de novo." -ForegroundColor Yellow
    exit 1
  }
  $keytool = $achado.FullName
}
Write-Host "keytool: $keytool" -ForegroundColor DarkGray

# --- 2. Gera a chave ------------------------------------------------------
if (Test-Path $Keystore) {
  Write-Host ""
  Write-Host "Ja existe uma chave em:" -ForegroundColor Yellow
  Write-Host "  $Keystore"
  Write-Host "Vou reaproveita-la (NAO crie outra: quem ja instalou o app so recebe"
  Write-Host "atualizacoes se forem assinadas com a MESMA chave)."
} else {
  New-Item -ItemType Directory -Force -Path $PastaChaves | Out-Null
  Write-Host ""
  Write-Host "Vou criar a chave. Voce vai digitar:" -ForegroundColor Cyan
  Write-Host "  1) uma SENHA (escolha uma forte e guarde no seu gerenciador de senhas)"
  Write-Host "  2) alguns dados da empresa (nome, cidade, estado, pais)"
  Write-Host "  3) 'sim' para confirmar no final"
  Write-Host ""
  Write-Host "IMPORTANTE: quando ele perguntar a senha da CHAVE, so aperte ENTER" -ForegroundColor Yellow
  Write-Host "para reaproveitar a mesma senha do keystore." -ForegroundColor Yellow
  Write-Host ""

  & $keytool -genkeypair -v -storetype PKCS12 `
    -keystore $Keystore -alias $Alias `
    -keyalg RSA -keysize 2048 -validity 10000

  if (-not (Test-Path $Keystore)) {
    Write-Host "A chave nao foi criada. Rode o script de novo." -ForegroundColor Red
    exit 1
  }
  Write-Host ""
  Write-Host "Chave criada em: $Keystore" -ForegroundColor Green
  Write-Host "FACA BACKUP deste arquivo. Sem ele nao ha como atualizar o app." -ForegroundColor Yellow
}

# --- 3. Mostra a impressao digital SHA-256 (dado publico) -----------------
Write-Host ""
Write-Host "Digite a senha mais uma vez para eu ler a impressao digital:" -ForegroundColor Cyan
$saida = ""
try {
  $ErrorActionPreference = "Continue"
  $saida = (& $keytool -list -v -keystore $Keystore -alias $Alias 2>&1) | Out-String
} finally {
  $ErrorActionPreference = "Stop"
}
$sha = [regex]::Match($saida, "SHA256:\s*([0-9A-Fa-f:]{95,})")

if (-not $sha.Success) {
  Write-Host "Nao consegui ler a impressao digital (senha errada?)." -ForegroundColor Red
  Write-Host "Rode de novo com a senha correta." -ForegroundColor Yellow
  exit 1
}

$fingerprint = $sha.Groups[1].Value.Trim()
Set-Content -Path (Join-Path $PastaChaves "sha256.txt") -Value $fingerprint -Encoding utf8

Write-Host ""
Write-Host "=== ENVIE ESTA LINHA PARA O CLAUDE ===" -ForegroundColor Green
Write-Host $fingerprint -ForegroundColor White
Write-Host "======================================" -ForegroundColor Green
Write-Host "(tambem salva em $PastaChaves\sha256.txt - este dado e publico)"

# --- 4. Cadastra os secrets no GitHub ------------------------------------
Write-Host ""
$gh = (Get-Command gh -ErrorAction SilentlyContinue).Source
if (-not $gh) {
  Write-Host "GitHub CLI nao encontrado; cadastre os secrets pelo site." -ForegroundColor Yellow
  exit 0
}

Write-Host "Cadastrando a chave nos secrets do GitHub..." -ForegroundColor Cyan
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($Keystore))
$tmp = Join-Path $env:TEMP "pl-keystore-b64.txt"
Set-Content -Path $tmp -Value $b64 -NoNewline -Encoding ascii
try {
  Get-Content $tmp -Raw | gh secret set ANDROID_KEYSTORE_BASE64 --repo engeduardoguerreiro/privacylog
  Write-Host "  ANDROID_KEYSTORE_BASE64 cadastrado" -ForegroundColor Green
} finally {
  Remove-Item $tmp -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Agora cole a SENHA da chave nas duas proximas perguntas:" -ForegroundColor Cyan
gh secret set ANDROID_KEYSTORE_PASSWORD --repo engeduardoguerreiro/privacylog
gh secret set ANDROID_KEY_PASSWORD --repo engeduardoguerreiro/privacylog

Write-Host ""
Write-Host "=== TUDO PRONTO ===" -ForegroundColor Green
Write-Host "1. Envie a linha SHA256 acima para o Claude"
Write-Host "2. Depois e so gerar o APK em:"
Write-Host "   https://github.com/engeduardoguerreiro/privacylog/actions"
Write-Host ""
