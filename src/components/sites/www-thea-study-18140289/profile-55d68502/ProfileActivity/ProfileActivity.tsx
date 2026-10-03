import { useEffect, useState } from "react";
import { readProfileStats } from "@/profile/repository";
import { avatars } from "@/profile/avatars";
import HomeIcon from "../../root-8a5edab2/HomeIcon/HomeIcon";
import styles from "./ProfileActivity.module.css";
export default function ProfileActivity() {
  const [stats, setStats] = useState({ materials: 0, answered: 0, correct: 0, tests: 0, highScores: 0 });
  const [error, setError] = useState("");
  useEffect(() => { try { setStats(readProfileStats()); } catch { setError("Chưa đọc được thống kê. Hãy tải lại trang để thử lại."); } }, []);
  const goals = [{ label: "Trả lời đúng một câu hỏi", value: stats.correct, target: 25 }, { label: "Điểm 90% hoặc cao hơn trong một bài kiểm tra thực hành", value: stats.highScores, target: 1 }, { label: "Tạo bộ học liệu", value: stats.materials, target: 5 }];
  return <div className={styles.grid}>
    {error && <p role="alert">{error}</p>}
    <section className={styles.card}><h2>Thử thách học tập</h2><p className={styles.note}>Tiến độ cục bộ từ các bộ học liệu hiện có.</p>{goals.map(goal => <div className={styles.goal} key={goal.label}><label>{goal.label} ({Math.min(goal.value, goal.target)}/{goal.target})<progress max={goal.target} value={Math.min(goal.value, goal.target)} /></label></div>)}</section>
    <section className={styles.card}><h2>Phần thưởng cấp độ</h2><div className={styles.rewards}>{[1, 2, 3].map((level, index) => <div key={level}><HomeIcon name="crown" /><strong>{level === 1 ? level : "🔒"}</strong><img src={avatars[index].src} width={56} height={56} alt={avatars[index].label} /></div>)}</div><p className={styles.note}>Bản cục bộ có sẵn 12 ảnh đại diện. Mở khóa cấp độ chưa kết nối.</p></section>
    {[{ label: "Câu hỏi thực hành đã trả lời:", value: stats.answered }, { label: "Bộ học liệu đã tạo:", value: stats.materials }, { label: "Bài kiểm tra thực hành đã hoàn thành:", value: stats.tests }, { label: "Câu trả lời đúng:", value: stats.correct }].map(item => <section className={styles.card} key={item.label}><h2>{item.label}</h2><strong className={styles.value}>{item.value}</strong>{!item.value && <p className={styles.note}>Bắt đầu học để ghi nhận tiến độ của bạn!</p>}</section>)}
  </div>;
}
