# Dev Plan: pnpm v11 Migration

- **Spec**: `.specs/FR-2840-pnpm-v11-migration/spec.md`
- **Epic**: FR-2840 — https://lablup.atlassian.net/browse/FR-2840
- **GitHub epic issue**: #7296
- **Delivery shape**: single sub-task → single PR (per direction)

## Sub-tasks

| # | Title | Tracker | Depends on | PR |
|---|---|---|---|---|
| 1 | Migrate config, workflows, and lockfile to pnpm v11 | FR-2840 (this issue) | — | TBD (single PR) |

The migration is intentionally not split because:

- The lockfile regen, the config moves (`pnpm.overrides` → `pnpm-workspace.yaml`), the `onlyBuiltDependencies` → `allowBuilds` conversion, and the workflow `version: 11` bump must land **atomically** to keep CI green at every commit. Splitting would force one of:
  - Land config-only first → CI installs still on v10, can't validate v11 install.
  - Land workflow bump first → CI tries v11 install with v10 config → guaranteed `ERR_PNPM_UNSUPPORTED_ENGINE` again.
- Documentation and `engine-strict` cleanup are too small to merit separate PRs.

## Sub-task 1 — execution outline

Mapped 1:1 to spec §5.

1. **Config moves** (no install yet, no lockfile change)
   - `package.json`: bump `engines.pnpm`, drop `pnpm` field, add `packageManager`.
   - `pnpm-workspace.yaml`: add `overrides`, swap `onlyBuiltDependencies` → `allowBuilds`.
   - `.npmrc`: drop `engine-strict=true`, leave a one-line comment explaining v11 auth/registry scope.

2. **Workflow bump**
   - Sed `version: 10` → `version: 11` across all 6 affected files (11 occurrences).
   - `vitest.yml:146` `pnpm/action-setup@v4` → `@v5` cleanup.

3. **Switch local pnpm to 11.x**
   - Use whatever method the contributor has (`corepack` or `npm i -g pnpm@11`). Local dev only — not part of the diff.

4. **Lockfile regenerate**
   - To regenerate the canonical lockfile under pnpm 11 (one-time during this PR), the contributor needs to bypass `minimumReleaseAge` because of upstream bugs in v11 (spec §5.4.1, [pnpm/pnpm#9963](https://github.com/pnpm/pnpm/issues/9963), [pnpm/pnpm#10699](https://github.com/pnpm/pnpm/issues/10699)):

     ```bash
     pnpm install --merge-git-branch-lockfiles --no-frozen-lockfile --config.minimum-release-age=0
     ```

     This command is for the migration commit only. CI itself does **not** run this — see step 5.
   - Reviewer must confirm:
     - `lockfileVersion: '9.0'` retained.
     - No `version:` line on a published package moved unintentionally (semver ranges are unchanged → drift is the surprise).
     - `settings:` block adopts v11 defaults — call out in PR body.
     - Per-branch `pnpm-lock.<branch>.yaml` files are NOT touched (`weekly-merge-branch-lockfiles.yml` handles those).
   - After this regen, every CI install lane runs `pnpm install --frozen-lockfile` against the resulting lockfile. No re-resolution happens in CI, so the `--config.minimum-release-age=0` override is not needed in CI workflows (with the single intrinsic exception of `weekly-merge-branch-lockfiles.yml`, which exists precisely to re-resolve and merge branch lockfiles).

5. **Local verification**
   - Run spec §6.1 checklist.
   - Capture `pnpm -v`, `bash scripts/verify.sh` output, and `pnpm run build` outcome in the PR description.

6. **Submit**
   - Branch off `main` (post-merge state of #7297 means workflows are on `version: 10`, baseline is consistent).
   - PR description includes the §8 acceptance checklist for the reviewer to tick.
   - Submit as draft → multi-agent review → flip to ready-for-review → Copilot → resolve → merge gate.

## Hand-off to implementation

Implementation agent receives:

- Spec path: `.specs/FR-2840-pnpm-v11-migration/spec.md`
- This dev plan (single sub-task).
- Authority to add `allowBuilds` entries with justification comments if v11 install demands it (spec §5.2 last paragraph).
- **No** authority to upgrade unrelated deps, drop `gitBranchLockfile`, or change `minimumReleaseAge` policy (spec §4 out-of-scope list).
