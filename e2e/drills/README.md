# Drill — on-demand scenarios with written explanations

A **drill** is one named scenario, executed and judged against a WebUI that is
**already running**, producing a **drill report** that explains every check in
plain words: what changed on screen, what to verify there, and where in the
code it comes from. Unlike the full Playwright suite, a drill boots nothing;
unlike the walkthrough, it really clicks, types and asserts, and it cleans up
after itself so the same drill can run again.

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
pnpm e2e:drill --list                    # ids in run order
pnpm e2e:drill folder-invitation         # run one drill
pnpm e2e:drill --all                     # run every drill, in order
pnpm e2e:drill folder-invitation --headed
E2E_PART=admin pnpm e2e:drill <id>       # same env-file selection as the suite
```

Running the same command again repeats the same scenario, from a clean state:
the folder name carries a unique per-run suffix and the previous run's folder
was removed in teardown.

The report is written to `e2e/drill-report/<id>/index.html` (or
`…/all/index.html`) — the CLI prints the path, and the page is self-contained
except for its screenshots, which sit next to it. It shows, per drill: pass or
fail, the prerequisites it assumed, and per step the PASS/FAIL/NOT RUN status,
what changed, what to verify, expected vs observed, the failure text, a
screenshot of the page the step left on screen, and links to the related code
(`path:line`, relative to the repository root).

## Data: mock first, real only where the check needs it

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

Real server data is for the cases where the backend itself is what the step
checks — a mutation, a permission the manager enforces, a value that must
round-trip (creating a folder, inviting an account, accepting an invitation).
Even then, create only the objects that check needs, name them `e2e-…`, and
remove them in teardown. A drill never changes server-global settings, mock or
not (the e2e admin-preparation rule): RBAC or cluster-wide state that only
exists on a dedicated test server is out of scope for a drill.

## Side effects and cleanup

- Every object a drill creates is named with the `e2e-` prefix plus this run's
  suffix (`e2e-drill-…`), and is declared in the shared registry
  (`e2e/utils/test-resources.ts`) so `cleanup()` removes it through the admin
  API — the same mechanism the specs use.
- Teardown is registered in the drill's `afterAll`, so it also runs when a step
  fails or the drill times out. A drill's own `teardown` (e.g. purging the
  folder, which also drops its shares and invitations) runs before the
  registry cleanup.
- A run that is killed outright can leave an `e2e-drill-*` folder behind. It is
  covered by the suite's existing prefix sweep; the same sweep can be run on
  its own, with the usual caution that it sweeps **every** `e2e-*` leftover on
  that server:

  ```bash
  pnpm exec playwright test --project cleanup
  ```

- Drills never change server-global settings. Admin-side state a drill needs is
  created and removed through the admin API, per the e2e admin-preparation
  rule (`.claude/rules/e2e-admin-prep-via-api.md`).

## Writing a drill

A drill is a definition file, `e2e/drills/<id>.drill.ts`, exporting one `Drill`
(type in `e2e/drills/types.ts`), listed in `e2e/drills/catalog.ts` (the only
listing; `order` then title decides the sequence, so a group of related drills —
RBAC prerequisites first, then the mutation that needs them — reads top to
bottom). `e2e/drills/drill.spec.ts` turns each catalog entry into one
Playwright test; `e2e/drills/drill-test.ts` runs the steps, screenshots each,
and writes the report.

```ts
export const myDrill: Drill = {
  id: 'my-drill',
  title: 'Short sentence a reader will see first',
  group: 'vfolders',
  order: 20,
  prerequisites: [
    'Which account, role, permission or server state must already exist',
  ],
  setup: async (ctx) => {
    name = ctx.resources.name('vFolder', 'e2e-drill-my-drill');
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
  teardown: async ({ resources }) => {
    // Optional: remove what the registry cannot.
    return 'What teardown removed.';
  },
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
- Data comes from mocks unless the step checks the backend itself; a live case
  creates only what that check needs (see "Data: mock first" above), names
  everything it creates with the `e2e-` prefix and registers it
  (`ctx.resources.name(kind, prefix)`). Teardown must leave nothing behind
  whether the steps passed or not.
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
