# Giao diện Chat Webhook n8n

Một giao diện chat đẹp mắt với hiệu ứng glass morphism để kiểm tra webhook n8n với các biến tùy chỉnh.

[🌐 Visit Site Online](https://n8nchatuivn.pvisa.io/)

## Tính năng

- Xác thực người dùng với Supabase
- Thiết kế UI glass morphism đẹp mắt
- Giao diện chat để kiểm tra webhook n8n
- Cấu hình biến tùy chỉnh
- Lịch sử chat dựa trên ID phiên
- Thiết kế responsive

## Cài đặt

1. Clone repository
```bash
git clone https://github.com/cnguyen14/n8nchatuivn.git
cd n8n-webhook-chat-ui
```

2. Cài đặt các gói phụ thuộc
```bash
npm install
```

3. Tạo file `.env` dựa trên `.env.example` và thêm thông tin đăng nhập Supabase của bạn
```bash
cp .env.example .env
```

4. Chỉnh sửa file `.env` với thông tin Supabase của bạn
```
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. Chạy máy chủ phát triển
```bash
npm run dev
```

## Cài đặt Supabase

### Tạo tài khoản và dự án Supabase

1. Truy cập [Supabase](https://supabase.com/) và đăng ký tài khoản
2. Tạo dự án mới
3. Sau khi dự án được tạo, lấy URL và Anon Key từ phần "Settings" > "API"
4. Cập nhật thông tin này vào file `.env` của bạn

### Thiết lập cơ sở dữ liệu

Để thiết lập cơ sở dữ liệu, chỉ cần làm theo các bước đơn giản sau:

1. Truy cập vào giao diện SQL Editor của Supabase từ dashboard
2. Tạo một "New Query"
3. Sao chép toàn bộ nội dung từ file `sql/schema.sql` trong dự án và dán vào editor
4. Nhấn "Run" để thực thi các câu lệnh SQL

Việc này sẽ tự động tạo tất cả các bảng cần thiết cho ứng dụng.


### Tắt xác nhận email (quan trọng)

Để đơn giản hóa quá trình đăng ký và đăng nhập trong môi trường phát triển, bạn nên tắt xác nhận email:

1. Trong dashboard Supabase, vào "Authentication" > "Providers"
2. Tìm phần "Email" và nhấp vào nút "Edit"
3. Tắt tùy chọn "Confirm email" bằng cách bỏ chọn hộp kiểm
4. Lưu thay đổi

Với cài đặt này, người dùng có thể đăng ký và đăng nhập ngay lập tức mà không cần xác nhận email.

## Sử dụng

1. Đăng ký hoặc đăng nhập vào tài khoản của bạn
2. Cấu hình URL webhook n8n trong trang Cài đặt
3. Thêm bất kỳ biến tùy chỉnh nào bạn muốn đưa vào yêu cầu webhook
4. Bắt đầu trò chuyện để kiểm tra webhook của bạn
5. Xem phản hồi từ webhook trong giao diện trò chuyện

## N8N webhook mẫu:
1. Tải file n8n JSON trong thư mục n8nwebhook
2. Upload lên n8n hosting
3. Activate workflow sau đó vào ứng dụng, copy webhook trong cài đặt rồi bấm test PING để kiểm tra xem có kết nối hay chưa
