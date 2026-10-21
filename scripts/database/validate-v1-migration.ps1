param(
  [string]$MigrationPath = 'P:\DATN\Backend\src\main\resources\db\migration\V1__ins_initial_database.sql',
  [string]$PostgresImage = 'postgres:16'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$docker = Get-Command docker -ErrorAction Stop
$migration = (Resolve-Path -LiteralPath $MigrationPath).Path
$containerName = "ins-v1-migration-check-$PID"
$containerStarted = $false

try {
  & $docker.Source run --rm --detach --name $containerName `
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

  & $docker.Source cp $migration "${containerName}:/tmp/V1__ins_initial_database.sql"
  if ($LASTEXITCODE -ne 0) {
    throw 'Could not copy the migration into the test container.'
  }

  Write-Host 'Applying migration in a PostgreSQL transaction...'
  & $docker.Source exec $containerName psql -X -v ON_ERROR_STOP=1 `
    -U ins_test -d ins_migration_test --single-transaction `
    -f /tmp/V1__ins_initial_database.sql
  if ($LASTEXITCODE -ne 0) {
    throw 'Migration failed on a clean PostgreSQL database.'
  }

  $verificationSql = "SELECT 'table_count=' || count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'; SELECT 'mission_count=' || count(*) FROM missions; SELECT 'mission_metric_count=' || count(DISTINCT metric_key) FROM missions; SELECT 'plan_count=' || count(*) FROM plans;"
  & $docker.Source exec $containerName psql -X -A -t -v ON_ERROR_STOP=1 `
    -U ins_test -d ins_migration_test -c $verificationSql
  if ($LASTEXITCODE -ne 0) {
    throw 'Could not query the schema verification results.'
  }

  Write-Host 'Migration check completed. The temporary container will be removed.'
}
finally {
  if ($containerStarted) {
    & $docker.Source rm --force $containerName *> $null
  }
}
