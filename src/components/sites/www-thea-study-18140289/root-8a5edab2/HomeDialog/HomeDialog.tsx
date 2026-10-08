import { useEffect, useRef, useState, type FormEvent } from "react";
import HomeIcon from "../HomeIcon/HomeIcon";
import type { DialogState } from "../types";
import styles from "./HomeDialog.module.css";
interface HomeDialogProps { state: DialogState; onClose: () => void; onSave: (value: string, className?: string) => void }
const titles: Record<string,string> = { invite: "Mời một người bạn tham gia INS!", feedback: "Gửi phản hồi", create: "Tạo bộ học liệu", rename: "Đổi tên", move: "Thay đổi lớp", delete: "Xóa bộ học liệu?", share: "Chia sẻ", preview: "Bộ học liệu" };
export default function HomeDialog({ state, onClose, onSave }: HomeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState(state.type === "move" ? state.material?.className || "" : state.material?.title || "");
  const [className, setClassName] = useState("");
  const [category, setCategory] = useState("");
  const [notice, setNotice] = useState("");
  const [localLink, setLocalLink] = useState("");
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.showModal();
    if (state.type === "classShare") setLocalLink(`${window.location.origin}/?class=${encodeURIComponent(state.className || "")}`);
    else setLocalLink(`${window.location.origin}/${state.type === "invite" ? "register" : `study/${encodeURIComponent(state.material?.id || "demo")}`}`);
    return () => { previous?.focus(); };
  }, [state.type, state.material?.id]);
  async function copyLink() { try { await navigator.clipboard.writeText(localLink); setNotice("Đã sao chép liên kết."); } catch { setNotice("Bạn có thể chọn và sao chép liên kết ở trên."); } }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (state.type === "feedback") setNotice("Đã ghi nhận trong bản demo. Phản hồi chưa được gửi đến INS."); else onSave(value.trim(), className.trim()); }
  const sharing = state.type === "invite" || state.type === "share" || state.type === "classShare";
  return <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="home-dialog-title" onCancel={onClose} onClick={event => {if (event.target === event.currentTarget) onClose();}}>
    <div className={styles.content}>
      <button className={styles.close} type="button" onClick={onClose} aria-label="Đóng"><HomeIcon name="close" /></button>
      <h2 id="home-dialog-title">{state.type === "preview" ? state.material?.title : state.type === "classShare" ? "Chia sẻ lớp học" : titles[state.type] || state.type}</h2>
      {sharing ? <><p>{state.type === "invite" ? "Chia sẻ liên kết mời sau:" : "Liên kết xem dữ liệu trên trình duyệt này:"}</p><div className={styles.copy}><input aria-label="Liên kết chia sẻ" value={localLink} readOnly onFocus={event => event.target.select()} /><button type="button" onClick={copyLink} aria-label="Sao chép liên kết"><HomeIcon name="copy" /></button></div><p className={styles.muted}>Dữ liệu hiện được lưu cục bộ. Liên kết này chưa chia sẻ nội dung sang thiết bị khác.</p></> : state.type === "delete" ? <><p>Bạn có muốn xóa “{state.material?.title}”?</p><p className={styles.muted}>Bạn có thể khôi phục từ danh sách bộ học liệu đã xóa.</p><div className={styles.actions}><button type="button" onClick={onClose}>Hủy</button><button type="button" className={styles.danger} onClick={() => onSave("")}>Xóa</button></div></> : ["create", "rename", "move", "feedback"].includes(state.type) ? <form onSubmit={submit}>
        {state.type === "feedback" ? <><div className={styles.categories}>{["Vấn đề","Ý tưởng","Khác"].map(item => <button type="button" key={item} aria-pressed={category === item} className={category === item ? styles.selected : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>{category && <textarea aria-label="Nội dung phản hồi" placeholder={category === "Ý tưởng" ? "Tôi muốn thấy..." : "Chia sẻ phản hồi của bạn..."} value={value} onChange={event => setValue(event.target.value)} required rows={5} />}</> : <><label htmlFor="material-value">{state.type === "move" ? "Lớp" : "Tên bộ học liệu"}</label><input id="material-value" autoFocus maxLength={120} required={state.type !== "move"} value={value} onChange={event => setValue(event.target.value)} placeholder={state.type === "move" ? "Nhập tên lớp" : "Chưa có tiêu đề"} />{state.type === "create" && <><label htmlFor="material-class">Lớp (không bắt buộc)</label><input id="material-class" value={className} onChange={event => setClassName(event.target.value)} maxLength={80} /></>}</>}
        <div className={styles.actions}><button type="button" onClick={onClose}>Hủy</button><button className={styles.primary} type="submit" disabled={state.type === "feedback" && (!category || !value.trim())}>{state.type === "feedback" ? "Gửi" : state.type === "create" ? "Tạo bộ học liệu" : "Lưu"}</button></div>
      </form> : state.type === "preview" ? <><p className={styles.previewIcon}><HomeIcon name="books" /></p><p>{state.material?.className || "Chưa có lớp"}</p><p className={styles.muted}>Bộ học liệu demo đang trống. Màn hình học và tạo nội dung sẽ được triển khai ở bước tiếp theo.</p><button className={styles.primary} type="button" onClick={onClose}>Quay lại trang chủ</button></> : <p>Tính năng này chưa được kết nối trong bản demo trang chủ.</p>}
      {notice && <p role="status" className={styles.notice}>{notice}</p>}
    </div>
  </dialog>;
}

