# Danh mục nhiệm vụ dùng chung INS

Các nhiệm vụ dưới đây là mốc tích lũy chung cho tất cả tài khoản. Mỗi mốc chỉ trao thưởng một lần. Seed khởi tạo dùng `code` ổn định và upsert an toàn. Điểm thưởng là mức khởi điểm để triển khai; có thể điều chỉnh trước lần khởi tạo PostgreSQL đầu tiên.

| Nhóm | Mốc 1 | Mốc 2 | Mốc 3 | Điểm thưởng |
|---|---:|---:|---:|---:|
| Trả lời đúng | 5 câu | 25 câu | 100 câu | 10 / 30 / 75 |
| Tạo bài học | 1 bài | 5 bài | 20 bài | 10 / 30 / 75 |
| Hoàn thành bài học | 1 bài | 5 bài | 20 bài | 10 / 30 / 75 |
| Ôn flashcard | 10 thẻ | 50 thẻ | 200 thẻ | 10 / 30 / 75 |
| Hoàn thành bài kiểm tra | 1 bài | 5 bài | 20 bài | 10 / 30 / 75 |
| Hoàn thành phiên học | 3 phiên | 10 phiên | 50 phiên | 10 / 30 / 75 |
| Tạo bộ học liệu | 1 bộ | 5 bộ | 20 bộ | 10 / 30 / 75 |
| Thêm tài liệu | 1 tài liệu | 5 tài liệu | 20 tài liệu | 10 / 30 / 75 |

Tổng cộng có 24 nhiệm vụ: mỗi nhóm dùng metric riêng với ba ngưỡng tăng dần. `materials_created` chỉ tính bộ học liệu được tạo thành công; `documents_added` chỉ tính tài liệu được lưu thành công; `lessons_generated` chỉ tính bài học sinh thành công; `study_sessions_completed` chỉ tính phiên chuyển sang trạng thái hoàn thành. Backend cần phát sự kiện sau khi giao dịch nghiệp vụ thành công và chống cộng trùng khi retry.

Chưa có nhiệm vụ ngày/tuần hoặc chuỗi ngày học vì schema hiện tại chưa lưu kỳ thời gian/streak. Không diễn giải các mốc tích lũy thành nhiệm vụ theo thời hạn.
