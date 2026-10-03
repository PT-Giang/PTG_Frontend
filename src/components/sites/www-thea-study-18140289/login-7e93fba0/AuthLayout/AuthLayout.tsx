import { Link } from "react-router";
import BrandPanel from "../BrandPanel/BrandPanel";
import styles from "./AuthLayout.module.css";
interface AuthLayoutProps { children: React.ReactNode }
export default function AuthLayout({ children }: AuthLayoutProps) {
  return <main className={styles.page}>
    <a className={styles.skip} href="#auth-form">Skip to login form</a>
    <BrandPanel />
    <section className={styles.right} id="auth-form" tabIndex={-1} aria-label="Account access">
      <div className={styles.mobileBrand}>
        <Link to="/" aria-label="INS — Trang chủ"><img src="/brand/ins-logo.svg" alt="INS — Chim én" width={110} height={42} fetchPriority="high" /></Link>
        <p>ai-powered, student-approved</p>
      </div>
      {children}
    </section>
    <div className={styles.wave} aria-hidden="true" />
  </main>;
}
