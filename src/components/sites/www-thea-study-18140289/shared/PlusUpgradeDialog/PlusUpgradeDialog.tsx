
import { useEffect, useId, useRef, useState } from "react";
import PlusButton from "../PlusButton/PlusButton";
import PlusPlanCard from "../PlusPlanCard/PlusPlanCard";
import styles from "./PlusUpgradeDialog.module.css";

interface PlusUpgradeDialogProps { onClose(): void }

const benefits = [
  "Câu hỏi không giới hạn",
  "Bài kiểm tra thực hành không giới hạn & dài hơn",
  "Lịch sử câu hỏi đầy đủ",
  "Podcast",
  "Hỏi INS về tài liệu của bạn",
  "Chỉnh sửa thông minh (Hướng dẫn học tập)",
  "Truy cập mọi nơi bạn sử dụng INS – web, Android và iOS",
];

export default function PlusUpgradeDialog({ onClose }: PlusUpgradeDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const [plan, setPlan] = useState<"annual" | "monthly">("annual");
  const [checkout, setCheckout] = useState(false);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const element = dialog.current;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  function selectPlan(nextPlan: "annual" | "monthly") { setPlan(nextPlan); setCheckout(false); }

  return <dialog ref={dialog} className={styles.dialog} aria-labelledby={headingId}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}>
    <button type="button" className={styles.close} aria-label="Đóng nâng cấp INS+" onClick={onClose}>×</button>
    <div className={styles.content}>
      <header className={styles.header}>
        <img className={styles.logo} src="/brand/ins-plus.svg" alt="INS+" width={150} height={40} />
        <h2 id={headingId}>Nâng cao việc học của bạn với INS+</h2>
      </header>
      <fieldset className={styles.plans}>
        <legend className={styles.srOnly}>Chọn gói INS+</legend>
        <PlusPlanCard plan="annual" selected={plan === "annual"} onSelect={selectPlan} />
        <PlusPlanCard plan="monthly" selected={plan === "monthly"} onSelect={selectPlan} />
      </fieldset>
      <ul className={styles.benefits}>{benefits.map(benefit => <li key={benefit}><span aria-hidden="true">✓</span>{benefit}</li>)}</ul>
      <div className={styles.purchase}>
        <PlusButton onClick={() => setCheckout(true)}>Nâng cấp lên INS+</PlusButton>
        <p className={styles.terms}><a href="https://www.thea.study/termsOfService" target="_blank" rel="noreferrer">Tham khảo điều khoản dịch vụ của Thea</a></p>
        <p className={styles.demo}>Bản trải nghiệm giao diện · Chưa kết nối thanh toán</p>
      </div>
      {checkout && <div className={styles.notice} role="status">
        <strong>Đã chọn gói {plan === "annual" ? "hàng năm — 679.999 ₫/năm" : "hàng tháng — 169.999 ₫/tháng"}</strong>
        <p>Đây là bản mô phỏng. Chưa có khoản phí nào được thu và tài khoản vẫn dùng gói miễn phí.</p>
        <button type="button" onClick={onClose}>Đã hiểu</button>
      </div>}
    </div>
  </dialog>;
}
