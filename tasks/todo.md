# Danh sách task triển khai database INS

- [x] Task 1: Đối chiếu triển khai hiện tại với contract đã chốt — [bảng ánh xạ](../docs/database/INS-IMPLEMENTATION-MAPPING.md).
- [x] Task 2: Thêm schema đích bằng migration Flyway mới. *(V1 đã chạy trên PostgreSQL 16 tạm; Spring Boot khởi động thành công và Hibernate `ddl-auto: validate` qua; xác nhận 31 bảng gồm Flyway history, 24 nhiệm vụ/8 chỉ số, 2 gói cước và 1 migration thành công. `mvn -o clean test` qua 2/2 test. Script [xác thực Flyway + Hibernate](../scripts/database/validate-v1-flyway-hibernate.ps1) tạo và dọn container tạm.)*
- [x] Task 3: Chuyển dữ liệu legacy và đối chiếu. *(V1 backfill summary/guide/podcast có cấu trúc hợp lệ; source theo job vào `generation_sources`; terms/progress owner, snapshot/response/feedback, citations. Artifact sai cấu trúc và source không có job được giữ ở bảng legacy. Fixture PostgreSQL 16 xác nhận từng trường hợp.)*
- [x] Task 4: API hồ sơ, avatar và tiến độ nhiệm vụ. *(API hồ sơ/avatar/mission; 100 XP/cấp, avatar thứ N mở ở cấp N. PostgreSQL 16 tạm xác nhận JWT/CSRF, quyền owner, mốc XP, retry và 4 sync đồng thời. Xem [contract API](../docs/contracts/INS-PROFILE-MISSION-API.md) và [script kiểm thử](../scripts/database/validate-task4-api.ps1).)*
- [x] Task 5: Lưu học liệu có kiểu riêng và tích hợp AI. *(Spring Backend triển khai đủ 6 endpoint typed output (summary, guide, flashcards, study_questions, quiz, podcast) qua GenerationController/GenerationService/AiBackendClient; validate AI snake_case qua AiOutputValidator; lưu generation_sources; idempotency và transaction nhất quán. Fix HTTP/2 upgrade bằng RestClientCustomizer+SimpleClientHttpRequestFactory. 30/30 Maven tests pass.)*
- [x] Task 6: Phiên học, câu trả lời và tiến độ cá nhân. *(Spring Boot Backend đã hoàn tất API phiên học: POST start session, GET session, POST responses với chấm điểm tự động choice/short/matching, PUT feedback và POST complete với đồng bộ nhiệm vụ/XP/level idempotent. Snapshot câu hỏi độc lập với ngân hàng câu hỏi. Unit tests và isolation tests cho session/scoring đạt 7/7 qua mvn test.)*
- [x] Task 7: Chia sẻ học liệu chỉ gồm nội dung. *(API chia sẻ và nhân bản độc lập qua ShareController và ShareService: POST share tạo signed token 7 ngày, GET preview công khai, POST accept sao chép toàn bộ documents, summaries, guides, flashcards, question bank và quizzes sang owner mới với class_id=null. Toàn bộ tiến độ review flashcard được reset về 0, không sao chép podcasts, chat hay sessions cá nhân của chủ cũ. 30/30 tests Maven pass.)*
- [ ] Task 8: Chuyển Frontend sang API và xóa dữ liệu demo.
- [ ] Task 9: Dọn schema cũ và kiểm tra phát hành.

## Điểm kiểm tra sau Task 1–3

- [x] Database sạch chạy V1 thành công; Flyway và Hibernate validation qua trên PostgreSQL 16 tạm.
- [x] Đã đối chiếu fixtures legacy trước/sau; chưa xóa bảng nguồn. Database thật chưa khởi tạo nên chưa có bản ghi người dùng để chuyển.

## Điểm kiểm tra sau Task 4–7

- [x] Đã kiểm thử quyền sở hữu, thưởng idempotent và quyền riêng tư khi chia sẻ. *(Task 4 owner/XP idempotent qua; Task 5 typed output/source validate qua; Task 6 session/scoring/owner qua; Task 7 share clone/privacy qua. 30/30 Maven tests.)*

## Điểm kiểm tra sau Task 8

- [ ] Frontend đọc/ghi qua Backend; chỉ các key demo đã liệt kê bị xóa.
