
import { useState, type FormEvent } from "react";
import type { StudyViewProps } from "@/study/types";
import HomeIcon from "../../root-8a5edab2/HomeIcon/HomeIcon";
import styles from "./TermList.module.css";

export default function TermList({ workspace, onChange }: StudyViewProps) {
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!term.trim() || !definition.trim()) return;
    const terms = editingId ? workspace.terms.map(item => item.id === editingId ? { ...item, term: term.trim(), definition: definition.trim() } : item) :
      [...workspace.terms, { id: crypto.randomUUID(), term: term.trim(), definition: definition.trim(), level: 0 }];
    onChange({ ...workspace, terms });
    setStatus(editingId ? "Đã cập nhật thẻ." : "Đã thêm thẻ.");
    setEditingId(null); setTerm(""); setDefinition("");
  }
  const visible = workspace.terms.filter(item => `${item.term} ${item.definition}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  return <div className={styles.container}>
    <h2>{workspace.terms.length} thuật ngữ</h2>
    <label className={styles.search}>Tìm thuật ngữ<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm trong bộ thẻ" type="search" /></label>
    <form className={styles.editor} onSubmit={save}>
      <h3>{editingId ? "Chỉnh sửa thẻ" : "Thêm thẻ ghi nhớ"}</h3>
      <label>Thuật ngữ<input required maxLength={500} value={term} onChange={event => setTerm(event.target.value)} /></label>
      <label>Định nghĩa<textarea required maxLength={5000} rows={3} value={definition} onChange={event => setDefinition(event.target.value)} /></label>
      <div className={styles.actions}><button type="submit" className={styles.primary}><HomeIcon name={editingId ? "edit" : "plus"} /> {editingId ? "Lưu thay đổi" : "Thêm thẻ"}</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setTerm(""); setDefinition(""); }}>Hủy chỉnh sửa</button>}</div>
    </form>
    <p role="status">{status}</p>
    {!visible.length && <p>{workspace.terms.length ? "Không có thuật ngữ phù hợp." : "Tạo thẻ đầu tiên bằng biểu mẫu phía trên hoặc thêm nội dung trong Tài liệu."}</p>}
    <ul className={styles.list}>{visible.map(item => <li className={styles.row} key={item.id}>
      <strong>{item.term}</strong><p>{item.definition}</p><div className={styles.actions}>
        <button type="button" aria-label={`Sửa ${item.term}`} onClick={() => { setEditingId(item.id); setTerm(item.term); setDefinition(item.definition); }}><HomeIcon name="edit" /></button>
        <button type="button" aria-label={`Xóa ${item.term}`} onClick={() => setDeleteId(item.id)}><HomeIcon name="trash" /></button></div>
      {deleteId === item.id && <div className={styles.confirm}><span>Xóa thẻ này?</span><button type="button" onClick={() => { onChange({ ...workspace, terms: workspace.terms.filter(term => term.id !== item.id) }); setDeleteId(null); if (editingId === item.id) { setEditingId(null); setTerm(""); setDefinition(""); } setStatus("Đã xóa thẻ."); }}>Xóa thẻ</button><button type="button" onClick={() => setDeleteId(null)}>Hủy</button></div>}
    </li>)}</ul>
  </div>;
}
