param(
  [string]$BackendPath = 'P:\DATN\Backend',
  [string]$PostgresImage = 'postgres:16'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$docker = Get-Command docker -ErrorAction Stop
$maven = Get-Command mvn -ErrorAction Stop
$java = Get-Command java -ErrorAction Stop
$robocopy = Get-Command robocopy -ErrorAction Stop
$backend = (Resolve-Path -LiteralPath $BackendPath).Path
$containerName = "ins-v1-flyway-hibernate-$PID"
$buildRoot = Join-Path $env:TEMP "$containerName-build"
$containerStarted = $false
$buildCreated = $false
$appProcess = $null
$stdoutPath = Join-Path $env:TEMP "$containerName.out.log"
$stderrPath = Join-Path $env:TEMP "$containerName.err.log"
$environmentNames = @('DB_URL', 'DB_USERNAME', 'DB_PASSWORD', 'JWT_SECRET', 'SERVER_PORT', 'SERVER_ADDRESS', 'DEMO_USER_ENABLED')
$previousEnvironment = @{}

function Read-SharedLog {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) { return '' }
  $stream = [System.IO.File]::Open($Path, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
  try {
    $reader = [System.IO.StreamReader]::new($stream)
    try { return $reader.ReadToEnd() }
    finally { $reader.Dispose() }
  }
  finally { $stream.Dispose() }
}

try {
  $portProbe = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
  $portProbe.Start()
  $hostPort = ([System.Net.IPEndPoint]$portProbe.LocalEndpoint).Port
  $portProbe.Stop()

  & $docker.Source run --rm --detach --name $containerName `
    --publish "127.0.0.1:${hostPort}:5432" `
    --env 'POSTGRES_USER=ins_test' `
    --env 'POSTGRES_PASSWORD=temporary-only' `
    --env 'POSTGRES_DB=ins_migration_test' `
    $PostgresImage | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "Could not start PostgreSQL container from image '$PostgresImage'."
  }
  $containerStarted = $true

  $ready = $false
  for ($attempt = 0; $attempt -lt 45; $attempt++) {
    & $docker.Source exec $containerName pg_isready -U ins_test -d ins_migration_test *> $null
    if ($LASTEXITCODE -eq 0) {
      $ready = $true
      break
    }
    Start-Sleep -Seconds 1
  }
  if (-not $ready) {
    throw 'PostgreSQL did not become ready within 45 seconds.'
  }

  Write-Host 'Building the backend for the Flyway and Hibernate startup check...'
  New-Item -ItemType Directory -Path $buildRoot | Out-Null
  $buildCreated = $true
  & $robocopy.Source $backend $buildRoot /E /XD target .git /XF .env /R:1 /W:1 /NFL /NDL /NJH /NJS | Out-Null
  if ($LASTEXITCODE -ge 8) {
    throw 'Could not create an isolated backend build copy.'
  }

  Push-Location $buildRoot
  try {
    & $maven.Source -o clean package -DskipTests
    if ($LASTEXITCODE -ne 0) {
      throw 'Backend Maven package failed.'
    }
  }
  finally {
    Pop-Location
  }

  $jarPath = Join-Path $buildRoot 'target\ins-backend-0.1.0-SNAPSHOT.jar'
  if (-not (Test-Path -LiteralPath $jarPath)) {
    throw "Backend jar not found: $jarPath"
  }

  $testEnvironment = @{
    DB_URL = "jdbc:postgresql://127.0.0.1:${hostPort}/ins_migration_test"
    DB_USERNAME = 'ins_test'
    DB_PASSWORD = 'temporary-only'
    JWT_SECRET = 'temporary-validation-secret-with-more-than-32-bytes'
    SERVER_PORT = '0'
    SERVER_ADDRESS = '127.0.0.1'
    DEMO_USER_ENABLED = 'false'
  }
  foreach ($name in $environmentNames) {
    $previousEnvironment[$name] = [System.Environment]::GetEnvironmentVariable($name, 'Process')
    [System.Environment]::SetEnvironmentVariable($name, $testEnvironment[$name], 'Process')
  }

  Write-Host 'Starting the backend. Flyway applies V1; Hibernate validates the schema during startup...'
  $appProcess = Start-Process -FilePath $java.Source `
    -ArgumentList @('-Duser.timezone=UTC', '-jar', $jarPath) `
    -WorkingDirectory $buildRoot `
    -PassThru `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdoutPath `
    -RedirectStandardError $stderrPath

  $started = $false
  for ($attempt = 0; $attempt -lt 120; $attempt++) {
    $logs = (Read-SharedLog $stdoutPath) + (Read-SharedLog $stderrPath)
    if ($logs -match 'Started InsBackendApplication') {
      $started = $true
      break
    }
    if ($appProcess.HasExited) {
      $logTail = ($logs -split "`r?`n" | Select-Object -Last 35) -join "`n"
      throw "Backend exited with code $($appProcess.ExitCode) before startup completed.`n$logTail"
    }
    Start-Sleep -Seconds 1
  }
  if (-not $started) {
    $logs = (Read-SharedLog $stdoutPath) + (Read-SharedLog $stderrPath)
    $logTail = ($logs -split "`r?`n" | Select-Object -Last 35) -join "`n"
    throw "Backend startup did not complete within 120 seconds.`n$logTail"
  }

  Write-Host 'Flyway migration and Hibernate schema validation passed.'
  $verificationSql = "SELECT 'table_count=' || count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'; SELECT 'mission_count=' || count(*) FROM missions; SELECT 'mission_metric_count=' || count(DISTINCT metric_key) FROM missions; SELECT 'plan_count=' || count(*) FROM plans; SELECT 'flyway_success_count=' || count(*) FROM flyway_schema_history WHERE success;"
  $verification = @(& $docker.Source exec $containerName psql -X -A -t -v ON_ERROR_STOP=1 `
    -U ins_test -d ins_migration_test -c $verificationSql)
  if ($LASTEXITCODE -ne 0) {
    throw 'Could not query the schema verification results.'
  }
  $verification | ForEach-Object { Write-Host $_ }

  $expectedResults = @('table_count=31', 'mission_count=24', 'mission_metric_count=8', 'plan_count=2', 'flyway_success_count=1')
  foreach ($expected in $expectedResults) {
    if ($verification -notcontains $expected) {
      throw "Unexpected PostgreSQL verification result; expected '$expected'."
    }
  }
  Write-Host 'All expected PostgreSQL, Flyway, mission seed, and Hibernate checks passed.'
}
finally {
  if ($null -ne $appProcess -and -not $appProcess.HasExited) {
    Stop-Process -Id $appProcess.Id -Force
    [void]$appProcess.WaitForExit(10000)
  }
  foreach ($name in $environmentNames) {
    if ($previousEnvironment.ContainsKey($name)) {
      [System.Environment]::SetEnvironmentVariable($name, $previousEnvironment[$name], 'Process')
    }
  }
  if ($containerStarted) {
    & $docker.Source rm --force $containerName *> $null
  }
  if ($buildCreated -and (Test-Path -LiteralPath $buildRoot)) {
    $tempRoot = (Resolve-Path -LiteralPath $env:TEMP).Path.TrimEnd('\') + '\'
    $resolvedBuildRoot = (Resolve-Path -LiteralPath $buildRoot).Path
    if ($resolvedBuildRoot.StartsWith($tempRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
      for ($attempt = 0; $attempt -lt 30 -and (Test-Path -LiteralPath $resolvedBuildRoot); $attempt++) {
        try {
          Remove-Item -LiteralPath $resolvedBuildRoot -Recurse -Force -ErrorAction Stop
        }
        catch {
          Start-Sleep -Seconds 1
        }
      }
      if (Test-Path -LiteralPath $resolvedBuildRoot) {
        Write-Warning 'Validation passed, but the operating system kept a temporary build file open; cleanup can be retried later.'
      }
    }
  }
  Remove-Item -LiteralPath $stdoutPath, $stderrPath -Force -ErrorAction SilentlyContinue
}
