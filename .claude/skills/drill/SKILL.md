---
name: drill
description: Run one PR flow once with mocked writes and share a step-by-step report (screen, what changed, what to check) on the branch dev server at /__drill/<id>/. Only when the user asks.
argument-hint: <PR number> <flow in a sentence>
disable-model-invocation: true
---

# Drill

A drill runs one user flow of a PR once, against the branch's running dev
server, and leaves a report a reviewer steps through a screen at a time. It
exists for flows a walkthrough cannot show: a mutation, a second account, a
state the shared server does not have. Everything it writes is answered by a
mock, so the server does not change.

Run it only when the user asks. It is not part of the implementation workflow
and never runs on its own.

## Rules

- **The scenario file is one-off.** Write it under the job's scratch folder
  (`$CLAUDE_JOB_DIR/tmp/drills/<id>.drill.ts`), never in the repository. Nothing
  under `e2e/` names a scenario; share the report, not the file.
- **Writes are mocks.** The runner aborts any write no mock answered and fails
  that step (`e2e/drills/write-guard.ts`). Do not route around it. Reads may
  reach the server.
- **One step per screen change** a reviewer should see: a dialog opened, a
  field filled, a row added, a toast, the other account's view. The step's
  screenshot is taken after its `run`, so leave dialogs open on the frame the
  step is about.
- **Korean text.** `title`, `changed` and `verify` are read by reviewers on the
  report page; write them in Korean, name what is on screen, never a locator
  or function name. `code` points at `react/src` lines that render the frame.

## 1. Server

The report is served by the branch's own dev server, so boot it first with the
`dev-server` skill (or reuse the live one its boot record names). Boot it with
the endpoint only, no pre-filled password: a server that signs in by itself
fights the drill's sign-in.

## 2. Find what to mock

Open the flow in a browser against that server and record the network calls
the flow makes (`page.on('request')`). Every POST that is a GraphQL
`mutation`, and every non-GET REST call, needs a mock:

- GraphQL: `ctx.mockGraphQL({ OperationName: (variables) => data })`, the
  shape taken from the operation's generated artifact in
  `react/src/__generated__/`.
- REST, or a read that must show the mocked object (a list that should now
  include it): `page.route` on that page, fetch the real answer, add the mocked
  item. Register it on every page the drill opens, including `ctx.as()` pages.

## 3. Write and run

The drill file exports `drill: Drill` (`e2e/drills/types.ts`) and imports the
repository by absolute path. Then:

```bash
cp e2e/envs/.env.playwright "$CLAUDE_JOB_DIR/tmp/drill.env"
# set E2E_WEBUI_ENDPOINT in that copy to the dev server's share URL
NODE_OPTIONS="--require $PWD/.claude/skills/drill/scripts/stub-backend-ai-ui.cjs" \
E2E_ENV_FILE="$CLAUDE_JOB_DIR/tmp/drill.env" \
pnpm e2e:drill "$CLAUDE_JOB_DIR/tmp/drills/<id>.drill.ts"
```

- `E2E_ENV_FILE`, not a shell `E2E_WEBUI_ENDPOINT`: the env file overrides the
  shell.
- The stub stands in for `backend.ai-ui`, which e2e helpers reach through
  `react/src/helper/const-vars.ts` and Node cannot load as CommonJS.
- Open every screenshot in `e2e/drill-report/<id>/` and check it shows what its
  step says before sharing. A sign-in that times out on the second account is
  usually transient; run once more before changing the drill.

## 4. Share

Give the user `<dev server share URL>/__drill/<id>/`. Anyone on the dev
gateway opens it; nothing is uploaded, and it goes away with the worktree and
its dev server. Post it to a PR or a Teams thread only when the user asks.
