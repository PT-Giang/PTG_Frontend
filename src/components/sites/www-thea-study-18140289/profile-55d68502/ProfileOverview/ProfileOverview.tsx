
import { Link } from "react-router";
import { useState, type FormEvent } from "react";
import type { LocalProfile, ProfileProps } from "@/profile/types";
import HomeIcon from "../../root-8a5edab2/HomeIcon/HomeIcon";
import ProfileNotice from "../ProfileNotice/ProfileNotice";
import PlusButton from "../../shared/PlusButton/PlusButton";
import PlusUpgradeDialog from "../../shared/PlusUpgradeDialog/PlusUpgradeDialog";
import styles from "./ProfileOverview.module.css";

interface ProfileOverviewProps extends ProfileProps { onAvatar(): void }
type EditableField = "role" | "school" | "education" | "grade";
const labels: Record<EditableField, string> = { role: "Vai trò", school: "Trường học", education: "Cấp độ", grade: "Cấp độ của tôi" };
const choices: Partial<Record<EditableField, string[]>> = {
  role: ["Học sinh", "Giáo viên", "Khác"],
  education: ["Trường Tiểu học", "Trường Trung học cơ sở", "Trường Trung học phổ thông", "Trường Đại học", "Sau đại học", "Khác"],
};

export default function ProfileOverview({ profile, onSave, onAvatar }: ProfileOverviewProps) {
  const [editing, setEditing] = useState<EditableField | null>(null);
  const [value, setValue] = useState("");
  const [notice, setNotice] = useState("");
  const [message, setMessage] = useState("");
  const [showPlus, setShowPlus] = useState(false);
  function edit(field: EditableField) { setEditing(field); setValue(profile[field]); setNotice(""); }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const nextProfile: LocalProfile = { ...profile, [editing]: value.trim() };
    if (onSave(nextProfile)) { setEditing(null); setNotice("Đã lưu hồ sơ trên thiết bị này."); }
    else setNotice("Không thể lưu hồ sơ. Hãy thử lại.");
  }
  async function copyCode() {
    try { await navigator.clipboard.writeText(profile.supportCode); setNotice("Đã sao chép mã hỗ trợ."); }
    catch { setNotice("Không thể sao chép tự động. Hãy chọn mã hỗ trợ và sao chép thủ công."); }
  }
  return <div className={styles.overview}>
    <section aria-labelledby="profile-details-title">
      <h2 id="profile-details-title" className={styles.heading}>Hồ sơ người dùng</h2>
      <div className={`${styles.panel} ${styles.identity}`}>
        <div className={styles.person}>
          <button type="button" className={styles.avatar} onClick={onAvatar} aria-label="Thay đổi ảnh đại diện"><img src={profile.avatar} alt="Ảnh đại diện" width={120} height={120} /><HomeIcon name="edit" /></button>
          <div className={styles.personText}><h3 className={styles.name} title={profile.name}>{profile.name}</h3>
          <button type="button" className={styles.role} onClick={() => edit("role")}>{profile.role}<HomeIcon name="edit" /></button>
          </div>
        </div>
        <dl className={styles.details}>
          {(["school", "education", "grade"] as const).filter(field => field !== "grade" || !["Trường Đại học", "Sau đại học"].includes(profile.education)).map(field => <div className={styles.row} key={field}>
            <dt>{labels[field]}</dt>
            <dd><button type="button" className={styles.field} onClick={() => edit(field)} aria-label={`Chỉnh sửa ${labels[field].toLowerCase()}`}><span title={profile[field]}>{profile[field] || "Chưa chọn"}</span><HomeIcon name="edit" /></button></dd>
          </div>)}
        </dl>
      </div>
      {editing && <form className={styles.editor} onSubmit={save}>
        <label htmlFor="profile-field">{labels[editing]}</label>
        {choices[editing] ? <select id="profile-field" autoFocus value={value} onChange={event => setValue(event.target.value)}>
          {!choices[editing]?.includes(value) && <option value={value}>{value || "Chưa chọn"}</option>}
          {choices[editing]?.map(option => <option key={option}>{option}</option>)}
        </select> : <input id="profile-field" autoFocus value={value} maxLength={160} onChange={event => setValue(event.target.value)} />}
        <div className={styles.actions}><button type="button" className={styles.secondary} onClick={() => setEditing(null)}>Hủy</button><button type="submit" className={styles.primary}>Lưu</button></div>
      </form>}
    </section>
    <section aria-labelledby="profile-subscription-title">
      <div className={styles.sectionHeading}><h2 id="profile-subscription-title" className={styles.heading}>Đăng ký <button type="button" className={styles.iconButton} aria-label="Tải lại đăng ký" title="Tải lại" onClick={() => setNotice("Đang sử dụng gói miễn phí trong bản cục bộ. Chưa có kết nối tài khoản INS.")}><HomeIcon name="restore" /></button></h2><button type="button" className={styles.help} onClick={() => setMessage("Thông tin đăng ký hiện được mô phỏng cục bộ. Chưa kết nối dịch vụ hỗ trợ hoặc tài khoản INS.")}>Gặp khó khăn?</button></div>
      <div className={styles.panel}>
        <dl className={styles.plan}><dt>Gói</dt><dd>INS miễn phí</dd></dl>
        <div className={styles.actions}><PlusButton onClick={() => setShowPlus(true)} /></div>
      </div>
    </section>
    <section aria-labelledby="profile-account-title">
      <h2 id="profile-account-title" className={styles.heading}>Cài đặt tài khoản</h2>
      <div className={styles.panel}>
        <dl className={styles.account}>
          <div className={styles.row}><dt>Tên</dt><dd>{profile.name}</dd></div>
          <div className={styles.row}><dt>Email</dt><dd>{profile.email || "Chưa có email"}</dd></div>
          <div className={styles.row}><dt>Ngôn ngữ ưa thích <span title="Ngôn ngữ ưu tiên cho giao diện và nội dung được tạo. Bản cục bộ lưu lựa chọn; chưa dịch giao diện tự động."><HomeIcon name="info" /></span></dt><dd>{profile.language}</dd></div>
          <div className={styles.row}><dt>Mã hỗ trợ <span title="Mã mô phỏng dùng trong bản cục bộ, chưa liên kết với bộ phận hỗ trợ INS."><HomeIcon name="info" /></span></dt><dd className={styles.code}><span>{profile.supportCode}</span><button type="button" className={styles.iconButton} onClick={copyCode} aria-label="Sao chép mã hỗ trợ"><HomeIcon name="copy" /></button></dd></div>
        </dl>
        <div className={styles.actions}><Link className={styles.secondary} to="/profile/edit">Chỉnh sửa</Link></div>
      </div>
    </section>
    {notice && <p className={styles.notice} role="status">{notice}</p>}
    {message && <ProfileNotice message={message} onClose={() => setMessage("")} />}
    {showPlus && <PlusUpgradeDialog onClose={() => setShowPlus(false)} />}
  </div>;
}
