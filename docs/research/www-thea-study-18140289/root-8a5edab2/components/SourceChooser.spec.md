# Source chooser refinement — 2026-10-04

Source: authenticated Thea /study/1285146255, reached from homepage create.
Destination: existing INS /study/:id ImportDialog; preserve React/Vite and local imports.
Interaction: click driven. Create opens empty kit directly with source chooser. Initial row: Tải lên (Tải lên các tệp của bạn), YouTube (Dán liên kết video), Dán (Dán ghi chú hoặc thuật ngữ của bạn). Tải lên badge Được khuyến nghị. Thêm reveals Kết hợp (Thêm tài liệu từ các bộ học liệu của bạn), Danh mục (Các bộ học liệu được chọn lọc cho AP, IB và A-levels), Mô tả (Hãy cho INS biết bạn đang học gì).

Computed source styles: modal width 686px, background #eef1f9, text #120537, radius8, padding16px16px0. Heading24/36 regular DM Sans, header48px padding4px24px4px4px. Desktop grid 3x208px gap15px; tiles208px square, border1.6px #1f184b radius10 padding10. Icon48px with22px top padding, title20/30 regular, description12.8/19.2. Badge11.2/16.8 padding5 background#1f184b text#dadfed radius0 0 10 10. At390 viewport grid single320px column; tile128px high; row icon40px width50 and text beside, contentpadding-left15px. Full expanded row 431px high desktop. More button outlined fullwidth pill. Use existing design tokens and bundled FA fonts. No new images.

Implement local combine from saved workspaces and explicitly labeled mock catalog; keep upload, pasted transcript, paste, mock topic flows and validation. Back returns chooser. No remote AI claims. Native dialog handles Escape and focus restoration. No hidden-state extraction.
