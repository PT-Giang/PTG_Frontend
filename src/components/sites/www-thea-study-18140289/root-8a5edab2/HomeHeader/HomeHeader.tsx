
import { Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import HomeIcon from "../HomeIcon/HomeIcon";
import styles from "./HomeHeader.module.css";
import { useProfile } from "@/profile/useProfile";

interface HomeHeaderProps {
  onAction(action: string): void;
  isDark: boolean;
  onToggleTheme(): void;
  studyMode?: boolean;
}

const profileItems = [
  { label: "Hồ sơ của tôi", icon: "profile" },
  { label: "Thành tựu", icon: "crown" },
];
const settingsItems = [
  { label: "Thay đổi ngôn ngữ", icon: "language" },
  { label: "Thông báo", icon: "bell" },
];

export default function HomeHeader({ onAction, isDark, onToggleTheme, studyMode = false }: HomeHeaderProps) {
  const { profile } = useProfile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !accountRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        avatarRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  function handleAction(action: string) {
    setIsMenuOpen(false);
    onAction(action);
  }

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo} aria-label="INS — Trang chủ">
        <img className={styles.wordmark} src="/brand/ins-logo.svg" width={110} height={42} alt="INS — Chim én" fetchPriority="high" />
        <img className={styles.quill} src="/brand/ins-symbol.svg" width={40} height={40} alt="" />
      </Link>
      <div className={styles.actions}>
        <button type="button" className={styles.action} onClick={() => handleAction(studyMode ? "share" : "invite")} aria-label={studyMode ? "Chia sẻ" : "Mời"}>
          <HomeIcon name={studyMode ? "share" : "plane"} variant="regular" className={styles.actionIcon} />
          <span className={styles.actionLabel}>{studyMode ? "Chia sẻ" : "Mời"}</span>
        </button>
        <button type="button" className={styles.action} onClick={() => handleAction("feedback")} aria-label="Phản hồi">
          <HomeIcon name="feedback" variant="regular" className={styles.actionIcon} />
          <span className={styles.actionLabel}>Phản hồi</span>
        </button>
        <div className={styles.account} ref={accountRef}>
          <button ref={avatarRef} type="button" className={styles.avatarButton} aria-label="Mở menu tài khoản" aria-expanded={isMenuOpen} aria-controls="home-account-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <img className={styles.avatar} src={profile.avatar} width={40} height={40} alt="" />
            <span className={styles.level}><HomeIcon name="crown" />1</span>
            <span className={styles.notification} aria-label="Có thông báo mới" />
          </button>
          {isMenuOpen && (
            <nav id="home-account-menu" className={styles.menu} aria-label="Tài khoản">
              <div className={styles.profile}>
                <img className={styles.avatar} src={profile.avatar} width={40} height={40} alt="" />
                <strong>{profile.name}</strong>
              </div>
              {profileItems.map((item) => (
                <Link key={item.label} to={item.icon === "profile" ? "/profile" : "/profile/activity"} className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
                  <HomeIcon name={item.icon} />{item.label}
                </Link>
              ))}
              <button type="button" className={styles.menuItem} aria-pressed={isDark} onClick={onToggleTheme}>
                <span className={styles.themeIcon} aria-hidden="true">☾</span>Chế độ tối
                <span className={`${styles.toggle} ${isDark ? styles.toggleActive : ""}`} aria-hidden="true" />
              </button>
              {settingsItems.map((item) => (
                <button key={item.label} type="button" className={styles.menuItem} onClick={() => handleAction(item.label)}>
                  <HomeIcon name={item.icon} />{item.label}
                </button>
              ))}
              <a className={styles.menuItem} href="https://discord.gg/6sJuWrNvPe" target="_blank" rel="noopener noreferrer">
                <HomeIcon name="discord" variant="brands" />Trung tâm trợ giúp
              </a>
              <Link className={`${styles.menuItem} ${styles.logout}`} to="/login">Đăng xuất</Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
