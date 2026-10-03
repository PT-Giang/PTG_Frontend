import HomeIcon from "../HomeIcon/HomeIcon";
import styles from "./HomeFooter.module.css";
export default function HomeFooter() { return <footer className={styles.footer}>
  <nav aria-label="Liên kết INS"><a href="https://discord.gg/6sJuWrNvPe" target="_blank" rel="noopener noreferrer" aria-label="Discord"><HomeIcon name="discord" variant="brands" /></a><span>|</span><a href="https://www.thea.study/aboutThea" target="_blank" rel="noopener noreferrer" aria-label="Về INS"><HomeIcon name="info" /></a><span>|</span><a href="https://www.thea.study/contactUs" target="_blank" rel="noopener noreferrer" aria-label="Liên hệ"><HomeIcon name="email" /></a><span>|</span><a href="https://www.instagram.com/thea.study/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><HomeIcon name="instagram" variant="brands" /></a></nav>
  <small><span className={styles.full}>Bản quyền © 2023-2026 Công ty INS</span><span className={styles.short}>© INS</span></small>
  </footer>; }
