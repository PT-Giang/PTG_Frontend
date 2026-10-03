import { useEffect, useRef, useState } from "react";
import HomeIcon from "../HomeIcon/HomeIcon";
import type { StudyMaterial } from "../types";
import styles from "./StudyCard.module.css";
interface StudyCardProps { material: StudyMaterial; onAction: (type: string, material: StudyMaterial) => void }
export default function StudyCard({ material, onAction }: StudyCardProps) {
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  useEffect(() => {
    function outside(event: PointerEvent) { if (!cardRef.current?.contains(event.target as Node)) setOpen(false); }
    function escape(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); }
    if (open) { document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape); }
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  const actions = material.deleted ? [["restore", "Khôi phục", "restore"]] : [["share", "Chia sẻ", "share"], ["rename", "Đổi tên", "edit"], ["move", "Thay đổi lớp", "move"], ["delete", "Xóa", "trash"]];
  return <article className={styles.wrapper} ref={cardRef}>
    <div className={`${styles.card} ${material.deleted ? styles.deleted : ""}`}>
      <button className={styles.open} type="button" onClick={() => onAction("preview", material)} aria-label={`Mở ${material.title}`}><h3>{material.title}</h3>{material.className && <span className={styles.className}>{material.className}</span>}</button>
      <HomeIcon name="books" className={styles.books} />
      <button className={styles.more} type="button" aria-label={`Thêm tùy chọn cho ${material.title}`} aria-expanded={open} onClick={() => setOpen(!open)}><HomeIcon name="more" /></button>
    </div>
    {open && <div className={styles.menu} role="menu" aria-label="Tùy chọn học liệu">{actions.map(([type, title, icon]) => <button key={type} type="button" role="menuitem" onClick={() => {setOpen(false); onAction(type, material);}}><HomeIcon name={icon} />{title}</button>)}</div>}
  </article>;
}
