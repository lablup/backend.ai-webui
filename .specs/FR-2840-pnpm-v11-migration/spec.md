# Spec: Migrate to pnpm v11

- **Jira**: FR-2840 — https://lablup.atlassian.net/browse/FR-2840
- **GitHub issue**: #7296
- **Predecessor**: FR-2839 / PR #7297 — temporarily pinned CI to pnpm v10
- **Reference**: pnpm v11 release notes — https://pnpm.io/blog/releases/11.0
- **Delivery**: single PR (per direction)

## 1. Goal

Move the entire monorepo's pnpm runtime from v10 to v11 in a single, reviewable PR:

- Local installs (`pnpm install`) and CI installs both run under pnpm 11.x.
- All workflows that install pnpm pin to `version: 11`.
- All pnpm-specific configuration is stored in v11-supported locations.
- The lockfile is regenerated under pnpm 11 with no functional dependency drift.

## 2. Background

`pnpm/action-setup` started resolving `version: latest` to **pnpm 11.0.8**, which violated this repo's `engines.pnpm: ^10.16.0` and broke CI installs (`ERR_PNPM_UNSUPPORTED_ENGINE`). FR-2839 unblocked CI by pinning workflows to v10. This spec finishes the upgrade so we don't get stuck on v10 indefinitely.

## 3. Pre-flight repository audit

Audited current state to scope the migration:

| Concern | Current state | Implication |
|---|---|---|
| `engines.pnpm` | `^10.16.0` (only at root `package.json`) | Single bump; no nested `engines.pnpm` to coordinate. |
| `pnpm` field in `package.json` | Present at lines 106–112 with three `overrides` entries (`tar-fs@2`, `node-forge`, `@codemirror/state`). | Must move; v11 ignores this field. |
| `pnpm-workspace.yaml` | Already holds `catalog`, `gitBranchLockfile: true`, `minimumReleaseAge`, `minimumReleaseAgeExclude`, `onlyBuiltDependencies` (9 entries), `patchedDependencies`. | Will absorb `overrides`; `onlyBuiltDependencies` must convert to `allowBuilds`. |
| `.npmrc` | Single line: `engine-strict=true`. | Behaviour-only setting. v11 still respects `engines.pnpm` strictly via its own logic; the line is now scoped out of `.npmrc` (auth/registry only). Treated as redundant — see §5.5. |
| `auditConfig.ignoreCves` | None present in any config file. | No GHSA migration work. |
| Exotic deps (`git+`, `github:`, `file:..`) | None found in any workspace `package.json`. | New `blockExoticSubdeps: true` default has no surface area to break. |
| Lockfile | `lockfileVersion: '9.0'`. | pnpm 11 still uses v9 lockfile format; regen will not change the version, but dependency tree may shift. |
| Node version | `.nvmrc: 24`; CI uses `node-version-file: ".nvmrc"`. | Already satisfies pnpm 11's Node ≥ 22 requirement. |
| Workflows installing pnpm | 6 files, 11 occurrences (currently `version: 10` after FR-2839). | Bump to `version: 11`. |

## 4. Out of scope

- Adopting v11's new `allowBuilds` map's *additive* gate semantics beyond a 1:1 conversion of the existing allow-list.
- Reviewing whether the existing `minimumReleaseAge` / `minimumReleaseAgeExclude` policy is still desirable — kept as-is unless install fails under v11.
- Dropping the `gitBranchLockfile: true` policy.
- Major dependency upgrades. The lockfile regeneration must not be used as a vehicle for `pnpm update` or `pnpm dedupe`.

## 5. Required changes

### 5.1 `package.json`

```diff
   "engines": {
-    "pnpm": "^10.16.0"
+    "pnpm": "^11.0.0"
   },
```

Remove the `pnpm` block entirely:

```diff
-  "pnpm": {
-    "overrides": {
-      "tar-fs@2": "2.1.4",
-      "node-forge": ">=1.3.2",
-      "@codemirror/state": "6.5.4"
-    }
-  },
```

Add a `packageManager` field so `pnpm/action-setup` (and Corepack-aware tooling) can auto-detect:

```diff
+  "packageManager": "pnpm@11.0.8",
```

The exact patch version is whatever `pnpm 11.x latest` resolves to at implementation time (currently 11.0.8 per the failing CI log).

### 5.2 `pnpm-workspace.yaml`

Append `overrides` (moved from `package.json`):

```yaml
overrides:
  tar-fs@2: 2.1.4
  node-forge: '>=1.3.2'
  '@codemirror/state': 6.5.4
```

Replace `onlyBuiltDependencies` with `allowBuilds` (1:1 conversion — same packages, equivalent semantics):

```diff
-onlyBuiltDependencies:
-  - bufferutil
-  - core-js
-  - core-js-pure
-  - electron
-  - es5-ext
-  - esbuild
-  - sharp
-  - unrs-resolver
-  - utf-8-validate
+allowBuilds:
+  bufferutil: true
+  core-js: true
+  core-js-pure: true
+  electron: true
+  es5-ext: true
+  esbuild: true
+  sharp: true
+  unrs-resolver: true
+  utf-8-validate: true
```

If a v11 install rejects an additional package's build script, add it to `allowBuilds` with a one-line justification comment in the same change (don't loop back through the spec).

### 5.3 `.npmrc`

Delete `engine-strict=true`. Rationale: v11 enforces `engines.pnpm` natively when set; the dual-source setting becomes confusing. If retained, the file violates v11's "auth/registry only" guidance. The behaviour we care about (refuse install when pnpm major mismatches) is still enforced by v11 because `engines.pnpm: ^11.0.0` is set.

If `.npmrc` becomes empty, leave a single comment line `# auth/registry overrides only — pnpm-specific settings live in pnpm-workspace.yaml` so the file's purpose stays discoverable.

### 5.4 Strict-default audit (no changes if defaults are acceptable)

| New v11 default | Acceptable here? | Action |
|---|---|---|
| `minimumReleaseAge: 1440` | Currently set explicitly to `10080`. Explicit value wins, but v11 enforces it more strictly than v10 — see §5.4.1. | Workflow-level override (see §5.4.1). |
| `blockExoticSubdeps: true` | No exotic deps in workspace (audit §3). | None. |
| `strictDepBuilds: true` | Could surface dep build failures we currently swallow. **Verify on first install**; add specific package opt-outs only if a previously-silent build now fails. | Verify; document any opt-outs. |
| `verifyDepsBeforeRun: true` | Forces lockfile freshness checks; aligns with our existing CI install. | None — accept the new default. |

#### 5.4.1 minimumReleaseAge under pnpm 11 — workflow-level override

Empirically, pnpm 11's stricter `minimumReleaseAge` enforcement breaks `pnpm install` against this dep tree in two ways:

1. **`ERR_PNPM_MISSING_TIME` (cache/metadata bug).** Pnpm 11 fatals on packages whose npm registry abbreviated metadata is missing the `time` field, even though the full metadata file has it. Tracked upstream in [pnpm#9963](https://github.com/pnpm/pnpm/issues/9963) (closed but recurring) and [pnpm#9968](https://github.com/pnpm/pnpm/issues/9968) (closed in 10.16.1 — fix is partial). Maintainer comment on #9963: *"the error should not happen at all. The full metadata and the abbreviated one are stored at different locations."* The recommended workaround `pnpm store prune` did not produce stable results in our environment — the error reappears on subsequent installs.

2. **Optional/platform-specific binaries trigger fatals.** `vitest`/`rollup`'s `optionalDependencies` field includes 15+ `@rollup/rollup-*` platform binaries (darwin-arm64, win32-arm64-msvc, linux-loong64-gnu, …). pnpm 11 fatals on each one's missing `time` metadata, even though the user's machine doesn't need most of them. Same shape as [pnpm#10699 (open)](https://github.com/pnpm/pnpm/issues/10699).

Maintaining a `minimumReleaseAgeExclude` list against (1)+(2) is fragile: every new rollup architecture binary, every npm registry metadata corruption, and every recent typescript-eslint family bump (currently `@typescript-eslint/* 8.59.2` released 3 days ago) re-breaks installs. The list grew to 30+ entries during empirical iteration without converging.

**Decision**: switch every CI install lane to `--frozen-lockfile` so installs use exactly the lockfile contents, with no re-resolution and therefore no `minimumReleaseAge` evaluation. The single intrinsic exception is `weekly-merge-branch-lockfiles.yml`, whose purpose **is** to merge per-branch lockfiles into the canonical (so it must re-resolve and must keep `--config.minimum-release-age=0`).

Concretely:

| Workflow | Mode | Override needed? |
|---|---|---|
| `vitest.yml` (3 jobs) | `--frozen-lockfile` (was `--merge-git-branch-lockfiles --no-frozen-lockfile`) | ❌ No |
| `package.yml` (5 lines) | `--frozen-lockfile` (was `--no-frozen-lockfile`) | ❌ No |
| `daily-test-improver/coverage-steps/action.yml` | `--frozen-lockfile` (was `--no-frozen-lockfile`) | ❌ No |
| `publish-backend.ai-ui.yml` | `--frozen-lockfile` | ❌ No |
| `publish-backend.ai-docs-toolkit.yml` | `--frozen-lockfile` | ❌ No |
| `e2e-watchdog.{md,lock.yml}` | `--frozen-lockfile --prefer-offline` | ❌ No |
| `e2e-healer.{md,lock.yml}` | `--frozen-lockfile --prefer-offline` | ❌ No |
| `weekly-merge-branch-lockfiles.yml` | `--merge-git-branch-lockfiles --no-frozen-lockfile` | ✅ Yes (intrinsic) |

Trade-off accepted: PRs that change deps must run `pnpm install` locally and commit the updated `pnpm-lock.yaml` (or `pnpm-lock.<branch>.yaml`) before pushing. CI no longer auto-resolves — that's a stricter contract but a more honest one.

Local devs can manually override (`pnpm install --config.minimum-release-age=0`) when adding/upgrading deps until pnpm fixes #9963 / #10699.

`minimumReleaseAge: 10080` stays in `pnpm-workspace.yaml` to enforce the policy on the lockfile-update paths (local dev installs and the weekly merge job), where new deps actually enter the resolved tree.

### 5.5 Workflows

Bump all 11 `pnpm/action-setup` invocations from `version: 10` to `version: 11`:

- `.github/workflows/vitest.yml` — 3 occurrences
- `.github/workflows/package.yml` — 4 occurrences
- `.github/workflows/publish-backend.ai-ui.yml` — 1 occurrence
- `.github/workflows/publish-backend.ai-docs-toolkit.yml` — 1 occurrence
- `.github/workflows/weekly-merge-branch-lockfiles.yml` — 1 occurrence
- `.github/actions/daily-test-improver/coverage-steps/action.yml` — 1 occurrence

Also: `vitest.yml:146` is `pnpm/action-setup@v4` while siblings are `@v5`. Bump that to `@v5` while in the area (cleanup observed in PR #7297 review).

### 5.6 Lockfile

Regenerate under pnpm 11 with the same flag set CI uses:

```bash
pnpm install --merge-git-branch-lockfiles --no-frozen-lockfile --config.minimum-release-age=0
```

Expected diff: `lockfileVersion: '9.0'` retained; package set retained; settings block may pick up v11 defaults. Reviewer must check that no semver range resolution silently widened — diff `pnpm-lock.yaml` against `main` and confirm only entries we intended to touch (and `settings:` block changes) appear.

The `minimumReleaseAgeExclude` block is removed from `pnpm-workspace.yaml`. Its entries (e.g., `react@19.2.4`, `i18next@25.7.4`) were stale — they pinned exact versions that the catalog has long since moved past, so they no longer matched anything in the resolved tree. With the workflow-level override (§5.4.1) now bypassing the age check at install time, no exclude list is needed.

### 5.7 Documentation

- `DEV_ENVIRONMENT.md` — update if any line references a specific pnpm major. (Audit found no such line; if absent, no edit.)
- `CLAUDE.md` — does not pin pnpm version; no change.
- `README.md` — verify and update only if it pins a pnpm major.

## 6. Verification

### 6.1 Local

1. `pnpm install` succeeds with no `ERR_PNPM_UNSUPPORTED_ENGINE`, no missing build-script warning, no exotic-subdep block.
2. `pnpm -v` reports an 11.x version.
3. `bash scripts/verify.sh` ends with `=== ALL PASS ===`.
4. `pnpm run build` produces `build/web/` and the workspace package outputs without errors.
5. Pre-commit hook smoke: stage a trivial file change and run `git commit` — `lint-staged` paths still run (`react/`, `packages/backend.ai-ui/`, `e2e/`, `resources/i18n/`).

### 6.2 CI (on the PR)

1. Existing path-filtered jobs (`Analyze`, `CodeQL`, `triage`, `mergeability_check`, `auto-label`, `sync-project-status`) pass.
2. Because the PR touches `pnpm-lock.yaml` / `package.json` / `pnpm-workspace.yaml` / `.github/workflows/*`, any path-gated workflow that `react-vitest`, `backend-ai-ui-vitest`, `root-vitest`, `storybook-check`, `package`-build run on triggers and passes.

### 6.3 Acceptance

- All §5.1–§5.7 changes land in a single PR with `Resolves #7296(FR-2840)`.
- Lockfile diff is reviewer-explainable (no unrelated dependency upgrades).
- The single-PR delivery preserves bisection: the merge commit is the bisection point if anything regresses post-merge.

## 7. Risks & rollback

| Risk | Likelihood | Mitigation / rollback |
|---|---|---|
| `pnpm install` under v11 surfaces a previously-silent build script failure (`strictDepBuilds`). | Medium. | Add the offending package to `allowBuilds` with a justification comment. If the failure is genuine (not a missing allow-list entry), file a follow-up issue and pin a workaround in the PR. |
| Lockfile regeneration shifts dependency versions unexpectedly. | Low — semver ranges unchanged. | Reviewer compares `pnpm-lock.yaml` diff for any package whose `version` line moved; if so, decide case-by-case whether to accept or revert that entry. |
| Workflow `version: 11` → action-setup resolves a 11.x patch with a regression. | Low. | Re-pin to a specific patch (e.g. `version: 11.0.8`) and open a tracking issue. |
| pre-commit hook (`husky` + `lint-staged`) breaks under v11's `verifyDepsBeforeRun`. | Low. | Hook config does not call `pnpm install`; only spawns commands. If breakage occurs, downgrade `verifyDepsBeforeRun` only for hook contexts via env var. |
| Rollback after merge. | — | Single revert of the PR restores v10 state in one commit; FR-2839's `version: 10` pin can be reapplied. |

## 8. Acceptance checklist (for verify-spec step)

- [ ] `package.json` `engines.pnpm` is `^11.0.0`.
- [ ] `package.json` no longer has a top-level `pnpm` field.
- [ ] `package.json` declares `packageManager` at `pnpm@11.x`.
- [ ] `pnpm-workspace.yaml` has the three overrides previously in `package.json`.
- [ ] `pnpm-workspace.yaml` uses `allowBuilds` (map) not `onlyBuiltDependencies` (list).
- [ ] `.npmrc` no longer contains `engine-strict=true`.
- [ ] All 15 `pnpm/action-setup` invocations use `version: 11` (6 standard workflow files, 1 composite action, 4 agentic `.md` / `.lock.yml` files).
- [ ] All CI `pnpm install` invocations use `--frozen-lockfile`. The only exception is `weekly-merge-branch-lockfiles.yml`, whose intrinsic purpose is to re-resolve and merge per-branch lockfiles — it carries `--merge-git-branch-lockfiles --no-frozen-lockfile --config.minimum-release-age=0`.
- [ ] No other workflow file contains `--config.minimum-release-age=0` or `--no-frozen-lockfile`.
- [ ] All `pnpm/action-setup` references use `@v5` or the matching v5 SHA: `vitest.yml` (3), `package.yml` (4), `publish-backend.ai-ui.yml`, `publish-backend.ai-docs-toolkit.yml`, `weekly-merge-branch-lockfiles.yml`, `daily-test-improver/coverage-steps/action.yml`, `e2e-watchdog.{md,lock.yml}`, `e2e-healer.{md,lock.yml}`. `.github/aw/actions-lock.json` is updated to the v5 SHA.
- [ ] `pnpm-workspace.yaml` no longer contains a `minimumReleaseAgeExclude` block.
- [ ] `pnpm-lock.yaml` regenerated; reviewer confirms no unintended dep upgrades.
- [ ] CI on the PR passes (Analyze/CodeQL/triage/etc.).
- [ ] PR description references `Resolves #7296(FR-2840)` and links the v10-pin predecessor PR (#7297).
