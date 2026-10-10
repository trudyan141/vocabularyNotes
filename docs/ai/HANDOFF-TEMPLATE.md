# Handoff — dùng khi chuyển chat hoặc công cụ

Copy nội dung theo template; thay placeholder bằng dữ kiện, không giữ các section rỗng:

```markdown
Updated: <date/time/timezone>
Objective: <user objective and latest steering>
Current task: <Txx and status>
Scope constraints: <only changes to the confirmed baseline>

Completed:
- <behavior, exact paths, requirement IDs>

In progress:
- <current files, uncommitted work, partial operation IDs if safe>

Verification:
- <command, environment, result, evidence artifact>
- <real vs mocked integration; checks not run>

Decisions:
- <ADR IDs and short rationale for new choices>

Failures / dependencies:
- <exact remaining issue, attempted fixes, credential or user information needed>

Next action:
- <one executable next step, routed documents and acceptance>

Read next: AGENTS.md, docs/ai/STATE.md, TASKS.md, <relevant docs>
```

Không nhét key, token, email cá nhân hoặc ảnh học sinh vào handoff. Không copy toàn bộ terminal history; trỏ tới log đã redact nếu cần. STATE ghi tình hình hiện tại; CHANGELOG giữ lịch sử, TASKS giữ dependencies/status; tránh hai bản truth khác nhau.
