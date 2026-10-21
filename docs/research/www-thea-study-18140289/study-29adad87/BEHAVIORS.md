# Luồng học liệu — đối chiếu Thea và INS

Đối tượng kiểm tra: `https://www.thea.study/study/1259928495?st=134dc4da9` và các tab con cùng bộ học liệu. Chỉ đọc giao diện; không tạo quiz hoặc thay đổi tiến độ trên Thea.

## Luồng mong muốn

Trong bước cung cấp tài liệu, INS chỉ hiển thị ba cách: **Tải lên tệp**, **Dán ghi chú hoặc thuật ngữ**, và **Mô tả kiến thức muốn học**. Không hiển thị nhập YouTube, Kết hợp hay Danh mục.

1. Người học chọn đúng một nguồn: tệp PDF/DOCX, ghi chú/thuật ngữ, hoặc mô tả bộ học liệu.
2. Frontend gửi một `multipart/form-data` tới Backend. Backend xác thực chủ sở hữu, tạo document ở trạng thái `processing`, rồi gọi AI_Backend. Tệp được chuyển nguyên vẹn; ghi chú được lập chỉ mục theo document ID; mô tả là yêu cầu tạo học liệu. AI_Backend trả bộ ban đầu và Backend lưu hướng dẫn học tập, câu hỏi Học thông minh và flashcard trước khi document chuyển sang `ready`. Quiz được sinh riêng khi người học chọn số lượng câu.
3. Người học xem ba nội dung trong các tab tương ứng. Hướng dẫn có thể yêu cầu AI chỉnh sửa; nội dung sửa tạo phiên bản mới và vẫn giữ nội dung cũ.
4. Học thông minh dùng bộ câu hỏi đã sinh. Khi hoàn tất hết câu hiện có, tài khoản Plus có thể yêu cầu sinh thêm; tài khoản thường thấy lời mời nâng cấp. Quyền phải được xác thực ở Backend, không chỉ ẩn nút ở FE.
5. Quiz có số lượng câu do người học chỉ định (trắc nghiệm và trả lời ngắn), được tạo riêng từ tài liệu.

## Đã quan sát trên Thea

- Tab Tài liệu của bộ tham chiếu có một tài liệu YouTube và tab Hỏi; điều hướng cùng bộ có Tài liệu, Hướng dẫn học tập, Học thông minh, Bài thẻ ghi nhớ, Bài kiểm tra.
- Hướng dẫn học tập có tab Hướng dẫn/Tóm tắt/Podcast và menu Hành động; nội dung hiện hữu gồm các phần có cấu trúc và phản hồi.
- Học thông minh hiển thị một câu hỏi, tiến độ, Cài đặt, Hiển thị câu trả lời và Bỏ qua. Không trả lời câu hỏi hay thay đổi tiến độ trong lượt kiểm tra này.
- Bài thẻ ghi nhớ có trạng thái tiến độ và bộ 34 thẻ.
- Bài kiểm tra có bộ đếm riêng cho câu trắc nghiệm và trả lời ngắn, độ khó, giới hạn thời gian và nút tạo. Bộ tham chiếu hiện có 13 câu.

## Đối chiếu giao diện ngày 20-10-2026

- Thea hiển thị modal nền phủ tối, tiêu đề “Cung cấp tài liệu của bạn”, các pill Tải lên/YouTube/Dán và nút “Tiếp tục mà không có tài liệu”. Khi chọn Tải lên, vùng nội dung đổi thành khung kéo-thả.
- INS giữ bố cục modal và trạng thái chọn nguồn này, thay YouTube bằng **Mô tả** theo phạm vi đã chốt. Nút hành động là “Tạo bộ học liệu”; không tiếp tục khi không có nguồn.

## Sai khác đã xử lý trong INS

- Thêm tài liệu gọi `POST /api/materials/{id}/initial-study-bundle`; không còn gọi `documents/index` từ Frontend hoặc tự tạo ba output từ trình duyệt.
- Hướng dẫn đang ghép nguyên văn tài liệu ở FE; thao tác Chỉnh sửa lưu văn bản cục bộ, chưa gửi instruction đến AI hoặc lưu version trên Backend.
- Học thông minh sinh câu hỏi từ `workspace.terms` ở FE; chưa dùng `study_question_sets`, chưa có trạng thái hết câu và luồng Plus tạo tiếp.
- Flashcard đang đọc `workspace.terms`; chưa đọc `flashcard_sets`/`flashcards` được sinh từ AI.
- Quiz đã có hai bộ đếm, nhưng tạo câu cục bộ, bị giới hạn bởi số thuật ngữ, chưa gọi API quiz với `question_count`.
- `GET /api/auth/me` và hồ sơ hiện không trả gói thành viên. GenerationService hiện chưa kiểm tra entitlement Plus.
- Backend nhận multipart, gửi tệp nguyên vẹn hoặc nội dung phù hợp sang AI_Backend, rồi lưu ba output có cấu trúc qua các bảng hiện có.
- AI_Backend có endpoint multipart PDF/DOCX sinh bộ ban đầu và API quiz riêng. Các route sinh riêng hiện chưa kiểm tra JWT/quota; quiz hiện giới hạn request ở 15 câu. Backend hiện không nạp tệp `documents` vào Qdrant trước khi gọi các endpoint sinh riêng.

## API triển khai

- `POST /api/materials/{materialId}/initial-study-bundle`: endpoint duy nhất Frontend dùng để tạo bộ ban đầu.
- `POST /api/v1/courses/generate`: API nội bộ Backend → AI_Backend. Nó nhận một trong `file`, `content`, hoặc `requirement`; client không gọi trực tiếp API này.
