# INS — Quy ước và hợp đồng dữ liệu giữa ba phần

**Trạng thái:** Bản chuẩn hóa nền tảng; dùng để đồng bộ các khai báo kế tiếp.
**Phạm vi:** Frontend React/Vite, Spring Boot Backend, FastAPI AI_Backend và PostgreSQL.
**Không thuộc phạm vi:** Thay đổi migration, dọn localStorage trong runtime, hoặc tự động sửa endpoint trong tài liệu này.

## 1. Quy tắc theo từng ranh giới

Một kiểu dữ liệu không cần dùng cùng cách đặt tên trong mọi ngôn ngữ. Cần thống nhất hợp đồng tại các ranh giới và chuyển đổi rõ ràng tại adapter:

| Lớp | Quy ước chuẩn |
|---|---|
| JSON API cho Frontend và Backend | `lowerCamelCase` cho field; JSON object, không trả tên cột DB |
| Java DTO / TypeScript API types | `lowerCamelCase`; ID là `UUID` ở Java và chuỗi UUID ở JSON/TypeScript |
| Python nội bộ | Có thể dùng `snake_case`; Pydantic schema xuất/nhận JSON qua alias `lowerCamelCase` |
| PostgreSQL | `snake_case`; `uuid`, `timestamptz`, enum lưu dạng `text` kèm CHECK khi phù hợp |
| Ngày giờ JSON | ISO 8601 UTC, ví dụ `2026-10-12T08:30:00Z`; không gửi timestamp không timezone |
| Enum JSON | Chuỗi `lower_snake_case`, giá trị có danh sách hữu hạn và được kiểm tra tại boundary |
| Giá tiền | Số nguyên đơn vị nhỏ nhất, ví dụ VND; tên field thể hiện đơn vị (`priceMinor`) |
| JSON cấu trúc | Giữ schema typed; chỉ dùng JSONB cho payload thực sự biến thể hoặc snapshot có version |

**Không dùng một model làm đồng thời API DTO, entity PostgreSQL và view-model giao diện.** Mỗi lớp có kiểu riêng và một adapter/map tường minh; việc này tránh để thay đổi UI làm đổi database/API ngoài ý muốn.

## 2. Danh tính và thời gian

- Mọi khóa định danh nghiệp vụ dùng UUID. JSON biểu diễn UUID dưới dạng chuỗi chuẩn; Frontend không tự tạo ID cho bản ghi do Backend quản lý.
- `study_materials.id` là `materialId` chuẩn. Khi gọi AI, giá trị này được truyền thành `courseId` nếu API AI vẫn giữ tên `course_id` cũ; không tạo một ID khóa học thứ hai.
- `documentId`, `generationJobId`, `userId`, `conversationId` đều là UUID chuỗi và phải được kiểm tra quyền ở Backend. Biết UUID không đồng nghĩa có quyền.
- PostgreSQL lưu thời gian bằng `timestamptz`; Java dùng `Instant`; TypeScript giữ chuỗi ISO UTC ở API type và chỉ chuyển thành `Date` tại nơi cần format/tính toán.

## 3. Enum chuẩn cho API

Giữ giá trị chữ thường có dấu gạch dưới, thống nhất giữa response/request và JSONB:

| Nhóm | Giá trị chuẩn |
|---|---|
| `generationJob.status` | `queued`, `running`, `succeeded`, `failed` |
| `generationJob.mode` | `mock`, `ai` |
| `document.sourceType` | `upload`, `url`, `topic`, `text`, `mock` |
| `document.processingStatus` | `pending`, `processing`, `ready`, `failed` |
| `materialSource` | `document`, `requirement` |
| `artifact.type` | `summary`, `guide`, `study_questions`, `quiz`, `podcast` |
| `artifact.origin` | `manual`, `mock`, `ai` |
| `question.type` | `multiple_choice`, `short_answer`, `true_false`, `matching` |
| `session.mode` | `smart`, `test`, `flashcards`, `matching` |
| `session.status` | `in_progress`, `completed`, `abandoned` |
| `answer.result` | `correct`, `incorrect`, `revealed`, `skipped` |
| `mission.metricKey` | `correct_answers`, `lessons_generated`, `lessons_completed`, `flashcards_reviewed`, `quizzes_completed`, `study_sessions_completed`, `materials_created`, `documents_added` (Backend định nghĩa sự kiện nguồn và chống cộng trùng) |

Các giá trị giao diện hiện dùng `choice`/`short` và database V1 cũng dùng `choice`/`short`. Chúng là giá trị legacy; adapter phải ánh xạ `choice` → `multiple_choice`, `short` → `short_answer`. Chỉ bỏ giá trị legacy sau khi có migration và chuyển đổi dữ liệu tương ứng.

## 4. Quy ước payload học liệu

Field của API dùng camelCase. Bảng dưới ghi field canonical và mapping từ code AI hiện tại (Pydantic snake_case) cùng database.

| Loại | JSON API canonical | AI hiện tại | PostgreSQL |
|---|---|---|---|
| Tóm tắt | `{ title, overview, keyPoints: string[] }` | `key_points` | `course_summaries.key_points` JSONB |
| Hướng dẫn | `{ title, steps: string[], tips: string[] }` | field hiện snake_case nếu có | `study_guides.steps/tips` JSONB |
| Flashcard | `{ front, back, sourcePage, documentId? }` | `source_page` | `flashcard_sets` + `flashcards.front/back/source_page/document_id` |
| Bộ câu hỏi học tập | `{ title, questions: StudyQuestion[] }` | các field hiện snake_case | `study_question_sets.questions` JSONB |
| Quiz | `{ title, questions: QuizQuestion[] }` | `correct_answer` | `quizzes.questions` JSONB; snapshot phiên vào `session_questions` |
| Nguồn dẫn chứng | `{ sourceType, title, url, excerpt, retrievedAt, isMock }` | AI source metadata | `generation_sources`, liên kết qua `generationJobId` hoặc `messageId`; tài liệu nội bộ tùy chọn qua `documentId` |

`StudyQuestion` canonical:

```json
{
  "type": "multiple_choice",
  "prompt": "Câu hỏi",
  "hint": "Gợi ý",
  "coreKnowledge": "Kiến thức cốt lõi",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": "A",
  "pairs": null
}
```

Với loại `matching`, `options` và `correctAnswer` là `null`, còn `pairs` là mảng `{ "term", "definition" }`. `QuizQuestion` dùng `prompt`, `options`, `correctAnswer`, `explanation`; số lượng option và đáp án hợp lệ phải được validate cả trong AI schema lẫn khi Backend nhận response.

Khi serialize response AI trong giai đoạn chuyển tiếp, Backend adapter đổi tên `course_id` → `courseId`, `key_points` → `keyPoints`, `source_page` → `sourcePage`, `correct_answer` → `correctAnswer`, `core_knowledge` → `coreKnowledge`. Không để snake_case lọt vào public API.

## 5. Hợp đồng job tạo nội dung

```json
{
  "id": "UUID",
  "materialId": "UUID",
  "documentId": "UUID hoặc null",
  "type": "study_questions",
  "mode": "ai",
  "status": "queued",
  "prompt": "Yêu cầu học tập",
  "createdAt": "2026-10-12T08:30:00Z",
  "startedAt": null,
  "completedAt": null,
  "error": null
}
```

- Client gửi `Idempotency-Key` ổn định cho một ý định tạo nội dung; Backend lưu fingerprint payload và trả cùng job khi retry đúng payload.
- Dùng `generationJob.type = flashcards` ở API và schema đích. Database V1 hiện dùng `terms` cho loại job này; migration cần ánh xạ legacy `terms` sang `flashcards` và bảo toàn progress.
- `study_questions` phải được thêm vào constraint loại job hiện tại trước khi lưu loại này. Việc nới CHECK cần migration mới, không sửa migration đã áp dụng.
- Nguồn tìm trên web phải được AI_Backend trả cụ thể (URL, tiêu đề, trích đoạn nếu có). Backend lưu từng nguồn vào `generation_sources`; không tạo citation giả khi AI không cung cấp nguồn. Chat API trả citations bằng cách lấy các nguồn liên kết với message.
- Lỗi public có `code`, `message`, `timestamp`; không trả stack trace, secret hoặc exception nội bộ.

## 6. Những khác biệt hiện trạng cần xử lý

1. AI_Backend trả field snake_case trong khi Frontend và Spring API dùng camelCase.
2. Frontend gọi câu hỏi là `prompt`/`answer`, Backend session lưu `prompt_snapshot`/`answer_snapshot`, AI dùng `question`/`correct_answer`.
3. Frontend dùng `choice`/`short`; database dùng `choice`/`short`; AI dùng `multiple_choice`/`matching`.
4. Frontend `StudyWorkspace` là dữ liệu localStorage, không phải API DTO; `StudyTerm.documentId` hiện optional nhưng database cho phép null — API response cần biểu diễn rõ `documentId: string | null`.
5. AI `course_id` hiện là chuỗi tự do; khi tích hợp phải validate thành UUID và bằng `study_materials.id`.
6. Hợp đồng AI cần thêm `documentId` cho ingest và metadata Qdrant để phân biệt nhiều tài liệu cùng một material.
7. Database hiện chưa có bảng chuyên biệt cho mọi output AI; `learning_artifacts` gộp summary/guide/podcast và `terms` chưa biểu đạt rõ bộ flashcard. Cần migration/backfill theo [plan PostgreSQL tối giản](../database/INS-MINIMAL-DATABASE-PLAN.md), hiện có 22 bảng gồm `generation_sources`, `missions` và `mission_progress`.
8. Chia sẻ học liệu là tạo bản sao nội dung độc lập: có thể sao chép summary, guide, nội dung flashcard, study-question bank, quiz và nguồn dẫn chứng. Không sao chép podcast hoặc chat/conversations/messages vì đây là dữ liệu tài khoản Plus của chủ sở hữu; cũng không sao chép study sessions, câu trả lời/kết quả/thời gian/feedback, lịch sử quiz/câu hỏi, tiến độ review flashcard, XP/level hoặc tiến độ nhiệm vụ. Đáp án chuẩn thuộc nội dung quiz/question bank vẫn được giữ. Backend khởi tạo progress flashcard về mặc định và class thành `null`; nguồn tài liệu chỉ được giữ nếu nằm trong nội dung được chia sẻ.
9. Dữ liệu demo hiện có trong localStorage không cần giữ và không được import. Sau khi Frontend đã chuyển sang Backend/PostgreSQL, xóa các key demo `thea-home-demo-v1`, `thea-study-v1:<materialId>`, `thea-profile-v1`, `ins-home-group`; giữ token/session xác thực và các key ngoài danh sách demo.
10. Avatar là các PNG đóng gói sẵn trong Frontend, API/database chỉ dùng `avatarId`; Backend kiểm tra `users.level` trước khi lưu. Nhiệm vụ nằm trong danh mục `missions` dùng chung; `mission_progress` lưu tiến độ và điểm thưởng theo từng user/nhiệm vụ. Backend cập nhật tiến độ, XP/level trên `users` trong cùng transaction với sự kiện hợp lệ, rồi trả tiến độ và danh sách avatar được mở khóa.

## 7. Trình tự áp dụng vào code

1. Duyệt hợp đồng field/enum ở tài liệu này.
2. Tạo request/response schema chuẩn làm nguồn kiểm tra: TypeScript API types, Java DTOs và Pydantic models phải khớp JSON camelCase; Python có thể giữ thuộc tính nội bộ snake_case bằng alias.
3. Viết adapter Backend cho các payload local/AI legacy; không đổi localStorage ngay trong cùng bước.
4. Thêm migration Flyway additive cho enum/payload cần lưu và ghi dữ liệu legacy tương thích.
5. Cập nhật API Frontend sang contract mới sau khi Backend có endpoint tương ứng.
6. Kiểm tra contract bằng JSON fixture dùng chung và test serialization/deserialization ở TypeScript, Java, Python; kiểm tra migration trên DB hiện tại trước khi E2E.

Hợp đồng này quy định API schema; dữ liệu đầu ra được lưu trong các bảng quan hệ chuyên biệt, không gộp toàn bộ vào một JSONB content column. Các mã nguồn Spring Boot và AI_Backend sẽ áp dụng contract cùng adapter ở bước triển khai.
