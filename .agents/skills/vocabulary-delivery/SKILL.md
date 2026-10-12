---
name: vocabulary-delivery
description: Plan, implement, resume and hand off Words for Kids tasks using the repository requirements, dependency checklist and durable state. Use for multi-step work or Codex/Antigravity continuation in this project; not as a generic planning skill for other repositories.
---

# Deliver Words for Kids without losing context

Start with `AGENTS.md`, `docs/ai/START-HERE.md`, `docs/ai/STATE.md` and `docs/ai/TASKS.md`. Read current sections only. History snapshots and CHANGELOG are lookup evidence, not bootstrap or current permissions; do not start competing root plans or infer progress from chat memory.

1. Resolve the latest user steering and choose one ready task by dependencies. Read only the routed specifications and relevant skills.
2. State the task's observable acceptance and implement its complete authorized scope, including storage and errors when specified.
3. Verify meaningful behaviors with the project's actual commands. Record command, result and unresolved integration limits. Missing credentials do not make mocked integration production-ready.
4. Follow docs/ai/WORKFLOW.md for scoped discovery, owned snapshots and source identity. Mark done only with evidence; STATE holds current task/one next action, TASKS status+acceptance+link, CHANGELOG history. Do not copy full handoffs across these files. Record changed product/architecture decisions in DECISIONS with rationale and affected requirements.
5. At handoff, use `docs/ai/HANDOFF-TEMPLATE.md`; preserve exact files, in-flight work, failures and one next action. Point to detailed artifacts instead of repeating every spec in the prompt.

The upstream skill bundles are supporting references. Read `docs/skills/CATALOG.md` for routing and boundaries. Do not install unrelated hooks/plugins, change global settings, inspect external chat histories or deploy based on a skill's generic workflow. Explicit user authorization takes precedence; record any authorized integration separately from project runtime dependencies.

Keep `docs/KE-HOACH-FOUNDER.md` self-contained and in Vietnamese. Update its status or product decisions when milestones change; `docs/ai/` remains the implementation ledger. Simple UX and performance measurement gates live in `docs/13-ux-performance-gates.md`; installing skills or writing targets does not prove the app passes them.

Keep planned, implemented, tested and externally verified distinct. No TODO placeholder or mock should be reported as fulfillment of its feature requirement.
