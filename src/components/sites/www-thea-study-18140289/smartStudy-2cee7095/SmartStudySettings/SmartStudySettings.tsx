import { useState } from "react";
import StudyModal from "../StudyModal/StudyModal";
import styles from "./SmartStudySettings.module.css";
export interface SmartStudyPreferences { difficulty: "auto" | "easy" | "hard"; type: "all" | "choice" | "short"; directions: string }
interface SmartStudySettingsProps { preferences: SmartStudyPreferences; onSave(preferences: SmartStudyPreferences): void; onClose(): void }
const examples = ["Hãy đặt câu hỏi cho tôi về ...", "Tạo câu hỏi giống như trong tài liệu của tôi", "Hỏi tôi câu hỏi đòi hỏi toán/hình thức tính toán"];
export default function SmartStudySettings({ preferences, onSave, onClose }: SmartStudySettingsProps) {
  const [draft, setDraft] = useState(preferences);
  const changed = JSON.stringify(draft) !== JSON.stringify(preferences);
  return <StudyModal title="Tùy chỉnh câu hỏi của bạn" onClose={onClose}>
    <form onSubmit={event => { event.preventDefault(); onSave(draft); }}>
      <div className={styles.row}><label htmlFor="smart-difficulty">Độ khó</label><select id="smart-difficulty" value={draft.difficulty} onChange={event => setDraft({ ...draft, difficulty: event.target.value as SmartStudyPreferences["difficulty"] })}><option value="easy">Dễ</option><option value="hard">Khó</option><option value="auto">Tự động</option></select></div>
      <div className={styles.row}><label htmlFor="smart-type">Loại</label><select id="smart-type" value={draft.type} onChange={event => setDraft({ ...draft, type: event.target.value as SmartStudyPreferences["type"] })}><option value="all">Tất cả</option><option value="choice">Lựa chọn nhiều</option><option value="short">Trả lời ngắn</option></select></div>
      <label htmlFor="smart-directions">Cá nhân hóa Smart Study với hướng dẫn tùy chỉnh:</label>
      <textarea className={styles.directions} id="smart-directions" placeholder="Nhập gì đó..." maxLength={2000} value={draft.directions} onChange={event => setDraft({ ...draft, directions: event.target.value })} />
      <div className={styles.examples}>{examples.map(example => <button key={example} type="button" onClick={() => setDraft({ ...draft, directions: example })}>＋ {example}</button>)}</div>
      <p className={styles.note}>Loại câu hỏi được áp dụng cục bộ. Độ khó và hướng dẫn được giữ trong phiên học, chờ kết nối AI.</p>
      <div className={styles.actions}><button type="button" onClick={onClose}>Hủy</button><button className={styles.submit} type="submit" disabled={!changed}>Gửi</button></div>
    </form>
  </StudyModal>;
}
