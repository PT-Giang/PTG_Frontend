
import { Link } from "react-router";
import { useState } from "react";
import { buildGuide, summarizeDocuments } from "@/study/content";
import { downloadText } from "@/study/repository";
import type { StudyViewProps } from "@/study/types";
import ReadAloud from "../ReadAloud/ReadAloud";
import PlusButton from "../../shared/PlusButton/PlusButton";
import PlusUpgradeDialog from "../../shared/PlusUpgradeDialog/PlusUpgradeDialog";
import styles from "./GuideView.module.css";

interface GuideViewProps extends StudyViewProps {
  view: string;
}

const tabs = [
  { path: "studyGuides", label: "Hướng dẫn học tập" },
  { path: "summaries", label: "Tóm tắt" },
  { path: "podcasts", label: "Podcast ôn tập" },
];

export default function GuideView({ materialId, title, workspace, onChange, view }: GuideViewProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [showPlus, setShowPlus] = useState(false);
  const guide = workspace.guide || buildGuide(workspace.documents);
  const summaries = summarizeDocuments(workspace.documents);

  function saveGuide() {
    if (!draft.trim()) { setNotice("Hãy nhập nội dung trước khi lưu."); return; }
    onChange({ ...workspace, guide: draft.trim() });
    setEditing(false);
    setNotice("Đã cập nhật hướng dẫn học tập.");
  }

  return <section className={styles.container}>
    <nav className={styles.tabs} aria-label="Nội dung ôn tập">
      {tabs.map(tab => <Link key={tab.path} to={`/${tab.path}/${materialId}`} aria-current={view === tab.path ? "page" : undefined}
        className={view === tab.path ? styles.activeTab : undefined}>{tab.label}</Link>)}
    </nav>
    {view === "podcasts" ? <>
      <div className={styles.upgradeInvitation}>
        <p>Bạn muốn biến tài liệu của mình thành một bản tóm tắt cô đọng, đi thẳng vào trọng tâm không?</p>
        <PlusButton onClick={() => setShowPlus(true)} />
      </div>
      <details className={styles.localReading}>
        <summary>Đọc tài liệu bằng giọng nói trên thiết bị</summary>
        {guide.trim() ? <ReadAloud text={guide} /> : <p><Link to={`/study/${materialId}`}>Thêm tài liệu</Link> để dùng thử tính năng đọc cục bộ.</p>}
      </details>
    </> : !guide.trim() && !workspace.documents.length ? <div className={styles.empty}>
      <h1>Thêm nội dung để bắt đầu ôn tập</h1>
      <p>Hướng dẫn và bản trích tóm tắt sẽ được tạo từ tài liệu bạn lưu trên thiết bị.</p>
      <Link className={styles.primary} to={`/study/${materialId}`}>Thêm tài liệu</Link>
    </div> : view === "summaries" ? <div className={styles.content}>
      <h1>Tóm tắt</h1>
      <p className={styles.note}>Bản trích cục bộ: tối đa sáu đoạn đầu đủ dài từ mỗi tài liệu, chưa sử dụng AI.</p>
      {!summaries.length && <p>Chưa có tài liệu để trích tóm tắt. <Link to={`/study/${materialId}`}>Thêm tài liệu</Link></p>}
      {summaries.map(summary => <article key={summary.id} className={styles.summary}>
        <h2>{summary.title}</h2>
        {summary.excerpts.length ? <ul>{summary.excerpts.map((excerpt, index) => <li key={index}>{excerpt}</li>)}</ul>
          : <p>Tài liệu quá ngắn để trích tóm tắt. Bạn có thể đọc bản đầy đủ trong mục Tài liệu.</p>}
      </article>)}
    </div> : <div className={styles.content}>
      <h1>Hướng dẫn học tập</h1>
      <p className={styles.note}>Nội dung ghép từ tài liệu cục bộ. Bạn có thể chỉnh sửa để tạo ghi chú ôn tập của riêng mình.</p>
      <div className={styles.actions}>
        {editing ? <>
          <button className={styles.primary} type="button" onClick={saveGuide}>Lưu</button>
          <button type="button" onClick={() => { setEditing(false); setNotice(""); }}>Hủy</button>
        </> : <button type="button" onClick={() => { setDraft(guide); setEditing(true); setNotice(""); }}>Chỉnh sửa</button>}
        <button type="button" onClick={() => downloadText(`${title.replace(/[<>:"/\\|?*]/g, "-")}-huong-dan.txt`, guide)}>Tải xuống</button>
      </div>
      {notice && <p role="status">{notice}</p>}
      {editing ? <div className={styles.editor}>
        <label htmlFor="guide-draft">Nội dung hướng dẫn học tập</label>
        <textarea id="guide-draft" value={draft} onChange={event => setDraft(event.target.value)} rows={18} />
      </div> : <article className={styles.guide} aria-label="Nội dung hướng dẫn">
        {guide.split(/\r?\n/).map((line, index) => {
          if (line.startsWith("### ")) return <h3 key={index}>{line.slice(4)}</h3>;
          if (line.startsWith("## ")) return <h2 key={index}>{line.slice(3)}</h2>;
          if (line.startsWith("# ")) return <h2 key={index}>{line.slice(2)}</h2>;
          return line.trim() ? <p key={index}>{line}</p> : null;
        })}
      </article>}
    </div>}
    {showPlus && <PlusUpgradeDialog onClose={() => setShowPlus(false)} />}
  </section>;
}
