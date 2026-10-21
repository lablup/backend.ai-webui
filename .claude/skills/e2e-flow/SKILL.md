---
name: e2e-flow
description: >
  Check whether the branch changes a user flow the e2e suites walk, before a
  PR is opened: compare the diff against the existing cases in `e2e/` and
  `e2e-agent/`, ask whether a changed flow is intended, and define the new
  flow as an act-only draft in `e2e-agent/` (defined only, never run in the
  PR). Runs before every `gh pr create` / `gh stack submit`; a PreToolUse
  hook (`.claude/scripts/require-e2e-flow.sh`) refuses both until this skill
  has recorded the branch's HEAD. Trigger on "PR 만들기 전 유저 플로우 확인",
  "유저 플로우 바뀌었는지 봐줘", "e2e flow check", "check user flows before
  the PR", or a hook denial that names this skill.
---

# E2E flow

A PR that changes a flow the e2e suites cover states the new flow; it does
not run it. Running drafts, adding their assertions and cleanup is the nightly
automation's job.

## 1. Detect

1. **Base.** The stack parent for a stacked branch (`gh stack view`), else
   `main`. Diff with `git diff $(git merge-base <base> HEAD)..HEAD`.
2. **Skip without questions** when the diff cannot change what a user does to
   finish a task: a refactor that renders the same, styling, copy or a
   relabel, i18n key plumbing, schema, tests, docs, generated files. Go to
   section 3 with `Result: no flow change` and the one-line `Reason`.
3. **Find the cases that walk the changed screens.** Grep `e2e/` and
   `e2e-agent/` for:
   - the changed route paths (`react/src/routes.tsx`, `navigate(`, links);
   - the visible English labels of changed UI — resolve each i18n key in the
     diff through `resources/i18n/en.json` (BUI:
     `packages/backend.ai-ui/src/locale/en.json`) and grep the value;
   - changed or removed `data-testid`s.
4. **Compare.** Read each matched `test(...)` step by step and decide whether
   those steps still complete the flow after the change. It is a **flow
   change** when a field becomes required, a step is added, removed or
   reordered, a confirmation appears, disappears or changes kind, or a route
   or entry point moves. A changed label a step clicks by text is not, unless
   the step can no longer find it.
5. **No matching case** and the change still meets the criteria (a new page,
   wizard or entry point) is a **new flow**; otherwise it is no flow change.

## 2. Decide

**No flow change** → section 3.

**Flow change or new flow** (non-interactive: section 4 instead):

1. Tell the user which flow changed: `<spec path> › <test name>` and the
   concrete step difference (old step → new step). For a new flow, say what
   the user can now do and where it starts.
2. For a flow change, ask with `AskUserQuestion`: "Is this change intended?"
   (`Yes` / `No`). **No** → stop: do not open the PR, report it as a likely
   regression with the step difference, and record nothing (section 5), so
   the hook keeps blocking until the fix moves HEAD.
3. Draft the new flow yourself from the diff and the old test's steps, then
   ask with `AskUserQuestion` whether to add it:
   - `Use the proposed flow (Recommended)`, with the numbered steps in the
     option's `preview` — and, when a Playwright spec covers the flow, the
     spec file that will be ported and deleted (below);
   - `Don't add a flow`.

   The built-in "Other" takes a flow the user types. If they want to rework
   the proposal at length in chat, wait for that message.
4. **Don't add** → ask why with `AskUserQuestion`: `Temporary / behind a
   flag`, `Covered in another PR`, `Not worth an e2e flow` (plus Other).
5. **Add** → write the draft (below), show the written test to the user,
   then commit it on the branch.

### The draft test

Update the `e2e-agent/` test that covers the flow; otherwise add
`e2e-agent/<feature>/<flow>.e2e.ts`, following the folder names in `e2e/`.

**A Playwright spec in `e2e/` covers the flow → port it, then delete it**,
whether or not an `e2e-agent/` test already covers the flow, so the old
steps never run after the merge. Port the whole spec file, not just the
changed test, into one `e2e-agent/<feature>/<same-stem>.e2e.ts`:

- each `test(...)` becomes a draft test with the same name, its steps
  rewritten as the user scenario they walk, in `agent.act` sentences only;
  the changed test gets the new flow, the others keep their current flow;
  a test whose flow an `e2e-agent/` test already walks is merged into that
  test instead of duplicated;
- drop everything selector-based: locators, `expect`s, fixtures, waits,
  test data setup and teardown. The automation adds what it needs;
- `git rm` the spec file in the same commit. Keep shared helpers under
  `e2e/utils/` that other specs still import.

```ts
import { test } from "@e2e-dev/web";

// ported from: e2e/session/session-creation.spec.ts › <test name>
test(
  "the user launches an interactive session with a project",
  {
    session: "admin",
    tags: ["draft"],
    skip: "draft: act-only flow from #<issue>, awaiting completion by automation",
  },
  async ({ app, agent }) => {
    await app.open("/session/start");
    await agent.act('Choose the "Interactive" session type and press "Next"');
    await agent.act('Select a project in the "Project" field');
    await agent.act('Press "Launch"');
  },
);
```

- `app.open` for the start page, then **only** `agent.act`: one user intent
  per call, in the visible English UI labels.
- **No** `expect`, no `params` or concrete values, no timeouts, no cleanup.
  Automation fills in the details, the assertions and the cleanup.
- **`tags: ["draft"]` and a `skip` reason, both.** An act-only test passes
  whenever the agent can click through, so a run must report it `skipped`,
  never `passed`. The tag is how the automation selects drafts
  (`e2e run --tag draft`); it removes both once the test has its checks.
- A ported test's first line names its source: `// ported from:
  e2e/<path>.spec.ts › <test name>`. An updated draft keeps the line it
  already had.

## 3. PR body

Every outcome that goes on to open the PR writes this section. Later
automation parses it, so keep the keys and the `Result` values exactly as
below; `Compared:` takes one `path › test name` per entry, comma-separated,
or `none`.

```md
## E2E flow

Compared: e2e/session/session-creation.spec.ts › <test name>
Result: flow changed
Change: <old step> → <new step>
Intended: yes
Agent flow: e2e-agent/session/<flow>.e2e.ts
Ported from: e2e/session/session-creation.spec.ts (deleted)
```

| `Result` | Lines after `Result` |
|---|---|
| `no flow change` | `Reason: <why>` |
| `flow changed` / `new flow`, added | `Change`, `Intended: yes`, `Agent flow`, `Ported from: <spec> (deleted)` (when a spec covered it) |
| `flow changed` / `new flow`, not added | `Change`, `Intended: yes`, `Not added because: <reason>` |
| `awaiting human confirmation` | `Change` |

Pass it in the body at `gh pr create`; after `gh stack submit --auto`, add it
with `gh pr edit <n> --body-file`.

## 4. Non-interactive sessions

When `AskUserQuestion` is unavailable (`claude -p`, the nightly automation):
ask nothing and write no test. Use `Result: awaiting human confirmation` with
`Compared` and `Change`, then record as usual.

## 5. Record

When the outcome is settled (every outcome except "not intended"), record
HEAD with the hook's own record mode, so the path never drifts from the check:

```bash
.claude/scripts/require-e2e-flow.sh --record
```

Commit the draft test **before** recording, since the commit moves HEAD. The
record lives in the common git dir, so every worktree of the branch sees it.
Print the outcome line (`e2e-flow: <Result> @ <short sha>`). Any new commit
invalidates the record: rerun this skill, reusing the earlier answers when the
new commits do not touch the flow. `gh stack submit` is checked against the
current branch only; run the skill on each layer you changed.
