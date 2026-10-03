# BrandPanel
Target: src/components/sites/www-thea-study-18140289/login-7e93fba0/BrandPanel/BrandPanel.tsx and .module.css.
Static brand panel; source screenshots captured in conversation at 1440x900 and 390x844.
DOM: aside > external logo link + slogan + nav of three external links.
Computed desktop styles: panel width 500px, height 80vh max 800px, margin 16px; padding 16px; radius 24px; background #1f184b; display flex column; justify-content space-around; align-items center.
Logo actual SVG at /sites/www-thea-study-18140289/login-7e93fba0/logo-vertical.svg; width 250px, intrinsic ratio 250:253.75; use Next Image.
Slogan: ai-powered, student-approved; DM Sans 24px, weight 600, line-height 36px, centered, #dadfed.
Nav: width 100%, display flex, align-items center, justify-content space-evenly. Links DM Sans 16px/24px weight 400, underline, #dadfed.
Links: About -> https://www.theastudy.com/?referralCode=Web-Platform; Testimonials -> https://www.thea.study/testimonials; Contact -> https://www.thea.study/contactUs. Open in new tab with noopener noreferrer.
Logo href same as About.
Responsive: hide entire panel at max-width 750px. Above that width allow flex shrink as original.
Focus-visible: 2px dawn outline, offset 2px. No other special states or animations; no stateful content.
Use global --night and --dawn tokens. Parent owns outer page positioning.
