# Observed behaviors and demo boundaries
Inspected desktop 1440x900, tablet768x1024, mobile390x844 via browser.
Sign up switches to /register. Initial registration offers Google, Apple, and email. Email option reveals name/email/password (12 characters minimum), password visibility toggle, reCAPTCHA, agreement, Register, and return link.
Local implementation preserves switching, validation, password visibility, and return navigation. Real reCAPTCHA and account creation are not connected.
Remember me is initially checked and can be toggled. Email/password use browser required/email validation. No external login attempts were submitted.
Provider buttons rise 2px on hover/focus with .3s transform transition. Primary/alternate buttons also rise2px; background changes on hover. Link hover changes to primary-hover. Values verified from original downloaded CSS, not physical hover simulation.
Forgot-password target observed through DOM and direct navigation. Original copy: Enter your email to get a password reset link / Email password reset link / Remembered? Sign in. Related local route is a supporting demo, not a fully extracted clone.
Informational links retain original external destinations. OAuth buttons explain that the integration is not connected. No passwords or email addresses are persisted or sent.
Mobile wave follows original clip polygon and 14s animation, with reduced-motion support added. Breakpoints:750px for mobile; tab font13px at<=875px,16px at<=750px,13px at<=400px.
