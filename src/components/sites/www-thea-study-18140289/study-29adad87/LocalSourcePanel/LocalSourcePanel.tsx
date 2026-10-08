import { useEffect, useState } from "react";
import { readImportSources } from "@/study/importSources";
import { exampleContent } from "@/study/content";
import styles from "./LocalSourcePanel.module.css";
interface LocalSourcePanelProps { mode: string; onChoose(title: string, text: string): void }
export default function LocalSourcePanel({ mode, onChoose }: LocalSourcePanelProps) {
  const [sources, setSources] = useState<ReturnType<typeof readImportSources>>([]);
  const [error, setError] = useState("");
  function load() { try { setSources(readImportSources()); setError(""); } catch { setError("Không đọc được tài liệu cục bộ. Hãy kiểm tra dữ liệu đã lưu rồi thử lại."); } }
  useEffect(() => { if (mode === "combine") load(); }, [mode]);
  if (mode === "catalog") return <div className={styles.root}><p>Danh mục mẫu cục bộ. Chưa kết nối thư viện trực tuyến.</p><button type="button" onClick={() => onChoose("Sinh học — Thực vật (mẫu)", exampleContent)}>Sinh học — Thực vật <span>Xem nội dung →</span></button></div>;
  return <div className={styles.root}>
    <p>Chọn một tài liệu để tạo bản sao. Tài liệu gốc được giữ nguyên.</p>
    {error ? <div role="alert">{error}<button type="button" onClick={load}>Thử lại</button></div> : !sources.length ? <p>Chưa có tài liệu đã lưu. Hãy tải lên hoặc dán nội dung trước.</p> : sources.map(source => <section key={source.id}><h3>{source.title}</h3>{source.documents.map(document => <button type="button" key={document.id} onClick={() => onChoose(document.title, document.text)}>{document.title}<span>Chọn →</span></button>)}</section>)}
  </div>;
}
