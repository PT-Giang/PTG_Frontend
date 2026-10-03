export interface TopicLesson {
  title: string;
  overview: string;
  text: string;
  objectives: string[];
  sourceMode: "mock";
  topic: string;
  matched: boolean;
  note?: string;
}

interface LessonTemplate {
  keywords: string[];
  title: string;
  overview: string;
  objectives: string[];
  text: string;
}

const templates: LessonTemplate[] = [
  {
    keywords: ["quang hop", "photosynthesis", "sinh hoc", "biology"],
    title: "Nhập môn quang hợp ở thực vật",
    overview: "Bài mẫu giới thiệu cách cây chuyển năng lượng ánh sáng thành năng lượng hóa học và các bộ phận tham gia.",
    objectives: ["Mô tả nguyên liệu và sản phẩm của quang hợp", "Phân biệt diệp lục, lục lạp và khí khổng", "Giải thích vai trò của ánh sáng"],
    text: `Quang hợp: Quá trình dùng năng lượng ánh sáng để tổng hợp chất hữu cơ từ carbon dioxide và nước, đồng thời giải phóng oxygen ở thực vật.
Diệp lục: Sắc tố hấp thụ ánh sáng, góp phần cung cấp năng lượng cho quang hợp.
Lục lạp: Bào quan chứa hệ thống thực hiện quang hợp trong tế bào thực vật.
Khí khổng: Các lỗ nhỏ trên biểu bì lá, điều tiết trao đổi khí và thoát hơi nước.
Carbon dioxide: Khí cung cấp carbon để cây tổng hợp chất hữu cơ trong quang hợp.
Pha sáng: Nhóm phản ứng phụ thuộc ánh sáng, tạo ATP và NADPH, đồng thời giải phóng oxygen từ nước.

Ánh sáng cung cấp năng lượng; nước và carbon dioxide là nguyên liệu. Tốc độ quang hợp còn phụ thuộc nhiệt độ và lượng carbon dioxide. Cây cũng hô hấp cả ngày lẫn đêm.

Tự luyện
Giải thích vì sao nói cây lấy toàn bộ thức ăn từ đất là chưa đúng.
Vẽ sơ đồ nguyên liệu, nguồn năng lượng và sản phẩm của quang hợp.`,
  },
  {
    keywords: ["javascript", "java script", "lap trinh", "programming", "coding"],
    title: "Các khái niệm đầu tiên trong JavaScript",
    overview: "Bài mẫu về biến, kiểu dữ liệu, điều kiện và hàm trong JavaScript, phù hợp người mới học lập trình.",
    objectives: ["Phân biệt let và const", "Đọc được điều kiện và vòng lặp đơn giản", "Giải thích đầu vào và giá trị trả về của hàm"],
    text: `Biến: Tên dùng để tham chiếu đến một giá trị trong chương trình.
let: Từ khóa khai báo biến có phạm vi khối và có thể được gán lại.
const: Từ khóa khai báo liên kết có phạm vi khối không thể gán lại; nội dung của đối tượng được tham chiếu vẫn có thể thay đổi.
Boolean: Kiểu dữ liệu có hai giá trị true và false.
Hàm: Khối mã có thể gọi để thực hiện tác vụ, nhận tham số và trả về giá trị.
Mảng: Cấu trúc lưu một dãy phần tử theo thứ tự, với chỉ số bắt đầu từ 0.
Điều kiện if: Cấu trúc chỉ thực hiện một nhánh mã khi biểu thức điều kiện được đánh giá là đúng.

Dùng toán tử === để so sánh nghiêm ngặt, không tự chuyển đổi kiểu. Hàm không chạy chỉ vì được khai báo; cần gọi hàm. Vòng lặp cần điều kiện kết thúc phù hợp để tránh chạy vô hạn.

Tự luyện
Viết hàm cộng hai số và trả về kết quả.
Tạo mảng ba tên rồi đọc phần tử đầu tiên.`,
  },
  {
    keywords: ["tieng anh", "english", "ngu phap", "grammar"],
    title: "Tiếng Anh cơ bản — cấu trúc câu và hiện tại đơn",
    overview: "Bài mẫu luyện nhận diện thành phần câu và cách dùng thì hiện tại đơn trong tình huống cơ bản.",
    objectives: ["Nhận diện chủ ngữ, động từ và tân ngữ", "Dùng hiện tại đơn để nói về thói quen", "Phân biệt câu khẳng định, phủ định và nghi vấn"],
    text: `Chủ ngữ: Thành phần chỉ người hoặc vật mà câu nói đến, thường đứng trước động từ trong câu trần thuật tiếng Anh.
Động từ: Từ diễn tả hành động hoặc trạng thái.
Tân ngữ: Thành phần nhận tác động của động từ trong câu có ngoại động từ.
Hiện tại đơn: Thì thường dùng để nói về thói quen, sự thật chung và trạng thái tương đối ổn định.
Trợ động từ do: Từ hỗ trợ tạo câu hỏi và phủ định ở hiện tại đơn với động từ thường; dùng does cho chủ ngữ ngôi thứ ba số ít.
Trạng từ tần suất: Từ mô tả mức độ thường xuyên, chẳng hạn always, often hoặc sometimes.

Ví dụ khẳng định — She reads every day.
Ví dụ phủ định — She does not read every day.
Ví dụ nghi vấn — Does she read every day?
Sau does hoặc does not, động từ chính dùng dạng nguyên thể không to. Động từ be có cách tạo câu hỏi và phủ định riêng, không dùng do hoặc does.

Tự luyện
Viết ba câu nói về thói quen của bạn.
Chuyển câu He plays football thành câu phủ định và câu hỏi.`,
  },
  {
    keywords: ["dao ham", "tich phan", "giai tich", "calculus", "toan hoc", "hoc toan", "math"],
    title: "Giải tích cơ bản — giới hạn và đạo hàm",
    overview: "Bài mẫu giới thiệu trực giác về giới hạn, đạo hàm và tốc độ thay đổi của hàm số một biến.",
    objectives: ["Giải thích đạo hàm bằng tốc độ thay đổi", "Tính đạo hàm của hàm đa thức đơn giản", "Phân biệt giá trị hàm và đạo hàm tại một điểm"],
    text: `Hàm số: Quy tắc gán mỗi đầu vào thuộc miền xác định với đúng một đầu ra.
Giới hạn: Giá trị mà hàm số tiến gần tới khi biến đầu vào tiến gần một giá trị hoặc ra vô cực, nếu giá trị đó tồn tại.
Đạo hàm: Giới hạn của tỉ số thay đổi giá trị hàm trên thay đổi đầu vào khi thay đổi đầu vào tiến về 0, nếu giới hạn tồn tại.
Tiếp tuyến: Đường thẳng biểu diễn hướng của đồ thị tại một điểm khả vi; hệ số góc của nó là đạo hàm tại điểm đó.
Điểm dừng: Điểm thuộc miền xác định tại đó đạo hàm bằng 0; điểm dừng không nhất thiết là cực trị.
Nguyên hàm: Hàm có đạo hàm bằng hàm số đã cho trên một khoảng.

Với f(x) = x², đạo hàm f′(x) = 2x. Tại x = 3, giá trị hàm là 9 còn hệ số góc tiếp tuyến là 6. Đạo hàm của một hằng số bằng 0.

Tự luyện
Tính đạo hàm của f(x) = 3x² + 2x + 1.
Giải thích sự khác nhau giữa f(2) và f′(2).`,
  },
  {
    keywords: ["hoc tap", "cach hoc", "phuong phap hoc", "study skills", "ghi nho", "quan ly thoi gian"],
    title: "Kỹ năng học — tự nhớ lại và ôn tập",
    overview: "Bài mẫu giúp tổ chức một buổi học, tự kiểm tra hiểu biết và lên lịch ôn lại kiến thức.",
    objectives: ["Đặt mục tiêu học có thể kiểm tra", "Thực hành nhớ lại trước khi xem đáp án", "Điều chỉnh lịch ôn dựa trên câu trả lời sai"],
    text: `Mục tiêu học tập: Kết quả cụ thể mà người học muốn đạt được và có thể tự kiểm tra sau buổi học.
Nhớ lại chủ động: Tự tìm câu trả lời từ trí nhớ trước khi xem lại tài liệu.
Ôn tập ngắt quãng: Phân bố các lần ôn theo thời gian thay vì dồn toàn bộ vào một buổi.
Phản hồi: Thông tin giúp đối chiếu câu trả lời với đáp án và xác định điểm cần sửa.
Tự giải thích: Diễn đạt bằng lời của mình vì sao một ý tưởng hoặc bước giải hợp lý.
Nhật ký lỗi: Ghi lại câu trả lời sai, nguyên nhân và cách sửa để định hướng lần ôn tiếp theo.

Chọn một mục tiêu nhỏ, đọc phần liên quan rồi đóng tài liệu và tự trả lời câu hỏi. Kiểm tra lại, sửa lỗi và sắp xếp một lần ôn tiếp theo. Điều chỉnh khoảng cách ôn theo độ khó và mức nhớ thực tế.

Tự luyện
Viết ba câu hỏi cho nội dung vừa học.
Tự trả lời không nhìn tài liệu, sau đó ghi lại phần còn thiếu.`,
  },
];

function normalizeTopic(description: string): string {
  return description.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export async function createMockTopicLesson(description: string): Promise<TopicLesson> {
  const topic = description.trim();
  if (topic.length < 10 || topic.length > 2000) throw new Error("Mô tả chủ đề cần từ 10 đến 2.000 ký tự.");
  const normalized = ` ${normalizeTopic(topic)} `;
  const template = templates.find(candidate => candidate.keywords.some(keyword => normalized.includes(` ${keyword} `)));
  if (template) return {
    title: template.title, overview: template.overview, text: template.text, objectives: [...template.objectives],
    topic, sourceMode: "mock", matched: true,
    note: "Bài mẫu có sẵn được chọn theo từ khóa, chưa tùy biến theo toàn bộ yêu cầu và chưa tra cứu Internet. Hãy kiểm tra, chỉnh sửa trước khi lưu.",
  };
  return {
    title: `Khung bài học mẫu về ${topic.slice(0, 100)}${topic.length > 100 ? "…" : ""}`,
    overview: "Chưa có bài mẫu chuyên môn phù hợp. Đây là khung lập kế hoạch học để bạn tự bổ sung nội dung, không phải kiến thức được tạo cho chủ đề đã nhập.",
    text: "Mục tiêu học tập: Kết quả cụ thể cần đạt sau buổi học.\nTài liệu tham khảo: Nguồn nội dung cần đọc và kiểm tra độ tin cậy trước khi sử dụng.\nTự kiểm tra: Hoạt động trả lời câu hỏi rồi đối chiếu với tài liệu để nhận diện phần chưa hiểu.\n\nKhung để bạn hoàn thiện\nGhi ba điều bạn muốn hiểu về chủ đề.\nBổ sung kiến thức từ tài liệu đã kiểm tra.\nThêm các cặp thuật ngữ và định nghĩa chính xác.\nViết câu hỏi tự luyện rồi đối chiếu đáp án với tài liệu.",
    objectives: ["Xác định phạm vi chủ đề", "Bổ sung tài liệu chuyên môn đã kiểm tra", "Tạo câu hỏi để tự đánh giá"],
    topic, sourceMode: "mock", matched: false,
    note: "Không tìm thấy bài mẫu phù hợp. Các thuật ngữ trong khung nói về cách học, không mô tả chuyên môn của chủ đề. Chưa có kết nối AI hoặc tra cứu Internet.",
  };
}
