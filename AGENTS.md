# Project instructions

## Framework migration override (user approved, 2026-10-01)

The frontend now uses React 19 + Vite + React Router, TypeScript and CSS Modules. This overrides the Next.js-specific requirements below and in `.agents/RULE.md`. Use React Router Link/useNavigate, native img elements, CSS font loading and client-side route components. Do not reintroduce Next.js. All unrelated engineering rules still apply.

Read and follow `.agents/RULE.md` before implementing or reviewing changes in this project. That file is the source of truth for the frontend engineering rules; read its current contents rather than relying on earlier conversation summaries.

Key requirements:
- Use Next.js 16.1, React 19, TypeScript, and CSS Modules.
- Do not use Tailwind CSS, SCSS/SASS, CSS-in-JS, or the UI frameworks prohibited in `.agents/RULE.md`. Inline styles are only allowed for genuinely necessary dynamic styles.
- Organize code by feature. Give each component its own folder and CSS Module. Create abstractions only when at least two usages justify them.
- Use named default function components, interfaces for props, and meaningful names. Do not use `any`, `ts-ignore`, or `eslint-disable`.
- Keep components within 250 lines and CSS files within 200 lines.
- Use the defined color tokens, the documented 8-point spacing system, and a clean, minimal enterprise design.
- Build desktop-first responsive layouts with CSS and preserve semantic HTML and accessibility.
- Prefer Server Components; use client components and state only when necessary. Use Next.js Image and Link for their intended purposes.
- Keep API calls in a dedicated service/repository/API layer and handle loading, empty, and error states, with retry when appropriate.
- Favor readability, maintainability, simplicity, and complete implementations. Avoid duplication and premature optimization.

Do not restore or apply rules from removed files based on conversation history. In particular, `.agents/rules/project-architecture.md` is no longer present; its former VIX-specific architecture and 2px spacing restriction are not current project requirements.

Explicit user instructions take precedence over these project rules.
