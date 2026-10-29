---
name: create-release
description: Cut a Backend.AI WebUI release — tag an alpha straight from `main`, or cut/update the `MAJOR.MINOR` release branch for beta/rc/stable — create the GitHub release, and open the PR that moves `main` to its next version.
argument-hint: "[26.4.0 | 26.4.0-alpha.1 | 26.4.0-beta.0]"
model: sonnet
disable-model-invocation: true
---

# Create Release

Cut a Backend.AI WebUI release, create its GitHub release, and move `main` to the
next version.

## Release model

| Release                            | Cut from                            | Release commit                    | `main` afterwards                    |
| ---------------------------------- | ----------------------------------- | --------------------------------- | ------------------------------------ |
| `X.Y.0-alpha.N`                    | `origin/main` HEAD, tagged as is    | none                              | bump PR to `X.Y.0-alpha.N+1`         |
| `X.Y.0-beta.0` (first of the line) | new branch `X.Y` from `origin/main` | `release: vX.Y.0-beta.0` on `X.Y` | bump PR to the next line's `alpha.0` |
| later beta / rc / stable / patch   | existing branch `X.Y`               | `release: v{VERSION}` on `X.Y`    | unchanged                            |

- **Alphas are snapshots of `main`.** `main`'s `package.json` already holds the
  next alpha version (the previous run's bump PR put it there), so the alpha tag
  goes on `origin/main` HEAD with no commit and no release branch.
- **The release branch starts at `beta.0`** (feature freeze). From then on fixes
  reach it through `cherry-pick-to-release`, not by merging `main`.
- The tagged commit's `version.json` / `index.html` build stamps can be stale:
  the release build (`.github/workflows/package.yml`, `build_web`) runs
  `make versiontag` itself, so the artifact carries the right version and build
  number. Only `package.json` must hold the released version.

## Arguments

`$ARGUMENTS` specifies the version to release (e.g., `26.4.0`, `26.4.0-alpha.1`, `26.4.0-beta.0`).

### If Arguments Not Provided

1. Read the version from `origin/main`'s root `package.json` (`git show origin/main:package.json`).
2. Check whether its tag already exists (`git ls-remote --tags origin v{that version}`).
3. Offer options via `AskUserQuestion`, labels filled with computed versions:
   - `main` reads `26.4.0-alpha.2` with no `v26.4.0-alpha.2` tag → suggest
     `26.4.0-alpha.2` (recommended), `26.4.0-beta.0`, custom.
   - The tag already exists (the bump PR has not merged) → say so and suggest
     merging the open bump PR first; the next alpha would otherwise repeat a version.
   - Branch `X.Y` is on beta/rc → suggest the next `beta.N` / `rc.N` / stable `X.Y.0`.
   - "다음 알파" / "next alpha" means the version `main` already reads.

## Process

### 1. Validate Prerequisites

- Validate the version format: `X.Y.Z` or `X.Y.Z-{alpha|beta|rc}.N`.
- `git fetch origin main --tags` and confirm `v{VERSION}` does not exist yet.
- Do the work in a fresh worktree, not the user's checkout — their local `main`
  may be stale and may hold untracked files:
  ```bash
  git worktree add .claude/worktrees/release-{VERSION} origin/main --detach
  ```
- Stage with `git add -u`, never `git add -A` — untracked scratch files must not
  enter a release commit.

### 2a. Alpha — tag `main`

1. Confirm `git show origin/main:package.json` reads exactly `{VERSION}`. If not,
   stop: either the bump PR for this alpha has not merged, or the requested
   version skips one. Report which.
2. Tag and push:
   ```bash
   git tag v{VERSION} origin/main
   git push origin v{VERSION}
   ```
3. `{TARGET}` for the GitHub release is `main`.

### 2b. First beta (`X.Y.0-beta.0`) — create the release branch

1. If `origin/X.Y` does not exist:
   ```bash
   git switch -c X.Y origin/main
   ```
   If it exists (an older run cut it at an alpha), check it out and merge
   `origin/main`. Conflicts limited to `version.json` / `index.html` are build
   stamps — take `origin/main`'s side; step 3 rewrites them. Any other conflict:
   stop and report.
2. Continue with step 3.

### 2c. Later beta / rc / stable / patch — use the release branch

```bash
git switch -c X.Y origin/X.Y   # or check out the existing local branch and pull
```

Do not merge `main` into it. Missing fixes are backported with
`cherry-pick-to-release` before cutting. Continue with step 3.

### 3. Release Commit (2b / 2c only)

1. Set `version` in root `package.json` to `{VERSION}` with the Edit tool.
2. `make versiontag` — propagates it to `version.json`, `index.html`,
   `manifest.json`, `react/package.json`, `packages/backend.ai-ui/package.json`,
   `packages/backend.ai-docs-toolkit/package.json`, `electron-app/package.json`.
3. Commit, tag, push:
   ```bash
   git add -u
   git commit -m "release: v{VERSION}"
   git tag v{VERSION}
   git push -u origin X.Y
   git push origin v{VERSION}
   ```
4. `{TARGET}` for the GitHub release is `X.Y`.

### 4. Create GitHub Release

Base tag (`git tag --sort=-version:refname`, skipping the tag just created):

- **Stable**: the most recent stable tag (no `-alpha` / `-beta` / `-rc`).
- **Prerelease**: the most recent tag of any type.

```bash
gh release create v{VERSION} \
  --title "v{VERSION}" \
  --generate-notes \
  --notes-start-tag {BASE_TAG} \
  --target {TARGET} \
  --prerelease            # alpha / beta / rc only
```

As soon as it returns the URL, report it in a short standalone message
(`✅ Release created: <url>`), then continue without waiting.

### 5. Bump `main` (alpha and first beta)

`main` is protected, so the bump is a PR. Without it the next alpha would carry
the version just released.

- After `X.Y.0-alpha.N` → `X.Y.0-alpha.N+1`, version files only (below).
- After `X.Y.0-beta.0` → the next release line's `alpha.0` (`26.10` → `26.11.0-alpha.0`;
  ask the user when the next line is not obvious, e.g. after `.12`). That bump
  also refreshes dependencies: hand it to `/bump-alpha-version {NEXT}`, then
  commit and open the PR the same way.

```bash
git switch -c chore/bump-{NEXT} origin/main
# set root package.json "version" to {NEXT} with the Edit tool
make versiontag
git add -u
git commit -m "chore: bump to {NEXT}"
git push -u origin chore/bump-{NEXT}
```

Version files are not a user flow: record the e2e-flow check
(`bash .claude/scripts/require-e2e-flow.sh --record`) and open the PR as a draft
with `gh pr create --draft --base main --title "chore: bump to {NEXT}"`, body:

```
Bump main to {NEXT} after cutting release v{VERSION}.

Version files only: package.json, version.json, index.html, manifest.json, react, backend.ai-ui, electron-app, backend.ai-docs-toolkit.

## E2E flow

Result: no flow change
Reason: version strings only; no UI or user flow changes.
```

For the `/bump-alpha-version` case, add the dependency changes to the body and
replace the E2E flow section with what the e2e-flow skill reports. No dev server
or walkthrough for a version-only bump — nothing changes on screen.

### 6. Improve Release Notes

```
/fw:release-note v{VERSION}
```

## Output Summary

1. **Version / Tag**, and the commit or branch it points at
2. **Base Tag** used for the notes
3. **GitHub Release URL**
4. **Bump PR** for `main` (alpha / first beta), or "none"

## Examples

```
/create-release 26.4.0-alpha.2     (main reads 26.4.0-alpha.2)
  tag v26.4.0-alpha.2 on origin/main → pre-release (base v26.4.0-alpha.1, target main)
  → bump PR main → 26.4.0-alpha.3 → /fw:release-note

/create-release 26.4.0-beta.0
  branch 26.4 from origin/main → release commit + tag → pre-release (target 26.4)
  → /bump-alpha-version 26.5.0-alpha.0 → bump PR → /fw:release-note

/create-release 26.4.0
  branch 26.4 (fixes already cherry-picked) → release commit + tag
  → release (base: last stable, target 26.4) → /fw:release-note
```

## Notes

- `git` is used directly (not `gh stack`): releases are not feature stacks.
- Never push to `main` directly, never force-push a release branch or move a tag.
- Confirm with the user before pushing if anything looks unexpected.
