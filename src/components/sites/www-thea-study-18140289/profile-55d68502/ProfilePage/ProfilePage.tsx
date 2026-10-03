import { useState } from "react";
import { Link } from "react-router";
import HomeHeader from "../../root-8a5edab2/HomeHeader/HomeHeader";
import HomeFooter from "../../root-8a5edab2/HomeFooter/HomeFooter";
import HomeDialog from "../../root-8a5edab2/HomeDialog/HomeDialog";
import homeStyles from "../../root-8a5edab2/HomeDashboard/HomeDashboard.module.css";
import ProfileOverview from "../ProfileOverview/ProfileOverview";
import ProfileEdit from "../ProfileEdit/ProfileEdit";
import ProfileActivity from "../ProfileActivity/ProfileActivity";
import AvatarPicker from "../AvatarPicker/AvatarPicker";
import { useProfile } from "@/profile/useProfile";
import styles from "./ProfilePage.module.css";
interface ProfilePageProps { view?: "overview" | "edit" | "activity" }
export default function ProfilePage({ view = "overview" }: ProfilePageProps) {
  const { profile, ready, error, save } = useProfile();
  const [dark, setDark] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [dialog, setDialog] = useState("");
  return <div className={`${homeStyles.page} ${dark ? homeStyles.dark : ""}`} lang="vi">
    <HomeHeader isDark={dark} onToggleTheme={() => setDark(!dark)} onAction={setDialog} />
    <main className={styles.main}>
      {view !== "edit" && <nav className={styles.tabs} aria-label="Hồ sơ và thành tựu"><Link className={styles.back} to="/" aria-label="Quay lại trang chủ">← <span>Quay lại</span></Link><Link to="/profile" aria-current={view === "overview" ? "page" : undefined}>Hồ sơ</Link><Link to="/profile/activity" aria-current={view === "activity" ? "page" : undefined}>Thành tựu</Link></nav>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
      {!ready ? <p role="status">Đang tải hồ sơ…</p> : view === "edit" ? <ProfileEdit profile={profile} onSave={save} /> : view === "activity" ? <ProfileActivity /> : <ProfileOverview profile={profile} onSave={save} onAvatar={() => setAvatarOpen(true)} />}
    </main>
    <HomeFooter />
    {avatarOpen && <AvatarPicker value={profile.avatar} onClose={() => setAvatarOpen(false)} onSave={avatar => save({ ...profile, avatar })} />}
    {dialog && <HomeDialog state={{ type: dialog }} onClose={() => setDialog("")} onSave={() => setDialog("")} />}
  </div>;
}
