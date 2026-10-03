import { Link } from "react-router";
import styles from "./BrandPanel.module.css";

export default function BrandPanel() {
  return (
    <aside className={styles.panel} aria-label="About INS">
      <Link
        className={styles.logoLink}
        to="/"
      >
        <img
          className={styles.logo}
          src="/brand/ins-vertical.svg"
          alt="INS"
          width={250}
          height={254}
          fetchPriority="high"
        />
      </Link>
      <p className={styles.slogan}>ai-powered, student-approved</p>
      <nav className={styles.navigation} aria-label="INS information">
        <a
          href="https://www.theastudy.com/?referralCode=Web-Platform"
          target="_blank"
          rel="noopener noreferrer"
        >
          About
        </a>
        <a
          href="https://www.thea.study/testimonials"
          target="_blank"
          rel="noopener noreferrer"
        >
          Testimonials
        </a>
        <a
          href="https://www.thea.study/contactUs"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact
        </a>
      </nav>
    </aside>
  );
}
