# 🌐 HƯỚNG DẪN TRIỂN KHAI TOÀN DIỆN HỆ THỐNG MARKETLINK (FULL-STACK CLOUD DEPLOYMENT)

Tài liệu này cung cấp hướng dẫn chi tiết từng bước (Step-by-Step / Cầm tay chỉ việc) để triển khai dự án **MarketLink — eGreen Basket (TechWiz 7)** từ môi trường lập trình local lên hạ tầng điện toán đám mây (Cloud Production) với độ sẵn sàng cao, bảo mật và chi phí $0 (gói miễn phí).

---

## 🏗️ 1. TỔNG QUAN KIẾN TRÚC TRIỂN KHAI CLOUD

Hệ thống được vận hành theo mô hình kiến trúc phân tán hiện đại, tách biệt hoàn toàn giữa Frontend, Backend API, WebSocket Realtime, Cơ sở dữ liệu quan hệ và Caching:

```
[ Trình duyệt Khách hàng / Nông dân / Quản trị viên ]
                   │
         ┌─────────┴─────────┐
         │ (HTTPS / Web)     │ (WSS / WebSocket Realtime)
         ▼                   ▼
┌──────────────────┐   ┌──────────────────────────────────────────────┐
│  VERCEL CLOUD    │   │  RENDER.COM (Web Service - Daphne ASGI)      │
│  Frontend SPA    │   │  Backend REST API + WebSocket Server         │
│  (React 19+Vite) │   │  - Django 5.2 / Django REST Framework        │
│  - Vercel Rewrites───┼─►- Media Asset Reverse Proxy (/media/...)    │
└──────────────────┘   └───────────────┬──────────────────────────────┘
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
         ┌─────────────────────────┐       ┌─────────────────────────┐
         │  AIVEN.IO               │       │  UPSTASH.COM            │
         │  MySQL 8.0 Cloud        │       │  Redis Cloud (TLS)      │
         │  - SSL Required         │       │  - rediss:// Protocol   │
         │  - 27 Domain Tables     │       │  - Session Blacklist    │
         │  - 8 Audit Tables       │       │  - Rate Limiting        │
         └─────────────────────────┘       │  - Channels Layer (WSS) │
                                           └─────────────────────────┘
```

---

## 🛠️ 2. TỔNG HỢP 7 LỖI THỰC TẾ & BƯỚC ĐIỀU CHỈNH KỸ THUẬT THEN CHỐT

Trong quá trình triển khai thực tế, hệ thống đã gặp và xử lý triệt để 7 lỗi sau:

### 1. Aiven MySQL từ chối kết nối do thiếu cấu hình SSL
* **Nguyên nhân**: Aiven MySQL Cloud bắt buộc mọi kết nối từ bên ngoài phải sử dụng SSL, trong khi Django MySQL mặc định kết nối không mã hóa.
* **Cách xử lý trong code**: Tại `backend/marketlink_core/settings.py`, bổ sung kiểm tra biến môi trường `DB_SSL`:
  ```python
  _db_options = {
      "charset": "utf8mb4",
      "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
      "isolation_level": "read committed",
  }
  if os.environ.get("DB_SSL", "False").lower() in ("true", "1", "t"):
      _db_options["ssl"] = {"ssl": {}}
  ```

### 2. Upstash Redis bị lỗi `CERTIFICATE_VERIFY_FAILED` với giao thức `rediss://`
* **Nguyên nhân**: URL Redis của Upstash dùng giao thức TLS `rediss://` (2 chữ `s`). `django-redis` và `channels-redis` mặc định xác thực chứng chỉ gắt gao gây lỗi kết nối.
* **Cách xử lý trong code**:
  - Bật `IGNORE_EXCEPTIONS: True` trong cache options để nếu Redis gặp sự cố, API chính vẫn không bị sập.
  - Bổ sung `ssl_cert_reqs: None` khi URL bắt đầu bằng `rediss://`:
  ```python
  if REDIS_URL.startswith("rediss://"):
      _REDIS_CACHE_OPTIONS["CONNECTION_POOL_KWARGS"] = {"ssl_cert_reqs": None}
      _channel_host["ssl_cert_reqs"] = None
  ```

### 3. Lỗi CORS và CSRF 403 Forbidden giữa Vercel và Render
* **Nguyên nhân**: Vercel sinh ra các subdomain preview động (`*.vercel.app`), trong khi backend chặn do không khớp origin.
* **Cách xử lý trong code**: Thêm regex origin trong `settings.py`:
  ```python
  CORS_ALLOWED_ORIGIN_REGEXES = [
      r"^https:\/\/.*\.vercel\.app$",
      r"^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$",
  ]
  ```

### 4. Mất toàn bộ ảnh Media sản phẩm / Chợ (Lỗi 404) khi `DEBUG=False`
* **Nguyên nhân**: Django mặc định không phục vụ file `/media/` khi tắt DEBUG vì lý do bảo mật.
* **Cách xử lý trong code**:
  1. Backend (`marketlink_core/urls.py`): Dùng `django.views.static.serve` bọc qua `re_path`:
     ```python
     re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
     ```
  2. Frontend (`frontend/vercel.json`): Cấu hình reverse proxy để Vercel forward request `/media/` sang Render:
     ```json
     {
       "rewrites": [
         {
           "source": "/media/:path*",
           "destination": "https://techwiz7-marketlink-egreen-basket.onrender.com/media/:path*"
         },
         {
           "source": "/(.*)",
           "destination": "/index.html"
         }
       ]
     }
     ```

### 5. Lỗi 404 khi người dùng F5 tải lại trang con trên Vercel (SPA Routing)
* **Nguyên nhân**: Trình duyệt yêu cầu file HTML vật lý cho đường dẫn con mà Vercel không có.
* **Cách xử lý**: Bổ sung rewrite rule `/(.*)` trỏ về `/index.html` trong `frontend/vercel.json`.

### 6. Render Build Failed do lệnh Seed Data bị lỗi trùng dữ liệu
* **Nguyên nhân**: Lệnh `seed_real_data` khi chạy lần 2 trở đi trên database đã có sẵn dữ liệu sẽ ném Exception. Do `build.sh` có `set -o errexit`, lỗi này làm dừng toàn bộ quá trình deploy.
* **Cách xử lý**: Thêm `|| true` trong `backend/build.sh`:
  ```bash
  python manage.py seed_real_data || true
  ```

### 7. WebSocket Realtime không chạy được nếu chạy bằng Gunicorn WSGI
* **Nguyên nhân**: Gunicorn chỉ chạy chuẩn WSGI đồng bộ, không hỗ trợ giao thức kết nối lâu dài của WebSocket.
* **Cách xử lý**: Đổi Start Command trên Render sang **Daphne (ASGI)**:
  ```bash
  daphne -b 0.0.0.0 -p $PORT marketlink_core.asgi:application
  ```

---

## 📋 3. HƯỚNG DẪN CÁC BƯỚC THỰC HIỆN CHI TIẾT (TỪ A ĐẾN Z)

---

### BƯỚC 1: TẠO MYSQL DATABASE TRÊN AIVEN.IO

1. Mở trình duyệt truy cập: **[https://console.aiven.io/signup](https://console.aiven.io/signup)**.
2. Chọn **"Sign up with GitHub"** (hoặc Google) để đăng nhập.
3. Bấm nút màu xanh **"Create service"** ở góc phải màn hình.
4. Chọn loại dịch vụ: Click vào logo **MySQL**.
5. Cấu hình dịch vụ:
   - **Cloud provider**: Chọn **AWS** (hoặc Google Cloud).
   - **Location / Region**: Chọn **`ap-southeast-1 (Singapore)`** để có tốc độ kết nối nhanh nhất về Việt Nam.
   - **Service plan**: Chọn gói **Free trial** (hoặc gói nhỏ nhất).
   - **Service name**: Điền `marketlink-mysql`.
6. Bấm nút **"Create service"** ở dưới cùng.
7. Chờ 2 - 3 phút để hệ thống khởi tạo. Khi trạng thái chuyển sang màu xanh lá **"Running"**:
   - Tại mục **Connection information**, copy các giá trị sau lưu vào Notepad:
     - **Host**: Ví dụ `mysql-3758bxxx.aivencloud.com`
     - **Port**: Ví dụ `14210` *(Lưu ý: Không phải 3306)*
     - **User**: Mặc định là `avnadmin`
     - **Password**: Bấm biểu tượng con mắt để xem và copy mật khẩu
     - **Database name**: Mặc định là `defaultdb`

---

### BƯỚC 2: TẠO REDIS DATABASE TRÊN UPSTASH.COM

1. Mở trình duyệt truy cập: **[https://console.upstash.com](https://console.upstash.com)**.
2. Bấm nút **"Sign in with GitHub"**.
3. Tại thanh điều hướng, chọn tab **Redis**.
4. Bấm nút màu xanh **"Create Database"**.
5. Điền thông tin:
   - **Name**: `marketlink-redis`
   - **Type**: Chọn **Regional**
   - **Region**: Chọn **`ap-southeast-1 (Singapore)`**
6. Bấm nút **"Create"**.
7. Lấy chuỗi kết nối:
   - Cuộn chuột xuống mục **"Connect to your database"**.
   - Tìm ô chứa chuỗi kết nối có dạng:
     ```text
     rediss://default:xxxxxxxxxxxxxxxxxxxx@xxxx.upstash.io:6379
     ```
     *(Phải bắt đầu bằng `rediss://` với 2 chữ `s`).*
   - Copy toàn bộ chuỗi này dán vào Notepad.

---

### BƯỚC 3: DEPLOY BACKEND LÊN RENDER.COM

1. Mở trình duyệt truy cập: **[https://dashboard.render.com](https://dashboard.render.com)**.
2. Bấm **"Sign in with GitHub"**.
3. Tại Dashboard của Render, bấm nút màu tím **"New +"** (góc trên bên phải) -> Chọn **"Web Service"**.
4. Chọn tùy chọn **"Build and deploy from a Git repository"** -> Bấm **Next**.
5. Trong danh sách kho lưu trữ, tìm repo `MarketLink-Project` -> Bấm nút **"Connect"**.  
   *(Nếu không thấy, bấm dòng chữ "Configure GitHub App" màu xanh bên dưới để chọn repo).*
6. Điền các thông số cơ bản:
   - **Name**: `techwiz7-marketlink-egreen-basket` (hoặc tên tùy chọn)
   - **Region**: `Singapore (Southeast Asia)`
   - **Branch**: `main` (hoặc nhánh chứa code mới nhất)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: 
     ```bash
     bash build.sh
     ```
   - **Start Command**: 
     ```bash
     daphne -b 0.0.0.0 -p $PORT marketlink_core.asgi:application
     ```
   - **Instance Type**: Tích chọn gói **Free** ($0/tháng).
7. Thêm biến môi trường:
   - Cuộn xuống mục **"Environment Variables"** -> Bấm **"Add Environment Variable"** và điền lần lượt:

| Tên biến (Key) | Giá trị (Value) |
| :--- | :--- |
| `DEBUG` | `False` |
| `SECRET_KEY` | `marketlink-super-secret-key-production-techwiz-2026` |
| `DB_HOST` | Dán Host từ Aiven |
| `DB_PORT` | Dán Port từ Aiven (ví dụ: `14210`) |
| `DB_USER` | `avnadmin` |
| `DB_PASSWORD` | Dán Password từ Aiven |
| `DB_NAME` | `defaultdb` |
| `DB_SSL` | `True` |
| `USE_REDIS` | `True` |
| `REDIS_URL` | Dán chuỗi `rediss://...` từ Upstash |
| `ALLOWED_HOSTS` | `*` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` *(tạm thời, lát sẽ sửa thành link Vercel)* |
| `GEMINI_API_KEY` | Dán Gemini API Key của bạn |
| `PYTHON_VERSION` | `3.11.9` |

8. Bấm nút **"Create Web Service"** ở dưới cùng.
9. Theo dõi màn hình **Logs**:
   - Render sẽ clone repo, chạy `pip install -r requirements.txt`.
   - Chạy `collectstatic`.
   - Chạy `migrate` tạo toàn bộ 27 bảng dữ liệu trên Aiven MySQL.
   - Chạy `seed_real_data` nạp dữ liệu mẫu ban đầu.
   - Khi log hiện: `==> Your service is live 🎉`, copy link Backend (ví dụ: `https://techwiz7-marketlink-egreen-basket.onrender.com`).

---

### BƯỚC 4: DEPLOY FRONTEND LÊN VERCEL

1. Mở trình duyệt truy cập: **[https://vercel.com](https://vercel.com)**.
2. Bấm **"Log In"** -> Chọn **"Continue with GitHub"**.
3. Tại trang quản trị Vercel, bấm nút **"Add New..."** ở góc phải -> Chọn **"Project"**.
4. Tìm repository `MarketLink-Project` -> Bấm nút **"Import"**.
5. Cấu hình dự án (Project Configuration):
   - **Framework Preset**: Chọn **Vite**.
   - **Root Directory**: Bấm nút **Edit** bên cạnh -> Chọn thư mục `frontend` -> Bấm **Continue**.
   - **Build and Output Settings**: Giữ nguyên mặc định (`npm run build`, output: `dist`).
   - **Environment Variables**: Mở rộng phần này và thêm:
     - Biến 1: Name = `VITE_API_URL` | Value = `/api` -> Bấm Add.
     - Biến 2: Name = `VITE_WS_URL` | Value = `wss://techwiz7-marketlink-egreen-basket.onrender.com/ws` *(Thay bằng link Render thật của bạn, nhớ dùng `wss://` thay vì `https://`)* -> Bấm Add.
6. Bấm nút **"Deploy"** màu xanh lớn ở dưới cùng.
7. Chờ khoảng 1 phút để Vercel build. Khi màn hình chúc mừng hiện ra, bấm vào ô Preview để mở website và copy đường link chính thức (ví dụ: `https://marketlink-egreen-basket.vercel.app`).

---

### BƯỚC 5: RÁP NỐI CORS & CSRF (BƯỚC BẮT BUỘC ĐỂ KHÔNG BỊ LỖI MẠNG)

1. Copy link website Vercel vừa có (ví dụ: `https://marketlink-egreen-basket.vercel.app`).
2. Mở lại Dashboard của **Render.com** -> Bấm vào Web Service `techwiz7-marketlink-egreen-basket`.
3. Chọn mục **"Environment"** ở thanh menu bên trái.
4. Cập nhật 2 biến:
   - Tìm biến `CORS_ALLOWED_ORIGINS` -> Sửa thành: `https://marketlink-egreen-basket.vercel.app` *(chú ý không để dấu gạch chéo `/` ở cuối)*.
   - Bấm "Add Environment Variable" thêm biến `CSRF_TRUSTED_ORIGINS`: `https://marketlink-egreen-basket.vercel.app`.
5. Bấm **"Save changes"**. Render sẽ tự động cập nhật và restart lại service trong 30 giây.

---

## 🔍 4. QUY TRÌNH KIỂM THỬ HỆ THỐNG SAU KHI DEPLOY

Sau khi hoàn tất, hãy mở trình duyệt ở **chế độ ẩn danh (Incognito)**, truy cập vào link Vercel và thực hiện kiểm thử:

1. **Kiểm tra hình ảnh Media**:
   - Trang chủ phải tải đầy đủ hình ảnh các chợ truyền thống (Chợ Bến Thành, Ba Chiểu, Thủ Đức...) và ảnh các loại nông sản.
   - Bấm F12 -> tab Network kiểm tra các request `/media/...` đều trả về mã `200 OK`.
2. **Kiểm tra Đăng nhập & Phân quyền**:
   - **Tài khoản Admin**:
     - Email: `admin@marketlink.vn`
     - Mật khẩu: `Pass@123`
     - Kiểm tra: Vào được trang Quản trị, xem Dashboard thống kê doanh thu, danh sách chợ, kiểm duyệt nông dân.
   - **Tài khoản Khách hàng**:
     - Email: `alice.johnson@example.com`
     - Mật khẩu: `Pass@123`
     - Kiểm tra: Xem giỏ hàng, đặt hàng pre-order tại sạp, xem lịch sử đơn hàng.
   - **Tài khoản Nông dân**:
     - Email: `farmer.duc@example.com`
     - Mật khẩu: `Pass@123`
     - Kiểm tra: Vào Dashboard nông dân, quản lý tồn kho, duyệt đơn hàng.
3. **Kiểm tra WebSocket Realtime**:
   - Biểu tượng quả chuông thông báo góc trên màn hình kết nối thành công (không bị báo lỗi mất kết nối).
   - Thử đặt một đơn hàng hoặc bấm cập nhật trạng thái đơn để thấy thông báo đẩy tức thì.
4. **Kiểm tra Chatbot AI**:
   - Mở cửa sổ chat ở góc dưới màn hình.
   - Đặt câu hỏi thử nghiệm: *"Chợ Thủ Đức mở cửa mấy giờ và có sạp nào bán rau muống không?"*.
   - Chatbot gọi tool nội bộ và trả lời chính xác thông tin thực tế từ database.

---

## 🆘 5. XỬ LÝ SỰ CỐ NHANH (TROUBLESHOOTING)

| Hiện tượng | Nguyên nhân phổ biến | Cách khắc phục ngay |
| :--- | :--- | :--- |
| **API báo lỗi Network Error / CORS Blocked** | Chưa cập nhật link Vercel vào Render hoặc thừa dấu `/` ở cuối | Vào Render -> Environment -> kiểm tra `CORS_ALLOWED_ORIGINS` phải là `https://xxx.vercel.app` (không có dấu `/` cuối). |
| **Render báo Build Failed ở bước database** | Aiven chưa bật hoặc sai thông tin Host/Port/Password | Vào Aiven kiểm tra trạng thái có màu xanh lá "Running" không; kiểm tra lại `DB_SSL=True`. |
| **WebSocket liên tục báo disconnected** | Vercel cấu hình link WS dùng `https://` thay vì `wss://` | Vào Vercel -> Settings -> Environment Variables -> sửa `VITE_WS_URL` thành `wss://...` rồi Redeploy. |
| **Ảnh sản phẩm bị lỗi 404** | Chưa có rewrite trong `vercel.json` | Kiểm tra file `frontend/vercel.json` xem đúng domain Render trong mục rewrite `/media/:path*` chưa. |
