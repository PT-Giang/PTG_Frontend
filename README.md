# INS — React + Vite frontend

React 19 / Vite / React Router / TypeScript / CSS Modules. INS uses a swallow logo and locally hosted DM Sans.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000/ for the home dashboard, or http://localhost:3000/login for the unchanged login clone. `/register` and `/forgot-password` provide supporting demo flows.

```sh
npm run typecheck
npm test
npm run build
npm start
```

## Scope

Responsive login interface, native form validation, remember toggle, provider feedback, registration email form, password visibility, and recovery form. The Vietnamese home dashboard supports search, date/class/no grouping, create/rename/move class/delete/restore, a local dark theme, account menu, invite/share dialogs, and feedback demo. Creating or opening a material now opens its study workspace.

Local study routes: `/study/[id]`, `/memorize/[id]/list`, `/memorize/[id]/flashcards`, `/memorize/[id]/games`, `/smartStudy/[id]`, `/test/[id]`, `/studyGuides/[id]`, `/summaries/[id]`, `/podcasts/[id]`.

- Import PDF with selectable text, DOCX, TXT, Markdown, CSV/TSV or paste notes. Files stay on the device; 10 MB / 300 PDF pages / 500,000 extracted characters limit. Scans, images, audio and YouTube need pasted text/transcripts. PDF worker is copied locally by `postinstall`.
- **Mô tả kiến thức muốn học**: enter a topic and preview an editable mock lesson. Five predefined topics (JavaScript, English basics, plant biology, derivatives, study skills); unmatched topics get an explicitly generic study outline. No internet research or AI is simulated as real. Replace `src/study/topicLessons.ts` with a research provider later.
- Explicit `Term: Definition`, tab-separated or spaced dash pairs generate editable cards. Prose remains readable without inventing facts; add terms manually when needed.
- Flashcards, local progress levels, matching game, practice questions, timed quizzes with answer review/history. Short answers require the correct term, ignoring case and excess whitespace but preserving Vietnamese accents/punctuation.
- Editable guide, extractive summary, keyword passage retrieval with document titles. Browser read-aloud requires an installed local voice; this is not a generated podcast.

Home metadata uses `thea-home-demo-v1`; workspaces use `thea-study-v1:{id}`. Data persists in this browser, with JSON/text export and visible save errors. Links require the material to exist in the receiving browser; they do not upload or share data remotely. Active quiz answers and current study rounds are transient; completed scores and progress persist. Profile pages, authentication, OAuth, CAPTCHA, email delivery, AI and database are not connected. No entered credentials are stored or transmitted. Public informational links open original Thea pages.

Source measurements/specifications: `docs/research/www-thea-study-18140289/login-7e93fba0/`. Visual references are inline screenshots in the creation task. Original assets remain owned by their respective owners.

Study workflow implementation and QA report: `docs/research/www-thea-study-18140289/study-29adad87/QA.md`. Tests cover extraction, retrieval, scoring, malformed local data and mock topics without additional test dependencies.

## Local profile

`/profile`, `/profile/edit`, `/profile/activity` are connected from the account menu. Name, preferred language, role, school, education and avatar persist under `thea-profile-v1`; name/avatar update across headers and browser tabs. Uses 70 original avatar SVGs with 12 available in the local demo. Profile identity starts with generic sample values, not source account details. Activity reads active local materials, practice totals and completed quizzes. Server daily challenges, reward unlocking, account deletion, payments, email identity and automatic translation remain unconnected. Profile verification: `docs/research/www-thea-study-18140289/profile-55d68502/QA.md`.

## Runtime and deployment

Use Node.js 22.12+ (verified locally with 22.14). Development and preview both use http://localhost:3000 with strict port checking to preserve the existing browser storage origin. Stop another server on that port before starting Vite.

`npm run build` runs TypeScript checks and outputs `dist/`. `npm start` / `npm run preview` are for local production preview only. Deploy `dist/` on a static host configured to rewrite application routes to `/index.html`; otherwise refreshing `/study/:id` or `/profile/edit` will return a server 404. Keep asset/file requests served normally. Unknown app paths show the client-side 404 page (the SPA host may return HTTP 200).

Frontend variables use `import.meta.env.VITE_*` and are public. Database credentials and AI keys belong to a separate backend. PostgreSQL design is independent of this framework migration and is not implemented here.

Migration notes and rollback: `docs/migrations/react-vite.md`.
