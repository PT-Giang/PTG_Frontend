import { useEffect, useRef, useState } from "react";
import { avatars } from "@/profile/avatars";
import styles from "./AvatarPicker.module.css";
interface AvatarPickerProps { value: string; onClose(): void; onSave(value: string): boolean }
export default function AvatarPicker({ value, onClose, onSave }: AvatarPickerProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState(value);
  useEffect(() => { const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null; dialog.current?.showModal(); return () => previous?.focus(); }, []);
  return <dialog ref={dialog} className={styles.modal} onCancel={onClose} aria-labelledby="avatar-heading">
    <button className={styles.close} type="button" onClick={onClose} aria-label="Đóng">×</button><h2 id="avatar-heading">Chọn hình đại diện của bạn</h2>
    <div className={styles.grid}>{avatars.map(avatar => <button key={avatar.src} type="button" aria-label={avatar.label} aria-pressed={selected === avatar.src} disabled={!avatar.unlocked} onClick={() => setSelected(avatar.src)}><img src={avatar.src} width={59} height={59} alt="" />{!avatar.unlocked && <span aria-label="Bị khóa">🔒</span>}</button>)}</div>
    <div className={styles.actions}><button type="button" onClick={onClose}>Hủy</button><button type="button" onClick={() => { if (onSave(selected)) onClose(); }}>Gửi</button></div>
  </dialog>;
}
