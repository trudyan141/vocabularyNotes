# Hồ sơ theo nhóm — founder follow-up15/10

Founder yêu cầu gom chức năng trang local `/profile` để dễ nhìn. AccountTools cũng dùng cho alias `/account`.

Các nhóm: Tài khoản Google (identity/sign-in/sign-out/refresh), Thư viện & đồng bộ (current scope và storage), Thông tin cá nhân (tên/avatar), Hoạt động học (history), Quản lý dữ liệu tài khoản (source photos/delete). Personal editor, storage, sync/transfer và account data default-closed; cloud storage error auto-opens để không giấu lỗi. Login/current scope vẫn thấy ngay. Shared scope dùng lời giải thích chỉ học và link Settings thay vì nút chuyển bài mẫu/local. Theme/font/nav/auth/data/history giữ.

`pnpm test:ui -- profile-groups.spec.ts account.spec.ts --grep 'guest profile|account profile separates|Google avatar displays|Google sign-in has' --port 4351`: discovery8,8devUI PASS desktop1280/mobile360, signed-out/sample and signed-in/error. Profile editor save/avatar persists reload, collapsed details/history accessible; signed-in account/device counts and fallback avatar, cloud error visible, login/back nav, no horizontal overflow. [Runner artifact](profile-groups/ui-result.json), source7673714 +7731bf3542ea, prepare6.1s/browser29.1s. [Mobile](profile-groups/mobile.png), [desktop](profile-groups/desktop.png).

Lint/typecheck/diff PASS; Impeccable detector no findings (không human UX pass). Existing local `http://127.0.0.1:4317/profile` HTTP200 contains new group markup. Không restart server của founder/control browser thật, không SQL/data mutation. Không deploy task này vì founder chỉ định trang local; không claim production/real OAuth mới. Manual: refresh4317, mở personal edit/storage/history hoặc account data đúng nhóm. Full release acceptance giữ tại TASKS.
