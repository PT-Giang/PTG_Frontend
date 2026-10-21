import { Link } from "react-router";
import { useMemo, useRef, useState } from "react";
import { generateQuiz, isCorrectAnswer } from "@/study/quiz";
import type { StudyViewProps } from "@/study/types";
import SmartStudySettings, { type SmartStudyPreferences } from "../SmartStudySettings/SmartStudySettings";
import SmartProgress from "../SmartProgress/SmartProgress";
import StudyModal from "../StudyModal/StudyModal";
import SmartMatching from "../SmartMatching/SmartMatching";
import PlusUpgradeDialog from "../../shared/PlusUpgradeDialog/PlusUpgradeDialog";
import { studyApi } from "@/study/studyApi";
import type { StudyQuestion } from "@/study/studyApi";
import type { QuizQuestion, StudyTerm } from "@/study/types";
import styles from "./SmartStudyView.module.css";

type ResponseKind = "correct" | "incorrect" | "revealed" | "skipped";
interface HistoryEntry { prompt: string; answer: string; selected: string; result: ResponseKind }
interface ActiveQuestion extends QuizQuestion { matchingTerms?: StudyTerm[]; hint?: string; coreKnowledge?: string }
const resultLabels: Record<ResponseKind, string> = { correct: "Đúng", incorrect: "Chưa chính xác", revealed: "Đã xem đáp án", skipped: "Đã bỏ qua" };

export default function SmartStudyView({ materialId, title, workspace, studyContent, onRefreshStudyContent, onChange }: StudyViewProps) {
  const [round, setRound] = useState(0);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [response, setResponse] = useState<ResponseKind | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [rating, setRating] = useState<"positive" | "negative" | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [showPlus, setShowPlus] = useState(false);
  const [preferences, setPreferences] = useState<SmartStudyPreferences>({ difficulty: "auto", type: "choice", directions: "" });
  const responseLocked = useRef(false);
  const generatedQuestions = useMemo(() => studyContent?.studyQuestionSets.flatMap(set => set.questions.map((item, index) => mapStudyQuestion(item, set.id, index))) ?? [], [studyContent?.studyQuestionSets]);
  const questions = useMemo<ActiveQuestion[]>(() => {
    if (generatedQuestions.length) return generatedQuestions;
    const count = Math.min(workspace.terms.length, 10);
    if (preferences.type === "short") return generateQuiz(workspace.terms, 0, count);
    const choiceCount = preferences.type === "all" ? Math.ceil(count / 2) : count;
    const generated = generateQuiz(workspace.terms, choiceCount, count - choiceCount);
    return generated.length ? generated : generateQuiz(workspace.terms, 0, count);
  }, [generatedQuestions, workspace.terms, round, preferences.type]);
  const matchingTerms = useMemo(() => workspace.terms.filter((term, position, terms) => terms.findIndex(item => item.definition === term.definition) === position).slice(0, 5), [workspace.terms]);
  const question = questions[index];
  const questionMatchingTerms = question?.matchingTerms;
  const hasMatching = Boolean(questionMatchingTerms?.length) || (!generatedQuestions.length && preferences.type === "all" && matchingTerms.length > 1 && index === 0);
  const isMatching = hasMatching;
  const activeMatchingTerms = questionMatchingTerms?.length ? questionMatchingTerms : matchingTerms;
  const totalQuestions = questions.length;
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

  async function generateMoreQuestions() {
    const source = workspace.documents.at(-1);
    if (!source) { setGenerationError("Hãy thêm tài liệu trước khi tạo thêm câu hỏi."); return; }
    setGenerating(true); setGenerationError("");
    try {
      const job = await studyApi.generate(materialId, "study_questions",
        `Tạo thêm câu hỏi Học thông minh mới từ tài liệu “${source.title}”, không lặp các câu đã có.`,
        crypto.randomUUID(), { materialSource: "document", documentId: source.id });
      await studyApi.getGeneration(materialId, job.id);
      await onRefreshStudyContent?.();
      setRound(value => value + 1); setIndex(0); resetAnswer();
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Chưa tạo được câu hỏi mới.");
    } finally { setGenerating(false); }
  }

  return <section className={styles.container} aria-label="Học thông minh">
    <SmartProgress correct={workspace.smartCorrect} answered={workspace.smartAnswered} total={workspace.terms.length} onSettings={() => setSettingsOpen(true)} />
    {!questions.length ? <div className={styles.empty}><h1>Học thông minh</h1><p>Thêm tài liệu để tạo bộ câu hỏi học tập cho “{title}”.</p><Link to={`/memorize/${materialId}/list`}>Mở flashcard</Link><Link to={`/study/${materialId}`}>Thêm tài liệu</Link></div>
      : !question ? <div className={styles.empty}><h1>Hoàn thành bộ câu hỏi!</h1><p>Bạn đã trả lời hết {totalQuestions} câu hỏi hiện có.</p>
        {generatedQuestions.length ? studyContent?.plus
          ? <button className={styles.primary} type="button" disabled={generating} onClick={() => { void generateMoreQuestions(); }}>{generating ? "Đang tạo câu hỏi…" : "Tạo thêm câu hỏi (Plus)"}</button>
          : <button className={styles.primary} type="button" onClick={() => setShowPlus(true)}>Nâng cấp Plus để tạo thêm</button>
          : <button className={styles.primary} type="button" onClick={startRound}>Bắt đầu lượt mới</button>}
        {generationError && <p role="alert">{generationError}</p>}<button className={styles.reveal} type="button" onClick={() => setHistoryOpen(true)}>Lịch sử câu hỏi</button></div>
      : <div className={styles.questionArea}>
        <h1 className={styles.question}>{question.prompt}</h1>
        {isMatching ? <SmartMatching key={`${round}-${question.id}`} terms={activeMatchingTerms} revealed={Boolean(response)} onComplete={correct => recordResponse(correct ? "correct" : "incorrect")} /> : question.type === "choice" ? <div className={styles.options}>
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
        {response && <div className={styles.feedback} role="status"><strong>{resultLabels[response]}</strong><p>{question.coreKnowledge || (currentTerm ? `${currentTerm.term}: ${currentTerm.definition}` : question.answer)}</p>
          <details><summary>Tìm hiểu thêm</summary><p>{sourceDocument ? `Nguồn: ${sourceDocument.title}` : "Kiến thức từ bộ câu hỏi đã lưu."}</p>{question.hint && <p><b>Gợi ý:</b> {question.hint}</p>}<Link to={`/study/${materialId}`}>Mở tài liệu học tập</Link></details>
        </div>}
      </div>}
    {settingsOpen && <SmartStudySettings preferences={preferences} onSave={applyPreferences} onClose={() => setSettingsOpen(false)} />}
    {historyOpen && <StudyModal title="Lịch sử câu hỏi" onClose={() => setHistoryOpen(false)}><p className={styles.note}>Các câu đã luyện tập trong phiên học này.</p><ol className={styles.history}>{history.map((entry, entryIndex) => <li key={entryIndex}><strong>{entry.prompt}</strong><p>{resultLabels[entry.result]}{entry.selected ? ` — ${entry.selected}` : ""}</p><p>Đáp án: {entry.answer}</p></li>)}</ol></StudyModal>}
    {showPlus && <PlusUpgradeDialog onClose={() => setShowPlus(false)} />}
  </section>;
}

function mapStudyQuestion(item: StudyQuestion, setId: string, index: number): ActiveQuestion {
  const matchingTerms = item.pairs?.map((pair, pairIndex) => ({
    id: `${setId}-${index}-${pairIndex}`,
    term: pair.term,
    definition: pair.definition,
    level: 0,
  }));
  const answer = item.correctAnswer ?? matchingTerms?.map(pair => `${pair.term}: ${pair.definition}`).join("; ") ?? "";
  return {
    id: `${setId}-${index}`,
    prompt: item.prompt,
    answer,
    options: item.options ?? [],
    type: item.type === "multiple_choice" ? "choice" : "short",
    matchingTerms,
    hint: item.hint,
    coreKnowledge: item.coreKnowledge,
  };
}
