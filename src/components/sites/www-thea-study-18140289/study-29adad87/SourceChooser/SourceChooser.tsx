import styles from "./SourceChooser.module.css";
interface SourceChooserProps { onSelect(mode: string): void }
const sources = [
  { mode: "upload", title: "Tải lên", description: "Tải lên các tệp của bạn", icon: "\uf0ee" },
  { mode: "paste", title: "Dán", description: "Dán ghi chú hoặc thuật ngữ của bạn", icon: "\uf0ea" },
  { mode: "topic", title: "Mô tả", description: "Mô tả kiến thức bạn muốn học", icon: "\uf303" },
];
export default function SourceChooser({ onSelect }: SourceChooserProps) {
  return <div className={styles.root}>
    <ul className={styles.grid}>{sources.map(source => <li key={source.mode}>
      <button type="button" className={styles.tile} onClick={() => onSelect(source.mode)} aria-label={source.title}>
        {source.mode === "upload" && <span className={styles.badge}>Được khuyến nghị</span>}
        <span className={styles.icon} aria-hidden="true">{source.icon}</span>
        <span className={styles.text}><span className={styles.title}>{source.title}</span><span className={styles.description}>{source.description}</span></span>
      </button>
    </li>)}</ul>
  </div>;
}
