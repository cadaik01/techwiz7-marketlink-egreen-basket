# KỊCH BẢN THUYẾT TRÌNH BẢO VỆ ĐỒ ÁN MARKETLINK (DƯỚI 10 PHÚT)
> **Slide tham chiếu:** `MarketLink_Slides_Project_Defense_VI.pptx` (9 slide)  
> **Nhóm thực hiện:** FPT BitForge (Đức Long, Tuấn Tú, Minh Anh, Khánh Danh, Kim Nghi)  
> **Thời lượng phân bổ:** ~8 – 9 phút trình bày; dành 5 – 6 phút cho Hội đồng phản biện.

---

### SLIDE 1: MỞ ĐẦU & GIỚI THIỆU ĐỀ TÀI
- **Thời lượng:** ~15-20 giây

#### Lời thoại trình bày:
Kính chào Hội đồng giám khảo!

Chúng tôi là nhóm **FPT BitForge**, gồm 5 thành viên: Đức Long, Tuấn Tú, Minh Anh, Khánh Danh và Kim Nghi. Hôm nay, nhóm xin trình bày đề tài **MarketLink** là nền tảng số hóa hoạt động mua bán và đặt trước nông sản tại các chợ truyền thống.".

---

### SLIDE 2: BÀI TOÁN THỰC TẾ & MỤC TIÊU
- **Thời lượng:** ~35–40 giây

#### Lời thoại trình bày:
Về bài toán thực tế, mô hình chợ truyền thống hiện nay gặp rào cản lớn về kênh thông tin giữa hai phía:

- **Người mua:** Thường khó biết trước nông dân nào sẽ tham gia chợ, sản phẩm còn hay hết, và giá bán như thế nào. Vì vậy, họ có thể mất công đi lại nhưng vẫn không mua được mặt hàng mong muốn.
- **Về phía nông dân:** Thiếu công cụ thuận tiện để công khai hàng hóa, không tiếp nhận được đơn đặt trước và khó giữ chân khách quen.

Do đó, **MarketLink** ra đời để kết nối trực tiếp hai bên: Nông dân chủ động công bố hàng hóa và quản lý đơn đặt trước; người mua dễ dàng định vị gian hàng qua bản đồ và đặt chỗ lấy hàng.

---

### SLIDE 3: GIẢI PHÁP & KIẾN TRÚC HỆ THỐNG
- **Thời lượng:** ~30–40 giây

#### Lời thoại trình bày:
MarketLink được xây dựng theo kiến trúc phân tầng, gồm ba thành phần chính:

- **Frontend:** React 19 và Vite, xây dựng giao diện tương tác trên trình duyệt web.
- **Backend:** Django REST Framework, áp dụng mô hình Service/Selector để tách biệt xử lý nghiệp vụ và truy vấn dữ liệu.
- **Database:** MySQL 8 với InnoDB, sử dụng Transaction và khóa dòng để bảo đảm tính nhất quán khi nhiều giao dịch diễn ra đồng thời.

Ngoài ra, hệ thống tích hợp Redis và WebSocket để hỗ trợ thông báo theo thời gian thực, cùng Google Gemini cho các tính năng AI.

---

### SLIDE 4: BỐN VAI TRÒ, MỘT LUỒNG ĐẶT TRƯỚC
- **Thời lượng:** ~45–50 giây

#### Lời thoại trình bày:
Trên nền tảng kiến trúc đó, MarketLink phân chia quyền hạn cho bốn nhóm người dùng:

- **Khách vãng lai:** Tìm kiếm chợ, xem sản phẩm và định vị gian hàng trên bản đồ.
- **Khách hàng:** Đặt trước, theo dõi đơn hàng và đánh giá sản phẩm.
- **Nông dân:** Quản lý gian hàng, nông sản, lượng hàng trong kho và xác nhận đơn.
- **Admin:** Duyệt hồ sơ nông dân đăng ký, quản lý chợ và giám sát hệ thống.

Quy trình đặt trước gồm năm bước: **Tìm chợ và nông sản – Đặt hàng – Xác nhận – Nhận hàng và thanh toán tại sạp – Đánh giá.** Trong quá trình này, nông dân nhận thông báo khi có đơn mới, còn khách hàng được thông báo khi đặt hàng thành công. **Cả hai thông báo đều được gửi theo thời gian thực.**

---

### SLIDE 5: AI KIỂM DUYỆT TIN ĐĂNG & ĐÁNH GIÁ
- **Thời lượng:** ~60–80 giây

#### Lời thoại trình bày:
Trong thời đại AI phát triển mạnh mẽ hiện nay, MarketLink cũng đã ứng dụng trí tuệ nhân tạo vào hệ thống để hỗ trợ người dùng.

Ứng dụng đầu tiên của AI trong MarketLink là kiểm duyệt nội dung, hoạt động qua cơ chế hai lớp:

- **Lớp luật:** Kiểm tra trước các thông số định lượng như khung giá danh mục, độ lệch so với mặt bằng giá chung và tính hợp lý của tồn kho. Nếu phát hiện giá sai lệch quá xa, hệ thống giữ tin lại ngay mà không cần gọi AI để tối ưu tài nguyên.
- **Lớp mô hình AI:** Đọc cả văn bản và hình ảnh để phát hiện mặt hàng không phải nông sản, đăng sai danh mục, ngôn từ phản cảm hoặc chứa thông tin nhằm giao dịch ngoài nền tảng.

Với tin đăng sản phẩm: tin hợp lệ được tự động duyệt ngay; tin có dấu hiệu vi phạm sẽ được giữ lại để Admin xử lý. Với đánh giá: AI tự động ẩn khi chắc chắn vi phạm (ví dụ ngôn từ không phù hợp), nhưng vẫn bảo đảm giữ nguyên những lời chê, phản hồi thực tế của khách hàng.

Mọi hành động của AI đều được lưu vết tại AI Decisions để Admin hậu kiểm và khôi phục khi cần. Trường hợp dịch vụ AI gặp sự cố hoặc gián đoạn kết nối, hệ thống sẽ tự động chuyển sang model dự phòng; nếu vẫn không phản hồi, tin đăng sẽ chuyển sang hàng chờ Admin duyệt thủ công để hệ thống luôn vận hành liên tục.

---

### SLIDE 6: TRỢ LÝ AI THEO VAI TRÒ
- **Thời lượng:** ~80–120 giây

#### Lời thoại trình bày:
Bên cạnh kiểm duyệt, AI còn đóng vai trò là một trợ lý trực tiếp cho từng nhóm người dùng. Khác với chatbot thông thường chỉ tư vấn chung chung, trợ lý của MarketLink truy vấn trực tiếp dữ liệu thực tế qua cơ chế Function Calling với 7 công cụ chỉ đọc, được phân quyền chặt chẽ cho 4 nhóm người dùng:

- **Khách vãng lai:** Hỗ trợ tìm nông sản đang bán, thông tin chợ, giờ mở cửa và khung giờ nhận của các sạp. Hệ thống không cho phép truy cập bất kỳ dữ liệu cá nhân nào; nếu hỏi về đơn hàng hay tài khoản, bot sẽ yêu cầu đăng nhập.
- **Khách hàng:** Bên cạnh tra cứu công khai, khách có thể kiểm tra chính xác đơn hàng của mình gồm ngày giờ nhận, vị trí sạp, danh sách món, tổng tiền và trạng thái đơn; tuyệt đối không thể xem đơn của người khác hay dữ liệu nội bộ của sạp.
- **Nông dân:** Trợ lý giúp chủ sạp quản lý nhanh tình hình kinh doanh: tổng hợp đơn chờ duyệt, đơn đã nhận, đơn quá hạn; đồng thời cảnh báo các mặt hàng sắp hết, hết kho, hoặc sản phẩm bị Admin từ chối kèm lý do. Nông dân được cách ly hoàn toàn, không thể xem thông tin của sạp khác hay dữ liệu khách hàng ngoài sạp mình.
- **Admin:** Trợ lý cung cấp bức tranh vận hành tổng quan: số sạp và sản phẩm chờ duyệt, số cờ vi phạm, khách hàng rủi ro đặt nhưng không lấy, lượng đơn 7 ngày qua và thống kê độ chính xác của AI kiểm duyệt trong 30 ngày. Đáng chú ý, bot chỉ báo cáo số lượng đếm chứ tuyệt đối không xuất danh sách cá nhân chi tiết qua chat, và AI không có quyền thay Admin ra quyết định duyệt hay khóa tài khoản.

Về bảo mật và an toàn tài nguyên, toàn bộ 7 công cụ đều là chỉ đọc (Read-only). Trong bản demo này, hệ thống thiết lập hạn mức an toàn là tối đa 20 câu/phút; hạn mức theo ngày cho phép 30 câu với khách vãng lai và 100 câu với tài khoản đã đăng nhập (trong thực tế có thể mở rộng linh hoạt theo quy mô kinh doanh).

---

### SLIDE 7: BẢO VỆ TỒN KHO - CHỐNG ĐẶT TRÙNG - LỊCH SỬ THAY ĐỔI
- **Thời lượng:** ~55–60 giây

#### Lời thoại trình bày:
Để bảo đảm hệ thống vận hành tin cậy và không xảy ra sai sót dữ liệu, MarketLink xử lý triệt để 4 bài toán kỹ thuật cốt lõi:

- **Thứ nhất là tạm giữ hàng (Stock Hold):** Khi khách đặt hàng, hệ thống tạm giữ số lượng tương ứng trong một khoảng thời gian để người mua và người bán có thời gian chốt đơn. Trong thời gian này, số hàng đã giữ sẽ không khả dụng cho các khách khác đặt mua. Ví dụ, sạp có 30 kg, khách A đặt 20 kg thì khách B chỉ có thể đặt tối đa 10 kg. Khi đến thời gian chốt và người bán xác nhận, đơn được chốt - hàng trừ kho; nếu đơn bị từ chối hoặc hết hạn, số hàng tạm giữ sẽ được giải phóng để tiếp tục đặt mua.
- **Thứ hai là chống tạo đơn trùng lặp:** Khi mạng chập chờn hoặc khách bấm nút đặt hàng nhiều lần, cơ chế Idempotency-Key kết hợp Redis giúp nhận diện yêu cầu đã xử lý và trả lại kết quả tương ứng, tránh tạo đơn trùng và xử lý trừ kho nhiều lần.
- **Thứ ba là xử lý đồng thời:** Transaction và cơ chế khóa dòng (Row-level Locking) giúp kiểm soát giao dịch đồng thời, hạn chế nguy cơ bán vượt tồn kho. Đồng thời, việc thống nhất thứ tự khóa giúp giảm nguy cơ deadlock.
- **Thứ tư là Audit Log & Lịch sử thay đổi:** Hệ thống ghi nhật ký quản trị nhạy cảm kèm IP và lý do (kể cả khi AI tự ẩn đánh giá); đồng thời lưu vết chi tiết từng trường dữ liệu thay đổi từ giá trị Cũ sang Mới phục vụ truy vết khi có tranh chấp.

---

### SLIDE 8: BẢO VỆ GIAO DỊCH - CHỐNG ĐẶT ẢO & KHÓA KHÁCH BOM HÀNG
- **Thời lượng:** ~50–55 giây

#### Lời thoại trình bày:
Do MarketLink áp dụng mô hình nhận hàng và trả tiền mặt trực tiếp tại sạp mà không bắt buộc đặt cọc trước, rủi ro lớn nhất đối với người nông dân là bị đặt ảo hoặc bị "bom hàng". Để bảo vệ người bán, hệ thống xây dựng cơ chế bảo vệ giao dịch qua 3 lớp:

- **Thứ nhất – Chặn đặt ảo từ đầu:** Mỗi số điện thoại chỉ được đăng ký một tài khoản duy nhất. Mỗi khách hàng bị giới hạn tối đa 10 đơn chờ duyệt cùng lúc và không quá 10 lần đặt hàng trong một giờ, ngăn chặn các hành vi tạo đơn ảo hàng loạt.
- **Thứ hai – Cơ chế No-show hoàn kho tức thì:** Khi hết khung giờ nhận hàng mà khách không đến, nông dân chỉ cần bấm xác nhận "No-show" trên ứng dụng. Toàn bộ lượng nông sản trong đơn sẽ tự động quay trở lại kho ngay lập tức để nông dân kịp bán cho khách vãng lai khác tại chợ.
- **Thứ ba – Thuật toán tự động khóa tài khoản:** Nếu một tài khoản vi phạm No-show 3 lần trong vòng 30 ngày, hệ thống sẽ tự động khóa tài khoản và hủy toàn bộ các đơn hàng đang mở khác của người này nhằm giải phóng hàng cho các sạp. Khi Admin xem xét mở lại tài khoản, bộ đếm vi phạm sẽ được làm mới từ đầu.

> [!TIP]
> **Ghi chú chuẩn bị cho phần chất vấn (Q&A):**  
> *Nếu Hội đồng hỏi: "Nếu người bán đã giao hàng, nhận tiền mặt rồi nhưng vẫn cố tình bấm No-show thì sao?"*  
> Trả lời:  
> 1. Hiện tại: Nông dân không có động cơ làm vậy vì không mất phí hoa hồng, bấm No-show chỉ làm kho hàng của chính họ bị ảo (thừa trên web); khách hàng nhận thông báo ngay và có quyền khiếu nại lên Admin để mở khóa và reset bộ đếm vi phạm; sạp gian lận sẽ bị Admin gắn cờ hoặc đình chỉ.  
> 2. Hướng phát triển tiếp theo: Nhóm sẽ bổ sung **Mã xác thực nhận hàng (Pickup OTP) hoặc Quét mã QR hai chiều**. Khi khách đến sạp trả tiền mặt, người bán phải quét mã QR trên ứng dụng của người mua thì hệ thống mới xác nhận hoàn tất đơn hàng (`COMPLETED`), khi đó người bán sẽ không thể tự ý bấm No-show được nữa.


---

### SLIDE 9: TỔNG KẾT & MỞ RỘNG
- **Thời lượng:** ~45–50 giây

#### Lời thoại trình bày:
Để tổng kết lại, MarketLink mang đến một giải pháp số hóa toàn diện cho chợ truyền thống dựa trên 3 giá trị cốt lõi:

- **Thứ nhất – Vận hành thực tế:** Kết nối chặt chẽ Người mua, Nông dân và Ban quản lý chợ trong quy trình đặt trước – nhận hàng và trả tiền mặt trực tiếp tại sạp, vừa tiện lợi vừa giữ trọn nét đặc trưng của chợ truyền thống.
- **Thứ hai – Ứng dụng AI có kiểm soát:** Kết hợp nhịp nhàng giữa Lớp luật và mô hình Gemini để kiểm duyệt nội dung tự động, cùng Trợ lý ảo truy vấn dữ liệu thực tế theo đúng thẩm quyền mà không xâm phạm dữ liệu riêng tư.
- **Thứ ba – Kiến trúc tin cậy và bền vững:** Bảo đảm không bán vượt tồn kho, loại trừ đặt trùng đơn, ngăn chặn đặt ảo và tự động khóa tài khoản bùng hàng.

Ngoài ra, hệ thống đã hoàn thiện các tính năng thực tế như: cho phép khách gửi yêu cầu đổi đơn, nông dân linh hoạt bỏ riêng món hết hàng, và Admin đóng chợ khẩn cấp kèm xem trước tác động để xử lý các sự cố thiên tai hay dịch bệnh.

Trên đây là phần trình bày đề tài MarketLink của nhóm **FPT BitForge**. Xin chân thành cảm ơn quý Thầy Cô trong Hội đồng giám khảo đã chú ý lắng nghe, và nhóm rất mong nhận được những câu hỏi chất vấn cũng như ý kiến đóng góp từ Hội đồng!
