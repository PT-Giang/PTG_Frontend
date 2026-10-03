import { useEffect, useId, useRef, type ReactNode } from "react";
import styles from "./StudyModal.module.css";
interface StudyModalProps { title: string; children: ReactNode; onClose(): void }
export default function StudyModal({ title, children, onClose }: StudyModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    const element = ref.current;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <dialog ref={ref} className={styles.dialog} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
    <button className={styles.close} type="button" aria-label="Đóng" onClick={onClose}>×</button>
    <div className={styles.content}><h2 id={titleId}>{title}</h2>{children}</div>
  </dialog>;
}
