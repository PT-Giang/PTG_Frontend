import type { QuizAttempt } from "@/study/types";
import { isCorrectAnswer } from "@/study/quiz";
import styles from "./QuizResults.module.css";
interface QuizResultsProps { attempt: QuizAttempt; onBack: () => void }
export default function QuizResults({ attempt, onBack }: QuizResultsProps) {
  return <section className={styles.root}>
    <h1>Kết quả bài kiểm tra</h1>
    <p className={styles.score}>{attempt.score}/{attempt.questions.length} câu đúng</p>
    <p>{new Date(attempt.createdAt).toLocaleString("vi-VN")} · Thời gian làm bài: {Math.floor(attempt.durationSeconds / 60)} phút {attempt.durationSeconds % 60} giây</p>
    <button type="button" className={styles.back} onClick={onBack}>Quay lại / Tạo bài mới</button>
    <h2>Xem lại câu trả lời</h2>
    <ol className={styles.review}>{attempt.questions.map((question) => {
      const actual = attempt.answers[question.id] ?? "";
      const correct = isCorrectAnswer(actual, question.answer);
      return <li key={question.id}>
        <h3>{question.prompt}</h3>
        <p><strong>{correct ? "Đúng" : "Sai"}</strong> · Câu trả lời của bạn: {actual.trim() || "Chưa trả lời"}</p>
        {!correct && <p className={styles.expected}>Đáp án: {question.answer}</p>}
      </li>;
    })}</ol>
  </section>;
}
