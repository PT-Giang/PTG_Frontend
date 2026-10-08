# Homepage and material creation refinement

## Scope and mapping
- Source https://www.thea.study/ → existing local /.
- Source create action → existing local /study/:id, opening ImportDialog once via router state.
- React 19, Vite, React Router, CSS Modules and INS branding retained. No database/backend changes.
- Existing routes, local material IDs and workspace storage retained.

## Delivered
- Direct empty-kit creation followed by a three-tile source chooser; More reveals three additional sources.
- Upload, pasted YouTube transcript, notes and mock topic lessons retained.
- Combine previews and copies a saved local document; catalog supplies explicitly labeled sample content.
- Shared class search/create picker on home cards and study metadata.
- Inline class rename with collision validation; palette and custom hex color selection update every class member, including deleted materials.
- Class grouping preference persists; unclassified materials shown last. Legacy materials without dates appear under Trước đây.
- Failed reads do not overwrite stored material data; failed home writes show a visible message.
- Class links explicitly state their browser-only scope.

## Artifacts
Five new UI components: SourceChooser, LocalSourcePanel, ClassPicker, ClassHeader, ClassColorDialog.
Two grouped specifications: components/SourceChooser.spec.md and components/ClassControls.spec.md.
No downloaded assets; existing icon fonts and INS branding reused.
Screenshots: docs/design-references/www-thea-study-18140289/root-8a5edab2/ins-{create,home}-{desktop,mobile}.jpg.

## Validation
- npm run build: passed (TypeScript and Vite).
- npm test: 20 passed; added class-rename preservation/collision, unclassified-name collision, legacy-date and color validation checks.
- npm run test:routes: 18 SSR route checks passed.
- Browser: create → chooser → paste → save; one document and two flashcards created.
- Browser: class create, rename, palette selection, saved group preference and persisted data after reload.
- Browser: move picker, class share notice, combine preview, catalog preview, topic mock generation, source back navigation.
- Source chooser verified at 390, 768 and 1440px without horizontal overflow; home verified at 390 and 1440px.
- Vite dev module cache briefly served a missing default export after live editing; restarting the dev server restored correct loading. Production build and subsequent reload passed. No code workaround added.

## Known differences and boundaries
- Custom color uses the browser's native color control, not Thea's saturation/hue widget.
- Source editors retain the existing local implementation; this is not an assertion that every nested Thea screen is pixel-identical.
- Catalog is a local sample; YouTube requires pasted transcript; AI and cross-device sharing remain disconnected.
- Existing cards retain their local icon/class caption rather than Thea's server-generated icons and remote progress presentation.
- Testing left one clearly named local kit INS — Kiểm thử tạo học liệu in INS — Lớp mẫu.
- Inspecting the real create action created one empty kit 1285146255 on Thea. No existing remote content was changed or deleted.
