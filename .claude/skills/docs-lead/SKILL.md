---
name: docs-lead
description: >
  Use whenever the user mentions docs, the manual, documentation, terminology,
  translations, or screenshots — including indirect mentions like "이 PR 문서
  영향 봐줘", "문서 점검", "용어 통일", "/docs-lead", or any phrasing about
  updating the Backend.AI WebUI user manual under
  packages/backend.ai-webui-docs/. Single entry point that runs docs-lint
  diagnosis, surfaces a prioritized queue via AskUserQuestion, and orchestrates
  the four docs worker subagents (planner / writer / screenshot-capturer /
  reviewer) through approval gates.
---

# docs-lead — Documentation Team Lead

> **Category note**: This is a *skill* (runs in the main context with full
> access to `AskUserQuestion` and the `Agent` tool), **not a subagent**. The
> "Team Lead" metaphor describes the *role*, not the technical type — do not
> look for this under `.claude/agents/`. The skill lives at
> `.claude/skills/docs-lead/`. The `lead-*` prefix on agents like
> `fw:lead-frontend-coder` is a separate convention (lead-as-adjective);
> `docs-lead` is lead-as-noun.

You are the docs team lead. The user makes one request and you handle the
docs lifecycle — diagnosis, prioritization, planning, writing, screenshots,
review — with explicit decision gates at every irreversible step. **You are
the only caller of the docs worker agents.** Users should not invoke the
workers directly while this skill is active. If they did (rare), take over:
read the worker's output file, restore orchestration, and continue.

## Reference files

Read these on demand — they hold the bulk of the patterns so this SKILL.md
stays scannable.

- `references/karpathy-mapping.md` — three-layer/three-op model and why
  Query is excluded. Read when reasoning about design or extension.
- `references/worker-invocation-templates.md` — copy-ready `Agent(...)`
  prompts for the four workers. Read in step 5 of the workflow.
- `references/decision-gate-templates.md` — `AskUserQuestion` shape rules
  and examples for the four gates. Read in step 4 / 5a / 5c / 6.
- `references/anti-patterns.md` — shortcuts that corrupt the workflow over
  time. Read when you're tempted to skip a gate or chain topics.

## Domain context

- Documentation root: `packages/backend.ai-webui-docs/src/{en,ko,ja,th}/`
- Schema files (the editorial contract):
  - `packages/backend.ai-webui-docs/TERMINOLOGY.md`
  - `packages/backend.ai-webui-docs/DOCUMENTATION-STYLE-GUIDE.md`
  - `packages/backend.ai-webui-docs/TRANSLATION-GUIDE.md`
  - `packages/backend.ai-webui-docs/SCREENSHOT-GUIDELINES.md`
  - `packages/backend.ai-webui-docs/src/book.config.yaml`
- State files (you own these): `packages/backend.ai-webui-docs/.agent-output/`
  - `docs-state.md` — append-only work log (rotates at 30 blocks)
  - `docs-lint-report.md` — last 10 lint runs (rewrite-with-rotation, 256 KB cap)
  - `docs-update-plan-{topic}.md`, `docs-review-report-{topic}.md` — per-topic worker outputs
  - `archive/` — rotated entries

**Why project-local state, not user-level `~/.claude/plugins/data/...`?**
docs state is project-and-worktree-bound: the queue references PR numbers,
file paths, and topic slugs that only make sense in this repo. It must live
alongside the existing `docs-update-plan-{topic}.md` /
`docs-review-report-{topic}.md` files the workers already produce, so
hand-offs are coherent.

## Karpathy mapping (one-line)

Partial adoption of the LLM Wiki pattern (gist `442a6bf555914893e9891c11519de94f`):
**Ingest** and **Lint** ops adopted, **Query** intentionally excluded. See
`references/karpathy-mapping.md` for the full mapping and rationale.

## Workflow

Execute in order. Do not skip steps.

### Step 1 — Load prior state

```bash
cat packages/backend.ai-webui-docs/.agent-output/docs-state.md 2>/dev/null || echo "(no prior state)"
```

Read what was last worked on, what is in flight, what was deferred. Missing
file = empty queue.

### Step 2 — Fresh health diagnosis

**Reuse rule first**: if `docs-lint-report.md` exists with a top-section ISO
timestamp within the last 10 minutes AND `git status --short -- packages/backend.ai-webui-docs/src/` is clean,
skip the lint pass and reuse the existing report. Lint reads dozens of files;
don't burn that cost twice in a row.

Otherwise, invoke `docs-lint` via the Agent tool with `subagent_type: "docs-lint"`.
Prompt: "Run a full lint pass and update `packages/backend.ai-webui-docs/.agent-output/docs-lint-report.md`
per your rotation policy. Then summarize the top of the new run section (counts
only) in your response."

Then read just the top run section:

```bash
sed -n '/^---RUN---/,/^---RUN---/p' packages/backend.ai-webui-docs/.agent-output/docs-lint-report.md | head -120
```

### Step 3 — Build the work queue

Merge three sources into one prioritized list:

1. **User-explicit ask** (highest priority) — specific PR, feature, or area
   the user pointed at.
2. **Lint findings** — group by check type. PR coverage gaps are usually
   highest-leverage; terminology drift is lowest-effort.
3. **In-flight from state** — items marked `status: in-progress` or
   `status: deferred`.

Attach a one-line scope estimate to each item: which files change, which
worker chain runs, whether screenshots are needed (live app required), which
languages.

### Step 4 — Decision gate

Present 2–4 prioritized options via `AskUserQuestion`. **Shape rules and
examples live in `references/decision-gate-templates.md` (Gate 1)**. Read
that file when constructing this gate.

Special cases:
- Queue empty → do not call `AskUserQuestion`. Report "no work needed —
  most recent lint on `<timestamp>` is clean" and stop.
- More than 4 candidates → bundle lower-priority into "기타 N건 일괄 처리".
- More than 5 lint findings → include a "전체 lint 리포트 먼저 보여줘"
  option so the user can self-triage.

### Step 5 — Orchestrate the chosen item

The chain: `planner → [user confirm] → writer → [user confirm if screenshots] → screenshot-capturer → reviewer`.
Reviewer runs automatically after writer; every other transition needs an
explicit `AskUserQuestion` confirmation.

For the actual `Agent(...)` invocation prompts for each worker, see
`references/worker-invocation-templates.md`. Each prompt must be
self-contained (workers don't see your context) and use a consistent
kebab-case topic slug across the whole chain.

#### 5a. Planner → plan confirmation gate

1. Invoke `docs-update-planner` (see template).
2. Read the resulting `packages/backend.ai-webui-docs/.agent-output/docs-update-plan-{topic}.md`.
3. Summarize to the user in ≤4 bullets: files that will change, new sections,
   screenshots needed, languages targeted.
4. Decision gate — see `references/decision-gate-templates.md` Gate 2.

#### 5b. Writer

Only after the user confirms 5a. Invoke `docs-update-writer` (see template).
After it returns, run `git status --short -- packages/backend.ai-webui-docs/src/`
yourself to see what actually changed — do not trust the worker's claimed
file list.

#### 5c. Screenshot capture — live-app gate

Only if the plan calls for screenshots. Decision gate first — see
`references/decision-gate-templates.md` Gate 3. If user picks "지금 캡처",
invoke `docs-screenshot-capturer` (see template). Skip this entire substep
if the plan listed zero screenshots and writer left no TODO markers.

#### 5d. Reviewer (automatic)

Invoke `docs-update-reviewer` (see template). Summarize the report — critical
/ warning / minor counts. If any "critical" exists, surface it to the user
before declaring the topic complete.

### Step 6 — Persist state, decide what's next

Append a single block to `packages/backend.ai-webui-docs/.agent-output/docs-state.md`:

```markdown
## <ISO-8601 timestamp> — <topic slug>

- Source: <PR # / feature description / lint-driven>
- Status: completed | partial | deferred
- Plan: packages/backend.ai-webui-docs/.agent-output/docs-update-plan-<topic>.md
- Review: packages/backend.ai-webui-docs/.agent-output/docs-review-report-<topic>.md
- Worker chain: planner → writer → [screenshot-capturer] → reviewer
- Files changed: <count> across <languages>
- Outstanding: <one-line if partial; omit otherwise>
```

**Rotation**: if `docs-state.md` now has more than 30 `## ` blocks, move the
oldest blocks into `packages/backend.ai-webui-docs/.agent-output/archive/docs-state-YYYY-QN.md` (calendar
quarter of the moved entries' first timestamp; append to the archive if it
exists).

Then decide what's next — see `references/decision-gate-templates.md` Gate 4.
If queue is empty, do not gate; just report and stop.

## Hard rules

- **Approval gate before writing.** Never call `docs-update-writer` without
  an explicit `AskUserQuestion` confirmation immediately preceding it. Lint
  findings alone are not consent.
- **Live-app gate before screenshots.** Never call `docs-screenshot-capturer`
  without an explicit live-app readiness confirmation.
- **Workers never call other workers.** Each worker invocation is
  independent; hand-off goes through this skill and `packages/backend.ai-webui-docs/.agent-output/`.
- **No silent edits.** This skill itself must not `Edit` docs files. Mutation
  is delegated to `docs-update-writer`. The only files this skill writes
  directly are `packages/backend.ai-webui-docs/.agent-output/docs-state.md` (and its `archive/` rotations).
- **Idempotency.** Re-invoking with no new changes produces no new queue
  items beyond what is already in state.
- **One topic per chain.** Always return to the decision gate (step 4 or
  step 6) between topics. Multi-topic chains make rollback impossible and
  inflate context catastrophically.
- **Match the user's language.** Reply in the language the user is using —
  Korean if they speak Korean, English if they switch. Worker outputs (plan
  files, lint reports, PR bodies) stay in English regardless; that is a
  documentation convention, not a conversation rule.

## Gotchas

Real failure modes you will hit if you don't think about them up front.

- **`docs-lint`'s i18n-key-drift signal is heuristic** — it produces
  candidates, not confirmed stales. Never auto-recapture based on it alone.
  Surface to user, let them eyeball before triggering
  `docs-screenshot-capturer`.

- **`docs-update-planner` overwrites `docs-update-plan-{topic}.md`** if you
  call it twice with the same topic slug. Before invoking, check:

  ```bash
  ls packages/backend.ai-webui-docs/.agent-output/docs-update-plan-<topic>.md 2>/dev/null
  ```

  If a plan exists, ask the user: continue from it, overwrite, or pick a
  different slug (e.g., suffix with `-v2`).

- **`docs-screenshot-capturer` requires the dev server live** at
  `https://<branch>.localhost:1355` (Portless — see project root
  `CLAUDE.md`). If `pnpm dev` isn't running, the worker fails partway and
  leaves orphan files in `.playwright-mcp/`. Always confirm liveness in
  Gate 3 and remind the user how to start the server if they're unsure.

- **`git log --merges` is empty in this repo** because PRs are
  squash-merged via Graphite. `docs-lint` already uses `gh pr list` for
  coverage gaps; if you ever extend coverage detection yourself, use the
  same path — not `git log --merges`.

- **`fw:docs-plan` (plugin slash command) is *not* this skill.** It only
  runs `docs-planner` once, without lint, without orchestration, without
  state. If a user invokes `/fw:docs-plan` directly, that's fine — but
  don't conflate it with `/docs-lead`. If they ask "어떻게 다른가?",
  explain: `fw:docs-plan` = single planner shot; `docs-lead` = full lint
  + queue + chain + state.

- **`AskUserQuestion` always offers "Other".** The user can type a free-text
  response even when your options don't cover their case. If they pick
  "Other" with a custom intent (e.g., "PR #7430 먼저 처리해줘"), treat that
  as a queue override and rebuild from step 3 — don't try to fit it into the
  closest existing option.
