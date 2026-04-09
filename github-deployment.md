# Hướng dẫn chi tiết Deploy lên GitHub cho người mới bắt đầu

Chào bạn! Dưới đây là các bước cực kỳ đơn giản để bạn đưa trang web AI Quiz này lên GitHub và chia sẻ với mọi người. Đừng lo nếu bạn không biết gì về lập trình, hãy làm theo từng bước nhé!

## Bước 1: Tạo tài khoản GitHub
1. Truy cập [github.com](https://github.com/).
2. Đăng ký một tài khoản miễn phí (nếu chưa có).

## Bước 2: Cài đặt Git (Chỉ cần làm 1 lần duy nhất)
1. Tải Git tại: [git-scm.com](https://git-scm.com/downloads).
2. Cài đặt với các tùy chọn mặc định (cứ nhấn Next liên tục).

## Bước 3: Tạo Repository (Kho lưu trữ) mới
1. Trên GitHub, nhấn vào dấu **+** ở góc trên bên phải, chọn **New repository**.
2. Đặt tên cho dự án (ví dụ: `ai-quiz-game`).
3. Chọn **Public**.
4. Nhấn **Create repository**.

## Bước 4: Đưa code lên GitHub
1. Mở thư mục chứa dự án của bạn trên máy tính.
2. Chuột phải vào khoảng trống trong thư mục, chọn **Git Bash Here** (hoặc mở Terminal).
3. Gõ các lệnh sau (thay `username` bằng tên GitHub của bạn):

```bash
# Khởi tạo git
git init

# Thêm tất cả file
git add .

# Lưu lại thay đổi
git commit -m "First commit"

# Kết nối với GitHub (Copy dòng này từ trang GitHub bạn vừa tạo)
git remote add origin https://github.com/username/ai-quiz-game.git

# Đẩy code lên
git push -u origin main
```

## Bước 5: Deploy (Đưa lên mạng)
Vì đây là ứng dụng Full-stack (có server), GitHub Pages thông thường sẽ không chạy được. Bạn nên dùng **Render** hoặc **Railway** (miễn phí và cực dễ):

### Cách dùng Render (Khuyên dùng):
1. Truy cập [render.com](https://render.com/) và đăng nhập bằng GitHub.
2. Nhấn **New** -> **Web Service**.
3. Chọn repository `ai-quiz-game` bạn vừa đẩy lên.
4. Thiết lập:
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. **Quan trọng**: Nhấn vào phần **Environment Variables** và thêm:
   - `GEMINI_API_KEY`: (Dán mã API Key của bạn vào đây)
6. Nhấn **Create Web Service**.

Đợi vài phút, Render sẽ cấp cho bạn một đường link (ví dụ: `ai-quiz.onrender.com`). Bạn có thể gửi link này cho bạn bè để cùng chơi!

---
**Lưu ý**: Nếu bạn gặp khó khăn, hãy hỏi AI ngay trong khung chat này nhé!
