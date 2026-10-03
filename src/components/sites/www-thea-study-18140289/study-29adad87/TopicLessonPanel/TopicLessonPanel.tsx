import { useEffect, useRef, useState } from "react";
import { createMockTopicLesson, type TopicLesson } from "@/study/topicLessons";
import styles from "./TopicLessonPanel.module.css";

interface TopicLessonPanelProps { onGenerated(lesson: TopicLesson): void }

export default function TopicLessonPanel({ onGenerated }: TopicLessonPanelProps) {
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [lesson, setLesson] = useState<TopicLesson | null>(null);
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  async function generate() {
    setBusy(true); setError("");
    try {
      const result = await createMockTopicLesson(description);
      if (!active.current) return;
      setLesson(result); onGenerated(result);
    } catch (error) { if (active.current) setError(error instanceof Error ? error.message : "Chưa tạo được bài học mẫu. Hãy thử lại."); }
    finally { if (active.current) setBusy(false); }
  }
  return <div className={styles.panel}>
    <span className={styles.badge}>Mô phỏng · Chưa kết nối AI</span>
    <label htmlFor="learning-description">Bạn muốn học kiến thức gì?</label>
    <textarea id="learning-description" rows={4} minLength={10} maxLength={2000} value={description} onChange={event => setDescription(event.target.value)} placeholder="Ví dụ: Tôi muốn học JavaScript từ đầu, hiểu biến, hàm và mảng để tự làm một ứng dụng nhỏ." />
    <p className={styles.hint}>Mô tả chủ đề, trình độ hiện tại và mục tiêu. Khi nối AI, hệ thống sẽ tìm tài liệu trên mạng để xây dựng bài học. Hiện tại dùng các bài mẫu có sẵn, chưa tìm kiếm internet.</p>
    <div className={styles.suggestions} aria-label="Gợi ý chủ đề">{["JavaScript cho người mới bắt đầu", "Tiếng Anh giao tiếp cơ bản", "Quang hợp ở thực vật"].map(topic => <button type="button" key={topic} onClick={() => setDescription(topic)}>{topic}</button>)}</div>
    <button type="button" className={styles.generate} disabled={busy || description.trim().length < 10} onClick={generate}>{busy ? "Đang chuẩn bị bài mẫu…" : "Tạo bài học mẫu"}</button>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {lesson && <div className={styles.result} role="status"><strong>{lesson.title}</strong><p>{lesson.overview}</p><p>{lesson.note}</p><ul>{lesson.objectives.map(objective => <li key={objective}>{objective}</li>)}</ul><p>Kiểm tra và chỉnh sửa nội dung bên dưới, rồi chọn “Thêm tài liệu” để bắt đầu học.</p></div>}
  </div>;
}
