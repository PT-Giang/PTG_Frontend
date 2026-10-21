# INS — ERD PostgreSQL (bản lịch sử 21 bảng)

**Trạng thái:** Bản ERD này mô tả phương án cũ 21 bảng và được giữ làm lịch sử. Phương án hiện hành là [plan PostgreSQL 22 bảng](./INS-MINIMAL-DATABASE-PLAN.md), bổ sung `generation_sources`, danh mục `missions` dùng chung và `mission_progress` theo từng user; dùng nguồn cho citations thay cho `messages.citations`, và quy định share nội dung dạng bản sao không kèm tiến độ.

## Cách đọc

- `||`: đúng một; `o|`: không hoặc một; `o{`: không hoặc nhiều.
- `PK`: khóa chính; `FK`: khóa ngoại; `UK`: khóa duy nhất.
- Các cột ghi `nullable` là quan hệ không bắt buộc.
- Tên cột và kiểu dữ liệu dưới đây là đề xuất chi tiết hóa từ plan; chưa phải schema đã được duyệt. Sơ đồ ưu tiên khóa và trường nghiệp vụ chính, không liệt kê mọi trường audit.

## Ghi chú lịch sử

1. Bản gốc thực tế có 23 bảng dù ghi 26. Phương án hiện hành: 23 − 2 bảng được gộp = **21 bảng**.
2. `user_profiles` xuất hiện trong phần ánh xạ nhưng không có trong danh sách bảng. ERD tạm giữ hồ sơ trong `users`, theo nhóm A.
3. Chia sẻ bằng snapshot qua Redis; Redis không nằm trong ERD PostgreSQL và không phát sinh bảng chia sẻ.
4. `messages.sender_role` biểu thị user/assistant/system; người sở hữu hội thoại được xác định qua `conversations.user_id`. Nếu cần lưu nhiều người gửi thật, phải bổ sung `sender_user_id`.
5. `question_feedback` tạm cho tối đa một đánh giá trên mỗi câu hỏi của một phiên; plan chưa chốt số lần phản hồi.

## ERD tổng thể — 21 bảng

```mermaid
erDiagram
    users ||--o{ classes : owns
    users ||--o{ study_materials : owns
    classes o|--o{ study_materials : groups
    study_materials ||--o{ documents : contains
    study_materials ||--o{ terms : contains
    documents o|--o{ terms : supplies
    users ||--o{ term_progress : learns
    terms ||--o{ term_progress : tracks
    users ||--o{ generation_jobs : requests
    study_materials ||--o{ generation_jobs : processes
    generation_jobs ||--o{ generation_sources : references
    generation_jobs o|--o{ documents : produces
    generation_jobs o|--o{ learning_artifacts : produces
    study_materials ||--o{ learning_artifacts : contains
    learning_artifacts ||--o{ artifact_sources : traces
    documents ||--o{ artifact_sources : supplies
    users ||--o{ study_settings : configures
    study_materials ||--o{ study_settings : has
    users ||--o{ study_sessions : starts
    study_materials ||--o{ study_sessions : used_in
    study_sessions ||--o{ session_questions : contains
    terms o|--o{ session_questions : originates
    session_questions ||--o{ question_options : offers
    session_questions ||--o| question_responses : receives
    session_questions ||--o| question_feedback : receives
    users ||--o{ legacy_progress_baselines : imports
    study_materials ||--o{ legacy_progress_baselines : preserves
    users ||--o{ conversations : owns
    study_materials ||--o{ conversations : concerns
    conversations ||--o{ messages : contains
    users ||--o{ subscriptions : subscribes
    plans ||--o{ subscriptions : defines
```

## 1. Tài khoản, lớp và thư viện

```mermaid
erDiagram
    users {
        uuid id PK
        text email UK "normalized"
        text password_hash "nullable if no password login"
        text display_name
        text status
        integer level
        timestamptz created_at
        timestamptz updated_at
    }
    classes {
        uuid id PK
        uuid owner_id FK
        text name
    }
    study_materials {
        uuid id PK
        uuid owner_id FK
        uuid class_id FK "nullable"
        text title
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at "nullable - soft delete"
    }
    documents {
        uuid id PK
        uuid material_id FK
        uuid generation_job_id FK "nullable"
        text title
        text source_type
        text extracted_text
        text file_path "nullable"
        text source_url "nullable"
        text processing_status
        text error_message "nullable"
    }
    users ||--o{ classes : owns
    users ||--o{ study_materials : owns
    classes o|--o{ study_materials : groups
    study_materials ||--o{ documents : contains
```

**Toàn vẹn:** lớp và học liệu phải cùng chủ sở hữu. Học liệu không chọn lớp có `class_id = NULL`. Khóa ngoại đơn trên `class_id` chưa đủ bảo đảm cùng chủ sở hữu; thiết kế vật lý cần khóa ngoại ghép hoặc kiểm tra tương đương.

## 2. Thẻ, tiến độ và tạo nội dung

```mermaid
erDiagram
    terms {
        uuid id PK
        uuid material_id FK
        uuid document_id FK "nullable - manual term"
        text term
        text definition
        timestamptz created_at
        timestamptz updated_at
        timestamptz archived_at "nullable"
    }
    term_progress {
        uuid user_id PK,FK
        uuid term_id PK,FK
        smallint level "0 to 3"
        integer review_count
        integer correct_count
        timestamptz last_reviewed_at "nullable"
        timestamptz next_review_at "nullable"
    }
    generation_jobs {
        uuid id PK
        uuid requester_id FK
        uuid material_id FK
        text job_type
        text prompt
        text mode "mock or ai"
        text status "queued running succeeded failed"
        text idempotency_key
        text request_fingerprint
        timestamptz created_at
        timestamptz started_at "nullable"
        timestamptz completed_at "nullable"
        text error_message "nullable"
    }
    generation_sources {
        uuid id PK
        uuid job_id FK
        text title
        text url "nullable for mock source"
        text excerpt
        boolean is_mock
        timestamptz retrieved_at "nullable for mock source"
    }
    learning_artifacts {
        uuid id PK
        uuid material_id FK
        uuid generation_job_id FK "nullable"
        text artifact_type "guide summary podcast"
        text content
        integer version
        text origin "manual mock ai"
        text audio_path "nullable"
    }
    artifact_sources {
        uuid artifact_id PK,FK
        uuid document_id PK,FK
    }
    users ||--o{ term_progress : learns
    study_materials ||--o{ terms : contains
    documents o|--o{ terms : supplies
    terms ||--o{ term_progress : tracks
    users ||--o{ generation_jobs : requests
    study_materials ||--o{ generation_jobs : processes
    generation_jobs ||--o{ generation_sources : references
    generation_jobs o|--o{ documents : produces
    generation_jobs o|--o{ learning_artifacts : produces
    study_materials ||--o{ learning_artifacts : contains
    learning_artifacts ||--o{ artifact_sources : has
    documents ||--o{ artifact_sources : supplies
```

**Ràng buộc đề xuất:**

- PK ghép `(user_id, term_id)` lưu một tiến độ cho mỗi người/thẻ.
- `0 <= correct_count <= review_count`, `0 <= level <= 3`.
- UNIQUE `(requester_id, idempotency_key)`; so sánh `request_fingerprint` để từ chối cùng khóa nhưng khác yêu cầu.
- UNIQUE `(material_id, artifact_type, version)` nếu phiên bản được đánh số riêng theo loại nội dung.
- Tài liệu/thẻ, tài liệu/job và artifact/job phải cùng học liệu. Các liên kết `artifact_sources` cũng phải bảo đảm điều này.

## 3. Luyện tập, kiểm tra và lịch sử

```mermaid
erDiagram
    study_settings {
        uuid user_id PK,FK
        uuid material_id PK,FK
        text difficulty
        jsonb question_types
        text custom_instructions
    }
    study_sessions {
        uuid id PK
        uuid user_id FK
        uuid material_id FK
        text mode "smart test flashcards matching"
        text status
        jsonb settings_snapshot
        timestamptz started_at
        timestamptz ended_at "nullable"
    }
    session_questions {
        uuid id PK
        uuid session_id FK
        uuid source_term_id FK "nullable"
        text question_type
        integer position
        text prompt_snapshot
        jsonb answer_snapshot
        text explanation_snapshot
    }
    question_options {
        uuid id PK
        uuid question_id FK
        integer position
        text content
    }
    question_responses {
        uuid question_id PK,FK
        jsonb response
        text result "correct incorrect revealed skipped"
        timestamptz answered_at
        integer duration_ms
    }
    question_feedback {
        uuid question_id PK,FK
        text rating "positive negative"
        text comment "nullable"
    }
    legacy_progress_baselines {
        uuid user_id PK,FK
        uuid material_id PK,FK
        integer answered_count
        integer correct_count
        timestamptz imported_at
    }
    users ||--o{ study_settings : configures
    study_materials ||--o{ study_settings : has
    users ||--o{ study_sessions : starts
    study_materials ||--o{ study_sessions : used_in
    study_sessions ||--o{ session_questions : contains
    terms o|--o{ session_questions : originates
    session_questions ||--o{ question_options : offers
    session_questions ||--o| question_responses : receives
    session_questions ||--o| question_feedback : receives
    users ||--o{ legacy_progress_baselines : imports
    study_materials ||--o{ legacy_progress_baselines : preserves
```

**Toàn vẹn:** UNIQUE `(session_id, position)` và `(question_id, position)` cho thứ tự câu hỏi/lựa chọn. Một câu chỉ có một đáp án cuối cùng. `answer_snapshot` chứa đáp án chuẩn tại thời điểm tạo câu; `response` chứa lựa chọn/văn bản/cặp ghép của người học. Không lấy đáp án hiện tại của `terms` để chấm lại lịch sử. Thẻ nguồn, nếu có, phải thuộc học liệu của phiên.

Baseline dùng PK ghép người/học liệu để tránh nhập trùng bộ đếm. Mốc chuyển đổi và phạm vi kết quả cũ cần chốt trước khi cộng baseline với lịch sử mới. Không dựng câu hỏi giả cho số tổng cũ.

## 4. Hội thoại và trích dẫn

```mermaid
erDiagram
    conversations {
        uuid id PK
        uuid user_id FK
        uuid material_id FK
        timestamptz created_at
    }
    messages {
        uuid id PK
        uuid conversation_id FK
        text sender_role "user assistant system"
        text content
        text generation_mode "manual extractive mock ai"
        jsonb citations "array of document_id and excerpt"
        timestamptz created_at
    }
    users ||--o{ conversations : owns
    study_materials ||--o{ conversations : concerns
    conversations ||--o{ messages : contains
```

Citations đã gộp vào messages dưới dạng JSONB; document_id bên trong JSON không được FK trực tiếp kiểm tra. Backend phải xác minh tài liệu trích dẫn tồn tại và thuộc học liệu của hội thoại khi ghi. Quyền xem học liệu không bao gồm quyền xem hội thoại của người khác.

## 5. Gói dịch vụ

```mermaid
erDiagram
    plans {
        uuid id PK
        text code UK
        text name
        text billing_cycle
        bigint price_minor
        text currency
        boolean is_demo
        jsonb features "feature permissions and quotas"
    }
    subscriptions {
        uuid id PK
        uuid user_id FK
        uuid plan_id FK
        timestamptz starts_at
        timestamptz ends_at "nullable"
        text status
        boolean is_mock
    }
    users ||--o{ subscriptions : has_history
    plans ||--o{ subscriptions : defines
```

Một người có nhiều đăng ký trong lịch sử nhưng tối đa một bản ghi `status = active`: cần unique index có điều kiện trên `user_id`. Quyền Plus phải kiểm tra cả thời hạn. Không có Plus hợp lệ thì áp dụng Free. `price_minor >= 0`; nếu có hạn mức trong features thì `quota >= 0`; backend kiểm tra cấu trúc từng quyền lợi. Features là JSON object, citations là JSON array.

## 6. Chia sẻ bằng snapshot qua Redis

Liên kết chia sẻ và snapshot tạm là dữ liệu cache/hạ tầng, không thuộc schema PostgreSQL nên không có bảng hoặc quan hệ trong ERD. Khi người nhận chấp nhận link, backend tạo transaction sao chép học liệu cùng các bản ghi phụ thuộc với UUID mới và `owner_id` là người nhận. Bản sao độc lập; hết hạn hoặc thu hồi token chỉ ngăn nhận thêm, không thu hồi bản sao đã tạo.
## Ghi chú triển khai

- Quan hệ trong sơ đồ không mặc nhiên đồng nghĩa `ON DELETE CASCADE`; chính sách xóa phải chốt theo lịch sử và quyền riêng tư.
- Ưu tiên xóa mềm/lưu trữ học liệu và thẻ. Bản chụp câu hỏi, đáp án và kết quả cần được bảo toàn.
- Các quan hệ phải cùng học liệu/chủ sở hữu cần ràng buộc ghép hoặc cơ chế kiểm tra phù hợp; FK đơn lẻ không đủ.
- Tên lớp duy nhất theo chủ sở hữu và trường màu lớp đã được bổ sung trong migration để khớp frontend.
- Không có bảng `material_shares`; liên kết chia sẻ và snapshot lưu tạm ở Redis khi luồng chia sẻ được triển khai.
