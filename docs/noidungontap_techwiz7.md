# NỘI DUNG ÔN TẬP ĐỒ ÁN TECHWIZ 7 — MARKETLINK

> **Tài liệu học nội bộ của nhóm**, không phải tài liệu nộp. Mục tiêu: ai đọc xong cũng giải thích được đồ án làm gì, chạy thế nào, vì sao chọn cách đó.
> ERD, DFD, thiết kế CSDL đã có trong báo cáo đã nộp nên không lặp lại ở đây.
> **Phiên bản:** v0.3 — Phần 0, Phần 2, mục Khách hàng và Nông dân ở Phần 3 đã viết chi tiết; Guest, Admin, Phần 4 và Phần 7 đang có khung, sẽ bổ sung tiếp.

**Cách đọc:** 🟢 = yêu cầu có trong SRS · 🔵 = tính năng mở rộng (phần ăn điểm, luôn có mục *Vì sao*).

---

## MỤC LỤC

- [PHẦN 0 — Đọc nhanh trong 5 phút](#phần-0--đọc-nhanh-trong-5-phút)
- [PHẦN 1 — Đề bài yêu cầu gì](#phần-1--đề-bài-yêu-cầu-gì)
- [PHẦN 2 — Hệ thống chạy thế nào (theo từng module)](#phần-2--hệ-thống-chạy-thế-nào-theo-từng-module)
- [PHẦN 3 — Chức năng theo vai trò](#phần-3--chức-năng-theo-vai-trò)
- [PHẦN 4 — Các lõi nghiệp vụ xuyên suốt](#phần-4--các-lõi-nghiệp-vụ-xuyên-suốt)
- [PHẦN 5 — Tổng hợp tính năng mở rộng](#phần-5--tổng-hợp-tính-năng-mở-rộng)
- [PHẦN 6 — Bảo mật, kiểm thử, triển khai](#phần-6--bảo-mật-kiểm-thử-triển-khai)
- [PHẦN 7 — Chuẩn bị bảo vệ](#phần-7--chuẩn-bị-bảo-vệ)

---

## PHẦN 0 — ĐỌC NHANH TRONG 5 PHÚT

**MarketLink là gì?** Một website nối nông dân bán ở chợ truyền thống với người mua. Nông dân đăng hàng, giá, số lượng tuần này và khung giờ khách đến lấy. Khách tìm chợ gần, xem sạp trên bản đồ, đặt trước rồi đến sạp nhận hàng và trả tiền mặt. Admin duyệt nông dân, quản lý chợ, kiểm duyệt nội dung và xem báo cáo.

**Bốn vai trò:** Guest (chưa đăng nhập, chỉ xem) · Customer · Farmer · Admin (cổng đăng nhập riêng `/admin/login`).

**Công nghệ:** React 19 + Vite ở frontend; Django 5.2 + Django REST Framework ở backend; MySQL 8 lưu dữ liệu; Redis cho cache, phiên đăng nhập và realtime; Django Channels + Daphne cho WebSocket; OpenStreetMap + Leaflet cho bản đồ; Google Gemini cho chatbot và kiểm duyệt; Gmail SMTP gửi email. Deploy: Vercel (frontend), Render (backend), Aiven (MySQL), Upstash (Redis).

**Tài khoản demo** (mật khẩu chung `Pass@123`): `admin@marketlink.com` · `farmer_01` → `farmer_06@marketlink.com` (đã duyệt) · `farmer_07`, `farmer_08` (chờ duyệt) · `customer_01` → `customer_20@marketlink.com` (`customer_19`, `customer_20` có 3 lần không đến lấy hàng).

### Những điều ai trong nhóm cũng phải nói được

> Mỗi ý có con số và cách hệ thống xử lý cụ thể. Giám khảo hỏi chung chung thì trả lời bằng đúng các con số này.

**1. Đề bài không cho làm gì → mình xử lý ra sao**
- Không thanh toán online → khách **trả tiền mặt khi đến sạp lấy hàng**.
- Không giao hàng → **chỉ nhận tại chợ**, trong khung giờ nông dân đặt ra.
- Không xác minh giấy phép / chứng nhận → Admin chỉ **duyệt hồ sơ** để cho phép bán, không kiểm tra giấy tờ.

**2. Giỏ hàng nhiều sạp → mỗi sạp một đơn riêng**
- Giỏ gom hàng của nhiều sạp, **tối đa 5 sạp mỗi lần đặt**. Bấm đặt thì sinh ra **mỗi sạp một đơn độc lập**, vì mỗi sạp có kho, giờ chốt, khung giờ nhận và chợ khác nhau.
- Mỗi khách có tối đa **10 đơn đang chờ nông dân duyệt** (`PLACED`) cùng lúc, tính trên toàn hệ thống. Giỏ có 4 sạp mà khách đang có 8 đơn chờ → 8 + 4 = 12 > 10 → bị chặn, báo "đợi nông dân xác nhận bớt rồi đặt tiếp". Đơn đã được duyệt và đơn đã qua giờ nhận không tính vào con số này.
- Giá luôn lấy từ CSDL lúc đặt và được chụp lại trên đơn; sau này nông dân đổi giá thì đơn cũ không đổi.

**2b. Hết hàng xảy ra ở 2 thời điểm khác nhau — đừng nhầm**
- **Lúc khách bấm đặt (hệ thống tự kiểm tra):** một lần đặt là **all-or-nothing**. Nếu một món ở bất kỳ sạp nào không đủ hàng, đã ngừng bán, hay khung giờ đã qua giờ chốt → **không đơn nào được tạo**, trang checkout chỉ rõ món nào lỗi và còn bao nhiêu ("Only 3 KG left") để khách sửa giỏ rồi đặt lại. Vì sao: tránh tình trạng khách tưởng đã đặt đủ mà thật ra chỉ một nửa số đơn được tạo.
- **Sau khi đặt, nông dân phát hiện một món hết hàng thật** (đơn còn `PLACED`):
  1. Nông dân **gọi điện cho khách trước** (số điện thoại khách hiện trên đơn).
  2. Nông dân bấm **"Sold out" trên đúng món đó** → món bị bỏ khỏi đơn, tổng tiền tính lại, tồn kho món đó về 0, đơn **vẫn ở trạng thái chờ duyệt**.
  3. Khách nhận thông báo *"[Sạp] đã hết [món], món này đã được bỏ khỏi đơn #…; nông dân sẽ liên hệ với bạn về phần còn lại"*.
  4. **Khách quyết định:** đồng ý mua phần còn lại → nông dân bấm duyệt; không muốn mua nữa → khách tự bấm **Cancel** (trước giờ chốt), hoặc báo nông dân để nông dân **Decline** đơn.
  - Nếu đơn chỉ còn 1 món thì không bỏ món được → nông dân dùng **Decline** (bắt buộc ghi lý do, khách nhận thông báo kèm lý do).
  - Đơn **đã duyệt** mà mới phát hiện hết hàng → nông dân từ chối cả đơn và **bắt buộc khai báo món nào hết**: món hết thì tồn kho về 0, các món còn lại được cộng trả vào kho online.
  - Lưu ý: hiện tại khách **không có nút "Đồng ý / Không đồng ý"** riêng trên app; việc đồng ý diễn ra qua điện thoại, còn không đồng ý thì khách dùng nút Cancel có sẵn.

**3. Đơn có 8 trạng thái (đề bài chỉ nêu 4)**
- Đường chính: `PLACED` (đã đặt) → `ACCEPTED` (nông dân duyệt) → `READY_FOR_PICKUP` (đã soạn hàng) → `COMPLETED` (khách đã lấy).
- Nhóm thêm 4 trạng thái kết thúc cho tình huống thực tế: `DECLINED` (nông dân / hệ thống từ chối), `CANCELLED` (khách hủy hoặc khách bị khóa), `NO_SHOW` (khách không đến), `EXPIRED` (nông dân không duyệt kịp trước giờ nhận → tự hết hạn).

**4. Tồn kho: đặt chưa trừ, duyệt mới trừ**
- Lúc khách đặt: hệ thống chỉ **kiểm tra** còn đủ hàng không, chưa trừ.
- Lúc nông dân bấm duyệt: hệ thống mới **trừ kho**. Không đủ thì báo thiếu hàng, đơn vẫn chờ.
- Hủy / từ chối / khách không đến: chỉ **cộng trả kho** với đơn đã từng bị trừ.
- Vì sao: nếu trừ ngay lúc đặt, một người có thể đặt hết hàng rồi không đến, nông dân mất khách thật.

**5. Sửa / hủy đơn và giờ chốt (cut-off)**
- Mỗi sạp đặt giờ chốt **1–72 giờ** trước khung nhận. Thời điểm chốt được tính và lưu cứng trên từng đơn.
- Trước giờ chốt: đơn `PLACED` sửa là áp dụng ngay; đơn đã `ACCEPTED` thì sửa thành **yêu cầu thay đổi**, nông dân chọn chấp nhận / từ chối / hủy cả đơn. Mỗi đơn chỉ một yêu cầu chờ, tới giờ nhận mà chưa xử lý thì yêu cầu tự hủy.
- Sau giờ chốt: khách không sửa / hủy được nữa; nông dân mới được bấm "Ready".
- Đặt trước được tối đa **7 ngày**.

**6. Người mua spam đơn / đặt ảo thì sao**
- Phải **đăng nhập tài khoản khách** mới đặt được; tài khoản nông dân không đặt được.
- **Một số điện thoại chỉ một tài khoản** (số được chuẩn hóa trước khi so); đăng ký giới hạn **10 lần / giờ**.
- Mỗi khách tối đa **10 đơn đang chờ duyệt** (`PLACED`) cùng lúc trên toàn hệ thống; đơn đã được duyệt và đơn đã qua giờ nhận không tính. Không giới hạn số đơn với cùng một sạp.
- Gửi đơn giới hạn **10 lần / giờ**; bấm 2 lần không ra 2 đơn (Idempotency-Key).
- Vì đặt chưa trừ kho nên đơn ảo **không giữ được hàng** của người khác.

**7. Khách không đến lấy hàng (no-show) → bao nhiêu lần thì bị khóa**
- Hết khung giờ nhận mà khách không đến, nông dân bấm **No-show** → hàng được cộng trả về kho online.
- Chỉ tính lỗi khi đơn đã ở trạng thái **Ready** (nông dân đã soạn hàng). Đơn hết hạn (`EXPIRED`) **không tính** vì lỗi không phải của khách.
- Đạt **3 lần no-show trong 30 ngày** → Admin thấy cờ **"At risk"** và hệ thống **tự khóa tài khoản**: hủy mọi đơn đang mở, báo khách lý do kèm số các đơn đã bỏ, ghi nhật ký. Admin mở khóa thì bộ đếm tính lại từ đầu.
- Admin cũng tự khóa tay được, **bắt buộc nhập lý do**. Tài khoản khóa không bị xóa nên email / SĐT đó không đăng ký lại được. Đăng nhập đúng mật khẩu nhưng bị khóa → thấy thông báo kèm lý do.

**8. Nông dân bán ở nhiều chợ thì sao**
- Một sạp đăng ký được **nhiều chợ**; mỗi chợ phải được **Admin duyệt** và có **vị trí sạp trong chợ** riêng (ví dụ "Dãy B, sạp 12").
- **Khung giờ nhận đặt riêng cho từng chợ**, và chỉ đặt được vào ngày vừa là ngày chợ họp vừa là ngày nông dân bán, nằm trong giờ mở cửa của chợ.
- Nông dân **chọn sản phẩm nào bán ở chợ nào**; khách đặt món không bán ở chợ đã chọn thì bị báo lỗi.
- **Tồn kho là "kho online"**: là số lượng nông dân **dự kiến dành ra để bán đặt trước qua web** trong tuần, **không phải** toàn bộ hàng thật nông dân có. Hàng nông dân bán trực tiếp cho khách vãng lai ngoài chợ không đi qua hệ thống. Ví dụ nông dân có 100 kg cải, nhập "Stock = 30" → web chỉ cho đặt tối đa 30 kg, 70 kg còn lại nông dân bán tại sạp như bình thường. Khi hủy / từ chối / khách không đến, hàng được "cộng trả về kho online" để người khác đặt tiếp.
- Kho online này **dùng chung cho mọi chợ** của sạp (form sản phẩm ghi rõ: *"Stock is shared across them"*): sạp nhập 30 kg cải, bán ở 2 chợ thì tổng đặt ở cả 2 chợ không vượt 30 kg. Vì sao: nông dân chỉ có một nguồn hàng, chia kho theo từng chợ thì nhập liệu rất mệt và dễ sai.
- **Một đơn chỉ thuộc một chợ** (và một khung giờ). Tình huống: khách bỏ vào giỏ 2 món của **cùng một sạp**, món A chỉ bán ở chợ Bình Điền, món B chỉ bán ở chợ Bà Chiểu:
  - **Giỏ hàng** hiện theo **sạp**: cả 2 món nằm chung một nhóm dưới tên sạp đó (giỏ không chia theo chợ).
  - **Trang checkout** chỉ đưa ra những chợ / khung giờ mà **mọi món trong nhóm đều bán**. Không có chợ chung nào → hiện thông báo *"No pickup window fits all of these items… Some may only be sold at other markets: remove an item, or order it separately"* và không cho đặt nhóm đó.
  - Khách phải **bỏ bớt một món, đặt món còn lại, rồi đặt món kia ở lần sau** → tạo ra **2 đơn**, mỗi đơn một chợ.
  - Nếu 2 món cùng bán ở ít nhất một chợ chung → chọn chợ đó → **1 đơn**.
- Chợ A đóng thì chỉ đơn ở chợ A bị ảnh hưởng, sạp vẫn bán bình thường ở chợ B.

**9. Chợ đóng cửa thì hệ thống làm gì (3 trường hợp)**
- **Đóng tạm theo ngày** (lễ, Tết, thời tiết): Admin khai báo khoảng ngày → những ngày đó khách không chọn làm ngày nhận được, khung giờ tự hoạt động lại sau kỳ nghỉ. Nếu còn đơn mở rơi vào khoảng đó thì **chặn**, không cho tạo. (Nông dân nghỉ bán cũng khai báo y như vậy.)
- **Đóng hẳn / khẩn cấp** (ngập, cháy, giải tỏa): Admin nhập lý do và **gõ chữ `Confirm`** để xác nhận. Trong một transaction: chợ ngừng hoạt động, **mọi đơn mở tại chợ bị từ chối** và hoàn kho, mọi khung giờ của chợ bị tắt. Mỗi khách bị ảnh hưởng nhận **một** thông báo gộp (in-app + email), mỗi sạp ở chợ cũng được báo. **Không đình chỉ nông dân** vì họ còn chợ khác. Mở lại chợ thì nông dân tự bật lại khung giờ.
- **Đổi lịch / giờ mở cửa**: trước khi lưu, Admin thấy bao nhiêu khung giờ sẽ tắt, bao nhiêu đơn không còn khớp, bao nhiêu khách / sạp bị ảnh hưởng. Xác nhận thì khung giờ ngoài lịch mới tự tắt, đơn bị lệch được đánh dấu cần dời giờ; tới giờ cũ mà chưa dời thì đơn bị hủy và khách được báo.

**10. Admin can thiệp thì đơn hàng ra sao**
- Admin **không sửa / hủy từng đơn**; chỉ có các thao tác lớn, hệ thống tự đóng đơn liên quan và hoàn kho:
  - **Đình chỉ nông dân** → sạp ẩn khỏi web, mọi đơn mở → `DECLINED`.
  - **Khóa khách** → mọi đơn mở của khách → `CANCELLED`, đóng kết nối realtime trên mọi thiết bị.
  - **Chặn sản phẩm** (vi phạm) → tin ẩn, mọi đơn mở có món đó → `DECLINED`. Khác với **Ẩn** (đang điều tra) → tin ẩn nhưng đơn cũ giữ nguyên.
  - **Đóng chợ** → như mục 9.
- Mọi thao tác đều có **màn hình xem trước tác động** (bao nhiêu đơn, bao nhiêu người) trước khi xác nhận, và được ghi vào nhật ký an ninh.

**11. Duyệt trước khi lên sàn (2 tầng)**
- Nông dân mới đăng ký ở trạng thái **chờ duyệt**: đăng nhập được, hoàn thiện hồ sơ được, nhưng **chưa bán được** cho tới khi Admin duyệt.
- **Tin đăng sản phẩm cũng phải được duyệt** mới hiện cho khách. Sửa tên / mô tả / ảnh / danh mục → quay lại chờ duyệt; sửa giá và số lượng thì **không** (để nông dân cập nhật kho không phải chờ).

**12. Gemini làm được gì trong app (4 việc)**
- **Chatbot cho mọi vai trò:** trả lời giờ chợ, ai bán món gì hôm nào, khung giờ nhận, đơn của tôi tới đâu (khách), sạp tôi có gì cần xử lý (nông dân), hệ thống đang chờ gì (Admin). AI chỉ được gọi **7 hàm chỉ đọc** do nhóm viết theo đúng quyền của người hỏi; không viết SQL, không đặt / sửa / hủy gì, không thấy dữ liệu người khác. Trả lời theo ngôn ngữ người hỏi, tìm được tiếng Việt không dấu. Giới hạn **20 câu / phút**, **30 câu / ngày** cho khách vãng lai (đếm theo IP), **100 câu / ngày** cho người đã đăng nhập (đếm theo tài khoản), reset lúc nửa đêm. **Khi hết lượt**, khung chat hiện đúng câu (tiếng Việt nếu người dùng gõ tiếng Việt, ngược lại tiếng Anh): *"Trợ lý đang bận, bạn vui lòng thử lại sau nhé. Trong lúc chờ, bạn vẫn có thể xem Nông sản, Chợ và đơn hàng như bình thường."* Hệ thống **cố ý không nói là "hết lượt"**: hết lượt, AI hết quota hay AI bị lỗi đều hiện cùng một câu, để người ngoài không dò được giới hạn. Chỉ những câu AI trả lời thành công mới bị đếm.
- **Duyệt tin đăng sản phẩm:** đọc **chữ và ảnh** để xem có phải nông sản không, đúng danh mục không, có ngôn từ xấu hoặc để lại liên hệ giao dịch ngoài không, ảnh có khớp không. Tin sạch → **tự duyệt lên sàn**; nghi vi phạm → **giữ lại** và báo Admin; không chắc → chờ Admin. Mọi quyết định của AI liệt kê ở trang **AI Decisions** để Admin xác nhận hoặc hoàn tác.
- **Duyệt nội dung đánh giá:** sau khi khách gửi đánh giá, Gemini đọc **nghĩa** của câu ở luồng nền (không dùng danh sách từ khóa) và trả lời 3 điều: có ngôn từ xúc phạm không, có để lại liên hệ giao dịch ngoài không, và **có chắc chắn không**.
  - **Chắc chắn vi phạm** (chửi bậy rõ ràng, ghi số điện thoại / link / Zalo để mua bán ngoài) → đánh giá **bị ẩn ngay**, lý do ghi "Auto-hidden by AI: …", ghi nhật ký an ninh, gắn cờ cho Admin. Trang kiểm duyệt hiện nhãn **"Hidden by AI"**. AI ẩn nhầm thì Admin bấm **Restore**.
  - **Nghi ngờ** (câu mơ hồ, mỉa mai, chữ viết lách không rõ) → **vẫn hiện**, chỉ gắn cờ cho Admin xem.
  - **Chê thật lòng** ("rau héo, giao thiếu") → không ẩn, không gắn cờ.
  - **Câu trả lời của sạp** vi phạm → chỉ gắn cờ (câu trả lời nằm chung dòng với đánh giá của khách, ẩn dòng thì mất luôn lời của khách).
- **Quét ảnh sản phẩm hàng tuần:** kiểm tra lại ảnh các tin đang bán (phòng nông dân đổi ảnh sau khi được duyệt), chỉ gắn cờ và báo Admin.
- **AI không làm:** không đánh giá giá cả và số lượng (việc này do **luật cố định** kiểm tra, vì AI không biết giá chợ hôm nay); không ẩn tin, không khóa tài khoản — những việc đó luôn do Admin.
- **Khi không gọi được Gemini** (server chưa cấu hình `GEMINI_API_KEY`, hết quota miễn phí trong ngày, hoặc Google lỗi) — các tình huống cụ thể:
  - *Nông dân đăng "Rau muống, $1/bó", ảnh bình thường:* lớp luật không thấy gì sai, nhưng AI không trả lời được → kết quả là **"AI check unavailable"**. Tin **không được tự duyệt**, nằm ở hàng chờ `/admin/approvals` để **Admin duyệt tay** như khi chưa có AI. Hệ thống tự thử gọi AI lại sau 10 phút (lệnh `ai_review_pending`).
  - *Nông dân đăng "Rau muống, $500/bó":* **lớp luật vẫn chạy** (không cần AI), thấy giá vượt xa khung giá của danh mục → **"Likely violation"** → tin bị **giữ lại** và gắn cờ cho Admin. Tức là các lỗi về giá / số lượng vẫn bắt được khi không có AI.
  - *Khách viết đánh giá có từ chửi bậy:* **không được AI kiểm tra** (chỉ AI mới đọc được nghĩa của chữ) → không có cờ tự động, Admin phải tự phát hiện. Riêng luật "≥ 3 đánh giá 1–2 sao trong 30 ngày" vẫn tự gắn cờ cho sản phẩm.
  - *Khách hỏi chatbot:* nhận câu *"Trợ lý đang bận, bạn vui lòng thử lại sau nhé…"*; mọi chức năng khác của web chạy bình thường.
  - Tóm lại: **mất AI không làm hỏng web**, chỉ là Admin phải làm tay nhiều hơn.

**13. Thông báo đi hai kênh**
- **In-app realtime** qua WebSocket: chuông có số chưa đọc + toast bật lên ngay. Mất kết nối thì tự nối lại, trong lúc đó chuyển sang hỏi định kỳ.
- **Email** cho các sự kiện quan trọng: đơn được duyệt, sẵn sàng lấy, bị từ chối, hết hạn, khách hủy, đơn bị hủy do khách bị khóa, chợ đóng cửa.
- Đề bài chỉ yêu cầu một kênh cho 2 sự kiện; đồ án có hơn 25 loại sự kiện.

**14. Bản đồ**
- **OpenStreetMap + Leaflet** cho bản đồ trong app (miễn phí, không cần API key, vẫn lưu đủ kinh độ / vĩ độ như đề bài yêu cầu).
- Nút **"Near me"** dùng GPS trình duyệt để sắp chợ gần nhất trước.
- Nông dân **không phải nhập tọa độ**: hệ thống tự tra từ địa chỉ (Nominatim), nông dân có thể kéo ghim chỉnh lại.
- **Tìm đường bằng Google Maps:** ở trang chợ, trang sạp, chi tiết đơn và trang checkout có nút **"Directions"**. Người mua bấm vào → mở **tab mới sang Google Maps** với điểm đến là tọa độ chợ (`https://www.google.com/maps/dir/?api=1&destination=<vĩ độ>,<kinh độ>`), Google Maps tự lấy vị trí hiện tại của người mua làm điểm xuất phát và vẽ đường đi. Vì sao không tự vẽ đường trong app: Google Maps chỉ đường tốt nhất, người dùng quen, có cả xe máy / đi bộ / kẹt xe, và **không cần API key** vì chỉ là một đường link.
- Trang **Contact Us** nhúng bản đồ Google Maps (iframe) vị trí văn phòng.

**15. Dùng chung tài khoản gia đình**
- Nhiều người đăng nhập cùng tài khoản trên nhiều thiết bị; **mỗi thiết bị một phiên và một giỏ hàng riêng**, dùng chung lịch sử đơn và yêu thích. Đăng xuất máy này không văng máy khác. Không phải xây module quản lý thành viên.

---

## PHẦN 1 — ĐỀ BÀI YÊU CẦU GÌ

### 1.1 Bối cảnh

Khách đi chợ nông sản không biết trước nông dân nào bán hôm nào, còn bao nhiêu hàng, giá bao nhiêu. Thông tin chỉ có trên bảng phấn, tờ rơi, truyền miệng, nên khách đến nơi thì hết hàng hoặc nông dân nghỉ. Nông dân thì không có công cụ công khai hàng tồn theo tuần, nhận đơn trước ngày họp chợ, hay giữ khách quen. Đề bài muốn một web full-stack nối hai bên, có dashboard riêng cho từng vai trò, có bản đồ, chatbot AI là tùy chọn.

### 1.2 Phạm vi loại trừ (tuyệt đối không làm)

1. Cổng thanh toán online → đồ án: trả tiền mặt tại sạp.
2. Giao hàng → đồ án: chỉ nhận tại chợ. Mục "Track Deliveries" trong sơ đồ đề bài được hiểu là theo dõi trạng thái đơn.
3. Xác minh pháp lý nông dân → đồ án: không kiểm tra giấy phép; Admin chỉ duyệt hồ sơ để cho phép bán.

### 1.3 Danh sách yêu cầu chức năng → màn hình trong đồ án

**Khách hàng**

| # | Yêu cầu SRS | Màn hình |
| :---: | :--- | :--- |
| 1 | Đăng ký (họ tên, SĐT, email, địa chỉ), đăng nhập, dashboard; lưu nhiều sạp / sản phẩm yêu thích; dùng chung tài khoản gia đình (tùy chọn) | `/register`, `/login`, `/customer`, `/customer/favorites` |
| 2 | Xem chợ gần theo vị trí và ngày họp, nông dân ở từng chợ; hồ sơ nông dân; bản đồ có marker + chỉ đường | `/markets`, `/markets/:id`, `/farmers/:id` |
| 3 | Danh mục sản phẩm; lọc theo giá, danh mục, chợ, ngày; chi tiết (giá, đơn vị, còn bao nhiêu, người bán) | `/products`, `/products/:id` |
| 4 | Giỏ hàng, đặt trước theo tồn kho; chọn ngày + khung giờ; theo dõi Placed → Accepted → Ready → Completed; sửa / hủy trước cut-off; trả tiền khi nhận | `/customer/cart`, `/customer/checkout`, `/customer/orders/:id` |
| 5 | Xem, sửa, hủy đơn | `/customer/orders`, `/customer/orders/:id/edit` |
| 6 | Lịch sử đơn + đặt lại nhanh; yêu thích + báo có hàng lại; lưu chợ ưa thích + chỉ đường | `/customer/orders`, `/customer/favorites` |
| 7 | Trợ lý AI (tùy chọn): tìm hàng, trả lời giờ chợ, nông dân có bán không, giờ nhận, chi tiết hàng | Widget chat nổi |
| 8 | Chấm sao + nhận xét sạp và sản phẩm sau khi nhận hàng; xem đánh giá của người khác | `/customer/orders/:id/review`, trang sản phẩm / sạp |

**Nông dân**

| # | Yêu cầu SRS | Màn hình |
| :---: | :--- | :--- |
| 1 | Đăng ký (tên sạp, người liên hệ, SĐT, email, địa chỉ); cập nhật chợ tham gia, ngày bán, khung giờ, vị trí trên bản đồ | `/register/farmer`, `/farmer/profile`, `/farmer/markets` |
| 2 | CRUD sản phẩm; mẫu tồn kho lặp lại hàng tuần; đánh dấu Sold out / Temporarily unavailable | `/farmer/products`, `/farmer/stock-template` |
| 3 | Xem đơn đến realtime; Accept / Decline; Ready for pickup; đặt giờ chốt và quản lý khung giờ nhận | `/farmer/orders`, `/farmer/markets` |
| 4 | Lịch sử bán, sản phẩm bán chạy, tổng đơn, đơn chờ, doanh thu | `/farmer`, `/farmer/stats` |
| 5 | Trả lời đánh giá công khai | `/farmer/reviews` |

**Admin**

| # | Yêu cầu SRS | Màn hình |
| :---: | :--- | :--- |
| 1 | Trang quản trị đăng nhập riêng; thống kê tổng nông dân, khách, chợ, đơn | `/admin/login`, `/admin` |
| 2 | Duyệt / đình chỉ nông dân (chưa duyệt không được bán); kích hoạt / khóa khách | `/admin/farmers`, `/admin/approvals`, `/admin/customers` |
| 3 | Thêm / sửa / xóa chợ: tên, địa chỉ, ngày họp, giờ mở / đóng, tọa độ | `/admin/markets` |
| 4 | Gỡ tin sản phẩm sai, bình luận thô tục | `/admin/moderation` |
| 5 | Báo cáo: khối lượng đơn, doanh thu theo chợ, nông dân năng nổ nhất | `/admin/reports` |
| 6 | Quản lý danh mục gốc; gửi thông báo toàn sàn | `/admin/categories`, `/admin/announcements` |

**Tính năng chung:** phân quyền theo vai trò (RBAC) · tìm kiếm / sắp xếp / lọc nhiều tiêu chí, hiển thị trên bản đồ · responsive · thông báo email hoặc in-app khi đơn được duyệt và khi sẵn sàng · trang About Us · trang Contact Us có bản đồ nhúng.

### 1.4 Yêu cầu phi chức năng (tóm tắt)

An toàn (không mã độc, không tự tải file) · Dễ tiếp cận (font rõ, tương phản tốt) · Dễ dùng cho cả người lớn tuổi · Ổn định · Tải nhanh kể cả danh mục lớn · Chịu tải ngày cao điểm · Bảo mật (mã hóa mật khẩu, bảo vệ dữ liệu cá nhân) · Chạy 24/7 · Tương thích Chrome, Safari, Edge, Firefox. Cách đồ án đáp ứng: xem Phần 6.

### 1.5 Quy định dùng AI

SRS cho phép dùng AI hỗ trợ thiết kế và lập trình, nhưng cấm template giao diện làm sẵn, cấm nộp code AI sinh ra mà không hiểu, và bắt buộc khai báo công cụ AI đã dùng. Thí sinh phải giải thích được mọi quyết định thiết kế. Lưu ý mâu thuẫn với bảng chấm điểm ở Phần 7.

---

## PHẦN 2 — HỆ THỐNG CHẠY THẾ NÀO (THEO TỪNG MODULE)

### 2.1 Bức tranh chung

MarketLink tách làm hai chương trình chạy riêng. **Frontend** là một ứng dụng React (thư mục `frontend/`). Khi mở web, trình duyệt tải về một trang duy nhất rồi tự đổi màn hình bằng JavaScript, không tải lại trang. **Backend** là một server Django (thư mục `backend/`): nó không trả về giao diện mà chỉ trả dữ liệu dạng JSON qua các địa chỉ bắt đầu bằng `/api/`. Hai bên chỉ nói chuyện với nhau qua HTTP (gửi yêu cầu, nhận JSON), riêng thông báo thời gian thực thì đi qua một kết nối WebSocket luôn mở ở địa chỉ `/ws/`.

*Vì sao tách đôi như vậy:* giao diện và nghiệp vụ độc lập nhau, hai người có thể làm song song; backend chỉ cần làm đúng "hợp đồng API"; sau này muốn làm app điện thoại thì dùng lại nguyên backend. Đây cũng là đúng mô hình nhiều tầng (client – web server – application server – database) mà đề bài yêu cầu.

Ở máy cá nhân, frontend chạy bằng Vite ở cổng 5173. File `frontend/vite.config.js` cấu hình để mọi request `/api`, `/media`, `/ws` được chuyển tiếp sang Django ở cổng 8000, nên trình duyệt tưởng như chỉ nói chuyện với một server (không vướng lỗi CORS khi dev). Khi deploy, frontend nằm trên Vercel, file `frontend/vercel.json` làm hai việc: chuyển `/media/...` (ảnh) sang server Render, và trả `index.html` cho mọi đường dẫn khác để bấm F5 ở trang con không bị lỗi 404.

Phía backend, file `backend/marketlink_core/asgi.py` là cửa vào duy nhất: request HTTP thường thì giao cho Django xử lý; request WebSocket thì giao cho Django Channels. Server được chạy bằng **Daphne** (server ASGI) chứ không phải Gunicorn, vì Gunicorn không giữ được kết nối WebSocket.

### 2.2 Hành trình của một request thông thường (ví dụ: khách xem danh sách sản phẩm)

Đi qua từng file theo đúng thứ tự dữ liệu chạy:

1. **Trang giao diện** `frontend/src/pages/guest/ProductsPage.jsx` cần dữ liệu, nó không gọi API trực tiếp mà gọi một **hook** trong `frontend/src/hooks/queries/guest/usePublicCatalog.js`.
   *Vì sao:* tách phần "lấy dữ liệu" khỏi phần "vẽ giao diện", nhiều trang dùng chung được một hook.
2. Hook dùng **TanStack Query**: nó kiểm tra bộ nhớ đệm, nếu dữ liệu còn mới thì trả ngay, nếu chưa có thì gọi hàm trong `frontend/src/api/guest/catalogApi.js`. Cấu hình chung nằm ở `frontend/src/lib/queryClient.js` (lỗi 4xx thì không tự thử lại, lỗi mạng thì thử lại tối đa 2 lần, tự hiện thông báo lỗi).
   *Vì sao TanStack Query:* đỡ phải tự viết trạng thái loading / error / cache; quay lại trang cũ không phải tải lại; quay lại tab trình duyệt thì tự làm mới.
3. File `catalogApi.js` gọi **`frontend/src/lib/axiosClient.js`** — đây là "cổng ra" duy nhất của mọi request. Trước khi gửi, nó tự gắn:
   - `Authorization: Bearer <access token>` lấy từ `stores/auth.store.js`;
   - `If-Match: "<version>"` khi sửa / hủy đơn (chống hai người sửa đè nhau);
   - `Idempotency-Key: <uuid>` khi đặt hàng (chống tạo đơn trùng khi bấm 2 lần).
   *Vì sao gom về một file:* mọi quy tắc chung (token, xử lý lỗi, làm mới token) chỉ viết một lần, không trang nào quên.
4. Request tới backend, **`backend/marketlink_core/urls.py`** chia theo tiền tố cho từng app: `/api/public/...`, `/api/customer/...`, `/api/farmer/...`, `/api/admin/...`, `/api/auth/...`, `/api/chat/...`. Middleware `marketlink_core/middleware.py` gắn cho request một mã `X-Request-ID` để lần dấu trong log.
5. **View** (ví dụ `backend/catalog/public_portal/views_public.py`) nhận request. View chỉ làm 3 việc: kiểm tra quyền (các lớp trong `marketlink_core/permissions.py`: `IsCustomer`, `IsFarmer`, `IsAdmin`…), đọc tham số, gọi tầng dưới.
6. **Serializer** kiểm tra dữ liệu đầu vào (kiểu, độ dài, bắt buộc) và định dạng dữ liệu trả ra.
7. **Service** (ví dụ `orders/services/checkout_service.py`) chứa luật nghiệp vụ và mở transaction khi cần ghi. **Selector** (ví dụ `catalog/selectors.py`) chứa các câu truy vấn đọc, có lọc "chỉ hàng đang bán công khai".
   *Vì sao chia View / Serializer / Service / Selector:* luật nghiệp vụ nằm một chỗ, dễ test, nhiều view dùng chung (chatbot cũng gọi lại các selector này).
8. **Model** (ví dụ `catalog/models.py`) dùng Django ORM để đọc / ghi **MySQL**. ORM luôn dùng tham số hóa nên không bị SQL injection.
9. Kết quả đi ngược lên, được bọc trong một **khung phản hồi chung** do `marketlink_core/responses.py` tạo: `success`, `code`, `message`, `data`, `errors`, `request_id`. Lỗi cũng theo đúng khung này, với mã lỗi cố định (ví dụ `INSUFFICIENT_STOCK`, `CUTOFF_PASSED`).
   *Vì sao:* frontend chỉ cần một cách đọc cho mọi API; lỗi theo từng ô nhập (`errors`) hiện được ngay dưới ô.
10. Về tới **`axiosClient.js`**: nó bóc lớp vỏ, trả `data` cho hook; nếu lỗi thì đổi thành đối tượng `ApiError` (`lib/ApiError.js`) để giao diện hiện câu thông báo thân thiện (`utils/errorMap.js`). Hook lưu vào cache, trang vẽ ra danh sách.

### 2.3 Module Xác thực & phiên đăng nhập

**Frontend:**
- Form đăng nhập `pages/auth/LoginForm.jsx` → hook `hooks/authentication/useAuth.js` → `api/common/authApi.js` gọi `POST /api/auth/login/` (Admin gọi `POST /api/auth/admin/login/`).
- Backend trả về cặp token **access** (sống 15 phút) và **refresh** (sống 7 ngày). Hai token được lưu trong `stores/auth.store.js` (Zustand, ghi xuống `localStorage`).
- Có **hai kho phiên riêng**: một cho cổng chợ (khách + nông dân), một cho cổng Admin. Đường dẫn bắt đầu bằng `/admin` thì dùng phiên Admin. *Vì sao:* đăng nhập Admin và tài khoản khách cùng lúc trên một trình duyệt mà không đá nhau, tiện khi demo.
- Hết hạn access token: `axiosClient.js` nhận lỗi 401, tự gọi `POST /api/auth/refresh/` lấy token mới rồi gửi lại request cũ, người dùng không bị đăng xuất. Nhiều request cùng hết hạn một lúc thì chỉ làm mới **một lần**.
- Chặn trang theo vai trò: `router/guards.jsx` (`RequireAuth`, `RequireRole`, `GuestOnly`, `NotForFarmers`). Sai vai trò → chuyển tới trang 403.

**Backend:**
- `accounts/auth/views_common.py` (`LoginView`, `AdminLoginView`, `RefreshView`, `LogoutView`, `MeView`, `ChangePasswordView`) → `accounts/services/auth_service.py`.
- Mỗi lần đăng nhập tạo một **phiên riêng (`sid`) gắn vào token**. `accounts/auth/authentication.py` kiểm tra mỗi request: phiên đã bị thu hồi chưa (danh sách thu hồi lưu ở Redis, file `accounts/auth/sessions.py`), mật khẩu đã đổi chưa (token mang "phiên bản mật khẩu", đổi mật khẩu thì các token cũ vô hiệu).
  *Vì sao:* đăng xuất ở điện thoại không làm văng máy tính → đó chính là cách đồ án đáp ứng "dùng chung tài khoản gia đình" mà không phải xây module riêng.
- Cổng chợ từ chối tài khoản Admin và ngược lại, đều trả `401 INVALID_CREDENTIALS` như sai mật khẩu → người ngoài không dò được email nào là Admin.
- Giới hạn tần suất: `login 5/phút` theo IP, cộng thêm `20 lần sai/giờ theo email` trên mọi IP (`accounts/auth/throttles.py`, chỉ đếm lần sai).
- Mỗi lần đăng nhập / đăng nhập sai / đăng xuất / đổi mật khẩu ghi vào nhật ký `audit_logs`.

> ⚠️ README đang ghi "HttpOnly Cookie"; code thực tế lưu token ở `localStorage` và gửi qua header Bearer. Xem Phần 7.

### 2.4 Module Chợ, Sạp, Sản phẩm công khai

- **Frontend:** `pages/guest/MarketsPage.jsx`, `MarketDetailPage.jsx`, `FarmersPage.jsx`, `FarmerDetailPage.jsx`, `ProductsPage.jsx`, `ProductDetailPage.jsx` → hook `hooks/queries/guest/usePublicCatalog.js` → `api/guest/catalogApi.js`.
- **Backend:**
  - Chợ: `markets/public_portal/views_public.py` nhận `q`, `day`, `lat`, `lng`, `ordering=distance` → `markets/selectors.py`.
  - Sạp: `accounts/public_portal/views_public.py` → `accounts/selectors.py`.
  - Sản phẩm: `catalog/public_portal/views_public.py` nhận `q` (tên hàng hoặc tên sạp), `category`, `market_id`, `day`, `price_min`, `price_max`, `in_stock`, `ordering` → `catalog/selectors.py`.
- **Điểm quan trọng:** mọi truy vấn công khai đi qua một bộ lọc chung "đang bán" (`ON_SALE_FILTER` trong `catalog/models.py`): còn bày bán, chưa lưu trữ, không bị Admin ẩn, **đã được duyệt**, và sạp đang ở trạng thái được duyệt.
  *Vì sao:* chỉ một chỗ định nghĩa "hàng nào khách được thấy", không màn hình nào lỡ để lộ hàng chưa duyệt.
- Bộ lọc trên frontend được giữ trên URL (`hooks/common/useUrlFilters.js`), gõ tìm kiếm có debounce. *Vì sao:* gửi link cho người khác là thấy đúng kết quả; không gọi API mỗi lần gõ một chữ.

### 2.5 Module Giỏ hàng & Đặt hàng

**Giỏ hàng nằm hoàn toàn ở trình duyệt:** `stores/cart.store.js` (Zustand, lưu `localStorage` với tên `marketlink-cart`). Nút "Add to cart" gọi `hooks/common/useAddToCart.js`: chưa đăng nhập thì chuyển tới trang đăng nhập; tài khoản nông dân thì từ chối; tự kẹp số lượng trong khoảng tối thiểu / tối đa của sản phẩm. Hàm `cartGroups()` gom các món theo từng sạp.
*Vì sao không lưu giỏ trên server:* giỏ là nháp, không cần CSDL; mỗi thiết bị một giỏ riêng, phù hợp với dùng chung tài khoản gia đình; giảm tải server.

**Giỏ được làm mới với dữ liệu thật** (`hooks/queries/customer/useCartRefresh.js`): giá, tồn kho, còn bán hay không được cập nhật lại từ server, món hết hàng bị đánh dấu không đặt được.

**Chọn ngày và khung giờ:** `pages/customer/CheckoutPage.jsx` gọi `services/customer/pickupApi.js` → `GET /api/public/farmers/:id/pickup-options/` → `orders/services/pickup_service.py`. Server chỉ trả những ngày trong 7 ngày tới thỏa mãn đồng thời: chợ họp hôm đó, nông dân bán hôm đó, không rơi vào lịch đóng cửa chợ hay lịch nghỉ của nông dân, và giờ chốt của khung đó chưa qua.
*Vì sao server tính:* luật lịch phức tạp, tính một chỗ thì giao diện và lúc đặt đơn luôn khớp nhau.

**Gửi đơn:** `hooks/queries/customer/useCheckout.js` → `services/customer/ordersApi.js` gọi `POST /api/customer/orders/` với danh sách nhóm (mỗi sạp: ngày, khung giờ, các món), có gắn `Idempotency-Key` → `orders/customer/views_customer.py` → `orders/services/checkout_service.py` (`place_orders`). Trong **một transaction**:
1. Khóa dòng khách hàng và các sạp liên quan (`select_for_update`) để hai lần đặt đồng thời không vượt giới hạn.
2. Kiểm tra khách không có quá 10 đơn đang chờ duyệt.
3. Kiểm tra từng khung giờ còn hợp lệ, chưa qua giờ chốt.
4. Kiểm tra từng món: đúng của sạp đó, đang bán, trong khoảng min / max, đủ hàng khả dụng (= tồn kho − phần đã giữ cho đơn đã duyệt), sản phẩm có bán tại chợ đã chọn.
5. Tạo mỗi sạp một đơn, ghi từng món kèm **ảnh chụp tên, đơn vị, đơn giá lúc đặt**, giá lấy từ CSDL chứ không tin giá trình duyệt gửi lên.
6. Ghi lịch sử trạng thái, báo nông dân "có đơn mới".

Một sạp lỗi thì **cả lần đặt bị hủy** (all-or-nothing). Nếu MySQL gặp deadlock, `marketlink_core/services/db_retry.py` tự thử lại một lần. Bấm nút 2 lần thì `orders/services/idempotency_service.py` nhận ra cùng `Idempotency-Key` và trả lại kết quả lần đầu, không tạo đơn thứ hai (kết quả lưu trong cache Redis 24 giờ).
*Vì sao làm kỹ như vậy:* ngày họp chợ nhiều người đặt cùng lúc; mạng điện thoại chập chờn hay khiến bấm 2 lần.

**Sau khi đặt:** `useCheckout` xóa giỏ, làm mới dashboard và chuyển tới trang `/customer/checkout/success`.

### 2.6 Module Thông báo & WebSocket (realtime)

Đi theo một thông báo từ lúc sinh ra tới lúc hiện trên màn hình:

1. **Phát thông báo:** khi có sự kiện (ví dụ nông dân duyệt đơn), service gọi hàm duy nhất `notify()` trong `backend/notifications/services.py`. Hàm này lấy tiêu đề / nội dung từ `notifications/messages.py` và ghi một dòng vào bảng `notifications`.
   *Vì sao một điểm phát duy nhất:* mọi thông báo cùng định dạng; muốn thêm kênh mới chỉ sửa một chỗ.
2. **Chờ transaction chốt:** việc đẩy realtime và gửi email đều đăng ký bằng `transaction.on_commit`. *Vì sao:* nếu thao tác bị lỗi và rollback thì không có thông báo "ma" nào bị gửi đi.
3. **Đẩy qua Redis:** sau khi chốt, `notify()` gửi tin vào **channel layer** — kênh trung gian chạy trên Redis — tới nhóm `user_<id>`.
   *Vì sao cần Redis ở giữa:* server có thể chạy nhiều tiến trình; tiến trình xử lý request duyệt đơn chưa chắc là tiến trình đang giữ kết nối WebSocket của khách. Redis làm "bưu điện" chung để mọi tiến trình chuyển tin cho nhau.
4. **Kết nối WebSocket:** khi đăng nhập, hook `frontend/src/hooks/common/useNotificationSocket.js` (thư viện `react-use-websocket`):
   - gọi `POST /api/auth/ws-ticket/` (`marketlink_core/views.py`) để xin một **vé dùng 1 lần**, sống 30 giây, lưu ở Redis (`marketlink_core/services/ws_ticket.py`);
   - mở kết nối tới `/ws/notifications/?ticket=...`.
   File `backend/notifications/consumers.py` nhận kết nối, đổi vé ra người dùng (đọc rồi xóa vé ngay bằng lệnh `GETDEL` của Redis, nên vé không dùng lại được), kiểm tra tài khoản còn hoạt động, rồi cho kết nối vào nhóm `user_<id>` và nhóm phiên `session_<sid>`.
   *Vì sao dùng vé thay vì gửi thẳng JWT:* đường dẫn WebSocket hay bị ghi vào log server / proxy; để token dài hạn trên URL là lộ. Vé chỉ sống 30 giây và dùng một lần nên lộ cũng vô hại.
5. **Hiện lên màn hình:** consumer gửi `NEW_NOTIFICATION` xuống trình duyệt. Hook hiện một toast có nút "View", đồng thời báo TanStack Query làm mới đúng những dữ liệu liên quan (ví dụ thông báo về đơn thì tải lại danh sách đơn) theo bảng ánh xạ trong `constants/notificationEvents.js`. Chuông thông báo `components/common/layout/NotificationBell.jsx` cập nhật số chưa đọc.
6. **Khi mất kết nối:** hook tự nối lại, thời gian chờ tăng dần tới tối đa 30 giây. Trong lúc mất kết nối, các truy vấn thông báo chuyển sang **hỏi định kỳ (polling)** (`hooks/queries/common/useNotifications.js`). *Vì sao:* WebSocket hỏng (mạng, proxy chặn) thì người dùng vẫn nhận được thông báo, chỉ chậm hơn.
7. **Đóng kết nối có chủ đích:** đăng xuất → đóng socket của đúng thiết bị đó (nhóm `session_<sid>`); Admin khóa khách → đóng socket trên mọi thiết bị (nhóm `user_<id>`), mã đóng `4401`, frontend thấy mã này thì không nối lại.
8. **Email:** nếu loại thông báo có mẫu email (`backend/templates/emails/`), `notify()` dựng nội dung HTML + text rồi gửi qua Gmail SMTP trong một luồng nền (`ThreadPoolExecutor`, 2 luồng). *Vì sao gửi nền:* gửi SMTP mất vài giây, không bắt người dùng chờ; lỗi email không làm hỏng thao tác chính.

Khi chạy máy cá nhân không bật Redis (`USE_REDIS=False`), channel layer chuyển sang bộ nhớ trong tiến trình — vẫn chạy được khi chỉ có một tiến trình.

### 2.7 Module Gemini (AI)

**Phần dùng chung — `backend/marketlink_core/gemini.py`:** cả chatbot lẫn kiểm duyệt đều gọi Gemini qua đây.
- `make_client()`: tạo client từ `GEMINI_API_KEY`; không có key thì báo "AI không khả dụng".
- `model_chain()`: danh sách model **chính + dự phòng** (mặc định `gemini-3.1-flash-lite`, dự phòng `gemini-3.5-flash-lite`, đổi được qua biến môi trường).
- `call_with_fallback()` + `classify_error()`: gọi model đầu tiên; hết quota trong ngày → chuyển model kế; bị giới hạn theo phút → chờ đúng số giây Gemini yêu cầu rồi thử lại; lỗi server → thử lại vài lần; quá hạn thời gian → dừng.
*Vì sao:* gói miễn phí của Gemini có quota riêng cho từng model; xoay vòng model giúp demo không chết giữa chừng. Viết một lần, hai tính năng dùng chung.
*Vì sao chọn dòng Flash / Flash-Lite:* nhanh, rẻ, có gói miễn phí, đủ cho câu hỏi ngắn và phân loại nội dung.

**Chatbot — luồng một câu hỏi:**
1. Widget `frontend/src/components/common/chat/AIChatWidget.jsx` (kéo đi được, nhớ vị trí nhờ `hooks/useDraggableDock.js`) → `hooks/queries/common/useAIChat.js` gửi **tối đa vài tin nhắn gần nhất** qua `api/common/chatApi.js` → `POST /api/chat/messages/`.
   *Vì sao gửi lại lịch sử mỗi lần:* server không lưu cuộc trò chuyện → không phải lưu dữ liệu cá nhân, server không có trạng thái.
2. `backend/chat_bot/views.py`: ai cũng gọi được (kể cả Guest); kiểm tra giới hạn `20/phút` và giới hạn theo ngày (`chat_bot/limits.py`: khách vãng lai 30 câu theo IP, người đăng nhập 100 câu, đếm trong Redis, reset lúc nửa đêm).
3. `backend/chat_bot/services.py` (`answer`) dựng **system prompt theo vai trò** từ `chat_bot/prompts.py` (luật trả lời, các sự thật về nền tảng, những điều cấm), gửi kèm **danh sách công cụ** mà vai trò đó được dùng.
4. Gemini đọc câu hỏi và quyết định cần gọi công cụ nào, ví dụ `search_products(query="dưa leo", ...)`. Server chạy hàm tương ứng trong `chat_bot/ai_chatbot.py`. Các hàm này gọi lại **chính các selector công khai** của web, kết quả bị giới hạn số dòng, chỉ gồm trường công khai hoặc dữ liệu của chính người hỏi. Kết quả gửi lại Gemini; tối đa 3 vòng gọi công cụ rồi bắt buộc trả lời.
5. Câu trả lời trả về widget kèm danh sách công cụ đã dùng.

Bảy công cụ: `search_products`, `get_market_info`, `get_farmer_availability` (ai cũng có); `get_my_orders` (khách); `get_my_stall_overview`, `get_my_products` (nông dân); `get_admin_overview` (Admin, chỉ số đếm).
*Vì sao function calling thay vì cho AI viết SQL:* AI không bao giờ chạm thẳng CSDL, không thể đọc dữ liệu người khác, không thể sửa / xóa gì; câu trả lời dựa trên dữ liệu thật nên không bịa giá hay tồn kho.
*Vì sao có giới hạn và trả lời "đang bận" giống nhau cho mọi lỗi:* tránh tốn quota; không tiết lộ cho người ngoài là đang bị giới hạn hay đang hỏng.
Ngoài ra: trả lời theo ngôn ngữ của câu hỏi; tìm được tiếng Việt không dấu ("rau muong" khớp "rau muống"); prompt dặn coi tin nhắn người dùng là dữ liệu, bỏ qua mọi yêu cầu đổi luật (chống prompt injection). **Không có key Gemini thì chatbot báo đang bận** (không có câu trả lời dự phòng).

**Kiểm duyệt tin đăng — luồng:** nông dân lưu sản phẩm → sau khi transaction chốt, `catalog/ai_review/service.py` (`schedule_listing_review`) đưa việc kiểm tra vào luồng nền → chạy **lớp luật** `catalog/ai_review/rules.py` (giá so với khung giá danh mục, so với trung vị các sạp khác, tồn kho bất thường, tên viết hoa…) → nếu luật chưa thấy vi phạm rõ thì gọi **lớp Gemini** `catalog/ai_review/gemini.py` (đọc chữ + ảnh, trả JSON theo schema cố định) → lưu kết quả vào `ProductAIReview` → tin sạch thì tự duyệt, tin vi phạm thì giữ lại và báo Admin. Chi tiết và lý do: Phần 5, mục C2.
Đánh giá của khách và câu trả lời của sạp cũng được Gemini đọc nền để phát hiện ngôn từ xấu (`system/auto_flags.py`).

### 2.8 Module Bản đồ & định vị

- **Hiển thị bản đồ:** `components/common/maps/MarketsMap.jsx` dùng **Leaflet + React-Leaflet**, nền bản đồ lấy từ OpenStreetMap; marker cho chợ và sạp. Chọn vị trí bằng cách kéo ghim: `components/common/maps/MapPicker.jsx`.
- **"Gần tôi":** `hooks/useGeolocation.js` xin vị trí GPS của trình duyệt, gửi `lat`, `lng` lên API chợ; server tính khoảng cách và sắp xếp gần nhất trước (`ordering=distance`).
- **Chỉ đường:** `components/common/maps/DirectionsButton.jsx` mở Google Maps với điểm đến là tọa độ chợ.
- **Tự tra tọa độ từ địa chỉ:** khi nông dân đăng ký hoặc đổi địa chỉ, `backend/accounts/geocoding.py` gọi **Nominatim** của OpenStreetMap (ngoài transaction, chờ tối đa 5 giây, tối đa 1 lượt/giây theo luật của Nominatim, có User-Agent riêng). Lỗi thì để trống, không chặn đăng ký. Admin cũng có nút tra tọa độ khi tạo chợ.
*Vì sao OSM thay vì Google Maps API:* miễn phí, không cần thẻ tín dụng hay API key, đề bài cho phép chọn một trong hai; Google Maps chỉ dùng cho việc nó làm tốt nhất là chỉ đường.

### 2.9 Redis được dùng vào những việc gì

| Việc | File |
| :--- | :--- |
| Kênh trung gian cho WebSocket (channel layer) | `settings.py` (`CHANNEL_LAYERS`) |
| Vé WebSocket dùng 1 lần | `marketlink_core/services/ws_ticket.py` |
| Danh sách phiên bị thu hồi, refresh token đã dùng | `accounts/auth/sessions.py` (cache `blacklist`) |
| Bộ đếm giới hạn tần suất (đăng nhập, đặt hàng, chat…) | DRF throttling, `accounts/auth/throttles.py` |
| Kết quả đặt hàng theo Idempotency-Key | `orders/services/idempotency_service.py` |
| Số câu chatbot mỗi ngày | `chat_bot/limits.py` |
| Nhịp gọi Nominatim 1 lượt/giây | `accounts/geocoding.py` |

*Vì sao Redis:* những dữ liệu này ngắn hạn, đọc / ghi liên tục, cần chung giữa nhiều tiến trình — để trong MySQL thì chậm và làm bẩn CSDL. Không bật Redis thì tự chuyển sang bộ nhớ trong tiến trình để chạy ở máy cá nhân.

---

## PHẦN 3 — CHỨC NĂNG THEO VAI TRÒ

> Khuôn cho mỗi chức năng: **① Yêu cầu** · **② Người dùng làm gì** · **③ Hệ thống làm gì** · **④ Luật & tình huống đặc biệt** · **⑤ Công nghệ & vì sao** · **⑥ File chính** · **⑦ Câu có thể bị hỏi**.

### 3.1 Guest (khách vãng lai)

*(Sẽ viết chi tiết ở vòng sau.)* Guest xem được trang chủ, chợ, sạp, sản phẩm, đánh giá, About, Contact, Sitemap, Privacy và dùng chatbot với công cụ công khai. Bấm thêm vào giỏ → chuyển sang trang đăng nhập.

### 3.2 Customer (khách hàng)

#### C-01. Đăng ký, đăng nhập, dùng chung tài khoản gia đình 🟢 (+🔵)
- **① Yêu cầu:** đăng ký với họ tên, SĐT, email, địa chỉ; đăng nhập an toàn; cho phép dùng chung tài khoản trong gia đình (tùy chọn).
- **② Người dùng:** vào `/register` điền form → đăng nhập ở `/login` → vào dashboard `/customer`. Nhiều người trong nhà đăng nhập cùng một tài khoản trên nhiều máy.
- **③ Hệ thống:** `accounts/services/customer_registration_service.py` tạo tài khoản; mật khẩu được băm bằng bộ băm của Django; số điện thoại được chuẩn hóa (`+84 90 123 4567` → `0901234567`) rồi kiểm tra trùng. Đăng nhập trả cặp token, mỗi thiết bị một phiên riêng.
- **④ Luật:** một SĐT chỉ gắn một tài khoản khách; tài khoản bị khóa không bị xóa nên email / SĐT đó không đăng ký lại được; đúng mật khẩu nhưng tài khoản bị khóa → báo `ACCOUNT_LOCKED` kèm lý do; sai mật khẩu → chỉ báo sai (không lộ trạng thái khóa). Giới hạn `register 10/giờ`.
- **⑤ Công nghệ & vì sao:** JWT (SimpleJWT) — server không phải lưu session, dễ chạy nhiều tiến trình. 🔵 Phiên theo thiết bị (`sid`) — đăng xuất máy này không văng máy khác, đáp ứng "dùng chung gia đình" mà không phải xây module quản lý thành viên; mỗi máy một giỏ hàng riêng, dùng chung lịch sử đơn và yêu thích.
- **⑥ File:** `pages/auth/RegisterForms.jsx`, `components/common/forms/RegisterCustomerForm.jsx`, `hooks/authentication/useAuth.js`, `backend/accounts/auth/`, `backend/accounts/phone.py`.
- **⑦ Hỏi:** *"Dùng chung gia đình làm thế nào?"* → nhiều thiết bị cùng đăng nhập, mỗi thiết bị một phiên và một giỏ, thu hồi từng thiết bị được. *"Mật khẩu lưu thế nào?"* → băm một chiều, không lưu bản gốc.

#### C-02. Tìm chợ gần, bản đồ, chỉ đường 🟢
- **① Yêu cầu:** xem chợ gần theo vị trí và ngày họp; bản đồ có marker và chỉ đường tới điểm nhận.
- **② Người dùng:** vào `/markets`, bấm "Near me" (trình duyệt hỏi quyền vị trí), lọc theo thứ trong tuần, xem chợ trên bản đồ; vào chi tiết chợ thấy giờ mở cửa, danh sách sạp, bấm chỉ đường.
- **③ Hệ thống:** API chợ nhận `lat`, `lng`, tính khoảng cách (công thức Haversine trên mặt cầu) và sắp xếp; lọc theo `day` dựa trên bảng ngày họp của chợ.
- **④ Luật:** chỉ hiện chợ đang hoạt động; chợ có lịch đóng cửa tạm thời vẫn hiện nhưng những ngày đó không đặt được.
- **⑤ Công nghệ & vì sao:** Leaflet + OSM (miễn phí, không key); Geolocation API của trình duyệt; nút chỉ đường mở Google Maps vì người dùng quen và chỉ đường tốt.
- **⑥ File:** `pages/guest/MarketsPage.jsx`, `MarketDetailPage.jsx`, `components/common/maps/`, `hooks/useGeolocation.js`, `backend/markets/public_portal/views_public.py`, `markets/selectors.py`.
- **⑦ Hỏi:** *"Sao không dùng Google Maps API?"* → cần API key và thẻ thanh toán; đề bài cho chọn OSM; vẫn lưu đủ kinh độ / vĩ độ như yêu cầu.

#### C-03. Xem hồ sơ nông dân 🟢
- **① Yêu cầu:** tên sạp, vị trí, ngày bán, hàng trong tuần.
- **② Người dùng:** `/farmers` → `/farmers/:id`: thấy chợ sạp bán và vị trí sạp trong chợ, ngày bán, khung giờ nhận, danh sách hàng đang bán, đánh giá; bấm yêu thích.
- **③ Hệ thống:** chỉ hiện sạp đã được duyệt và hàng đang bán công khai.
- **⑤ Vì sao:** ngày bán của nông dân là dữ liệu riêng (không suy từ khung giờ) để khách biết chắc hôm nào có mặt.
- **⑥ File:** `pages/guest/FarmersPage.jsx`, `FarmerDetailPage.jsx`, `backend/accounts/public_portal/`, `accounts/selectors.py`.

#### C-04. Tìm, lọc, xem chi tiết sản phẩm 🟢
- **① Yêu cầu:** danh mục; lọc theo giá, danh mục, chợ, ngày họp; chi tiết giá, đơn vị, còn bao nhiêu, người bán.
- **② Người dùng:** `/products`: gõ tìm (theo tên hàng hoặc tên sạp), chọn danh mục, khoảng giá, chợ, thứ, chỉ hàng còn; sắp xếp; vào `/products/:id` xem chi tiết, đánh giá, sạp bán ở chợ nào.
- **③ Hệ thống:** `catalog/selectors.py` ghép các điều kiện lọc; có phân trang; dùng `select_related` / `prefetch_related` để không truy vấn lặp (N+1).
- **④ Luật:** chỉ hàng đã duyệt, đang bán, sạp đang hoạt động; số lượng hiển thị là số **còn đặt được**.
- **⑤ Vì sao:** lọc giữ trên URL → chia sẻ link được; debounce khi gõ → không gọi API liên tục.
- **⑥ File:** `pages/guest/ProductsPage.jsx`, `ProductDetailPage.jsx`, `hooks/common/useUrlFilters.js`, `backend/catalog/public_portal/views_public.py`.

#### C-05. Giỏ hàng nhiều sạp 🟢 (+🔵)
- **① Yêu cầu:** thêm sản phẩm vào giỏ và đặt trước theo tồn kho.
- **② Người dùng:** bấm "Add to cart" ở bất kỳ đâu; giỏ `/customer/cart` hiện theo từng sạp; mini cart trượt ra bên cạnh.
- **③ Hệ thống:** giỏ nằm trong trình duyệt; khi mở giỏ thì làm mới giá / tồn kho từ server; món hết hàng hoặc ngừng bán bị đánh dấu.
- **④ Luật:** phải đăng nhập bằng tài khoản khách; số lượng tự kẹp theo 🔵 min / max mỗi đơn của sản phẩm; tối đa 5 sạp trong một lần đặt.
- **⑤ Vì sao:** không lưu giỏ trên server → không cần bảng, mỗi thiết bị một giỏ; vẫn làm mới với dữ liệu thật để không đặt theo giá cũ.
- **⑥ File:** `stores/cart.store.js`, `hooks/common/useAddToCart.js`, `hooks/queries/customer/useCartRefresh.js`, `pages/customer/CartPage.jsx`, `components/customer/cart/`.

#### C-06. Đặt hàng: chọn ngày & khung giờ nhận 🟢 (+🔵)
- **① Yêu cầu:** chọn ngày nhận và khung giờ trong các khung nông dân đặt; đặt theo tồn kho khả dụng; trả tiền khi nhận.
- **② Người dùng:** `/customer/checkout`: với mỗi sạp chọn ngày (chỉ hiện ngày hợp lệ) và khung giờ, ghi chú; bấm đặt → trang thành công liệt kê các đơn đã tạo.
- **③ Hệ thống:** xem mục 2.5 — khóa dòng, kiểm tra giới hạn 10 đơn chờ, kiểm tra khung giờ / giờ chốt, kiểm tra từng món, tạo mỗi sạp một đơn, chụp lại giá lúc đặt, báo nông dân.
- **④ Luật:** đặt trước tối đa 7 ngày; khung đã qua giờ chốt không chọn được; ngày nghỉ / chợ đóng không chọn được; **đặt đơn chưa trừ kho** (trừ khi nông dân duyệt).
- **⑤ Công nghệ & vì sao:** 🔵 Idempotency-Key (bấm 2 lần không ra 2 đơn); 🔵 transaction all-or-nothing; 🔵 tự thử lại khi deadlock; 🔵 giới hạn 10 đơn chờ + `orders 10/giờ` để chống đặt ảo.
- **⑥ File:** `pages/customer/CheckoutPage.jsx`, `hooks/queries/customer/useCheckout.js`, `services/customer/ordersApi.js`, `services/customer/pickupApi.js`, `backend/orders/services/checkout_service.py`, `pickup_service.py`, `idempotency_service.py`.
- **⑦ Hỏi:** *"Hai khách cùng đặt món cuối cùng thì sao?"* → cả hai đặt được vì đặt chưa trừ kho; nông dân duyệt đơn nào trước thì đơn đó lấy hàng; đơn sau duyệt sẽ báo thiếu hàng. *"Sao không trừ kho lúc đặt?"* → chống người đặt ảo giữ hàng rồi không đến.

#### C-07. Theo dõi trạng thái đơn 🟢 (+🔵)
- **① Yêu cầu:** theo dõi Placed → Accepted → Ready for pickup → Completed.
- **② Người dùng:** `/customer/orders` có các tab đơn đang mở / đã xong; `/customer/orders/:id` hiện timeline trạng thái, sạp, vị trí sạp trong chợ, **số điện thoại nông dân kèm nút gọi**, giờ nhận, giờ chốt (có đồng hồ đếm ngược), nút chỉ đường.
- **③ Hệ thống:** mọi lần đổi trạng thái được ghi trong `order_status_history` (ai đổi, lúc nào, lý do).
- **④ Luật:** 🔵 ngoài 4 trạng thái đề bài, đơn còn có thể `DECLINED` (nông dân từ chối), `CANCELLED` (khách hủy), `NO_SHOW` (khách không đến), `EXPIRED` (nông dân không duyệt kịp trước giờ nhận).
- **⑤ Vì sao:** realtime qua WebSocket → khách thấy trạng thái đổi ngay mà không phải tải lại trang.
- **⑥ File:** `pages/customer/OrdersPage.jsx`, `OrderDetailPage.jsx`, `components/common/OrderTimeline.jsx`, `components/common/Countdown.jsx`, `backend/orders/services/fsm.py`.

#### C-08. Sửa đơn & yêu cầu thay đổi 🟢 (+🔵)
- **① Yêu cầu:** sửa đơn trước giờ chốt của nông dân.
- **② Người dùng:** `/customer/orders/:id/edit`: đổi số lượng, thêm / bớt món, đổi ngày hoặc khung giờ, sửa ghi chú.
  - Đơn còn `PLACED` → lưu là áp dụng ngay.
  - 🔵 Đơn đã `ACCEPTED` → lưu thành **yêu cầu thay đổi**; đơn giữ nội dung cũ cho tới khi nông dân chấp nhận / từ chối; khách nhận thông báo kết quả.
- **③ Hệ thống:** `orders/services/modify.py` khóa dòng đơn, so `version` với header `If-Match` (người khác vừa sửa → báo tải lại), kiểm tra đúng chủ đơn, đúng trạng thái, chưa qua giờ chốt, đủ hàng cho phần tăng thêm.
- **④ Luật:** món thêm mới hoặc tăng số lượng phải đang bán; món đã ngừng bán chỉ được giữ hoặc giảm; mỗi đơn chỉ một yêu cầu chờ (gửi mới thì thay cái cũ); tới giờ nhận mà nông dân chưa xử lý thì yêu cầu tự hủy.
- **⑤ Vì sao:** nông dân có thể đã soạn hàng sau khi duyệt → sửa thẳng sẽ gây sai lệch; khóa lạc quan (`version`) tránh hai người cùng sửa đè nhau.
- **⑥ File:** `pages/customer/EditOrderPage.jsx`, `components/customer/orders/ChangeRequestPanel.jsx`, `backend/orders/services/modify.py`, `pending_change.py`.

#### C-09. Hủy đơn 🟢
- **② Người dùng:** nút Cancel trên chi tiết đơn, có hộp xác nhận.
- **③ Hệ thống:** `orders/services/customer_order_service.py` → lõi FSM chuyển `CANCELLED`; nếu đơn đã được duyệt (đã trừ kho) thì cộng trả kho; báo nông dân (in-app + email).
- **④ Luật:** chỉ trước giờ chốt, chỉ đơn `PLACED` hoặc `ACCEPTED`, phải kèm `If-Match`.

#### C-10. Lịch sử đơn & đặt lại nhanh 🟢
- **② Người dùng:** bấm "Reorder" trên đơn cũ → các món còn bán được nạp vào giỏ theo **giá hôm nay**, món không còn bán được liệt kê là bỏ qua.
- **③ Hệ thống:** `GET /api/customer/orders/:id/reorder-preview/` trả danh sách món còn đặt được và món bị bỏ; frontend nạp vào giỏ.
- **⑤ Vì sao:** không tạo đơn ngay mà đưa vào giỏ → khách vẫn chọn lại ngày / khung giờ và xem giá mới trước khi đặt.
- **⑥ File:** `hooks/queries/customer/useReorder.js`, `backend/orders/customer/views_customer.py`.

#### C-11. Yêu thích & báo có hàng lại 🟢
- **② Người dùng:** bấm trái tim trên sạp, sản phẩm, chợ; xem tại `/customer/favorites`; khi món yêu thích có hàng lại thì nhận thông báo `RESTOCK`.
- **③ Hệ thống:** 3 bảng yêu thích riêng (sạp, sản phẩm, chợ); thêm / bỏ là idempotent (bấm lại không lỗi).
- **④ Luật:** chỉ báo có hàng lại khi **nông dân chủ động nhập thêm hàng** làm tồn kho từ 0 lên > 0 (sửa tồn kho hoặc áp mẫu tuần); không báo khi hàng quay lại do đơn bị hủy. Chỉ báo in-app, không email.
- **⑤ Vì sao:** tránh báo "ảo" khi hàng chỉ quay lại vài phút do một đơn bị hủy.
- **⑥ File:** `components/common/favorites/FavoriteButton.jsx`, `hooks/queries/customer/useFavorites.js`, `backend/favorites/`.

#### C-12. Đánh giá sạp và sản phẩm 🟢 (+🔵)
- **② Người dùng:** đơn `COMPLETED` có nút Review → `/customer/orders/:id/review`: chấm sao 1–5 và nhận xét cho sạp và cho từng món.
- **③ Hệ thống:** `reviews/services/review_service.py` kiểm tra đúng chủ đơn, đơn đã hoàn tất, chưa đánh giá lần nào. 🔵 Sau khi lưu, Gemini đọc nhận xét ở luồng nền; thấy ngôn từ xấu hoặc để lại liên hệ giao dịch ngoài thì gắn cờ cho Admin. 🔵 Một sản phẩm có ≥ 3 đánh giá 1–2 sao trong 30 ngày cũng tự gắn cờ.
- **④ Luật:** mỗi đơn đánh giá sạp 1 lần, mỗi món đánh giá 1 lần → chỉ người đã mua thật mới đánh giá được. Admin ẩn đánh giá vi phạm chứ không xóa.
- **⑥ File:** `pages/customer/ReviewOrderPage.jsx`, `backend/reviews/`, `backend/system/auto_flags.py`.

#### C-13. Nhận thông báo 🟢 (+🔵)
- **① Yêu cầu:** email hoặc in-app khi đơn được duyệt và khi sẵn sàng lấy.
- **② Người dùng:** toast bật lên ngay, chuông có số chưa đọc, trang `/customer/notifications` xem tất cả, đánh dấu đã đọc; email cho các sự kiện quan trọng.
- **③ Hệ thống:** xem mục 2.6.
- **⑤ Vì sao:** 🔵 làm cả hai kênh; realtime giúp khách biết ngay khi đơn sẵn sàng để đi lấy.
- **⑥ File:** `components/common/layout/NotificationBell.jsx`, `pages/customer/NotificationsPage.jsx`, `hooks/common/useNotificationSocket.js`.

#### C-14. Hỏi trợ lý AI 🟢 (tùy chọn) + 🔵
- **② Người dùng:** hỏi "chợ Bà Chiểu mấy giờ mở?", "ai bán dưa leo thứ 7?", "đơn của tôi tới đâu rồi?".
- **③ Hệ thống:** xem mục 2.7; khách đã đăng nhập được thêm công cụ `get_my_orders` (chỉ đơn của chính mình).
- **④ Luật:** AI không đặt / sửa / hủy đơn — chỉ chỉ chỗ trong app để làm.
- **⑥ File:** `components/common/chat/AIChatWidget.jsx`, `backend/chat_bot/`.

#### C-15. Dashboard, hồ sơ, đổi mật khẩu 🟢
- **② Người dùng:** `/customer`: số đơn đang mở, các lần nhận sắp tới (gần nhất trước), lối tắt sạp và chợ yêu thích; `/customer/profile` sửa thông tin, ảnh đại diện; `/customer/password` đổi mật khẩu.
- **③ Hệ thống:** `orders/services/customer_dashboard.py`; khi mở dashboard, hệ thống quét và cho hết hạn các đơn quá giờ của những sạp liên quan (quét lười). Đổi mật khẩu → các phiên khác bị vô hiệu.
- **⑥ File:** `pages/customer/CustomerDashboard.jsx`, `ProfilePage.jsx`, `ChangePasswordPage.jsx`.

### 3.3 Farmer (nông dân)

> **Trạng thái tài khoản nông dân** quyết định nông dân làm được gì:
> `PENDING` (mới đăng ký, chờ duyệt) → `APPROVED` (được bán) ⇄ `SUSPENDED` (bị đình chỉ); hoặc `PENDING` → `REJECTED` (bị từ chối).
> - Mọi trạng thái đều **sửa được hồ sơ, chợ, khung giờ, lịch nghỉ** của mình (để sạp chờ duyệt chuẩn bị sẵn).
> - Chỉ `APPROVED` mới **tạo sản phẩm, áp mẫu tồn kho tuần, mở bán lại**.
> - `SUSPENDED` không sửa được sản phẩm và đơn; sạp bị ẩn khỏi web.

#### F-01. Đăng ký & chờ duyệt 🟢 (+🔵)
- **① Yêu cầu:** đăng ký với tên sạp, người liên hệ, SĐT, email, địa chỉ; Admin duyệt mới được bán.
- **② Người dùng:** vào `/register/farmer` điền form, chọn **ngày bán trong tuần** (ít nhất 1 ngày), có thể đặt ghim vị trí trên bản đồ → đăng nhập được ngay, thấy màn hình thông báo "đang chờ duyệt" và danh sách việc cần chuẩn bị.
- **③ Hệ thống:** `accounts/services/registration.py` (`register_farmer`) tạo tài khoản + hồ sơ `PENDING` trong một transaction. Nếu nông dân **đã đặt ghim** thì giữ nguyên tọa độ đó; nếu không thì **tự tra tọa độ từ địa chỉ** (Nominatim) sau khi lưu xong.
- **④ Luật:** một SĐT chỉ một tài khoản nông dân; email của tài khoản bị khóa vẫn bị coi là đã dùng; tra tọa độ lỗi thì để trống, không chặn đăng ký.
- **⑤ Vì sao:** 🔵 cho sạp chờ duyệt đăng nhập và chuẩn bị trước (hồ sơ, chợ, khung giờ) → được duyệt là bán được ngay; 🔵 ưu tiên ghim do nông dân đặt vì nông dân biết vị trí ruộng / sạp rõ hơn kết quả tra địa chỉ.
- **⑥ File:** `pages/auth/RegisterForms.jsx`, `components/farmer/FarmerStatusGate.jsx`, `backend/accounts/services/registration.py`, `accounts/geocoding.py`.
- **⑦ Hỏi:** *"Nông dân chưa duyệt làm được gì?"* → đăng nhập, sửa hồ sơ, đăng ký chợ, tạo khung giờ, khai lịch nghỉ; **không** đăng được sản phẩm.

#### F-02. Hồ sơ sạp, ngày bán, vị trí 🟢 (+🔵)
- **② Người dùng:** `/farmer/profile`: sửa tên sạp, người liên hệ, SĐT, địa chỉ, ảnh, **ngày bán trong tuần**, **giờ chốt nhận đơn (1–72 giờ)**, kéo ghim chỉnh vị trí.
- **③ Hệ thống:** `accounts/services/farmer_profile.py`: đổi địa chỉ mà không kéo ghim → tự tra lại tọa độ (ngoài transaction). Bỏ một ngày bán → các khung giờ của ngày đó tự tắt.
- **④ Luật:** bỏ một ngày bán mà vẫn còn đơn mở rơi vào thứ đó → **bị chặn**, hiện danh sách đơn cần xử lý trước. Giờ chốt nằm trong 1–72 (CSDL có ràng buộc, không cho 0).
- **⑤ Vì sao:** chặn thay vì âm thầm hủy đơn → nông dân không vô tình bỏ rơi khách đã đặt.
- **⑥ File:** `pages/farmer/FarmerProfilePage.jsx`, `components/farmer/OperatingDaysPicker.jsx`, `backend/accounts/services/farmer_profile.py`.

#### F-03. Đăng ký bán ở chợ 🟢 (+🔵)
- **② Người dùng:** `/farmer/markets`: chọn chợ, nhập **vị trí sạp trong chợ** (ví dụ "Dãy B, sạp 12") → chờ Admin duyệt; được báo khi duyệt / từ chối. Có thể rời chợ, sửa vị trí sạp.
- **③ Hệ thống:** `markets/services/farmer_schedule.py` (`join_market`, `update_stall_label`, `leave_market`). Bản ghi `FarmerMarket` có trạng thái `PENDING` / `APPROVED`; chỉ chợ `APPROVED` và đang hoạt động mới được tính là "đang bán".
- **④ Luật:** **rời chợ bị chặn** khi còn đơn mở ở chợ đó; rời chợ thì các khung giờ ở chợ đó cũng bị xóa theo.
- **⑤ Vì sao:** 🔵 Admin kiểm soát sạp nào thật sự có chỗ ở chợ nào; vị trí sạp được chép lên từng đơn để khách tìm sạp.
- **⑥ File:** `pages/farmer/FarmerMarketsPage.jsx`, `components/farmer/MarketChecklist.jsx`.

#### F-04. Khung giờ nhận hàng & lịch nghỉ 🟢 (+🔵)
- **① Yêu cầu:** đặt giờ chốt nhận đơn, quản lý các khung giờ khách đến lấy.
- **② Người dùng:** trên `/farmer/markets`, với mỗi chợ: thêm khung giờ theo thứ trong tuần (ví dụ Thứ 7, 7:00–9:00), bật / tắt, xóa. Khai **lịch nghỉ** theo khoảng ngày ("Time off").
- **③ Hệ thống:** `_validate_slot` kiểm tra khung giờ phải: rơi vào **ngày chợ họp**, **ngày nông dân bán**, và **nằm trong giờ mở cửa của chợ**.
- **④ Luật:**
  - Xóa khung giờ đang có đơn mở → **chặn** (gợi ý tắt thay vì xóa).
  - Khung đang tắt thì luôn tắt được kể cả khi không còn hợp lệ; **bật lại** thì kiểm tra lại mọi luật (ví dụ sau khi chợ đổi giờ).
  - Lịch nghỉ: không bắt đầu trong quá khứ, không chồng lên kỳ nghỉ khác, không có đơn mở nào trong khoảng đó.
  - 🔵 Khóa theo thứ tự hồ sơ → chợ → khung giờ: hai thao tác đồng thời không thể tạo khung giờ vào đúng ngày đang bị bỏ.
- **⑤ Vì sao:** khách chỉ thấy ngày / giờ thật sự có thể đến lấy; đề bài nhắc "nông dân nghỉ tuần đó" là vấn đề thật.
- **⑥ File:** `backend/markets/services/farmer_schedule.py`, `components/farmer/FarmerTimeOffPanel.jsx`.

#### F-05. Quản lý sản phẩm 🟢 (+🔵)
- **① Yêu cầu:** thêm / sửa / xem / xóa sản phẩm: tên, danh mục, giá, đơn vị, số lượng, mô tả, ảnh.
- **② Người dùng:** `/farmer/products` (tìm, lọc theo trạng thái: đang bán, hết hàng, chờ duyệt, bị từ chối…) → form `/farmer/products/new`:
  1. Thông tin: tên, danh mục, mô tả, ảnh.
  2. Giá & kho: giá, đơn vị (KG, bó, cái, túi, hộp, gói), tồn kho, mức mẫu hàng tuần, 🔵 tối thiểu / tối đa mỗi đơn.
  3. 🔵 Chọn **chợ bán** món này.
- **③ Hệ thống:**
  - Tạo sản phẩm: chỉ sạp `APPROVED` **và** đã có ít nhất một chợ được duyệt.
  - Sản phẩm mới ở trạng thái **chờ duyệt** → AI kiểm tra nền (xem Phần 5 mục C2).
  - Sửa tên / mô tả / ảnh / danh mục → quay lại chờ duyệt; sửa giá, kho, min / max → **không** phải duyệt lại.
  - Ảnh upload: kiểm tra đuôi, MIME, ≤ 2MB, ≤ 36 megapixel, **mã hóa lại** để xóa EXIF / GPS.
  - Xóa = **xóa mềm** (`is_archived`), đơn cũ vẫn giữ tên và giá đã chụp.
  - Không chọn chợ → mặc định bán ở mọi chợ sạp đang được duyệt.
- **④ Luật:** kho từ 0 lên > 0 do nông dân chủ động sửa → khách yêu thích món đó nhận **thông báo có hàng lại** (chỉ khi món đang hiện công khai).
- **⑤ Vì sao:** ảnh điện thoại có thể chứa tọa độ GPS nhà nông dân → mã hóa lại để bảo vệ; xóa mềm để báo cáo và lịch sử đơn không bị hỏng.
- **⑥ File:** `pages/farmer/FarmerProductsPage.jsx`, `FarmerProductFormPage.jsx`, `backend/catalog/farmer/views_farmer.py`, `catalog/services/farmer_product.py`.

#### F-06. Kiểm tra trước khi đăng 🔵
- **② Người dùng:** đang gõ form thì hiện gợi ý ngay (giá lạ so với khung giá danh mục, giá lệch xa các sạp khác, tên toàn chữ hoa, tối thiểu lớn hơn tồn kho…).
- **③ Hệ thống:** `POST /api/farmer/products/precheck/` chạy **lớp luật** (không gọi AI, không lưu gì).
- **⑤ Vì sao:** nông dân sửa trước khi gửi → ít bị từ chối, Admin đỡ việc.
- **⑥ File:** `components/farmer/ListingPrecheck.jsx`, `FarmerProductPrecheckView`.

#### F-07. Mẫu tồn kho hàng tuần 🟢
- **① Yêu cầu:** mẫu hàng lặp lại hàng tuần, chỉnh được khi nguồn hàng đổi.
- **② Người dùng:** `/farmer/stock-template`: mỗi sản phẩm có "mức mặc định mỗi tuần"; bấm **"Apply to this week"** (cả trang hoặc từng dòng), có **xem trước** con số trước khi áp.
- **③ Hệ thống:** trước khi tính, quét cho hết hạn các đơn quá giờ; rồi **tồn kho mới = max(mức mẫu − số đang giữ, 0)**, trong đó "số đang giữ" là hàng của đơn **đã duyệt / sẵn sàng** mà khung nhận chưa kết thúc. Khóa dòng sản phẩm khi ghi; kho từ 0 lên > 0 thì gửi báo có hàng lại.
- **④ Ví dụ:** mẫu 50 kg, đang có đơn đã duyệt giữ 12 kg → áp mẫu → kho = 38 kg (không phải 50, vì 12 kg đã hứa cho khách).
- **⑤ Vì sao:** không tạo bảng riêng, chỉ thêm cột `weekly_default_quantity`; trừ phần đã hứa để không bán vượt hàng thật.
- **⑥ File:** `pages/farmer/FarmerStockTemplatePage.jsx`, `catalog/services/farmer_product.py` (`preview_weekly_template`, `apply_weekly_template`).

#### F-08. Hết hàng, tạm ngừng, thao tác hàng loạt 🟢 (+🔵)
- **① Yêu cầu:** đánh dấu "Sold out" hoặc "Temporarily unavailable".
- **② Người dùng:** nút **Sold out** (kho về 0) và **Pause / Resume** (tạm ngừng / mở bán lại) trên từng dòng; 🔵 chọn nhiều sản phẩm để làm cùng lúc: hết hàng, tạm ngừng, mở bán, **đổi chợ bán**.
- **④ Luật:** sạp chưa duyệt vẫn bấm được Sold out nhưng không mở bán / đổi chợ được; sạp bị đình chỉ thì không thao tác gì được với sản phẩm; sản phẩm bị Admin ẩn thì nông dân không tự mở bán lại được.
- **⑥ File:** `FarmerProductBulkView`, `FarmerProductMarkSoldOutView`.

#### F-09. Xử lý đơn hàng 🟢 (+🔵)
- **① Yêu cầu:** xem đơn đến theo thời gian thực; Accept / Decline; Ready for pickup.
- **② Người dùng:** `/farmer/orders` chia tab (chờ duyệt, đã duyệt, sẵn sàng, đã xong…) có số đếm, lọc theo ngày nhận; đơn mới bật thông báo ngay. Trên mỗi đơn:

| Nút | Đơn đang ở | Điều kiện thời gian | Kết quả |
| :--- | :--- | :--- | :--- |
| **Accept** | `PLACED` | trước giờ bắt đầu nhận | `ACCEPTED`, **trừ kho**; thiếu hàng thì báo lỗi, đơn vẫn chờ |
| **Decline** | `PLACED` / `ACCEPTED` | trước giờ bắt đầu nhận | `DECLINED`; **bắt buộc lý do 5–500 ký tự**; đơn đã duyệt thì bắt buộc khai món nào hết, còn lại cộng trả kho |
| **Sold out (một món)** 🔵 | `PLACED` | trước giờ bắt đầu nhận | bỏ món khỏi đơn, tính lại tiền, kho món đó = 0, báo khách |
| **Ready** | `ACCEPTED` | **sau giờ chốt**, không có yêu cầu thay đổi đang chờ | `READY_FOR_PICKUP`, báo khách (in-app + email) |
| **Complete** | `READY_FOR_PICKUP` | — | `COMPLETED`, khách được đánh giá |
| **No-show** 🔵 | `READY_FOR_PICKUP` / `ACCEPTED` | **sau khi hết khung nhận** | `NO_SHOW`, cộng trả kho online; chỉ tính lỗi cho khách khi đơn đã Ready |

- **③ Hệ thống:** mọi nút gọi chung một lõi `orders/services/fsm.py` (`transition_order`): kiểm tra cặp trạng thái có trong bảng chuyển hợp lệ không, đúng vai trò không, đúng thời gian không, rồi đổi kho, ghi lịch sử, gửi thông báo — tất cả trong một transaction. Gửi kèm `If-Match` để hai người cùng bấm không đè nhau.
- **⑤ Vì sao "Ready" chỉ sau giờ chốt:** trước giờ chốt khách vẫn còn quyền sửa / hủy; báo "sẵn sàng" sớm thì đơn có thể đổi tiếp.
- **⑥ File:** `pages/farmer/FarmerOrdersPage.jsx`, `FarmerOrderDetailPage.jsx`, `components/farmer/FarmerOrderActions.jsx`, `backend/orders/farmer/views_farmer.py`, `orders/services/fsm.py`, `farmer_order_items.py`.
- **⑦ Hỏi:** *"Nông dân duyệt xong mới thấy hết hàng thì sao?"* → Decline, khai món hết, các món khác trả về kho, khách nhận lý do.

#### F-10. Xử lý yêu cầu thay đổi của khách 🔵
- **② Người dùng:** đơn đã duyệt mà khách sửa → trên đơn hiện bảng **so sánh cũ / mới**; nông dân chọn **Chấp nhận** (áp nội dung mới, trừ thêm / trả lại phần chênh lệch kho), **Từ chối thay đổi** (giữ đơn cũ) hoặc **Hủy cả đơn** (Decline có lý do).
- **③ Hệ thống:** `orders/services/farmer_change_request.py`; khóa theo thứ tự đơn → món → sản phẩm (sắp theo id); mỗi lựa chọn đều báo khách.
- **⑥ File:** `components/farmer/FarmerChangeRequestPanel.jsx`.

#### F-11. Danh sách soạn hàng & đơn gom theo khách 🔵
- **② Người dùng:** chọn một ngày nhận → thấy **tổng số lượng cần chuẩn bị của từng món** (picking list) và các đơn **gom theo từng khách** (một khách nhiều đơn được gộp lại để soạn một lần).
- **⑤ Vì sao:** sáng ngày họp chợ nông dân cần biết "mang bao nhiêu kg mỗi thứ", không mở từng đơn.
- **⑥ File:** `FarmerOrderPickingListView`, `FarmerOrderGroupedByCustomerView`.

#### F-12. Dashboard & thống kê 🟢 (+🔵)
- **① Yêu cầu:** lịch sử bán, sản phẩm bán chạy, tổng đơn, đơn chờ, doanh thu.
- **② Người dùng:**
  - `/farmer` (dashboard): tổng đơn, đơn chờ duyệt, doanh thu, doanh thu theo ngày, top bán chạy, cảnh báo đơn quá hạn, các đơn sắp tới.
  - `/farmer/stats`: chọn khoảng ngày; doanh thu **so với kỳ trước**, giá trị trung bình mỗi đơn, doanh thu theo ngày, top sản phẩm, doanh thu theo chợ, phân bố trạng thái đơn, 🔵 **thứ nào đông khách nhất**.
- **③ Hệ thống:** `orders/services/dashboard.py`. **Doanh thu chỉ tính đơn `COMPLETED`** (đơn đã giao tiền); mặc định 7 ngày gần nhất; mở dashboard thì chạy quét lười đơn quá hạn trước.
- **⑤ Vì sao chỉ tính `COMPLETED`:** không có thanh toán online, chỉ đơn khách đã đến lấy mới chắc chắn có tiền.
- **⑥ File:** `pages/farmer/FarmerDashboardPage.jsx`, `FarmerStatsPage.jsx` (biểu đồ Recharts).

#### F-13. Trả lời đánh giá 🟢
- **② Người dùng:** `/farmer/reviews`: xem đánh giá sạp và sản phẩm, mới nhất trước; trả lời công khai **một lần** cho mỗi đánh giá.
- **③ Hệ thống:** `reviews/services/farmer_reply_service.py`: khóa dòng đánh giá rồi kiểm tra theo thứ tự: đúng sạp của mình → sạp không bị đình chỉ → đánh giá không bị ẩn → chưa trả lời lần nào. 🔵 Câu trả lời cũng được AI đọc nền, vi phạm thì gắn cờ cho Admin.
- **⑥ File:** `pages/farmer/FarmerReviewsPage.jsx`.

#### F-14. Thông báo & chatbot cho nông dân 🟢 (+🔵)
- **Thông báo nông dân nhận:** có đơn mới, khách sửa đơn, khách hủy (in-app + email), đơn bị hủy do khách bị khóa (in-app + email), chợ được duyệt / từ chối, sản phẩm được duyệt / từ chối / bị chặn, chợ đổi lịch / đóng cửa.
- **Chatbot:** ngoài công cụ công khai, nông dân có thêm `get_my_stall_overview` (đơn chờ, yêu cầu thay đổi, lịch nhận theo ngày, lịch nghỉ) và `get_my_products` (hàng sắp hết, đã hết, đang chờ duyệt, bị từ chối). Hỏi được: "hôm nay tôi có bao nhiêu đơn chờ duyệt?", "món nào sắp hết hàng?".
- **⑥ File:** `pages/farmer/FarmerNotificationsPage.jsx`, `backend/chat_bot/ai_chatbot.py`.

### 3.4 Admin

*(Sẽ viết chi tiết theo khuôn 7 bước ở vòng sau.)* Danh sách chức năng:
- A-01 Cổng đăng nhập riêng, dashboard + hàng việc cần làm 🟢 + 🔵
- A-02 Duyệt / từ chối / đình chỉ / khôi phục nông dân, xem trước tác động 🟢 + 🔵
- A-03 Khóa / mở khóa khách (bắt buộc lý do), cờ At-risk 🟢 + 🔵
- A-04 Hàng chờ duyệt: tin đăng sản phẩm, đăng ký chợ của sạp 🔵
- A-05 CRUD chợ, đổi lịch có xem trước tác động, lịch đóng cửa, đóng chợ khẩn cấp 🟢 + 🔵
- A-06 Kiểm duyệt: ẩn / chặn sản phẩm, ẩn đánh giá, hàng đợi cờ 🟢 + 🔵
- A-07 Quyết định của AI, thống kê độ tin cậy AI 🔵
- A-08 Khung giá theo danh mục 🔵
- A-09 Danh mục (icon, kéo thả sắp xếp) 🟢 + 🔵
- A-10 Báo cáo, xuất Excel / CSV 🟢 + 🔵
- A-11 Thông báo toàn sàn 🟢
- A-12 Nhật ký an ninh, lịch sử thay đổi, trang xem đơn chỉ đọc, trang Limits 🔵

---

## PHẦN 4 — CÁC LÕI NGHIỆP VỤ XUYÊN SUỐT

*(Sẽ viết chi tiết ở vòng sau; dưới đây là ý chính để học trước.)*

### 4.1 Vòng đời đơn hàng
- 3 trạng thái mở: `PLACED` → `ACCEPTED` → `READY_FOR_PICKUP`. 5 trạng thái kết thúc: `COMPLETED`, `CANCELLED`, `DECLINED`, `NO_SHOW`, `EXPIRED`.
- 13 cạnh chuyển T1–T14 (T7 đã bỏ): T1 đặt · T2 duyệt · T3 / T4 từ chối · T5 / T6 khách hủy · T8 hết hạn · T9 sẵn sàng · T10 hoàn tất · T11 / T14 không đến · T12 Admin đình chỉ sạp · T13 Admin khóa khách.
- Mỗi lần chuyển kiểm tra 3 lớp (vai trò, trạng thái hiện tại, thời gian) và ghi lịch sử trong cùng transaction (`orders/services/fsm.py`).

### 4.2 Tồn kho
- Đặt: chỉ kiểm tra, không trừ. Duyệt: khóa sản phẩm theo `id` tăng dần rồi trừ. Hủy / từ chối / không đến: chỉ cộng trả nếu đơn đã từng bị trừ.
- Mẫu tuần: tồn kho mới = max(số mẫu − số đang giữ cho đơn đã duyệt, 0).

### 4.3 Thời gian
- Ngày nhận hợp lệ = ngày chợ họp ∩ ngày nông dân bán − lịch đóng chợ − lịch nghỉ; trong 7 ngày tới.
- Giờ chốt `cutoff_at` = giờ bắt đầu khung − số giờ chốt của sạp (1–72), lưu cứng trên đơn.
- Nông dân chỉ bấm "Ready" sau giờ chốt; chỉ bấm "No-show" sau khi hết khung nhận.

### 4.4 Tác động dây chuyền của Admin
- Đình chỉ sạp → đơn mở `DECLINED`. Khóa khách → đơn mở `CANCELLED`. Đóng chợ → đơn mở tại chợ `DECLINED`, mỗi khách một thông báo gộp. Chặn sản phẩm → đơn mở chứa món đó `DECLINED`. Tất cả đều hoàn kho và có màn hình xem trước tác động.

### 4.5 Kiểm duyệt nội dung
- Sạp phải được duyệt → tin đăng phải được duyệt → AI 2 lớp hỗ trợ → hàng đợi cờ cho những gì còn cần Admin quyết.

---

## PHẦN 5 — TỔNG HỢP TÍNH NĂNG MỞ RỘNG

> Đây là phần ăn điểm. Mỗi mục có: **Vì sao làm** · **Làm thế nào** · **Công nghệ / file**. Khi giám khảo hỏi "điểm khác biệt của nhóm", lấy từ đây.

### NHÓM A — Đơn hàng

**A1. Vòng đời đơn 8 trạng thái, 13 cạnh chuyển**
- *Vì sao:* đề bài chỉ có đường đi "suôn sẻ"; thực tế có khách hủy, nông dân từ chối, khách không đến, nông dân quên duyệt. Không có các trạng thái này thì đơn treo mãi, kho sai, báo cáo sai.
- *Làm thế nào:* một service FSM duy nhất quyết định mọi chuyển trạng thái; kiểm tra vai trò + trạng thái + thời gian; ghi lịch sử cùng transaction; khóa lạc quan bằng `version` + `If-Match`.
- *File:* `orders/models.py`, `orders/services/fsm.py`.

**A2. Trừ kho khi duyệt + 4 chốt chặn đặt ảo**
- *Vì sao:* trừ kho lúc đặt thì một người có thể đặt hết hàng rồi không đến, nông dân mất khách thật.
- *Làm thế nào:* đặt chỉ kiểm tra; duyệt mới trừ, khóa dòng theo thứ tự `id` để không deadlock. Chốt chặn: bắt buộc đăng nhập, tối đa 10 đơn chờ / khách, `orders 10/giờ`, Admin khóa tài khoản vi phạm.
- *File:* `orders/services/checkout_service.py`, `catalog/services/stock.py`.

**A3. Yêu cầu thay đổi cho đơn đã duyệt**
- *Vì sao:* sau khi duyệt, nông dân có thể đã soạn hàng; khách sửa thẳng sẽ làm lệch kho và gây tranh cãi.
- *Làm thế nào:* lưu yêu cầu trong cột JSON `orders.pending_change` (không thêm bảng); nông dân chọn Chấp nhận / Từ chối / Hủy cả đơn; tự hủy khi tới giờ nhận.
- *File:* `orders/services/modify.py`, `pending_change.py`, `farmer_change_request.py`.

**A4. Đơn quá hạn tự `EXPIRED` bằng quét lười**
- *Vì sao:* đơn nông dân không duyệt trước giờ nhận không thể treo mãi; nhưng chạy cron / Celery cần thêm server worker, tốn tiền trên gói miễn phí.
- *Làm thế nào:* hàm `expire_overdue_orders` chạy ngay trước những thao tác cần dữ liệu đúng: đặt hàng, áp mẫu tuần, mở dashboard. Lỗi một đơn không làm hỏng request. Có lệnh `expire_orders` chạy tay.
- *File:* `orders/services/expiry.py`.

**A5. Đánh dấu hết hàng từng món trong đơn**
- *Vì sao:* thực tế hay hết một món chứ không phải cả đơn; từ chối cả đơn thì khách mất hết.
- *Làm thế nào:* bỏ món khỏi đơn, tính lại tổng, đặt tồn kho món đó = 0, báo khách; khi từ chối đơn đã duyệt bắt buộc khai báo món nào hết để kho cuối đúng.
- *File:* `orders/services/farmer_order_items.py`.

**A6. Khách không đến, cờ At-risk, tự khóa sau 3 lần**
- *Vì sao:* đặt trước mà không đến là thiệt hại trực tiếp cho nông dân (hàng đã soạn).
- *Làm thế nào:* chỉ đếm khi đơn đã ở trạng thái Sẵn sàng (nông dân đã soạn hàng); không đếm đơn hết hạn. Đạt 3 lần trong 30 ngày → hệ thống khóa, hủy đơn mở, báo khách, ghi nhật ký; Admin mở khóa thì đếm lại từ đầu.
- *File:* `accounts/services/no_show_lock.py`.

**A7. Danh sách soạn hàng & đơn gom theo khách**
- *Vì sao:* sáng ngày họp chợ, nông dân cần biết tổng phải chuẩn bị bao nhiêu kg mỗi món, chứ không mở từng đơn.
- *File:* `orders/farmer/views_farmer.py` (`picking-list`, `grouped-by-customer`).

**A8. Số lượng tối thiểu / tối đa mỗi đơn**
- *Vì sao:* có món chỉ bán từ 2 kg, có món giới hạn để chia đều cho nhiều khách.
- *File:* `catalog/models.py`, `stores/cart.store.js`, `checkout_service.py`.

**A9. Đặt hàng chống trùng & chịu tải**
- *Vì sao:* mạng di động chập chờn, người dùng bấm lại; ngày cao điểm nhiều người đặt cùng lúc.
- *Làm thế nào:* Idempotency-Key, all-or-nothing, khóa dòng, tự thử lại khi deadlock, giá luôn lấy từ CSDL.
- *File:* `idempotency_service.py`, `marketlink_core/services/db_retry.py`.

### NHÓM B — Chợ, lịch, định vị

**B1. Sạp đăng ký chợ phải được Admin duyệt**
- *Vì sao:* tránh sạp tự nhận bán ở chợ mà thực tế không có chỗ; Admin kiểm soát danh sách sạp ở từng chợ.
- *File:* `markets/models.py` (`FarmerMarket.status`), `markets/admin_portal/` (`market-requests`).

**B2. Lịch đóng cửa chợ & lịch nghỉ nông dân**
- *Vì sao:* đề bài nhắc nông dân "nghỉ tuần đó" là vấn đề thật nhưng không có chức năng; lễ Tết, mưa bão chợ cũng đóng.
- *Làm thế nào:* khai báo theo khoảng ngày; những ngày đó không đặt được; chặn tạo kỳ nghỉ nếu còn đơn mở trong khoảng.
- *File:* `markets/models.py` (`MarketClosure`, `FarmerClosure`).

**B3. Đổi lịch chợ có xem trước tác động**
- *Vì sao:* đổi giờ chợ có thể làm hàng chục đơn không còn hợp lệ; Admin phải biết trước khi bấm.
- *Làm thế nào:* tính trước số khung giờ sẽ tắt, số đơn lệch, số khách / sạp bị ảnh hưởng; xác nhận mới lưu; đơn lệch được đánh dấu cần dời giờ, không dời kịp thì hủy và báo khách.
- *File:* `markets/services/market_service.py`.

**B4. Đóng chợ khẩn cấp, xác nhận bằng gõ chữ "Confirm"**
- *Vì sao:* chợ đóng đột xuất (ngập, cháy) thì phải báo ngay cho mọi người có đơn; thao tác nguy hiểm nên chống bấm nhầm.
- *Làm thế nào:* một transaction tắt chợ, từ chối đơn mở, hoàn kho, tắt khung giờ; mỗi khách chỉ nhận một thông báo gộp; không đình chỉ sạp vì sạp có thể bán chợ khác.

**B5. Ngày hoạt động của nông dân & tự tra tọa độ**
- *Vì sao:* nông dân lớn tuổi không biết kinh độ / vĩ độ là gì; ngày bán cần rõ ràng để khách không đến nhầm hôm.
- *File:* `accounts/geocoding.py`, `accounts/operating_days.py`.

**B6. Chọn chợ bán cho từng sản phẩm**
- *Vì sao:* sạp bán nhiều chợ nhưng không mang mọi món tới mọi chợ.
- *File:* `catalog/models.py` (`ProductMarket`).

### NHÓM C — Kiểm duyệt & AI

**C1. Duyệt tin đăng trước khi lên sàn**
- *Vì sao:* đề bài chỉ cho gỡ tin sai **sau khi** đã hiện trước mặt khách — quá muộn.
- *Làm thế nào:* tin mới ở trạng thái chờ duyệt; sửa tên / mô tả / ảnh / danh mục thì quay lại hàng chờ, còn sửa giá và tồn kho thì không (để nông dân cập nhật kho không phải chờ).
- *File:* `catalog/services/product_moderation_service.py`.

**C2. AI kiểm duyệt 2 lớp, tự duyệt tin sạch**
- *Vì sao:* Admin không thể đọc hết mọi tin; nhưng giao hẳn cho AI thì rủi ro.
- *Làm thế nào:*
  - Lớp luật kiểm tra con số (giá so với khung giá danh mục, lệch xa trung vị sạp khác, tồn kho bất thường) — vì AI không biết giá chợ hôm nay và mỗi lần trả lời một khác.
  - Lớp Gemini đọc ý nghĩa chữ và ảnh (có phải nông sản, đúng danh mục, ngôn từ xấu, để lại liên hệ, ảnh có khớp) — việc luật cứng làm không được. Câu trả lời ép theo JSON schema để tin đăng không "nói chuyện" lừa được AI.
  - Luật đã thấy vi phạm rõ thì không gọi AI (tiết kiệm quota); băm nội dung để không kiểm tra lại cùng một nội dung.
  - Chạy nền sau khi lưu, nông dân không phải chờ.
  - Mọi quyết định tự động liệt kê ở trang AI Decisions để Admin xác nhận / hoàn tác; có thống kê tỉ lệ AI và Admin đồng ý với nhau, số lần bắt đúng / bỏ sót / báo nhầm → biết khi nào tin được AI.
  - Không có key → chỉ chạy lớp luật, tin chờ Admin duyệt tay như bình thường.
- *File:* `catalog/ai_review/` (`service.py`, `rules.py`, `gemini.py`, `stats.py`), `pages/admin/AdminAIDecisionsPage.jsx`.

**C3. Kiểm tra ngay trên form (precheck)**
- *Vì sao:* nông dân biết lỗi trước khi gửi, đỡ bị từ chối.
- *File:* `catalog/farmer/views_farmer.py` (`precheck`), `components/farmer/ListingPrecheck.jsx`.

**C4. Khung giá & tồn kho theo danh mục**
- *Vì sao:* cho lớp luật một mốc so sánh do Admin chỉnh; ngoài khung không bị cấm, chỉ cần xem lại.
- *File:* `PriceGuideline` trong `catalog/models.py`, `pages/admin/AdminPriceGuidelinesPage.jsx`.

**C5. Quét ảnh hàng tuần bằng AI**
- *Vì sao:* nông dân có thể đổi ảnh sau khi được duyệt.
- *File:* `catalog/management/commands/ai_scan_product_images.py`.

**C6. Hàng đợi cờ & cờ tự động**
- *Vì sao:* "ẩn" là quyết định đã đưa ra; "cờ" là ghi nhớ còn nợ một quyết định — Admin không phải đọc lại toàn bộ danh mục mỗi ngày.
- *Làm thế nào:* cờ tự động cho đánh giá có ngôn từ xấu (AI đọc), sản phẩm nhiều đánh giá thấp, khách vượt ngưỡng không đến; mỗi đối tượng một cờ mở; lỗi khi gắn cờ không làm hỏng thao tác gốc.
- *File:* `system/flags.py`, `system/auto_flags.py`.

**C7. Ẩn và Chặn sản phẩm là hai việc khác nhau**
- *Vì sao:* đang nghi ngờ (ẩn, giữ đơn) khác với đã xác định vi phạm (chặn, hủy đơn, hoàn kho).
- *File:* `catalog/services/product_moderation_service.py`.

### NHÓM D — Quản trị & giám sát

**D1. Nhật ký an ninh & lịch sử thay đổi** — *Vì sao:* biết ai làm gì, lúc nào, từ IP nào khi có sự cố; xem được ai đã sửa hồ sơ / sản phẩm / chợ. *File:* `system/models.py` (`AuditLog`), `django-simple-history`.

**D2. Xem trước tác động khi đình chỉ sạp / khóa khách** — *Vì sao:* Admin cần biết bao nhiêu đơn và khách bị ảnh hưởng trước khi bấm.

**D3. Trang xem đơn chỉ đọc** — *Vì sao:* hỗ trợ tra cứu khi có khiếu nại mà không cho Admin sửa đơn của người khác.

**D4. Trang Limits** — *Vì sao:* Admin mới biết hệ thống đang áp những giới hạn nào mà không phải "đụng" vào mới biết.

**D5. Dashboard có hàng việc cần làm và biểu đồ theo tháng** — *Vì sao:* con số tổng không giúp Admin làm việc; "việc chờ xử lý hôm nay" thì giúp.

**D6. Xuất Excel an toàn & CSV** — *Vì sao:* tên do người dùng đặt bắt đầu bằng `=` có thể thành công thức độc khi mở Excel; ghi mọi ô chữ dạng chuỗi để chặn.

**D7. Dọn tài khoản không dùng** — *Vì sao:* tài khoản rác làm phình dữ liệu; mặc định chỉ liệt kê, phải thêm `--apply` mới xóa.

**D8. Danh mục: icon không trùng, kéo thả sắp xếp** — *Vì sao:* hai danh mục cùng icon làm khách nhầm; Admin sắp thứ tự hiển thị trực quan.

### NHÓM E — Trợ lý AI theo vai trò
Xem mục 2.7. *Vì sao vượt mức "tùy chọn":* trả lời bằng dữ liệu thật qua function calling, đúng quyền từng vai trò, an toàn (chỉ đọc), đa ngôn ngữ, có giới hạn chống tốn quota.

### NHÓM F — Thông báo realtime đa kênh
Xem mục 2.6. *Vì sao:* đề bài chỉ cần một kênh cho 2 sự kiện; đồ án có hai kênh, hơn 25 loại sự kiện, realtime, có polling dự phòng, vé WebSocket an toàn.

### NHÓM G — Bảo mật tăng cường
Xem Phần 6.

### NHÓM H — Trải nghiệm giao diện
Sáng / tối · đếm ngược giờ chốt · mini cart · skeleton khi tải · chặn rời trang khi form chưa lưu · bộ lọc trên URL · trang Sitemap, Privacy, 403, 404 · tách code theo vai trò (lazy route) để tải nhanh.

---

## PHẦN 6 — BẢO MẬT, KIỂM THỬ, TRIỂN KHAI

### 6.1 Bảo mật
- **Đăng nhập:** JWT access 15 phút / refresh 7 ngày, xoay vòng refresh, phát hiện refresh token bị dùng lại; phiên theo thiết bị; đổi mật khẩu vô hiệu các phiên cũ.
- **Chống dò mật khẩu:** `5/phút` theo IP + `20 lần sai/giờ` theo email; không tiết lộ tài khoản Admin hay trạng thái khóa.
- **Phân quyền hai lớp:** frontend chặn trang (`router/guards.jsx`) chỉ để trải nghiệm; **backend mới là lớp bảo vệ thật** (permission theo vai trò + lọc dữ liệu theo chủ sở hữu, truy cập đơn người khác trả 404).
- **Dữ liệu vào:** serializer kiểm tra mọi ô; ORM chống SQL injection; React tự escape chống XSS.
- **Ảnh upload:** kiểm tra đuôi, MIME, ≤ 2MB, ≤ 36 megapixel, đổi tên UUID, mã hóa lại ảnh để xóa EXIF / GPS.
- **Cấu hình:** thiếu `DEBUG` coi là tắt; production thiếu `SECRET_KEY` thì không chạy; bật HTTPS / HSTS; CORS chỉ cho domain frontend; chỉ tin IP do proxy của hệ thống gắn (`NUM_PROXIES`).
- **Một SĐT một tài khoản**, tài khoản khóa không xóa nên không đăng ký lại được.

### 6.2 Hiệu năng & chịu tải
Phân trang 20 dòng · index CSDL · `select_related` / `prefetch_related` · cache TanStack Query · debounce · ảnh lazy · lazy route theo vai trò · backend không lưu trạng thái (JWT) nên chạy nhiều tiến trình được · Redis cho dữ liệu nóng.

### 6.3 Kiểm thử
pytest + pytest-django, khoảng 90 file test: FSM đơn hàng, checkout, sửa đơn, hết hạn, đồng thời tồn kho, vé WebSocket, throttle đăng nhập, thu hồi phiên, phân quyền Admin, AI review, cờ tự động, báo cáo Excel… Có Swagger tại `/api/docs/`.

### 6.4 Triển khai
Vercel (frontend) · Render chạy Daphne (backend + WebSocket) · Aiven MySQL (bắt buộc SSL) · Upstash Redis (`rediss://`). `DEPLOYMENT_GUIDE.md` ghi 7 lỗi thực tế đã gặp: SSL Aiven, chứng chỉ Upstash, CORS / CSRF giữa Vercel và Render, mất ảnh khi tắt DEBUG, F5 bị 404, seed trùng khi build, WebSocket không chạy trên Gunicorn. Dữ liệu mẫu: `python manage.py seed_real_data`. Kiểm tra sống: `/api/health/` (kiểm tra CSDL và cache).

---

## PHẦN 7 — CHUẨN BỊ BẢO VỆ

### 7.1 Kịch bản demo
*(Sẽ viết ở vòng sau: thứ tự màn hình theo từng tài khoản demo, ai thao tác phần nào.)*

### 7.2 Câu hỏi thường gặp & trả lời mẫu
*(Sẽ viết ở vòng sau.)*

### 7.3 Điểm cần cả nhóm thống nhất

1. **Quy định AI mâu thuẫn:** SRS cho dùng trợ lý lập trình, bảng chấm điểm ghi AI chỉ được dùng để tạo ảnh; README khai có dùng AI coding assistant. → Thống nhất cách trình bày, chuẩn bị giải thích phần code mình tự hiểu.
2. **Lưu token:** README ghi "HttpOnly Cookie", code thực tế lưu token ở `localStorage` và gửi Bearer. → Sửa README hoặc chuẩn bị trả lời (lý do thường gặp: SPA và API khác domain khi deploy Vercel / Render; rủi ro XSS được giảm vì React tự escape và không dùng `dangerouslySetInnerHTML`).
3. **Chatbot khi không có key:** README ghi có "dự phòng bằng CSDL", code thực tế trả lời "đang bận". (Kiểm duyệt tin đăng thì đúng là còn lớp luật.) → Sửa README.
4. **Tự khóa khi không đến lấy hàng:** tài liệu phân tích D-028 ghi "Admin quyết định khóa", code hiện tại tự khóa sau 3 lần. → Chốt theo code.
5. **Tên model Gemini:** README ghi `gemini-2.5-flash` và `gemini-3.1-flash`; `settings.py` dùng `gemini-3.1-flash-lite` (dự phòng `gemini-3.5-flash-lite`). → Sửa README.
6. **Tailwind:** README ghi có Tailwind, `package.json` không có; thực tế dùng CSS3 thuần + design tokens. → Sửa README.
7. **Bảng chấm điểm có nhắc Opera** → test thêm trên Opera trước buổi bảo vệ.

### 7.4 Đã sửa: AI duyệt đánh giá tự ẩn khi chắc chắn vi phạm

Trước đây AI chỉ gắn cờ, đánh giá thô tục vẫn hiện công khai cho tới khi Admin ẩn tay. Nay đã sửa (chỉ đụng tới tính năng duyệt đánh giá):

| File | Thay đổi |
| :--- | :--- |
| `backend/catalog/ai_review/gemini.py` | Prompt hỏi thêm `certain` (chắc chắn hay chỉ nghi ngờ); hàm mới `assess_review` trả về `ReviewVerdict(problems, certain)`; hàm cũ `ask_about_review` giữ nguyên cách dùng. Câu trả lời thiếu hoặc lạ ở ô `certain` luôn bị coi là "nghi ngờ" (an toàn: chỉ gắn cờ, không ẩn). |
| `backend/system/auto_flags.py` | Đánh giá của khách mà AI chắc chắn vi phạm → ẩn + ghi audit log `REVIEW_HIDDEN` (người làm = hệ thống) + gắn cờ, tất cả trong một transaction (gắn cờ lỗi thì không ẩn). Đánh giá đã bị ẩn sẵn thì không đụng tới. Câu trả lời của sạp vẫn chỉ gắn cờ. |
| `backend/reviews/services/review_moderation_service.py` | Thêm hằng `AI_HIDE_PREFIX` và hàm `hidden_by_ai()`. |
| `backend/reviews/admin_portal/serializers_admin.py` | API danh sách đánh giá cho Admin trả thêm `hidden_by_ai`. |
| `frontend/src/pages/admin/AdminModerationPage.jsx` | Nhãn "Hidden by AI: …" thay cho "Hidden: …" khi AI ẩn. |
| `backend/system/test_auto_flags.py` | Sửa test cũ cho hành vi mới, thêm test: chắc chắn → ẩn; nghi ngờ → chỉ cờ; chê thật lòng → không gì cả; Admin khôi phục được; Admin thấy nhãn AI; đọc câu trả lời của model an toàn. |

Không cần migration (dùng lại các cột ẩn đánh giá đã có). Việc còn lại có thể làm thêm: cột ẩn riêng cho câu trả lời của sạp.
