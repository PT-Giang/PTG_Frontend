param(
  [string]$MigrationPath = 'P:\DATN\Backend\src\main\resources\db\migration\V1__ins_initial_database.sql',
  [string]$PostgresImage = 'postgres:16'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$docker = Get-Command docker -ErrorAction Stop
$migration = (Resolve-Path -LiteralPath $MigrationPath).Path
$containerName = "ins-task3-backfill-$PID"
$containerStarted = $false
$testMigration = Join-Path $env:TEMP "$containerName.sql"
$encoding = [System.Text.UTF8Encoding]::new($false)

$fixtureSql = @'
INSERT INTO users (id, email, display_name)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'task3@test.invalid', 'Task 3 fixture'),
  ('10000000-0000-0000-0000-000000000002', 'task3-other@test.invalid', 'Other fixture user');

INSERT INTO study_materials (id, owner_id, title)
VALUES ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Task 3 material');

INSERT INTO generation_jobs (id, requester_id, material_id, job_type, idempotency_key, request_fingerprint)
VALUES ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'summary', 'task3-fixture', 'task3-fixture');

INSERT INTO documents (id, material_id, title, source_type, extracted_text)
VALUES ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Fixture source', 'upload', 'Fixture text');

INSERT INTO terms (id, material_id, document_id, term, definition)
VALUES ('60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Fixture term', 'Fixture definition');

INSERT INTO term_progress (user_id, term_id, level, review_count, correct_count)
VALUES
  ('10000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 2, 3, 2),
  ('10000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', 1, 1, 1);

INSERT INTO study_sessions (id, user_id, material_id, mode)
VALUES ('70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'smart');

INSERT INTO session_questions (id, session_id, source_term_id, question_type, position, prompt_snapshot, answer_snapshot, explanation_snapshot)
VALUES ('80000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'choice', 0, 'Fixture question', '"A"', 'Fixture explanation');

INSERT INTO question_options (question_id, position, content)
VALUES ('80000000-0000-0000-0000-000000000001', 0, 'A');

INSERT INTO question_responses (question_id, response, result, duration_ms)
VALUES ('80000000-0000-0000-0000-000000000001', '"A"', 'correct', 1200);

INSERT INTO question_feedback (question_id, rating, comment)
VALUES ('80000000-0000-0000-0000-000000000001', 'positive', 'Fixture feedback');

INSERT INTO conversations (id, user_id, material_id)
VALUES ('90000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001');

INSERT INTO messages (id, conversation_id, sender_role, content, citations)
VALUES ('a0000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', 'assistant', 'Fixture answer', '[{"title":"Web fixture","url":"https://example.test/source","excerpt":"Fixture excerpt","isMock":true,"retrievedAt":"2026-10-01T00:00:00Z"}]');

INSERT INTO learning_artifacts (id, material_id, generation_job_id, artifact_type, content, version, origin, audio_path)
VALUES
  ('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'summary', '{"title":"Summary fixture","overview":"Overview fixture","key_points":["point one","point two"]}', 1, 'ai', NULL),
  ('50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'guide', '{"title":"Guide fixture","steps":["step one"],"tips":["tip one"]}', 1, 'ai', NULL),
  ('50000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'podcast', '{"title":"Podcast fixture","script":"Podcast script"}', 1, 'ai', 'audio/fixture.mp3'),
  ('50000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', NULL, 'summary', 'not valid json', 2, 'manual', NULL),
  ('50000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', NULL, 'summary', '{"overview":"Wrong points type","key_points":"not an array"}', 3, 'manual', NULL);

INSERT INTO artifact_sources (artifact_id, document_id)
VALUES
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000001');
'@

try {
  $migrationSql = [System.IO.File]::ReadAllText($migration)
  $marker = '-- Gộp từ V5__source_and_session_snapshots.sql'
  if (-not $migrationSql.Contains($marker)) {
    throw 'Could not locate the typed artifact backfill marker in V1.'
  }
  [System.IO.File]::WriteAllText($testMigration, $migrationSql.Replace($marker, $fixtureSql + "`n" + $marker), $encoding)

  & $docker.Source run --rm --detach --name $containerName `
    --env 'POSTGRES_USER=ins_test' `
    --env 'POSTGRES_PASSWORD=temporary-only' `
    --env 'POSTGRES_DB=ins_task3_test' `
    $PostgresImage | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "Could not start PostgreSQL container from image '$PostgresImage'."
  }
  $containerStarted = $true

  $ready = $false
  for ($attempt = 0; $attempt -lt 45; $attempt++) {
    & $docker.Source exec $containerName pg_isready -U ins_test -d ins_task3_test *> $null
    if ($LASTEXITCODE -eq 0) {
      $ready = $true
      break
    }
    Start-Sleep -Seconds 1
  }
  if (-not $ready) {
    throw 'PostgreSQL did not become ready within 45 seconds.'
  }

  & $docker.Source cp $testMigration "${containerName}:/tmp/V1__task3_fixture.sql"
  if ($LASTEXITCODE -ne 0) {
    throw 'Could not copy the fixture migration into the test container.'
  }

  Write-Host 'Applying V1 with legacy fixtures in a PostgreSQL transaction...'
  & $docker.Source exec $containerName psql -X -v ON_ERROR_STOP=1 `
    -U ins_test -d ins_task3_test --single-transaction -f /tmp/V1__task3_fixture.sql
  if ($LASTEXITCODE -ne 0) {
    throw 'V1 migration or Task 3 fixture backfill failed.'
  }

  $verificationSql = @'
SELECT 'summary=' || count(*) FROM course_summaries WHERE id='50000000-0000-0000-0000-000000000001' AND jsonb_array_length(key_points)=2 AND key_points->>0='point one';
SELECT 'guide=' || count(*) FROM study_guides WHERE id='50000000-0000-0000-0000-000000000002';
SELECT 'podcast=' || count(*) FROM podcasts WHERE id='50000000-0000-0000-0000-000000000003' AND script='Podcast script' AND audio_key='audio/fixture.mp3';
SELECT 'mapped_source=' || count(*) FROM generation_sources WHERE generation_job_id='30000000-0000-0000-0000-000000000001' AND document_id='40000000-0000-0000-0000-000000000001' AND source_type='document';
SELECT 'invalid_artifact_retained=' || count(*) FROM learning_artifacts a WHERE a.id='50000000-0000-0000-0000-000000000004' AND NOT EXISTS (SELECT 1 FROM course_summaries s WHERE s.id=a.id);
SELECT 'invalid_array_retained=' || count(*) FROM learning_artifacts a WHERE a.id='50000000-0000-0000-0000-000000000005' AND NOT EXISTS (SELECT 1 FROM course_summaries s WHERE s.id=a.id);
SELECT 'unmapped_source_retained=' || count(*) FROM artifact_sources WHERE artifact_id='50000000-0000-0000-0000-000000000004';
SELECT 'flashcard_progress=' || count(*) FROM flashcards f WHERE f.id='60000000-0000-0000-0000-000000000001' AND f.level=2 AND f.review_count=3 AND f.correct_count=2;
SELECT 'nonowner_progress_preserved=' || count(*) FROM term_progress WHERE user_id='10000000-0000-0000-0000-000000000002' AND term_id='60000000-0000-0000-0000-000000000001' AND level=1 AND review_count=1;
SELECT 'question_snapshot=' || count(*) FROM session_questions WHERE id='80000000-0000-0000-0000-000000000001' AND question_snapshot->'options'='["A"]'::jsonb AND response='"A"'::jsonb AND result='correct' AND duration_ms=1200 AND feedback_rating='positive' AND feedback_text='Fixture feedback';
SELECT 'message_citation=' || count(*) FROM generation_sources WHERE message_id='a0000000-0000-0000-0000-000000000001' AND title='Web fixture' AND url='https://example.test/source' AND excerpt='Fixture excerpt' AND is_mock;
'@
  $verification = @(& $docker.Source exec $containerName psql -X -A -t -v ON_ERROR_STOP=1 `
    -U ins_test -d ins_task3_test -c $verificationSql)
  if ($LASTEXITCODE -ne 0) {
    throw 'Could not query the Task 3 verification results.'
  }
  $verification | ForEach-Object { Write-Host $_ }

  $expectedResults = @('summary=1', 'guide=1', 'podcast=1', 'mapped_source=1', 'invalid_artifact_retained=1', 'invalid_array_retained=1', 'unmapped_source_retained=1', 'flashcard_progress=1', 'nonowner_progress_preserved=1', 'question_snapshot=1', 'message_citation=1')
  foreach ($expected in $expectedResults) {
    if ($verification -notcontains $expected) {
      throw "Unexpected Task 3 result; expected '$expected'."
    }
  }
  Write-Host 'Task 3 artifact and source backfill checks passed.'
}
finally {
  if ($containerStarted) {
    & $docker.Source rm --force $containerName *> $null
  }
  Remove-Item -LiteralPath $testMigration -Force -ErrorAction SilentlyContinue
}
