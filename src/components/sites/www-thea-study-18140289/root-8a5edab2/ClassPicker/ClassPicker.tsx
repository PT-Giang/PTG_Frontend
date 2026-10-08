import { useEffect, useRef, useState } from "react";
import { readClassNames } from "@/study/repository";
import HomeIcon from "../HomeIcon/HomeIcon";
import styles from "./ClassPicker.module.css";

interface ClassPickerProps { value: string; onSelect(name: string): void; onClose(): void }
export default function ClassPicker({ value, onSelect, onClose }: ClassPickerProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [names, setNames] = useState<string[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current?.showModal();
    try { setNames(readClassNames()); } catch { setError("Không đọc được danh sách lớp đã lưu."); }
    return () => { if (previous instanceof HTMLElement) previous.focus(); };
  }, []);
  const trimmed = query.trim();
  const matches = names.filter(name => name.toLocaleLowerCase("vi").includes(trimmed.toLocaleLowerCase("vi")));
  const exact = names.find(name => name.toLocaleLowerCase("vi") === trimmed.toLocaleLowerCase("vi"));
  function choose(name: string) { onSelect(name); onClose(); }
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="class-picker-title" onCancel={onClose}>
    <div className={styles.header}><h2 id="class-picker-title">Chọn một lớp cho bộ học liệu của bạn</h2><button type="button" onClick={onClose} aria-label="Đóng"><HomeIcon name="close" /></button></div>
    <form onSubmit={event => { event.preventDefault(); if (trimmed) choose(exact || trimmed); }}>
      <label className={styles.search}><HomeIcon name="search" /><input autoFocus aria-label="Tìm hoặc tạo lớp" placeholder="Bắt đầu gõ để tạo lớp học mới" maxLength={80} value={query} onChange={event => setQuery(event.target.value)} /></label>
      <div className={styles.options} aria-label="Các lớp học">
        <button type="button" aria-pressed={!value} onClick={() => choose("")}>Chưa phân loại {!value && <span>✓</span>}</button>
        {matches.map(name => <button type="button" key={name} aria-pressed={value === name} onClick={() => choose(name)}>{name}{value === name && <span>✓</span>}</button>)}
        {trimmed && !exact && <button type="submit" className={styles.create}>+ Tạo lớp “{trimmed}”</button>}
      </div>
      {error && <p role="alert">{error}</p>}
    </form>
  </dialog>;
}
