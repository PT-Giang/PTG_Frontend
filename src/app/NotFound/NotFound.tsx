import { Link } from 'react-router';
import styles from './NotFound.module.css';
export default function NotFound() {
  return <main className={styles.page}><title>INS — Không tìm thấy trang</title><h1>404 — Không tìm thấy trang</h1><p>Đường dẫn không tồn tại.</p><Link to="/">Về trang chủ</Link></main>;
}
