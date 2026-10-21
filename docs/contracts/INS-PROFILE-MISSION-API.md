# API hồ sơ, avatar và nhiệm vụ INS

Các API dưới đây cần JWT hợp lệ trong cookie `INS_SESSION`. Backend lấy `userId` từ subject của JWT; client không truyền `userId` để chọn hồ sơ hay tiến độ.

## Hồ sơ

`GET /api/profile/me` trả hồ sơ của tài khoản hiện tại, XP, level và catalog avatar:

```json
{
  "id": "uuid",
  "email": "learner@example.test",
  "displayName": "Learner",
  "avatarId": "anaconda",
  "level": 1,
  "experiencePoints": 0,
  "xpToNextLevel": 100,
  "createdAt": "2026-10-13T00:00:00Z",
  "avatars": [
    { "avatarId": "anaconda", "requiredLevel": 1, "unlocked": true },
    { "avatarId": "butterfly", "requiredLevel": 2, "unlocked": false }
  ]
}
```

`PATCH /api/profile/me` nhận `{ "displayName": "Tên mới" }`. Tên được trim và giới hạn 100 ký tự.

`PATCH /api/profile/me/avatar` nhận `{ "avatarId": "butterfly" }`. Backend tra cứu allowlist 70 avatar; avatar ngoài catalog trả 400, avatar có cấp mở khóa cao hơn tài khoản trả 403. Ảnh nằm trong frontend; database chỉ lưu ID, không nhận file hoặc URL tự do.

`GET /api/auth/me` và response đăng nhập/đăng ký cũng trả `avatarId`, `level` và `experiencePoints` để frontend khôi phục avatar sau khi đăng nhập.

## Nhiệm vụ

`GET /api/missions` trả danh mục nhiệm vụ hoạt động kèm tiến độ và tổng điểm đã trao cho tài khoản hiện tại. Khi chưa có hàng `mission_progress`, các số tiến độ trả về là 0.

`POST /api/missions/sync` không nhận body hoặc bộ đếm do client cung cấp. Backend khóa hàng user, đếm hoạt động đã ghi trong PostgreSQL, cập nhật `mission_progress`, đánh dấu mốc đã thưởng và cộng XP trong cùng transaction. Gọi lại an toàn; với cùng dữ liệu nguồn không trao thêm điểm. Các request đồng thời của cùng user được tuần tự hóa bằng khóa hàng user.

Các nguồn đếm hiện tại:

| Chỉ số | Nguồn dữ liệu |
| --- | --- |
| `correct_answers` | `question_responses.result = 'correct'` theo phiên thuộc user |
| `lessons_generated` | Job `topic_lesson` đã `succeeded` của user |
| `lessons_completed` | Phiên `smart` đã `completed` (định nghĩa hiện tại cho luồng bài học) |
| `flashcards_reviewed` | `term_progress` và `flashcards`, trùng ID được gộp bằng bộ đếm lớn hơn để tránh đếm lại backfill |
| `quizzes_completed` | Phiên `test` đã `completed` |
| `study_sessions_completed` | Mọi phiên đã `completed` của user |
| `materials_created` | Học liệu do user sở hữu, gồm bản soft-delete để giữ tính tích lũy |
| `documents_added` | Tài liệu thuộc học liệu user sở hữu |

Nhiệm vụ có chính sách `once` chỉ thưởng một lần. Nhiệm vụ `repeatable` thưởng theo từng lần đủ mốc. XP cộng dồn; level được tính theo 100 XP/cấp nhưng không hạ level đã lưu cao hơn. Avatar thứ N yêu cầu level N.

## Bảo vệ request ghi

Frontend lấy token qua `GET /api/auth/csrf`, gửi `X-XSRF-TOKEN` cho request ghi. Khi đăng nhập hoặc đăng ký thành công, Backend phát token CSRF mới cùng cookie `XSRF-TOKEN`; token ổn định trong các request xác thực tiếp theo.
