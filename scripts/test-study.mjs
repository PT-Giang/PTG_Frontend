import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import ts from "typescript";

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const temporary = await mkdtemp(path.join(tmpdir(), "thea-study-tests-"));
const require = createRequire(import.meta.url);
const services = {};
try {
  for (const name of ["content", "quiz", "repository", "topicLessons", "importDocument", "materialGroups"]) {
    const source = await readFile(path.join(project, "src", "study", `${name}.ts`), "utf8");
    const compiled = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const output = path.join(temporary, `${name}.cjs`);
    await writeFile(output, compiled);
    services[name] = require(output);
  }
} finally {
  assert.equal(path.dirname(path.resolve(temporary)), path.resolve(tmpdir()));
  assert.ok(path.basename(temporary).startsWith("thea-study-tests-"));
  await rm(temporary, { recursive: true, force: true });
}

const { extractTerms, mergeTerms, findPassages, buildGuide, summarizeDocuments } = services.content;
const { generateQuiz, isCorrectAnswer } = services.quiz;
const { emptyWorkspace, isWorkspace } = services.repository;
const { createMockTopicLesson } = services.topicLessons;
const { validateText, importDocument, maxTextLength } = services.importDocument;
const document = (text, id = "document-1") => ({ id, title: "Sinh học", text, createdAt: "2026-09-06T00:00:00Z" });
const term = (name, definition, id = name) => ({ id, term: name, definition, level: 0 });

test("extracts explicit colon, tab and dash pairs, deduplicates, preserves origin", () => {
  const result = extractTerms(document("Quang hợp: Tạo đường từ ánh sáng.\nDiệp lục\tSắc tố xanh.\nRễ cây — Hấp thụ nước.\nquang hợp: Định nghĩa lặp."));
  assert.equal(result.length, 3);
  assert.deepEqual(result.map(item => item.term), ["Quang hợp", "Diệp lục", "Rễ cây"]);
  assert.equal(new Set(result.map(item => item.id)).size, 3);
  assert.ok(result.every(item => item.documentId === "document-1" && item.level === 0));
  assert.equal(result[0].definition, "Tạo đường từ ánh sáng.");
});

test("does not invent terms from prose and caps extraction at 200", () => {
  assert.deepEqual(extractTerms(document("Đây là một đoạn văn thông thường. Cây cần ánh sáng để phát triển.")), []);
  assert.deepEqual(extractTerms(document("  \n ")), []);
  assert.equal(extractTerms(document(Array.from({ length: 240 }, (_, index) => `Thuật ngữ ${index}: Định nghĩa ${index}`).join("\n"))).length, 200);
});

test("merge retains existing edited term and progress, skips incoming duplicates", () => {
  const original = { ...term("Diệp lục", "Đã chỉnh sửa"), level: 3 };
  const merged = mergeTerms([original], [term("DIỆP LỤC", "Nội dung mới"), term("Rễ cây", "Hấp thụ nước"), term("rễ cây", "Bị lặp")]);
  assert.equal(merged.length, 2);
  assert.equal(merged[0], original);
  assert.equal(merged[0].level, 3);
});

test("retrieval ignores empty queries, stopwords and unmatched/subword queries", () => {
  const sources = [document("Quang hợp tạo đường từ ánh sáng. Lục lạp là bào quan của thực vật.")];
  for (const question of ["", "   ", "là gì của và có", "thiên văn", "quanx"]) {
    assert.deepEqual(findPassages(question, sources), [], question);
  }
  const found = findPassages("QUANG HỢP là gì?", sources);
  assert.equal(found.length, 1);
  assert.equal(found[0].documentId, "document-1");
  assert.equal(found[0].text, "Quang hợp tạo đường từ ánh sáng.");
});

test("retrieval ranks exact keyword overlap, limits results to three, preserves source", () => {
  const sources = [document("Rễ hấp thụ nước. Rễ cây dài. Rễ cây mọc dưới đất. Rễ cây giúp đứng vững. Rễ cây cần nước.", "roots")];
  const result = findPassages("rễ cây", sources);
  assert.equal(result.length, 3);
  assert.ok(result.every(item => item.score === 1 && item.documentId === "roots"));
});

test("guide and extractive summary retain document text and source identity", () => {
  const source = document("Một câu có đủ độ dài để được trích dẫn. Câu tiếp theo giữ nguyên nội dung.");
  assert.equal(buildGuide([source]), `# ${source.title}\n\n${source.text}`);
  assert.deepEqual(summarizeDocuments([]), []);
  const [summary] = summarizeDocuments([source]);
  assert.equal(summary.id, source.id);
  assert.ok(summary.excerpts.every(excerpt => source.text.includes(excerpt)));
});

test("quiz randomized generation has unique questions and exactly one correct option", () => {
  const terms = Array.from({ length: 8 }, (_, index) => term(`Thuật ngữ ${index}`, `Định nghĩa ${index}`));
  for (let round = 0; round < 100; round++) {
    const questions = generateQuiz(terms, 3, 10);
    assert.equal(questions.length, 8);
    assert.equal(new Set(questions.map(question => question.id)).size, 8);
    assert.equal(questions.filter(question => question.type === "choice").length, 3);
    for (const question of questions) {
      if (question.type === "short") assert.equal(question.options.length, 0);
      else {
        assert.equal(question.options.filter(option => isCorrectAnswer(option, question.answer)).length, 1);
        assert.equal(new Set(question.options).size, question.options.length);
        assert.ok(question.options.length >= 2 && question.options.length <= 4);
      }
    }
  }
});

test("quiz clamps invalid counts, deduplicates names, requires distinct definitions for choices", () => {
  const terms = [term("A", "Definition A"), term("B", "Definition B"), term(" a ", "Duplicate A")];
  assert.equal(generateQuiz(terms, 100, 100).length, 2);
  assert.equal(generateQuiz(terms, NaN, Infinity).length, 0);
  assert.equal(generateQuiz(terms, -2, -1).length, 0);
  assert.equal(generateQuiz(terms, 1.9, 0).length, 1);
  assert.equal(generateQuiz([], 5, 5).length, 0);
  assert.equal(generateQuiz(terms.slice(0, 1), 5, 0).length, 0);
  assert.equal(generateQuiz(terms.slice(0, 1), 5, 1).length, 1);
  assert.equal(generateQuiz([term("A", "Same"), term("B", " SAME ")], 5, 0).length, 0);
});

test("scoring normalizes Unicode/case/whitespace while retaining accents and punctuation", () => {
  assert.equal(isCorrectAnswer("  HỌC   tập ", "học tập"), true);
  assert.equal(isCorrectAnswer("học".normalize("NFD"), "học"), true);
  assert.equal(isCorrectAnswer("hoc tap", "học tập"), false);
  assert.equal(isCorrectAnswer("học!", "học"), false);
  assert.equal(isCorrectAnswer("", "học"), false);
});

test("workspace validator accepts valid snapshots and rejects malformed nested records", () => {
  const question = { id: "q", prompt: "Prompt", answer: "Answer", type: "short", options: [] };
  const attempt = { id: "a", createdAt: "2026-09-06T00:00:00Z", score: 1, durationSeconds: 10, answers: { q: "Answer" }, questions: [question] };
  const valid = { ...emptyWorkspace(), documents: [document("Content")], terms: [term("A", "Definition")], attempts: [attempt] };
  assert.equal(isWorkspace(valid), true);
  for (const invalid of [null, [], {}, { ...valid, documents: [null] }, { ...valid, terms: [{ ...valid.terms[0], level: 4 }] }, { ...valid, attempts: [{ ...attempt, questions: [{ ...question, options: [1] }] }] }, { ...valid, attempts: [{ ...attempt, answers: { q: 3 } }] }]) {
    assert.equal(isWorkspace(invalid), false);
  }
});

test("workspace validator rejects impossible progress and results", () => {
  const workspace = emptyWorkspace();
  const attempt = { id: "a", createdAt: "2026-09-06T00:00:00Z", score: 0, durationSeconds: 0, answers: {}, questions: [] };
  for (const invalid of [
    { ...workspace, smartAnswered: -1 },
    { ...workspace, smartCorrect: 1 },
    { ...workspace, smartAnswered: Infinity },
    { ...workspace, terms: [{ ...term("A", "Definition"), level: 0.5 }] },
    { ...workspace, terms: [{ ...term("A", "Definition"), documentId: 2 }] },
    { ...workspace, attempts: [{ ...attempt, score: 5 }] },
    { ...workspace, attempts: [{ ...attempt, durationSeconds: -1 }] },
  ]) assert.equal(isWorkspace(invalid), false, JSON.stringify(invalid));
});

test("topic lesson rejects empty, too short and oversized descriptions", async () => {
  for (const description of ["", "    ", "123456789", "x".repeat(2001)]) {
    await assert.rejects(createMockTopicLesson(description), /10.*2\.000/);
  }
  assert.equal((await createMockTopicLesson("x".repeat(2000))).sourceMode, "mock");
});

test("topic lesson recognizes accented and unaccented domains with extractable terms", async () => {
  for (const [accented, plain] of [
    ["Tìm hiểu quang hợp", "Tim hieu quang hop"],
    ["Học lập trình cơ bản", "Hoc lap trinh co ban"],
    ["Học tiếng Anh cơ bản", "Hoc tieng Anh co ban"],
    ["Tìm hiểu đạo hàm", "Tim hieu dao ham"],
    ["Phương pháp học hiệu quả", "Phuong phap hoc hieu qua"],
  ]) {
    const lesson = await createMockTopicLesson(accented);
    const variant = await createMockTopicLesson(plain);
    assert.equal(lesson.matched, true);
    assert.equal(lesson.sourceMode, "mock");
    assert.equal(lesson.title, variant.title);
    assert.equal(lesson.text, variant.text);
    assert.ok(lesson.objectives.length >= 3);
    assert.ok(extractTerms(document(lesson.text)).length >= 5);
    assert.match(lesson.note, /chưa tra cứu Internet/);
    assert.doesNotMatch(lesson.text, /https?:\/\//);
  }
});

test("unmatched topic yields an explicitly generic framework, not invented subject knowledge", async () => {
  const lesson = await createMockTopicLesson("Hệ thống an toàn hàng hải");
  assert.equal(lesson.matched, false);
  assert.equal(lesson.sourceMode, "mock");
  assert.match(lesson.title, /^Khung bài học mẫu về/);
  assert.match(lesson.overview, /không phải kiến thức/);
  assert.match(lesson.note, /Không tìm thấy bài mẫu phù hợp/);
  const second = await createMockTopicLesson("Một lĩnh vực chưa hỗ trợ");
  assert.equal(second.text, lesson.text);
});

test("text validation removes null bytes and whitespace, rejects blank and oversized content", () => {
  assert.equal(validateText("  Quang\u0000 hợp\n  "), "Quang hợp");
  for (const value of ["", " \n\t ", "\u0000 \u0000"]) assert.throws(() => validateText(value), /Không tìm thấy văn bản/);
  assert.equal(validateText("x".repeat(maxTextLength)).length, maxTextLength);
  assert.throws(() => validateText("x".repeat(maxTextLength + 1)), /500\.000/);
});

test("text files import successfully including uppercase extensions and reject unsupported formats", async () => {
  for (const extension of ["txt", "TXT", "md", "csv", "tsv"]) {
    assert.equal(await importDocument(new File(["  Diệp lục: Sắc tố xanh.\u0000\n"], `lesson.${extension}`)), "Diệp lục: Sắc tố xanh.");
  }
  await assert.rejects(importDocument(new File(["content"], "lesson.exe")), /Hỗ trợ PDF/);
  await assert.rejects(importDocument(new File(["content"], "lesson")), /Hỗ trợ PDF/);
  await assert.rejects(importDocument(new File(["  \u0000"], "empty.txt")), /Không tìm thấy văn bản/);
  await assert.rejects(importDocument(new File(["x".repeat(maxTextLength + 1)], "large.txt")), /500\.000/);
});

test("oversized files reject before reading bytes or loading PDF/DOCX parsers", async () => {
  class OversizedFile extends File {
    async text() { assert.fail("Oversized input must not be read"); }
    async arrayBuffer() { assert.fail("Oversized input must not be parsed"); }
  }
  for (const extension of ["txt", "pdf", "docx"]) {
    const file = new OversizedFile([new Uint8Array(10 * 1024 * 1024 + 1)], `oversized.${extension}`);
    await assert.rejects(importDocument(file), /10 MB/);
  }
});

const material = (id, className = "", extra = {}) => ({ id, title: id, className, deleted: false, ...extra });
test("class rename updates all members including deleted without changing IDs or content", () => {
  const original = [material("one", "React"), material("two", "React", { deleted: true }), material("three", "BA")];
  const renamed = services.materialGroups.renameClass(original, "React", "Frontend");
  assert.deepEqual(renamed.map(item => item.className), ["Frontend", "Frontend", "BA"]);
  assert.deepEqual(renamed.map(item => item.id), ["one", "two", "three"]);
  assert.equal(renamed[1].deleted, true);
  assert.equal(original[0].className, "React");
  assert.throws(() => services.materialGroups.renameClass(original, "React", "ba"));
  assert.throws(() => services.materialGroups.renameClass(original, "React", " "));
});
test("class grouping separates unclassified from identically named real class", () => {
  const groups = services.materialGroups.groupMaterials([material("one"), material("two", "Chưa phân loại")], "Lớp");
  assert.equal(groups.length, 2);
  assert.notEqual(groups[0].key, groups[1].key);
  assert.equal(groups[1].items[0].id, "one");
});
test("legacy and invalid dates are not mislabeled as today; color values are validated", () => {
  const materials = [material("old"), material("bad", "", { createdAt: "invalid" }), material("new", "React", { createdAt: "2026-10-04T12:00:00" })];
  const groups = services.materialGroups.groupMaterials(materials, "Ngày", new Date("2026-10-04T16:00:00"));
  assert.deepEqual(groups.find(group => group.name === "Trước đây").items.map(item => item.id), ["old", "bad"]);
  assert.equal(groups.find(group => group.name === "Hôm nay").items[0].id, "new");
  assert.equal(services.materialGroups.colorForClass([material("one", "React", { classColor: "invalid" })], "React"), "#0075ff");
  assert.equal(services.materialGroups.colorForClass([material("one", "React", { classColor: "#cb9ce7" })], "React"), "#cb9ce7");
});
