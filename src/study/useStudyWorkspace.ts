"use client";
import { useCallback, useEffect, useState } from "react";
import type { StudyMaterial } from "@/components/sites/www-thea-study-18140289/root-8a5edab2/types";
import type { StudyWorkspace } from "./types";
import { emptyWorkspace, materialStorageKey, readMaterial, readWorkspace, saveMaterial, saveWorkspace } from "./repository";

export function useStudyWorkspace(materialId: string) {
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [workspace, setWorkspace] = useState<StudyWorkspace>(emptyWorkspace);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const load = useCallback(() => {
    setError("");
    try { setMaterial(readMaterial(materialId)); setWorkspace(readWorkspace(materialId)); }
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
    setMaterial(next);
    try { saveMaterial(next); setSaveError(""); }
    catch { setSaveError("Chưa lưu được tên hoặc lớp. Hãy thử lại."); }
  }
  return { material, workspace, ready, error, saveError, load, updateWorkspace, updateMaterial };
}
