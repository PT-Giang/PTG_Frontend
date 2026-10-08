import { useState } from "react";
import styles from "./SourceChooser.module.css";
interface SourceChooserProps { onSelect(mode: string): void }
const sources = [
  { mode: "upload", title: "Tải lên", description: "Tải lên các tệp của bạn", icon: "\uf0ee" },
  { mode: "youtube", title: "YouTube", description: "Dán liên kết video", icon: "\uf167" },
  { mode: "paste", title: "Dán", description: "Dán ghi chú hoặc thuật ngữ của bạn", icon: "\uf0ea" },
  { mode: "combine", title: "Kết hợp", description: "Thêm tài liệu từ các bộ học liệu của bạn", icon: "\uf5db" },
  { mode: "catalog", title: "Danh mục", description: "Khám phá các bộ học liệu mẫu", icon: "\uf19d" },
  { mode: "topic", title: "Mô tả", description: "Hãy cho INS biết bạn đang học gì", icon: "\uf303" },
];
export default function SourceChooser({ onSelect }: SourceChooserProps) {
  const [expanded, setExpanded] = useState(false);
  return <div className={styles.root}>
    <ul className={styles.grid}>{sources.slice(0, expanded ? 6 : 3).map(source => <li key={source.mode}>
      <button type="button" className={styles.tile} onClick={() => onSelect(source.mode)} aria-label={source.title}>
        {source.mode === "upload" && <span className={styles.badge}>Được khuyến nghị</span>}
        <span className={source.mode === "youtube" ? styles.brandIcon : styles.icon} aria-hidden="true">{source.icon}</span>
        <span className={styles.text}><span className={styles.title}>{source.title}</span><span className={styles.description}>{source.description}</span></span>
      </button>
    </li>)}</ul>
    {!expanded && <button type="button" className={styles.more} aria-expanded={false} onClick={() => setExpanded(true)}>↓ Thêm</button>}
  </div>;
}
