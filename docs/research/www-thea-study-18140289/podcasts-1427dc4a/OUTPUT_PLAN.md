# Plus upgrade UI

Source: https://www.thea.study/podcasts/1259928495 (observed 2026-09-22). Shared-link query does not affect the upgrade UI and is not persisted.
App root: P:/DATN/Frontend. Site: www-thea-study-18140289. Page: podcasts-1427dc4a (SHA-256 of /podcasts/[id]).
Existing routes /profile and /podcasts/[id] are updated under the user's explicit request. All other routes remain. Shared components: src/components/sites/www-thea-study-18140289/shared/{PlusButton,PlusUpgradeDialog,PlusPlanCard}. Shared assets: public/sites/www-thea-study-18140289/shared/plus/. Research and screenshot-reference roots use this page namespace. No global foundation changes needed; existing DM Sans and colors retained; additional source colors scoped as Plus tokens.

Profile's existing Plus placeholder opens the reusable dialog. Podcast gains the observed upgrade invitation; local ReadAloud remains below as a clearly named local alternative. No payment calls or entitlement mutation. CTA displays a local plan confirmation/checkout-unavailable state.

## Topology and behavior
Podcast tabs -> centered invitation -> Plus button. Dialog: close, original Plus logo, subtitle, annual/monthly radios, seven benefits, upgrade CTA, terms link. Click driven. Annual selected initially. Card hover translates -4px with 300ms shadow transition. Features translate 4px on hover. Desktop centered 720px panel, padding32, gradient135deg #eef1f9 -> #e6d9f2 at60% -> #cb9ce7. Mobile <=600 uses bottom drawer, padding8vw, scroll, stacked plans. Native dialog adds keyboard escape, focus containment and restoration. Reduced-motion disables animations.
Screenshots inspected inline via CUA; tool did not expose screenshot-file export. Browser automation had intermittent click/CDP timeouts on reference plan selection; checked styles verified from original CSS.
