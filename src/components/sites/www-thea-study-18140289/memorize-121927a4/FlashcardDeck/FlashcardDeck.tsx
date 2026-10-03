
import { useEffect, useState } from "react";
import type { StudyViewProps } from "@/study/types";
import styles from "./FlashcardDeck.module.css";

export default function FlashcardDeck({ workspace, onChange }: StudyViewProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [status, setStatus] = useState("");
  const currentIndex = index % workspace.terms.length;
  const current = workspace.terms[currentIndex];
  function navigate(direction: number) {
    setIndex((currentIndex + direction + workspace.terms.length) % workspace.terms.length);
    setFlipped(false);
  }
  function rate(rating: "wrong" | "uncertain" | "known") {
    if (!flipped) return;
    const level = rating === "wrong" ? 0 : rating === "uncertain" ? 1 : Math.min(3, current.level + 1);
    onChange({ ...workspace, terms: workspace.terms.map(item => item.id === current.id ? { ...item, level } : item) });
    setStatus(`Đã lưu: ${rating === "wrong" ? "cần học lại" : rating === "uncertain" ? "cần xem lại" : "đã biết"}.`);
    navigate(1);
  }
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && (target.closest("input,textarea,select,[contenteditable=true]") || event.altKey || event.ctrlKey || event.metaKey)) return;
      if (!["ArrowDown", "ArrowLeft", "ArrowUp", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "ArrowDown") setFlipped(value => !value);
      else if (event.key === "ArrowLeft") rate("wrong");
      else if (event.key === "ArrowUp") rate("uncertain");
      else rate("known");
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });
  return <div className={styles.container}>
    <div className={styles.counters}>{["Đang học", "Đang xem lại", "Biết", "Đã thành thạo"].map((label, level) => <div key={label}><span>{label}</span><strong>{workspace.terms.filter(term => term.level === level).length}</strong></div>)}</div>
    <button className={`${styles.card} ${flipped ? styles.back : ""}`} type="button" aria-label={flipped ? "Định nghĩa. Nhấn để xem thuật ngữ" : "Thuật ngữ. Nhấn để lật thẻ"} onClick={() => setFlipped(value => !value)}>
      <span>{flipped ? current.definition : current.term}</span><small>{flipped ? "Đánh giá mức độ ghi nhớ của bạn" : "Nhấn để lật thẻ"}</small>
    </button>
    <div className={styles.navigation}><button type="button" aria-label="Thẻ trước" onClick={() => navigate(-1)}>←</button><span>{currentIndex + 1} / {workspace.terms.length}</span><button type="button" aria-label="Thẻ tiếp theo" onClick={() => navigate(1)}>→</button></div>
    <div className={styles.ratings} aria-label="Đánh giá thẻ"><button disabled={!flipped} className={styles.wrong} type="button" aria-label="Trả lời sai" title="Trả lời sai (←)" onClick={() => rate("wrong")}>×</button><button disabled={!flipped} className={styles.uncertain} type="button" aria-label="Chưa chắc chắn" title="Chưa chắc chắn (↑)" onClick={() => rate("uncertain")}>?</button><button disabled={!flipped} className={styles.known} type="button" aria-label="Tôi biết rồi" title="Tôi biết rồi (→)" onClick={() => rate("known")}>✓</button></div>
    <p className={styles.hint}>↓ Lật thẻ · ← Cần học lại · ↑ Chưa chắc · → Đã biết</p><p className={styles.hint}>Tiến độ được lưu cục bộ theo mức độ bạn tự đánh giá.</p><p role="status" className={styles.status}>{status}</p>
  </div>;
}
