
import { useState } from "react";
import type { StudyTerm } from "@/study/types";
import styles from "./MatchingGame.module.css";

interface MatchingGameProps { terms: StudyTerm[] }
function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}

export default function MatchingGame({ terms }: MatchingGameProps) {
  const [pairs, setPairs] = useState(() => terms.slice(0, 6));
  const [definitions, setDefinitions] = useState(() => [...terms.slice(0, 6)].reverse());
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState("Chọn một thuật ngữ, sau đó chọn định nghĩa tương ứng.");
  function restart() {
    const nextPairs = shuffle(terms).slice(0, 6);
    setPairs(nextPairs); setDefinitions(shuffle(nextPairs)); setMatched([]); setSelected(null); setMistakes(0);
    setMessage("Đã bắt đầu lượt mới. Chọn một thuật ngữ.");
  }
  function match(id: string) {
    if (!selected || matched.includes(id)) return;
    if (selected === id) { setMatched([...matched, id]); setMessage(matched.length + 1 === pairs.length ? "Hoàn thành! Bạn đã ghép đúng tất cả các cặp." : "Chính xác! Tiếp tục với cặp tiếp theo."); }
    else { setMistakes(value => value + 1); setMessage("Chưa đúng. Chọn lại một thuật ngữ và thử tiếp."); }
    setSelected(null);
  }
  return <div className={styles.container}>
    <div className={styles.heading}><h2>Ghép cặp</h2><button type="button" onClick={restart}>Trộn và chơi lại</button></div>
    <p>Đã ghép {matched.length}/{pairs.length} · Số lần sai: {mistakes}</p><p role="status">{message}</p>
    <div className={styles.board}><div className={styles.column}><h3>Thuật ngữ</h3>{pairs.map(term => <button type="button" key={term.id} disabled={matched.includes(term.id)} aria-pressed={selected === term.id} onClick={() => { setSelected(term.id); setMessage("Chọn định nghĩa tương ứng ở cột bên cạnh."); }}>{matched.includes(term.id) ? "✓ " : ""}{term.term}</button>)}</div>
      <div className={styles.column}><h3>Định nghĩa</h3>{definitions.map(term => <button type="button" key={term.id} disabled={matched.includes(term.id) || !selected} onClick={() => match(term.id)}>{matched.includes(term.id) ? "✓ " : ""}{term.definition}</button>)}</div></div>
  </div>;
}
