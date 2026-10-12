# WF1/WF2 — coding AI workflow, 12/10/2026

Founder duyệt preview lần2 bằng “ok làm đi”. Scope: current context/routing, archive lossless, shared scoped runner/source guards/discovery; không sửa learning content, SQL/schema, Gemini flow, UI product, global config/hooks/plugin/deploy/main/Vercel env/browser founder.

## WF1

Archived exact bytes trước rewrite: START34619/STATE51526/TASKS48326bytes (134471total), cùng thư mục để giữ relative links. So baseline audit ban đầu133300bytes, việc thêm plan/pointers đã tăng nhẹ trước triển khai. Current files ngắn; mọi old checkpoint nằm ở .history-2026-10-12.md; product steering chi tiết giữ PROJECT-RULES. RootAGENTS và delivery/handoff theo ADR083, same product task19/status totals/pending gates.

Probes từ current đường đọc: permission=3limits; SQL0007đãapply; Speaking=Geminiaudio/ADR066; photos=scan-all/one-review-save/ADR082; chưa live quality/device/human; next action workflowverify. Không khôi phục các quyền/engine/review lịch sử. Counts local/deployed/evidence giữ phân biệt.

## WF2 và kết quả kiểm theo phạm vi

Runner snapshots credential-free, dependencies reuse, unique output/lock; source contenthash+commit trước/sau, portownership/no secret hash. UIdev scoped, productionbuild riêng và reuseguard; cloud/no-demo/release scopes. Default release discovery trước13/29, nay31/31file (thêm2runner smoke),314tests discovered; không claim314PASS. 0filtercase trảnonzero.6guard tests PASS, lint/typecheck PASS ban đầu.

Dev smoke đầu fail environment: envfile exclusion nhầm src/server/env.ts, không lỗiapp. Sửa filter giữ env.ts và thêm assertion copiedsource vs excludedprivate.env;6guards rerunPASS. Chưa claim UI pass tới khi rerun.

### Final evidence

Runtime Node24.14.1/pnpm11.25.0; source commit41da64b + final content fingerprint `d84c53c73b51632b43de90932d18d416cf1a5656161198bcb6f2c8a5a6878b02` (code/config/scripts/tests; không hash secrets). Documentation updates sau kiểm không thay fingerprint runner. Logs/result hiện giữ trong owned tmp của task; dưới đây lưu summary bền, tmp paths không coi là artifact vĩnh viễn.

| Command / boundary | Kết quả |
|---|---|
| `pnpm test:workflow` | 7/7PASSfinal1,02s;6/6PASS/154ms trước compatibilityfix; dirty/stale/addition, envsource vs secretfile, symlink, canary env, scope/port, occupiedport owner giữ; inheritedbaseURL/WebKitpreset vàcloudmapping. NativeTS configimport có MODULE_TYPELESS_PACKAGE_JSON warning, không đổi module mode/global vì warning |
| `pnpm lint` / `pnpm typecheck` | FinalPASS; logs `/tmp/wfk-workflow-lint-final.log`, `/tmp/wfk-workflow-types-final.log` |
| `pnpm test:ui -- --list --scope release` | 314tests/31specfiles discovered, không missing; livecases vẫn opt-in. Không claim314PASS |
| Zero grep discovery | Nonzero1, không dựng server; `wfk-ui-result-goI2f0` |
| `pnpm test:ui -- workflow-smoke.spec.ts --port 4341` | Finaldev2/2desktop+mobilePASS; prepare7,5s/browser29,2s; `wfk-ui-result-lXh1v5` |
| `pnpm test:ui -- --mode production workflow-smoke.spec.ts --port 4341` | FinalisolatedbuildPASS38,9s +2/2UI6,2s; `wfk-ui-result-2ojSIB`; snapshot `wfk-ui-source-yQe6ft`. Build45,9s là checkpoint trước compatibilitybaseURL/cancellationfix; rebuild có lý do configchange, không build sau docs |
| Same snapshot `--scope no-demo --grep 'demo off shows' --port 4342` | Final1PASS5,3s, reuse không build; `wfk-ui-result-xbcJ2X`. Trước compatibilityfix1PASS4,2s/`wfk-ui-result-EEe03H` |
| Same snapshot overlap | Secondrunblocked before server by owner lock, không remove/kill owner; `wfk-ui-result-NxTY2m`. Do initial no-demo và cloud dispatch overlap, rerun cloud tuần tự |
| Same snapshot +one own temporary sourcefile, then reuse | Nonzero1 `Source changed` before server; testfile dọn trong finally, originalappsource không đổi |
| Same snapshot `--scope cloud workflow-cloud.spec.ts` | Discovery1case đúng; startupFAIL4,3s (not test assertion), `wfk-ui-result-oJTHF7`; nativeinitdb probe xác nhận shmget56bytes/SHMALL, ownprobe cleanup |

PostgreSQL15.12 local không allocate SysV56bytes; official [kernel resource docs](https://www.postgresql.org/docs/15/kernel-resources.html) mô tả SHMALL limit. Không đổi kernel/global/dừng tiến trình ngoài task; không install PGlite hoặc mở rộng cloudfixture implementation chỉ để taskworkflow xanh. Cloud smoke pending_environment và full release chưa chạy; giữ cloud/SQL release gates. Failed cloud startup tạo temp fixture directory rỗng riêng, dọn đúng directory mới của task nếu còn; không đụng fixture lượt khác.

### Context và archive

Finalbootstrap đo lại lúc bàn giao; finalbootstrap9893bytes vs audit133300 (~92,6% giảm), rootAGENTS5018bytes vs15491 (~67,6%). Không tính đây là actualtoken/cost savings. Archives SHA256: START `2877730361bd7c7a798b5e42037592fb3fa0aebb51e5bdbf4bd6395d40c0a044`; STATE `1e762c992ba59105abf0e0a3474092466f403c62dee2d8051bdc6c751acbf09d`; TASKS `0ca524389db1612f06dca9bf2fa2ceb53086b95e092e966538f173ae81b11e03`. Bytes preserved pre-rewrite, relative links unchanged. CurrenttaskT00–18/status totals remain; no productcode/schema diff.

Docs/skill customlock updated with reviewed SHA. Final `pnpm docs:check` PASS859links/16skills329resources/49JSONparsed (khôngschema), `git diff --check` PASS; defaultreleasefinaldiscovery314tests/31files, không missing. Nativecloudstartupfailure/stale/no-demo checkpoint trước compatibilityfix giữ evidence thật; cloud không rerun sau fix vì sameinitdbblocker và boundarycloud không đổi. No-demo finalreuse rerunPASS5,3s/`wfk-ui-result-xbcJ2X`. WF1complete; WF2localimplemented and scopedverified, cloud pending_environment. WF3next realtask, not automatic benchmark; actual tokens unavailable, before/after tasktime chưa so tương đương. Không chạy full E2E/SQL/provider/physical devices trong task này. Actual chat tokens unavailable; contextbytes là proxy, không claim token/time reduction chưa đo.
