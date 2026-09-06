# AFC PTIT Website

Website giới thiệu Câu lạc bộ Tài chính Kế toán PTIT, gồm các trang công khai (Trang chủ, Cơ cấu CLB, Hoạt động) và hệ thống Quản trị Admin (`/admin`) tích hợp cơ sở dữ liệu Supabase.

## Chạy trên máy

```bash
npm install
npm run dev
```

## Kiểm thử và build

```bash
npm run test:run
npm run build
```

## Cấu hình Supabase & Trang Quản trị (Admin)

Hệ thống hỗ trợ cập nhật nội dung linh hoạt trực tiếp từ giao diện Admin mà không cần sửa code:
- **Đường dẫn quản trị:** `/admin` (tự động chuyển hướng tới `/admin/login` nếu chưa đăng nhập).
- **Không có đăng ký công khai:** Tài khoản quản trị viên được tạo trực tiếp từ Supabase và phân quyền qua bảng `admin_profiles`.
- **Cơ chế Fallback an toàn (100% Zero-downtime):** Nếu chưa cấu hình Supabase hoặc mất kết nối mạng, website công khai tự động sử dụng dữ liệu tĩnh từ `src/data/` mà không bị gián đoạn hay lỗi trang.

### 1. Biến môi trường (.env)
Tạo tệp `.env` tại thư mục gốc (hoặc thiết lập Environment Variables trên Vercel):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-or-publishable-key
```

### 2. Chạy Migration tạo bảng & Storage Bucket
Vào **SQL Editor** trên Supabase Dashboard và dán nội dung tệp:
`supabase/migrations/202609060001_admin_content.sql` rồi nhấn **Run**.

Tệp SQL sẽ tự động tạo:
- Bảng `admin_profiles`
- Bảng `banners`, `events`, `event_images`, `departments`, `department_responsibilities`, `leaders`
- Storage bucket `afc-media` với các chính sách Row Level Security (RLS) bảo mật.

### 3. Tạo tài khoản Quản trị viên
1. Vào **Authentication** -> **Users** -> Nhấn **Add user** (nhập email và mật khẩu).
2. Copy `UID` của user vừa tạo.
3. Vào **Table Editor** -> Chọn bảng `admin_profiles` -> Thêm một dòng mới:
   - `id`: Dán UID vừa copy
   - `display_name`: Tên hiển thị (ví dụ: Quản trị viên AFC)
   - `role`: `super_admin` hoặc `admin`
   - `is_active`: `true`
4. Truy cập `/admin/login` trên web và đăng nhập!

---

## Cập nhật nội dung thủ công (Fallback static data)

- Thông tin chung và liên hệ: `src/data/siteInfo.ts`
- Cơ cấu bốn ban: `src/data/departments.ts`
- Ban điều hành: `src/data/leadership.ts`
- Danh sách hoạt động: `src/data/events.ts`

## Đưa lên Vercel

Import thư mục dự án vào Vercel. Framework Preset chọn Vite, Build Command là `npm run build`, Output Directory là `dist`. Điền các biến môi trường `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY`. Tệp `vercel.json` đã cấu hình rewrite toàn bộ URL (bao gồm cả `/admin/*`) để không bị lỗi 404.
