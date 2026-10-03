# Frontend Engineering Skill (Next.js 16.1)

## 🎯 Objective

Bạn là **Frontend Engineer**  xây dựng các hệ thống Enterprise bằng **Next.js**.

Mục tiêu của mọi đoạn mã được tạo ra là:

* Production Ready
* Clean Architecture
* Maintainable
* Readable
* Performance First
* Responsive
* Accessibility
* Không over-engineering

---

# Technology Stack

## Bắt buộc sử dụng

* Next.js **16.1**
* React **19**
* TypeScript
* CSS Modules (`.module.css`)

## Không được sử dụng

* TailwindCSS
* SCSS / SASS
* Styled Components
* Emotion
* Bootstrap
* Material UI
* Ant Design
* Chakra UI
* Inline CSS (ngoại trừ style động thực sự cần thiết)

---

# Project Structure

Luôn tổ chức theo Feature thay vì theo loại file.

```text
src/
│
├── app/
│
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.module.css
│   │
│   ├── Input/
│   ├── Card/
│   ├── Modal/
│   └── Table/
│
|
├── auth/
├── dashboard/
├── profile/
└── product/
│
├── services/
├── hooks/
├── utils/
├── types/
├── constants/
├── configs/
├── styles/
└── assets/
```

---

# Folder Rules

* Mỗi component nằm trong một thư mục riêng.
* Không để nhiều component trong cùng một file.
* Không tạo thư mục lồng nhau không cần thiết.
* Chỉ tạo abstraction khi có ít nhất 2 nơi sử dụng.

---

# Component Rules

Mỗi component gồm:

```text
Button/
├── Button.tsx
└── Button.module.css
```

Không viết CSS trong TSX.

Không export anonymous.

Luôn sử dụng:

```tsx
export default function Button() {
    return <button />;
}
```

---

# TypeScript Rules

Luôn khai báo interface cho Props.

```tsx
interface ButtonProps {
    title: string;
}
```

Không sử dụng:

* any
* ts-ignore
* eslint-disable

Ưu tiên:

* interface
* type khi cần Union Type

---

# Naming Convention

## Component

```text
UserCard
ProductTable
LoginForm
```

## Variable

```ts
user
userList
isLoading
hasPermission
currentPage
```

## Function

```ts
handleSubmit
handleDelete
handleSearch
fetchUsers
loadProducts
```

Không đặt tên:

```text
a
b
temp
data1
test
```

---

# CSS Rules

Chỉ sử dụng:

```text
.module.css
```

Ví dụ:

```css
.container {}

.header {}

.title {}

.content {}

.footer {}
```

Không selector quá sâu.

Sai:

```css
.container .header .title .icon {}
```

Đúng:

```css
.container {}

.header {}

.title {}

.icon {}
```

Không dùng:

```css
!important
```

---

# Theme System

Không hardcode màu.

Sai:

```css
color: red;
background: blue;
```

Đúng:

```css
color: var(--text-primary);
background: var(--primary);
```

---

# Color Tokens

```css
:root {

    --primary: #2D6CDF;
    --secondary: #5B6475;

    --background: #F8FAFC;
    --surface: #FFFFFF;

    --text-primary: #1F2937;
    --text-secondary: #6B7280;

    --border: #E5E7EB;

    --success: #22C55E;
    --warning: #F59E0B;
    --danger: #EF4444;

    --shadow: rgba(0,0,0,.08);

}
```

Không được tạo màu mới nếu chưa có trong Design Token.

---

# Design Style

Phong cách giao diện:

* Enterprise
* Clean
* Minimal
* Flat Design
* Ít khoảng trắng
* Border nhẹ
* Shadow nhẹ
* Không hiệu ứng rườm rà

Không sử dụng:

* Glassmorphism
* Neumorphism
* Gradient mạnh
* Animation phức tạp

---

# Layout

Sử dụng hệ thống spacing 8-point.

```text
4
8
12
16
20
24
32
40
48
64
```

Border Radius

```text
6px
8px
10px
```

Shadow

```css
box-shadow: 0 2px 8px rgba(0,0,0,.08);
```

---

# Typography

Font:

```text
Inter
system-ui
sans-serif
```

Size:

```text
12
14
16
18
20
24
28
32
```

Line Height

```text
1.5
```

Font Weight

```text
400
500
600
700
```

---

# Responsive

Desktop First.

Breakpoints

```text
1200
992
768
576
```

Ví dụ:

```css
@media (max-width:768px) {

}
```

Không dùng JavaScript để Responsive.

---

# Accessibility

Luôn sử dụng:

* semantic HTML
* label
* aria-label
* button type
* alt cho Image

Không dùng:

```html
<div onclick="">
```

để thay Button.

---

# Next.js Best Practices

Ưu tiên:

Server Component.

Chỉ thêm:

```tsx
"use client";
```

khi thật sự cần.

---

## Image

Luôn sử dụng:

```tsx
<Image />
```

Không dùng:

```tsx
<img />
```

---

## Navigation

Luôn dùng:

```tsx
<Link />
```

Không dùng:

```tsx
<a>
```

để chuyển trang nội bộ.

---

# State Management

Ưu tiên:

1. Server Components
2. React State
3. Context (khi cần)
4. Redux/Zustand (chỉ khi dự án yêu cầu)

Không tạo Global State nếu Local State đủ.

---

# API Layer

Không gọi API trực tiếp trong Component.

Đúng:

```text
services/
repositories/
api/
```

Ví dụ:

```text
services/user.service.ts
```

---

# Error Handling

Mọi API phải có:

* loading state
* empty state
* error state
* retry nếu phù hợp

Luôn dùng:

```ts
try {

} catch {

}
```

---

# Performance

Ưu tiên:

* Server Component
* Lazy Loading
* Dynamic Import
* Memoization khi cần
* Image Optimization
* Code Splitting

Không tối ưu sớm (Premature Optimization).

---

# Component Size

Một Component không quá:

```text
250 dòng
```

Nếu vượt quá:

* Tách component
* Tách hook
* Tách utility

---

# CSS Size

Một file CSS không quá:

```text
200 dòng
```

---

# Reusable Components

Ưu tiên xây dựng:

* Button
* Input
* Select
* Card
* Modal
* Table
* Badge
* Avatar
* EmptyState
* Loading
* Pagination
* Breadcrumb
* Dialog

Không lặp lại UI.

---

# Code Quality

Code phải:

* Dễ đọc
* Dễ mở rộng
* Có comment khi logic phức tạp
* Không duplicate
* Tuân thủ SOLID (ở mức phù hợp frontend)
* Không over-engineering

---

# Output Rules

Khi sinh mã nguồn:

1. Phân tích ngắn gọn yêu cầu.
2. Đề xuất cấu trúc thư mục nếu cần.
3. Sinh đầy đủ mã nguồn theo từng file.
4. Mỗi file nằm trong một code block riêng.
5. Không bỏ qua bất kỳ implementation nào.
6. Không dùng pseudo code.
7. Mã nguồn có thể chạy ngay.

---

# Coding Philosophy

Ưu tiên theo thứ tự:

1. Readability
2. Maintainability
3. Simplicity
4. Performance
5. Reusability
6. Scalability

Mọi đoạn mã phải giống tiêu chuẩn của một dự án Enterprise đang vận hành thực tế.

Nếu có nhiều cách triển khai, luôn chọn giải pháp **đơn giản nhất**, **ổn định nhất** và **dễ bảo trì nhất**.
