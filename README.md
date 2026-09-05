# AFC PTIT Website

Website giới thiệu Câu lạc bộ Tài chính Kế toán PTIT, gồm ba trang: Trang chủ, Cơ cấu CLB và Hoạt động.

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

## Cập nhật nội dung

- Thông tin chung và liên hệ: `src/data/siteInfo.ts`
- Cơ cấu bốn ban: `src/data/departments.ts`
- Ban điều hành Gen 9: `src/data/leadership.ts`
- Danh sách hoạt động: `src/data/events.ts`
- Ảnh thành viên BĐH: thêm ảnh vào `public/images/leadership`, sau đó khai báo trường `image` cho thành viên tương ứng.

## Đưa lên Vercel

Import thư mục dự án vào Vercel. Framework Preset chọn Vite, Build Command là `npm run build`, Output Directory là `dist`. Tệp `vercel.json` đã cấu hình để truy cập trực tiếp các đường dẫn `/co-cau` và `/hoat-dong` không bị lỗi 404.
