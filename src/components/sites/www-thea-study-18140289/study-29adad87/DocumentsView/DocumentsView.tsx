import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import ClassPicker from "../../root-8a5edab2/ClassPicker/ClassPicker";
import type { StudyDocument, StudyViewProps } from "@/study/types";
import type { StudyMaterial } from "../../root-8a5edab2/types";
import { exampleContent, extractTerms, mergeTerms } from "@/study/content";
import { downloadText } from "@/study/repository";
import HomeIcon from "../../root-8a5edab2/HomeIcon/HomeIcon";
import ImportDialog from "../ImportDialog/ImportDialog";
import AskPanel from "../AskPanel/AskPanel";
import styles from "./DocumentsView.module.css";

interface DocumentsViewProps extends StudyViewProps { material: StudyMaterial; onMaterialChange(material: StudyMaterial): void }

export default function DocumentsView({ material, onMaterialChange, workspace, onChange, materialId }: DocumentsViewProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState("documents");
  const [importing, setImporting] = useState(() => location.state?.openImport === true);
  useEffect(() => { if (location.state?.openImport) navigate(location.pathname + location.search, { replace: true, state: null }); }, [location.pathname, location.search, location.state, navigate]);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(material.title);
  const [editingClass, setEditingClass] = useState(false);
  const [opened, setOpened] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  function addDocument(document: StudyDocument) {
    const terms = mergeTerms(workspace.terms, extractTerms(document));
    const added = terms.length - workspace.terms.length;
    onChange({ ...workspace, documents: [...workspace.documents, document], terms });
    setNotice(`Đã thêm tài liệu.${added ? ` Đã tạo ${added} thẻ từ các dòng thuật ngữ và định nghĩa.` : " Bạn có thể tạo thẻ thủ công trong Danh sách."}`);
  }
  function removeDocument(id: string) {
    onChange({ ...workspace, documents: workspace.documents.filter(document => document.id !== id), terms: workspace.terms.filter(term => term.documentId !== id) });
    setDeleting(null); setNotice("Đã xóa tài liệu và các thẻ được tạo từ tài liệu này.");
  }
  return <section className={styles.root} aria-label="Tài liệu học tập">
    <div className={styles.metadata}>
      <span className={styles.emoji} aria-hidden="true">📚</span>
      <div className={styles.information}>
        {editingTitle ? <form className={styles.editForm} onSubmit={event => { event.preventDefault(); if (!title.trim()) return; onMaterialChange({ ...material, title: title.trim() }); setEditingTitle(false); }}><input autoFocus aria-label="Tên bộ học liệu" maxLength={120} required value={title} onChange={event => setTitle(event.target.value)} /><button type="submit">Lưu</button><button type="button" onClick={() => setEditingTitle(false)}>Hủy</button></form> : <button type="button" className={styles.title} onClick={() => { setTitle(material.title); setEditingTitle(true); }}><h1>{material.title}</h1><HomeIcon name="edit" /></button>}
        <button type="button" className={styles.className} onClick={() => setEditingClass(true)}><HomeIcon name="folder" />{material.className || "Chọn một lớp cho bộ học liệu của bạn"}<HomeIcon name="edit" /></button>
        <span className={styles.language}><HomeIcon name="language" /> Mặc định</span>
      </div>
    </div>
    <Link to={`/smartStudy/${materialId}`} className={styles.start}>▷ Bắt đầu học</Link>
    <div className={styles.tabs} role="tablist" aria-label="Nội dung bộ học liệu"><button id="documents-tab" type="button" role="tab" aria-selected={tab === "documents"} aria-controls="documents-panel" onClick={() => setTab("documents")}>{workspace.documents.length} tài liệu <HomeIcon name="info" /></button><button id="ask-tab" type="button" role="tab" aria-selected={tab === "ask"} aria-controls="ask-panel" onClick={() => setTab("ask")}>Hỏi <HomeIcon name="info" /></button></div>
    {tab === "documents" ? <div id="documents-panel" role="tabpanel" aria-labelledby="documents-tab" className={styles.documents}>
      <div className={styles.toolbar}><button type="button" className={styles.add} onClick={() => setImporting(true)}>+ Thêm</button>{!!workspace.documents.length && <Link to={`/memorize/${materialId}/list`}>{workspace.terms.length} thẻ ghi nhớ →</Link>}</div>
      {!workspace.documents.length ? <div className={styles.empty}><HomeIcon name="books" /><h2>Thêm tài liệu để bắt đầu</h2><p>Tải tài liệu hoặc dán ghi chú của bạn để đọc, tạo thẻ và luyện tập.</p><button type="button" onClick={() => addDocument({ id: crypto.randomUUID(), title: "Sinh học — Thực vật (mẫu)", text: exampleContent, createdAt: new Date().toISOString() })}>Dùng nội dung mẫu</button></div> : <ul className={styles.files}>{workspace.documents.map(document => <li key={document.id}>
        <div className={styles.fileRow}><button type="button" onClick={() => setOpened(opened === document.id ? null : document.id)} aria-expanded={opened === document.id}><HomeIcon name="books" /><span>{document.title}</span></button><button type="button" onClick={() => setDeleting(document.id)} aria-label={`Xóa ${document.title}`}><HomeIcon name="close" /></button></div>
        {deleting === document.id && <div className={styles.confirm} role="alert"><p>Xóa tài liệu và các thẻ được tạo từ tài liệu này? Lịch sử bài kiểm tra vẫn được giữ.</p><button type="button" onClick={() => setDeleting(null)}>Hủy</button><button type="button" onClick={() => removeDocument(document.id)}>Xóa tài liệu</button></div>}
        {opened === document.id && <div className={styles.preview}><pre>{document.text}</pre><button type="button" onClick={() => downloadText(`${document.title}.txt`, document.text)}>Tải văn bản</button></div>}
      </li>)}</ul>}
      {!!workspace.documents.length && <p className={styles.localNote}>Đã lưu trên trình duyệt này. <button type="button" onClick={() => downloadText(`${material.title}.json`, JSON.stringify({ material, workspace }, null, 2), "application/json")}>Tải bản sao lưu</button></p>}
    </div> : <div id="ask-panel" role="tabpanel" aria-labelledby="ask-tab"><AskPanel documents={workspace.documents} /></div>}
    {notice && <p role="status" className={styles.notice}>{notice}<button type="button" aria-label="Đóng thông báo" onClick={() => setNotice("")}>×</button></p>}
    {editingClass && <ClassPicker value={material.className} onSelect={name => onMaterialChange({ ...material, className: name, classColor: undefined })} onClose={() => setEditingClass(false)} />}
    {importing && <ImportDialog onClose={() => setImporting(false)} onAdd={addDocument} />}
  </section>;
}

