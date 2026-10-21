# Kế hoạch triển khai database INS

**Trạng thái:** Task 1–4 đã hoàn tất ở mức schema/backfill/API và kiểm thử fixture. V1 và API đã chạy trên PostgreSQL 16 tạm, Flyway/Hibernate validation và kiểm thử tích hợp đều qua; database thật chưa khởi tạo, không có dữ liệu người dùng được chuyển hoặc bảng legacy nào bị xóa.
**Phạm vi:** Frontend, Spring Boot Backend, AI_Backend và PostgreSQL. PostgreSQL là nguồn dữ liệu chính; chỉ Backend được ghi database. AI_Backend trả output có kiểu và metadata nguồn. Dữ liệu demo localStorage sẽ xóa tại bước chuyển UI, không nhập vào database.
**Trạng thái workspace:** Frontend có các thay đổi chưa commit từ trước; giữ nguyên các thay đổi ngoài phạm vi. Backend được cập nhật cho Task 4 qua quyền ghi đã cấp. AI_Backend chưa được sửa.

## Giả định và quyết định đã chốt

- Database đích chưa khởi tạo; bộ migration hiện tại dành cho khởi tạo mới. Sau lần áp dụng đầu tiên, không sửa migration đã áp dụng; thay đổi schema bằng migration version mới.
- Schema đích có 22 bảng, theo [kế hoạch database tối giản](../docs/database/INS-MINIMAL-DATABASE-PLAN.md).
- Backend là nơi xác thực quyền, ghi PostgreSQL và cập nhật giao dịch nghiệp vụ; AI_Backend không có credential PostgreSQL.
- Chia sẻ học liệu chỉ sao chép nội dung được phép. Không sao chép podcast, chat/tin nhắn, phiên học, đáp án người dùng, kết quả/điểm, tiến độ flashcard, tiến độ nhiệm vụ, XP hoặc level.
- `missions` là danh mục tiêu chí chung; `mission_progress` lưu tiến độ riêng theo người dùng và nhiệm vụ.
- Avatar đóng gói trong Frontend (catalog hiện có 70 SVG); API lưu `avatarId`; Backend kiểm tra level mở khóa. Cấp N cho phép dùng avatar thứ 1 đến N.
- Mỗi cấp cần 100 XP; level hiện tại không bị hạ khi đã có XP cũ thấp hơn level được lưu.
- Không import dữ liệu demo localStorage. Chỉ xóa các key demo đã xác định sau khi luồng tương ứng hoạt động bằng API; giữ session/token xác thực.
- Không đọc hoặc in nội dung `.env`; chỉ dùng `.env.example` để nhận biết tên cấu hình.

## Phụ thuộc giữa các task

```text
Đối chiếu schema hiện tại và contract đích
                 ↓
Migration Flyway mở rộng + seed nhiệm vụ
                 ↓
Repository/service/authorization ở Backend
                 ↓
Adapter dữ liệu AI và lưu nguồn dẫn chứng
                 ↓
API lát dọc: hồ sơ/nhiệm vụ → học liệu → phiên học → chia sẻ
                 ↓
Frontend gọi API, sau đó mới dọn localStorage demo
                 ↓
Migration dọn schema cũ sau khi đối chiếu và cutover ổn định
```

## Danh sách công việc

### Task 1 — Đối chiếu triển khai hiện tại với contract đã chốt ✅

Kiểm kê migration, entity/controller hiện có ở Backend, schema Pydantic/endpoint AI_Backend và luồng localStorage Frontend. Lập bảng ánh xạ từ cấu trúc cũ sang 22 bảng/API đích. Không sửa migration cũ.

**Điều kiện hoàn tất**
- [x] Có bảng ánh xạ từ mọi bảng cũ và key demo localStorage sang đích hoặc quyết định loại bỏ.
- [x] Chỉ rõ khác biệt giữa response AI snake_case và DTO API camelCase.
- [x] Ghi cách giữ, chuyển đổi hoặc loại bỏ từng dữ liệu legacy.

**Kiểm tra:** rà soát mapping theo mã nguồn; đối chiếu fixture JSON giữa Java/Python/TypeScript khi bắt đầu code.
**Phụ thuộc:** Không có. **Quy mô:** Trung bình.

### Task 2 — Thêm schema đích bằng migration Flyway mới ✅

Tạo các bảng output chuyên biệt và hai bảng nhiệm vụ; thêm `avatar_id`, `experience_points` vào users; bổ sung constraint/index; cập nhật liên kết source/job/session. Giữ bảng cũ trong giai đoạn mở rộng.

**Điều kiện hoàn tất**
- [x] Chỉ có một migration khởi tạo Flyway cho database mới.
- [x] Migration chạy thành công trên PostgreSQL sạch.
- [x] Có đủ 22 bảng nghiệp vụ (31 tính cả bảng nền/legacy và Flyway history), khóa, ràng buộc owner, CHECK và index như thiết kế.
- [x] Seed danh mục nhiệm vụ cố định chạy lặp an toàn theo `code`.

**Tiến độ:** Một migration V1 (`V1__ins_initial_database.sql`) gộp schema nền, seed gói, avatar/XP, hai bảng mission, bảy bảng output typed, source/session snapshot và backfill legacy. `mvn -o clean test` qua 2/2 test. PostgreSQL 16 tạm xác nhận SQL, 24 nhiệm vụ, 8 metric, 2 gói, Flyway migration thành công và Hibernate `ddl-auto: validate`.

**Kiểm tra:** migration test trên database PostgreSQL sạch; Hibernate schema validation.
**Phụ thuộc:** Task 1. **Quy mô:** Lớn; chia migration theo nhóm nếu cần.

### Task 3 — Chuyển dữ liệu legacy và đối chiếu ✅

Chuyển terms/tiến độ sang flashcard set/card; tách learning artifacts sang bảng output có kiểu riêng nếu phân tích được; chuyển nguồn và dữ liệu câu hỏi/phiên. Giữ bản cũ cho tới khi đối chiếu; chỉ xóa ở migration dọn dẹp sau.

**Điều kiện hoàn tất**
- [x] Backfill kiểm tra được trên fixture; bảng nguồn vẫn còn khi dữ liệu lỗi hoặc thiếu liên kết.
- [x] Đối chiếu progress owner, snapshots/responses/feedback, citations, output versions và source mapping.
- [x] Podcast giữ ở bảng podcast riêng; citations chat chỉ liên kết message, không bị gắn nhầm job.

**Kiểm tra:** [validate-task3-backfill.ps1](../scripts/database/validate-task3-backfill.ps1) nạp fixture đại diện vào PostgreSQL 16 tạm và đối chiếu các bảng đích/legacy; xác nhận JSON lỗi và nguồn không có job được giữ lại.
**Phụ thuộc:** Task 2. **Quy mô:** Lớn; tách theo nhóm dữ liệu legacy.

### Task 4 — API hồ sơ, avatar và tiến độ nhiệm vụ

Trả hồ sơ/avatar được mở khóa và nhiệm vụ/progress. Backend chỉ trao điểm khi có sự kiện hợp lệ; cập nhật `mission_progress`, XP và level trong transaction; từ chối avatar chưa mở khóa.

**Điều kiện hoàn tất**
- [x] Có API đọc và đồng bộ progress theo từng nhiệm vụ của người dùng hiện tại.
- [x] Retry job, câu trả lời, phiên hoặc lệnh đồng bộ không trao điểm trùng; ghi nhận/đối soát trong transaction có khóa theo user.
- [x] Backend kiểm tra avatar trong allowlist và level mở khóa.
- [x] Controller chỉ nhận user hiện tại từ JWT; không nhận userId để đọc/sửa hồ sơ hoặc progress.

**API:** `GET/PATCH /api/profile/me`, `PATCH /api/profile/me/avatar`, `GET /api/missions`, `POST /api/missions/sync`. Contract chi tiết ở [API hồ sơ và nhiệm vụ](../docs/contracts/INS-PROFILE-MISSION-API.md). Khi đăng nhập/đăng ký, Backend làm mới CSRF cookie; request sau dùng token ổn định.

**Kiểm tra:** `mvn -o test` (6/6); [validate-task4-api.ps1](../scripts/database/validate-task4-api.ps1) tạo PostgreSQL 16 tạm, chạy Flyway/Hibernate, gọi API qua JWT/CSRF, kiểm tra owner isolation, avatar 403/được mở, 100 XP lên cấp 2, retry job/đáp án và bốn lần sync đồng thời không cộng trùng. Container được xóa sau khi chạy.
**Phụ thuộc:** Task 2. **Quy mô:** Trung bình.

### Task 5 — Lưu học liệu có kiểu riêng và tích hợp AI

Lưu summary, guide, flashcard set/card, study-question set, quiz và podcast vào bảng riêng. Lưu `generation_sources` cho job và chat. Backend validate dữ liệu AI trước khi ghi.

**Điều kiện hoàn tất**
- [ ] Mỗi loại output đọc/ghi qua bảng và repository chuyên biệt.
- [ ] Adapter đổi AI snake_case sang DTO canonical và validate schema.
- [ ] Source URL/title/excerpt được lưu khi AI trả về; không bịa citation.
- [ ] Ghi output và hoàn tất job trong transaction nhất quán.

**Kiểm tra:** contract/serialization tests, repository integration tests và adapter fixtures.
**Phụ thuộc:** Task 1–3. **Quy mô:** Lớn; tách từng output thành lát nhỏ.

**Tiến độ:** Spring Backend đã có `POST/GET /api/materials/{materialId}/generation-jobs` cho 5 endpoint hiện có của AI_Backend (summary, guide, flashcards, study questions, quiz); kiểm tra owner từ JWT, idempotency, validate snake_case rồi lưu/đọc bảng typed; output và job thành công trong một transaction. Metadata `sources` được validate và lưu `generation_sources` nếu AI trả về. Hợp đồng và ví dụ ở [API tạo học liệu](../../Backend/docs/INS-GENERATION-API.md). Clean-build trực tiếp trong `P:\DATN\Backend` qua 10/10 test; có regression test cho HTTP 502 khi AI_Backend lỗi. PostgreSQL 16 tạm xác nhận Flyway/Hibernate và API khởi động. Đã thử generation E2E: summary, lưu source và idempotent retry qua; các request kế tiếp bị TCP reset khi dùng Python HTTP stub nên chưa tính là integration pass; script còn ở [validate-task5-generation.ps1](../../Backend/scripts/validate-task5-generation.ps1). **Task vẫn mở:** AI_Backend chưa có endpoint podcast hoặc trả metadata nguồn; cần ổn định integration test PostgreSQL cho đủ năm loại output.

### Task 6 — Phiên học, câu trả lời và tiến độ cá nhân

Lưu phiên smart study/quiz/flashcard và snapshot câu hỏi, đáp án người dùng, kết quả, feedback. Giữ ngân hàng câu hỏi tách khỏi các lần làm của từng người.

**Điều kiện hoàn tất**
- [ ] Snapshot của phiên không đổi nếu nội dung ngân hàng được chỉnh sửa.
- [ ] Câu trả lời/kết quả chỉ thuộc người dùng đã xác thực.
- [ ] Sự kiện hoàn thành cập nhật nhiệm vụ đúng một lần.

**Kiểm tra:** API/integration tests cho vòng đời phiên, điểm, quyền sở hữu và retry.
**Phụ thuộc:** Task 2, 4, 5. **Quy mô:** Trung bình.

### Task 7 — Chia sẻ học liệu chỉ gồm nội dung

Sao chép tài liệu và output học tập được phép sang bản ghi do người nhận sở hữu. Loại podcast, chat, phiên học, câu trả lời/kết quả/feedback, tiến độ flashcard, mission progress, XP và level.

**Điều kiện hoàn tất**
- [ ] Bản sao độc lập, recipient là owner, `class_id = NULL`.
- [ ] Chỉ summary/guide/flashcard/question bank/quiz và nguồn phù hợp được sao chép.
- [ ] Flashcard review reset; không có session hay lịch sử cá nhân của chủ cũ.
- [ ] Podcast, conversations/messages vẫn riêng tư tài khoản Plus.
- [ ] Bản gốc và tiến độ chủ cũ không đổi.

**Kiểm tra:** integration test tạo dữ liệu học/chat/podcast của owner rồi xác minh bản sao recipient.
**Phụ thuộc:** Task 3, 5, 6. **Quy mô:** Trung bình.

### Task 8 — Chuyển Frontend sang API và xóa dữ liệu demo

Thay local repository bằng API repository theo từng feature. Chỉ dọn các key demo sau khi luồng tương ứng đã hoạt động với Backend; giữ key auth/session.

**Điều kiện hoàn tất**
- [ ] Có trạng thái loading/empty/error/retry phù hợp.
- [ ] Dữ liệu được tải lại từ Backend sau refresh.
- [ ] Chỉ key `thea-home-demo-v1`, `thea-study-v1:<materialId>`, `thea-profile-v1`, `ins-home-group` bị xóa sau cutover.
- [ ] UI avatar thể hiện level và danh sách avatar server cho phép.

**Kiểm tra:** typecheck/build, test feature và browser E2E với Backend local.
**Phụ thuộc:** Task 4–7. **Quy mô:** Lớn; chia theo hồ sơ, thư viện, học tập, chia sẻ.

### Task 9 — Dọn schema cũ và kiểm tra phát hành

Sau thời gian tương thích, backup/restore và đối chiếu thành công, thêm migration xóa bảng/cột legacy không còn được dùng.

**Điều kiện hoàn tất**
- [ ] Code không còn đọc/ghi bảng hoặc cột legacy.
- [ ] Đã diễn tập restore backup và quy trình xử lý migration lỗi.
- [ ] Kiểm tra tích hợp cả PostgreSQL, Backend, AI_Backend và Frontend.

**Kiểm tra:** full tests, migration rehearsal, E2E và security review.
**Phụ thuộc:** Task 3–8. **Quy mô:** Trung bình.

## Các điểm kiểm tra

- Sau Task 1–3: rà soát mapping và đối chiếu dữ liệu trước khi xóa schema cũ.
- Sau Task 4–7: kiểm tra owner, trao điểm idempotent và quyền riêng tư share đầu-cuối.
- Sau Task 8: xác minh cutover UI rồi mới dọn schema cũ.

## Lát triển khai đầu tiên

Đã hoàn tất kiểm kê ở [bảng ánh xạ hiện trạng](../docs/database/INS-IMPLEMENTATION-MAPPING.md). V1 giữ `artifact_sources` không có job để đối chiếu thay vì tạo job lịch sử giả. Đã chốt 100 XP/cấp và avatar thứ N mở ở cấp N. Migration/API chỉ chạy trên PostgreSQL 16 tạm; database thật chưa được khởi tạo và không có bảng legacy nào bị drop.
