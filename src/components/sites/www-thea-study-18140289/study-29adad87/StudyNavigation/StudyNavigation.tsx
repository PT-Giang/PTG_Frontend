import { Link } from "react-router";
import styles from "./StudyNavigation.module.css";

interface StudyNavigationProps {
  materialId: string;
  view: string;
  collapsed: boolean;
  onCollapse(): void;
}

const links = [
  { route: "study", label: "Tài liệu", icon: "documents" },
  { route: "smartStudy", label: "Học thông minh", icon: "smart" },
  { route: "studyGuides", label: "Hướng dẫn học tập", icon: "guide" },
  { route: "memorize", label: "Bài thẻ ghi nhớ", icon: "memorize" },
  { route: "test", label: "Bài kiểm tra", icon: "quiz" },
];

export default function StudyNavigation({ materialId, view, collapsed, onCollapse }: StudyNavigationProps) {
  return <nav className={`${styles.navigation} ${collapsed ? styles.collapsed : ""}`} aria-label="Nội dung học tập">
    <Link to="/" className={styles.home} title="Trang chủ"><img src="/sites/www-thea-study-18140289/study-29adad87/home.svg" width={26} height={26} alt="" /><span>Trang chủ</span></Link>
    {links.map(link => {
      const active = link.route === view || (link.route === "studyGuides" && (view === "summaries" || view === "podcasts"));
      return <Link key={link.route} to={`/${link.route}/${encodeURIComponent(materialId)}${link.route === "memorize" ? "/flashcards" : ""}`} aria-current={active ? "page" : undefined} className={`${styles.item} ${active ? styles.active : ""} ${link.route === "smartStudy" ? styles.smart : ""} ${link.route === "studyGuides" ? styles.guide : ""}`} title={link.label}><img src={`/sites/www-thea-study-18140289/study-29adad87/${link.icon}.svg`} alt="" width={26} height={26} /><span>{link.label}</span></Link>;
    })}
    <button type="button" className={styles.collapse} onClick={onCollapse} aria-expanded={!collapsed} aria-label={collapsed ? "Mở rộng điều hướng" : "Thu gọn điều hướng"}>{collapsed ? "⇥" : "⇤"}</button>
  </nav>;
}
