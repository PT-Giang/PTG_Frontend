import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import SocialButtons from "../SocialButtons/SocialButtons";
import styles from "./AuthPanel.module.css";
interface AuthPanelProps { mode?: "login" | "register" | "forgot"; initialEmail?: string }
export default function AuthPanel({ mode = "login", initialEmail = "" }: AuthPanelProps) {
  const [email, setEmail] = useState(initialEmail);
  const [emailSignup, setEmailSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const isRegister = mode === "register";
  const isForgot = mode === "forgot";
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(isForgot ? "Demo mode: no reset email was sent. Connect an email service to enable password recovery." : isRegister ? "Demo mode: your form is valid. Account creation will be available when a backend is connected." : "Demo mode: your form is valid. Connect an authentication service to sign in.");
  }
  function handleProvider(provider: string) { setMessage(`${provider} sign-in is not connected in this demo.`); }
  return <div className={styles.wrapper}>
    <nav className={styles.tabs} aria-label="Authentication">
      <Link to="/login" className={!isRegister ? styles.active : undefined} aria-current={!isRegister ? "page" : undefined}>Sign in</Link>
      <Link to="/register" className={isRegister ? styles.active : undefined} aria-current={isRegister ? "page" : undefined}>Sign up</Link>
    </nav>
    <div className={styles.card}>
      {isForgot ? <><h1 className={styles.heading}>Forgot password?</h1><p className={styles.description}>Enter your email to reset your password.</p></> : !emailSignup ? <SocialButtons isRegister={isRegister} onSelect={handleProvider} /> : <button type="button" className={styles.back} onClick={() => {setEmailSignup(false); setMessage("");}}>← Try another method</button>}
      {!isRegister && !isForgot && <div className={styles.divider}><span>or</span></div>}
      {isRegister && !emailSignup ? <button className={styles.emailButton} type="button" onClick={() => setEmailSignup(true)}>✉ <span>Sign up with email</span></button> : <form onSubmit={handleSubmit}>
        {isRegister && <div className={styles.group}><label className={styles.label} htmlFor="name">Name</label><input className={styles.input} id="name" name="name" autoComplete="name" required maxLength={255} /></div>}
        <div className={styles.group}>
          {isRegister && <label className={styles.label} htmlFor="email">Email</label>}
          <input className={styles.input} id="email" name="email" type="email" placeholder={isRegister ? undefined : "Email"} aria-label="Email" autoComplete="email" required maxLength={255} value={email} onChange={event => setEmail(event.target.value)} />
        </div>
        {!isForgot && <div className={styles.group}>
          {isRegister && <><label className={styles.label} htmlFor="password">Password</label><small>Must be at least 12 characters</small></>}
          <div className={styles.password}>
            <input className={styles.input} id="password" name="password" type={showPassword ? "text" : "password"} placeholder={isRegister ? undefined : "Password"} aria-label="Password" autoComplete={isRegister ? "new-password" : "current-password"} required minLength={isRegister ? 12 : undefined} maxLength={255} />
            {isRegister && <button type="button" className={styles.reveal} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button>}
          </div>
        </div>}
        {!isRegister && !isForgot && <div className={`${styles.group} ${styles.options}`}>
          <label className={styles.remember}><input type="checkbox" name="remember" defaultChecked /> <span>Remember me</span></label>
          <Link to={`/forgot-password?email=${encodeURIComponent(email)}`}>Forgot password?</Link>
        </div>}
        {isRegister && <label className={`${styles.group} ${styles.agreement}`}><input type="checkbox" required /> <span>I have read the reference <a href="https://www.thea.study/termsOfService" target="_blank" rel="noopener noreferrer">terms of service</a>, <a href="https://www.thea.study/privacyPolicy" target="_blank" rel="noopener noreferrer">privacy policy</a> and cookie usage.</span></label>}
        <div className={styles.group}>
          <button type="submit" className={styles.primary}>{isForgot ? "Send reset link" : isRegister ? "Register" : "Sign in"}</button>
          {!isRegister && !isForgot && <div className={styles.disclaimer}>Reference policies from Thea: <a href="https://www.thea.study/termsOfService" target="_blank" rel="noopener noreferrer">terms of service</a>, <a href="https://www.thea.study/privacyPolicy" target="_blank" rel="noopener noreferrer">privacy policy</a> and cookie usage.</div>}
        </div>
      </form>}
      {message && <p className={styles.message} role="status">{message}</p>}
      {isRegister ? <p className={styles.already}>Already have an account? <Link to="/login">Sign in</Link></p> : isForgot ? <Link className={`${styles.alternate} ${styles.group}`} to="/login">Back to sign in</Link> : <Link className={`${styles.alternate} ${styles.group}`} to="/register">Create a free account</Link>}
    </div>
  </div>;
}
