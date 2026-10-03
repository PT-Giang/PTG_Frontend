
import { Link } from "react-router";
import { useRef, useState, type FormEvent } from "react";
import type { ProfileProps } from "@/profile/types";
import styles from "./ProfileEdit.module.css";

export default function ProfileEdit({ profile, onSave }: ProfileProps) {
  const [name, setName] = useState(profile.name);
  const [language, setLanguage] = useState(profile.language);
  const [status, setStatus] = useState("");
  const [hasError, setHasError] = useState(false);
  const noticeRef = useRef<HTMLDialogElement>(null);
  const validName = name.trim().length > 0 && name.trim().length <= 120;
  const hasChanges = name.trim() !== profile.name || language !== profile.language;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validName || !hasChanges) return;
    const saved = onSave({ ...profile, name: name.trim(), language });
    setHasError(!saved);
    setStatus(saved ? "Đã lưu thông tin hồ sơ trên thiết bị này." : "Không thể lưu hồ sơ. Vui lòng thử lại.");
    if (saved) setName(name.trim());
  }

  return (
    <div className={styles.page}>
      <section className={`${styles.panel} ${styles.returnPanel}`} aria-label="Quay lại hồ sơ">
        <Link className={styles.greyButton} to="/profile">Chỉnh sửa xong</Link>
        <p>Nhấn vào &quot;Chỉnh sửa xong&quot; để quay lại trang trước đó.</p>
      </section>

      <section className={styles.panel} aria-labelledby="profile-information-title">
        <h1 id="profile-information-title" className={styles.heading}>Thông tin hồ sơ</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field} htmlFor="profile-name">
            <span>Tên</span>
            <input
              id="profile-name"
              autoComplete="name"
              required
              maxLength={120}
              value={name}
              onChange={(event) => { setName(event.target.value); setStatus(""); }}
            />
          </label>
          <label className={styles.field} htmlFor="profile-language">
            <span>Ngôn ngữ ưa thích</span>
            <select
              id="profile-language"
              value={language}
              aria-describedby="profile-language-description profile-language-local"
              onChange={(event) => { setLanguage(event.target.value); setStatus(""); }}
            >
              <option value="Vietnamese">Tiếng Việt</option>
              <option value="English">English</option>
            </select>
          </label>
          <p id="profile-language-description" className={styles.description}>
            Cài đặt này thiết lập ngôn ngữ mà INS sử dụng cho văn bản như thế này và ngôn ngữ mặc định cho văn bản được tạo ra. Bạn có thể ghi đè ngôn ngữ được sử dụng cho một bộ học liệu cụ thể trên trang “Tài liệu”.
          </p>
          <p id="profile-language-local" className={styles.localNote}>
            Bản cục bộ lưu lựa chọn ngôn ngữ; chức năng dịch giao diện sẽ được kết nối sau.
          </p>
          <button className={styles.saveButton} type="submit" disabled={!validName || !hasChanges}>Lưu</button>
          {status && <p className={hasError ? styles.error : styles.status} role={hasError ? "alert" : "status"}>{status}</p>}
        </form>
      </section>

      <section className={styles.panel} aria-labelledby="delete-account-title">
        <h2 id="delete-account-title" className={styles.heading}>Xóa tài khoản</h2>
        <p className={styles.deleteDescription}>
          Khi tài khoản của bạn bị xóa, tất cả tài liệu học liệu sẽ bị mất. Trước khi xóa tài khoản, vui lòng tải xuống bất kỳ dữ liệu hoặc thông tin nào bạn muốn giữ lại.
        </p>
        <button className={styles.greyButton} type="button" onClick={() => noticeRef.current?.showModal()}>Xóa tài khoản</button>
      </section>

      <dialog ref={noticeRef} className={styles.dialog} aria-labelledby="local-account-title">
        <h2 id="local-account-title" className={styles.heading}>Tài khoản cục bộ</h2>
        <p>Đây là bản chạy cục bộ, chưa có tài khoản trên máy chủ. Chức năng xóa tài khoản sẽ được kết nối khi có hệ thống tài khoản. Hồ sơ và tài liệu học tập trên thiết bị vẫn được giữ nguyên.</p>
        <form method="dialog"><button className={styles.saveButton} type="submit">Đã hiểu</button></form>
      </dialog>
    </div>
  );
}
