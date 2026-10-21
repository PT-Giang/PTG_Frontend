import { useCallback, useEffect, useState } from "react";
import type { StudyMaterial } from "@/components/sites/www-thea-study-18140289/root-8a5edab2/types";
import type { StudyWorkspace } from "./types";
import { emptyWorkspace, materialStorageKey, readWorkspace, saveWorkspace } from "./repository";
import { emptyStudyContent, studyApi, type StudyContentResponse } from "./studyApi";

export function useStudyWorkspace(materialId: string) {
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [workspace, setWorkspace] = useState<StudyWorkspace>(emptyWorkspace);
  const [studyContent, setStudyContent] = useState<StudyContentResponse>(emptyStudyContent);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const refreshStudyContent = useCallback(async () => {
    setStudyContent(await studyApi.getStudyContent(materialId));
  }, [materialId]);
  const load = useCallback(async () => {
    setError("");
    setReady(false);
    try {
      const [savedMaterial, savedContent, documentRecords, termRecords] = await Promise.all([
        studyApi.getMaterial(materialId),
        studyApi.getStudyContent(materialId),
        studyApi.listDocuments(materialId),
        studyApi.listTerms(materialId),
      ]);
      setMaterial({ id: savedMaterial.id, title: savedMaterial.title, className: savedMaterial.className || "", deleted: false, createdAt: savedMaterial.createdAt });
      setStudyContent(savedContent);
      const documentDetails = await Promise.all(documentRecords.map(document => studyApi.getDocument(materialId, document.id)));
      let savedWorkspace = emptyWorkspace();
      try { savedWorkspace = readWorkspace(materialId); } catch { /* Ignore malformed browser state; Backend remains authoritative for study content. */ }
      setWorkspace({
        ...savedWorkspace,
        documents: documentDetails.map(document => ({
          id: document.id, title: document.title, text: document.extractedText || "", createdAt: document.createdAt,
          sourceType: document.sourceType as StudyWorkspace["documents"][number]["sourceType"],
          sourceUrl: document.sourceUrl || undefined,
        })),
        terms: termRecords.map(term => ({
          id: term.id, term: term.term, definition: term.definition, documentId: term.documentId || undefined, level: term.level,
        })),
        guide: "",
      });
    }
    catch (error) { setError(error instanceof Error ? error.message : "Không thể đọc dữ liệu đã lưu."); }
    setReady(true);
  }, [materialId]);
  useEffect(() => {
    load();
    function changed(event: StorageEvent) {
      if (event.key === materialStorageKey || event.key === `thea-study-v1:${materialId}`) load();
    }
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, [load, materialId]);
  function updateWorkspace(next: StudyWorkspace) {
    setWorkspace(next);
    try { saveWorkspace(materialId, next); setSaveError(""); }
    catch { setSaveError("Chưa lưu được thay đổi. Bộ nhớ trình duyệt có thể đã đầy. Hãy tải bản sao lưu trước khi rời trang."); }
  }
  function updateMaterial(next: StudyMaterial) {
    void saveMaterialToBackend(next);
  }
  async function saveMaterialToBackend(next: StudyMaterial) {
    try {
      let classId: string | null = null;
      if (next.className) {
        const classes = await studyApi.listClasses();
        const existing = classes.find(item => item.name.toLocaleLowerCase("vi") === next.className.toLocaleLowerCase("vi"));
        classId = (existing || await studyApi.createClass(next.className)).id;
      }
      const saved = await studyApi.updateMaterial(next.id, {
        title: next.title,
        ...(classId ? { classId } : { clearClass: true }),
      });
      setMaterial({ ...next, title: saved.title, className: saved.className || "" });
      setSaveError("");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Chưa lưu được tên hoặc lớp. Hãy thử lại.");
    }
  }
  return { material, workspace, studyContent, ready, error, saveError, load, refreshStudyContent, updateWorkspace, updateMaterial };
}
