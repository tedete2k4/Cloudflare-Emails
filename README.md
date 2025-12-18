# Cloudflare-Emails
📬 Cloudflare Worker Email Inbox

Một Email Inbox tối giản nhưng mạnh mẽ, chạy 100% trên Cloudflare Workers, không cần server, không cần database truyền thống.

👉 Nhận email → lưu vào KV → xem qua web UI
👉 Có login, search, đọc HTML email, giao diện đẹp, mobile friendly

✨ Tính năng

📥 Nhận email bằng Cloudflare Email Routing

🗄️ Lưu email vào Cloudflare KV

🔐 Login bảo vệ inbox bằng mật khẩu

🔍 Search theo subject / sender

🟢 Đánh dấu email mới / đã đọc

⏱️ Hiển thị thời gian dạng 5 minutes ago

📨 Xem Plain text / HTML email

🎨 Giao diện đẹp, responsive, không framework

⚡ Deploy trực tiếp trên Cloudflare Dashboard

🧱 Kiến trúc
Email
  ↓
Cloudflare Email Routing
  ↓
Cloudflare Worker
  ↓
KV Namespace (EMAILS)
  ↓
Web Inbox UI

📦 Yêu cầu

Tài khoản Cloudflare

Đã bật Workers

Đã bật Email Routing

Không cần:

VPS

Database

Framework

NPM

🚀 Cách deploy (CHO NGƯỜI MỚI)
1️⃣ Tạo Worker

Vào Cloudflare Dashboard

Workers & Pages

Create Worker

Đặt tên (ví dụ: email)

Create

2️⃣ Tạo KV Namespace

Workers & Pages → KV

Create namespace

Name:

EMAILS

3️⃣ Gắn KV vào Worker

Mở Worker vừa tạo

Settings → Variables and Secrets

Mục KV Namespace Bindings

Add:

Variable name: EMAILS

Namespace: EMAILS

Save and Deploy

4️⃣ Tạo mật khẩu login

Trong Variables and Secrets:

Name	Value
INBOX_PASSWORD	mật_khẩu_của_bạn

👉 Ví dụ:

INBOX_PASSWORD = 123456


👉 Save and Deploy

5️⃣ Dán code Worker

Mở tab Code Editor

Xóa toàn bộ code mặc định

Dán file worker.js trong repo này

Save and Deploy

6️⃣ Bật Email Routing

Email → Email Routing

Add destination → Worker

Chọn worker email-inbox

Add rule:

Any address → Worker

👉 Gửi email thử tới domain của bạn

🧪 Kiểm tra hoạt động
Truy cập inbox
https://<worker-name>.<account>.workers.dev


Chưa login → tự chuyển /login

Nhập mật khẩu → vào inbox

Gửi email test

Gửi email tới domain đã routing

Reload inbox

Email xuất hiện 🎉

🔐 Bảo mật

Login bằng cookie auth=1

Cookie HttpOnly

HTML email render bằng:

<iframe sandbox>


→ Không chạy JS, không truy cập cookie

📁 Cấu trúc dữ liệu email (KV)
{
  "id": "1700000000000",
  "from": "user@gmail.com",
  "to": "inbox@domain.com",
  "subject": "Hello",
  "body": "Plain text content",
  "htmlBody": "<html>...</html>",
  "date": "2025-12-18T12:00:00Z",
  "isRead": false
}

🛠️ Tuỳ chỉnh
Đổi mật khẩu

Chỉ cần sửa INBOX_PASSWORD trong Dashboard

Không cần sửa code

Đổi giao diện

CSS nằm trong hàm page() trong worker.js

❌ Lỗi thường gặp
Website không vào /login

👉 Mở tab ẩn danh hoặc clear cache

Error 1101

👉 Kiểm tra:

KV đã bind chưa

Variable EMAILS đúng tên chưa

📌 Roadmap (gợi ý)

📄 Pagination

📎 Attachment

🌙 Dark mode

🔔 Telegram / Discord notify

👥 Multi-user login

🤝 Đóng góp

Pull request và issue đều được chào đón 👍
Repo phù hợp cho:

Học Cloudflare Workers

Email tooling

Serverless inbox

📄 License

MIT License
Sử dụng tự do cho cá nhân & thương mại
