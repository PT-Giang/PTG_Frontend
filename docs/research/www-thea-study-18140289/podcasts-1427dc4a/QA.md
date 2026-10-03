# Plus upgrade QA — 2026-09-23

Implemented three shared components (PlusButton, PlusPlanCard, PlusUpgradeDialog), three original SVG assets, two integration points: ProfileOverview and Podcast in GuideView. Source https://www.thea.study/podcasts/1259928495 maps to existing local /podcasts/[id]; the ID must reference a local study kit. Source-only IDs correctly show the existing missing-kit screen. /profile opens the same dialog.

CUA verified:
- Profile trigger opens dialog with annual selected.
- Monthly selection and upgrade CTA display correct local-only 169.999 ₫/month notice.
- Radio arrow keyboard selects monthly.
- Escape closes, returns focus to trigger, restores body overflow.
- Close button and backdrop click close dialog.
- Podcast invitation opens shared dialog even for an empty existing kit; local reading stays available in its disclosure.
- Desktop 1440px, tablet 768px, mobile 390px: dialog does not overflow horizontally; mobile stacks cards and uses a bottom sheet. All dialog images loaded.
- No browser console errors during QA.
- npm test: 17/17 passed. npm run build passed after integration; final build rerun after title wrapping adjustment.

Source assets/styles and desktop/mobile screenshots were inspected in browser. Screenshot output was inline only; no saved screenshot files claimed. Reference UI price/badge text is a snapshot, not independently calculated or a live offer. Original decorative star animation is approximated, with reduced-motion support. Mock checkout is intentionally different: no real transaction, no entitlement change. Existing local material/profile data was not edited in QA.
