---
name: ui-common-change
description: >
  Change @lablup/ui-common (lablup/ui-common) as part of a webui task and verify
  it in the webui PR before the ui-common PR merges: edit ui-common in its own
  worktree through a subagent, open its PR, wait for the `pr-<N>` preview it
  publishes, pin that preview here with `pnpm run ui-common:pin pr-<N>`, run the
  normal webui flow (verify, PR, dev server, walkthrough), then repin to the
  canary once the ui-common PR merges. Also covers moving the pin to a canary or
  release on its own. Trigger on: a webui change that needs a ui-common fix or
  new prop/component, "ui-common도 고쳐야 해", "ui-common 수정해서 webui에 반영",
  "ui-common PR 미리보기로 검증", "ui-common 버전 올려줘", "pin ui-common",
  "bump ui-common to canary", "ui-common:pin".
---

# Changing ui-common from a webui task

The webui consumes `@lablup/ui-common` and `@lablup/ui-common-cli` as one exact
catalog pin in `pnpm-workspace.yaml` (ADR 0009). lablup/ui-common publishes:

| When                      | dist-tag | Version                              | May merge in webui?  |
| ------------------------- | -------- | ------------------------------------ | -------------------- |
| push to a same-repo PR    | `pr-<N>` | `0.2.0-alpha.19.pr-<N>-<time>-<sha>` | **no** — CI fails it |
| merge to ui-common `main` | `canary` | `0.2.0-alpha.19.canary-<time>-<sha>` | yes                  |
| hand-cut release          | `next`   | `0.2.0-alpha.20`                     | yes                  |

`pnpm run ui-common:pin <target>` (`scripts/ui-common-pin.mjs`) is the only way
to move the pin: it resolves the target to one exact version, moves both lines,
installs, runs `ui-common upgrade --from <old>` when the version moved forward,
and regenerates both UI-COMMON agent blocks. Never edit the two catalog lines
by hand.

## 0. Does it belong in ui-common?

`.claude/rules/bui-component-home.md`: product-neutral → ui-common; depends on
Backend.AI → BUI (`packages/backend.ai-ui`). Never fork a ui-common component
into webui to avoid this flow.

## 1. Change ui-common in its own worktree, through a subagent

ui-common is a sibling checkout (`~/Workspace/ui-common`, next to this
repository's main worktree) with its own `CLAUDE.md`, rules and verification.
A session started here does not load them, so do not edit it from this
session's context. Create a worktree, then hand the change to a subagent:

```bash
UC=~/Workspace/ui-common
git -C "$UC" fetch -q origin
git -C "$UC" worktree add -b <type>/<slug> ~/Workspace/ui-common-wt/<slug> origin/main
```

Subagent prompt (English), at minimum:

- Work only in `~/Workspace/ui-common-wt/<slug>`. Read its `CLAUDE.md` and
  `CONTRIBUTING.md` first and follow them, not webui's rules.
- The change: what webui needs and why, the API shape you expect.
- Add a `CHANGELOG.md` `[Unreleased]` entry. If the change needs an upgrade
  codemod, also bump both `package.json` versions to the release that will carry
  it ("prepare 0.2.0-alpha.N"): `ui-common upgrade` runs a step only for
  versions up to the pin, and the preview of `alpha.N` sorts after `alpha.N`.
- `pnpm install && pnpm run verify` must pass. Commit, push, and open a **draft**
  PR on lablup/ui-common (ui-common's title convention, no Claude attribution).
- Return: the PR number, the branch, and the verify result.

Check the returned PR exists and its diff is what webui needs before going on.

## 2. Wait for the preview and pin it

Every push to the ui-common PR runs its Publish workflow (`pr-<N>`; about 5–10
minutes: it runs ui-common's full verify first). Wait for it, do not poll:

```bash
RUN=$(gh run list -R lablup/ui-common --workflow Publish --branch <type>/<slug> -L 1 --json databaseId -q '.[0].databaseId')
gh run watch "$RUN" -R lablup/ui-common --exit-status
```

The PR then carries one comment starting `<!-- ui-common-preview -->` with the
exact version. Pin it in the webui worktree:

```bash
pnpm run ui-common:pin pr-<N>        # or the exact version from the comment
```

If the dist-tag has not propagated yet (`is not published`), pin the exact
version from the comment. If the Publish run failed, read its log: a ui-common
verify failure is ui-common's to fix (back to step 1), not something to work
around here. When `react/ui-common-upgrade-report.md` appears, read it, act on
it, and delete it before committing.

Faster local loop, optional: `pnpm run ui-common:pin local [dir]` builds and
packs a ui-common checkout (default `~/Workspace/ui-common`; pass the worktree
path) into `node_modules/.cache/ui-common-local` and points an `overrides`
block in `pnpm-workspace.yaml` at the tarballs (pnpm refuses `file:` in a
catalog). Rerun it after each ui-common edit. A local pin fails `verify.sh`;
any registry pin (`pr-<N>`) removes the block, so switch to the preview before
committing.

## 3. The normal webui flow, on the preview

Implement and commit the webui side, then `bash scripts/verify.sh` (its
`ui-common pin` lane notes the preview and passes), open the webui PR, boot the
dev server, and run the walkthrough exactly as `CLAUDE.md` describes. The dev
server and CI install the preview from npm like any other version.

In the webui PR body, right under `Resolves #N`:

```
Depends on lablup/ui-common#<N> — pinned to its preview `<version>`; repin to the canary after it merges.
```

and link the webui PR from the ui-common PR (a comment) so its reviewers see the
consumer. Typecheck's "Check the ui-common pin is released" step stays red
until the repin: that is the merge guard, not a failure to fix in webui.

Each later push to the ui-common PR publishes a new preview; rerun
`pnpm run ui-common:pin pr-<N>` to take it.

## 4. After the ui-common PR merges

The merge publishes a canary (`Publish` on ui-common `main`). Wait for that run,
then in the webui branch:

```bash
pnpm run ui-common:pin canary
git commit -am "chore(#N): pin @lablup/ui-common to the canary of lablup/ui-common#<N>"
```

Push, update the PR body's `Depends on` line to say it merged, and let the
pin check go green. Only then can the webui PR leave draft through
`fw:pr-ready-gate`.

The ui-common PR merges first, always. If it is abandoned, repin to a released
version (`pnpm run ui-common:pin next` or the previous exact version) and drop
the webui side that depended on it.

## Pinning without a ui-common change

`pnpm run ui-common:pin canary` (latest merged), `next` (latest prerelease), or
an exact version. Commit `pnpm-workspace.yaml`, `pnpm-lock.yaml`, both
`AGENTS.md` files and any codemod edits together.
