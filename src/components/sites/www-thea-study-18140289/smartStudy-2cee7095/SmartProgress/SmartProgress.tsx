import { useState } from "react";
import StudyModal from "../StudyModal/StudyModal";
import styles from "./SmartProgress.module.css";
interface SmartProgressProps { correct: number; answered: number; total: number; onSettings(): void }
export default function SmartProgress({ correct, answered, total, onSettings }: SmartProgressProps) {
  const [open, setOpen] = useState(false);
  const progress = Math.min(100, Math.round(correct / Math.max(total * 3, 1) * 100));
  const level = Math.min(3, Math.floor(progress / 34) + 1);
  return <>
    <header className={styles.header}>
      <div className={styles.progressGroup}>
        <div className={styles.track} role="progressbar" aria-label="Tiến triển bộ học liệu" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className={styles.fill} style={{ width: `${progress}%` }} /><span>Cấp độ {level}: {progress}%</span>
        </div>
        <button type="button" className={styles.stars} aria-label="Xem tiến độ" onClick={() => setOpen(true)}>
          {[1, 2, 3].map(star => <svg key={star} className={progress >= star * 100 / 3 ? styles.earned : styles.pending} viewBox="0 0 100 100" aria-hidden="true"><path d="M50 0C57 31 69 43 100 50C69 57 57 69 50 100C43 69 31 57 0 50C31 43 43 31 50 0Z" /></svg>)}
        </button>
      </div>
      <button type="button" className={styles.settings} aria-label="Cài đặt" onClick={onSettings}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m9 3 1-2h4l1 2 2 1 2-.2 2 3-1 2v3l1 2-2 3-2-.2-2 1-1 3h-4l-1-3-2-1-2 .2-2-3 1-2V9L3 7l2-3 2 .2Z"/><circle cx="12" cy="11" r="3"/></svg></button>
    </header>
    {open && <StudyModal title="Tiến triển bộ học liệu" onClose={() => setOpen(false)}><div className={styles.summary}><strong>Cấp độ {level}: {progress}%</strong><p>Đạt tiến triển bằng cách hoàn thành câu hỏi trong Học liệu Thông minh và bài kiểm tra thực hành!</p><p>Đã trả lời đúng {correct}/{answered} câu trong Học thông minh.</p><small>Tiến độ cục bộ: đạt 100% sau số câu đúng bằng ba lần số thẻ.</small><button type="button" onClick={() => setOpen(false)}>Đóng</button></div></StudyModal>}
  </>;
}
