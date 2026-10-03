# INS: Next.js to React + Vite

User-approved framework replacement. React 19, TypeScript, CSS Modules, local data keys, public assets and all existing page paths remain. The earlier Next.js requirements in project rules are superseded by this explicit request; other engineering rules remain applicable.

## Implementation
- `index.html` and `src/main.tsx` bootstrap a BrowserRouter application.
- `src/app/App.tsx` declares the route inventory; StudyRoute validates memorize modes and remounts the workspace when route identity changes.
- React Router Link/useNavigate replace Next navigation. Forgot-password retains its email query parameter.
- Native images retain original dimensions and alt text; priority logos use fetchPriority. Local DM Sans is loaded with CSS @font-face.
- React 19 title elements replace Next metadata. Routes are split with lazy imports.
- Next route wrappers/configuration/dependency are removed. Feature components and local repositories are retained.
- No database, authentication, AI, payment or SSR service is introduced.

## Routes
`/`, `/login`, `/register`, `/forgot-password`, `/profile`, `/profile/edit`, `/profile/activity`, `/study/:id`, `/smartStudy/:id`, `/studyGuides/:id`, `/summaries/:id`, `/podcasts/:id`, `/test/:id`, `/memorize/:id/list`, `/memorize/:id/flashcards`, `/memorize/:id/games`.

Invalid paths and invalid memorize modes render a not-found page. Missing local material IDs render the existing missing-workspace state.

## Run/deploy
Run `npm install`, `npm run dev`. Build with `npm run build`; preview with `npm start`. Keep http://localhost:3000 to retain browser localStorage. A different host, scheme or port has separate storage. Production hosting must serve dist assets and provide index.html fallback for application paths. Vite preview is not a production application server.

## Rollback
`migration-next-backup.zip` contains the pre-migration source and package/config files. Stop Vite, extract the archive into a separate recovery directory, then run npm install there before verifying Next. Do not extract over current work without reviewing subsequent changes. Browser data was not migrated or deleted.

## References
- https://vite.dev/guide/
- https://reactrouter.com/start/declarative/installation

## Verification
Production build (Vite 8.3.2) and TypeScript passed. Study service suite: 17 tests passed. `npm run test:routes`: 18 real route-tree render checks passed, including recovery email query and invalid paths/memorize modes. HTTP checks confirmed all 16 supported route variants receive the Vite entry page. These checks do not substitute for browser interactions. Browser automation initialization failed with a missing kernel-assets path; visual browser verification is unavailable until the local browser tool is repaired.
