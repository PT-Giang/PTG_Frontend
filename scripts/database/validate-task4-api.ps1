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
$containerName = "ins-task4-api-$PID"
$buildRoot = Join-Path $env:TEMP "$containerName-build"
$stdoutPath = Join-Path $env:TEMP "$containerName.out.log"
$stderrPath = Join-Path $env:TEMP "$containerName.err.log"
$containerStarted = $false
$buildCreated = $false
$appProcess = $null
$environmentNames = @('DB_URL', 'DB_USERNAME', 'DB_PASSWORD', 'JWT_SECRET', 'SERVER_PORT', 'SERVER_ADDRESS', 'DEMO_USER_ENABLED', 'LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY')
$previousEnvironment = @{}

function Read-SharedLog([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { return '' }
  $stream = [System.IO.File]::Open($Path, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
  try {
    $reader = [System.IO.StreamReader]::new($stream)
    try { return $reader.ReadToEnd() } finally { $reader.Dispose() }
  } finally { $stream.Dispose() }
}

function Assert-Equal($Actual, $Expected, [string]$Name) {
  if ($Actual -ne $Expected) { throw "$Name expected '$Expected' but received '$Actual'." }
  Write-Host "$Name=$Actual"
}

try {
  $portProbe = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
  $portProbe.Start(); $dbPort = ([System.Net.IPEndPoint]$portProbe.LocalEndpoint).Port; $portProbe.Stop()
  $appProbe = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
  $appProbe.Start(); $appPort = ([System.Net.IPEndPoint]$appProbe.LocalEndpoint).Port; $appProbe.Stop()

  & $docker.Source run --rm --detach --name $containerName --publish "127.0.0.1:${dbPort}:5432" `
    --env 'POSTGRES_USER=ins_test' --env 'POSTGRES_PASSWORD=temporary-only' --env 'POSTGRES_DB=ins_task4_test' $PostgresImage | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Could not start the temporary PostgreSQL container.' }
  $containerStarted = $true
  $ready = $false
  for ($attempt = 0; $attempt -lt 45; $attempt++) {
    & $docker.Source exec $containerName pg_isready -U ins_test -d ins_task4_test *> $null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    Start-Sleep -Seconds 1
  }
  if (-not $ready) { throw 'PostgreSQL did not become ready within 45 seconds.' }

  New-Item -ItemType Directory -Path $buildRoot | Out-Null; $buildCreated = $true
  & $robocopy.Source $backend $buildRoot /E /XD target .git /XF .env /R:1 /W:1 /NFL /NDL /NJH /NJS | Out-Null
  if ($LASTEXITCODE -ge 8) { throw 'Could not create an isolated backend build copy.' }
  Push-Location $buildRoot
  try {
    & $maven.Source -o clean package -DskipTests
    if ($LASTEXITCODE -ne 0) { throw 'Backend Maven package failed.' }
  } finally { Pop-Location }

  $jarPath = Join-Path $buildRoot 'target\ins-backend-0.1.0-SNAPSHOT.jar'
  foreach ($name in $environmentNames) { $previousEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, 'Process') }
  $testEnvironment = @{
    DB_URL = "jdbc:postgresql://127.0.0.1:${dbPort}/ins_task4_test"; DB_USERNAME = 'ins_test'; DB_PASSWORD = 'temporary-only'
    JWT_SECRET = 'temporary-task4-validation-secret-more-than-32-bytes'; SERVER_PORT = "$appPort"; SERVER_ADDRESS = '127.0.0.1'; DEMO_USER_ENABLED = 'false'
    LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY = 'DEBUG'
  }
  foreach ($name in $environmentNames) { [Environment]::SetEnvironmentVariable($name, $testEnvironment[$name], 'Process') }
  $appProcess = Start-Process -FilePath $java.Source -ArgumentList @('-Duser.timezone=UTC', '-jar', $jarPath) `
    -WorkingDirectory $buildRoot -PassThru -WindowStyle Hidden -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath

  $started = $false
  for ($attempt = 0; $attempt -lt 120; $attempt++) {
    $logs = (Read-SharedLog $stdoutPath) + (Read-SharedLog $stderrPath)
    if ($logs -match 'Started InsBackendApplication') { $started = $true; break }
    if ($appProcess.HasExited) { throw "Backend exited before startup completed.`n$logs" }
    Start-Sleep -Seconds 1
  }
  if (-not $started) { throw 'Backend startup did not complete within 120 seconds.' }

  $baseUrl = "http://127.0.0.1:${appPort}"
  $csrf = Invoke-RestMethod -Uri "$baseUrl/api/auth/csrf" -SessionVariable webSession
  $csrfCookie = $webSession.Cookies.GetCookies([Uri]"$baseUrl/api")['XSRF-TOKEN']
  if ($null -eq $csrfCookie) { throw 'The CSRF endpoint did not set its XSRF-TOKEN cookie.' }
  Write-Host "csrf_body_matches_cookie=$($csrf.token -eq $csrfCookie.Value)"
  $headers = @{ 'X-XSRF-TOKEN' = $csrfCookie.Value }
  $registerBody = @{ email = "task4-$PID@test.invalid"; password = 'Task4-test-password-2026!'; displayName = 'Task 4 Test' } | ConvertTo-Json -Compress
  $user = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/register" -WebSession $webSession -Headers $headers -ContentType 'application/json' -Body $registerBody
  $csrf = Invoke-RestMethod -Uri "$baseUrl/api/auth/csrf" -WebSession $webSession
  $csrfCookie = $webSession.Cookies.GetCookies([Uri]"$baseUrl/api")['XSRF-TOKEN']
  if ($null -eq $csrfCookie) { throw 'The authenticated CSRF endpoint did not set its XSRF-TOKEN cookie.' }
  if ([string]::IsNullOrWhiteSpace($csrf.token)) { throw 'The authenticated CSRF endpoint returned no request token.' }
  $headers = @{ 'X-XSRF-TOKEN' = $csrf.token }
  $profile = Invoke-RestMethod -Uri "$baseUrl/api/profile/me" -WebSession $webSession
  Assert-Equal $profile.avatars.Count 70 'avatar_count'

  try {
    $lockedBody = @{ avatarId = 'butterfly' } | ConvertTo-Json -Compress
    Invoke-RestMethod -Method Patch -Uri "$baseUrl/api/profile/me/avatar" -WebSession $webSession -Headers $headers -ContentType 'application/json' -Body $lockedBody | Out-Null
    throw 'A level-one user selected the level-two avatar.'
  } catch {
    $statusCode = [int]$_.Exception.Response.StatusCode
    if ($statusCode -ne 403 -or $_.ErrorDetails.Message -notmatch 'REQUEST_REJECTED') {
      $securityLogs = ((Read-SharedLog $stdoutPath) + (Read-SharedLog $stderrPath)) -split "`r?`n" | Select-Object -Last 20
      $securityLogs | ForEach-Object { Write-Host $_ }
      throw
    }
    Write-Host 'locked_avatar_status=403'
  }

  $materialBody = @{ title = 'Task 4 material'; description = 'Temporary fixture'; classId = $null } | ConvertTo-Json -Compress
  $material = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/materials" -WebSession $webSession -Headers $headers -ContentType 'application/json' -Body $materialBody
  $otherUserId = [guid]::NewGuid().ToString()
  $fixtureSql = @"
INSERT INTO users(id,email,display_name) VALUES ('$otherUserId','other-$PID@test.invalid','Other account');
INSERT INTO study_materials(owner_id,title) SELECT '$($user.id)'::uuid,'Task 4 fixture '||n FROM generate_series(1,19) n;
INSERT INTO study_materials(owner_id,title) SELECT '$otherUserId'::uuid,'Other fixture '||n FROM generate_series(1,50) n;
"@
  & $docker.Source exec $containerName psql -X -v ON_ERROR_STOP=1 -U ins_test -d ins_task4_test -c $fixtureSql | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Could not insert Task 4 mission fixtures.' }
  $profile = Invoke-RestMethod -Uri "$baseUrl/api/profile/me?userId=$otherUserId" -WebSession $webSession
  Assert-Equal $profile.id $user.id 'profile_ignores_untrusted_user_id'

  $sync = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/missions/sync" -WebSession $webSession -Headers $headers
  $materialMission = $sync | Where-Object code -eq 'materials_created_20'
  Assert-Equal $materialMission.progressCount 20 'owned_material_progress'
  Assert-Equal $materialMission.pointsAwardedTotal 75 'milestone_reward'
  $sync = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/missions/sync" -WebSession $webSession -Headers $headers
  $profile = Invoke-RestMethod -Uri "$baseUrl/api/profile/me" -WebSession $webSession
  Assert-Equal $profile.experiencePoints 115 'xp_after_repeated_sync'
  Assert-Equal $profile.level 2 'level_after_100_xp'

  $avatarBody = @{ avatarId = 'butterfly' } | ConvertTo-Json -Compress
  $profile = Invoke-RestMethod -Method Patch -Uri "$baseUrl/api/profile/me/avatar" -WebSession $webSession -Headers $headers -ContentType 'application/json' -Body $avatarBody
  Assert-Equal $profile.avatarId 'butterfly' 'selected_avatar'
  $authMe = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -WebSession $webSession
  Assert-Equal $authMe.avatarId 'butterfly' 'login_profile_avatar'

  $documentBody = @{ title = 'Task 4 source'; sourceType = 'text'; extractedText = 'temporary fixture'; sourceUrl = $null } | ConvertTo-Json -Compress
  Invoke-RestMethod -Method Post -Uri "$baseUrl/api/materials/$($material.id)/documents" -WebSession $webSession -Headers $headers -ContentType 'application/json' -Body $documentBody | Out-Null
  $profile = Invoke-RestMethod -Uri "$baseUrl/api/profile/me" -WebSession $webSession
  Assert-Equal $profile.experiencePoints 125 'xp_after_document_mission'

  $activitySql = @"
INSERT INTO generation_jobs(id,requester_id,material_id,job_type,status,idempotency_key,request_fingerprint,completed_at)
VALUES ('30000000-0000-0000-0000-000000000001','$($user.id)','$($material.id)','topic_lesson','succeeded','task4-topic-lesson','task4-topic-lesson',now())
ON CONFLICT(requester_id,idempotency_key) DO NOTHING;
INSERT INTO study_sessions(id,user_id,material_id,mode,status,ended_at)
VALUES ('40000000-0000-0000-0000-000000000001','$($user.id)','$($material.id)','smart','completed',now())
ON CONFLICT(id) DO UPDATE SET status='completed',ended_at=COALESCE(study_sessions.ended_at,now());
INSERT INTO session_questions(session_id,question_type,position,prompt_snapshot,answer_snapshot,explanation_snapshot)
SELECT '40000000-0000-0000-0000-000000000001','choice',n-1,'Task 4 question '||n,'"A"'::jsonb,'Fixture answer'
FROM generate_series(1,5) n ON CONFLICT(session_id,position) DO NOTHING;
INSERT INTO question_responses(question_id,response,result)
SELECT id,'"A"'::jsonb,'correct' FROM session_questions
WHERE session_id='40000000-0000-0000-0000-000000000001'
ON CONFLICT(question_id) DO NOTHING;
"@
  & $docker.Source exec $containerName psql -X -v ON_ERROR_STOP=1 -U ins_test -d ins_task4_test -c $activitySql | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Could not insert Task 4 activity fixtures.' }
  & $docker.Source exec $containerName psql -X -v ON_ERROR_STOP=1 -U ins_test -d ins_task4_test -c $activitySql | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Could not replay Task 4 activity fixtures.' }
  $cookieHeader = (@($webSession.Cookies.GetCookies([Uri]"$baseUrl/api") | ForEach-Object { "$($_.Name)=$($_.Value)" }) -join '; ')
  $syncJobs = 1..4 | ForEach-Object {
    Start-Job -ScriptBlock {
      param($Uri, $CsrfToken, $Cookies)
      $requestHeaders = @{ 'X-XSRF-TOKEN' = $CsrfToken; Cookie = $Cookies }
      Invoke-RestMethod -Method Post -Uri $Uri -Headers $requestHeaders | Out-Null
      'synced'
    } -ArgumentList "$baseUrl/api/missions/sync", $headers['X-XSRF-TOKEN'], $cookieHeader
  }
  try {
    $syncJobs | Wait-Job -Timeout 30 | Out-Null
    if (@($syncJobs | Where-Object State -ne 'Completed').Count -gt 0) { throw 'Concurrent mission sync did not finish cleanly.' }
    $concurrentResults = @($syncJobs | Receive-Job -ErrorAction Stop)
    Assert-Equal $concurrentResults.Count 4 'concurrent_sync_requests'
  } finally { $syncJobs | Remove-Job -Force -ErrorAction SilentlyContinue }
  $profile = Invoke-RestMethod -Uri "$baseUrl/api/profile/me" -WebSession $webSession
  Assert-Equal $profile.experiencePoints 155 'xp_after_job_session_and_answer_retry'
  $ownerQuery = "SELECT count(*) FROM generation_jobs WHERE requester_id='$($user.id)' AND idempotency_key='task4-topic-lesson'; SELECT count(*) FROM question_responses r JOIN session_questions q ON q.id=r.question_id WHERE q.session_id='40000000-0000-0000-0000-000000000001';"
  $ownerCounts = @(& $docker.Source exec $containerName psql -X -A -t -U ins_test -d ins_task4_test -c $ownerQuery)
  if ($LASTEXITCODE -ne 0) { throw 'Could not verify idempotent activity fixture counts.' }
  Assert-Equal $ownerCounts[0].Trim() 1 'idempotent_job_count'
  Assert-Equal $ownerCounts[1].Trim() 5 'idempotent_answer_count'
  Write-Host 'Task 4 API, owner isolation, avatar gate, XP, and repeated-sync checks passed.'
} catch {
  $failureLogs = ((Read-SharedLog $stdoutPath) + (Read-SharedLog $stderrPath)) -split "`r?`n" | Select-Object -Last 45
  $failureLogs | ForEach-Object { Write-Host $_ }
  throw
}
finally {
  if ($null -ne $appProcess -and -not $appProcess.HasExited) { Stop-Process -Id $appProcess.Id -Force; [void]$appProcess.WaitForExit(10000) }
  foreach ($name in $environmentNames) { [Environment]::SetEnvironmentVariable($name, $previousEnvironment[$name], 'Process') }
  if ($containerStarted) { & $docker.Source rm --force $containerName *> $null }
  if ($buildCreated -and (Test-Path -LiteralPath $buildRoot)) {
    $tempRoot = (Resolve-Path -LiteralPath $env:TEMP).Path.TrimEnd('\') + '\'
    $resolvedBuildRoot = (Resolve-Path -LiteralPath $buildRoot).Path
    if ($resolvedBuildRoot.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase)) {
      for ($attempt = 0; $attempt -lt 30 -and (Test-Path -LiteralPath $resolvedBuildRoot); $attempt++) {
        try { Remove-Item -LiteralPath $resolvedBuildRoot -Recurse -Force -ErrorAction Stop } catch { Start-Sleep -Seconds 1 }
      }
      if (Test-Path -LiteralPath $resolvedBuildRoot) { Write-Warning 'Validation passed, but a temporary build file is still locked.' }
    }
  }
  Remove-Item -LiteralPath $stdoutPath,$stderrPath -Force -ErrorAction SilentlyContinue
}
