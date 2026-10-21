
import { Link } from "react-router";
import type { StudyViewProps } from "@/study/types";
import TermList from "../TermList/TermList";
import FlashcardDeck from "../FlashcardDeck/FlashcardDeck";
import MatchingGame from "../MatchingGame/MatchingGame";
import styles from "./MemorizeView.module.css";

interface MemorizeViewProps extends StudyViewProps { mode: "list" | "flashcards" | "games" }

export default function MemorizeView({ mode, ...props }: MemorizeViewProps) {
  const generatedTerms = props.studyContent?.flashcardSets.flatMap(set => set.cards.map(card => ({
    id: card.id,
    term: card.front,
    definition: card.back,
    documentId: card.documentId || undefined,
    level: card.level,
  }))) ?? [];
  const terms = generatedTerms.length ? generatedTerms : props.workspace.terms;
  const contentProps = { ...props, workspace: { ...props.workspace, terms },
    onReviewFlashcard: generatedTerms.length ? props.onReviewFlashcard : undefined };
  return <section className={styles.container} aria-label="Bài thẻ ghi nhớ">
    <nav className={styles.tabs} aria-label="Chế độ thẻ ghi nhớ">
      {([ ["list", "Danh sách"], ["flashcards", "Bộ thẻ"], ["games", "Trò chơi"] ] as const).map(([value, label]) =>
        <Link key={value} to={`/memorize/${props.materialId}/${value}`} aria-current={mode === value ? "page" : undefined}>{label}</Link>)}
    </nav>
    {mode === "list" ? <TermList {...contentProps} /> : !terms.length ?
      <div className={styles.empty}><h2>Chưa có thẻ ghi nhớ</h2><p>Thêm nội dung tài liệu hoặc tự tạo thuật ngữ trong Danh sách để bắt đầu học.</p><Link to={`/study/${props.materialId}`}>Thêm tài liệu</Link></div> :
      mode === "games" ? <MatchingGame key={terms.map(term => `${term.id}:${term.term}:${term.definition}`).join("|")} terms={terms} /> : <FlashcardDeck {...contentProps} />}
  </section>;
}
