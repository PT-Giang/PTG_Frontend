# INS — Phương án PostgreSQL 22 bảng

**Trạng thái:** Đã thống nhất hướng tinh giản: chỉ gộp hai bảng theo yêu cầu của người dùng. Chi tiết cột, ràng buộc và nghiệp vụ chia sẻ vẫn chờ duyệt trước khi triển khai.
**Phạm vi:** Tài liệu thiết kế; chưa tạo database, migration hoặc thay đổi dữ liệu ứng dụng.

## 1. Thay đổi so với thiết kế đầy đủ

1. Gộp `plan_features` vào cột `plans.features` kiểu JSONB.
2. Gộp `message_citations` vào cột `messages.citations` kiểu JSONB.
3. Giữ nguyên các bảng còn lại, không áp dụng phương án tinh giản 16 bảng.
4. Giữ `material_shares` trong phạm vi chia sẻ giữa tài khoản đã bàn trước đó; cơ chế quyền chi tiết vẫn cần duyệt.

Bản gốc ghi 26 bảng nhưng thực tế liệt kê 23. Số lượng đúng của phương án này: **23 − 2 + 1 bảng chia sẻ = 22 bảng**. Nếu chưa triển khai chia sẻ thì phần lõi có 21 bảng.

## 2. Danh sách bảng

| STT | Bảng | Vai trò |
|---|---|---|
| 1 | users | Tài khoản và hồ sơ |
| 2 | classes | Nhóm học liệu cá nhân |
| 3 | study_materials | Bộ học liệu, chủ sở hữu, lớp, xóa mềm |
| 4 | documents | Tài liệu nguồn, văn bản trích xuất, trạng thái xử lý |
| 5 | terms | Thuật ngữ và định nghĩa |
| 6 | term_progress | Tiến độ riêng từng người/thẻ |
| 7 | generation_jobs | Yêu cầu tạo nội dung mock/AI |
| 8 | generation_sources | Nguồn tham khảo của yêu cầu tạo nội dung |
| 9 | learning_artifacts | Hướng dẫn, tóm tắt, podcast |
| 10 | artifact_sources | Liên kết nội dung được tạo với tài liệu đầu vào |
| 11 | study_settings | Cài đặt riêng theo người/học liệu |
| 12 | study_sessions | Phiên học hoặc làm bài kiểm tra |
| 13 | session_questions | Bản chụp câu hỏi và đáp án trong phiên |
| 14 | question_options | Các lựa chọn trắc nghiệm |
| 15 | question_responses | Câu trả lời cuối cùng và kết quả |
| 16 | question_feedback | Đánh giá, góp ý cho câu hỏi |
| 17 | legacy_progress_baselines | Bộ đếm tiến độ cũ khi chuyển từ localStorage |
| 18 | conversations | Hội thoại riêng của người học |
| 19 | messages | Tin nhắn và danh sách trích dẫn JSONB |
| 20 | plans | Gói dịch vụ và quyền lợi JSONB |
| 21 | subscriptions | Lịch sử đăng ký gói |
| 22 | material_shares | Quyền đọc/luyện tập học liệu được chia sẻ |

Các trường và quan hệ của bảng giữ lại tiếp tục theo bản thiết kế đầy đủ và ERD, không bị chuyển sang JSONB hoặc hoãn theo phương án 16 bảng. `user_profiles` không được thêm riêng vì không thuộc danh sách bảng gốc; hồ sơ tiếp tục nằm trong `users`.

## 3. Gộp quyền lợi vào plans

Giữ các cột `id`, `code`, `name`, `billing_cycle`, `price_minor`, `currency`, `is_demo`; thêm:

| Cột | Kiểu đề xuất | Quy tắc |
|---|---|---|
| features | JSONB NOT NULL DEFAULT '{}' | Đối tượng ánh xạ mã chức năng sang quyền và hạn mức |

Ví dụ minh họa, không phải chính sách giá/quyền lợi chính thức:

```json
{
  "smart_study": { "enabled": true, "quota": 100, "period": "month" },
  "podcast": { "enabled": false, "quota": 0, "period": null },
  "flashcards": { "enabled": true, "quota": null, "period": null }
}
```

- `quota = null`: không giới hạn; số nguyên không âm: hạn mức hữu hạn. `period` quy định cửa sổ tính hạn mức nếu có.
- `enabled = false` luôn từ chối tính năng, bất kể quota.
- Backend kiểm tra kiểu, mã tính năng được hỗ trợ và cấu trúc JSON; mã không được khai báo không tự động được cấp quyền.
- Database kiểm tra `jsonb_typeof(features) = 'object'`; kiểm tra chi tiết thực hiện ở lớp nghiệp vụ hoặc ràng buộc bổ sung khi chốt schema.
- `subscriptions.plan_id` vẫn là FK đến `plans.id`.
- JSON này chỉ mô tả quyền lợi, không lưu số lượt đã sử dụng. Nếu áp dụng hạn mức thật, cần chốt nguồn dữ liệu đo lượt dùng theo từng tính năng.
- Thay đổi features tác động đến các đăng ký đang tham chiếu gói đó; nếu cần giữ quyền lợi cũ theo hợp đồng, phải thiết kế phiên bản gói trước khi thanh toán thật.

## 4. Gộp trích dẫn vào messages

Giữ các cột tin nhắn hiện có; thêm:

| Cột | Kiểu đề xuất | Quy tắc |
|---|---|---|
| citations | JSONB NOT NULL DEFAULT '[]' | Danh sách trích dẫn của tin nhắn |

Ví dụ minh họa:

```json
[
  {
    "document_id": "11111111-1111-4111-8111-111111111111",
    "excerpt": "Nội dung được trích tại thời điểm trả lời."
  }
]
```

- Tin nhắn không có nguồn dùng mảng rỗng.
- `document_id` là UUID tham chiếu logic, **không còn FK trực tiếp** bên trong JSONB.
- Backend kiểm tra từng tài liệu tồn tại, thuộc học liệu của hội thoại và người dùng có quyền truy cập. Kiểm tra và ghi phải xử lý nhất quán trong transaction khi có thay đổi đồng thời.
- `excerpt` giữ nguyên theo thời điểm trả lời; sửa tài liệu không tự sửa trích dẫn cũ.
- Database kiểm tra `jsonb_typeof(citations) = 'array'`; backend kiểm tra cấu trúc từng phần tử, độ dài và số lượng theo giới hạn sẽ chốt.
- Khi tài liệu bị xóa/không còn quyền, không cho mở nguồn bằng ID cũ; chính sách giữ trích đoạn lịch sử phải thống nhất với chính sách xóa dữ liệu.
- Cần chốt xóa cứng/ẩn danh trước khi triển khai; không coi JSONB là cơ chế tự đảm bảo toàn vẹn tham chiếu.

## 5. Những phần giữ nguyên

- `generation_sources` vẫn là bảng quan hệ để tra cứu nguồn theo job.
- `artifact_sources` vẫn là bảng nối nhiều-nhiều artifact/tài liệu.
- `question_options` và `question_feedback` vẫn độc lập.
- `study_settings` vẫn lưu cài đặt để đồng bộ giữa thiết bị.
- `legacy_progress_baselines` vẫn giữ tiến độ cũ; không dựng lịch sử câu hỏi giả.
- Tiến độ mỗi người, câu hỏi/đáp án snapshot, kết quả cuối cùng, xóa mềm học liệu và các ràng buộc nghiệp vụ của bản gốc được giữ lại.
- Có bảng baseline không đồng nghĩa được phép tự chuyển dữ liệu trình duyệt: chuyển đổi là bước riêng sau khi duyệt.

## 6. Chia sẻ giữa tài khoản — đề xuất tiếp tục giữ trong phạm vi

`material_shares(material_id, recipient_id, created_at, revoked_at)`; PK ghép `(material_id, recipient_id)`; hai FK đến study_materials và users.

- Chủ sở hữu cấp/thu hồi quyền cho tài khoản đã tồn tại.
- Người nhận được đọc và luyện tập, có tiến độ và hội thoại riêng; không sửa nội dung hoặc chia sẻ tiếp.
- Đây là cấp quyền trên cùng học liệu, không sao chép.
- Không chia sẻ mặc nhiên các lớp, lịch sử hoặc hội thoại riêng của người khác.
- Backend kiểm tra quyền trên mỗi yêu cầu; ID hoặc URL không thay thế quyền truy cập.
- Cơ chế liên kết công khai, email mời, tải file gốc, quyền xem lịch sử sau thu hồi và hiệu lực khi khôi phục thùng rác vẫn cần chốt; yêu cầu gộp hai bảng không được hiểu là đã duyệt các chính sách này.

## 7. Kế hoạch triển khai sau khi duyệt

| Bước | Công việc | Bàn giao |
|---|---|---|
| 1 | Chốt từ điển dữ liệu 22 bảng và chính sách chia sẻ/xóa | Schema chi tiết, FK, nullable, unique/check |
| 2 | Chốt cấu trúc features/citations và quy tắc kiểm tra | Hợp đồng dữ liệu JSONB |
| 3 | Tạo PostgreSQL + pgAdmin local, migrations | Database rỗng có thể dựng lại |
| 4 | Seed người dùng giả, học liệu, phiên học và chia sẻ | Dữ liệu demo không ghi đè localStorage |
| 5 | Kiểm thử quan hệ, quyền, JSONB, snapshot, chống trùng | Báo cáo kiểm thử |
| 6 | Sao lưu/khôi phục, tài liệu vận hành | Hướng dẫn bàn giao |
| 7 | Nối backend và React/Vite theo phạm vi được duyệt tiếp | Luồng hoạt động xuyên suốt |

## 8. Tiêu chí nghiệm thu bổ sung

- Schema có 22 bảng nghiệp vụ; không còn bảng plan_features hoặc message_citations.
- Có đầy đủ sáu bảng từng bị gộp/hoãn trong phương án 16 bảng: generation_sources, question_options, question_feedback, study_settings, legacy_progress_baselines, artifact_sources.
- Features sai kiểu, quota âm hoặc tính năng không hợp lệ bị từ chối.
- Citations không được tham chiếu tài liệu của học liệu khác hoặc tài liệu người dùng không được truy cập.
- Lịch sử câu hỏi/đáp án và tiến độ từng người không đổi khi sửa nội dung nguồn.
- Người không có quyền hoặc đã bị thu hồi không truy cập được học liệu qua API.
- Seed và migrations chạy lại có kiểm soát, sao lưu/khôi phục được kiểm tra.

**ERD hiện hành:** [erd.md](./erd.md).
