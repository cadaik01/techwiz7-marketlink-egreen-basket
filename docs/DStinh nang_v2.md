# MarketLink — Danh sách tính năng (bản chọn lọc)

**Cách đọc**

- Mỗi mục là **một tính năng trọn vẹn**. Các chi tiết nhỏ (nút bấm, kiểm tra dữ liệu, thông báo lỗi…) nằm bên trong tính năng đó, không tính thành tính năng riêng.
- **★** = quan trọng: nên nói khi thuyết trình hoặc đưa vào demo.
- Phần III liệt kê những dòng trước đây bị ghi nhầm là "mở rộng" nhưng thực ra là phần cơ bản hoặc phần hoàn thiện, kèm mã cũ để nhóm đối chiếu.

---

## Phần I — Tính năng đề bài yêu cầu (SRS)

### I.1 Khách hàng

| Mã | Tính năng | MarketLink làm thế nào |
| --- | --- | --- |
| K1 | Đăng ký, đăng nhập | Bắt buộc họ tên, SĐT, email, địa chỉ; đăng nhập bằng JWT |
| K2 | Dashboard cá nhân | Đơn đang mở, lần nhận sắp tới, sạp yêu thích |
| K3 ★ | Tìm chợ gần tôi trên bản đồ | Nút Near me lấy GPS, sắp chợ gần nhất trước, lọc theo ngày họp, bản đồ Leaflet có marker, nút chỉ đường Google Maps |
| K4 | Xem hồ sơ sạp | Tên sạp, vị trí, ngày bán, hàng đang bán trong tuần |
| K5 ★ | Tìm, lọc và xem chi tiết sản phẩm | Lọc theo danh mục, giá, chợ, ngày; trang chi tiết có giá, đơn vị, số lượng còn, sạp bán |
| K6 ★ | Giỏ hàng và đặt trước | Chọn chợ, ngày, khung giờ nhận; server kiểm tra kho; trả tiền mặt khi nhận |
| K7 ★ | Theo dõi trạng thái đơn | Timeline Placed → Accepted → Ready → Completed |
| K8 ★ | Sửa / hủy đơn trước giờ chốt | Đổi số lượng, thêm bớt món, đổi ngày / khung giờ; hủy có hộp xác nhận |
| K9 | Lịch sử đơn và đặt lại | Tab đơn đã xong, nút Reorder |
| K10 | Yêu thích và báo có hàng lại | Lưu sạp, sản phẩm, chợ; báo khi món yêu thích được nhập thêm hàng |
| K11 ★ | Đánh giá sạp và sản phẩm | Chỉ đơn Completed mới đánh giá được; khách khác xem đánh giá trước khi mua |
| K12 ★ | Trợ lý AI (đề bài ghi tùy chọn) | Chatbot Gemini trả lời: tìm món, giờ họp chợ, sạp có bán không, khung giờ nhận, chi tiết sản phẩm |
| K13 | Dùng chung tài khoản gia đình (tùy chọn) | Nhiều thiết bị cùng đăng nhập, mỗi máy một phiên và một giỏ riêng |

### I.2 Nông dân

| Mã | Tính năng | MarketLink làm thế nào |
| --- | --- | --- |
| N1 ★ | Đăng ký sạp và hồ sơ | Tên sạp, người liên hệ, SĐT, email, địa chỉ; các chợ bán, ngày bán; ghim bản đồ, tọa độ |
| N2 ★ | Quản lý sản phẩm | Thêm / sửa / xem / xóa (xóa mềm), có ảnh, danh mục, đơn vị, giá, kho |
| N3 ★ | Mẫu tồn kho hàng tuần | Mức kho mặc định mỗi tuần, chỉnh khi nguồn hàng đổi; nút Sold out, Pause / Resume |
| N4 ★ | Xử lý đơn | Xem đơn đến, chấp nhận, từ chối (kèm lý do), đánh dấu sẵn sàng |
| N5 | Giờ chốt và khung giờ nhận | Số giờ chốt trong hồ sơ; thêm / bật / tắt / xóa khung giờ cho từng chợ |
| N6 | Số liệu bán hàng | Doanh thu, tổng đơn, đơn đang chờ, sản phẩm bán chạy, biểu đồ |
| N7 | Xem và trả lời đánh giá | Trả lời công khai một lần |

### I.3 Admin

| Mã | Tính năng | MarketLink làm thế nào |
| --- | --- | --- |
| A1 | Đăng nhập cổng riêng và dashboard | Cổng /admin/login; tổng số nông dân, khách, chợ, đơn |
| A2 ★ | Duyệt / đình chỉ nông dân | Nông dân chỉ bán được khi đã được duyệt |
| A3 | Quản lý tài khoản khách | Kích hoạt / khóa, kèm lý do |
| A4 ★ | Quản lý chợ | Thêm / sửa / đóng chợ: tên, địa chỉ, ngày họp, giờ mở đóng, tọa độ |
| A5 ★ | Kiểm duyệt nội dung | Ẩn / chặn tin sản phẩm và đánh giá vi phạm |
| A6 | Báo cáo | Tổng đơn, doanh thu theo chợ, top nông dân |
| A7 | Cấu hình hệ thống | Quản lý danh mục, đăng thông báo toàn sàn |

### I.4 Chung, ràng buộc, phi chức năng

| Mã | Tính năng | MarketLink làm thế nào |
| --- | --- | --- |
| C1 | Phân quyền theo vai trò | Chặn trang ở giao diện, kiểm tra quyền ở mọi API |
| C2 | Tìm kiếm chung | Tìm chợ, sạp, sản phẩm; lọc theo vị trí, danh mục, giá, ngày |
| C3 ★ | Thông báo email + trong web | Khi đơn được chấp nhận và khi đơn sẵn sàng |
| C4 | Giao diện điện thoại | Responsive, thanh tab dưới đáy cho khách |
| C5 | About Us, Contact Us | Contact có Google Maps nhúng |
| C6 | Ràng buộc đề bài | Không thanh toán online, không giao hàng, không xác minh giấy phép — đều tuân thủ |
| C7 | Phi chức năng | Bảo mật (JWT, phân quyền server), hiệu năng (phân trang, index, cache, lazy load), chạy 24/7 trên Vercel + Render + Aiven MySQL + Upstash Redis |

---

## Phần II — Tính năng mở rộng (đề bài không yêu cầu)

Tiêu chí chọn: đề bài **không** yêu cầu, **và** giải quyết một vấn đề thật của chợ hoặc của hệ thống. Không tính các chi tiết hoàn thiện của tính năng đề bài.

### II.1 Khách hàng

**MK1 ★ Tạm giữ hàng khi đặt, trừ kho khi nông dân duyệt**
- Đề bài chỉ yêu cầu "đặt theo số hàng còn".
- MarketLink: đơn mới **tạm giữ** hàng, nông dân bấm Accept mới **trừ kho thật**. Đơn bị từ chối hoặc hết hạn thì hàng tự nhả. Khi thiếu hàng, hệ thống báo rõ món nào thiếu và còn bao nhiêu ("Only 10 KG left").
- Giá trị: không bán vượt số hàng có, nông dân không bị khóa hàng bởi đơn ảo.
- Công nghệ: tính số còn bán = kho − hàng đang giữ (`get_held_quantities`); trừ kho trong transaction có khóa dòng (`_deduct_stock`).

**MK2 ★ Một giỏ nhiều sạp, tách đơn theo sạp, đặt kiểu "tất cả hoặc không"**
- MarketLink: một lần bấm đặt tạo nhiều đơn, mỗi sạp một đơn (tối đa 5). Hoặc tạo đủ tất cả, hoặc không tạo đơn nào.
- Giá trị: mỗi sạp có kho, giờ chốt, khung giờ riêng và tự duyệt đơn của mình; khách không bị "đặt được một nửa".
- Công nghệ: `place_orders` chạy trong một `transaction.atomic`.
- Lưu ý: đang có lỗi đã biết. Cùng một sạp chưa tách được món ra hai chợ khác nhau. Hướng sửa ghi trong `docs/HANDOFF_checkout_split.md`.

**MK3 ★ Bấm đặt hai lần không ra hai đơn**
- MarketLink: mỗi lần đặt gửi kèm một Idempotency-Key. Server nhớ khóa này 24 giờ: gửi lại thì trả lại đúng kết quả cũ, không tạo đơn mới.
- Giá trị: mạng điện thoại ở chợ chập chờn, người dùng hay bấm lại.
- Công nghệ: Redis lưu khóa (đang xử lý 5 phút, kết quả 24 giờ).

**MK4 ★ Yêu cầu thay đổi cho đơn đã được duyệt**
- Đề bài chỉ cho sửa đơn trước giờ chốt, không nói gì về đơn đã duyệt.
- MarketLink: đơn đã duyệt thì khách không sửa thẳng mà gửi **yêu cầu thay đổi**. Nông dân thấy bảng so sánh cũ / mới và chọn chấp nhận, từ chối hoặc hủy đơn. Mỗi đơn chỉ có một yêu cầu; yêu cầu tự hủy khi tới giờ nhận.
- Giá trị: nông dân có thể đã soạn hàng, nếu khách sửa thẳng thì kho bị lệch.

**MK5 Chống đặt ảo**
- MarketLink:
  - mỗi khách tối đa 10 đơn đang chờ duyệt;
  - tối đa 10 lần đặt mỗi giờ;
  - tài khoản nông dân không đặt hàng được.
- Giá trị: không ai giữ hết hàng của sạp bằng đơn ảo.

### II.2 Nông dân

**MN1 Bỏ từng món hết hàng khỏi đơn**
- MarketLink: nông dân bỏ riêng món đã hết, tiền tự tính lại, khách được báo. Khi từ chối một đơn đã duyệt, nông dân phải khai món nào hết hàng để kho cuối cùng đúng.
- Giá trị: thường chỉ hết một món; từ chối cả đơn thì khách mất hết.

**MN2 Danh sách soạn hàng theo ngày**
- MarketLink: cộng tổng từng món theo ngày nhận, gom theo khách.
- Giá trị: sáng ngày chợ biết phải mang bao nhiêu kg.

**MN3 Lịch nghỉ và bảo vệ đơn đã nhận**
- MarketLink: nông dân khai các khoảng ngày nghỉ. Hệ thống chặn khai nghỉ, bỏ ngày bán hoặc rời chợ nếu còn đơn mở trong khoảng đó.
- Giá trị: đề bài nêu "nông dân nghỉ tuần đó" là vấn đề thật; khách đã đặt không bị bỏ rơi.

**MN4 Bán ở nhiều chợ có duyệt, chọn chợ bán cho từng sản phẩm**
- MarketLink: xin vào mỗi chợ đều phải được Admin duyệt; mỗi sản phẩm chọn bán ở chợ nào; kho dùng chung cho mọi chợ.
- Giá trị: Admin kiểm soát sạp nào thật sự có chỗ ở chợ nào; nông dân không phải mang mọi món tới mọi chợ.

**MN5 Số lượng tối thiểu / tối đa mỗi đơn**
- MarketLink: nông dân đặt mức tối thiểu và tối đa cho từng món; giỏ hàng tự kẹp số lượng.
- Giá trị: có món chỉ bán từ 2 kg; có món hiếm cần chia đều cho nhiều khách.

**MN6 Số liệu nâng cao**
- MarketLink: doanh thu so với kỳ trước, giá trị trung bình mỗi đơn, doanh thu theo chợ, thứ đông khách nhất, tỉ lệ hủy / không đến.
- Giá trị: biết nên mang hàng tới chợ nào, chuẩn bị nhiều hôm nào.

### II.3 Admin

**MA1 ★ AI kiểm duyệt tin sản phẩm trước khi lên sàn**
- Đề bài chỉ cho Admin gỡ tin sai **sau khi** khách đã thấy.
- MarketLink: tin mới hoặc tin sửa tên / mô tả / ảnh / danh mục phải qua kiểm duyệt. Có 2 lớp:
  - **Lớp 1 — luật:** giá so với khung giá của danh mục, lệch xa giá các sạp khác, kho bất thường.
  - **Lớp 2 — Gemini đọc chữ và ảnh:** có phải nông sản không, có đúng danh mục không, có ngôn từ xấu, có ghi liên hệ ngoài, ảnh có khớp không.
- Kết quả:
  - tin sạch tự duyệt;
  - tin vi phạm rõ tự giữ lại;
  - tin chọn sai danh mục được gợi ý danh mục đúng.
- Kiểm soát: trang AI Decisions để Admin xem, xác nhận hoặc đổi quyết định; thống kê độ tin cậy AI 30 ngày. Nông dân được kiểm tra trước ngay khi đang gõ (precheck).
- Công nghệ: Gemini structured output (verdict PASS / NEEDS_REVIEW / LIKELY_VIOLATION / UNAVAILABLE), model dự phòng; AI lỗi thì tin chờ Admin, không tự duyệt.

**MA2 ★ AI kiểm duyệt đánh giá**
- MarketLink: đánh giá chắc chắn vi phạm (thô tục, spam) thì tự ẩn; nghi ngờ thì chỉ gắn cờ. Có nhãn "Hidden by AI" và nút Restore.
- Giá trị: lời thô tục không nằm công khai chờ Admin, nhưng lời chê thật không bị ẩn nhầm.

**MA3 Cờ, ẩn và chặn sản phẩm**
- MarketLink:
  - hệ thống tự gắn cờ khi sản phẩm có ≥ 3 đánh giá 1–2 sao trong 30 ngày;
  - **Ẩn** = đang điều tra, vẫn giữ đơn;
  - **Chặn** = đã xác định vi phạm: từ chối các đơn liên quan, hoàn kho.
- Giá trị: phân biệt "đang nghi" và "đã chắc", không hủy đơn oan.

**MA4 ★ Xem trước tác động trước khi can thiệp**
- MarketLink: trước khi đình chỉ sạp, khóa khách, chặn sản phẩm hoặc đổi lịch chợ, Admin thấy số đơn và số người bị ảnh hưởng. Sau khi xác nhận, hệ thống tự xử lý đơn mở (từ chối / hủy, hoàn kho, báo từng người). Mọi thao tác bắt buộc nhập lý do.
- Giá trị: Admin biết hậu quả trước khi bấm; không để đơn treo.

**MA5 ★ Đóng chợ khẩn cấp và lịch đóng tạm**
- MarketLink: đóng chợ thì tự từ chối đơn mở, hoàn kho, tắt khung giờ. Mỗi khách nhận một thông báo gộp kèm email. Phải gõ chữ "confirm" mới đóng được. Mở lại chợ thì bật lại đúng các khung giờ đã tắt. Có lịch đóng tạm theo khoảng ngày (Lễ Tết, mưa bão).
- Giá trị: chợ ngập, cháy thì báo ngay mọi người có đơn; sạp vẫn bán ở chợ khác.

**MA6 Nhật ký an ninh và lịch sử thay đổi**
- MarketLink: ghi ai làm gì, lúc nào, từ IP nào; lịch sử từng trường của sạp, khách, sản phẩm, chợ đổi từ gì sang gì; ghi lại cả mỗi lần xuất báo cáo.
- Giá trị: truy vết khi có tranh chấp hoặc sự cố.

**MA7 Dashboard việc cần làm và xuất báo cáo**
- MarketLink: khối "Needs attention" (việc chờ hôm nay); biểu đồ đơn theo ngày; xuất Excel / CSV, có chặn chèn công thức độc vào Excel.
- Giá trị: Admin làm việc theo danh sách việc, mang báo cáo ra ngoài được.

### II.4 Chung cho cả hệ thống

**MC1 ★ Vòng đời đơn đầy đủ**
- Đề bài chỉ có 4 trạng thái của trường hợp suôn sẻ.
- MarketLink: 8 trạng thái, thêm Bị từ chối, Đã hủy, Không đến, Hết hạn, và mỗi trạng thái kết thúc đều kèm lý do. Mọi chuyển trạng thái đi qua một lõi xử lý duy nhất (FSM). Mỗi đơn có lịch sử ai đổi, lúc nào, vì sao. Đơn quá hạn tự hết hạn mà không cần chạy tác vụ nền. Nông dân chỉ bấm Ready được sau giờ chốt.
- Giá trị: không màn hình nào đổi trạng thái sai luật; tra cứu được khi tranh chấp.

**MC2 ★ Xử lý khách không đến lấy hàng (No-show)**
- MarketLink: nông dân đánh dấu No-show, hàng trả về kho. Khách không đến 3 lần trong 30 ngày thì tự bị khóa. Admin thấy nhãn "tự khóa" kèm các đơn đã bỏ; mở khóa thì bộ đếm tính lại từ đầu.
- Giá trị: đặt mà không đến là thiệt hại trực tiếp cho nông dân ở mô hình trả tiền khi nhận.

**MC3 ★ Trợ lý AI cho cả 4 vai trò**
- Đề bài chỉ gợi ý chatbot cho khách.
- MarketLink: chatbot cho khách vãng lai, khách, nông dân, Admin.
  - **Đúng quyền:** 7 công cụ chỉ đọc (function calling), AI chỉ thấy dữ liệu của chính người hỏi.
  - **An toàn và chi phí:** chống prompt injection; giới hạn lượt hỏi; model dự phòng khi hết quota.
  - **Tiện dùng:** trả lời theo ngôn ngữ người hỏi; tìm được tiếng Việt không dấu.
  - **Không phụ thuộc:** mất AI thì web vẫn chạy bình thường.
- Công nghệ: Gemini function calling, chạy ở luồng nền.

**MC4 ★ Thông báo realtime và email nền**
- Đề bài chỉ cần 2 sự kiện.
- MarketLink: 24 loại thông báo. Nông dân nhận đơn mới tức thì qua WebSocket; mất kết nối thì tự nối lại hoặc chuyển sang hỏi định kỳ. Email cho 7 sự kiện quan trọng, gửi ở luồng nền. Thông báo chỉ gửi sau khi thao tác đã lưu thành công.
- Công nghệ: Django Channels + Redis; vé WebSocket dùng một lần, sống 30 giây; `on_commit`.

**MC5 ★ An toàn khi nhiều người thao tác cùng lúc**
- MarketLink:
  - **Transaction:** mọi nghiệp vụ ghi nhiều bảng chạy trong transaction, hỏng giữa chừng thì hoàn tác hết.
  - **Khóa dòng:** khóa dòng khi trừ / trả kho.
  - **Khóa lạc quan (If-Match):** hai người sửa cùng một đơn thì người sau nhận 409, không đè dữ liệu.
  - **Deadlock:** tự chạy lại khi gặp deadlock.
- Giá trị: ngày chợ đông, kho không âm, đơn không bị ghi đè.

**MC6 ★ Bảo mật phiên và tài khoản**
- MarketLink:
  - **Quản lý phiên:** mỗi thiết bị một phiên, thu hồi được từng thiết bị; refresh token bị dùng lại thì thu hồi phiên; đổi mật khẩu thì đăng xuất các máy khác.
  - **Chống dò mật khẩu:** giới hạn theo IP (5 lần / phút) và theo email (20 lần sai / giờ).
  - **Tách cổng Admin:** hai cổng đăng nhập, không lộ email nào là Admin.
  - **Tài khoản:** một SĐT chỉ một tài khoản; tài khoản bị khóa không đăng ký lại được.
  - **Ảnh upload:** kiểm tra định dạng và kích thước, mã hóa lại, xóa vị trí GPS trong ảnh.
- Giá trị: hạn chế thiệt hại khi lộ token hoặc mật khẩu; ảnh chụp ở nhà không lộ tọa độ nhà.

---

## Phần III — Đã bỏ khỏi danh sách mở rộng (là phần cơ bản hoặc hoàn thiện)

Những mục dưới đây vẫn có trong web, nhưng **không** trình bày như tính năng mở rộng. Lý do: chúng là chi tiết cần có để tính năng đề bài chạy đúng, hoặc là phần hoàn thiện giao diện. Mã cũ là mã trong bản danh sách đầy đủ trước.

| Nhóm | Mục (mã cũ) | Thuộc về |
| --- | --- | --- |
| Đặt hàng | Ngày nhận trong 7 ngày, ẩn ngày chợ đóng (MK8); khóa khung giờ đã qua giờ chốt (MK9); giá chụp trên đơn (MK10); giỏ tự làm mới giá / kho (MK12); giờ chốt lưu trên đơn (MC4) | K6 Đặt trước |
| Sau khi đặt | Đồng hồ đếm ngược (MK20); SĐT và nút gọi (MK21); vị trí sạp trên đơn (MK22); nút chỉ đường (MK23) | K7, K3 |
| Đặt lại, có hàng lại | Xem trước khi đặt lại (MK25); chỉ báo có hàng khi nông dân nhập thêm (MK26); nhập hàng báo khách yêu thích (MN27) | K9, K10 |
| Tài khoản khách | Mỗi thiết bị một giỏ (MK28); quay về đúng trang sau đăng nhập (MK29) | K13, K1 |
| Giao diện | Tab đáy (MK30); bộ lọc trên URL (MK31); Load more (MK32); rút gọn tên người đánh giá (MK33); banner (MK34); FAQ, Privacy, Sitemap, 403 / 404 (MK35–38); sáng / tối (MK39); skeleton, lỗi dưới ô nhập, bàn phím, lazy route, tự làm mới token, đăng nhập 2 cổng cùng lúc (MC36–41) | C4, C7 |
| Nông dân — đơn | Bắt buộc lý do từ chối (MN3); tab đơn có số đếm (MN10); cảnh báo đơn quá hạn (MN12) | N4 |
| Nông dân — chợ, lịch | Vị trí sạp trong chợ (MN17); khung giờ chỉ trong giờ chợ mở (MN19); chặn xóa khung giờ có đơn (MN20) | N1, N5 |
| Nông dân — sản phẩm | Sửa giá / kho không cần duyệt lại (MN24, nay nằm trong MA1); thao tác hàng loạt (MN25); áp mẫu tuần có xem trước (MN26); chặn rời trang khi chưa lưu (MN29) | N2, N3 |
| Nông dân — tài khoản | Sạp chờ duyệt vẫn chuẩn bị hồ sơ (MN30); băng trạng thái tài khoản (MN31); tự tra tọa độ, kéo ghim (MN32, MN33) | N1 |
| Admin | Badge việc chờ (MA2); tra tọa độ chợ (MA37); sửa hồ sơ sạp / khách (MA42); xem sạp trên bản đồ (MA43); trang xem đơn chỉ đọc (MA46); trang Limits (MA47); icon danh mục, kéo thả, chặn xóa danh mục đang dùng (MA54–56); thông báo theo đối tượng và thời hạn (MA57, MA58); lệnh dọn tài khoản (MA59) | A1–A7 |
| Kỹ thuật | Xóa mềm (MC25); Swagger (MC42); /api/health (MC43); deploy 24/7 (MC44, là yêu cầu phi chức năng của đề bài) | N2, C7 |

**Bảng đổi mã:** các mã cũ còn lại đã được gộp vào tính năng mới như sau.

- **Khách:**
  - MK1–2 → MK1
  - MK3–7 → MK2
  - MK13 → MK3
  - MK17–18 → MK4
  - MK14–16 → MK5
  - MK19 → MC1
  - MK24 → MN1
  - MK27 → MC6
  - MK11 → MN5
- **Nông dân:**
  - MN1–2 → MN1
  - MN4–5 → MK4
  - MN6 → MC2
  - MN7 → MC1
  - MN8–9 → MN2
  - MN11 → MC4
  - MN13–15, MN18 → MN3
  - MN16, MN21–22 → MN4
  - MN23 → MA1
  - MN28 → MC6
  - MN34–38 → MN6
  - MN39 → MC3
- **Admin:**
  - MA1, MA3, MA5–13 → MA1
  - MA4 → MN4
  - MA14–16 → MA2
  - MA17–22 → MA3
  - MA23–28, MA35–36 → MA4
  - MA29–34 → MA5
  - MA38–41, MA19 → MC2
  - MA44–45, MA53 → MA6
  - MA48–52 → MA7
- **Chung:**
  - MC1–3, MC5 → MC1
  - MC6–14 → MC3
  - MC15–20 → MC4
  - MC21–24 → MC5
  - MC26–35 → MC6
