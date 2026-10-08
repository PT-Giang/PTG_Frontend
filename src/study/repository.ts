import type { StudyMaterial } from "@/components/sites/www-thea-study-18140289/root-8a5edab2/types";
import type { StudyWorkspace } from "./types";

export const materialStorageKey = "thea-home-demo-v1";
const workspaceKey = (id: string) => `thea-study-v1:${id}`;

export function readClassNames(): string[] {
  const parsed: unknown = JSON.parse(localStorage.getItem(materialStorageKey) || "[]");
  if (!Array.isArray(parsed)) throw new Error("Không thể đọc danh sách lớp.");
  return [...new Set(parsed.flatMap(item => item && typeof item.className === "string" && item.className ? [item.className as string] : []))].sort((left, right) => left.localeCompare(right, "vi"));
}

export function emptyWorkspace(): StudyWorkspace {
  return { documents: [], terms: [], attempts: [], smartAnswered: 0, smartCorrect: 0, guide: "" };
}

export function readMaterial(id: string): StudyMaterial | null {
  const parsed: unknown = JSON.parse(localStorage.getItem(materialStorageKey) || "[]");
  if (!Array.isArray(parsed)) throw new Error("Danh sách bộ học liệu không hợp lệ.");
  return parsed.find((item): item is StudyMaterial => item && item.id === id && typeof item.title === "string" && typeof item.className === "string" && item.deleted === false) || null;
}

export function saveMaterial(material: StudyMaterial) {
  const parsed: unknown = JSON.parse(localStorage.getItem(materialStorageKey) || "[]");
  if (!Array.isArray(parsed)) throw new Error("Không thể đọc danh sách bộ học liệu.");
  localStorage.setItem(materialStorageKey, JSON.stringify(parsed.map(item => item?.id === material.id ? material : item)));
}

export function readWorkspace(id: string): StudyWorkspace {
  const raw = localStorage.getItem(workspaceKey(id));
  if (!raw) return emptyWorkspace();
  const parsed: unknown = JSON.parse(raw);
  if (!isWorkspace(parsed)) throw new Error("Dữ liệu học tập không hợp lệ. Dữ liệu đã lưu được giữ nguyên; hãy khôi phục bản sao lưu hoặc quay về trang chủ.");
  return parsed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

export function isWorkspace(value: unknown): value is StudyWorkspace {
  if (!isRecord(value)) return false;
  return Array.isArray(value.documents) && value.documents.every(document => isRecord(document) && typeof document.id === "string" && typeof document.title === "string" && typeof document.text === "string" && typeof document.createdAt === "string")
    && Array.isArray(value.terms) && value.terms.every(term => isRecord(term) && typeof term.id === "string" && typeof term.term === "string" && typeof term.definition === "string" && isCount(term.level) && term.level <= 3 && (term.documentId === undefined || typeof term.documentId === "string"))
    && Array.isArray(value.attempts) && value.attempts.every(attempt => isRecord(attempt) && typeof attempt.id === "string" && typeof attempt.createdAt === "string" && isCount(attempt.score) && isCount(attempt.durationSeconds) && isRecord(attempt.answers) && Object.values(attempt.answers).every(answer => typeof answer === "string") && Array.isArray(attempt.questions) && attempt.score <= attempt.questions.length && attempt.questions.every(question => isRecord(question) && typeof question.id === "string" && typeof question.prompt === "string" && typeof question.answer === "string" && (question.type === "choice" || question.type === "short") && Array.isArray(question.options) && question.options.every(option => typeof option === "string")))
    && isCount(value.smartAnswered) && isCount(value.smartCorrect) && value.smartCorrect <= value.smartAnswered && typeof value.guide === "string";
}

export function saveWorkspace(id: string, workspace: StudyWorkspace) {
  localStorage.setItem(workspaceKey(id), JSON.stringify(workspace));
}

export function downloadText(filename: string, content: string, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
