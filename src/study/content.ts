import type { StudyDocument, StudyTerm } from "./types";

export const exampleContent = `Quang hợp: Quá trình thực vật sử dụng ánh sáng để chuyển nước và khí carbon dioxide thành đường và oxygen.
Diệp lục: Sắc tố màu xanh giúp cây hấp thụ năng lượng ánh sáng.
Lục lạp: Bào quan thực hiện quá trình quang hợp trong tế bào thực vật.
Khí khổng: Các lỗ nhỏ trên lá giúp trao đổi khí với môi trường.
Rễ cây: Cơ quan hấp thụ nước và muối khoáng từ đất.
Mạch gỗ: Hệ thống vận chuyển nước và muối khoáng từ rễ lên các bộ phận của cây.`;

function normalizeText(value: string) {
  return value.toLocaleLowerCase("vi").normalize("NFC").replace(/[^\p{L}\p{N}\s]/gu, " ").trim();
}

/** Deterministic local extraction; replace this service when connecting AI. */
export function extractTerms(document: StudyDocument): StudyTerm[] {
  const seen = new Set<string>();
  const lines = document.text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  return lines.flatMap(line => {
    const match = line.match(/^(.{1,160}?)(?:\t|:\s*|\s+[–—]\s+)(.{2,})$/);
    if (!match) return [];
    const term = match[1].replace(/^[-*#\s]+/, "").trim();
    const definition = match[2].trim();
    const key = normalizeText(term);
    if (!key || seen.has(key)) return [];
    seen.add(key);
    return [{ id: crypto.randomUUID(), term, definition, documentId: document.id, level: 0 }];
  }).slice(0, 200);
}

export function mergeTerms(existing: StudyTerm[], incoming: StudyTerm[]): StudyTerm[] {
  const keys = new Set(existing.map(term => normalizeText(term.term)));
  return [...existing, ...incoming.filter(term => {
    const key = normalizeText(term.term);
    if (keys.has(key)) return false;
    keys.add(key);
    return true;
  })];
}

export function buildGuide(documents: StudyDocument[]): string {
  return documents.map(document => `# ${document.title}\n\n${document.text}`).join("\n\n");
}

export function summarizeDocuments(documents: StudyDocument[]) {
  return documents.map(document => ({ id: document.id, title: document.title, excerpts: document.text.split(/\n+|(?<=[.!?])\s+/).map(line => line.trim()).filter(line => line.length > 15).slice(0, 6) }));
}

export function findPassages(question: string, documents: StudyDocument[]) {
  const stopWords = new Set(["là", "gì", "của", "và", "có", "như", "thế", "nào", "cho", "tôi", "hãy", "về", "được", "trong", "một"]);
  const keywords = [...new Set(normalizeText(question).split(/\s+/).filter(word => word.length > 1 && !stopWords.has(word)))];
  if (!keywords.length) return [];
  return documents.flatMap(document => document.text.split(/\n+|(?<=[.!?])\s+/).filter(Boolean).map(text => {
    const normalized = normalizeText(text);
    return { documentId: document.id, title: document.title, text, score: keywords.filter(word => normalized.split(/\s+/).includes(word)).length / keywords.length };
  })).filter(passage => passage.score >= .5).sort((left, right) => right.score - left.score).slice(0, 3);
}
