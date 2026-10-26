# MarketLink — Danh sách đầy đủ tính năng

Oct 26, 2026 · @LongNguyen

Bản liệt kê đầy đủ, **mỗi dòng một tính năng**, không gom. Phần I là yêu cầu của đề bài (SRS), tách đúng từng ý trong SRS mục 1.5–1.7. Phần II là tính năng mở rộng nhóm làm thêm, mỗi dòng có lý do. Cột **Quyết định** để nhóm chọn Giữ / Gộp / Chỉ nói khi hỏi / Bỏ. Bản cũ "MarketLink — Khung thuyết trình bảo vệ" vẫn giữ nguyên.

## Phần I.1 — Yêu cầu đề bài: Khách hàng

### Đăng ký và đăng nhập (SRS: User Registration and Login)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| K1 | Đăng ký tài khoản khách | Form đăng ký, kiểm tra trùng email / SĐT | /register |  |
| K2 | Bắt buộc nhập họ tên, SĐT, email, địa chỉ khi đăng ký | Kiểm tra cả ở form và server; SĐT chuẩn hóa về dạng 0xxxxxxxxx | /register |  |
| K3 | Đăng nhập an toàn | JWT, mật khẩu băm PBKDF2, giới hạn số lần thử | /login |  |
| K4 | Vào dashboard cá nhân | Số đơn đang mở, lần nhận sắp tới, sạp yêu thích | /customer |  |
| K5 | Lưu nhiều sạp yêu thích | Nút trái tim trên sạp | /customer/favorites |  |
| K6 | Lưu nhiều sản phẩm yêu thích | Nút trái tim trên sản phẩm | /customer/favorites |  |
| K7 | Dùng chung tài khoản trong gia đình (tùy chọn) | Nhiều thiết bị cùng đăng nhập, mỗi máy một phiên và một giỏ | — |  |

### Duyệt chợ và nông dân (SRS: Browse Markets and Farmers)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| K8 | Xem chợ gần mình theo vị trí | Nút Near me lấy GPS, sắp chợ gần nhất trước | /markets |  |
| K9 | Lọc chợ theo ngày họp | Chọn thứ trong tuần | /markets |  |
| K10 | Xem danh sách nông dân có mặt ở từng chợ | Trang chi tiết chợ liệt kê sạp, có lọc theo ngày | /markets/:id |  |
| K11 | Xem hồ sơ nông dân: tên sạp, vị trí | Trang sạp có bản đồ và vị trí sạp trong chợ | /farmers/:id |  |
| K12 | Xem ngày bán của nông dân | Hiện các thứ sạp có mặt | /farmers/:id |  |
| K13 | Xem hàng trong tuần của nông dân | Danh sách sản phẩm đang bán của sạp | /farmers/:id |  |
| K14 | Bản đồ nhúng hiện chợ và sạp | Leaflet + OpenStreetMap | /markets, /farmers/:id |  |
| K15 | Marker vị trí trên bản đồ | Mỗi chợ / sạp một marker có popup | /markets |  |
| K16 | Chỉ đường tới điểm nhận đã chọn | Nút Directions mở Google Maps | /markets/:id, /customer/orders/:id |  |

### Tìm, duyệt, lọc sản phẩm (SRS: Search, Browse, and Filter Products)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| K17 | Duyệt danh mục sản phẩm (rau, trái cây, sữa, bánh…) | Danh mục do Admin quản lý, có icon | /products |  |
| K18 | Lọc theo giá | Thanh khoảng giá | /products |  |
| K19 | Lọc theo danh mục | Chọn danh mục | /products |  |
| K20 | Lọc theo chợ | Chọn chợ | /products |  |
| K21 | Lọc theo ngày | Chọn thứ trong tuần | /products |  |
| K22 | Xem chi tiết sản phẩm: giá | Trang chi tiết | /products/:id |  |
| K23 | Xem chi tiết sản phẩm: đơn vị tính | KG, bó, cái, túi, hộp, gói | /products/:id |  |
| K24 | Xem chi tiết sản phẩm: số lượng còn | Hiện số kho | /products/:id |  |
| K25 | Xem chi tiết sản phẩm: nông dân bán | Link sang trang sạp | /products/:id |  |

### Đặt trước để nhận tại chợ (SRS: Place Pre-Orders for Pickup)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| K26 | Thêm sản phẩm vào giỏ | Nút Add to cart ở mọi nơi; giỏ lưu ở trình duyệt | /customer/cart |  |
| K27 | Đặt trước theo số hàng nông dân còn | Server kiểm tra kho khi đặt | /customer/checkout |  |
| K28 | Chọn ngày nhận | Chỉ hiện ngày hợp lệ | /customer/checkout |  |
| K29 | Chọn khung giờ nhận trong khung nông dân đặt | Danh sách khung giờ của sạp tại chợ đã chọn | /customer/checkout |  |
| K30 | Xem trạng thái đơn: placed, accepted, ready for pickup, completed | Timeline trạng thái trên chi tiết đơn | /customer/orders/:id |  |
| K31 | Hủy đơn trước giờ chốt của nông dân | Nút Cancel có hộp xác nhận | /customer/orders/:id |  |
| K32 | Sửa đơn trước giờ chốt của nông dân | Đổi số lượng, thêm / bớt món, đổi ngày / khung giờ | /customer/orders/:id/edit |  |
| K33 | Không thanh toán online, trả tiền khi nhận | Đơn ghi tổng tiền, trả tại sạp | — |  |

### Quản lý đơn (SRS: Manage Orders)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| K34 | Xem đơn | Danh sách đơn chia tab đang mở / đã xong | /customer/orders |  |
| K35 | Sửa đơn | Trùng ý với dòng "Sửa đơn trước giờ chốt" ở trên | /customer/orders/:id/edit |  |
| K36 | Hủy đơn | Trùng ý với dòng "Hủy đơn trước giờ chốt" ở trên | /customer/orders/:id |  |

### Lịch sử đơn và yêu thích (SRS: Order History and Favorites)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| K37 | Xem các đơn đã đặt trước đây | Tab đơn đã xong | /customer/orders |  |
| K38 | Đặt lại nhanh món đã mua | Nút Reorder nạp lại món vào giỏ | /customer/orders |  |
| K39 | Đánh dấu yêu thích để vào nhanh | Trang yêu thích gom sạp, sản phẩm, chợ | /customer/favorites |  |
| K40 | Báo khi món yêu thích có hàng lại | Thông báo RESTOCK khi nông dân nhập thêm hàng | Chuông thông báo |  |
| K41 | Lưu chợ ưa thích | Trái tim trên chợ | /customer/favorites |  |
| K42 | Nhận thông tin nhận hàng kèm chỉ đường | Chi tiết đơn có chợ, vị trí sạp, nút chỉ đường | /customer/orders/:id |  |

### Trợ lý AI (SRS: AI Assistant — tùy chọn)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| K43 | Chatbot giúp tìm món ở các chợ và sạp | Gemini gọi công cụ tìm sản phẩm | Widget chat |  |
| K44 | Trả lời giờ họp chợ | Công cụ thông tin chợ | Widget chat |  |
| K45 | Trả lời nông dân có bán không | Công cụ lịch của sạp | Widget chat |  |
| K46 | Trả lời khung giờ nhận hàng | Công cụ lịch của sạp | Widget chat |  |
| K47 | Trả lời chi tiết sản phẩm | Công cụ tìm sản phẩm | Widget chat |  |

### Đánh giá (SRS: Reviews and Ratings)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| K48 | Chấm sao và nhận xét nông dân sau khi đơn hoàn tất | Chỉ đơn Completed mới có nút Review | /customer/orders/:id/review |  |
| K49 | Chấm sao và nhận xét từng sản phẩm sau khi đơn hoàn tất | Mỗi món một đánh giá | /customer/orders/:id/review |  |
| K50 | Xem đánh giá của khách khác trước khi đặt | Đánh giá trên trang sản phẩm và trang sạp | /products/:id, /farmers/:id |  |

## Phần I.2 — Yêu cầu đề bài: Nông dân

### Đăng ký và hồ sơ (SRS: Farmer Registration and Profile Management)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| N1 | Đăng ký với tên sạp / cơ sở | Form đăng ký nông dân | /register/farmer |  |
| N2 | Đăng ký với người liên hệ | Form đăng ký nông dân | /register/farmer |  |
| N3 | Đăng ký với SĐT, email, địa chỉ | Kiểm tra trùng SĐT / email | /register/farmer |  |
| N4 | Bổ sung hồ sơ: các chợ đang bán | Xin vào chợ, nhập vị trí sạp trong chợ | /farmer/markets |  |
| N5 | Bổ sung hồ sơ: ngày bán trong tuần | Chọn các thứ bán | /farmer/profile |  |
| N6 | Bổ sung hồ sơ: khung giờ nhận hàng | Tạo khung giờ cho từng chợ | /farmer/markets |  |
| N7 | Bổ sung hồ sơ: địa chỉ | Sửa địa chỉ | /farmer/profile |  |
| N8 | Bổ sung hồ sơ: ghim bản đồ | Kéo ghim trên bản đồ | /farmer/profile |  |
| N9 | Bổ sung hồ sơ: vĩ độ, kinh độ | Lưu theo ghim hoặc tự tra từ địa chỉ | /farmer/profile |  |

### Quản lý hàng tuần và giá (SRS: Manage Weekly Stock and Pricing)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| N10 | Thêm sản phẩm: tên, danh mục, giá, đơn vị, số lượng, mô tả, ảnh | Form sản phẩm | /farmer/products/new |  |
| N11 | Sửa sản phẩm | Form sản phẩm | /farmer/products/:id/edit |  |
| N12 | Xem sản phẩm | Danh sách có tìm và lọc theo trạng thái | /farmer/products |  |
| N13 | Xóa sản phẩm | Lưu trữ (xóa mềm) để giữ lịch sử đơn | /farmer/products |  |
| N14 | Lập mẫu tồn kho lặp lại hàng tuần | Mức mặc định mỗi tuần cho từng sản phẩm | /farmer/stock-template |  |
| N15 | Điều chỉnh mẫu khi nguồn hàng thay đổi | Sửa mức mẫu, áp lại cho tuần | /farmer/stock-template |  |
| N16 | Đánh dấu hết hàng (sold out) | Nút Sold out đưa kho về 0 | /farmer/products |  |
| N17 | Đánh dấu tạm ngừng bán (temporarily unavailable) | Nút Pause / Resume | /farmer/products |  |

### Quản lý đơn đặt trước (SRS: Manage pre-orders)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| N18 | Xem đơn đến | Danh sách đơn chia tab theo trạng thái | /farmer/orders |  |
| N19 | Chấp nhận đơn | Nút Accept | /farmer/orders/:id |  |
| N20 | Từ chối đơn | Nút Decline, nhập lý do | /farmer/orders/:id |  |
| N21 | Đánh dấu đơn sẵn sàng để nhận | Nút Ready | /farmer/orders/:id |  |
| N22 | Đặt giờ chốt nhận đơn | Số giờ chốt trong hồ sơ | /farmer/profile |  |
| N23 | Quản lý khung giờ nhận hàng | Thêm / bật / tắt / xóa khung giờ | /farmer/markets |  |

### Lịch sử bán và số liệu (SRS: View Order History and Insights)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| N24 | Xem doanh số đã bán | Doanh thu theo ngày | /farmer, /farmer/stats |  |
| N25 | Xem lịch sử đơn | Tab đơn đã xong | /farmer/orders |  |
| N26 | Xem sản phẩm bán chạy | Top sản phẩm | /farmer, /farmer/stats |  |
| N27 | Xem tổng số đơn | Thẻ số liệu | /farmer |  |
| N28 | Xem số đơn đang chờ | Thẻ số liệu | /farmer |  |
| N29 | Xem tóm tắt doanh thu | Thẻ số liệu + biểu đồ | /farmer, /farmer/stats |  |

### Trả lời đánh giá (SRS: Respond to Reviews)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| N30 | Xem đánh giá của khách về sản phẩm | Danh sách đánh giá, mới nhất trước | /farmer/reviews |  |
| N31 | Trả lời đánh giá (không bắt buộc) | Trả lời công khai một lần | /farmer/reviews |  |

## Phần I.3 — Yêu cầu đề bài: Admin

### Đăng nhập và dashboard (SRS: Admin Login and Dashboard)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| A1 | Đăng nhập an toàn ở cổng riêng | Cổng /admin/login, phiên riêng | /admin/login |  |
| A2 | Dashboard tách khỏi giao diện khách và nông dân | Layout Admin riêng | /admin |  |
| A3 | Tổng số nông dân | Thẻ số liệu | /admin |  |
| A4 | Tổng số khách hàng | Thẻ số liệu | /admin |  |
| A5 | Tổng số chợ | Thẻ số liệu | /admin |  |
| A6 | Tổng số đơn | Thẻ số liệu | /admin |  |

### Quản lý nông dân và khách (SRS: Manage Farmers and Customers)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| A7 | Xem hồ sơ nông dân đăng ký | Danh sách + chi tiết | /admin/farmers |  |
| A8 | Duyệt nông dân trước khi được đăng bán | Nút Approve | /admin/farmers/:id, /admin/approvals |  |
| A9 | Đình chỉ nông dân | Nút Suspend, nhập lý do | /admin/farmers/:id |  |
| A10 | Xem tài khoản khách | Danh sách + chi tiết | /admin/customers |  |
| A11 | Kích hoạt tài khoản khách | Nút Activate | /admin/customers/:id |  |
| A12 | Khóa tài khoản khách vi phạm | Nút Deactivate, nhập lý do | /admin/customers/:id |  |

### Quản lý chợ (SRS: Manage Markets)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| A13 | Thêm chợ: tên, địa chỉ, ngày họp, giờ mở / đóng, tọa độ | Form chợ có bản đồ | /admin/markets/new |  |
| A14 | Sửa chợ | Form chợ | /admin/markets/:id/edit |  |
| A15 | Xóa chợ | Đóng chợ (ngừng hoạt động) thay cho xóa cứng | /admin/markets |  |
| A16 | Tọa độ hoặc bản đồ nhúng của chợ | Tra tọa độ từ địa chỉ, kéo ghim | /admin/markets/new |  |

### Kiểm duyệt nội dung (SRS: Content Moderation)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| A17 | Xem tin sản phẩm vi phạm | Tab Products | /admin/moderation |  |
| A18 | Gỡ tin sản phẩm vi phạm | Hide / Block | /admin/moderation |  |
| A19 | Xem đánh giá vi phạm | Tab Reviews | /admin/moderation |  |
| A20 | Gỡ đánh giá vi phạm | Hide có lý do | /admin/moderation |  |

### Báo cáo (SRS: Reports and Analytics)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| A21 | Báo cáo tổng số đơn | Chọn khoảng ngày, chợ | /admin/reports |  |
| A22 | Tóm tắt doanh thu theo chợ | Bảng doanh thu từng chợ | /admin/reports |  |
| A23 | Nông dân năng nổ nhất | Top nông dân theo doanh thu | /admin/reports |  |

### Cấu hình hệ thống (SRS: System Configuration)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| A24 | Quản lý danh mục sản phẩm | Thêm / sửa / ẩn danh mục | /admin/categories |  |
| A25 | Đăng thông báo toàn sàn | Soạn và bật / tắt thông báo | /admin/announcements |  |

## Phần I.4 — Tính năng chung, ràng buộc, phi chức năng

### Tính năng chung (SRS: Other Features)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| C1 | Phân quyền theo vai trò | Chặn trang ở giao diện; server kiểm tra quyền ở mọi API | Mọi trang |  |
| C2 | Tìm chợ | Ô tìm ở trang chợ | /markets |  |
| C3 | Tìm nông dân | Ô tìm ở trang sạp | /farmers |  |
| C4 | Tìm sản phẩm | Ô tìm theo tên hàng hoặc tên sạp | /products |  |
| C5 | Lọc theo vị trí | Near me | /markets, /farmers |  |
| C6 | Lọc theo danh mục, giá, ngày họp chợ | Thanh lọc | /products |  |
| C7 | Hiện kết quả trên bản đồ khi tìm theo vị trí | Bản đồ chợ | /markets |  |
| C8 | Giao diện thân thiện điện thoại | Responsive, thanh tab dưới đáy cho khách | Mọi trang |  |
| C9 | Email / in-app khi đơn được xác nhận | Thông báo ORDER\_ACCEPTED | Chuông, email |  |
| C10 | Email / in-app khi đơn sẵn sàng để nhận | Thông báo ORDER\_READY | Chuông, email |  |
| C11 | Chấm sao nông dân hoặc sản phẩm và để lại bình luận | Trùng với phần Đánh giá của khách | /customer/orders/:id/review |  |
| C12 | Trang About Us: thông tin đội và nền tảng | Câu chuyện, đội ngũ, FAQ | /about |  |
| C13 | Trang Contact Us: thông tin liên hệ + Google Maps | Bản đồ Google Maps nhúng | /contact |  |

### Ràng buộc (SRS 1.5)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| C14 | Tương thích các trình duyệt phổ biến | Chạy trên Chrome, Edge, Firefox, Safari | — |  |
| C15 | Không có cổng thanh toán | Trả tiền mặt khi nhận | — |  |
| C16 | Không giao hàng, chỉ nhận tại chợ | Chọn chợ và khung giờ nhận | — |  |
| C17 | Không xác minh danh tính, giấy phép, chứng nhận nông dân | Admin chỉ duyệt hồ sơ | — |  |

### Yêu cầu phi chức năng (SRS 1.7)

| Mã | Yêu cầu | Trong MarketLink | Màn hình | Quyết định |
| --- | --- | --- | --- | --- |
| C18 | An toàn: không tải file độc hay file thừa | Không có tải file tự động; ảnh upload được kiểm tra và mã hóa lại | — |  |
| C19 | Dễ tiếp cận: font, giao diện, menu rõ ràng | Font Inter, tương phản tốt, có điều khiển bàn phím | — |  |
| C20 | Dễ dùng: menu rõ, dễ hiểu | Menu theo vai trò, trạng thái rỗng có hướng dẫn | — |  |
| C21 | Vận hành ổn định, hiệu quả | Transaction, xử lý lỗi thống nhất | — |  |
| C22 | Hiệu năng: tải nhanh cả khi danh mục lớn | Phân trang, index, cache, lazy load | — |  |
| C23 | Mở rộng: chịu được ngày chợ cao điểm | Server không giữ trạng thái, Redis, chạy nhiều tiến trình | — |  |
| C24 | Bảo mật: xác thực, chỉ người đã đăng ký mới dùng tính năng riêng | JWT, phân quyền ở server | — |  |
| C25 | Sẵn sàng 24/7 | Deploy Vercel + Render + Aiven + Upstash | — |  |
| C26 | Tương thích trình duyệt và thiết bị mới | Responsive, thử trên nhiều trình duyệt | — |  |

## Phần II.1 — Tính năng mở rộng: Khách hàng / Guest

### Đặt hàng và kho

| Mã | Tính năng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| MK1 | Đặt hàng thì tạm giữ hàng, nông dân duyệt mới trừ kho thật | Không bán vượt số hàng có; đơn bị từ chối / hết hạn thì hàng tự nhả |  |
| MK2 | Báo rõ món nào thiếu và còn bao nhiêu ("Only 10 KG left") | Khách sửa giỏ và đặt được phần còn lại ngay |  |
| MK3 | Một giỏ nhiều sạp → mỗi sạp tách thành một đơn riêng | Mỗi sạp có kho, giờ chốt, khung giờ riêng và tự duyệt đơn của mình |  |
| MK4 | Tối đa 5 sạp mỗi lần đặt | Giới hạn tải một lần đặt |  |
| MK5 | Đặt kiểu all-or-nothing: tạo đủ mọi đơn hoặc không đơn nào | Không có chuyện khách tưởng đã đặt đủ mà chỉ được một nửa |  |
| MK6 | Checkout chỉ hiện chợ / khung giờ mà mọi món trong nhóm đều bán | Sạp không mang mọi món tới mọi chợ |  |
| MK7 | Một đơn chỉ thuộc một chợ và một khung giờ | Nông dân biết rõ mang hàng tới đâu, lúc nào |  |
| MK8 | Ngày nhận chỉ trong 7 ngày tới, ẩn ngày chợ đóng / nông dân nghỉ | Khách chỉ chọn được ngày chắc chắn có thể lấy |  |
| MK9 | Khung giờ đã qua giờ chốt tự bị khóa trên checkout | Không đặt vào khung không còn hợp lệ |  |
| MK10 | Giá luôn lấy từ CSDL, chụp lại trên đơn lúc đặt | Nông dân đổi giá sau đó không ảnh hưởng đơn cũ |  |
| MK11 | Số lượng tối thiểu / tối đa mỗi đơn, giỏ tự kẹp số lượng | Có món bán từ 2 kg; có món cần chia đều cho nhiều khách |  |
| MK12 | Giỏ tự làm mới giá, kho, trạng thái từ server | Không đặt theo giá cũ hay món đã ngừng bán |  |
| MK13 | Bấm đặt 2 lần không ra 2 đơn (Idempotency-Key) | Mạng điện thoại chập chờn, trình duyệt tự gửi lại |  |
| MK14 | Tối đa 10 đơn đang chờ duyệt mỗi khách | Chống đặt ảo |  |
| MK15 | Tối đa 10 lần gửi đơn mỗi giờ | Chống spam |  |
| MK16 | Tài khoản nông dân không đặt hàng được | Tránh tự đặt đơn ảo cho sạp mình |  |

### Sau khi đặt

| Mã | Tính năng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| MK17 | Yêu cầu thay đổi cho đơn đã được duyệt | Nông dân có thể đã soạn hàng; sửa thẳng gây lệch kho |  |
| MK18 | Mỗi đơn chỉ một yêu cầu thay đổi, tự hủy khi tới giờ nhận | Tránh yêu cầu treo, nông dân không phải xử lý chồng chéo |  |
| MK19 | Đơn có thêm 4 trạng thái: bị từ chối, đã hủy, không đến, hết hạn — kèm lý do | Khách biết rõ vì sao đơn kết thúc |  |
| MK20 | Đồng hồ đếm ngược tới giờ chốt | Biết còn bao lâu để sửa / hủy |  |
| MK21 | SĐT nông dân kèm nút gọi trên đơn | Liên lạc nhanh khi cần |  |
| MK22 | Vị trí sạp trong chợ ghi trên đơn (ví dụ "Dãy B, sạp 12") | Tìm đúng sạp khi tới chợ |  |
| MK23 | Nút chỉ đường Google Maps ở trang chợ, sạp, đơn, checkout | Chỉ đường tốt nhất, quen thuộc, không cần API key |  |
| MK24 | Thông báo khi nông dân bỏ một món hết hàng khỏi đơn | Khách quyết định mua phần còn lại hay hủy |  |
| MK25 | Đặt lại nhanh: xem trước món còn bán / món bị bỏ, theo giá hôm nay | Không tạo đơn sai; khách chọn lại ngày, khung giờ |  |
| MK26 | Chỉ báo có hàng lại khi nông dân chủ động nhập thêm hàng | Tránh báo "ảo" khi hàng chỉ quay lại vài phút do đơn bị hủy |  |

### Tài khoản và giao diện

| Mã | Tính năng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| MK27 | Mỗi thiết bị một phiên đăng nhập, đăng xuất máy này không văng máy khác | Cách làm "dùng chung tài khoản gia đình" mà không cần module thành viên |  |
| MK28 | Mỗi thiết bị một giỏ hàng riêng | Người trong nhà không giẫm giỏ của nhau |  |
| MK29 | Đăng nhập xong quay về đúng trang đang xem | Không phải tìm lại sản phẩm |  |
| MK30 | Thanh tab dưới đáy kiểu app trên điện thoại | Dễ dùng một tay trên điện thoại |  |
| MK31 | Bộ lọc lưu trên URL, gửi link là thấy đúng kết quả | Chia sẻ, bấm Back không mất bộ lọc |  |
| MK32 | Danh sách chợ, sạp, đánh giá có nút "Load more" | Trang nhẹ, tải dần |  |
| MK33 | Tên người đánh giá được rút gọn (Nguyen V. A.) | Bảo vệ thông tin cá nhân |  |
| MK34 | Banner thông báo toàn sàn, đóng được | Khách biết tin quan trọng, không bị làm phiền lặp lại |  |
| MK35 | FAQ trên trang About | Trả lời sẵn câu hỏi thường gặp |  |
| MK36 | Trang Privacy Policy | Nói rõ dữ liệu thu thập, kể cả vị trí và câu hỏi chatbot |  |
| MK37 | Trang Sitemap | Đủ trang của một web thật |  |
| MK38 | Trang lỗi 403 và 404 | Báo rõ khi vào sai trang |  |
| MK39 | Giao diện sáng / tối | Dễ nhìn ban đêm |  |

## Phần II.2 — Tính năng mở rộng: Nông dân

### Xử lý đơn

| Mã | Tính năng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| MN1 | Bỏ từng món hết hàng khỏi đơn (Sold out một món), tính lại tiền | Thường chỉ hết một món; từ chối cả đơn thì khách mất hết |  |
| MN2 | Từ chối đơn đã duyệt phải khai món nào hết hàng | Kho cuối cùng đúng: món hết về 0, món khác trả lại |  |
| MN3 | Bắt buộc ghi lý do khi từ chối (5–500 ký tự) | Khách biết vì sao bị từ chối |  |
| MN4 | Bảng so sánh cũ / mới khi khách xin đổi đơn | Nông dân thấy ngay khác gì |  |
| MN5 | 3 lựa chọn với yêu cầu thay đổi: chấp nhận, từ chối, hủy cả đơn | Linh hoạt theo hàng thực tế |  |
| MN6 | Đánh dấu khách không đến (No-show), hàng trả về kho | Hàng đã soạn bán lại cho người khác |  |
| MN7 | Chỉ bấm Ready được sau giờ chốt | Trước giờ chốt khách còn quyền sửa / hủy |  |
| MN8 | Danh sách soạn hàng: tổng từng món theo ngày nhận | Sáng ngày chợ biết phải mang bao nhiêu kg |  |
| MN9 | Đơn gom theo khách | Một khách nhiều đơn soạn một lần |  |
| MN10 | Tab đơn theo trạng thái có số đếm, lọc theo chợ và ngày | Tìm nhanh đơn cần xử lý |  |
| MN11 | Toast bật lên ngay khi có đơn mới (realtime) | Không bỏ lỡ đơn |  |
| MN12 | Cảnh báo đơn quá hạn trên dashboard | Nhắc xử lý trước khi đơn tự hết hạn |  |

### Lịch và chợ

| Mã | Tính năng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| MN13 | Lịch nghỉ (Time off) theo khoảng ngày | Đề bài nhắc "nông dân nghỉ tuần đó" là vấn đề thật |  |
| MN14 | Lịch nghỉ bị chặn nếu còn đơn mở trong khoảng đó | Không bỏ rơi khách đã đặt |  |
| MN15 | Bỏ một ngày bán bị chặn nếu còn đơn mở rơi vào thứ đó | Không bỏ rơi khách đã đặt |  |
| MN16 | Bán ở nhiều chợ, mỗi chợ phải được Admin duyệt | Admin kiểm soát sạp nào thật sự có chỗ ở chợ nào |  |
| MN17 | Vị trí sạp trong chợ cho từng chợ | Khách tìm đúng sạp |  |
| MN18 | Rời chợ bị chặn khi còn đơn mở ở chợ đó | Không bỏ rơi khách đã đặt |  |
| MN19 | Khung giờ chỉ tạo được trong ngày chợ họp, ngày nông dân bán, giờ chợ mở | Khách không chọn được giờ chợ đóng cửa |  |
| MN20 | Xóa khung giờ đang có đơn bị chặn, gợi ý tắt thay vì xóa | Không mất đơn đã đặt |  |
| MN21 | Chọn chợ bán cho từng sản phẩm | Không mang mọi món tới mọi chợ |  |
| MN22 | Kho dùng chung cho mọi chợ | Không phải nhập kho riêng từng chợ |  |

### Sản phẩm

| Mã | Tính năng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| MN23 | Kiểm tra tin đăng ngay khi gõ (precheck) | Sửa trước khi gửi, ít bị từ chối |  |
| MN24 | Sửa tên / mô tả / ảnh / danh mục thì duyệt lại, sửa giá / kho thì không | Cập nhật kho không phải chờ duyệt |  |
| MN25 | Thao tác hàng loạt: hết hàng, tạm ngừng, mở bán, đổi chợ bán | Sạp nhiều sản phẩm không phải bấm từng cái |  |
| MN26 | Áp mẫu tuần có xem trước, trừ phần đã hứa cho đơn đã duyệt | Không bán vượt hàng thật |  |
| MN27 | Nhập thêm hàng tự báo khách đã yêu thích món đó | Kéo khách quay lại |  |
| MN28 | Ảnh upload được mã hóa lại, xóa GPS trong ảnh | Ảnh chụp tại nhà không lộ tọa độ nhà |  |
| MN29 | Chặn rời trang khi form chưa lưu | Không mất dữ liệu đang nhập |  |

### Tài khoản và số liệu

| Mã | Tính năng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| MN30 | Sạp chờ duyệt vẫn đăng nhập, chuẩn bị hồ sơ, chợ, khung giờ | Được duyệt là bán ngay |  |
| MN31 | Băng trạng thái tài khoản (chờ duyệt / bị từ chối / bị đình chỉ) kèm lý do | Nông dân biết mình đang ở đâu |  |
| MN32 | Tự tra tọa độ từ địa chỉ | Nông dân không biết vĩ độ / kinh độ |  |
| MN33 | Kéo ghim chỉnh vị trí, ưu tiên ghim của nông dân | Nông dân biết vị trí sạp rõ hơn kết quả tra |  |
| MN34 | Thống kê: doanh thu so với kỳ trước | Biết đang bán tốt lên hay kém đi |  |
| MN35 | Thống kê: giá trị trung bình mỗi đơn | Hiểu thói quen mua của khách |  |
| MN36 | Thống kê: doanh thu theo chợ | Biết nên mang hàng tới chợ nào |  |
| MN37 | Thống kê: thứ nào đông khách nhất | Biết nên chuẩn bị nhiều hàng hôm nào |  |
| MN38 | Thống kê: phân bố trạng thái đơn | Thấy tỉ lệ hủy, không đến |  |
| MN39 | Chatbot riêng cho nông dân: đơn chờ, hàng sắp hết, cách dùng màn hình | Hỏi nhanh thay vì mở nhiều trang |  |

## Phần II.3 — Tính năng mở rộng: Admin

### Duyệt và AI

| Mã | Tính năng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| MA1 | Hàng chờ duyệt 4 tab: sạp, sản phẩm, chợ, AI | Một chỗ xem mọi thứ đang chờ |  |
| MA2 | Badge số việc chờ trên menu | Biết ngay có việc mới |  |
| MA3 | Duyệt tin đăng trước khi lên sàn | Đề bài chỉ cho gỡ tin sai sau khi khách đã thấy — quá muộn |  |
| MA4 | Duyệt sạp xin vào chợ | Kiểm soát sạp ở từng chợ |  |
| MA5 | AI lớp 1 — luật: giá so với khung giá, lệch xa giá sạp khác, kho bất thường | AI không biết giá chợ hôm nay; con số để luật kiểm |  |
| MA6 | AI lớp 2 — Gemini đọc chữ và ảnh: có phải nông sản, đúng danh mục, ngôn từ xấu, liên hệ ngoài, ảnh khớp | Việc luật cứng làm không được |  |
| MA7 | AI tự duyệt tin sạch | Admin đỡ việc |  |
| MA8 | AI tự giữ tin vi phạm rõ | Tin xấu không lên sàn |  |
| MA9 | AI gợi ý danh mục đúng | Sửa nhanh tin chọn sai danh mục |  |
| MA10 | Nút chạy lại AI cho một tin | Khi AI lỗi hoặc tin đã sửa |  |
| MA11 | Trang AI Decisions: xem / xác nhận / đổi quyết định của AI | AI tự quyết nhưng Admin luôn xem lại |  |
| MA12 | Thống kê độ tin cậy AI 30 ngày | Có số liệu để biết khi nào tin AI |  |
| MA13 | Khung giá và tồn kho tối đa theo danh mục + đơn vị | Mốc so sánh cho lớp luật |  |
| MA14 | AI đọc đánh giá: chắc chắn vi phạm thì tự ẩn | Lời thô tục không nằm công khai chờ Admin |  |
| MA15 | AI đọc đánh giá: nghi ngờ thì chỉ gắn cờ | Không ẩn nhầm lời chê thật |  |
| MA16 | Nhãn "Hidden by AI" và nút Restore | Admin biết cái nào AI ẩn, sửa được khi AI sai |  |

### Kiểm duyệt và cờ

| Mã | Tính năng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| MA17 | Hàng đợi cờ | Ghi nhớ việc còn nợ một quyết định |  |
| MA18 | Cờ tự động cho sản phẩm có ≥ 3 đánh giá 1–2 sao trong 30 ngày | Phát hiện hàng kém chất lượng |  |
| MA19 | Cờ tự động cho khách nhiều lần không đến | Admin chú ý khách rủi ro |  |
| MA20 | Ẩn sản phẩm (đang điều tra, giữ đơn) | Không hủy đơn khi mới nghi ngờ |  |
| MA21 | Chặn sản phẩm (vi phạm, từ chối đơn liên quan, hoàn kho) | Xử lý dứt điểm khi đã xác định vi phạm |  |
| MA22 | Bỏ chặn không hồi các đơn đã từ chối, màn hình nói rõ trước | Khách đã được báo, có thể đã mua nơi khác |  |

### Can thiệp có xem trước tác động

| Mã | Tính năng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| MA23 | Xem trước tác động khi đình chỉ sạp | Biết bao nhiêu đơn, khách bị ảnh hưởng |  |
| MA24 | Đình chỉ sạp tự từ chối đơn mở, hoàn kho, báo khách | Không để đơn treo |  |
| MA25 | Xem trước tác động khi khóa khách | Biết bao nhiêu đơn, sạp bị ảnh hưởng |  |
| MA26 | Khóa khách tự hủy đơn mở, đóng kết nối mọi thiết bị | Khách bị khóa không thao tác tiếp được |  |
| MA27 | Xem trước tác động khi chặn sản phẩm | Biết bao nhiêu đơn bị hủy |  |
| MA28 | Bắt buộc lý do khi đình chỉ / khóa / từ chối | Minh bạch, ghi nhật ký |  |

### Chợ

| Mã | Tính năng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| MA29 | Đóng chợ khẩn cấp: từ chối đơn mở + hoàn kho + tắt khung giờ | Chợ ngập, cháy thì báo ngay mọi người có đơn |  |
| MA30 | Gõ chữ "confirm" mới đóng được chợ | Chống bấm nhầm |  |
| MA31 | Mỗi khách bị ảnh hưởng nhận một thông báo gộp + email | Không bị dội nhiều thông báo |  |
| MA32 | Đóng chợ không đình chỉ sạp | Sạp vẫn bán ở chợ khác |  |
| MA33 | Mở lại chợ tự bật lại đúng các khung giờ đã tắt | Nông dân không phải bật lại tay |  |
| MA34 | Lịch đóng cửa chợ tạm thời theo khoảng ngày | Lễ Tết, mưa bão |  |
| MA35 | Đổi lịch / giờ chợ có xem trước tác động | Đổi giờ có thể làm nhiều đơn mất hiệu lực |  |
| MA36 | Đơn lệch lịch được báo dời giờ, quá hạn mới hủy | Cho khách cơ hội đổi thay vì hủy ngay |  |
| MA37 | Tra tọa độ chợ từ địa chỉ | Không phải tự tìm vĩ độ / kinh độ |  |

### Tài khoản

| Mã | Tính năng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| MA38 | Tự khóa khách không đến lấy 3 lần trong 30 ngày | Đặt mà không đến là thiệt hại trực tiếp cho nông dân |  |
| MA39 | Lọc khách "At risk" | Admin theo dõi khách rủi ro |  |
| MA40 | Trang khách hiện nhãn "tự khóa" kèm các đơn đã bỏ | Admin hiểu vì sao bị khóa |  |
| MA41 | Mở khóa thì bộ đếm tính lại từ đầu | Cho khách cơ hội mới |  |
| MA42 | Admin sửa hồ sơ sạp / khách | Hỗ trợ khi người dùng nhập sai |  |
| MA43 | Xem vị trí sạp trên bản đồ | Kiểm tra sạp có thật ở chợ |  |

### Giám sát và báo cáo

| Mã | Tính năng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| MA44 | Nhật ký an ninh: ai làm gì, lúc nào, IP nào | Truy vết khi có sự cố |  |
| MA45 | Lịch sử thay đổi từng trường của sạp, khách, sản phẩm, chợ | Biết ai sửa gì, từ gì sang gì |  |
| MA46 | Trang xem đơn chỉ đọc | Tra cứu khiếu nại mà không sửa đơn người khác |  |
| MA47 | Trang Limits: các giới hạn đang áp dụng | Admin mới biết luật hệ thống |  |
| MA48 | Khối "Needs attention" trên dashboard | Việc chờ hôm nay hữu ích hơn con số tổng |  |
| MA49 | Biểu đồ số đơn theo ngày trong tháng, lùi / tới từng tháng | Thấy xu hướng |  |
| MA50 | Xuất báo cáo Excel | Mang báo cáo đi được |  |
| MA51 | Excel chặn chèn công thức độc | Tên do người dùng đặt không thành công thức |  |
| MA52 | Xuất CSV danh sách nông dân / khách | Xử lý dữ liệu ngoài hệ thống |  |
| MA53 | Mỗi lần xuất báo cáo được ghi nhật ký | Thay cho bảng Reports trong đề bài |  |

### Danh mục và thông báo

| Mã | Tính năng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| MA54 | Mỗi danh mục một icon, không trùng | Khách không nhầm danh mục |  |
| MA55 | Kéo thả sắp thứ tự danh mục | Admin sắp trực quan |  |
| MA56 | Danh mục đang có sản phẩm không xóa được, chỉ ẩn | Không làm hỏng sản phẩm đang bán |  |
| MA57 | Thông báo toàn sàn theo đối tượng: tất cả / khách / nông dân | Gửi đúng người |  |
| MA58 | Thông báo toàn sàn có thời gian bắt đầu – kết thúc | Tự tắt khi hết hạn |  |
| MA59 | Lệnh dọn tài khoản không dùng (phải thêm --apply mới xóa) | Tránh phình dữ liệu, không xóa nhầm |  |

## Phần II.4 — Tính năng mở rộng: chung cho cả hệ thống

### Đơn hàng

| Mã | Tính năng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| MC1 | Vòng đời đơn 8 trạng thái | Đề bài chỉ có 4 trạng thái suôn sẻ; thực tế có hủy, từ chối, không đến, quên duyệt |  |
| MC2 | 13 cạnh chuyển trạng thái, một lõi xử lý duy nhất | Không màn hình nào đổi trạng thái sai luật |  |
| MC3 | Lịch sử trạng thái mỗi đơn: ai đổi, lúc nào, lý do | Tra cứu khi có tranh chấp |  |
| MC4 | Giờ chốt tính và lưu cứng trên từng đơn | Sạp đổi giờ chốt không ảnh hưởng đơn cũ |  |
| MC5 | Đơn quá hạn tự hết hạn bằng quét lười (không cần cron) | Không treo đơn, không tốn tiền chạy tiến trình nền |  |

### Trợ lý AI

| Mã | Tính năng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| MC6 | Chatbot cho cả 4 vai trò | Đề bài chỉ gợi ý chatbot cho khách |  |
| MC7 | 7 công cụ chỉ đọc, đúng quyền người hỏi (function calling) | AI không chạm thẳng CSDL, không xem dữ liệu người khác |  |
| MC8 | Trả lời theo ngôn ngữ người hỏi | Khách nước ngoài vẫn dùng được |  |
| MC9 | Tìm được tiếng Việt không dấu | Gõ "rau muong" vẫn ra "rau muống" |  |
| MC10 | Giới hạn 20 câu / phút, 30 câu / ngày (khách vãng lai), 100 câu / ngày (đã đăng nhập) | Không tốn quota |  |
| MC11 | Mọi lỗi / hết lượt đều hiện cùng câu "đang bận" | Người ngoài không dò được giới hạn |  |
| MC12 | Chống prompt injection | Người dùng không lừa được AI đổi luật |  |
| MC13 | Model Gemini dự phòng khi hết quota | Demo không chết giữa chừng |  |
| MC14 | Mất AI thì web vẫn chạy bình thường | Không phụ thuộc hoàn toàn vào dịch vụ ngoài |  |

### Thông báo

| Mã | Tính năng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| MC15 | 24 loại thông báo | Đề bài chỉ cần 2 sự kiện |  |
| MC16 | Realtime cho nông dân qua WebSocket | Thấy đơn mới ngay |  |
| MC17 | Vé WebSocket dùng một lần, sống 30 giây | Không để token trên URL |  |
| MC18 | Mất kết nối tự nối lại, chuyển sang hỏi định kỳ | Không mất thông báo |  |
| MC19 | Email cho 7 sự kiện quan trọng, gửi ở luồng nền | Không bắt người dùng chờ gửi email |  |
| MC20 | Thông báo chỉ gửi sau khi thao tác lưu thành công | Không có thông báo "ma" |  |

### Dữ liệu và đồng thời

| Mã | Tính năng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| MC21 | Transaction cho mọi nghiệp vụ ghi nhiều bảng | CSDL không bao giờ ở trạng thái làm dở |  |
| MC22 | Khóa dòng khi trừ / trả kho | Hai thao tác cùng lúc không làm kho âm |  |
| MC23 | Khóa lạc quan If-Match cho đơn hàng | Hai người sửa cùng đơn không đè nhau |  |
| MC24 | Tự chạy lại khi gặp deadlock | Người dùng không thấy lỗi nhất thời |  |
| MC25 | Xóa mềm cho sản phẩm, chợ, tài khoản, đánh giá | Giữ lịch sử đơn và báo cáo |  |

### Bảo mật

| Mã | Tính năng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| MC26 | Thu hồi phiên từng thiết bị | Đăng xuất máy bị mất |  |
| MC27 | Phát hiện refresh token bị dùng lại thì thu hồi phiên | Hạn chế thiệt hại khi lộ token |  |
| MC28 | Đổi mật khẩu đăng xuất các máy khác | Bảo vệ khi lộ mật khẩu |  |
| MC29 | Chống dò mật khẩu theo IP (5 lần / phút) | Chống tấn công dò mật khẩu |  |
| MC30 | Chống dò mật khẩu theo email (20 lần sai / giờ) | Đổi IP cũng không thoát |  |
| MC31 | Hai cổng đăng nhập, không lộ email nào là Admin | Giảm bề mặt tấn công |  |
| MC32 | Đúng mật khẩu mới thấy lý do khóa | Người ngoài không biết tài khoản bị khóa |  |
| MC33 | Một SĐT một tài khoản | Chống tài khoản ảo |  |
| MC34 | Tài khoản bị khóa không xóa, không đăng ký lại được | Khóa có hiệu lực thật |  |
| MC35 | Upload ảnh: kiểm tra đuôi, MIME, ≤ 2MB, ≤ 36 megapixel, đổi tên ngẫu nhiên | Chống file độc, bom ảnh |  |

### Giao diện và vận hành

| Mã | Tính năng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| MC36 | Đăng nhập Admin và khách cùng lúc trên một trình duyệt | Tiện demo, Admin xem như khách |  |
| MC37 | Tự làm mới token, người dùng không bị đá ra | Trải nghiệm liền mạch |  |
| MC38 | Tải trang theo vai trò (lazy route) | Trang đầu mở nhanh |  |
| MC39 | Skeleton khi đang tải | Không nháy trắng |  |
| MC40 | Lỗi từ server hiện đúng dưới ô nhập | Biết ngay sửa chỗ nào |  |
| MC41 | Hỗ trợ bàn phím, trình đọc màn hình | Dễ tiếp cận |  |
| MC42 | Tài liệu API tự sinh (Swagger) | Dễ kiểm tra, mở rộng |  |
| MC43 | Kiểm tra sống /api/health | Theo dõi server |  |
| MC44 | Triển khai 24/7: Vercel, Render, Aiven MySQL, Upstash Redis | Giám khảo truy cập bất cứ lúc nào |  |
