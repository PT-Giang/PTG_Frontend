import { useState } from "react";
import HomeIcon from "../HomeIcon/HomeIcon";
import styles from "./ClassHeader.module.css";
interface ClassHeaderProps { name: string; onRename(name: string): boolean; onColor(): void; onShare(): void }
export default function ClassHeader({ name, onRename, onColor, onShare }: ClassHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  function edit() { setValue(name); setEditing(true); }
  return <div className={styles.header}>
    {editing ? <form onSubmit={event => { event.preventDefault(); if (onRename(value)) setEditing(false); }}><input autoFocus aria-label="Tên lớp" maxLength={80} required value={value} onChange={event => setValue(event.target.value)} /><button type="submit" aria-label="Lưu">✓</button><button type="button" aria-label="Hủy" onClick={() => setEditing(false)}><HomeIcon name="close" /></button></form> : <><h2><button type="button" onClick={edit}>{name}</button></h2><button type="button" aria-label={`Chỉnh sửa lớp ${name}`} title="Chỉnh sửa" onClick={edit}><HomeIcon name="edit" /></button><button type="button" aria-label={`Thay đổi màu lớp ${name}`} title="Thay đổi màu" onClick={onColor}><span className={styles.palette} aria-hidden="true">&#xf53f;</span></button><button type="button" aria-label={`Chia sẻ lớp ${name}`} title="Chia sẻ lớp học" onClick={onShare}><HomeIcon name="share" /></button></>}
  </div>;
}
