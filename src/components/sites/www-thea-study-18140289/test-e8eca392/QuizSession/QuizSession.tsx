import { useEffect, useRef, useState } from "react";
import type { QuizAttempt, QuizQuestion } from "@/study/types";
import { isCorrectAnswer } from "@/study/quiz";
import styles from "./QuizSession.module.css";
interface QuizSessionProps {
  questions: QuizQuestion[];
  timeLimitSeconds: number | null;
  onComplete: (attempt: QuizAttempt) => void;
}
export default function QuizSession({ questions, timeLimitSeconds, onComplete }: QuizSessionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remaining, setRemaining] = useState(timeLimitSeconds);
  const [confirm, setConfirm] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const submitted = useRef(false);
  const latest = useRef({ answers, onComplete });
  useEffect(() => { latest.current = { answers, onComplete }; }, [answers, onComplete]);
  const submit = () => {
    if (submitted.current) return;
    submitted.current = true;
    const current = latest.current;
    current.onComplete({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), questions,
      answers: current.answers,
      score: questions.filter((question) => isCorrectAnswer(current.answers[question.id] ?? "", question.answer)).length,
      durationSeconds: Math.min(Math.round((Date.now() - startedAt) / 1000), timeLimitSeconds ?? Infinity),
    });
  };
  const submitRef = useRef(submit);
  useEffect(() => { submitRef.current = submit; });
  useEffect(() => {
    if (timeLimitSeconds === null) return;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((startedAt + timeLimitSeconds * 1000 - Date.now()) / 1000));
      setRemaining(seconds);
      if (!seconds) submitRef.current();
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [startedAt, timeLimitSeconds]);
  const unanswered = questions.filter((question) => !answers[question.id]?.trim()).length;
  return <section className={styles.root}>
    <header className={styles.header}><h1>Bài kiểm tra</h1>{remaining !== null && <span role="timer" aria-label="Thời gian còn lại">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}</span>}</header>
    <p>Đã trả lời {questions.length - unanswered}/{questions.length} câu.</p>
    {questions.some((question) => question.type === "short") && <p className={styles.note}>Trả lời ngắn: nhập đúng thuật ngữ. Không phân biệt chữ hoa/thường hoặc khoảng trắng thừa; giữ nguyên dấu tiếng Việt và dấu câu.</p>}
    <form onSubmit={(event) => { event.preventDefault(); if (unanswered) setConfirm(true); else submit(); }}>
      {questions.map((question, index) => <fieldset key={question.id} className={styles.question}>
        <legend>{index + 1}. {question.prompt}</legend>
        {question.type === "choice" ? question.options.map((option, optionIndex) => <label className={styles.option} key={optionIndex}>
          <input type="radio" name={question.id} checked={answers[question.id] === option} onChange={() => setAnswers({ ...answers, [question.id]: option })} />{option}
        </label>) : <input className={styles.answer} aria-label={`Câu trả lời ${index + 1}`} value={answers[question.id] ?? ""} onChange={(event) => setAnswers({ ...answers, [question.id]: event.target.value })} autoComplete="off" />}
      </fieldset>)}
      {confirm && <div className={styles.confirm} role="alert"><p>Còn {unanswered} câu chưa trả lời. Nộp bài sẽ tính các câu này là sai.</p><button type="button" onClick={submit}>Vẫn nộp bài</button><button type="button" onClick={() => setConfirm(false)}>Làm tiếp</button></div>}
      <button className={styles.submit} type="submit">Nộp bài</button>
    </form>
  </section>;
}
