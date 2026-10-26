# MarketLink — Khung thuyết trình bảo vệ

Oct 26, 2026 · @LongNguyen

30 phút trình bày + 15 phút hỏi đáp, một người trình bày kèm demo web; trọng tâm là **tính năng mở rộng** (chiếm khoảng 40% thời gian). Danh sách tính năng bên dưới là đầy đủ để cả nhóm họp chọn giữ / bỏ ở cột Quyết định.

## Thời lượng và thứ tự

Đề xuất: phần đề bài yêu cầu đi nhanh bằng **một luồng demo xuyên suốt**, dành gần một nửa thời gian cho phần mở rộng. Demo chen vào từng phần, không dồn về cuối.

| # | Phần | Phút | Demo trong phần |
| --- | --- | --- | --- |
| 1 | Mở đầu: tên đề tài, vấn đề thực tế | 2 | — |
| 2 | A. Giải pháp, công nghệ, kiến trúc | 3 | Trang chủ, bản đồ chợ |
| 3 | B. Tính năng đề bài yêu cầu (Khách → Nông dân → Admin) | 8 | Luồng chính: khách đặt → nông dân duyệt → sẵn sàng → hoàn tất → đánh giá; Admin duyệt sạp, quản lý chợ, báo cáo |
| 4 | C. Tính năng mở rộng (trọng tâm) | 12 | Kho tạm giữ, yêu cầu thay đổi đơn, đóng chợ có xem trước tác động, AI duyệt tin + AI Decisions, chatbot, thông báo realtime |
| 5 | Bảo mật và triển khai | 1 | — |
| 6 | D. Phân công công việc | 1 | — |
| 7 | Hạn chế, hướng phát triển, cảm ơn | 1 | — |
| 8 | Dự phòng (web chậm, đăng nhập lại) | 2 | — |
|  | **Tổng** | **30** |  |

Gợi ý chuẩn bị demo: mở sẵn 3 cửa sổ trình duyệt đã đăng nhập (khách, nông dân, Admin) để chuyển vai không mất thời gian; mở web trước giờ bảo vệ để server Render "thức dậy".

## A. Giới thiệu dự án và công nghệ

**Vấn đề (1 slide).** Khách đi chợ nông sản không biết trước ai bán hôm nào, còn bao nhiêu, giá bao nhiêu; đến nơi thì hết hàng hoặc nông dân nghỉ. Nông dân không có công cụ công khai hàng tuần, nhận đơn trước, giữ khách quen.

**Giải pháp (1 slide).** MarketLink nối nông dân ở chợ truyền thống với người mua: đặt trước online → nông dân duyệt → đến sạp nhận hàng, trả tiền mặt.

- 4 vai trò: Guest, Khách hàng, Nông dân, Admin (cổng đăng nhập riêng).
- Đề bài loại trừ và cách xử lý: không thanh toán online → trả tiền tại sạp; không giao hàng → nhận tại chợ theo khung giờ; không xác minh pháp lý → Admin chỉ duyệt hồ sơ.

**Công nghệ (1 slide).**

| Tầng | Công nghệ | Vì sao chọn |
| --- | --- | --- |
| Giao diện | React 19 + Vite, React Router, TanStack Query, Zustand, CSS3 tự viết | Nhanh, tách code theo vai trò, không dùng template giao diện |
| Máy chủ | Django 5.2 + Django REST Framework, JWT | Có sẵn xác thực, phân quyền, kiểm tra dữ liệu, ORM chống SQL injection |
| Dữ liệu | MySQL 8 (InnoDB) | Transaction và khóa dòng cho trừ kho đồng thời |
| Realtime | Django Channels + Daphne, Redis | Thông báo đơn mới tức thì, chạy được nhiều tiến trình |
| AI | Google Gemini (function calling, structured output) | Chatbot đọc dữ liệu thật, kiểm duyệt chữ + ảnh |
| Bản đồ | OpenStreetMap + Leaflet, Nominatim; chỉ đường bằng Google Maps | Miễn phí, không cần API key |
| Triển khai | Vercel, Render, Aiven MySQL, Upstash Redis | Chạy 24/7 trên gói miễn phí |

**Kiến trúc (1 slide, nên là một hình).** Trình duyệt (React) → API JSON + WebSocket → Django (View → Serializer → Service → Selector) → MySQL; Redis làm kênh realtime, giới hạn tần suất, chống đặt trùng; Gemini và Gmail gọi ở luồng nền.

## B. Tính năng đề bài yêu cầu (theo vai trò)

Toàn bộ yêu cầu chức năng của SRS, xếp theo vai trò. Cột **Quyết định** để nhóm chọn trong buổi họp: Giữ (lên slide), Gộp (gộp với dòng khác), Chỉ nói khi hỏi, Bỏ.

### Guest (chưa đăng nhập)

| # | Tính năng (SRS) | Màn hình | Quyết định |
| --- | --- | --- | --- |
| 1 | Xem chợ, sạp, sản phẩm và đánh giá của người khác | /markets, /farmers, /products |  |
| 2 | Tìm kiếm, lọc, sắp xếp; xem chợ trên bản đồ | /products, /markets |  |
| 3 | Đăng ký, đăng nhập (khách và nông dân dùng chung trang đăng nhập) | /register, /register/farmer, /login |  |
| 4 | Hỏi trợ lý AI (tùy chọn): giờ chợ, ai bán món gì | Widget chat |  |
| 5 | Trang About Us; Contact Us có bản đồ nhúng | /about, /contact |  |

### Khách hàng

| # | Tính năng (SRS) | Màn hình | Quyết định |
| --- | --- | --- | --- |
| 1 | Đăng ký với họ tên, SĐT, email, địa chỉ; đăng nhập; dashboard cá nhân | /register, /customer |  |
| 2 | Dùng chung tài khoản gia đình (tùy chọn) | Nhiều thiết bị cùng đăng nhập |  |
| 3 | Xem chợ gần theo vị trí và ngày họp; bản đồ có marker và chỉ đường | /markets, /markets/:id |  |
| 4 | Xem hồ sơ nông dân: sạp, vị trí, ngày bán, hàng trong tuần | /farmers/:id |  |
| 5 | Danh mục sản phẩm; lọc theo giá, danh mục, chợ, ngày; chi tiết giá, đơn vị, còn bao nhiêu, người bán | /products, /products/:id |  |
| 6 | Giỏ hàng; đặt trước theo tồn kho | /customer/cart, /customer/checkout |  |
| 7 | Chọn ngày nhận và khung giờ nông dân đặt ra | /customer/checkout |  |
| 8 | Theo dõi đơn: Placed → Accepted → Ready for pickup → Completed | /customer/orders/:id |  |
| 9 | Xem, sửa, hủy đơn trước giờ chốt | /customer/orders, /customer/orders/:id/edit |  |
| 10 | Trả tiền mặt khi nhận hàng | — |  |
| 11 | Lịch sử đơn và đặt lại nhanh | /customer/orders |  |
| 12 | Yêu thích sạp, sản phẩm, chợ; báo khi món yêu thích có hàng lại | /customer/favorites |  |
| 13 | Chấm sao và nhận xét sạp, sản phẩm sau khi nhận hàng | /customer/orders/:id/review |  |
| 14 | Thông báo email hoặc in-app khi đơn được duyệt và khi sẵn sàng | Chuông, /customer/notifications |  |

### Nông dân

| # | Tính năng (SRS) | Màn hình | Quyết định |
| --- | --- | --- | --- |
| 1 | Đăng ký với tên sạp, người liên hệ, SĐT, email, địa chỉ | /register/farmer |  |
| 2 | Cập nhật chợ tham gia, ngày bán, vị trí trên bản đồ | /farmer/profile, /farmer/markets |  |
| 3 | Thêm / sửa / xem / xóa sản phẩm: tên, danh mục, giá, đơn vị, số lượng, mô tả, ảnh | /farmer/products |  |
| 4 | Mẫu tồn kho lặp lại hàng tuần | /farmer/stock-template |  |
| 5 | Đánh dấu Sold out / Temporarily unavailable | /farmer/products |  |
| 6 | Xem đơn đến theo thời gian thực | /farmer/orders |  |
| 7 | Accept / Decline đơn; đánh dấu Ready for pickup | /farmer/orders/:id |  |
| 8 | Đặt giờ chốt nhận đơn; quản lý khung giờ nhận hàng | /farmer/profile, /farmer/markets |  |
| 9 | Dashboard: lịch sử bán, sản phẩm bán chạy, tổng đơn, đơn chờ, doanh thu | /farmer, /farmer/stats |  |
| 10 | Trả lời công khai đánh giá của khách | /farmer/reviews |  |

### Admin

| # | Tính năng (SRS) | Màn hình | Quyết định |
| --- | --- | --- | --- |
| 1 | Trang quản trị đăng nhập riêng | /admin/login |  |
| 2 | Thống kê tổng nông dân, khách hàng, chợ, đơn hàng | /admin |  |
| 3 | Duyệt / đình chỉ hồ sơ nông dân (chưa duyệt thì không bán được) | /admin/farmers, /admin/approvals |  |
| 4 | Kích hoạt / khóa tài khoản khách vi phạm | /admin/customers |  |
| 5 | Thêm / sửa / xóa chợ: tên, địa chỉ, ngày họp, giờ mở đóng, tọa độ | /admin/markets |  |
| 6 | Gỡ tin sản phẩm sai sự thật, bình luận thô tục | /admin/moderation |  |
| 7 | Báo cáo: khối lượng đơn, doanh thu ước tính theo chợ, nông dân năng nổ nhất | /admin/reports |  |
| 8 | Quản lý danh mục sản phẩm gốc | /admin/categories |  |
| 9 | Gửi thông báo toàn sàn | /admin/announcements |  |

### Chung cho cả hệ thống

| # | Tính năng (SRS) | Màn hình | Quyết định |
| --- | --- | --- | --- |
| 1 | Phân quyền theo vai trò | Mọi trang + mọi API |  |
| 2 | Giao diện responsive (máy tính, điện thoại) | Mọi trang |  |
| 3 | Tương thích Chrome, Safari, Edge, Firefox | — |  |

## C. Tính năng mở rộng nhóm làm thêm (theo vai trò)

Trọng tâm của bài thuyết trình (giáo viên hướng dẫn nhắc phải nêu bật). Mỗi dòng có **vì sao làm** — khi trình bày luôn nói lý do, không chỉ kể tên. Chi tiết từng tính năng: Phần 5 và 7 của file ôn tập.

### Khách hàng (và Guest)

| # | Tính năng mở rộng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| 1 | Đặt hàng thì tạm giữ kho, nông dân duyệt mới trừ kho thật | Không bán vượt số hàng có; đơn bị từ chối / hết hạn thì hàng tự nhả |  |
| 2 | Giỏ nhiều sạp → mỗi sạp một đơn riêng, tối đa 5 sạp, đặt kiểu all-or-nothing | Mỗi sạp có kho, giờ chốt, khung giờ riêng; không có chuyện chỉ tạo được một nửa số đơn |  |
| 3 | Checkout chỉ hiện chợ / khung giờ mà mọi món trong nhóm đều bán; một đơn một chợ | Sạp bán nhiều chợ nhưng không mang mọi món tới mọi chợ |  |
| 4 | Yêu cầu thay đổi cho đơn đã được duyệt (nông dân chấp nhận / từ chối) | Nông dân có thể đã soạn hàng; sửa thẳng gây lệch kho, tranh cãi |  |
| 5 | Bấm đặt 2 lần không ra 2 đơn (Idempotency-Key) | Mạng điện thoại chập chờn, trình duyệt tự gửi lại |  |
| 6 | Giới hạn 10 đơn đang chờ mỗi khách, 10 lần gửi đơn mỗi giờ | Chống spam, đặt ảo |  |
| 7 | Số lượng tối thiểu / tối đa mỗi đơn cho từng sản phẩm | Có món bán từ 2 kg; có món cần chia đều cho nhiều khách |  |
| 8 | Chi tiết đơn: đồng hồ đếm ngược giờ chốt, SĐT nông dân kèm nút gọi, vị trí sạp trong chợ | Khách biết còn bao lâu để sửa, tìm đúng sạp, liên lạc nhanh |  |
| 9 | Nút chỉ đường mở Google Maps (trang chợ, sạp, đơn, checkout) | Chỉ đường tốt nhất, quen thuộc, không cần API key |  |
| 10 | Phiên đăng nhập theo thiết bị: mỗi máy một giỏ, đăng xuất máy này không văng máy khác | Cách làm "dùng chung tài khoản gia đình" mà không cần module thành viên |  |
| 11 | Thanh tab dưới đáy kiểu app trên điện thoại; bộ lọc lưu trên URL, chia sẻ được | Dễ dùng trên điện thoại; gửi link là thấy đúng kết quả |  |
| 12 | Tên người đánh giá rút gọn; trang Privacy, Sitemap, 403 / 404 | Bảo vệ thông tin cá nhân; đủ trang của một web thật |  |

### Nông dân

| # | Tính năng mở rộng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| 1 | Bỏ từng món hết hàng khỏi đơn (Sold out một món), tính lại tiền, báo khách | Thực tế thường hết một món; từ chối cả đơn thì khách mất hết |  |
| 2 | Bảng so sánh cũ / mới khi khách xin đổi đơn; 3 lựa chọn | Nông dân quyết định có đáp ứng được không |  |
| 3 | Đánh dấu khách không đến (No-show), hoàn kho | Hàng đã soạn quay lại bán cho người khác |  |
| 4 | Danh sách soạn hàng theo ngày; đơn gom theo khách | Sáng ngày chợ cần biết tổng phải mang bao nhiêu kg mỗi món |  |
| 5 | Lịch nghỉ (Time off) theo khoảng ngày | Đề bài nhắc "nông dân nghỉ tuần đó" là vấn đề thật |  |
| 6 | Ngày bán trong tuần; chặn bỏ ngày khi còn đơn mở | Khách không đến nhầm hôm; không bỏ rơi khách đã đặt |  |
| 7 | Bán ở nhiều chợ, mỗi chợ Admin duyệt, có vị trí sạp trong chợ | Admin kiểm soát sạp nào thật sự có chỗ ở chợ nào |  |
| 8 | Chọn chợ bán cho từng sản phẩm; kho dùng chung mọi chợ | Không phải nhập kho riêng cho từng chợ |  |
| 9 | Sạp chờ duyệt vẫn đăng nhập, chuẩn bị hồ sơ, chợ, khung giờ | Được duyệt là bán được ngay |  |
| 10 | Tự tra tọa độ từ địa chỉ, kéo ghim chỉnh lại | Nông dân lớn tuổi không biết vĩ độ / kinh độ |  |
| 11 | Kiểm tra tin đăng ngay khi gõ (precheck) | Sửa trước khi gửi, ít bị từ chối |  |
| 12 | Thao tác hàng loạt: hết hàng, tạm ngừng, mở bán, đổi chợ bán | Sạp nhiều sản phẩm không phải bấm từng cái |  |
| 13 | Thống kê nâng cao: so với kỳ trước, giá trị trung bình mỗi đơn, doanh thu theo chợ, thứ đông khách nhất | Biết nên mang hàng tới chợ nào, hôm nào |  |
| 14 | Ảnh upload được mã hóa lại, xóa GPS trong ảnh | Ảnh chụp tại nhà không lộ tọa độ nhà nông dân |  |

### Admin

| # | Tính năng mở rộng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| 1 | Hàng chờ duyệt 4 tab (sạp, sản phẩm, chợ, AI) + badge số việc chờ | Một chỗ xem mọi thứ đang chờ mình |  |
| 2 | Duyệt tin đăng trước khi lên sàn; sửa tên / ảnh thì duyệt lại, sửa giá / kho thì không | Đề bài chỉ cho gỡ tin sai sau khi khách đã thấy — quá muộn |  |
| 3 | AI duyệt tin 2 lớp (luật + Gemini đọc chữ và ảnh): tự duyệt tin sạch, giữ tin vi phạm | Admin không đọc hết được; giá cả để luật kiểm vì AI không biết giá chợ |  |
| 4 | Trang AI Decisions + thống kê độ tin cậy AI 30 ngày | AI tự quyết nhưng Admin luôn xem lại, có số liệu để tin AI |  |
| 5 | Khung giá và tồn kho tối đa theo danh mục | Mốc so sánh cho lớp luật do Admin chỉnh |  |
| 6 | AI đọc đánh giá: chắc chắn vi phạm thì tự ẩn, nghi ngờ thì gắn cờ | Lời thô tục không nằm công khai chờ Admin; lời chê thật vẫn giữ |  |
| 7 | Hàng đợi cờ + cờ tự động (đánh giá xấu, nhiều sao thấp, khách bỏ đơn) | Ghi nhớ việc còn nợ một quyết định |  |
| 8 | Ẩn (đang điều tra) và Chặn (vi phạm, hủy đơn liên quan) là hai thao tác khác nhau | Không hủy đơn của khách khi mới chỉ nghi ngờ |  |
| 9 | Xem trước tác động trước khi đình chỉ sạp, khóa khách, chặn sản phẩm, đóng chợ | Biết bao nhiêu đơn và người bị ảnh hưởng trước khi bấm |  |
| 10 | Đóng chợ khẩn cấp: gõ "confirm", từ chối đơn + hoàn kho, một thông báo gộp; mở lại tự bật khung giờ | Báo ngay cho mọi người có đơn; chống bấm nhầm |  |
| 11 | Lịch đóng cửa chợ tạm thời theo khoảng ngày | Lễ Tết, mưa bão |  |
| 12 | Đổi lịch / giờ chợ có xem trước tác động, đơn lệch được báo dời giờ | Đổi giờ có thể làm hàng chục đơn mất hiệu lực |  |
| 13 | Tự khóa khách không đến lấy 3 lần trong 30 ngày; cờ At risk | Đặt mà không đến là thiệt hại trực tiếp cho nông dân |  |
| 14 | Nhật ký an ninh; lịch sử thay đổi từng trường | Biết ai làm gì, lúc nào, từ đâu khi có sự cố |  |
| 15 | Trang xem đơn chỉ đọc; trang Limits | Tra cứu khiếu nại mà không sửa đơn người khác; biết hệ thống đang áp giới hạn nào |  |
| 16 | Dashboard "Needs attention" + biểu đồ số đơn theo tháng | Việc chờ hôm nay hữu ích hơn con số tổng |  |
| 17 | Xuất Excel an toàn (chặn chèn công thức) + xuất CSV | Báo cáo mang đi được mà không có rủi ro |  |
| 18 | Danh mục: icon không trùng, kéo thả sắp thứ tự | Khách không nhầm danh mục; Admin sắp trực quan |  |
| 19 | Thông báo toàn sàn theo đối tượng (tất cả / khách / nông dân) và thời gian hiệu lực | Gửi đúng người, tự tắt khi hết hạn |  |

### Chung cho cả hệ thống

| # | Tính năng mở rộng | Vì sao làm | Quyết định |
| --- | --- | --- | --- |
| 1 | Vòng đời đơn 8 trạng thái, 13 cạnh chuyển, một lõi xử lý; giờ chốt lưu cứng trên đơn | Đề bài chỉ có 4 trạng thái suôn sẻ; thực tế có hủy, từ chối, không đến, quên duyệt |  |
| 2 | Đơn quá hạn tự hết hạn bằng quét lười (không cần cron) | Đơn không treo mãi; không tốn tiền chạy tiến trình nền |  |
| 3 | Chatbot cho cả 4 vai trò, đọc dữ liệu thật qua 7 công cụ chỉ đọc, đa ngôn ngữ, tìm tiếng Việt không dấu | Đề bài chỉ gợi ý chatbot cho khách; AI không chạm thẳng CSDL |  |
| 4 | Gemini có model dự phòng, giới hạn số câu mỗi ngày; mất AI thì web vẫn chạy | Demo không chết giữa chừng; không tốn quota |  |
| 5 | 24 loại thông báo; realtime cho nông dân (WebSocket, vé dùng 1 lần); email cho 7 sự kiện | Đề bài chỉ cần một kênh cho 2 sự kiện |  |
| 6 | Chống thao tác đồng thời: transaction, khóa dòng, khóa lạc quan (If-Match), tự chạy lại khi deadlock | Ngày họp chợ nhiều người thao tác cùng lúc |  |
| 7 | Bảo mật phiên: thu hồi từng thiết bị, phát hiện refresh token bị dùng lại, đổi mật khẩu đăng xuất máy khác | Lộ token cũng hạn chế được thiệt hại |  |
| 8 | Chống dò mật khẩu theo IP và theo email; hai cổng đăng nhập không lộ tài khoản Admin; một SĐT một tài khoản | Chống tấn công và tài khoản ảo |  |
| 9 | Giao diện sáng / tối, skeleton khi tải, chặn rời trang khi form chưa lưu, lỗi hiện đúng dưới ô nhập | Trải nghiệm như web thật |  |
| 10 | Triển khai 24/7: Vercel, Render, Aiven MySQL, Upstash Redis | Giám khảo truy cập được bất cứ lúc nào |  |

## D. Phân công công việc

Nhóm tự điền trong buổi họp. Gợi ý: ghi theo **phần việc**, không chỉ ghi tên, để khi giám khảo hỏi "ai làm phần này" thì người đại diện trả lời được ngay.

| Thành viên | Vai trò | Phần việc chính |
| --- | --- | --- |
|  | Trưởng nhóm |  |
|  |  | Backend: đơn hàng, kho, vòng đời đơn |
|  |  | Backend: tài khoản, chợ, lịch, Admin |
|  |  | AI: chatbot, kiểm duyệt |
|  |  | Frontend: khách hàng, nông dân |
|  |  | Frontend: Admin, giao diện chung |
|  |  | Tài liệu, CSDL, triển khai |

## E. Màn hình chính và luồng demo

Màn hình không để thành một phần riêng ở cuối: nói tới tính năng nào thì chiếu ảnh hoặc demo màn hình đó. Slide nên có ảnh chụp sẵn để dùng khi web chậm.

**Luồng demo 1 — tính năng đề bài (khoảng 6 phút)**

1. Guest: trang chủ → Near me → bản đồ chợ → trang sạp → lọc sản phẩm.
2. Khách: thêm hàng của 2 sạp vào giỏ → checkout chọn ngày, khung giờ → đặt được 2 đơn.
3. Nông dân: toast "có đơn mới" bật lên → Accept → (sau giờ chốt) Ready → Complete.
4. Khách: xem timeline đơn, đánh giá sạp và sản phẩm.
5. Admin: dashboard 4 con số, duyệt sạp mới, quản lý chợ, báo cáo + xuất Excel.

**Luồng demo 2 — tính năng mở rộng (khoảng 8 phút)**

1. Kho tạm giữ: kho 30, khách A đặt 20 → khách B đặt 15 bị báo "Only 10 left".
2. Khách sửa đơn đã được duyệt → nông dân thấy bảng so sánh cũ / mới → chấp nhận.
3. Nông dân bỏ một món hết hàng khỏi đơn; danh sách soạn hàng theo ngày.
4. Nông dân đăng tin mới → AI tự duyệt tin sạch / giữ tin giá bất thường → Admin xem AI Decisions.
5. Khách viết đánh giá thô tục → bị ẩn, Admin thấy nhãn "Hidden by AI".
6. Chatbot: khách hỏi "đơn của tôi tới đâu", nông dân hỏi "món nào sắp hết".
7. Admin đóng chợ: màn hình xem trước tác động → gõ "confirm" → đơn bị từ chối, khách nhận thông báo.
8. Khách không đến lấy 3 lần → tự khóa (dùng sẵn tài khoản `customer_19`, `customer_20`).

**Ảnh chụp cần chuẩn bị cho slide**

- [ ] Trang chủ và bản đồ chợ
- [ ] Trang sản phẩm có bộ lọc
- [ ] Checkout (chọn ngày, khung giờ, nút chỉ đường)
- [ ] Chi tiết đơn của khách (timeline, đếm ngược)
- [ ] Danh sách đơn và chi tiết đơn của nông dân
- [ ] Form sản phẩm có precheck
- [ ] Dashboard nông dân, trang Stats
- [ ] Dashboard Admin (Needs attention)
- [ ] Approvals và AI Decisions
- [ ] Hộp thoại đóng chợ có xem trước tác động
- [ ] Widget chatbot đang trả lời
- [ ] Giao diện điện thoại (thanh tab dưới đáy)

## Việc nhóm cần chốt trong buổi họp

- [ ] Chọn Giữ / Gộp / Chỉ nói khi hỏi / Bỏ cho từng dòng ở phần B và C
- [ ] Chọn 5–6 tính năng mở rộng **nổi bật nhất** để demo kỹ (gợi ý: kho tạm giữ, yêu cầu thay đổi đơn, AI duyệt tin + AI Decisions, chatbot đọc dữ liệu thật, đóng chợ có xem trước tác động, tự khóa khách không đến)
- [ ] Thống nhất cách trả lời câu "nhóm có dùng AI viết code không" (Phần 10 file ôn tập)
- [ ] Điền bảng phân công
- [ ] Chuẩn bị dữ liệu demo: sản phẩm kho 30 kg, đơn sắp tới giờ chốt, tin đăng giá bất thường
- [ ] Thử web trên Opera (bảng chấm điểm có nhắc)
- [ ] Chọn hình thức slide (màu, font) rồi mới dựng slide
