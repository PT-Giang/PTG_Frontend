import styles from "./SocialButtons.module.css";
interface SocialButtonsProps { isRegister?: boolean; onSelect: (provider: string) => void }
export default function SocialButtons({ isRegister = false, onSelect }: SocialButtonsProps) {
  return <div className={styles.buttons}>{["Google", "Apple"].map(provider => <button className={styles.button} type="button" key={provider} onClick={() => onSelect(provider)}>
    <img src={`/sites/www-thea-study-18140289/login-7e93fba0/${provider === "Google" ? "google.png" : "apple.svg"}`} alt="" width={provider === "Google" ? 18 : 20} height={provider === "Google" ? 18 : 20} />
    <span>Sign {isRegister ? "up" : "in"} with {provider}</span>
  </button>)}</div>;
}
