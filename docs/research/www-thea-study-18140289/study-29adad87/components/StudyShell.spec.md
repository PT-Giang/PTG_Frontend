# StudyShell

Client controller wraps shared HomeHeader and footer. Reuse original logo/avatar/fonts. Header61px fixed; study variant Chia sẻ replaces Mời. Sidebar width200px bg#e4e8f3, border right dawn; source CSS sticky top61px, icons25.6px, padding top12; nav links text16px hover transform translateY(-4px) .2s/color .2s, active primary. Collapse makes icon-only local width64. Content16px top/side padding, min-width0. <=800px min-height450 shell bottom nav; mobile icons24px text10px line10; active primary. Source bottom bar sticky with background nav and shadow, local fixed version reserves64px to avoid obstruction. Source sidebar and bottom-nav asset SVGs recovered in namespace.

Routes and state in OUTPUT_PLAN.md. Error/loading/missing/deleted materials have explicit states and home link; no imaginary remote data. Save failures visible and offer export. Existing header themes reused via home page scope. Each page view shares StudyViewProps; repository owns local storage.
