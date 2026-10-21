import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import HomeHeader from "../HomeHeader/HomeHeader";
import HomeFooter from "../HomeFooter/HomeFooter";
import HomeIcon from "../HomeIcon/HomeIcon";
import HomeDialog from "../HomeDialog/HomeDialog";
import StudyCard from "../StudyCard/StudyCard";
import ClassHeader from "../ClassHeader/ClassHeader";
import ClassPicker from "../ClassPicker/ClassPicker";
import ClassColorDialog from "../ClassColorDialog/ClassColorDialog";
import { colorForClass, groupMaterials, renameClass } from "@/study/materialGroups";
import { studyApi } from "@/study/studyApi";
import type { DialogState, GroupMode, StudyMaterial } from "../types";
import styles from "./HomeDashboard.module.css";
export default function HomeDashboard() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<GroupMode>("Ngày");
  const [groupOpen, setGroupOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [status, setStatus] = useState("");
  const [colorClass, setColorClass] = useState<string | null>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let active = true;
    try {
      const preference = localStorage.getItem("ins-home-group");
      if (preference === "Ngày" || preference === "Lớp" || preference === "Không nhóm") setGroup(preference);
      const linkedClass = new URLSearchParams(window.location.search).get("class");
      if (linkedClass) { setQuery(linkedClass); setGroup("Lớp"); }
    } catch { setStatus("Không đọc được tùy chọn hiển thị đã lưu."); }
    async function loadMaterials() {
      try {
        const page = await studyApi.listMaterials();
        if (!active) return;
        const loaded = page.data.map(item => ({
          id: item.id,
          title: item.title,
          className: item.className || "",
          deleted: false,
          createdAt: item.createdAt,
        }));
        setMaterials(loaded);
        const materialId = new URLSearchParams(window.location.search).get("material");
        const linkedMaterial = loaded.find(item => item.id === materialId);
        if (linkedMaterial) navigate(`/study/${encodeURIComponent(linkedMaterial.id)}`, { replace: true });
        else if (materialId) setStatus("Không tìm thấy bộ học liệu trong tài khoản này.");
      } catch (error) {
        if (active) setStatus(error instanceof Error ? error.message : "Không tải được bộ học liệu từ Backend.");
      } finally {
        if (active) setReady(true);
      }
    }
    void loadMaterials();
    return () => { active = false; };
  }, [navigate]);
  function persist(next: StudyMaterial[]) {
    if (!ready) { setStatus("Chưa thể lưu khi danh sách học liệu chưa được tải thành công."); return false; }
    setMaterials(next);
    return true;
  }
  function changeGroup(next: GroupMode) { setGroup(next); setGroupOpen(false); try { localStorage.setItem("ins-home-group", next); } catch { setStatus("Chưa lưu được cách phân nhóm."); } }
  async function createMaterial() {
    if (!ready) { setStatus("Danh sách học liệu đang tải. Hãy thử lại sau."); return; }
    try {
      const saved = await studyApi.createMaterial("Chưa có tiêu đề");
      const created: StudyMaterial = { id: saved.id, title: saved.title, className: saved.className || "", deleted: false, createdAt: saved.createdAt };
      if (persist([created, ...materials])) navigate(`/study/${created.id}`, { state: { openImport: true } });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Không tạo được bộ học liệu. Hãy thử lại.");
    }
  }
  useEffect(() => {
    function outside(event: PointerEvent) { if (!groupRef.current?.contains(event.target as Node)) setGroupOpen(false); }
    function escape(event: KeyboardEvent) { if (event.key === "Escape") setGroupOpen(false); }
    if (groupOpen) {document.addEventListener("pointerdown",outside); document.addEventListener("keydown",escape);}
    return () => {document.removeEventListener("pointerdown",outside); document.removeEventListener("keydown",escape);};
  }, [groupOpen]);
  function onAction(type: string, material?: StudyMaterial) {
    if (type === "create") { createMaterial(); return; }
    if (type === "preview" && material && !material.deleted) { navigate(`/study/${encodeURIComponent(material.id)}`); return; }
    if (type === "restore") {if (persist(materials.map(item => item.id === material?.id ? {...item,deleted:false} : item))) setStatus("Đã khôi phục bộ học liệu.");} else setDialog({type,material});
  }
  async function save(value: string) {
    if (!dialog) return;
    try {
      let next: StudyMaterial[];
      if (dialog.type === "delete" && dialog.material) {
        await studyApi.deleteMaterial(dialog.material.id);
        next = materials.filter(item => item.id !== dialog.material?.id);
      } else if (dialog.type === "move" && dialog.material) {
        const classes = await studyApi.listClasses();
        const selected = value ? classes.find(item => item.name.toLocaleLowerCase("vi") === value.toLocaleLowerCase("vi")) || await studyApi.createClass(value) : null;
        await studyApi.updateMaterial(dialog.material.id, selected ? { classId: selected.id } : { clearClass: true });
        next = materials.map(item => item.id === dialog.material?.id ? { ...item, className: selected?.name || "", classColor: colorForClass(materials, selected?.name || "") } : item);
      } else if (dialog.type === "rename" && dialog.material) {
        const title = value || "Chưa có tiêu đề";
        await studyApi.updateMaterial(dialog.material.id, { title });
        next = materials.map(item => item.id === dialog.material?.id ? { ...item, title } : item);
      } else {
        setDialog(null);
        return;
      }
      if (persist(next)) setDialog(null);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Không lưu được thay đổi. Hãy thử lại.");
    }
  }
  const normalizedQuery = query.trim().toLocaleLowerCase("vi");
  const visible = materials.filter(item => (showDeleted || !item.deleted) && `${item.title} ${item.className}`.toLocaleLowerCase("vi").includes(normalizedQuery));
  const groups = groupMaterials(visible, group);
  function changeClassName(previous: string, next: string) {
    try { return persist(renameClass(materials, previous, next)); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Không thể đổi tên lớp."); return false; }
  }
  return <div className={`${styles.page} ${isDark ? styles.dark : ""}`} lang="vi">
    <a className={styles.skip} href="#home-content">Bỏ qua đến nội dung chính</a>
    <HomeHeader onAction={type => onAction(type)} isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />
    <main id="home-content" className={styles.main} tabIndex={-1}>
      <button type="button" className={styles.create} onClick={() => onAction("create")}><img src="/sites/www-thea-study-18140289/root-8a5edab2/create.svg" alt="" width={38} height={38} /><span>Tạo bộ học liệu</span><HomeIcon name="arrow" /></button>
      <div className={styles.toolbar}>
        <form className={styles.search} role="search" onSubmit={event => {event.preventDefault(); searchRef.current?.focus();}}><button type="submit" aria-label="Tìm kiếm"><HomeIcon name="search" /></button><input ref={searchRef} aria-label="Tìm kiếm" placeholder="Tìm kiếm" value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" aria-label="Xóa tìm kiếm" onClick={() => setQuery("")}><HomeIcon name="close" /></button>}</form>
        <div className={styles.controls}>
          <div className={styles.groupControl} ref={groupRef}><button className={styles.groupButton} type="button" aria-haspopup="menu" aria-expanded={groupOpen} onClick={() => setGroupOpen(!groupOpen)}><HomeIcon name={group === "Ngày" ? "calendar" : group === "Lớp" ? "folder" : "grid"} />{group}<HomeIcon name="down" /></button>{groupOpen && <div className={styles.groupMenu} role="menu" aria-label="Nhóm bộ học liệu">{(["Ngày","Không nhóm","Lớp"] as GroupMode[]).filter(item => item !== group).map(item => <button type="button" role="menuitem" key={item} onClick={() => {changeGroup(item);}}><HomeIcon name={item === "Ngày" ? "calendar" : item === "Lớp" ? "folder" : "grid"} />{item}</button>)}</div>}</div>
          <button type="button" role="switch" aria-checked={showDeleted} aria-label="Bao gồm các bộ học liệu đã xóa" title="Bao gồm các bộ học liệu đã xóa" className={`${styles.toggle} ${showDeleted ? styles.checked : ""}`} onClick={() => setShowDeleted(!showDeleted)}><span className={styles.knob} /><HomeIcon name="trashOff" /></button>
        </div>
      </div>
      {visible.length ? groups.map(section => <section key={section.key} aria-label={section.name || "Bộ học liệu"}>{section.name && (group === "Lớp" && section.items[0]?.className ? <ClassHeader name={section.name} onRename={name => changeClassName(section.name, name)} onColor={() => setColorClass(section.name)} onShare={() => setDialog({ type: "classShare", className: section.name })} /> : <h2 className={styles.groupTitle}>{section.name}</h2>)}<div className={styles.grid}>{section.items.map(item => <StudyCard key={item.id} material={item} color={colorForClass(materials, item.className)} onAction={onAction} />)}</div></section>) : <div className={styles.empty}><HomeIcon name="search" /><p>{query ? "Không tìm thấy bộ học liệu phù hợp." : "Chưa có bộ học liệu."}</p><button type="button" onClick={() => query ? setQuery("") : onAction("create")}>{query ? "Xóa tìm kiếm" : "Tạo bộ học liệu"}</button></div>}
      {status && <div className={styles.status} role="status">{status}<button type="button" aria-label="Đóng thông báo" onClick={() => setStatus("")}><HomeIcon name="close" /></button></div>}
    </main>
    <HomeFooter />
    {colorClass !== null && <ClassColorDialog color={colorForClass(materials, colorClass)} onClose={() => setColorClass(null)} onSave={color => { if (persist(materials.map(item => item.className === colorClass ? { ...item, classColor: color } : item))) setColorClass(null); }} />}
    {dialog?.type === "move" ? <ClassPicker value={dialog.material?.className || ""} onSelect={save} onClose={() => setDialog(null)} /> : dialog && <HomeDialog key={`${dialog.type}-${dialog.material?.id || "new"}`} state={dialog} onClose={() => setDialog(null)} onSave={save} />}
  </div>;
}


