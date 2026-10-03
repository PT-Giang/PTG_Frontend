import { Fragment, useRef, useState } from "react";
import type { StudyTerm } from "@/study/types";
import styles from "./SmartMatching.module.css";
interface SmartMatchingProps { terms: StudyTerm[]; revealed: boolean; onComplete(correct: boolean): void }
const symbols = ["♥", "★", "♣", "◆", "♠"];
export default function SmartMatching({ terms, revealed, onComplete }: SmartMatchingProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const madeMistake = useRef(false);
  const completed = useRef(false);
  const definitions = [...terms.slice(1), ...terms.slice(0, 1)];
  function chooseDefinition(id: string) {
    if (!selected || completed.current || revealed) return;
    if (id !== selected) { setWrong(id); madeMistake.current = true; return; }
    const next = [...matched, id];
    setMatched(next); setSelected(null); setWrong(null);
    if (next.length === terms.length) { completed.current = true; onComplete(!madeMistake.current); }
  }
  return <div>
    <div className={styles.grid}>{terms.map((term, index) => {
      const definition = definitions[index];
      return <Fragment key={term.id}>
        <button type="button" disabled={revealed || matched.includes(term.id)} aria-pressed={selected === term.id} className={`${styles.card} ${selected === term.id ? styles.active : ""} ${matched.includes(term.id) || revealed ? styles.matched : ""}`} onClick={() => { setSelected(term.id); setWrong(null); }}>
          <span className={`${styles.symbol} ${styles[`symbol${index}`]}`} aria-hidden="true">{symbols[index]}</span>{term.term}
        </button>
        <button type="button" disabled={revealed || matched.includes(definition.id)} className={`${styles.card} ${wrong === definition.id ? styles.wrong : ""} ${matched.includes(definition.id) || revealed ? styles.matched : ""}`} onClick={() => chooseDefinition(definition.id)}>
          {(revealed || matched.includes(definition.id)) && <span className={`${styles.symbol} ${styles[`symbol${terms.findIndex(item => item.id === definition.id)}`]}`} aria-hidden="true">{symbols[terms.findIndex(item => item.id === definition.id)]}</span>}{definition.definition}
        </button>
      </Fragment>;
    })}</div>
    <p className={styles.status} role="status">{wrong ? "Chưa khớp. Hãy chọn một định nghĩa khác." : selected ? "Chọn định nghĩa tương ứng ở cột bên phải." : revealed ? "Các ký hiệu giống nhau là một cặp." : `Đã ghép ${matched.length}/${terms.length} cặp`}</p>
  </div>;
}

