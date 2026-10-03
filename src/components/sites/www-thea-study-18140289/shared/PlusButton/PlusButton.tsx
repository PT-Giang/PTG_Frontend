import styles from "./PlusButton.module.css";

interface PlusButtonProps {
  children?: string;
  onClick(): void;
}

export default function PlusButton({ children = "Nhận INS+", onClick }: PlusButtonProps) {
  return <button className={styles.button} type="button" onClick={onClick}>
    <span className={styles.label}>{children}</span>
    <span className={styles.stars} aria-hidden="true">
      {["blue", "lavender"].map(color => <span className={color === "blue" ? styles.foreground : styles.background} key={color}>
        {[styles.topLeft, styles.topRight, styles.bottomLeft, styles.bottomRight].map(position =>
          <img key={position} className={`${styles.star} ${position}`} src={`/sites/www-thea-study-18140289/shared/plus/star-${color}.svg`} alt="" width={30} height={30} />)}
      </span>)}
    </span>
  </button>;
}
