# So tốc độ trước/sau — 12/10/2026

Baseline build `W8LyVVkWKB0e37putG5o4`, final build `FkPEgBOu9plIRgNLQl8WK`, HEAD `058c0c7` + diff local. [Trước](../performance-2026-10-11/local-baseline.json), [sau](local-after.json), [script](measure-local.mjs).

5 lần cold/route, browser context riêng, Pixel7 emulation360×800, CPU4x, RTT150ms/down200KB/s, cache tắt, local server đã warm, auth signed-out fixture100ms,20 demo words. Run cuối chạy riêng sau UI tests/build; không đo tài khoản/mạng thật/điện thoại thật. Median, không phải p75 field hoặc SLA.

| Trang | LCP — nội dung lớn nhất hiện | Nút/bài sẵn sàng | JS encoded đã nhận |
|---|---|---|---|
| `/welcome` | 2912 → 980 ms | 2795 → 2035 ms | 302.1 → 177.0 KiB |
| `/today` | 964 → 968 ms | 3586 → 3688 ms | 302.1 → 325.0 KiB |
| `/practice` | 1024 → 1032 ms | 3639 → 3745 ms | 304.8 → 328.2 KiB |

Trang chào: LCP giảm khoảng66%, lúc sẵn sàng giảm27%, JS giảm41%; số auth requests2→0. Tách public404 là bước cần thiết: nếu404 vẫn import AppProvider, nó kéo thư viện vào root bundle dù Welcome đã tách. Stable Image tránh greeting remount/resetLCP. HTTP307 từ root đã kiểm bằng navigation hoàn tất, không chỉ page.goto sớm.

Hôm nay/Chơi & học: LCP gần như không đổi; readiness **chưa nhanh hơn**, chênh khoảng100ms, JS tăng khoảng23KiB do các phần scope/preferences/sync mới. Không claim mọi trang đã tăng tốc. Auth requests2→1, popup/phần thư viện không đợi status profile độc lập; Realtime SDK chỉ load khi account. Full-table bounded prepare/hash vẫn giữ tính phục hồi; liveQuery full-row polling đã bỏ. Chưa có INP/field/RAM benchmark.

CLS median Welcome≈0,00008; Today≈0,05065, Practice≈0,01137. Không có layout shift tăng lớn trong profile này. Phép đo auth chậm3s: signed-out ready6268ms, account auth3s+library3s ready9283ms; vẫn phải xác minh identity trước scope writable, không dùng guest để che thời gian chờ auth. Đây là mock latency, không độ trễ production.

`local-interim.json` là phép đo trước khi tách404, không dùng làm kết luận final; giữ để giải thích bước điều tra. Không run HTTP production mới, deploy, change env, quota hoặc real account. [Bản ghi chức năng/SQL chưa kiểm](../speaking-refresh-and-automatic-sync.md).
