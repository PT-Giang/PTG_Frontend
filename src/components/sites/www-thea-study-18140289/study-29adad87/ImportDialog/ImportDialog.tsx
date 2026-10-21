import { useEffect, useRef, useState } from "react";
import type { StudyImport } from "@/study/types";
import { maxTextLength, validateText } from "@/study/importDocument";
import HomeIcon from "../../root-8a5edab2/HomeIcon/HomeIcon";
import styles from "./ImportDialog.module.css";

interface ImportDialogProps { onClose(): void; onAdd(source: StudyImport): Promise<void> | void }

export default function ImportDialog({ onClose, onAdd }: ImportDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const request = useRef(0);
  const [mode, setMode] = useState("paste");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
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
    setBusy(false); setError(""); setMode(next); setText(""); setFile(null); setDescription(""); setTitle("");
  }
  async function readFile(file?: File) {
    if (!file) return;
    const currentRequest = ++request.current;
    setBusy(true); setError("");
    try {
      if (currentRequest !== request.current) return;
      if (!/\.(pdf|docx)$/i.test(file.name)) throw new Error("INS hiện hỗ trợ tệp PDF và DOCX.");
      if (file.size > 10 * 1024 * 1024) throw new Error("Tệp vượt quá 10 MB.");
      setFile(file); setTitle(file.name);
    } catch (error) {
      if (currentRequest === request.current) setError(error instanceof Error ? error.message : "Không đọc được tệp. Hãy kiểm tra tệp và thử lại.");
    } finally { if (currentRequest === request.current) setBusy(false); }
  }
  async function add() {
    try {
      if (mode === "topic" && description.trim().length < 10) throw new Error("Mô tả cần có ít nhất 10 ký tự.");
      if (mode === "upload" && !file) throw new Error("Hãy chọn một tệp PDF hoặc DOCX.");
      const content = mode === "upload" ? undefined : validateText(mode === "topic" ? description : text);
      setBusy(true);
      const sourceType = mode === "upload" ? "upload" : mode === "topic" ? "topic" : "text";
      await onAdd({ title: title.trim() || (mode === "topic" ? "Bài học theo mô tả" : file?.name || "Ghi chú của tôi"), sourceType, content, file: file || undefined });
      onClose();
    } catch (error) { setError(error instanceof Error ? error.message : "Vui lòng kiểm tra nội dung."); }
    finally { setBusy(false); }
  }
  return <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="import-heading" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={styles.content}>
      <button className={styles.close} type="button" aria-label="Đóng" onClick={onClose}><HomeIcon name="close" /></button>
      <h2 id="import-heading">Cung cấp tài liệu của bạn</h2>
      <div className={styles.panel}>
        <div className={styles.tabs} role="tablist" aria-label="Cách thêm tài liệu">{[["upload", "Tải lên tệp"], ["paste", "Dán ghi chú hoặc thuật ngữ"], ["topic", "Mô tả"]].map(([value, label]) => <button type="button" role="tab" aria-selected={mode === value} aria-controls="import-panel" key={value} onClick={() => changeMode(value)}>{label}</button>)}</div>
        <div role="tabpanel" id="import-panel">
          {mode === "upload" && <label className={styles.dropzone} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); void readFile(event.dataTransfer.files[0]); }}>
            <input type="file" accept=".pdf,.docx" aria-label="Chọn tệp tài liệu" disabled={busy} onChange={event => { void readFile(event.target.files?.[0]); event.target.value = ""; }} />
            <HomeIcon name="books" /><strong>{file ? file.name : "Nhấn để chọn hoặc kéo và thả để thêm tệp"}</strong><span>PDF, DOCX · tối đa 10 MB</span>
          </label>}
          {mode === "topic" && <><label className={styles.label} htmlFor="learning-description">Mô tả kiến thức bạn muốn học</label><textarea id="learning-description" placeholder="Ví dụ: Tôi muốn học JavaScript từ đầu, hiểu biến, hàm và mảng để tự làm một ứng dụng nhỏ." rows={6} maxLength={8000} value={description} onChange={event => setDescription(event.target.value)} /><p className={styles.hint}>Nêu chủ đề, trình độ hiện tại và mục tiêu học tập. INS sẽ dùng mô tả này để tạo bộ học liệu.</p></>}
          {mode === "paste" && <><label className={styles.label} htmlFor="import-text">Ghi chú hoặc thuật ngữ</label><textarea id="import-text" placeholder="Dán ghi chú hoặc thuật ngữ của bạn tại đây" rows={9} value={text} maxLength={maxTextLength} onChange={event => setText(event.target.value)} /></>}
        </div>
      </div>
      <label className={styles.label} htmlFor="document-title">Tên tài liệu</label><input id="document-title" maxLength={160} value={title} onChange={event => setTitle(event.target.value)} placeholder="Ghi chú của tôi" />
      {mode === "paste" && <p className={styles.hint}>Bạn có thể nhập mỗi dòng theo dạng “Thuật ngữ: Định nghĩa”.</p>}
      {busy && <p role="status">Đang xử lý tài liệu…</p>}{error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.actions}><button type="button" onClick={onClose} disabled={busy}>Hủy</button><button className={styles.primary} type="button" onClick={() => { void add(); }} disabled={busy || (mode === "upload" ? !file : !(mode === "topic" ? description.trim() : text.trim()))}>{busy ? "Đang tạo học liệu…" : "Tạo bộ học liệu"}</button></div>
    </div>
  </dialog>;
}
