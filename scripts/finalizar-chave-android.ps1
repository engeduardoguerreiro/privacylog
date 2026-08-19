# Finaliza a configuracao do app Android:
#   1) le a impressao digital SHA-256 da chave ja criada
#   2) cadastra os 3 secrets no GitHub
#
# Voce digita a senha UMA VEZ. Ela nao e gravada em disco nem exibida na tela.
#
#     powershell -ExecutionPolicy Bypass -File scripts\finalizar-chave-android.ps1

$ErrorActionPreference = "Stop"

$PastaChaves = Join-Path $env:USERPROFILE "PrivacyLog-Chaves"
$Keystore    = Join-Path $PastaChaves "privacylog.keystore"
$Alias       = "privacylog"
$Repo        = "engeduardoguerreiro/privacylog"

Write-Host ""
Write-Host "=== Finalizando a chave do app PrivacyLog ===" -ForegroundColor Cyan

if (-not (Test-Path $Keystore)) {
  Write-Host "Chave nao encontrada em $Keystore" -ForegroundColor Red
  Write-Host "Rode antes: scripts\criar-chave-android.ps1" -ForegroundColor Yellow
  exit 1
}

# --- localiza o keytool ---------------------------------------------------
$keytool = (Get-Command keytool -ErrorAction SilentlyContinue).Source
if (-not $keytool) {
  $achado = Get-ChildItem "$env:ProgramFiles\Eclipse Adoptium\*\bin\keytool.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($achado) { $keytool = $achado.FullName }
}
if (-not $keytool) {
  Write-Host "keytool nao encontrado. Feche e reabra o PowerShell e tente de novo." -ForegroundColor Red
  exit 1
}

# --- pede a senha ate acertar (ate 3 tentativas) --------------------------
$fingerprint = $null
$plain = $null

for ($i = 1; $i -le 3; $i++) {
  Write-Host ""
  Write-Host "Digite a senha da chave (nao aparece na tela):" -ForegroundColor Cyan
  $segura = Read-Host -AsSecureString
  $bstr   = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($segura)
  $plain  = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)

  if ([string]::IsNullOrWhiteSpace($plain)) {
    Write-Host "Senha vazia. Tente de novo." -ForegroundColor Yellow
    continue
  }

  $saida = $plain | & $keytool -list -v -keystore $Keystore -alias $Alias 2>&1 | Out-String
  $m = [regex]::Match($saida, "SHA256:\s*([0-9A-Fa-f:]{95,})")

  if ($m.Success) {
    $fingerprint = $m.Groups[1].Value.Trim()
    break
  }

  if ($saida -match "password was incorrect|senha.*incorreta") {
    Write-Host "Senha incorreta (tentativa $i de 3)." -ForegroundColor Yellow
  } else {
    Write-Host "Nao consegui ler a impressao digital. Saida do keytool:" -ForegroundColor Red
    Write-Host ($saida.Substring(0, [Math]::Min(400, $saida.Length)))
    exit 1
  }
}

if (-not $fingerprint) {
  Write-Host ""
  Write-Host "Senha nao confere apos 3 tentativas." -ForegroundColor Red
  Write-Host "Se voce perdeu a senha, apague $Keystore e crie a chave de novo" -ForegroundColor Yellow
  Write-Host "(o app ainda nao foi publicado, entao nao ha problema em recriar)." -ForegroundColor Yellow
  exit 1
}

Set-Content -Path (Join-Path $PastaChaves "sha256.txt") -Value $fingerprint -Encoding ascii
Write-Host ""
Write-Host "Impressao digital lida com sucesso:" -ForegroundColor Green
Write-Host $fingerprint -ForegroundColor White

# --- cadastra os secrets --------------------------------------------------
$gh = (Get-Command gh -ErrorAction SilentlyContinue).Source
if (-not $gh) {
  Write-Host "GitHub CLI nao encontrado; cadastre os secrets pelo site." -ForegroundColor Yellow
  exit 0
}

Write-Host ""
Write-Host "Cadastrando os secrets no GitHub..." -ForegroundColor Cyan

$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($Keystore))
gh secret set ANDROID_KEYSTORE_BASE64   --repo $Repo --body $b64
gh secret set ANDROID_KEYSTORE_PASSWORD --repo $Repo --body $plain
gh secret set ANDROID_KEY_PASSWORD      --repo $Repo --body $plain

# limpa a senha da memoria do script
$plain = $null
$b64   = $null
[GC]::Collect()

Write-Host ""
Write-Host "=== PRONTO ===" -ForegroundColor Green
Write-Host "Pode avisar o Claude: ele le a impressao digital e gera o APK."
Write-Host ""
