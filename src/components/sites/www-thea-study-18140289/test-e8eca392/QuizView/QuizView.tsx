import { useState } from "react";
import type { QuizAttempt, QuizQuestion, StudyViewProps } from "@/study/types";
import { generateQuiz } from "@/study/quiz";
import QuizSession from "../QuizSession/QuizSession";
import QuizResults from "../QuizResults/QuizResults";
import styles from "./QuizView.module.css";

export default function QuizView({ title, workspace, onChange }: StudyViewProps) {
  const [minutes, setMinutes] = useState(10);
  const [timed, setTimed] = useState(true);
  const [choiceCount, setChoiceCount] = useState(Math.min(11, workspace.terms.length));
  const [shortCount, setShortCount] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selected, setSelected] = useState<QuizAttempt | null>(null);
  const [error, setError] = useState("");
  const startQuiz = () => {
    const generated = generateQuiz(workspace.terms, choiceCount, shortCount);
    if (!generated.length) {
      setError("Thêm ít nhất hai định nghĩa khác nhau để làm trắc nghiệm, hoặc chọn câu trả lời ngắn khi đã có thuật ngữ.");
      return;
    }
    setError(""); setSelected(null); setQuestions(generated);
  };
  const complete = (attempt: QuizAttempt) => {
    onChange({ ...workspace, attempts: [attempt, ...workspace.attempts] });
    setQuestions([]); setSelected(attempt);
  };
  if (questions.length) return <QuizSession questions={questions} timeLimitSeconds={timed ? minutes * 60 : null} onComplete={complete} />;
  if (selected) return <QuizResults attempt={selected} onBack={() => setSelected(null)} />;
  return (
    <section className={styles.root} aria-label="Bài kiểm tra">
      <div className={styles.settings}>
        <div>
          <h1>Thời gian</h1><p>Thời gian làm bài</p>
          <div className={styles.time}>
            <button type="button" aria-label="Giảm thời gian" disabled={minutes <= 1} onClick={() => setMinutes(minutes - 1)}>−</button>
            <span>{minutes} phút</span>
            <button type="button" aria-label="Tăng thời gian" disabled={minutes >= 120} onClick={() => setMinutes(minutes + 1)}>+</button>
          </div>
          <label className={styles.checkbox}><input type="checkbox" checked={timed} onChange={(event) => setTimed(event.target.checked)} /> Áp dụng giới hạn thời gian</label>
        </div>
        <div>
          <h2>Câu hỏi</h2>
          <label className={styles.count}>Lựa chọn nhiều<input type="number" min={0} max={workspace.terms.length} value={choiceCount} onChange={(event) => setChoiceCount(Math.max(0, Math.min(workspace.terms.length, Number(event.target.value))))} /></label>
          <label className={styles.count}>Câu hỏi trả lời ngắn<input type="number" min={0} max={workspace.terms.length} value={shortCount} onChange={(event) => setShortCount(Math.max(0, Math.min(workspace.terms.length, Number(event.target.value))))} /></label>
          <p className={styles.note}>Tạo tối đa {workspace.terms.length} câu từ thuật ngữ hiện có, ưu tiên trắc nghiệm và không lặp lại thuật ngữ.</p>
          <p className={styles.note}>Chế độ cục bộ dùng câu hỏi theo định nghĩa. Điều chỉnh độ khó bằng AI sẽ được bổ sung sau.</p>
        </div>
        <button className={styles.create} type="button" onClick={startQuiz}>Tạo bài kiểm tra</button>
      </div>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <h2>Bài kiểm tra &quot;{title}&quot;</h2>
      {!workspace.attempts.length ? <p className={styles.empty}>Chưa có bài kiểm tra nào được tạo cho bộ học liệu này.</p> : (
        <ul className={styles.history}>{workspace.attempts.map((attempt) => <li key={attempt.id}>
          <button type="button" onClick={() => setSelected(attempt)}><span>{new Date(attempt.createdAt).toLocaleString("vi-VN")}</span><strong>{attempt.score}/{attempt.questions.length} câu đúng</strong><span>Xem kết quả →</span></button>
        </li>)}</ul>
      )}
    </section>
  );
}
