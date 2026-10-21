import { useState } from "react";
import { Link } from "react-router";
import HomeHeader from "../../root-8a5edab2/HomeHeader/HomeHeader";
import HomeFooter from "../../root-8a5edab2/HomeFooter/HomeFooter";
import HomeDialog from "../../root-8a5edab2/HomeDialog/HomeDialog";
import type { DialogState } from "../../root-8a5edab2/types";
import homeStyles from "../../root-8a5edab2/HomeDashboard/HomeDashboard.module.css";
import StudyNavigation from "../StudyNavigation/StudyNavigation";
import DocumentsView from "../DocumentsView/DocumentsView";
import GuideView from "../../studyGuides-943a9720/GuideView/GuideView";
import MemorizeView from "../../memorize-121927a4/MemorizeView/MemorizeView";
import QuizView from "../../test-e8eca392/QuizView/QuizView";
import SmartStudyView from "../../smartStudy-2cee7095/SmartStudyView/SmartStudyView";
import { useStudyWorkspace } from "@/study/useStudyWorkspace";
import { downloadText } from "@/study/repository";
import { studyApi } from "@/study/studyApi";
import styles from "./StudyShell.module.css";

interface StudyShellProps { materialId: string; view: string; mode?: "list" | "flashcards" | "games" }

export default function StudyShell({ materialId, view, mode = "flashcards" }: StudyShellProps) {
  const [dark, setDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const store = useStudyWorkspace(materialId);
  const { material, workspace, ready, error, saveError } = store;
  const props = { materialId, title: material?.title || "", workspace, studyContent: store.studyContent,
    onRefreshStudyContent: store.refreshStudyContent,
    onReviewFlashcard: async (flashcardId: string, correct: boolean) => {
      await studyApi.recordFlashcardReview(materialId, flashcardId, correct);
      await store.refreshStudyContent();
    }, onChange: store.updateWorkspace };
  return <div className={`${homeStyles.page} ${dark ? homeStyles.dark : ""}`} lang="vi">
    <a className={homeStyles.skip} href="#study-content">Bỏ qua đến nội dung học tập</a>
    <HomeHeader studyMode isDark={dark} onToggleTheme={() => setDark(!dark)} onAction={type => setDialog({ type, material: material || undefined })} />
    <StudyNavigation materialId={materialId} view={view} collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} />
    <div className={`${styles.content} ${collapsed ? styles.collapsed : ""}`}>
      <main id="study-content" tabIndex={-1} className={styles.main}>
        {!ready ? <p role="status">Đang tải bộ học liệu…</p> : error ? <div className={styles.empty}><h1>Chưa mở được bộ học liệu</h1><p role="alert">{error}</p><button type="button" onClick={store.load}>Thử lại</button><Link to="/">Về trang chủ</Link></div> : !material ? <div className={styles.empty}><h1>Không tìm thấy bộ học liệu</h1><p>Bộ học liệu này chưa có trong trình duyệt hiện tại hoặc đã được xóa.</p><Link to="/">Về trang chủ</Link></div> : <>
          {saveError && <div className={styles.error} role="alert"><p>{saveError}</p><button type="button" onClick={() => store.updateWorkspace(workspace)}>Thử lưu lại</button><button type="button" onClick={() => downloadText(`${material.title}.json`, JSON.stringify({ material, workspace }, null, 2), "application/json")}>Tải bản sao lưu</button></div>}
          {view === "study" && <DocumentsView {...props} material={material} onMaterialChange={store.updateMaterial} />}
          {view === "memorize" && <MemorizeView {...props} mode={mode} />}
          {view === "test" && <QuizView {...props} />}
          {view === "smartStudy" && <SmartStudyView key={materialId} {...props} />}
          {["studyGuides", "summaries", "podcasts"].includes(view) && <GuideView {...props} view={view} />}
        </>}
      </main>
      <HomeFooter />
    </div>
    {dialog && <HomeDialog state={dialog} onClose={() => setDialog(null)} onSave={() => setDialog(null)} />}
  </div>;
}
