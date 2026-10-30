# MarketLink — Kịch bản trình bày kèm demo / Demo script

> **Phần A:** Tiếng Việt. **Phần B:** English (cùng nội dung với Phần A).
>
> Mỗi bước gồm: **Thao tác** (làm gì trên màn hình), **Lời thoại** (câu nói), **Câu hỏi có thể gặp** (kèm trả lời ngắn).
>
> Dữ liệu demo: chạy `python manage.py seed_real_data --with-ai` vào ngày bảo vệ. Mật khẩu chung `Pass@123`.

---

# PHẦN A — TIẾNG VIỆT

## Chuẩn bị trước giờ trình bày

- **Cửa sổ 1:** đăng nhập `customer_01@marketlink.com` (John Smith), thêm một tab đăng nhập Admin (`admin@marketlink.com`). Admin dùng cổng riêng nên đăng nhập song song được.
- **Cửa sổ 2** (ẩn danh hoặc profile Chrome khác): đăng nhập `farmer_01@marketlink.com` (Thu Duc Fresh Organics).
- farmer_01 sửa kho một món về **30 kg**. Chọn món **chưa có đơn Placed** nào.
- Đơn seed sẵn của farmer_01:
  - **"Demo: mark me ready."**: đơn Accepted của customer_01, đã qua giờ chốt.
  - **"Demo: mark me as no-show."**: đơn Ready của customer_02, đã quá giờ nhận. customer_02 đã có 2 lần No-show.
- Chuẩn bị sẵn ảnh chụp màn hình phòng khi Gemini chậm hoặc lỗi.

---

## 1/ Slide 1–3: Giới thiệu, bài toán, kiến trúc (~1,5 phút)

**Thao tác:** trình chiếu slide 1 → 2 → 3.

**Lời thoại:**
> Kính chào Hội đồng. Chúng tôi là nhóm FPT BitForge, xin trình bày đề tài MarketLink, nền tảng đặt trước nông sản tại chợ truyền thống.
>
> Người mua thường không biết sạp nào bán gì, còn hàng hay không, nên đi chợ mất công mà vẫn có thể không mua được. Nông dân thì thiếu kênh giới thiệu hàng theo lịch bán và nhận đơn trước. MarketLink cho khách tìm hàng, đặt trước theo khung giờ, rồi đến sạp nhận hàng và trả tiền mặt. Theo đề bài, hệ thống không thanh toán online và không giao hàng.
>
> Về kiến trúc: frontend React, backend Django REST, dữ liệu MySQL với InnoDB để dùng transaction và khóa dòng. Redis lo thông báo realtime, giới hạn tần suất, phiên đăng nhập và chống đặt trùng. Gemini đảm nhận các tính năng AI. Hệ thống đã triển khai trên Vercel và Render.

**Câu hỏi có thể gặp:**
- **Vì sao chọn Django + React + MySQL?** Django có sẵn xác thực, phân quyền, ORM và transaction, hợp với hệ thống nhiều nghiệp vụ. React chia giao diện thành component, dễ tách theo vai trò. InnoDB có transaction và khóa dòng, cần cho việc trừ kho chính xác.
- **Khác gì Shopee?** MarketLink không bán hộ, không giao hàng. Nó chỉ số hóa phần thông tin và đặt trước; chợ truyền thống vẫn là nơi giao dịch.

---

## 2/ Slide 4 → chuyển sang web: 4 vai trò (~20 giây)

**Thao tác:** chiếu slide 4 vài giây rồi chuyển sang trình duyệt.

**Lời thoại:**
> Hệ thống có 4 vai trò: khách vãng lai xem chợ, sạp, sản phẩm; khách hàng đặt trước và đánh giá; nông dân quản lý hàng và xử lý đơn; Admin duyệt và quản trị. Để Hội đồng có cái nhìn trực quan và sinh động hơn, nhóm xin phép được trình bày thực tế luồng hoạt động cũng như những tính năng quan trọng và hữu ích nhất của MarketLink ngay trên sản phẩm.

---

## 3/ Đặt hàng + thông báo realtime (~40 giây)

**Thao tác:**
1. Cửa sổ 1 (customer_01): **F12 → Network**, tích **Keep log**, chọn **Fetch/XHR**.
2. Thêm 20 kg món vừa chỉnh kho → Checkout → chọn chợ, ngày, khung giờ → **Confirm**.
3. Chỉ sang cửa sổ 2: farmer_01 nhận thông báo đơn mới ngay.

**Lời thoại:**
> Khách chọn chợ, ngày và khung giờ nhận; hệ thống chỉ hiện những khung giờ còn hợp lệ. Khi khách bấm đặt, màn hình nông dân nhận thông báo ngay lập tức, không cần tải lại trang. Phần này dùng WebSocket qua Redis.

**Câu hỏi có thể gặp:**
- **Khách hàng có nhận realtime không?** Hiện chỉ nông dân nhận realtime qua WebSocket. Khách và Admin nhận thông báo qua cơ chế tự hỏi lại server khoảng 30 giây một lần, kèm email cho các sự kiện quan trọng.
- **WebSocket bảo mật thế nào?** Trước khi kết nối, giao diện xin một vé dùng một lần, sống 30 giây, nên token đăng nhập không nằm trên URL.

---

## 4/ Chống tạo đơn trùng (~40 giây)

**Thao tác:** tab Network → chuột phải dòng **`orders/`** (POST) → **Resend** → mở dòng mới: Response Headers có **`Idempotent-Replayed: true`**, Response có **cùng mã đơn** → mở My orders: vẫn 1 đơn.

**Lời thoại:**
> Ở chợ mạng thường chập chờn, trình duyệt có thể gửi đơn hai lần. Mỗi lần đặt hàng mang một mã duy nhất là Idempotency-Key. Tôi vừa gửi lại đúng request đó: server nhận ra mã đã xử lý, trả lại đúng đơn cũ và đánh dấu là "replayed". Không có đơn thứ hai nào được tạo.

**Câu hỏi có thể gặp:**
- **Key lưu ở đâu?** Ở server, trong Redis, theo dạng `idem:<user_id>:<key>`. Đang xử lý thì giữ 5 phút; xử lý xong thì lưu kết quả 24 giờ, kèm mã băm nội dung đơn.
- **Cùng key mà nội dung khác thì sao?** Server so mã băm và từ chối với thông báo "This request was already submitted".
- **Người dùng có thấy gì không?** Không. Đây là bảo vệ chạy ngầm; người dùng chỉ thấy một lần đặt thành công.
- **Người khác đoán key được không?** Không có tác dụng: key gắn với `user_id`, và là UUID ngẫu nhiên khoảng 122 bit.

---

## 5/ Tạm giữ hàng (stock hold) (~40 giây)

**Thao tác:** customer_01 thêm 15 kg cùng món → Checkout → Confirm → hiện **"Only 10 KG left"**.

**Lời thoại:**
> Kho có 30 kg. Đơn 20 kg vừa rồi chưa được nông dân xác nhận, nhưng hệ thống đã **tạm giữ** 20 kg đó. Nên đặt thêm 15 kg thì bị báo chỉ còn 10. Kho thật vẫn chưa bị trừ; nếu đơn bị từ chối hoặc hết hạn, phần giữ tự trả lại.

**Câu hỏi có thể gặp:**
- **Sao trang sản phẩm vẫn hiện 30?** Đây là lựa chọn của nhóm: đơn đang giữ chưa chắc thành, nên hiện số kho thật để khuyến khích khách đặt. Khi đặt vượt, hệ thống báo chính xác còn bao nhiêu.
- **Giữ hàng bao lâu?** Không theo thời gian cố định: giữ cho tới khi nông dân chấp nhận, từ chối, khách hủy, hoặc đơn hết hạn vì tới giờ nhận mà chưa được duyệt.

---

## 6/ Nông dân Accept → trừ kho + transaction (~50 giây)

**Thao tác:** cửa sổ 2 (farmer_01) → mở đơn 20 kg → **Accept** → mở Products: kho món đó giảm còn 10.

**Lời thoại:**
> Khi nông dân bấm Accept, hệ thống mới trừ kho thật. Toàn bộ chạy trong một transaction: khóa dòng sản phẩm, kiểm tra lại số còn, rồi mới trừ và ghi lịch sử. Nếu có lỗi giữa chừng thì hoàn tác hết, không bao giờ có tình trạng trừ kho mà đơn chưa đổi trạng thái.

**Câu hỏi có thể gặp:**
- **Hai khách bấm đặt đúng cùng một giây thì sao?** Lúc đặt, hệ thống không khóa dòng sản phẩm, nên hiếm khi cả hai đơn có thể được tạo. Chốt chặn thật ở bước Accept: khóa dòng, kiểm tra lại, không đủ hàng thì không trừ. Vì vậy kho không bao giờ âm.
- **Deadlock thì sao?** Hệ thống luôn khóa theo cùng một thứ tự (theo id) để hạn chế; nếu MySQL vẫn báo deadlock thì tự chạy lại giao dịch.
- **Hai người cùng sửa một đơn?** Mỗi đơn có số phiên bản (`version`). Ai gửi với phiên bản cũ sẽ nhận lỗi 409 và phải tải lại.

---

## 7/ Ready → Completed (~25 giây)

**Thao tác:** farmer_01 mở đơn **"Demo: mark me ready."** → **Ready** → **Completed**.

**Lời thoại:**
> Hệ thống kiểm tra mốc thời gian ở server: chỉ được đánh dấu Ready sau giờ chốt, và chỉ được bấm No-show sau khi khung nhận kết thúc. Để demo trong vài phút, nhóm đã chuẩn bị sẵn đơn ở đúng mốc đó.

**Câu hỏi có thể gặp:**
- **Giờ chốt là gì?** Mỗi sạp tự đặt số giờ chốt (mặc định 12 giờ, từ 1 đến 72). Trước giờ chốt khách được sửa / hủy; sau giờ chốt nông dân mới soạn hàng và bấm Ready.
- **Accept có phải chờ giờ chốt không?** Không. Accept được bất cứ lúc nào trước giờ bắt đầu nhận hàng.

---

## 8/ Review + AI kiểm duyệt review (~50 giây)

**Thao tác:**
1. customer_01 mở đơn vừa Completed → **Review**.
2. **Review sản phẩm** (1–2 sao, lời chê thật): *"The vegetables were not fresh and half of them were yellow."*
3. **Review sạp** (lời đe dọa): *"I will come to your stall and wreck everything."*
4. Nói tiếp 5–10 giây → tải lại: review đe dọa có nhãn **"Hidden by AI"**, lời chê vẫn hiện.
5. (Tùy chọn) cửa sổ farmer → Reviews: review bị ẩn có chữ **"Hidden"**, không trả lời được.

**Lời thoại:**
> Sau khi nhận hàng, khách mới được đánh giá. Mỗi review được AI đọc ở chế độ chạy nền. Lời chê thật, dù gay gắt, vẫn được giữ nguyên. Còn lời đe dọa thì AI tự ẩn và gắn nhãn "Hidden by AI". Review bị ẩn không tính vào điểm của sạp, và Admin có thể khôi phục nếu AI ẩn nhầm.

**Câu hỏi có thể gặp:**
- **Review bị ẩn có làm giảm điểm sạp không?** Không. Review ẩn bị loại khỏi mọi điểm số: điểm sạp, điểm sản phẩm, thứ hạng, báo cáo và cờ "sản phẩm kém".
- **Sao không xóa review?** Review ẩn vẫn chiếm chỗ "một đơn, một review", nên khách không viết lại được. Admin cũng giữ được bằng chứng và khôi phục được khi AI sai.
- **AI kiểm tra những gì?** Hai loại: ngôn từ thô tục / xúc phạm / đe dọa, và việc mời liên hệ ngoài nền tảng (số điện thoại, email, link, Zalo). Chắc chắn thì tự ẩn; nghi ngờ thì chỉ gắn cờ cho Admin.
- **AI sai thì sao?** Admin thấy nhãn "Hidden by AI" và bấm Restore.

---

## 9/ Chatbot của khách (~40 giây)

**Thao tác:** customer_01 mở chatbot:
1. *"When and where do I pick up my orders?"* → bot trả về đơn của chính customer_01.
2. Hỏi về một đơn của người khác (ví dụ một mã đơn không phải của mình) → bot không trả thông tin.

**Lời thoại:**
> Chatbot không chỉ trả lời chung chung mà truy vấn dữ liệu thật qua 7 công cụ chỉ đọc. Quyền được kiểm tra ở server theo người đang hỏi, nên khách chỉ thấy đơn của chính mình.

**Câu hỏi có thể gặp:**
- **Function calling là gì?** AI không truy cập CSDL. Nó chỉ xin gọi một hàm đã định nghĩa sẵn; server kiểm tra quyền, chạy hàm rồi trả kết quả cho AI diễn đạt.
- **Có giới hạn câu hỏi không?** Có: 20 câu mỗi phút, 30 câu mỗi ngày cho khách vãng lai, 100 câu mỗi ngày cho tài khoản đăng nhập.
- **Lừa được AI bằng prompt injection không?** Nội dung người dùng được coi là dữ liệu; AI chỉ dùng được công cụ chỉ đọc và đúng quyền, nên dù bị lừa cũng không lấy được dữ liệu người khác.

---

## 10/ AI kiểm duyệt đăng sản phẩm (~50 giây)

**Thao tác:** farmer_01 → Products → thêm sản phẩm mới:
1. Gõ mô tả có số điện thoại, hoặc giá vô lý → **cảnh báo hiện ngay** (precheck).
2. Gửi tin → tin chờ AI duyệt.

**Lời thoại:**
> Tin đăng phải qua kiểm duyệt trước khi lên sàn, có 2 lớp. Lớp luật kiểm tra giá so với khung giá danh mục, độ lệch với giá các sạp khác và kho bất thường. Lớp Gemini đọc cả chữ và ảnh để phát hiện hàng không phải nông sản, sai danh mục, hay liên hệ ngoài sàn. Nông dân thấy cảnh báo ngay khi đang gõ. Tin sạch thì tự duyệt, tin vi phạm thì bị giữ lại cho Admin.

**Câu hỏi có thể gặp:**
- **Gemini lỗi hoặc hết quota thì sao?** Tự chuyển sang model dự phòng. Vẫn lỗi thì tin không được tự duyệt mà chuyển vào hàng chờ Admin.
- **Sao cần lớp luật?** AI không biết giá chợ hôm nay; luật kiểm tra con số rẻ và chính xác hơn. Nếu luật đã thấy vi phạm rõ thì không gọi AI, tiết kiệm quota.
- **Sửa tin đã duyệt có phải duyệt lại không?** Sửa tên, mô tả, ảnh, danh mục thì phải duyệt lại. Sửa giá và kho thì không.

---

## 11/ Chatbot của nông dân (~25 giây)

**Thao tác:** farmer_01 hỏi chatbot: *"Which orders are waiting for me? Which items are running low?"*

**Lời thoại:**
> Với nông dân, chatbot tổng hợp đơn chờ duyệt, đơn đã nhận, đơn quá hạn và hàng sắp hết, chỉ trong phạm vi sạp của chính họ.

**Câu hỏi có thể gặp:**
- **Nông dân xem được sạp khác không?** Không. Các công cụ của nông dân chỉ trả dữ liệu của sạp đang đăng nhập.

---

## 12/ Khách không đến lấy hàng → tự khóa (~40 giây)

**Thao tác:** farmer_01 mở đơn **"Demo: mark me as no-show."** (customer_02) → **No-show**.

**Lời thoại:**
> Mô hình trả tiền mặt khi nhận, không đặt cọc, nên rủi ro lớn nhất của nông dân là khách đặt rồi không đến. Khi khách không đến, nông dân bấm No-show và hàng quay lại kho để bán cho người khác. Khách này đã có 2 lần không đến trong 30 ngày; đây là lần thứ ba, nên tài khoản bị khóa tự động và các đơn đang mở của khách bị hủy.

**Câu hỏi có thể gặp:**
- **Nông dân bấm No-show sai để hại khách thì sao?** Nông dân không có lợi gì khi làm vậy. Khách có thể khiếu nại; Admin xem lịch sử, mở khóa (bộ đếm tính lại từ đầu) và xử lý sạp gian lận. Hướng phát triển: mã QR / OTP khi nhận hàng.
- **Còn giới hạn nào chống đặt ảo?** Mỗi khách tối đa 10 đơn chờ duyệt và 10 lần đặt mỗi giờ; một số điện thoại chỉ một tài khoản; tài khoản nông dân không đặt hàng được.

---

## 13/ Admin: khách bị khóa, chatbot, AI Decisions, Audit Log (~1 phút)

**Thao tác** (tab Admin):
1. **Customers** → customer_02 bị khóa, có lý do và danh sách đơn đã bỏ.
2. **Chatbot:** *"What needs my attention today? Are there risky customers or invalid listings?"*
3. **AI Decisions** → quyết định của AI cho tin vừa đăng ở bước 10.
4. **Security Audit Logs** → dòng `CUSTOMER_AUTO_LOCKED`, review bị AI ẩn.

**Lời thoại:**
> Admin thấy ngay customer_02 bị khóa kèm lý do. Chatbot Admin báo số khách rủi ro, số cờ vi phạm và số tin chờ duyệt; nó chỉ báo con số, không xuất danh sách cá nhân và không thay Admin ra quyết định. Trang AI Decisions cho Admin hậu kiểm từng quyết định của AI. Cuối cùng, Audit Log ghi lại các thao tác vừa rồi: ai làm, lúc nào, từ IP nào và vì sao.

**Câu hỏi có thể gặp:**
- **Audit Log có sửa / xóa được không?** Web không có chức năng sửa hay xóa log.
- **Quyết định duyệt tin của AI có trong Audit Log không?** Không; nó nằm ở trang AI Decisions. Audit Log ghi thao tác quản trị và việc AI ẩn review.
- **Có lịch sử thay đổi dữ liệu không?** Có: Change History lưu từng trường bị sửa, từ giá trị cũ sang mới.

---

## 14/ Kết luận: slide 9 (~20 giây)

**Lời thoại:**
> Tóm lại, MarketLink kết nối người mua, nông dân và Admin trong một quy trình đặt trước thực tế, ứng dụng AI có kiểm soát, và được thiết kế để đáng tin cậy: không bán vượt kho, không tạo đơn trùng, chống đặt ảo. Ngoài ra còn các tính năng như đóng chợ khẩn cấp, xem trước tác động, yêu cầu thay đổi đơn và bỏ từng món hết hàng. Xin cảm ơn Hội đồng, nhóm sẵn sàng nhận câu hỏi.

**Câu hỏi chung có thể gặp:**
- **Phần nào là đề bài, phần nào làm thêm?** Đề bài: đăng ký, tìm kiếm, bản đồ, đặt trước theo khung giờ, sửa / hủy trước giờ chốt, quản lý sản phẩm và đơn, duyệt, kiểm duyệt, báo cáo, thông báo, đánh giá. Làm thêm: tạm giữ hàng, chống đặt trùng, vòng đời đơn 8 trạng thái, No-show và tự khóa, AI kiểm duyệt 2 lớp, chatbot cho 4 vai trò, realtime, Audit Log, đóng chợ khẩn cấp…
- **Hạn chế và hướng phát triển?** Chưa tách được món của một sạp ra 2 chợ trong một lần đặt; chưa có điểm uy tín người bán; giỏ hàng chỉ lưu trên trình duyệt; realtime mới có cho nông dân. Hướng phát triển: mã QR / OTP khi nhận hàng, điểm uy tín, ứng dụng di động.

---
---

# PART B — ENGLISH

## Before the presentation

- **Window 1:** sign in as `customer_01@marketlink.com` (John Smith), plus one Admin tab (`admin@marketlink.com`). Admin has its own portal, so both sessions work side by side.
- **Window 2** (incognito or another Chrome profile): sign in as `farmer_01@marketlink.com` (Thu Duc Fresh Organics).
- farmer_01 sets one product's stock to **30 kg**. Pick a product with **no Placed orders**.
- Seeded orders of farmer_01:
  - **"Demo: mark me ready."**: customer_01's Accepted order, already past the cutoff.
  - **"Demo: mark me as no-show."**: customer_02's Ready order, pickup window already over. customer_02 already has 2 no-shows.
- Keep screenshots ready in case Gemini is slow or fails.

---

## 1/ Slides 1–3: Introduction, problem, architecture (~1.5 min)

**Action:** present slides 1 → 2 → 3.

**Script:**
> Good morning, members of the panel. We are team FPT BitForge, and we present MarketLink, a pre-order platform for traditional markets.
>
> Buyers often do not know which stall sells what, or whether it is still in stock, so they may travel to the market for nothing. Farmers have no channel to show their produce by selling day or to take orders in advance. With MarketLink, customers find produce, pre-order for a pickup time, then collect it at the stall and pay cash. As the brief requires, there is no online payment and no delivery.
>
> For the architecture: React on the front end, Django REST on the back end, and MySQL with InnoDB for transactions and row locks. Redis handles realtime notifications, rate limits, sessions and duplicate-order protection. Gemini powers the AI features. The system is deployed on Vercel and Render.

**Possible questions:**
- **Why Django, React and MySQL?** Django gives authentication, permissions, an ORM and transactions out of the box, which suits a system with many business rules. React splits the interface into components by role. InnoDB provides transactions and row locks, which we need to keep stock exact.
- **How is this different from Shopee?** MarketLink does not sell or deliver. It digitises the information and the pre-order; the traditional market is still where the trade happens.

---

## 2/ Slide 4 → switch to the website: four roles (~20 s)

**Action:** show slide 4 briefly, then switch to the browser.

**Script:**
> There are four roles: guests browse markets, stalls and products; customers pre-order and review; farmers manage stock and process orders; Admin approves and manages the platform. To give the panel a clearer and more vivid picture, we would like to present MarketLink's workflow and its most important and useful features live, directly on the product.

---

## 3/ Placing an order + realtime notification (~40 s)

**Action:**
1. Window 1 (customer_01): **F12 → Network**, tick **Keep log**, choose **Fetch/XHR**.
2. Add 20 kg of the prepared product → Checkout → choose market, date, time slot → **Confirm**.
3. Point to window 2: farmer_01 receives the new-order notification instantly.

**Script:**
> The customer picks a market, a date and a pickup slot; only valid slots are offered. As soon as the order is placed, the farmer's screen shows it instantly, without reloading. This uses WebSocket through Redis.

**Possible questions:**
- **Do customers get realtime notifications too?** Right now only farmers get realtime via WebSocket. Customers and Admin get notifications by polling the server about every 30 seconds, plus email for important events.
- **How is the WebSocket secured?** Before connecting, the page asks for a one-time ticket that lives 30 seconds, so the login token never appears in the URL.

---

## 4/ Duplicate-order protection (~40 s)

**Action:** Network tab → right-click the **`orders/`** POST row → **Resend** → open the new row: Response Headers show **`Idempotent-Replayed: true`**, the Response has the **same order id** → open My orders: still one order.

**Script:**
> At a market the network is often unstable, so the browser may send an order twice. Every checkout carries a unique Idempotency-Key. I have just resent the exact same request: the server recognised the key, returned the same order and marked the answer as "replayed". No second order was created.

**Possible questions:**
- **Where is the key stored?** On the server, in Redis, as `idem:<user_id>:<key>`. While processing it is kept 5 minutes; once done, the result is kept 24 hours together with a hash of the order.
- **Same key, different order content?** The server compares the hash and rejects it with "This request was already submitted".
- **Does the user see anything?** No. It is a silent protection; the user simply sees one successful order.
- **Can someone guess another user's key?** It would not help: the key is tied to the user id and is a random UUID of about 122 bits.

---

## 5/ Stock hold (~40 s)

**Action:** customer_01 adds 15 kg of the same product → Checkout → Confirm → **"Only 10 KG left"**.

**Script:**
> Stock is 30 kg. The 20 kg order is not confirmed by the farmer yet, but the system already **holds** those 20 kg. So ordering 15 more is refused: only 10 are left. Real stock has not been deducted; if the order is declined or expires, the hold is released automatically.

**Possible questions:**
- **Why does the product page still show 30?** That is our choice: a held order may not go through, so we show the real stock to encourage ordering. If a customer orders too much, the system says exactly how much is left.
- **How long is stock held?** Not for a fixed time: until the farmer accepts or declines, the customer cancels, or the order expires because pickup started before it was accepted.

---

## 6/ Farmer accepts → stock deducted + transaction (~50 s)

**Action:** window 2 (farmer_01) → open the 20 kg order → **Accept** → open Products: that product's stock drops to 10.

**Script:**
> Real stock is deducted only when the farmer accepts. Everything runs in one transaction: the product row is locked, stock is checked again, then it is deducted and the history is written. If anything fails halfway, everything is rolled back, so stock never changes without the order changing too.

**Possible questions:**
- **What if two customers order at exactly the same second?** At checkout the product row is not locked, so in rare cases both orders can be created. The real safeguard is at Accept: lock the row, check again, and refuse to deduct if there is not enough. So stock can never go negative.
- **What about deadlocks?** Rows are always locked in the same order, by id, to avoid them; if MySQL still reports a deadlock, the transaction is retried automatically.
- **Two people editing the same order?** Each order has a version number. A request with an old version gets a 409 error and must reload.

---

## 7/ Ready → Completed (~25 s)

**Action:** farmer_01 opens **"Demo: mark me ready."** → **Ready** → **Completed**.

**Script:**
> Time rules are enforced on the server: an order can be marked Ready only after the cutoff, and No-show only after the pickup window ends. To demo this in a few minutes, we prepared orders that are already past those points.

**Possible questions:**
- **What is the cutoff?** Each stall sets its own cutoff hours (12 by default, from 1 to 72). Before the cutoff the customer can edit or cancel; after it the farmer prepares the order and marks it Ready.
- **Does Accept have to wait for the cutoff?** No. Accept is allowed any time before the pickup starts.

---

## 8/ Review + AI review moderation (~50 s)

**Action:**
1. customer_01 opens the completed order → **Review**.
2. **Product review** (1–2 stars, honest complaint): *"The vegetables were not fresh and half of them were yellow."*
3. **Stall review** (threat): *"I will come to your stall and wreck everything."*
4. Keep talking 5–10 seconds → reload: the threat shows **"Hidden by AI"**, the complaint stays.
5. (Optional) farmer window → Reviews: the hidden review is marked **"Hidden"** and cannot be answered.

**Script:**
> Customers can review only after pickup. Every review is read by the AI in the background. An honest complaint, however harsh, stays public. A threat is hidden automatically and labelled "Hidden by AI". A hidden review does not count in the stall's rating, and Admin can restore it if the AI was wrong.

**Possible questions:**
- **Does a hidden review lower the stall's rating?** No. Hidden reviews are excluded from every score: the stall's and product's rating, the ranking, reports and the low-rating flag.
- **Why not delete it?** The hidden review still occupies the order's single review slot, so the customer cannot post another one. Admin also keeps it as evidence and can restore it.
- **What does the AI check?** Two things: offensive, insulting or threatening language, and invitations to trade off the platform (phone, email, link, messaging app). If certain, it hides the review; if unsure, it only flags it for Admin.
- **What if the AI is wrong?** Admin sees the "Hidden by AI" label and clicks Restore.

---

## 9/ Customer chatbot (~40 s)

**Action:** customer_01 opens the chatbot:
1. *"When and where do I pick up my orders?"* → the bot answers with customer_01's own orders.
2. Ask about someone else's order (for example an order number that is not yours) → the bot gives no information.

**Script:**
> The chatbot does not just give general answers: it queries real data through seven read-only tools. Permissions are checked on the server for the person asking, so a customer only sees their own orders.

**Possible questions:**
- **What is function calling?** The AI never touches the database. It can only ask to call a predefined function; the server checks permissions, runs it and returns the result for the AI to phrase.
- **Is there a question limit?** Yes: 20 per minute, 30 per day for guests and 100 per day for signed-in users.
- **Can prompt injection trick it?** User text is treated as data, and the AI can only use read-only tools within the user's permissions, so even if tricked it cannot reach other people's data.

---

## 10/ AI moderation of a new listing (~50 s)

**Action:** farmer_01 → Products → add a new product:
1. Type a phone number in the description, or an unrealistic price → a **warning appears immediately** (precheck).
2. Submit → the listing waits for the AI review.

**Script:**
> Listings are moderated before they go public, in two layers. The rule layer checks the price against the category's range, how far it is from other stalls' prices, and unusual stock. Gemini reads the text and photos to catch non-produce items, wrong categories or off-platform contact. Farmers see the warning while typing. Clean listings are approved automatically; problematic ones are held for Admin.

**Possible questions:**
- **What if Gemini fails or runs out of quota?** It switches to a fallback model. If that also fails, the listing is not auto-approved; it goes to the Admin queue.
- **Why have a rule layer at all?** The AI does not know today's market prices; rules check numbers cheaply and exactly. If the rules already find a clear violation, the AI is not called, which saves quota.
- **Does editing an approved listing need review again?** Editing the name, description, photo or category does. Editing price or stock does not.

---

## 11/ Farmer chatbot (~25 s)

**Action:** farmer_01 asks the chatbot: *"Which orders are waiting for me? Which items are running low?"*

**Script:**
> For farmers, the chatbot summarises pending, accepted and overdue orders and low-stock items, only for their own stall.

**Possible questions:**
- **Can a farmer see another stall's data?** No. The farmer's tools only return data of the signed-in stall.

---

## 12/ Customer no-show → automatic lock (~40 s)

**Action:** farmer_01 opens **"Demo: mark me as no-show."** (customer_02) → **No-show**.

**Script:**
> Customers pay cash at pickup with no deposit, so the biggest risk for farmers is people who order and never come. The farmer marks No-show and the stock goes back on sale. This customer already had two no-shows in 30 days; this is the third, so the account is locked automatically and their open orders are cancelled.

**Possible questions:**
- **What if a farmer marks No-show unfairly?** The farmer gains nothing from it. The customer can complain; Admin checks the history, unlocks the account (the counter starts again) and deals with the stall. Next step: a QR code or OTP at pickup.
- **Other limits against fake orders?** At most 10 orders awaiting confirmation and 10 checkouts per hour per customer; one phone number per account; farmer accounts cannot place orders.

---

## 13/ Admin: locked customer, chatbot, AI Decisions, Audit Log (~1 min)

**Action** (Admin tab):
1. **Customers** → customer_02 is locked, with the reason and the abandoned orders.
2. **Chatbot:** *"What needs my attention today? Are there risky customers or invalid listings?"*
3. **AI Decisions** → the AI's decision on the listing from step 10.
4. **Security Audit Logs** → the `CUSTOMER_AUTO_LOCKED` entry and the review hidden by AI.

**Script:**
> Admin immediately sees customer_02 locked, with the reason. The Admin chatbot reports how many risky customers, open flags and pending listings there are; it only gives counts, never personal lists, and it never makes decisions for Admin. The AI Decisions page lets Admin review every AI decision. Finally, the Audit Log records what just happened: who did it, when, from which IP and why.

**Possible questions:**
- **Can the Audit Log be edited or deleted?** The website has no function to edit or delete log entries.
- **Are the AI's listing decisions in the Audit Log?** No, they are on the AI Decisions page. The Audit Log records admin actions and reviews hidden by AI.
- **Is there a history of data changes?** Yes: Change History stores every edited field, from the old value to the new one.

---

## 14/ Conclusion: slide 9 (~20 s)

**Script:**
> To sum up, MarketLink connects buyers, farmers and Admin in a realistic pre-order flow, uses AI under control, and is built to be reliable: no overselling, no duplicate orders, protection against fake orders. It also offers emergency market closure, impact preview, order change requests and removing sold-out items. Thank you, members of the panel. We are ready for your questions.

**General questions:**
- **What was required and what did you add?** Required: registration, search, maps, pre-orders by time slot, edit / cancel before cutoff, product and order management, approvals, moderation, reports, notifications, reviews. Added: stock hold, duplicate-order protection, an 8-status order lifecycle, no-show handling with automatic lock, two-layer AI moderation, a chatbot for all four roles, realtime notifications, Audit Log, emergency market closure, and more.
- **Limitations and next steps?** One stall's items cannot yet be split across two markets in one checkout; there is no seller reputation score yet; the cart is stored only in the browser; realtime is only for farmers. Next: QR / OTP at pickup, a reputation score, a mobile app.
