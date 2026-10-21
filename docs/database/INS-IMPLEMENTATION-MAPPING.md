# INS — Đối chiếu hiện trạng và schema đích

**Cập nhật:** 2026-10-12  
**Nguồn đích:** [Kế hoạch database 22 bảng](./INS-MINIMAL-DATABASE-PLAN.md) và [Data contract](../contracts/INS-DATA-CONTRACT.md).  
**Phạm vi:** kiểm kê và kế hoạch backfill. Schema nền, seed gói, schema mission/avatar/XP, bảy bảng output typed, source/session snapshots và backfill legacy được gộp trong migration khởi tạo V1 (`V1__ins_initial_database.sql`) vì database thật chưa được khởi tạo. V1 đã được kiểm tra trên PostgreSQL 16 dùng database/container tạm; chưa ghi lên database thật.

## Hiện trạng theo từng phần

| Phần | Hiện có | Khoảng trống so với thiết kế đích |
|---|---|---|
| Spring Boot Backend | Flyway migration khởi tạo V1; auth cookie JWT; API lớp, học liệu, tài liệu, terms/flashcard và review progress; PostgreSQL access dùng `JdbcTemplate` ở study endpoints | Chưa có typed output repositories, quiz/session/chat/share/missions/profile APIs; schema khởi tạo vẫn giữ `terms`, `term_progress`, `learning_artifacts`, `artifact_sources` và các bảng con session cũ để đối chiếu |
| AI_Backend | FastAPI routes sinh summary, study guide, flashcards, study questions, quiz; chat SSE `start`/`delta`/`done`/`error`; Pydantic models đặt field snake_case | Không lưu PostgreSQL; chưa trả event/metadata nguồn có cấu trúc cho chat; chưa có podcast route trong các controller đã kiểm kê; API hiện dùng `course_id` tự do |
| Frontend | API auth client; một số luồng lớp/học liệu/học tập/hồ sơ đọc và ghi localStorage | Các feature chưa chuyển API; profile hiện có field demo; avatar lưu path ảnh thay vì `avatarId`; dữ liệu home/workspace/profile là demo và sẽ bỏ sau cutover |

## Ánh xạ schema legacy (V1/V2 trước khi gộp) sang 22 bảng đích

| Nguồn hiện tại | Đích | Xử lý dự kiến |
|---|---|---|
| `users` | `users` | Giữ user/auth; thêm `avatar_id`, `experience_points`. Đổi `avatar_url` sang `avatar_id` bằng allowlist mã avatar; URL không nhận diện được dùng avatar mặc định. Giữ level hiện tại trong backfill, quy tắc quy đổi XP/level cần chốt trước khi bật thưởng. |
| `classes` | `classes` | Giữ; owner/name constraints tiếp tục áp dụng. |
| `study_materials` | `study_materials` | Giữ; `deleted_at` đã có trong V1; thêm trạng thái cleanup vector nếu chưa có cơ chế retry bền. |
| `documents` | `documents` | Giữ nội dung/metadata hiện có; chuyển `file_path` sang storage key nếu đang trỏ đường dẫn máy; bổ sung quan hệ `document_id` cho Qdrant/source. |
| `generation_jobs` | `generation_jobs` | Giữ job; migration khởi tạo bắt đầu từ cấu trúc legacy rồi mở rộng danh sách `job_type`, fingerprint/metadata và trạng thái theo contract. |
| `generation_sources` | `generation_sources` | Giữ và mở rộng `job_id` thành quan hệ job chuẩn; bổ sung `message_id`, `document_id`, `source_type` để citations/source có thể truy vấn riêng. Cần xác nhận trước cách migrate nguồn cũ không có URL hoặc excerpt. |
| `learning_artifacts` loại `summary` | `course_summaries` | Chuyển cùng UUID, job, phiên bản và origin khi `content` là JSON có `overview` cùng mảng chuỗi `key_points`/`keyPoints`; dữ liệu lỗi giữ ở bảng legacy. |
| `learning_artifacts` loại `guide` | `study_guides` | Chuyển cùng UUID, job, phiên bản và origin khi JSON có mảng chuỗi `steps` và `tips`; dữ liệu sai cấu trúc giữ legacy. |
| `learning_artifacts` loại `podcast` | `podcasts` | Chuyển script, `audio_path` sang `audio_key`, version và ownership; script lấy từ JSON `script` nếu có, còn lại giữ nguyên content. Podcast vẫn riêng tư và không bao giờ được share. |
| `artifact_sources` có artifact gắn job | `generation_sources` | Chuyển liên kết document theo cặp job/document; giữ nguyên `artifact_sources` trong giai đoạn đối chiếu. |
| `artifact_sources` có artifact không gắn job | `artifact_sources` (legacy) | Không tự tạo job lịch sử; giữ quan hệ chính xác ở bảng nguồn để đối chiếu đến khi có chính sách mapping phù hợp. |
| `terms` | `flashcard_sets` + `flashcards` | Tạo set theo material; mỗi term thành một card, map `term` → `front`, `definition` → `back`, `document_id`/thứ tự được giữ. |
| `term_progress` | `flashcards` | Chuyển progress của owner material sang từng card. Dữ liệu user không sở hữu material không được chuyển vào tiến độ của owner; báo cáo các hàng orphan/không khớp để xử lý. |
| `study_settings` | `study_settings` | Giữ; chuẩn hóa question type cũ (`choice`/`short`) qua adapter hoặc migration khi hợp đồng mới đã được áp dụng. |
| `study_sessions` + `session_questions` | `study_sessions` + `session_questions` | Giữ phiên; thêm JSON snapshots/response/result/feedback vào `session_questions`. |
| `question_options` | `session_questions.question_snapshot` | Gộp options theo `position` thành snapshot JSONB, giữ thứ tự. |
| `question_responses` | `session_questions.response`, `result`, `answered_at`, `duration_ms` | Gộp response vào đúng câu; không làm thay đổi kết quả cũ. |
| `question_feedback` | `session_questions.feedback_rating`, `feedback_text` | Gộp feedback; nếu có nhiều bản ghi/phiên bản ngoài giả định hiện tại thì báo cáo thay vì ghi đè. |
| `legacy_progress_baselines` | Không có bảng đích | Đối chiếu/xuất báo cáo trước; chỉ bỏ ở migration dọn schema theo quyết định của plan, không tạo lịch sử giả. |
| `conversations`, `messages` | `conversations`, `messages` | Giữ trong cùng tài khoản. Chuyển `messages.citations` JSONB thành rows `generation_sources` khi từng citation đủ dữ liệu; podcasts/chat không share. |
| `plans`, `subscriptions` | `plans`, `subscriptions` | Giữ; `features` tiếp tục nằm trong `plans`, không tạo `plan_features`. |
| Không có | `mission_progress` | Bảng mới theo cặp `(user_id, mission_id)`; nhận tiến độ từ các sự kiện Backend hợp lệ, trao XP một lần theo policy. |
| Không có | `missions` | Bảng mới chứa catalog tiêu chí cố định dùng chung; seed bằng migration/seed versioned. |
| Không có | `flashcard_sets`, `study_question_sets`, `quizzes` | Bảng typed mới cho nội dung AI; không gom vào generic artifact table. |

## Ánh xạ localStorage Frontend

| Key | Dữ liệu hiện tại | Quyết định |
|---|---|---|
| `thea-home-demo-v1` | Bộ học liệu demo, lớp dạng tên text, xóa mềm client-side | Không import; xóa sau khi trang thư viện đã gọi Backend |
| `thea-study-v1:<materialId>` | Documents, terms, quiz attempts, smart-study counters, guide | Không import; xóa sau khi luồng học tương ứng đã gọi Backend |
| `thea-profile-v1` | Hồ sơ local, avatar path, thông tin demo/support code | Không import; chuyển phần cần dùng sang API profile; xóa key sau cutover |
| `ins-home-group` | Tùy chọn trình bày home | Không import; xóa sau cutover |
| Auth/session cookie | `INS_SESSION` cookie HttpOnly; CSRF cookie | Không xóa trong dọn demo localStorage |

## Hợp đồng AI hiện trạng cần adapter

| Dạng | AI_Backend hiện trả | DTO/API canonical và bảng đích |
|---|---|---|
| Summary | `title`, `overview`, `key_points[]` | `keyPoints[]` → `course_summaries` |
| Guide | `title`, `steps[]`, `tips[]` | `study_guides` |
| Flashcard | `topic`, `cards[{front,back,source_page}]` | `sourcePage` + `documentId` optional → `flashcard_sets`/`flashcards` |
| Study questions | `question`, `core_knowledge`, `correct_answer`, options/pairs | Canonical `prompt`, `coreKnowledge`, `correctAnswer`; lưu typed JSON trong `study_question_sets` |
| Quiz | `question`, `correct_answer`, options, explanation | Canonical `prompt`, `correctAnswer`; lưu trong `quizzes` |
| Chat | SSE `start`, `delta`, `done`, `error`; không persist lịch sử ở AI_Backend | Backend persist `messages`; cần AI source event/field trước khi lưu chat citations trong `generation_sources` |

## Điểm cần giải quyết trong task triển khai

1. Xác định ngưỡng XP→level và ánh xạ avatar ID hợp lệ trước khi bật endpoint đổi avatar/trao thưởng. Không suy ra threshold chỉ từ UI.
2. `artifact_sources` tham chiếu artifact cụ thể, còn `generation_sources` đích gắn job/message. V1 chuyển các nguồn có job sang job/document và giữ bảng `artifact_sources` nguyên vẹn; các hàng không có job không được gán job giả và phải chờ bước đối chiếu trước khi dọn schema.
3. `study_question_sets`/`quizzes` là nội dung có thể chia sẻ; `session_questions` và response/result là hoạt động cá nhân, không được copy.
4. Migration cleanup là bước cuối; giữ các bảng tương thích legacy cho tới khi Backend đã chuyển và có đối chiếu + backup restore thử.

## Kiểm tra đã chạy

- Đối chiếu schema V1/V2 trước khi gộp, Backend README, entity/controller/DTO, AI Pydantic schemas/controllers/chat SSE và các vị trí localStorage Frontend.
- Không đọc `.env` hoặc in secret.
- Fixture PostgreSQL 16 xác nhận backfill summary, guide, podcast, generation source, flashcard progress owner, session snapshot/response/feedback và message citations; xác nhận summary sai JSON, sai kiểu mảng và artifact source thiếu job vẫn được giữ.
- Spring Boot khởi động với Flyway và Hibernate `ddl-auto: validate` trên PostgreSQL 16 tạm; đối chiếu 31 bảng tính Flyway history, 24 missions, 8 metric keys, 2 plans và 1 migration thành công.
- `mvn -o test` trước đó: BUILD SUCCESS, 2 JWT tests passed. Không có dữ liệu người dùng trong database thật để backfill; không drop bảng legacy.
