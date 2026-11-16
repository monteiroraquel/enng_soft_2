$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
$frontendPath = Join-Path $projectRoot "figma"
$backendPath = Join-Path $frontendPath "backend"
$backendEnv = Join-Path $backendPath ".env"
$backendEnvExample = Join-Path $backendPath ".env.example"
$apiUrl = "http://127.0.0.1:3001/health"
$frontendUrl = "http://localhost:8443"

function Invoke-Pnpm {
  param(
    [Parameter(Mandatory = $true)][string]$WorkingDirectory,
    [Parameter(Mandatory = $true)][string[]]$PnpmArguments
  )

  Push-Location $WorkingDirectory
  try {
    & corepack pnpm @PnpmArguments
    if ($LASTEXITCODE -ne 0) {
      throw "O comando 'corepack pnpm $($PnpmArguments -join ' ')' falhou na pasta '$WorkingDirectory'."
    }
  }
  finally {
    Pop-Location
  }
}

function Test-LocalUrl {
  param([Parameter(Mandatory = $true)][string]$Url)

  try {
    $null = Invoke-WebRequest -Uri $Url -TimeoutSec 2 -UseBasicParsing
    return $true
  }
  catch {
    return $false
  }
}

function Test-LocalPort {
  param([Parameter(Mandatory = $true)][int]$Port)

  $client = [System.Net.Sockets.TcpClient]::new()
  try {
    $client.Connect("127.0.0.1", $Port)
    return $true
  }
  catch {
    return $false
  }
  finally {
    $client.Dispose()
  }
}

function Wait-ForLocalUrl {
  param(
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][string]$ServiceName
  )

  for ($attempt = 0; $attempt -lt 40; $attempt += 1) {
    if (Test-LocalUrl $Url) { return }
    Start-Sleep -Milliseconds 750
  }

  throw "O $ServiceName não respondeu em $Url. Confira a janela dele para ver o erro."
}

if (-not (Get-Command corepack -ErrorAction SilentlyContinue)) {
  throw "Corepack não foi encontrado. Instale o Node.js 24 e tente novamente."
}

if (-not (Test-Path -LiteralPath $backendEnv)) {
  if (-not (Test-Path -LiteralPath $backendEnvExample)) {
    throw "Não encontrei o arquivo de exemplo de configuração: $backendEnvExample"
  }
  Copy-Item -LiteralPath $backendEnvExample -Destination $backendEnv
  Write-Host "Arquivo backend/.env criado a partir do exemplo."
}

if (-not (Test-Path -LiteralPath (Join-Path $backendPath "node_modules/.bin/prisma.cmd"))) {
  Write-Host "Instalando dependências do backend..."
  Invoke-Pnpm $backendPath @("install")
}

if (-not (Test-Path -LiteralPath (Join-Path $frontendPath "node_modules/.bin/vite.cmd"))) {
  Write-Host "Instalando dependências do front-end..."
  Invoke-Pnpm $frontendPath @("install")
}

$backendAlreadyRunning = Test-LocalUrl $apiUrl

if (-not $backendAlreadyRunning) {
  if (-not (Test-Path -LiteralPath (Join-Path $backendPath "src/generated/prisma/client.ts"))) {
    Write-Host "Gerando o Prisma Client..."
    Invoke-Pnpm $backendPath @("db:generate")
  }

  Write-Host "Preparando o banco local e os dados de demonstração..."
  Invoke-Pnpm $backendPath @("db:migrate")
  Invoke-Pnpm $backendPath @("db:seed")

  if (Test-LocalPort 3001) {
    throw "A porta 3001 já está ocupada, mas a API não respondeu em $apiUrl. Feche o processo que usa a porta e tente novamente."
  }

  Write-Host "Iniciando o backend..."
  Start-Process -FilePath "powershell.exe" `
    -WorkingDirectory $backendPath `
    -ArgumentList @("-NoExit", "-Command", "corepack pnpm dev")
  Wait-ForLocalUrl $apiUrl "backend"
}
else {
  Write-Host "O backend já está respondendo; vou reutilizá-lo."
}

if (-not (Test-LocalUrl $frontendUrl)) {
  if (Test-LocalPort 8443) {
    throw "A porta 8443 já está ocupada, mas o front-end não respondeu em $frontendUrl. Feche o processo que usa a porta e tente novamente."
  }

  Write-Host "Iniciando o front-end..."
  Start-Process -FilePath "powershell.exe" `
    -WorkingDirectory $frontendPath `
    -ArgumentList @("-NoExit", "-Command", "corepack pnpm dev")
  Wait-ForLocalUrl $frontendUrl "front-end"
}
else {
  Write-Host "O front-end já está respondendo; vou reutilizá-lo."
}

Write-Host "ByteHub está pronto: $frontendUrl"
Start-Process $frontendUrl
