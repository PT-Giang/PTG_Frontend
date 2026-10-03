import { useEffect, useRef } from "react";
import styles from "./ProfileNotice.module.css";
interface ProfileNoticeProps { message: string; onClose(): void }
export default function ProfileNotice({ message, onClose }: ProfileNoticeProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.current?.showModal();
    return () => { previousFocus?.focus(); };
  }, []);
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="profile-notice-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={styles.content}><h2 id="profile-notice-title">Thông tin đăng ký</h2><p>{message}</p><button type="button" onClick={onClose}>Đã hiểu</button></div>
  </dialog>;
}
