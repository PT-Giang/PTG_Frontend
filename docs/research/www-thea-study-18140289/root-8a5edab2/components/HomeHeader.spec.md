# HomeHeader
Target HomeHeader/HomeHeader.tsx and HomeHeader.module.css under page component namespace.
Header fixed top0 width100% height61px; background#e4e8f3 bottom1px#dadfed. Flex space-between.
Logo link / padded0 15px, image125x28.95; original logo.svg. Mobile small quill.svg 35x40.
Right dark pill buttons Mời and Phản hồi,40px high,margin-top10px,padding6px12px,radius50px,font16/24 regular,color#dadfed,background#1f184b,gap10px. Paper-plane regular glyph f1d8 and comment-dots regular f4ad;icon20px gap4px.
Avatar button50x50 at top5,right19; avatar.svg40x40 circular border2px background. Crown level badge above (gold#fdbd19 font12 bold), tiny red notification dot.
Mobile <=600px: icon-only transparent invite/feedback buttons, quill logo. Avatar remains.
Dropdown: anchored right16px below header; background#dadfed radius10; profile header avatar + generic demo name Học sinh; items Hồ sơ của tôi, Thành tựu, Chế độ tối, Thay đổi ngôn ngữ, Thông báo, Trung tâm trợ giúp, Đăng xuất. Informational items invoke onAction; logout Link /login; help external Discord.
Props onAction(action: string):void, isDark:boolean, onToggleTheme():void. Invite action invite, feedback feedback; other unavailable local actions pass label. Don't implement modals here.
Use HomeIcon component ../HomeIcon/HomeIcon with props name:string, variant?:solid|regular|brands, className?:string. Parent provides icons and home theme tokens --home-nav,--home-menu,--home-gold,--home-notification and existing global tokens.
Dismiss menu outside click or Escape. aria-expanded, accessible buttons and Next Image/Link. Hover buttons translateY(-2px),.3s. Focus outline primary.
Screenshots inspected inline desktop1440x900/mobile390x844. No filesystem screenshot API.
