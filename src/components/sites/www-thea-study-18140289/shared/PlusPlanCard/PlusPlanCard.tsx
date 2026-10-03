import styles from "./PlusPlanCard.module.css";

interface PlusPlanCardProps {
  plan: "annual" | "monthly";
  selected: boolean;
  onSelect: (plan: "annual" | "monthly") => void;
}

export default function PlusPlanCard({ plan, selected, onSelect }: PlusPlanCardProps) {
  const isAnnual = plan === "annual";

  return (
    <label className={`${styles.card} ${selected ? styles.selected : ""}`}>
      <input
        className={styles.radio}
        type="radio"
        name="thea-plus-plan"
        value={plan}
        checked={selected}
        onChange={() => onSelect(plan)}
      />
      <span className={styles.header}>
        <span className={styles.title}>{isAnnual ? "Hàng năm" : "Hàng tháng"}</span>
        {isAnnual && <span className={styles.savings}>Tiết kiệm 67%</span>}
      </span>
      <span className={styles.content}>
        <span className={styles.priceLine}>
          <span className={styles.price}>{isAnnual ? "679.999 ₫" : "169.999 ₫"}</span>
          <span className={styles.cadence}>{isAnnual ? "/năm" : "/tháng"}</span>
        </span>
        {isAnnual && <span className={styles.billing}>12 tháng với 56.667 ₫/tháng</span>}
      </span>
      {selected && <span className={styles.check} aria-hidden="true">✓</span>}
    </label>
  );
}
