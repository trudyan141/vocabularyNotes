# Workflow agent — ADR083, 12/10/2026

Current flow: AGENTS → START-HERE → STATE → đúng task/spec/symbol. Không bootstrap bằng history/founder/ADR toàn bộ. User scope và ADR050 ưu tiên skill defaults; systematic-debugging cho bug, vocabulary-delivery cho feature, retrieval/handoff skills khi cần. Một acceptance/risk ngắn; hoàn tất behavior/error/data, không dùng timebox để bỏ việc.

## Chọn kiểm

Docs-only: docs/diff. App: lint/typecheck và test meaningful đúng boundary; data/auth/backup giữ regression. UI: vài state main/error mobile+desktop. Build cuối cho config/route/dependency/PWA/offline hoặc production preview. Full check/E2E/SQL trước release hoặc evidence rộng; install chỉ khi thiếu/đổi. Không tạo test literal cho name/text/icon. Discovery không thay test execution.

## Runner chung

Node24.14.1/pnpm11.25.0 sẵn có. Chọn spec basename và grep có nghĩa; mặc định dev snapshot webpack, không production build cho mọi task.

```sh
pnpm test:ui -- --list workflow-smoke.spec.ts
pnpm test:ui -- workflow-smoke.spec.ts --port 4341
pnpm test:ui -- search-batch.spec.ts --grep 'all photos|quota during'
pnpm test:ui -- --scope no-demo --list
pnpm test:ui -- --scope cloud --list
pnpm test:ui -- --scope release --list
pnpm test:workflow
```

- `--scope ui`: desktop1280/mobile360. Một app khi spec chọn không cần fixture khác. learning.spec có cross-context no-demo nên thêm4322; learning/cloud-refresh hiện giữ4320 do legacy hardcoded context.
- `--scope no-demo`: appfalse (mặc định4322), demo-disabled.spec. `--scope cloud`: production app+loopback identity+localPostgres4328/4329; cần TASK_PG_BIN/nativePG working, không hosted account. `--scope release`: toàn inventory, mọi fixture; full trước release. Live media vẫn skip nếu không `--live-media`.
- `--grep` lọc title; `--project` chọn project; `--port` cho spec không cross-context. Zero/missing spec/unknown option trả nonzero trước dựng server. Không `--pass-with-no-tests`.
- `--mode production` tạo **một** build trong owned snapshot, log đầy đủ; không dùng .next checkout. `--snapshot /absolute/owned-snapshot` reuse chỉ khi manifest sourceRoot+commit/content fingerprint và snapshot content khớp, mode/live phù hợp, lock riêng còn trống. Không reuse server ngoài task hoặc vì health200.

```sh
pnpm test:ui -- --mode production workflow-smoke.spec.ts --port 4341
# Reuse path do runner trả về, khi source chưa đổi:
pnpm test:ui -- --snapshot /absolute/owned-snapshot --mode production --scope no-demo
```

Không copy `.env*`, private.env/pem, generated .next hoặc node_modules content; chỉ symlink dependency có sẵn. Host env chỉ runtime essentials, credentials bị thay bằng fixture canaries. src/server/env.ts là **source module**, không secret env file. Không đọc/hash secrets để nhận diện source. Không gọi provider thật để đo overhead.

Fingerprint bao gồm authored src/public/tests/scripts/config/schema fixture. Commit đơn lẻ không đủ cho dirty workspace. Copy xong kiểm identity; trước/sau build và test kiểm source; mismatch → overallfailed, không báo stalepass. Port occupied/lockowned → error, không kill/remove server/lock của chat khác. Mỗi run output riêng trong tmp: full logs, traces/report, result.json (scope/mode/commit/fingerprint/runtime/commands/duration/status). Result không chứa credentials; tokens unavailable nếu host không cung cấp.

Snapshot/output giữ để đọc lỗi hoặc rerun; dọn đúng path của task sau khi evidence không cần nữa, không glob xóa /tmp của người khác. SIGINT/SIGTERM kết thúc process group của runner. Nếu runner crash cứng để lại .wfk-active, xác minh owner thật trước dọn lock; không tự xóa lock tồn tại.

## Release và compatibility

Default playwright.config.ts dùng shared config và discover mọi spec; cloud/no-demo tách project, UI mocks như cloud-refresh vẫn UI. Thêm spec mới kiểm --list và fixture mapping; không bắt live test vào default. Các config compact/search-batch/notifications/prepare/speaking là preset compatibility từ cùng shared config, không cần tự tạo config /tmp nữa. test:e2e/CI không giảm release gates; scopedrunner dành cho task nhỏ.

## Handoff / metrics

STATE giữ current task/baseline/test evidence/failure và **một next action**; TASKS giữ acceptance/status+link; CHANGELOG/evaluation giữ lịch sử. Archive/history lookup only. Không copy bản bàn giao dài vào cả ba file. Template HANDOFF-TEMPLATE có source identity/artifacts/failing hypothesis/next action.

Ghi metrics trong evidence task đã có: risk/type, timestamps, required context bytes, actual tokens nếu có, setup/test duration, unique cases/rerun reason (code/fixture/environment/stale/external), reopened bug và limits. Không suy bytes hoặc test elapsed ra token. WF3 chỉ đo task founder giao tiếp theo; WF4 không refactor nếu chưa có hotspot evidence. Host prompt/tool overhead không nằm hoàn toàn trong quyền repo.

Local host hiện initdb15 fail shmget56bytes/SHMALL; cloud discovery đúng nhưng smoke chưa qua startup. Không tự sửa kernel/global hoặc bỏ cloudreleasegate. Rerun scope cloud khi có fixture runtime working; đây là pending_environment, không app/cloudPASS.
