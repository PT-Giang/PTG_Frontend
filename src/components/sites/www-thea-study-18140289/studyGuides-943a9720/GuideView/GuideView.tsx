
import { Link } from "react-router";
import { useState } from "react";
import { buildGuide, summarizeDocuments } from "@/study/content";
import { downloadText } from "@/study/repository";
import type { StudyViewProps } from "@/study/types";
import ReadAloud from "../ReadAloud/ReadAloud";
import PlusButton from "../../shared/PlusButton/PlusButton";
import PlusUpgradeDialog from "../../shared/PlusUpgradeDialog/PlusUpgradeDialog";
import { studyApi } from "@/study/studyApi";
import styles from "./GuideView.module.css";

interface GuideViewProps extends StudyViewProps {
  view: string;
}

const tabs = [
  { path: "studyGuides", label: "Hướng dẫn học tập" },
  { path: "summaries", label: "Tóm tắt" },
  { path: "podcasts", label: "Podcast ôn tập" },
];

export default function GuideView({ materialId, title, workspace, onChange, view, studyContent, onRefreshStudyContent }: GuideViewProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [showPlus, setShowPlus] = useState(false);
  const [busy, setBusy] = useState(false);
  const latestGuide = studyContent?.guides[0];
  const guide = latestGuide
    ? `# ${latestGuide.title}\n\n## Lộ trình học tập\n${latestGuide.steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}\n\n## Mẹo học\n${latestGuide.tips.map(tip => `- ${tip}`).join("\n")}`
    : workspace.guide || buildGuide(workspace.documents);
  const summaries = summarizeDocuments(workspace.documents);

  async function saveGuide() {
    if (!draft.trim()) { setNotice("Hãy mô tả nội dung bạn muốn chỉnh sửa."); return; }
    const source = workspace.documents.at(-1);
    if (!source) { setNotice("Hãy thêm tài liệu trước khi yêu cầu AI chỉnh sửa."); return; }
    setBusy(true); setNotice("");
    try {
      const instruction = `Chỉnh sửa phiên bản hướng dẫn học tập hiện tại theo yêu cầu sau: ${draft.trim()}\n\nHướng dẫn hiện tại:\n${guide}`;
      const job = await studyApi.generate(materialId, "guide", instruction, crypto.randomUUID(), {
        materialSource: "document",
        documentId: source.id,
      });
      await studyApi.getGeneration(materialId, job.id);
      await onRefreshStudyContent?.();
      setEditing(false);
      setNotice("Đã lưu phiên bản hướng dẫn mới. Phiên bản trước vẫn được giữ.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Chưa chỉnh sửa được hướng dẫn. Hãy thử lại.");
    } finally { setBusy(false); }
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
      <p className={styles.note}>{latestGuide ? "Hướng dẫn được tạo từ tài liệu đã lưu. Yêu cầu chỉnh sửa sẽ tạo phiên bản mới và giữ lại phiên bản trước." : "Thêm tài liệu để tạo hướng dẫn học tập."}</p>
      <div className={styles.actions}>
        {editing ? <>
          <button className={styles.primary} type="button" disabled={busy} onClick={() => { void saveGuide(); }}>{busy ? "Đang chỉnh sửa…" : "Yêu cầu AI chỉnh sửa"}</button>
          <button type="button" disabled={busy} onClick={() => { setEditing(false); setNotice(""); }}>Hủy</button>
        </> : <button type="button" onClick={() => { setDraft(""); setEditing(true); setNotice(""); }}>Yêu cầu chỉnh sửa</button>}
        <button type="button" onClick={() => downloadText(`${title.replace(/[<>:"/\\|?*]/g, "-")}-huong-dan.txt`, guide)}>Tải xuống</button>
      </div>
      {notice && <p role="status">{notice}</p>}
      {editing ? <div className={styles.editor}>
        <label htmlFor="guide-draft">Bạn muốn AI chỉnh sửa hướng dẫn như thế nào?</label>
        <textarea id="guide-draft" value={draft} onChange={event => setDraft(event.target.value)} rows={5} maxLength={8000} placeholder="Ví dụ: thêm bài tập thực hành và rút gọn phần lý thuyết." />
      </div> : latestGuide ? <article className={styles.guide} aria-label="Nội dung hướng dẫn">
        <h2>{latestGuide.title} · Phiên bản {latestGuide.version}</h2>
        <h3>Lộ trình học tập</h3><ol>{latestGuide.steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol>
        <h3>Mẹo học</h3><ul>{latestGuide.tips.map((tip, index) => <li key={`${index}-${tip}`}>{tip}</li>)}</ul>
        {latestGuide.sources.length > 0 && <div><h3>Nguồn tham khảo</h3><ul>{latestGuide.sources.map(source => <li key={source.id}>{source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> : source.title}{source.excerpt && <p>{source.excerpt}</p>}</li>)}</ul></div>}
        {studyContent?.guides.length ? <details><summary>Các phiên bản trước</summary>{studyContent.guides.slice(1).map(previous => <section key={previous.id}><h3>{previous.title} · Phiên bản {previous.version}</h3><ol>{previous.steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol><ul>{previous.tips.map((tip, index) => <li key={`${index}-${tip}`}>{tip}</li>)}</ul></section>)}</details> : null}
      </article> : <article className={styles.guide} aria-label="Nội dung hướng dẫn">
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
