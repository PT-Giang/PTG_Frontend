import { useState } from "react";
import type { QuizAttempt, QuizQuestion, StudyViewProps } from "@/study/types";
import { studyApi } from "@/study/studyApi";
import QuizSession from "../QuizSession/QuizSession";
import QuizResults from "../QuizResults/QuizResults";
import styles from "./QuizView.module.css";

export default function QuizView({ materialId, title, workspace, onRefreshStudyContent, onChange }: StudyViewProps) {
  const [minutes, setMinutes] = useState(10);
  const [timed, setTimed] = useState(true);
  const [choiceCount, setChoiceCount] = useState(5);
  const [shortCount, setShortCount] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selected, setSelected] = useState<QuizAttempt | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const startQuiz = async () => {
    const total = choiceCount + shortCount;
    if (!total || total > 15) {
      setError("Chọn ít nhất một câu và tối đa 15 câu cho mỗi bài kiểm tra.");
      return;
    }
    const source = workspace.documents.at(-1);
    if (!source) { setError("Thêm tài liệu trước khi tạo bài kiểm tra."); return; }
    setBusy(true); setError(""); setSelected(null);
    try {
      const topic = source.sourceType === "topic";
      const job = await studyApi.generate(materialId, "quiz", `Tạo bài kiểm tra theo yêu cầu: ${choiceCount} câu trắc nghiệm và ${shortCount} câu trả lời ngắn.`, crypto.randomUUID(), {
        materialSource: topic ? "requirement" : "document",
        ...(!topic ? { documentId: source.id } : {}),
        questionCount: total,
        choiceCount,
        shortAnswerCount: shortCount,
      });
      const result = await studyApi.getGeneration(materialId, job.id);
      const rawQuestions = result.output?.questions;
      if (!Array.isArray(rawQuestions)) throw new Error("Backend không trả về danh sách câu hỏi hợp lệ.");
      const generated = rawQuestions.flatMap((item, index): QuizQuestion[] => {
        if (typeof item !== "object" || item === null || Array.isArray(item)) return [];
        const question = item as Record<string, unknown>;
        if (typeof question.prompt !== "string" || typeof question.correctAnswer !== "string") return [];
        const options = Array.isArray(question.options) ? question.options.filter((option): option is string => typeof option === "string") : [];
        return [{ id: `${job.id}-${index}`, prompt: question.prompt, answer: question.correctAnswer, options,
          type: question.type === "short_answer" ? "short" : "choice" }];
      });
      if (generated.length !== total) throw new Error("AI chưa tạo đủ số câu theo yêu cầu. Hãy thử tạo lại.");
      setQuestions(generated);
      await onRefreshStudyContent?.();
    } catch (quizError) {
      setError(quizError instanceof Error ? quizError.message : "Chưa tạo được bài kiểm tra.");
      await onRefreshStudyContent?.();
    } finally { setBusy(false); }
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
          <label className={styles.count}>Trắc nghiệm<input type="number" min={0} max={15} value={choiceCount} onChange={(event) => setChoiceCount(Math.max(0, Math.min(15, Number(event.target.value))))} /></label>
          <label className={styles.count}>Trả lời ngắn<input type="number" min={0} max={15} value={shortCount} onChange={(event) => setShortCount(Math.max(0, Math.min(15, Number(event.target.value))))} /></label>
          <p className={styles.note}>AI tạo câu hỏi từ tài liệu đã cung cấp. Tổng mỗi bài kiểm tra tối đa 15 câu.</p>
        </div>
        <button className={styles.create} type="button" disabled={busy} onClick={() => { void startQuiz(); }}>{busy ? "Đang tạo bài kiểm tra…" : "Tạo bài kiểm tra"}</button>
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
