import { Link } from "react-router";
import { useMemo, useRef, useState } from "react";
import { generateQuiz, isCorrectAnswer } from "@/study/quiz";
import type { StudyViewProps } from "@/study/types";
import SmartStudySettings, { type SmartStudyPreferences } from "../SmartStudySettings/SmartStudySettings";
import SmartProgress from "../SmartProgress/SmartProgress";
import StudyModal from "../StudyModal/StudyModal";
import SmartMatching from "../SmartMatching/SmartMatching";
import styles from "./SmartStudyView.module.css";

type ResponseKind = "correct" | "incorrect" | "revealed" | "skipped";
interface HistoryEntry { prompt: string; answer: string; selected: string; result: ResponseKind }
const resultLabels: Record<ResponseKind, string> = { correct: "Đúng", incorrect: "Chưa chính xác", revealed: "Đã xem đáp án", skipped: "Đã bỏ qua" };

export default function SmartStudyView({ materialId, title, workspace, onChange }: StudyViewProps) {
  const [round, setRound] = useState(0);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [response, setResponse] = useState<ResponseKind | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [rating, setRating] = useState<"positive" | "negative" | null>(null);
  const [preferences, setPreferences] = useState<SmartStudyPreferences>({ difficulty: "auto", type: "choice", directions: "" });
  const responseLocked = useRef(false);
  const questions = useMemo(() => {
    void round;
    const count = Math.min(workspace.terms.length, 10);
    if (preferences.type === "short") return generateQuiz(workspace.terms, 0, count);
    const choiceCount = preferences.type === "all" ? Math.ceil(count / 2) : count;
    const generated = generateQuiz(workspace.terms, choiceCount, count - choiceCount);
    return generated.length ? generated : generateQuiz(workspace.terms, 0, count);
  }, [workspace.terms, round, preferences.type]);
  const matchingTerms = useMemo(() => workspace.terms.filter((term, position, terms) => terms.findIndex(item => item.definition === term.definition) === position).slice(0, 5), [workspace.terms]);
  const hasMatching = preferences.type === "all" && matchingTerms.length > 1;
  const isMatching = hasMatching && index === 0;
  const question = isMatching ? { id: "matching", prompt: "Nối mỗi khái niệm với định nghĩa tương ứng của nó.", answer: matchingTerms.map(term => `${term.term}: ${term.definition}`).join("; "), options: [], type: "choice" as const } : questions[index - (hasMatching ? 1 : 0)];
  const totalQuestions = questions.length + (hasMatching ? 1 : 0);
  const currentTerm = workspace.terms.find(term => term.id === question?.id);
  const sourceDocument = workspace.documents.find(document => document.id === currentTerm?.documentId);

  function recordResponse(kind: ResponseKind, selected = "") {
    if (responseLocked.current || !question) return;
    responseLocked.current = true;
    setAnswer(selected);
    setResponse(kind);
    setHistory(entries => [...entries, { prompt: question.prompt, answer: question.answer, selected, result: kind }]);
    onChange({ ...workspace, smartAnswered: workspace.smartAnswered + 1, smartCorrect: workspace.smartCorrect + (kind === "correct" ? 1 : 0) });
  }
  function submitAnswer(value: string) {
    if (value.trim() && question) recordResponse(isCorrectAnswer(value, question.answer) ? "correct" : "incorrect", value);
  }
  function resetAnswer() { setAnswer(""); setResponse(null); setRating(null); responseLocked.current = false; }
  function nextQuestion() { if (!responseLocked.current) return; setIndex(current => current + 1); resetAnswer(); }
  function startRound() { setRound(current => current + 1); setIndex(0); resetAnswer(); }
  function applyPreferences(next: SmartStudyPreferences) { setPreferences(next); setSettingsOpen(false); startRound(); }

  return <section className={styles.container} aria-label="Học thông minh">
    <SmartProgress correct={workspace.smartCorrect} answered={workspace.smartAnswered} total={workspace.terms.length} onSettings={() => setSettingsOpen(true)} />
    {!questions.length ? <div className={styles.empty}><h1>Học thông minh</h1><p>Thêm thẻ học để bắt đầu luyện tập với “{title}”.</p><Link to={`/memorize/${materialId}/list`}>Tạo thẻ học</Link><Link to={`/study/${materialId}`}>Thêm tài liệu</Link></div>
      : !question ? <div className={styles.empty}><h1>Hoàn thành lượt học!</h1><p>Bạn đã luyện tập {totalQuestions} câu hỏi từ bộ thẻ của mình.</p><button className={styles.primary} type="button" onClick={startRound}>Bắt đầu lượt mới</button><button className={styles.reveal} type="button" onClick={() => setHistoryOpen(true)}>Lịch sử câu hỏi</button></div>
      : <div className={styles.questionArea}>
        <h1 className={styles.question}>{question.prompt}</h1>
        {isMatching ? <SmartMatching key={round} terms={matchingTerms} revealed={Boolean(response)} onComplete={correct => recordResponse(correct ? "correct" : "incorrect")} /> : question.type === "choice" ? <div className={styles.options}>
          {question.options.map((option, optionIndex) => {
            const expected = Boolean(response) && isCorrectAnswer(option, question.answer);
            const wrong = answer === option && response === "incorrect";
            return <button key={`${index}-${optionIndex}`} type="button" disabled={Boolean(response)} aria-pressed={answer === option}
              className={`${styles.option} ${expected ? styles.correct : ""} ${wrong ? styles.incorrect : ""}`} onClick={() => submitAnswer(option)}>
              <span className={styles.number} aria-label={expected ? "Đúng" : wrong ? "Sai" : undefined}>{expected ? "✓" : wrong ? "×" : optionIndex + 1}</span><span>{option}</span>
            </button>;
          })}
        </div> : <form id="smart-answer-form" className={styles.shortAnswer} onSubmit={event => { event.preventDefault(); submitAnswer(answer); }}>
          <textarea aria-label="Câu trả lời của bạn" placeholder="Nhập câu trả lời của bạn..." value={answer} onChange={event => setAnswer(event.target.value)} disabled={Boolean(response)} className={response === "correct" ? styles.correctInput : response === "incorrect" ? styles.incorrectInput : undefined} />
        </form>}
        <div className={styles.topActions}>
          <button type="button" className={styles.reveal} onClick={() => response ? setHistoryOpen(true) : recordResponse("revealed")}>{response ? "Lịch sử câu hỏi" : "Hiển thị câu trả lời"}</button>
          <div className={styles.ratings}>{(["positive", "negative"] as const).map(value => <button key={value} type="button" className={value === "negative" ? styles.down : undefined} aria-label={value === "positive" ? "Phản hồi tích cực" : "Phản hồi tiêu cực"} aria-pressed={rating === value} onClick={() => setRating(value)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 10h4v12H2zM8 10l5-8c1-2 4-1 3 2l-1 5h5c2 0 3 1 2 3l-2 8c0 1-1 2-3 2H8z"/></svg></button>)}</div>
        </div>
        {rating && <p className={styles.status} role="status">Đã ghi nhận phản hồi trong phiên học này.</p>}
        <div className={styles.bottomActions}>{response ? <button className={styles.primary} type="button" onClick={nextQuestion}>{index === totalQuestions - 1 ? "Hoàn thành lượt học" : "Câu hỏi tiếp theo"}</button>
          : question.type === "short" && answer.trim() ? <button className={styles.primary} type="submit" form="smart-answer-form">Kiểm tra</button>
          : <button className={styles.primary} type="button" onClick={() => recordResponse("skipped")}>Bỏ qua</button>}</div>
        {response && <div className={styles.feedback} role="status"><strong>{resultLabels[response]}</strong><p>{currentTerm ? `${currentTerm.term}: ${currentTerm.definition}` : question.answer}</p>
          <details><summary>Tìm hiểu thêm</summary><p>{sourceDocument ? `Nguồn: ${sourceDocument.title}` : "Nội dung từ thẻ học của bạn."}</p><Link to={`/study/${materialId}`}>Mở tài liệu học tập</Link><p className={styles.note}>Giải thích từ nội dung cục bộ; chưa sử dụng AI.</p></details>
        </div>}
      </div>}
    {settingsOpen && <SmartStudySettings preferences={preferences} onSave={applyPreferences} onClose={() => setSettingsOpen(false)} />}
    {historyOpen && <StudyModal title="Lịch sử câu hỏi" onClose={() => setHistoryOpen(false)}><p className={styles.note}>Các câu đã luyện tập trong phiên học này.</p><ol className={styles.history}>{history.map((entry, entryIndex) => <li key={entryIndex}><strong>{entry.prompt}</strong><p>{resultLabels[entry.result]}{entry.selected ? ` — ${entry.selected}` : ""}</p><p>Đáp án: {entry.answer}</p></li>)}</ol></StudyModal>}
  </section>;
}
