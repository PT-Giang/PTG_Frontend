import { useEffect, useRef, useState } from "react";
import type { StudyDocument } from "@/study/types";
import { importDocument, maxTextLength, validateText } from "@/study/importDocument";
import HomeIcon from "../../root-8a5edab2/HomeIcon/HomeIcon";
import TopicLessonPanel from "../TopicLessonPanel/TopicLessonPanel";
import styles from "./ImportDialog.module.css";

interface ImportDialogProps { onClose(): void; onAdd(document: StudyDocument): void }

export default function ImportDialog({ onClose, onAdd }: ImportDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const request = useRef(0);
  const [mode, setMode] = useState("upload");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.showModal();
    return () => { request.current++; previous?.focus(); };
  }, []);
  function changeMode(next: string) {
    if (next === mode) return;
    request.current++;
    setBusy(false); setError(""); setMode(next); setText(""); setTitle("");
  }
  async function readFile(file?: File) {
    if (!file) return;
    const currentRequest = ++request.current;
    setBusy(true); setError("");
    try {
      const content = await importDocument(file);
      if (currentRequest !== request.current) return;
      setText(content); setTitle(file.name);
    } catch (error) {
      if (currentRequest === request.current) setError(error instanceof Error ? error.message : "Không đọc được tệp. Hãy kiểm tra tệp và thử lại.");
    } finally { if (currentRequest === request.current) setBusy(false); }
  }
  function add() {
    try {
      const content = validateText(text);
      onAdd({ id: crypto.randomUUID(), title: title.trim() || "Ghi chú của tôi", text: content, createdAt: new Date().toISOString() });
      onClose();
    } catch (error) { setError(error instanceof Error ? error.message : "Vui lòng kiểm tra nội dung."); }
  }
  return <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="import-heading" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={styles.content}>
      <button className={styles.close} type="button" aria-label="Đóng" onClick={onClose}><HomeIcon name="close" /></button>
      <h2 id="import-heading">Cung cấp tài liệu của bạn</h2>
      <div className={styles.panel}>
        <div className={styles.tabs} role="tablist" aria-label="Cách thêm tài liệu">{[["upload", "Tải lên"], ["youtube", "YouTube"], ["paste", "Dán"], ["topic", "Mô tả kiến thức muốn học"]].map(([value, label]) => <button type="button" role="tab" aria-selected={mode === value} aria-controls="import-panel" key={value} onClick={() => changeMode(value)}>{label}</button>)}</div>
        <div role="tabpanel" id="import-panel">
          {mode === "upload" && <label className={styles.dropzone} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); void readFile(event.dataTransfer.files[0]); }}>
            <input type="file" accept=".pdf,.docx,.txt,.md,.csv,.tsv" aria-label="Chọn tệp tài liệu" disabled={busy} onChange={event => { void readFile(event.target.files?.[0]); event.target.value = ""; }} />
            <HomeIcon name="books" /><strong>Nhấn để chọn hoặc kéo và thả để thêm tệp</strong><span>PDF, DOCX, TXT, Markdown, CSV, TSV · tối đa 10 MB</span>
          </label>}
          {mode === "youtube" && <p className={styles.hint}>Dán bản chép lời của video bên dưới. Bản cục bộ chưa tự tải hoặc chuyển giọng nói từ YouTube thành văn bản.</p>}
          {mode === "topic" && <TopicLessonPanel onGenerated={lesson => { setTitle(`${lesson.title} (mẫu)`); setText(lesson.text); setError(""); }} />}
          {((mode !== "upload" && mode !== "topic") || text) && <><label className={styles.label} htmlFor="import-text">{mode === "upload" || mode === "topic" ? "Kiểm tra nội dung trước khi thêm" : "Nội dung tài liệu"}</label><textarea id="import-text" placeholder="Dán ghi chú hoặc nội dung khác ở đây" rows={9} value={text} maxLength={maxTextLength} onChange={event => setText(event.target.value)} /></>}
        </div>
      </div>
      <label className={styles.label} htmlFor="document-title">Tên tài liệu</label><input id="document-title" maxLength={160} value={title} onChange={event => setTitle(event.target.value)} placeholder="Ghi chú của tôi" />
      <p className={styles.hint}>Để tự tạo thẻ, nhập mỗi dòng theo dạng “Thuật ngữ: Định nghĩa”. Bạn có thể sửa thẻ sau khi thêm.</p>
      {busy && <p role="status">Đang đọc tệp trên thiết bị…</p>}{error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.actions}><button type="button" onClick={() => changeMode("topic")}>Mô tả kiến thức</button><button type="button" onClick={onClose}>Hủy</button><button className={styles.primary} type="button" onClick={add} disabled={busy || !text.trim()}>Thêm tài liệu</button></div>
    </div>
  </dialog>;
}
