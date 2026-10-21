# Danh sách task triển khai database INS

- [x] Task 1: Đối chiếu triển khai hiện tại với contract đã chốt — [bảng ánh xạ](../docs/database/INS-IMPLEMENTATION-MAPPING.md).
- [x] Task 2: Thêm schema đích bằng migration Flyway mới. *(V1 đã chạy trên PostgreSQL 16 tạm; Spring Boot khởi động thành công và Hibernate `ddl-auto: validate` qua; xác nhận 31 bảng gồm Flyway history, 24 nhiệm vụ/8 chỉ số, 2 gói cước và 1 migration thành công. `mvn -o clean test` qua 2/2 test. Script [xác thực Flyway + Hibernate](../scripts/database/validate-v1-flyway-hibernate.ps1) tạo và dọn container tạm.)*
- [x] Task 3: Chuyển dữ liệu legacy và đối chiếu. *(V1 backfill summary/guide/podcast có cấu trúc hợp lệ; source theo job vào `generation_sources`; terms/progress owner, snapshot/response/feedback, citations. Artifact sai cấu trúc và source không có job được giữ ở bảng legacy. Fixture PostgreSQL 16 xác nhận từng trường hợp.)*
- [x] Task 4: API hồ sơ, avatar và tiến độ nhiệm vụ. *(API hồ sơ/avatar/mission; 100 XP/cấp, avatar thứ N mở ở cấp N. PostgreSQL 16 tạm xác nhận JWT/CSRF, quyền owner, mốc XP, retry và 4 sync đồng thời. Xem [contract API](../docs/contracts/INS-PROFILE-MISSION-API.md) và [script kiểm thử](../scripts/database/validate-task4-api.ps1).)*
- [ ] Task 5: Lưu học liệu có kiểu riêng và tích hợp AI. *(Spring Backend đã nối 5 loại AI hiện có, lưu/đọc typed outputs, validate response, idempotency và transaction hoàn tất job; có hỗ trợ lưu nguồn nếu AI trả metadata. Clean-build trực tiếp tại Backend qua 10/10 test, có regression test HTTP 502. Generation E2E trên PostgreSQL mới xác nhận summary/source/idempotent retry; Python stub bị TCP reset ở request kế tiếp nên toàn bộ integration chưa đạt. Còn podcast và nguồn từ AI_Backend; xem [contract API](../../Backend/docs/INS-GENERATION-API.md) và [script tích hợp](../../Backend/scripts/validate-task5-generation.ps1).)*
- [ ] Task 6: Phiên học, câu trả lời và tiến độ cá nhân.
- [ ] Task 7: Chia sẻ học liệu chỉ gồm nội dung.
- [ ] Task 8: Chuyển Frontend sang API và xóa dữ liệu demo.
- [ ] Task 9: Dọn schema cũ và kiểm tra phát hành.

## Điểm kiểm tra sau Task 1–3

- [x] Database sạch chạy V1 thành công; Flyway và Hibernate validation qua trên PostgreSQL 16 tạm.
- [x] Đã đối chiếu fixtures legacy trước/sau; chưa xóa bảng nguồn. Database thật chưa khởi tạo nên chưa có bản ghi người dùng để chuyển.

## Điểm kiểm tra sau Task 4–7

- [ ] Đã kiểm thử quyền sở hữu, thưởng idempotent và quyền riêng tư khi chia sẻ. *(Task 4 về owner và thưởng idempotent đã qua; còn chờ Task 7 kiểm tra share.)*

## Điểm kiểm tra sau Task 8

- [ ] Frontend đọc/ghi qua Backend; chỉ các key demo đã liệt kê bị xóa.
