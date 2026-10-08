import { useEffect, useRef, useState } from "react";
import { classColors } from "@/study/materialGroups";
import styles from "./ClassColorDialog.module.css";
interface ClassColorDialogProps { color: string; onSave(color: string): void; onClose(): void }
export default function ClassColorDialog({ color, onSave, onClose }: ClassColorDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState(color);
  const valid = /^#[a-f0-9]{6}$/i.test(value);
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current?.showModal();
    return () => { if (previous instanceof HTMLElement) previous.focus(); };
  }, []);
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="class-color-title" onCancel={onClose}>
    <button type="button" className={styles.close} aria-label="Đóng" onClick={onClose}>×</button>
    <h2 id="class-color-title">Chọn màu cho lớp học của bạn</h2>
    <div className={styles.swatches}>{classColors.map(option => <button type="button" key={option} aria-label={option} aria-pressed={value.toLowerCase() === option} style={{ backgroundColor: option }} onClick={() => setValue(option)} />)}</div>
    <label className={styles.custom}>Màu tùy chỉnh<input type="color" aria-label="Màu tùy chỉnh" value={valid ? value : color} onChange={event => setValue(event.target.value)} /></label>
    <input className={styles.hex} aria-label="Mã màu" maxLength={7} value={value} aria-invalid={!valid} onChange={event => setValue(event.target.value)} />
    {!valid && <p role="alert">Nhập mã màu dạng #0075ff.</p>}
    <div className={styles.actions}><button type="button" onClick={onClose}>Hủy</button><button type="button" disabled={!valid} onClick={() => onSave(value.toLowerCase())}>Chọn</button></div>
  </dialog>;
}
