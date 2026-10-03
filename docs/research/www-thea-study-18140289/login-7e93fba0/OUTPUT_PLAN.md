# Thea login clone

Source: https://www.thea.study/login
Application root: P:/DATN/Frontend (previously rules only; no existing routes).
Route: /login; / redirects to /login. Related demo auth states at /register and /forgot-password.
Site key: www-thea-study-18140289; page key: login-7e93fba0.
Components: src/components/sites/www-thea-study-18140289/login-7e93fba0/.
Assets: public/sites/www-thea-study-18140289/login-7e93fba0/.
Research: this directory. References: docs/design-references/www-thea-study-18140289/login-7e93fba0/.
Foundation: new package.json, TypeScript config, app layout and global design tokens. Existing rule files preserved.
User requested creating the project, so scaffold creation is authorized. Use project-required CSS Modules instead of the skill's assumed Tailwind/shadcn template. Exact source styling overrides generic palette/spacing/font defaults for this clone.
Authentication is a local demonstration; no credentials are transmitted or persisted. Informational links lead to original public pages.
