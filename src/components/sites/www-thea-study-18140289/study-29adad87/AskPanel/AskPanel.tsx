import { useState } from "react";
import type { StudyDocument } from "@/study/types";
import { findPassages } from "@/study/content";
import styles from "./AskPanel.module.css";

interface AskPanelProps { documents: StudyDocument[] }
interface Answer { question: string; passages: ReturnType<typeof findPassages> }

export default function AskPanel({ documents }: AskPanelProps) {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  return <section className={styles.panel} aria-label="Hỏi về tài liệu">
    <p className={styles.note}>Tìm đoạn liên quan trong tài liệu đã thêm. Bản cục bộ trích nguyên văn theo từ khóa; chưa dùng AI để suy luận.</p>
    {!documents.length && <p>Thêm tài liệu trước để tìm câu trả lời.</p>}
    <div className={styles.messages} aria-live="polite">{answers.map((answer, index) => <article key={index} className={styles.answer}><h3>{answer.question}</h3>{answer.passages.length ? answer.passages.map((passage, passageIndex) => <blockquote key={`${passage.documentId}-${passageIndex}`}><p>{passage.text}</p><cite>Nguồn: {passage.title}</cite></blockquote>) : <p>Chưa tìm thấy đoạn phù hợp. Hãy thử từ khóa cụ thể hơn hoặc bổ sung tài liệu.</p>}</article>)}</div>
    <form onSubmit={event => { event.preventDefault(); if (!question.trim()) return; setAnswers([...answers, { question: question.trim(), passages: findPassages(question, documents) }]); setQuestion(""); }} className={styles.form}>
      <input aria-label="Câu hỏi về tài liệu" placeholder="Hỏi về tài liệu của bạn…" value={question} maxLength={500} onChange={event => setQuestion(event.target.value)} disabled={!documents.length} />
      <button type="submit" disabled={!documents.length || !question.trim()}>Hỏi</button>
    </form>
    {!!answers.length && <button type="button" className={styles.clear} onClick={() => setAnswers([])}>Xóa cuộc trò chuyện</button>}
  </section>;
}
