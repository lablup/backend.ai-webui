# Drill — on-demand scenarios with written explanations

A **drill** is one scenario file, run once and judged against a WebUI that is
**already running**, producing a **drill report** that explains every check in
plain words: what changed on screen, what to verify there, and where in the
code it comes from. Unlike the full Playwright suite, a drill boots nothing;
unlike the walkthrough, it really clicks, types and asserts. Its data comes
from mocks, so it changes nothing on the server.

A drill is not a replacement for the suite in CI: it exists for the flows a
reviewer wants to exercise on demand (a mutation, a permission combination),
where booting a local cluster is the painful part.

## Running a drill

Prerequisites:

- a reachable WebUI and manager (`E2E_WEBUI_ENDPOINT`), normally from
  `e2e/envs/.env.playwright` (copy the `.sample` once);
- the standard e2e accounts — `E2E_USER_*` (the actor) and, for scenarios that
  need a second person, `E2E_USER2_*` (see `e2e/utils/test-util.ts`).

```bash
pnpm e2e:drill /tmp/my-flow.drill.ts           # run one drill file
pnpm e2e:drill /tmp/my-flow.drill.ts --headed
E2E_PART=admin pnpm e2e:drill <file>           # same env-file selection as the suite
E2E_ENV_FILE=/tmp/drill.env pnpm e2e:drill <file>  # another server: the env file wins over the shell
```

Drill files are one-off: keep them outside the repository (a scratch folder)
and share the result, not the file. Nothing under `e2e/drills/` names a
scenario.

The report is written to `e2e/drill-report/<id>/index.html` (git-ignored) — the CLI prints the path, and the page is self-contained
except for its screenshots, which sit next to it. It shows, per drill: pass or
fail, the prerequisites it assumed, and per step the PASS/FAIL/NOT RUN status,
what changed, what to verify, expected vs observed, the failure text, a
screenshot of the page the step left on screen, and links to the related code
(`path:line`, relative to the repository root).

## Data: mocks only

A drill proves what a screen says, not that a server state can be built. So the
state a step only **shows** — a role combination, a permission set, a list, a
setting — is answered from mocks, not seeded on the server:

```ts
setup: async (ctx) => {
  await ctx.mockGraphQL({
    SomePageQuery: () => ({
      /* every field the operation selects */
    }),
  });
},
```

`ctx.mockGraphQL` (from `e2e/mocks/session/graphql-interceptor.ts`) answers the
named operations on every page of the drill, including pages `ctx.as()` opens
later; register it before the navigation that reads it. Payloads are shared
with the suite: start from `e2e/mocks/<area>/`, and copy a real response shape
when writing a new one rather than guessing the fields.

The runner enforces this: on every drill page a write no mock answered is
aborted, and the step it happened in fails with the blocked requests listed
(`e2e/drills/write-guard.ts`). A write the UI sends (a create, an invite, an
accept) is answered by a mock too, with the response the UI expects, so the screen after it can be checked
without the server changing. REST calls go through `page.route`. A drill never
changes server data or server-global settings.

## Writing a drill

A drill is a scratch file exporting one `drill: Drill` (type in
`e2e/drills/types.ts`; import it and the helpers by absolute path).
`e2e/drills/drill.spec.ts` loads the file `E2E_DRILL_FILE` names (the CLI sets
it) as one Playwright test; `e2e/drills/drill-test.ts` runs the steps, screenshots each,
and writes the report.

```ts
export const drill: Drill = {
  id: 'my-drill',
  title: 'Short sentence a reader will see first',
  group: 'vfolders',
  order: 20,
  prerequisites: [
    'Which account, role, permission or server state must already exist',
  ],
  setup: async (ctx) => {
    await ctx.mockGraphQL({/* … */});
  },
  steps: [
    {
      id: 'do-the-thing',
      title: 'What the step does, in the imperative',
      changed: 'What is different on screen once this step succeeds.',
      verify: 'What the reader should look at to believe it.',
      expected: 'One line a pass is judged against.',
      code: [{ path: 'react/src/components/Thing.tsx', line: 120, to: 140 }],
      run: async (ctx) => {
        // Drive the UI and assert. Reuse e2e/utils helpers.
        return 'What was observed, one line.';
      },
    },
  ],
};
```

Writing rules:

- `changed` / `verify` are read by someone who has never opened the spec: name
  what appears (dialog, row, toast), not which locator matched.
- 1–3 `code` refs per step, pointing at the code that produces what the step
  shows (`path` relative to the repository root, 1-based `line`, optional
  `to`), not at the spec.
- Reuse `e2e/utils/test-util.ts` and the POM helpers; a drill that re-implements
  a click path will drift from the suite.
- Every request that would write answers from a mock (`ctx.mockGraphQL` for
  GraphQL, `page.route` for REST); a drill never creates, changes or deletes
  server data. Signing in and reads the mocks do not cover reach the server.
- Use `ctx.as('user2' | 'admin')` for a second account; `ctx.activePage` is
  what the per-step screenshot captures, so call `ctx.as(...)` before acting on
  another account.
- Do not touch the walkthrough skill or the review overlay; a drill's
  explanation is its own.

## Relationship to the rest of `e2e/`

- Env selection, accounts and helpers are shared with the suite (`e2e-parts.ts`,
  `utils/test-util.ts`, `utils/admin-api.ts`).
- Drills live outside the `E2E_PART` folder rule, so a normal suite run never
  picks them up (the drill project's `testDir` is `e2e/drills/`).
- The walkthrough (`.claude/skills/walkthrough/`) guides a reviewer to an
  element and executes nothing; the two stay separate by design.
