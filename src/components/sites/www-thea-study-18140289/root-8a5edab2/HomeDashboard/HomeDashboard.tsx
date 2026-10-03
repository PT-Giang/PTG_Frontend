import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import HomeHeader from "../HomeHeader/HomeHeader";
import HomeFooter from "../HomeFooter/HomeFooter";
import HomeIcon from "../HomeIcon/HomeIcon";
import HomeDialog from "../HomeDialog/HomeDialog";
import StudyCard from "../StudyCard/StudyCard";
import type { DialogState, GroupMode, StudyMaterial } from "../types";
import styles from "./HomeDashboard.module.css";
const storageKey = "thea-home-demo-v1";
const initialMaterials: StudyMaterial[] = [1,2].map(id => ({id: `demo-${id}`, title: "Chưa có tiêu đề", className: "", deleted: false}));
function validMaterials(value: unknown): value is StudyMaterial[] { return Array.isArray(value) && value.every(item => item && typeof item.id === "string" && typeof item.title === "string" && typeof item.className === "string" && typeof item.deleted === "boolean"); }
export default function HomeDashboard() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState(initialMaterials);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<GroupMode>("Ngày");
  const [groupOpen, setGroupOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [status, setStatus] = useState("");
  const groupRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    try {
      let loaded = initialMaterials;
      const saved = localStorage.getItem(storageKey);
      if (saved) { const parsed: unknown = JSON.parse(saved); if (validMaterials(parsed)) {loaded = parsed; setMaterials(parsed);} }
      const materialId = new URLSearchParams(window.location.search).get("material");
      const linkedMaterial = loaded.find(item => item.id === materialId && !item.deleted);
      if (linkedMaterial) navigate(`/study/${encodeURIComponent(linkedMaterial.id)}`, { replace: true });
      else if (materialId) setStatus("Bộ học liệu demo này không có trong trình duyệt hiện tại.");
    } catch { setStatus("Trình duyệt không cho phép lưu dữ liệu; bạn vẫn có thể dùng bản demo trong phiên này."); }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) { try { localStorage.setItem(storageKey, JSON.stringify(materials)); } catch { /* The in-memory demo remains usable when browser storage is unavailable. */ } } }, [materials, ready]);
  useEffect(() => {
    function outside(event: PointerEvent) { if (!groupRef.current?.contains(event.target as Node)) setGroupOpen(false); }
    function escape(event: KeyboardEvent) { if (event.key === "Escape") setGroupOpen(false); }
    if (groupOpen) {document.addEventListener("pointerdown",outside); document.addEventListener("keydown",escape);}
    return () => {document.removeEventListener("pointerdown",outside); document.removeEventListener("keydown",escape);};
  }, [groupOpen]);
  function onAction(type: string, material?: StudyMaterial) {
    if (type === "preview" && material && !material.deleted) { navigate(`/study/${encodeURIComponent(material.id)}`); return; }
    if (type === "restore") {setMaterials(items => items.map(item => item.id === material?.id ? {...item,deleted:false} : item)); setStatus("Đã khôi phục bộ học liệu.");} else setDialog({type,material});
  }
  function save(value: string, className = "") {
    if (!dialog) return;
    if (dialog.type === "create") {
      const created = {id:crypto.randomUUID(),title:value || "Chưa có tiêu đề",className,deleted:false};
      const next = [created,...materials];
      try { localStorage.setItem(storageKey,JSON.stringify(next)); }
      catch { setStatus("Chưa tạo được bộ học liệu vì trình duyệt không cho phép lưu. Hãy bật bộ nhớ trang web rồi thử lại."); return; }
      setMaterials(next); setDialog(null); navigate(`/study/${created.id}`); return;
    }
    else setMaterials(items => items.map(item => item.id !== dialog.material?.id ? item : dialog.type === "delete" ? {...item,deleted:true} : dialog.type === "move" ? {...item,className:value} : {...item,title:value || "Chưa có tiêu đề"}));
    setDialog(null);
  }
  const normalizedQuery = query.trim().toLocaleLowerCase("vi");
  const visible = materials.filter(item => (showDeleted || !item.deleted) && `${item.title} ${item.className}`.toLocaleLowerCase("vi").includes(normalizedQuery));
  const groups = group === "Lớp" ? [...new Set(visible.map(item => item.className || "Chưa có lớp"))].map(name => ({name,items:visible.filter(item => (item.className || "Chưa có lớp") === name)})) : [{name:group === "Ngày" ? "Hôm nay" : "",items:visible}];
  return <div className={`${styles.page} ${isDark ? styles.dark : ""}`} lang="vi">
    <a className={styles.skip} href="#home-content">Bỏ qua đến nội dung chính</a>
    <HomeHeader onAction={type => onAction(type)} isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />
    <main id="home-content" className={styles.main} tabIndex={-1}>
      <button type="button" className={styles.create} onClick={() => onAction("create")}><img src="/sites/www-thea-study-18140289/root-8a5edab2/create.svg" alt="" width={38} height={38} /><span>Tạo bộ học liệu</span><HomeIcon name="arrow" /></button>
      <div className={styles.toolbar}>
        <form className={styles.search} role="search" onSubmit={event => {event.preventDefault(); searchRef.current?.focus();}}><button type="submit" aria-label="Tìm kiếm"><HomeIcon name="search" /></button><input ref={searchRef} aria-label="Tìm kiếm" placeholder="Tìm kiếm" value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" aria-label="Xóa tìm kiếm" onClick={() => setQuery("")}><HomeIcon name="close" /></button>}</form>
        <div className={styles.controls}>
          <div className={styles.groupControl} ref={groupRef}><button className={styles.groupButton} type="button" aria-haspopup="menu" aria-expanded={groupOpen} onClick={() => setGroupOpen(!groupOpen)}><HomeIcon name={group === "Ngày" ? "calendar" : group === "Lớp" ? "folder" : "grid"} />{group}<HomeIcon name="down" /></button>{groupOpen && <div className={styles.groupMenu} role="menu" aria-label="Nhóm bộ học liệu">{(["Ngày","Không nhóm","Lớp"] as GroupMode[]).filter(item => item !== group).map(item => <button type="button" role="menuitem" key={item} onClick={() => {setGroup(item); setGroupOpen(false);}}><HomeIcon name={item === "Ngày" ? "calendar" : item === "Lớp" ? "folder" : "grid"} />{item}</button>)}</div>}</div>
          <button type="button" role="switch" aria-checked={showDeleted} aria-label="Bao gồm các bộ học liệu đã xóa" title="Bao gồm các bộ học liệu đã xóa" className={`${styles.toggle} ${showDeleted ? styles.checked : ""}`} onClick={() => setShowDeleted(!showDeleted)}><span className={styles.knob} /><HomeIcon name="trashOff" /></button>
        </div>
      </div>
      {visible.length ? groups.map(section => <section key={section.name} aria-label={section.name || "Bộ học liệu"}>{section.name && <h1 className={styles.groupTitle}>{section.name} ({section.items.length})</h1>}<div className={styles.grid}>{section.items.map(item => <StudyCard key={item.id} material={item} onAction={onAction} />)}</div></section>) : <div className={styles.empty}><HomeIcon name="search" /><p>{query ? "Không tìm thấy bộ học liệu phù hợp." : "Chưa có bộ học liệu."}</p><button type="button" onClick={() => query ? setQuery("") : onAction("create")}>{query ? "Xóa tìm kiếm" : "Tạo bộ học liệu"}</button></div>}
      {status && <div className={styles.status} role="status">{status}<button type="button" aria-label="Đóng thông báo" onClick={() => setStatus("")}><HomeIcon name="close" /></button></div>}
    </main>
    <HomeFooter />
    {dialog && <HomeDialog key={`${dialog.type}-${dialog.material?.id || "new"}`} state={dialog} onClose={() => setDialog(null)} onSave={save} />}
  </div>;
}
