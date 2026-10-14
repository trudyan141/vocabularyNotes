# Dùng chung thư viện trên máy vợ và máy khác

Ngày: **15/10/2026**. Dành cho founder. **Đã cập nhật theo góp ý founder: Share trong Settings, email đã đăng ký app, notifications A/B, mã10chữ/số, QR và phiên học3ngày, người nhận chỉ được học. A/B đã triển khai theo lệnh làm tiếp15/10; xem flow và evidence.**

**Bản chi tiết mới để duyệt A/B:** [màn hình và flow cho founder](CHIA-SE-THU-VIEN-FLOW-FOUNDER.md). [Hướng dẫn triển khai cho Codex](ai/LIBRARY-SHARING-IMPLEMENTATION-PLAN.md) đã được chuẩn bị riêng, đã có code. File này giữ phần so sánh phương án; khi duyệt trải nghiệm A/B dùng bản flow mới.

## 1. Hướng đã cập nhật theo góp ý

**Trong Settings có nút Share (Chia sẻ thư viện), gồm hai cách: nhập một/nhiều email hoặc tạo QR/mã kết nối cho máy khác. Người nhận chỉ được học; chủ thư viện vẫn là người soạn và quản lý.** Không cần mở ngay hệ thống user/password riêng hoặc phụ thuộc email reset của app.

Ví dụ sau khi làm:

- Bố soạn từ và ngữ pháp trên máy bố như hiện tại.
- Bố vào Settings → Share, nhập email Google của vợ và những người khác muốn chia sẻ. Họ dùng tài khoản riêng, chọn thư viện được chia sẻ để học. Kho riêng của họ vẫn giữ nguyên.
- Bố vào cùng màn Share, tạo QR/mã. Máy mượn quét QR hoặc nhập mã để nhận phiên học **3 ngày**, không đăng nhập Google của bố. Mỗi QR/mã kết nối thành công một máy; muốn thêm máy thì tạo mã mới.
- Mỗi Google account có một kho/tiến độ của mình. Người nhận A/B học tiếp tiến độ của kho được share, không chọn nhiều bé; kho riêng của họ vẫn giữ tiến độ riêng của kho đó.
- Từ và ngữ pháp mới đã lưu/đồng bộ lên cloud tự cập nhật cho các bên nhận còn quyền, không share lại. Bên nhận mã/QR không cần đăng nhập, vẫn đọc/học/lưu tiến độ chung trong phiên3ngày.

**Thứ tự nên làm:** chia sẻ cho tài khoản vợ trước; ghép thiết bị sau. Nếu nhu cầu trước mắt chủ yếu là máy mượn không đăng nhập Google nào, có thể ưu tiên ghép thiết bị trước, nhưng phần quản lý quyền vẫn phải làm đầy đủ.

## 2. Vì sao thêm trang đăng ký chưa giải quyết hết?

Hiện app dùng Google để biết **ai đang đăng nhập**, rồi chỉ mở thư viện cloud thuộc người đó. Đổi sang email/password chỉ đổi cách đăng nhập; nếu vẫn “mỗi tài khoản một thư viện”, tài khoản của vợ vẫn không thấy bài của bố.

Cần tách ba việc:

| Việc | Ví dụ trong gia đình |
|---|---|
| Ai được vào thư viện? | Bố, vợ, máy học đã được kết nối |
| Người đó được làm gì? | Chủ thư viện soạn/quản lý; người nhận chỉ được học |
| Tiến độ nào đang dùng? | Tiến độ chung của đúng kho được share; kho riêng người nhận không bị trộn |

Một thư viện có thể được nhiều tài khoản/máy sử dụng, nhưng vẫn có người quản lý và quyền rõ ràng. Không cần chuyển toàn bộ dữ liệu sang một tài khoản mới.

Nhận định hiện trạng dựa trên code đăng nhập và đồng bộ trong repo. Chưa mở tài khoản thật hay kiểm kê nội dung cloud của founder trong lần lập plan này.

## 3. Các phương án có thể chọn

| Phương án | Trải nghiệm | Email của app | Đồng bộ bài mới | Đánh giá |
|---|---|---|---|---|
| **A. Share cho một/nhiều email Google** | Nhập email trong Settings; người nhận login Google riêng, chọn thư viện để học | Không cần cho luồng này | Có, sau khi xây quyền chia sẻ | **Nên làm đầu tiên cho máy vợ** |
| **B. Share bằng QR/mã kết nối** | Tạo QR/mã trong Settings; máy nhận có phiên chỉ học 3 ngày | Không cần | Có, sau khi xây ghép máy | **Nên thêm cho máy con/máy mượn** |
| C. Link học riêng tư | Gửi link, mở là vào phần bài được chia sẻ | Không cần | Có thể theo bài gốc hoặc bản chụp, phải chọn rõ | Hợp khi chỉ cần phát bài; link dễ bị chuyển tiếp |
| D. Xuất/nhập file | Chuyển bản sao bài sang máy khác | Không cần | Không tự đồng bộ | Cách tạm thời; một phần công cụ đã có |
| E. Email + mật khẩu + dịch vụ gửi mail miễn phí | Đăng ký, login, quên mật khẩu nhận mail | Có, trong quota | Có, nhưng vẫn cần quyền chia sẻ | Hợp nếu nhiều người muốn tài khoản riêng ngoài Google |
| F. Username + mật khẩu + mã khôi phục | Không dùng email; phải tự giữ mã cứu tài khoản | Không cần | Có, nhưng vẫn cần quyền chia sẻ | Vận hành và cứu tài khoản khó hơn |
| G. Passkey: vân tay/Face ID/PIN thiết bị | Đăng nhập không gõ mật khẩu | Không cần cho mỗi lần login | Có, nhưng vẫn cần quyền chia sẻ | Đáng cân nhắc sau; Supabase hiện còn thử nghiệm |

A/B/C/E/F/G chưa phải tính năng có sẵn trong app. Bảng là lựa chọn sản phẩm, không phải cam kết đã hoạt động.

## 4. A — Nút Share trong Settings, nhập một hoặc nhiều email

Chủ thư viện mở **Settings → Share (Chia sẻ thư viện)**. Trên màn này có hai phần **Chia sẻ qua email** và **Chia sẻ bằng QR/mã**.

Luồng chia sẻ qua email:

1. Chọn thư viện đang muốn chia sẻ; hiện rõ tên và tài khoản chủ thư viện.
2. Nhập một hoặc nhiều địa chỉ email Google đã đăng ký app. Có thể nhập từng email hoặc dán danh sách; app kiểm tra định dạng, bỏ email lặp và báo email cần sửa ngay tại ô nhập.
3. Bấm **Chia sẻ quyền học**. Danh sách hiện từng người và trạng thái Đang chờ nhận/Đã nhận/Đã thu hồi; kết quả từng email rõ ràng nếu có lỗi.
4. Người nhận đăng nhập Google riêng, thấy lời mời trong **chuông Thông báo** và **Được chia sẻ với tôi**, bấm nhận rồi vào học. Có thể copy link để gửi nhắc người nhận, nhưng app không cần gửi email tự động.
5. Chủ thư viện có thể thu hồi từng email. Người nhận không được chia sẻ tiếp hoặc cấp quyền cho máy/người khác.

Nhập email là cấp quyền cho đúng tài khoản, không tạo tài khoản mới hoặc cho một tài khoản bất kỳ cầm link vào. Theo góp ý mới, nếu email chưa đăng ký app thì báo riêng và chưa tạo lời mời; người đó đăng nhập Google trong app trước rồi chủ kho gửi lại. Thông báo lưu trong app cho đúng tài khoản, không gửi thư Gmail. Không cần thêm họ vào team Supabase. **“Đã chia sẻ quyền học” không có nghĩa app đã gửi email.**

### Nếu người nhận đã có kho riêng thì sao?

**Giữ hai kho tách biệt, cho chọn kho đang học. Không gộp hoặc ghi đè.**

Ví dụ vợ đã có 50 từ trong kho của vợ, bố chia sẻ kho có 200 từ và ngữ pháp:

| Kho hiển thị | Nội dung và quyền của vợ |
|---|---|
| **Thư viện của tôi** | Vẫn có 50 từ cũ; vợ được thêm/sửa/xóa kho do mình sở hữu như trước |
| **Thư viện của bố — Được chia sẻ · Chỉ học** | Xem và học 200 từ/ngữ pháp của bố; không thêm/sửa/xóa hoặc quản lý chia sẻ |

Vợ chọn kho nào thì tìm kiếm, danh sách bài và game dùng kho đó. Luôn hiện tên kho và nhãn **Chỉ học** khi đang trong kho được chia sẻ, tránh tưởng mình đang sửa kho riêng. Nếu có nhiều người chia sẻ thì mỗi kho là một lựa chọn riêng, có tên chủ sở hữu.

Bố thêm/sửa bài thì người nhận thấy bản cập nhật khi đồng bộ, không phải gửi lại kho. Bố thu hồi thì kho được chia sẻ không còn truy cập cloud; 50 từ trong kho riêng của vợ vẫn còn nguyên. Không tự chuyển bài của bố vào kho vợ hoặc trộn kết quả học giữa các kho.

### Quyền đã chốt theo góp ý

| Người dùng | Được làm gì? |
|---|---|
| Chủ thư viện | Soạn/sửa/xóa bài của mình, chia sẻ và thu hồi email/thiết bị |
| Người nhận qua email hoặc QR | Đọc bài, nghe, chơi và ôn; chỉ ghi tiến độ của tiến độ của kho được cấp |

**Bỏ đề xuất “Cùng soạn” và cấp thêm người quản lý trong phạm vi này.** Người nhận không sửa từ, nghĩa, ví dụ, ngữ pháp, ảnh, nhóm/bài; không xóa dữ liệu gốc hoặc chia sẻ tiếp. Quyền chỉ học phải được bảo vệ tại nơi lưu dữ liệu, không chỉ ẩn nút sửa trên màn hình.

“Read-only” áp dụng cho **nội dung thư viện được chia sẻ**. Game/ôn vẫn ghi kết quả vào **tiến độ chung của kho được share**, không sửa bài gốc hoặc progress kho khác. Không tạo tiến độ riêng cho từng người nhận. Nếu read-only cả tiến độ thì app chỉ cho học và không lưu kết quả, không phù hợp mục tiêu học tiếp qua nhiều máy.

Đề xuất A giữ quyền học đến khi chủ thư viện thu hồi, độc lập với thời hạn đăng nhập thông thường. **Mốc 3 ngày ở phần B áp dụng cho phiên máy nhận QR**, không tự cắt quyền email sau 3 ngày.

Khôi phục tài khoản Google do Google xử lý; app không gửi mail reset cho luồng này. Supabase đã hỗ trợ [đăng nhập Google](https://supabase.com/docs/guides/auth/social-login/auth-google).

## 5. B — Trong cùng màn Share có QR/mã, phiên học 3 ngày

**Chủ thư viện tạo QR ở Settings → Share**, để máy nhận mở thư viện mà không login Google của chủ. Máy không có camera/TV mở app → **Nhập mã kết nối**, gõ mã10ký tự chữ/số và bấm **Nhập mã**. Ví dụ `K7M3P-9R2TX`, bỏ gạch là10ký tự; gõ chữ thường hoặc bỏ dấu gạch vẫn được.

Phần QR/mã có thêm ô **Email nhận thông báo trong app — không bắt buộc** cho một/nhiều email đã đăng ký. Có email thì mỗi người nhận một QR/mã riêng trong chuông; bỏ trống vẫn tạo mã trực tiếp cho TV. Mở thông báo chỉ xem trước, có thể xem/copy mã để nhập trên TV, chưa dùng mất mã. Chỉ Kết nối thành công mới cấp72giờ; notify B không tự cấp quyền A lâu dài. Không SMTP.

Luồng dự kiến:

1. Chủ thư viện kiểm đúng kho rồi chọn **Tạo QR/mã**; không chọn/tạo bé hoặc hồ sơ học khác. Màn hình ghi rõ tên thư viện, **Chỉ học**, **Phiên học: 3 ngày**.
2. Máy nhận quét QR hoặc nhập mã. App hiện thư viện và nút **Kết nối để học**; cần mạng để nhận phiên.
3. Kết nối thành công thì máy nhận có phiên riêng của app, bắt đầu tính **72 giờ từ lúc kết nối thành công**. QR/mã cũ chuyển thành Đã dùng.
4. Trong 72 giờ, cùng trình duyệt trên máy đó có thể đóng/mở app để học tiếp, miễn còn phiên, chưa bị chủ thư viện thu hồi và chưa xóa dữ liệu trình duyệt.
5. Hết 72 giờ, app yêu cầu kết nối lại bằng QR/mã mới. Chủ thư viện có thể tạo mã mới sớm hơn hoặc ngắt từng máy trong màn Share.

### “Một lần” khác “3 ngày” thế nào?

| Mốc | Ý nghĩa | Ví dụ |
|---|---|---|
| **QR/mã chỉ dùng một lần** | Một lần kết nối thành công cấp phiên cho một trình duyệt trên một máy; không phải chỉ học được một lần | Máy vợ đã kết nối thì máy ông bà không dùng lại mã đó; bố tạo mã khác |
| **Thời hạn nhận QR/mã** | Thời gian mã chưa dùng còn cho phép kết nối; đề xuất 15 phút | Tạo mã nhưng chưa ai nhận, quá 15 phút thì tạo lại |
| **Phiên học 3 ngày** | Máy đã kết nối được học tiếp trong 72 giờ | Kết nối 09:00 ngày 15/10 thì hết phiên 09:00 ngày 18/10 |

Chỉ quét để mở màn xem trước chưa tiêu thụ mã; mã chuyển Đã dùng khi kết nối thành công. Đóng/mở app hoặc học nhiều lượt không tiêu thụ thêm mã. Hoạt động hằng ngày không tự kéo dài mốc 72 giờ; muốn thêm 3 ngày thì chủ thư viện cấp kết nối mới. Mốc 15 phút là đề xuất cho bước nhận mã, có thể đổi sau; không làm phiên học bị rút xuống 15 phút.

Muốn chia sẻ cho ba máy thì tạo ba QR/mã riêng. Danh sách **Thiết bị được kết nối** hiển thị tên máy có thể tự đặt, tiến độ chung của kho, lúc kết nối, lúc hết hạn và nút **Ngắt kết nối**. Cách này giúp thu hồi đúng máy, không phải đổi một mã chung cho cả nhà.

QR/mã là quyền kết nối cho người đang giữ mã; chỉ đưa cho máy/người muốn chia sẻ. Nếu gửi nhầm mã chưa dùng, chủ thư viện có thể hủy ngay. Người chỉ có quyền học không được tạo QR từ thư viện đó. Nếu máy nhận đã login tài khoản có kho riêng, phiên QR vẫn là kho được chia sẻ riêng, không thay phiên Google hoặc gộp kho của họ.

**Giới hạn cần hiểu:** chủ thư viện phải có quyền truy cập app để tạo mã mới. Thu hồi/hết hạn chặn quyền cloud; app kiểm thời hạn để không chủ động cho học tiếp qua phiên đã hết hạn và dọn cache khi kết thúc/nhận lệnh thu hồi. Tuy nhiên không bảo đảm xóa từ xa ngay nội dung đã tải trên máy offline hoặc thu lại bản sao người dùng đã giữ. Đóng trình duyệt cũng không bảo đảm kết quả vừa học đã lên cloud; cần trạng thái chờ đồng bộ rõ ràng.

B cần xây phiên thiết bị và quyền truy cập mới; không phải bật một nút QR trong Supabase là xong. [Tài khoản ẩn danh Supabase](https://supabase.com/docs/guides/auth/auth-anonymous) chỉ là một thành phần có thể nghiên cứu; tự nó không cấp quyền vào thư viện bố hoặc khôi phục danh tính sau logout/xóa dữ liệu/đổi máy. Cấp lại phiên cho cùng kho tiếp tục tiến độ chung đã lưu; không tạo tài khoản/progress mới. Founder đã xác nhận bên nhận không login: chỉ cần mã/QR hợp lệ; email chỉ dùng cho notification optional.

## 6. C và D — Chỉ chuyển bài cho người khác học

**Link học riêng tư:** phù hợp nếu muốn gửi một bộ từ/ngữ pháp cho ông bà, gia sư hoặc bạn bè. Chỉ chia sẻ phần đã chọn, không đưa cả thư viện/lịch sử của con lên link. Có hạn dùng và nút thu hồi. Người giữ link có thể chuyển tiếp nó, nên link mở trực tiếp không có mức kiểm soát danh tính như lời mời A.

Trong scope A/B đã chốt, verified account membership hoặc phiên QR/mã cấp quyền vào đúng library nguồn, nên các máy dùng tiến độ chung của library đó mà không cần hồ sơ bé riêng. Chọn rõ bài cập nhật theo bản gốc hay là bản sao tại thời điểm gửi; trong phạm vi đã chốt, người nhận chỉ học bản được chia sẻ; không có quyền sửa bài gốc.

**Xuất/nhập file:** dùng để chuyển bản sao hoặc dự phòng khi không cần đồng bộ. App đã có backup, nhưng không nên hứa “xuất hết rồi nhập là học ngay”: bản text nhẹ không chứa ảnh/lịch sử; bản archive đầy đủ hiện có yêu cầu thư viện đích trống và duyệt lại nội dung sau phục hồi. Ngữ pháp/ảnh của bộ bài thật cần kiểm đúng loại backup trước khi chọn cách này. Xem [quy tắc backup hiện tại](06-data-and-sync.md).

File chuyển đi không tự nhận bài bố thêm ngày mai, và bố không tự nhận kết quả học trên máy đó. Nếu cần chia sẻ bản sao thường xuyên, nên làm gói **Xuất bài học** dễ dùng riêng thay vì tận dụng backup toàn thư viện.

## 7. Có thể làm user/password miễn phí và reset bằng email không?

**Có thể trong giới hạn gói miễn phí. Không phải cứ reset mật khẩu là bắt buộc trả phí gửi mail.**

Supabase có dịch vụ gửi email mặc định, nhưng tài liệu hiện tại nói dịch vụ đó chỉ gửi tới địa chỉ thuộc team dự án, giới hạn **2 email/giờ**, dùng cho thử nghiệm và không bảo đảm giao thư. Vì vậy không phù hợp để mở đăng ký/reset cho người dùng bình thường. Lỗi trước đây có thể do cấu hình, giới hạn hoặc nhà cung cấp; lần này chưa kiểm log nên chưa kết luận nguyên nhân. [Nguồn Supabase](https://supabase.com/docs/guides/auth/auth-smtp).

Ví dụ, Resend đang công bố gói **$0, 3.000 email/tháng, tối đa 100 email/ngày**, có hỗ trợ SMTP. Có thể nối dịch vụ gửi mail riêng với Supabase để gửi xác nhận và reset. Gói/quota được tra ngày 15/10/2026, cần kiểm lại khi triển khai. [Giá Resend](https://resend.com/pricing).

Tuy nhiên còn việc xác minh tên miền gửi thư và cấu hình để thư tới được inbox. Nếu chưa sở hữu tên miền, có thể phát sinh tiền mua/gia hạn tên miền; địa chỉ website `vercel.app` không tự cho quyền cấu hình tên miền gửi thư. [Yêu cầu tên miền Resend](https://resend.com/docs/dashboard/domains/introduction).

Nếu chọn E, cần hiển thị rõ khi gửi thất bại hoặc hết quota, cho thử lại có giới hạn, tránh bị spam nút reset làm cạn quota. Không bật tự trả phí vượt mức. “Đã gửi” không được hiện khi dịch vụ chưa nhận yêu cầu thành công; dịch vụ nhận cũng chưa bảo đảm mail đã vào inbox. Đổi sang magic link/OTP qua email vẫn dùng dịch vụ gửi thư, không loại được phụ thuộc này.

**Kết luận cho lựa chọn E:** khả thi cho app nhỏ nếu chấp nhận vận hành email. Nhưng vẫn phải xây chia sẻ thư viện A hoặc mô hình quyền tương đương; form đăng ký riêng không thay thế phần đó.

## 8. Hai hướng không dùng email khác

**F — Username/password và mã khôi phục:** người dùng tự giữ mã dự phòng để đặt lại mật khẩu. Có thể nhờ người quản lý gia đình khôi phục quyền của người học, nhưng phải xác minh bằng người quản lý đang có quyền. Mất cả mật khẩu, mã dự phòng và quyền quản lý thì không có cách cứu tự động đáng tin cậy. Đây là hệ thống tài khoản mới cần bảo vệ và vận hành; không nên làm chỉ vì muốn tránh cấu hình email. Không dùng câu hỏi bí mật hoặc một PIN ngắn dùng chung làm chìa khóa quản lý toàn thư viện.

**G — Passkey:** dùng vân tay/Face ID/PIN thiết bị thay mật khẩu của app. Cần chuẩn bị cách vào lại khi mất thiết bị, và vẫn phải có quyền thư viện riêng cho vợ/máy học. Supabase hiện ghi hỗ trợ passkey là **experimental**, cần tài khoản đã được xác nhận, không phải tài khoản ẩn danh. Nên nghiên cứu sau, không đặt nó làm nền duy nhất cho nhu cầu gia đình ngay lúc này. [Nguồn Supabase](https://supabase.com/docs/guides/auth/passkeys).

## 9. Một kho, một tiến độ chung; bài mới tự cập nhật

Bỏ đề xuất learner profiles/Bé An/Bé Na. Một Google account giữ kho và tiến độ của mình. Share cho máy khác nghĩa là đọc/học **cùng kho, cùng tiến độ**, kể cả máy nhận không login qua B. Mọi kết quả học hợp lệ trên các máy được cấp cập nhật về tiến độ của kho nguồn; những người học thử cũng làm đổi lịch ôn chung.

Nếu người nhận có own library, chọn kho riêng dùng progress riêng hiện có của họ; chọn kho được share dùng progress của kho nguồn. Không gộp hai kho, không ghi progress kho mày sang kho vợ. Không thêm nhiều người học hoặc migration chia state cũ.

Owner thêm/sửa từ/ngữ pháp đủ điều kiện học, cloud nhận thay đổi thì active A/B tự nhận bản mới khi có mạng; không cần tạo lại share/email/QR. Nội dung mới chỉ đang local/chưa đồng bộ thì bên nhận chưa có; offline nhận khi reconnect. Cập nhật approval/ảnh hoặc xóa bài phải xử lý lượt đang học an toàn, không silently học đáp án cũ.

Nháp ảnh gốc, key AI và dữ liệu account khác không tự chia sẻ. Hình/nguồn/license trong bài giữ; học chung không tạo quyền phát hành hình cho công chúng.

## 10. Lộ trình đề xuất và cách founder nghiệm thu

**Đợt 1 — Máy vợ dùng được bài hiện tại:** Settings → Share cho một/nhiều email, nhận quyền trong app, chọn kho riêng/kho được chia sẻ, nội dung chỉ đọc và tiến độ chung của source library. Giữ thư viện hiện tại tại chỗ; bố không phải soạn lại. Vợ dùng Google riêng. Khôi phục tài khoản Google vẫn do Google xử lý.

**Đợt 2 — Máy mượn/máy con:** thêm tạo QR/mã ngay trong Share, một mã cho một phiên máy, thời hạn học 72 giờ, danh sách máy và ngắt kết nối. Chủ thư viện cấp phiên; không gửi email.

**Đợt 3 — Chỉ khi có nhu cầu:** chia sẻ bản sao/link bài cho người ngoài; email/password bằng gói SMTP miễn phí hoặc passkey. Không cần làm tất cả các cách cùng lúc.

Trước khi triển khai trên bộ bài thật, xuất bản dự phòng phù hợp và thử với thư viện mẫu riêng. Founder nghiệm thu bằng các tình huống:

1. Share nhiều email đã đăng ký báo đúng từng kết quả; email lặp/sai/chưa đăng ký xử lý riêng; notification A/B chỉ tới đúng người và open/read/dismiss không tự nhận/kết nối.
2. Vợ có kho riêng vẫn giữ đủ bài/tiến độ cũ, có thể chuyển qua kho bố chia sẻ; tìm kiếm và game không trộn hai kho.
3. Bố thêm/sửa bài thì máy vợ nhận bản mới; người nhận không sửa/xóa nội dung gốc hoặc tự chia sẻ tiếp, kể cả cố gửi thao tác ngoài giao diện.
4. Owner/A/B học cùng kho thì tiến độ hội tụ, kể cả B không login; kho riêng của vợ/library khác không đổi. Không có màn tạo/chọn nhiều bé.
5. Mã10ký tự gõ được trên TV không camera; B-email mỗi người một pairing riêng; notification hiện chi tiết/link/QR/mã để kết nối hoặc nhập máy khác. QR ở Settings → Share cấp phiên chỉ học mà không login Google của chủ; một mã không cấp cho hai máy, mã hết hạn/đã dùng bị từ chối.
6. Phiên 3 ngày được mở lại trong cùng trình duyệt, hết đúng 72 giờ tính từ kết nối thành công; dùng thường xuyên không tự gia hạn. Cấp lại cho cùng kho giữ tiến độ cũ.
7. Thu hồi email/máy chặn quyền cloud, không ảnh hưởng kho riêng hoặc các máy khác; đổi kho/tài khoản không hiện cache sai. Giới hạn offline được giải thích đúng.
8. Mất mạng/lỗi kết nối không hiện thành công giả hoặc làm mất mã vì mới xem trước; tiến độ chưa đồng bộ có trạng thái rõ, không ghi nhầm sang library khác khi phiên hết hạn.
9. Bộ bài và lịch sử cũ còn nguyên; không tạo bản trùng hoặc làm sai nghĩa khi thêm chia sẻ.

Không có chi phí gửi email cho luồng A/B được đề xuất. Vẫn có giới hạn lưu trữ/cloud và công xây tính năng; không hứa vận hành miễn phí vô hạn khi số người và ảnh tăng.

## 11. Phần đã chốt và mặc định còn đề xuất

| Nội dung | Cập nhật theo founder |
|---|---|
| Vị trí | Settings → Share, có cả email và QR/mã |
| Chia sẻ qua email | Nhập một/nhiều email đã đăng ký app; chuông hiện notification, nhận bằng tài khoản riêng |
| Mã và thông báo B | Nút Nhập mã10chữ/số cho TV; optional email nhận notification, mỗi người một mã |
| Người nhận có kho riêng | Giữ nguyên; chọn kho riêng hoặc kho được chia sẻ, không gộp |
| Quyền người nhận | Chỉ học, không thêm/sửa/xóa nội dung hoặc chia sẻ tiếp |
| Phiên QR | 3 ngày = 72 giờ từ kết nối thành công; ngắt sớm được |

Các mặc định còn đề xuất: A giữ quyền đến khi thu hồi; QR/mã chưa nhận hết hạn sau 15 phút và chỉ cấp một phiên máy; cùng bé dùng cùng kho được cấp; lần đầu chia sẻ toàn thư viện đã chọn. Chủ thư viện vẫn là người quản lý duy nhất trong phạm vi này.

A rồi B vẫn là thứ tự triển khai đề xuất. Các hướng C–G giữ để tham khảo, không mở thêm quyền sửa bài được chia sẻ. [Flow chi tiết](CHIA-SE-THU-VIEN-FLOW-FOUNDER.md) mô tả tiến độ chung/auto-update/signed-out receiver và các màn main/error; mặc định vẫn chờ founder duyệt. **Đã viết docs triển khai, chưa giao hoặc thực hiện code.**
