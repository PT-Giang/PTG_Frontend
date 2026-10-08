import type { StudyDocument } from "./types";
import { materialStorageKey, readWorkspace } from "./repository";
interface ImportSource { id: string; title: string; documents: StudyDocument[] }
export function readImportSources(): ImportSource[] {
  const parsed: unknown = JSON.parse(localStorage.getItem(materialStorageKey) || "[]");
  if (!Array.isArray(parsed)) throw new Error("Không đọc được danh sách học liệu.");
  const sources: ImportSource[] = [];
  for (const material of parsed) {
    if (!material || typeof material.id !== "string" || typeof material.title !== "string" || material.deleted) continue;
    const workspace = readWorkspace(material.id);
    if (workspace.documents.length) sources.push({ id: material.id, title: material.title, documents: workspace.documents });
  }
  return sources;
}
