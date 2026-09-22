# FR-4059 — Do webui's pnpm patches and lab's canary peer survive when Astryx is reached only through `@lablup/ui-common`?

Research ticket. Everything below was measured on this machine on 2026-09-22 with
pnpm 12.4.0 (the repo's `packageManager` pin) and Node v24.18.1, against the real
patch files in `react/patches/`. Nothing here changes a manifest in this repository.

Repo state measured: branch `research/fr-4059-pnpm-patches-transitive`, cut from
`264169148` (`main`).

---

## Answer

### 1. `patchedDependencies` — do the patches still apply behind `ui-common`?

**Yes. Patches survive a purely transitive reach, unchanged.** pnpm resolves
`patchedDependencies` by `name@version` against the whole resolved graph, not
against any importer's direct dependency list. Probe scenario B installs
`@astryxdesign/core@0.6.2` *only* as a dependency of an external (tarball)
`@lablup/ui-common`, with no `@astryxdesign/*` entry anywhere in the consumer's
`package.json`, and the resolved package still lands in the virtual store as
`@astryxdesign+core@0.6.2_patch_hash=ab1f5ecf353ed137ccd189fe3d38fbec7250a22af83cc3960a8_…`
with `hasClear` / `InputClearButton` present in `dist/ComplexSelector/ComplexSelector.js`.
The patch hash is **byte-identical** to the one in this repo's `pnpm-lock.yaml`
(`ab1f5ecf…8473`, line 365), i.e. pnpm produced exactly the same patched artifact
from the direct-dependency shape and the transitive shape. So **no** option from the
ticket's list is needed *for patching*: not `pnpm.overrides`, not
`publicHoistPattern`, not keeping core as a devDependency, not upstreaming.

Both patches are still needed on the versions pinned today. The core patch adds a
`hasClear` / `onClear` pair to `ComplexSelector` that pristine `@astryxdesign/core@0.6.2`
does not have (proved: the patch applies cleanly to pristine 0.6.2, and pristine
0.3.0-canary rejects hunk #1), and `BAIComplexSelect.tsx:584-585` passes
`hasClear={allowClear}` / `onClear={…}` — removing the patch breaks `allowClear` on
every `BAIComplexSelect` call site. The lab patch fixes a React-StrictMode
double-invoke top-layer bug in `Tour/TourStep`, and `TourStep` / `Tour` are imported
from `@astryxdesign/lab` in three live host files. **Recommendation:** keep both
patches as-is; the only thing FR-4047/FR-4049 must do is **move the
`patchedDependencies` keys from exact versions to bare names**
(`"@astryxdesign/core": react/patches/…` instead of `"@astryxdesign/core@0.6.2": …`).
Rationale below under "The one real fragility". Upstreaming remains desirable as an
independent cleanup, but it is not a blocker for FR-4047/FR-4049 and it does not
change anything measured here.

### 2. lab's canary peer — what happens, and what breaks

**Today** webui satisfies nothing: there is no `peerDependencyRules` block, no
`autoInstallPeers` / `strictPeerDependencies` override, and no `.npmrc` peer setting
anywhere in this repo. `@astryxdesign/lab@0.3.0-canary.12db2a1` declares
`peerDependencies["@astryxdesign/core"] = "0.3.0-canary.12db2a1"`, core 0.6.2 is
installed, and pnpm **just warns** (`strictPeerDependencies` defaults to `false`).
`pnpm-lock.yaml:11311` shows lab bound to the patched 0.6.2 core, and
`pnpm peers check` prints one `unmet peer @astryxdesign/core` line. That is benign
because core and lab sit in the **same importer** (`react/package.json` lists both),
so pnpm has a single candidate and reuses it.

**In the ui-common shape it stops being benign.** If webui drops `@astryxdesign/core`
from its manifests and keeps only `@astryxdesign/lab` (installed to satisfy
`@lablup/ui-common`'s optional `lab` peer), lab's core peer is **non-optional and
unmet in that importer**, so pnpm's `autoInstallPeers` (default `true`) silently
**installs a second core** — `@astryxdesign/core@0.3.0-canary.12db2a1`, **unpatched**,
because the `@0.6.2` patch key does not match it. Measured in probe scenario B:
`ui-common → core 0.6.2 (patched)` and `lab → core 0.3.0-canary.12db2a1 (unpatched)`
coexist in one tree. `pnpm install` exits **0**, `pnpm install --frozen-lockfile`
exits **0**, and `pnpm peers check` reports **"No peer dependency issues found"** —
auto-install-peers "resolved" the mismatch by duplicating. CI is green while the app
ships two Astryx cores (two StyleX token sets, two i18n/theme React contexts, two
`Field`/`Popover` implementations). This is the finding the ticket was looking for.

**Recommendation: keep `@astryxdesign/core` as a pinned `devDependency` of
`react/` (and of `packages/backend.ai-ui/`), which FR-4051 already requires for the
`astryx` CLI.** Measured in scenario C: with core present as a devDependency of the
same importer that has lab, pnpm collapses to a **single patched 0.6.2**, lab binds
to it, and the only output is the same harmless `unmet peer` warning webui already
lives with. This is one change that fixes three things at once (dedupe, CLI
resolvability, patch applicability) and is the option to take.
`overrides: {"@astryxdesign/core": 0.6.2}` (scenario D) also dedupes and additionally
silences the warning, but it does **not** make core resolvable from `react/`
(`require.resolve` → `MODULE_NOT_FOUND`), so it cannot replace the devDependency —
use it only as an optional belt-and-braces addition.
`publicHoistPattern: ['@astryxdesign/*']` **alone is actively harmful**: scenario H
shows it hoists the *wrong* copy — the unpatched `0.3.0-canary` core — to the
workspace-root `node_modules/@astryxdesign/core`, which is exactly what the CLI and
any root-relative resolution would then pick up.

### The one real fragility (and the free tripwire)

After FR-4047/FR-4049, webui no longer controls core's version — `ui-common` does.
A ui-common release that moves core to 0.6.3 invalidates the
`"@astryxdesign/core@0.6.2"` patch key. That failure is **loud, not silent**:
`ERR_PNPM_UNUSED_PATCH`, exit 1 (scenario E). Good, but it also means every ui-common
bump breaks webui's install until someone edits `pnpm-workspace.yaml`.

Using a **bare-name patch key** (`"@astryxdesign/core"`) is strictly better and is
the concrete recommendation of this ticket. pnpm documents name-only keys as the
lowest-priority tier of patch matching, and scenario F2 confirms they work. They buy
two things: (a) a core bump inside ui-common keeps applying the patch as long as the
hunks still apply, failing loudly with `ERR_PNPM_PATCH_FAILED` when they do not; and
(b) — scenario F — **a name-only key turns the silent duplicate-core bug from
sub-question 2 into a hard install failure**, because the 0.6.2 patch cannot apply to
the auto-installed `0.3.0-canary` copy. It is a free regression detector for exactly
the failure mode that is otherwise invisible. Adopt it *in addition to* the
devDependency, not instead of it.

---

## Facts (this checkout)

| Fact | Source |
|---|---|
| pnpm 12.4.0 (repo pin), global pnpm outside repo is 11.18.0 | `package.json` `"packageManager": "pnpm@12.4.0"`; `pnpm --version` |
| Patch files live under `react/patches/`, **not** `patches/` | `ls react/patches/` |
| 5 patched deps, 2 of them Astryx | `pnpm-workspace.yaml` `patchedDependencies:` |
| core patch key is the exact version `@astryxdesign/core@0.6.2` | `pnpm-workspace.yaml` |
| lab patch key is the exact version `@astryxdesign/lab@0.3.0-canary.12db2a1` | `pnpm-workspace.yaml` |
| No `peerDependencyRules`, no `autoInstallPeers`, no `strictPeerDependencies`, no `publicHoistPattern`, no `nodeLinker` anywhere | `grep -n -i "peer\|hoist\|strict\|nodeLinker\|shamefully" pnpm-workspace.yaml .npmrc` → only a prose comment matches |
| `.npmrc` contains one line: `prefer-full-metadata=true` | `.npmrc` |
| `enableGlobalVirtualStore: true` — virtual store lives in the global store, `node_modules/.pnpm` is absent at the repo root | `pnpm-workspace.yaml`; `react/node_modules/@astryxdesign/*` symlinks point into `~/.local/share/pnpm/store/v11/links/…` |
| core and lab are **both** direct deps of `react/` and of `packages/backend.ai-ui/` today | `react/package.json:9-11` (deps) + `:122` (`cli`, devDep); `packages/backend.ai-ui/package.json:53-55,83-86` |
| core patch hash in lockfile: `ab1f5ecf353ed137ccd189fe3d38fbec7250a22af83cc3960a882adc32ca8473` | `pnpm-lock.yaml:365` |
| lab patch hash in lockfile: `0e5e0cbe89a52670bf3b7b7324794cf671a257ce501858d58f346a993af51e08` | `pnpm-lock.yaml:366` |
| lab's declared peer: `'@astryxdesign/core': 0.3.0-canary.12db2a1` | `pnpm-lock.yaml:1424-1425` |
| lab is nonetheless resolved against **core 0.6.2 (patched)** today | `pnpm-lock.yaml:11311-11313` |
| `theme-neutral@0.6.2` peer-requires `'@astryxdesign/core': 0.6.2` (exact) | `pnpm-lock.yaml:1466-1467` |
| CI installs with `pnpm install --frozen-lockfile` (4 jobs) | `.github/workflows/package.yml:64,120,187,311` |
| No `ui-common` reference exists in the repo yet (FR-4047/FR-4049 not landed) | `grep -rl "ui-common" --include=*.md --include=*.json --include=*.yaml .` → empty |

### What each Astryx patch does, and whether it is still needed

**`react/patches/@astryxdesign__core@0.6.2.patch`** (3790 bytes, 2 files:
`dist/ComplexSelector/ComplexSelector.d.ts`, `dist/ComplexSelector/ComplexSelector.js`).
Adds a `hasClear?: boolean` + `onClear?: () => void` prop pair to `ComplexSelector`
and renders an `InputClearButton` between the loading `Spinner` and the chevron when
`hasClear && triggerLabel != null && !isDisabled`, with `event.stopPropagation()` so
the clear does not open the popover; falls back to `onChange?.(undefined)` when
`onClear` is absent. It imports `../Field/InputClearButton.js`, which already exists
in pristine 0.6.2 — the patch only wires an existing primitive into `ComplexSelector`,
which is why it is a 2-hunk `.js` patch and not a vendored component.

**Still needed on 0.6.2: yes.** `packages/backend.ai-ui/src/components/BAIComplexSelect.tsx:584-585`
passes `hasClear={allowClear}` / `onClear={() => onChange?.(multiple ? [] : null)}`,
and the props doc at lines 207-213 names the patch file explicitly. Pristine 0.6.2
lacks the prop (verified: the patch applies cleanly to pristine 0.6.2 in every probe
scenario, so the added lines are genuinely absent upstream). `allowClear` is the
antd-v6-shaped prop on `BAIComplexSelect`; dropping the patch silently makes it a
no-op on every call site. The source comment cites an upstream PR
(`facebook/astryx#6362`) — see Open items.

**`react/patches/@astryxdesign__lab@0.3.0-canary.12db2a1.patch`** (1864 bytes, 2 files:
`dist/Tour/TourStep.js` and `src/Tour/TourStep.tsx`, i.e. it patches both the shipped
build and the shipped sources). In `TourHighlight`, replaces an unconditional
`el.showPopover()` + cleanup `el.hidePopover()` with a guarded, once-only
`if (!el.matches(':popover-open')) el.showPopover()`. The reason is in the patch's own
comment: top-layer order is promotion order, so React StrictMode's dev double-invoke
of the effect re-promotes the overlay *above* the callout and paints the spotlight dim
over it.

**Still needed on 0.3.0-canary.12db2a1: yes.** `@astryxdesign/lab`'s `Tour` / `TourStep`
are imported by `react/src/components/BAITour.tsx:5`,
`react/src/components/AdminDeploymentPresetValidationTour.tsx:8` and
`react/src/components/SessionLauncherErrorTourProps.tsx:8`; `Drawer`, `Stepper`, `Step`
and `Stat` come from the same package in 8 more files. The canary pin never moves
(`pnpm-workspace.yaml` documents the permanent `minimumReleaseAgeExclude` entry for
it), so the patch's exact-version key is stable for lab specifically — the version
drift risk described above is a **core** risk, not a lab risk.

---

## Probe

Everything is reproducible from scratch. Root: `/home/ubuntu/.claude/jobs/932f9560/tmp/fr-4059-probe/`
(outside the repo, as the ticket requires). **Network to `registry.npmjs.org` was
available** (`curl -o /dev/null -w '%{http_code}' https://registry.npmjs.org/@astryxdesign%2Fcore`
→ `200` in 1.09s), so every claim below is measured, not reasoned. The Astryx packages
are public on npm (`dist-tags.latest` = `0.6.2`).

### Setup

A fake `@lablup/ui-common` mirroring the FR-4047/FR-4049 contract:

```json
{
  "name": "@lablup/ui-common", "version": "0.0.0", "main": "index.js",
  "dependencies": { "@astryxdesign/core": "0.6.2" },
  "peerDependencies": {
    "@astryxdesign/lab": "0.3.0-canary.12db2a1",
    "@stylexjs/stylex": "^0.19.0", "react": ">=19.0.0", "react-dom": ">=19.0.0"
  },
  "peerDependenciesMeta": { "@astryxdesign/lab": { "optional": true } }
}
```

packed with `npm pack` into `lablup-ui-common-0.0.0.tgz` (345 bytes, 2 files) so the
consumer reaches it as a **real external package**, not a workspace link — this
distinction turned out to matter (see scenario A vs B). Each scenario is a two-package
pnpm workspace (`.` + `app/`) with `"packageManager": "pnpm@12.4.0"` at the root, the
two real Astryx patch files copied into `patches/`, and
`allowBuilds: {'@astryxdesign/core': false}` (without it pnpm 12 aborts with
`ERR_PNPM_IGNORED_BUILDS`, same as this repo).

`app/package.json` baseline:

```json
{ "dependencies": {
    "@astryxdesign/lab": "0.3.0-canary.12db2a1",
    "@lablup/ui-common": "file:../../lablup-ui-common-0.0.0.tgz",
    "@stylexjs/stylex": "0.19.0", "react": "19.2.8", "react-dom": "19.2.8" } }
```

### Scenario matrix

| # | Shape | `pnpm install` | core instances | Patched? | `pnpm peers check` |
|---|---|---|---|---|---|
| A | ui-common as **workspace** package, exact patch keys | 0 | 1 × `0.6.2` | yes | 1 `unmet peer` warning |
| B | ui-common as **tarball**, exact patch keys, no core in `app` | **0** | **2** — `0.6.2` + `0.3.0-canary.12db2a1` | 0.6.2 yes, **canary no** | **"No peer dependency issues found"** |
| C | B + `@astryxdesign/core: 0.6.2` as `app` **devDependency** | 0 | 1 × `0.6.2` | yes | 1 `unmet peer` warning |
| D | B + `overrides: {"@astryxdesign/core": 0.6.2}` | 0 | 1 × `0.6.2` | yes | clean |
| E | D but patch key says `@astryxdesign/core@0.6.1` | **1** `ERR_PNPM_UNUSED_PATCH` | — | — | — |
| F | B + **bare-name** patch keys, no overrides | **1** `ERR_PNPM_PATCH_FAILED` | — | — | — |
| F2 | D + **bare-name** patch keys | 0 | 1 × `0.6.2` | yes | clean |
| G | D + `publicHoistPattern: ['@astryxdesign/*']` | 0 | 1 × `0.6.2` | yes | clean |
| H | B + `publicHoistPattern` **alone** | 0 | 2 | root hoists the **unpatched canary** | clean |

### Key outputs

**Scenario B — the silent duplicate.** `ls node_modules/.pnpm/ | grep -i astryx`:

```
@astryxdesign+core@0.3.0-canary.12db2a1_@stylexjs+stylex@0.19.0_react-dom@19.2.8_react@19.2.8__react@19.2.8
@astryxdesign+core@0.6.2_patch_hash=ab1f5ecf353ed137ccd189fe3d38fbec7250a22af83cc3960a8_7f4b13005cb79d75c4ae4d45b89c3b73
@astryxdesign+lab@0.3.0-canary.12db2a1_patch_hash=0e5e0cbe89a52670bf3b7b7324794cf671a25_2068c6247b85def1e2b4fb5e992c70f1
@lablup+ui-common@file+..+lablup-ui-common-0.0.0.tgz_@astryxdesign+lab@0.3.0-canary.12d_f63883d542e10cd7671a9b7640a86e91
```

`ui-common`'s `node_modules/@astryxdesign/core` → the `patch_hash=ab1f5ecf…` 0.6.2 dir
(`node -p "require(…/package.json).version"` → `0.6.2`).
`lab`'s `node_modules/@astryxdesign/core` → the canary dir (→ `0.3.0-canary.12db2a1`).
`grep -c hasClear` in the canary copy → `0` (unpatched); in the 0.6.2 copy → the
`hasClear`/`onClear`/`InputClearButton` lines are present at
`dist/ComplexSelector/ComplexSelector.js:21,199,200,357,364` and
`dist/ComplexSelector/ComplexSelector.d.ts:88,154`.
`pnpm install --frozen-lockfile` → `Done in 57ms`, exit **0**.
`pnpm peers check` → `No peer dependency issues found`, exit 0.

**Scenario A — why the workspace shape misleads.** With `ui-common` as a workspace
package, pnpm's auto-install-peers hoisted **lab itself** into the `packages/ui-common`
importer (`pnpm-lock.yaml` `importers: packages/ui-common: dependencies:
'@astryxdesign/lab': specifier 0.3.0-canary.12db2a1`), putting core and lab in the same
importer, so lab deduped onto 0.6.2 and only the familiar warning appeared. Note this
was an **optional** peer, which pnpm documents as *not* auto-installed — an observed
deviation worth not relying on. Do not use a workspace-linked `ui-common` to validate
FR-4047/FR-4049; it hides the bug. Only the tarball/registry shape is representative.

**Scenario C — the fix.** After `rm -rf node_modules app/node_modules pnpm-lock.yaml && pnpm install`:

```
@astryxdesign+core@0.6.2_patch_hash=ab1f5ecf353ed137ccd189fe3d38fbec7250a22af83cc3960a8_…
@astryxdesign+lab@0.3.0-canary.12db2a1_patch_hash=0e5e0cbe89a52670bf3b7b7324794cf671a25_8d9b52d9cdf9e273703a829afa35977a
@lablup+ui-common@file+..+lablup-ui-common-0.0.0.tgz_…
```

lab's `node_modules/@astryxdesign/core` → the `patch_hash=ab1f5ecf…` 0.6.2 dir.
`pnpm peers check` → the single `unmet peer @astryxdesign/core / Installed: 0.6.2 /
Wanted: 0.3.0-canary.12db2a1` warning, identical in shape to this repo's today.
`pnpm install --frozen-lockfile` → exit 0.
`require.resolve('@astryxdesign/core', {paths: ['…/scenarioC/app']})` →
`…/node_modules/.pnpm/@astryxdesign+core@0.6.2_patch_hash=ab1f5ecf…/node_modules/@astryxdesign/core/dist/index.js`
(the FR-4051 CLI requirement, satisfied).

**Scenario D — overrides dedupe but do not make core resolvable.**
`require.resolve('@astryxdesign/core', {paths: ['…/scenarioD/app']})` →
`RESOLVE FAILED: MODULE_NOT_FOUND`. `app/node_modules/@astryxdesign/` contains `lab`
only. Overrides also rewrite lab's peer requirement, so `pnpm peers check` is clean —
which means overrides *hide* the mismatch rather than surface it.

**Scenario E — stale exact key is loud:**

```
Error: ERR_PNPM_UNUSED_PATCH
  × installing dependencies
  ╰─▶ The following patches were not used: @astryxdesign/core@0.6.1
  help: Either remove them from "patchedDependencies" or update them to match packages in your dependencies.
EXIT=1
```

**Scenario F — a bare-name key catches the duplicate:**

```
Error: ERR_PNPM_PATCH_FAILED
  × installing dependencies
  ╰─▶ Could not apply patch …/patches/@astryxdesign__core@0.6.2.patch to
      …/node_modules/.pnpm/@astryxdesign+core@0.3.0-canary.12db2a1_patch_hash=ab1f5ecf…/node_modules/@astryxdesign/core:
      apply to …/dist/ComplexSelector/ComplexSelector.d.ts: error applying hunk #1
EXIT=1
```

**Scenario F2 — bare-name keys are fine in the healthy shape.** Lockfile records them
without a version:

```yaml
patchedDependencies:
  '@astryxdesign/core': ab1f5ecf353ed137ccd189fe3d38fbec7250a22af83cc3960a882adc32ca8473
  '@astryxdesign/lab': 0e5e0cbe89a52670bf3b7b7324794cf671a257ce501858d58f346a993af51e08
```

Same hashes as this repo's `pnpm-lock.yaml:365-366`.

**Scenario H — `publicHoistPattern` alone hoists the wrong copy:**

```
node_modules/@astryxdesign/core -> ../.pnpm/@astryxdesign+core@0.3.0-canary.12db2a1_@stylexjs+stylex@0.19.0_…/node_modules/@astryxdesign/core
```

i.e. the workspace-root `@astryxdesign/core` is the **unpatched canary**, exit 0, no
warnings. With overrides added (G) the root hoist is the patched 0.6.2 and
`require.resolve` from `app/` succeeds — so `publicHoistPattern` can serve the
FR-4051 CLI requirement, but only on top of a dedupe, and it is strictly weaker than
the devDependency (it pollutes the root `node_modules` for every package).

### Reproduce

```bash
cd /home/ubuntu/.claude/jobs/932f9560/tmp/fr-4059-probe/scenarioB
rm -rf node_modules app/node_modules pnpm-lock.yaml
pnpm install                       # exit 0
ls node_modules/.pnpm/ | grep -i astryx   # two cores
pnpm peers check                   # "No peer dependency issues found"
pnpm install --frozen-lockfile     # exit 0

cd ../scenarioC && rm -rf node_modules app/node_modules pnpm-lock.yaml && pnpm install
ls node_modules/.pnpm/ | grep -i astryx   # one core, patched
```

---

## Recommendation for FR-4047 / FR-4049

1. **Keep `@astryxdesign/core` pinned in `react/package.json` and
   `packages/backend.ai-ui/package.json` as a `devDependency`** at the version
   ui-common pins. This is the single change that dedupes lab's peer onto the patched
   core, keeps the `astryx` CLI resolvable (FR-4051), and keeps the patch applicable.
   The version must be kept in lockstep with ui-common's pin.
2. **Change both Astryx `patchedDependencies` keys to bare names** in
   `pnpm-workspace.yaml`. Free tripwire for the duplicate-core failure, and it
   survives a ui-common-driven core bump.
3. **Do not rely on `publicHoistPattern` alone.** It hoists the wrong copy.
4. **`overrides` is optional.** It dedupes and silences, which is a mixed blessing —
   it would also silence a genuine future incompatibility. If added, add it *with*
   step 1, not instead of it.
5. **Add a CI assertion** that exactly one `@astryxdesign/core` resolves, e.g. a
   post-install check that `pnpm why @astryxdesign/core` (or a walk of the virtual
   store) yields one version. Step 2 covers the specific canary case; an explicit
   check covers the general one, and `--frozen-lockfile` provably does not.
6. **Validate FR-4047/FR-4049 against a packed tarball or a real registry publish of
   `@lablup/ui-common`, never a `workspace:` link** — scenario A shows the workspace
   shape silently hides this bug.

---

## Open items

- **Upstreaming.** `BAIComplexSelect.tsx:210-211` cites
  `https://github.com/facebook/astryx/pull/6362` for the `hasClear` change. That
  repository path was not verified here and looks wrong for `@astryxdesign/*`; the
  real upstream PR / repo for the core patch should be confirmed before anyone plans
  to drop the patch. If `hasClear` lands upstream in a 0.6.x, the core patch can be
  deleted outright and sub-question 1 disappears — but nothing measured here depends
  on that happening.
- **The lab patch is very unlikely to upstream** on a pinned canary
  (`0.3.0-canary.12db2a1` never moves by design). Carrying it is the steady state
  until lab reaches a stable release.
- **`theme-neutral`** was not exercised. Its `0.6.2` peer on core is **exact**
  (`pnpm-lock.yaml:1466-1467`), so if ui-common also pins theme-neutral it acts as a
  second dedupe force — but it does not remove the need for recommendation 1, since
  lab's canary peer is resolved per importer and theme-neutral's exact peer cannot
  win an argument it is not part of. Worth a follow-up probe if ui-common's final
  manifest differs from the one assumed here.
- **`enableGlobalVirtualStore: true`** is set in this repo but **not** in the probe
  workspaces (they used the default `node_modules/.pnpm`). Patch identity is keyed by
  `patch_hash`, which is store-layout independent — the hashes matched this repo's
  lockfile exactly in every scenario — so the conclusions carry over, but the exact
  *symlink paths* under the global virtual store were not re-measured. Marked as the
  one unverified layout detail.
- **ui-common's actual manifest is not yet written** (no `ui-common` reference exists
  in this repo). The probe encodes the contract as stated in the FR-4059 ticket:
  `@astryxdesign/core` an exact-pinned `dependency`, `@astryxdesign/lab` an exact-pinned
  **optional** peer. If FR-4047/FR-4049 makes lab a non-optional peer, or makes core a
  peer rather than a dependency, re-run scenarios B and C — a core *peer* would change
  the answer to sub-question 1.

## Sources

- `pnpm-workspace.yaml`, `.npmrc`, `package.json`, `react/package.json`,
  `packages/backend.ai-ui/package.json`, `pnpm-lock.yaml` (this checkout, `264169148`)
- `react/patches/@astryxdesign__core@0.6.2.patch`,
  `react/patches/@astryxdesign__lab@0.3.0-canary.12db2a1.patch`
- `packages/backend.ai-ui/src/components/BAIComplexSelect.tsx:207-213,584-585`
- `.github/workflows/package.yml:64,120,187,311`
- pnpm docs — <https://pnpm.io/cli/patch#patcheddependencies>: keys are "Package names
  with an exact version, a version range, or just the name", matched in priority order
  "1. Exact versions (highest priority) 2. Version ranges 3. Name-only patches". The
  docs do **not** state the transitive-dependency behaviour either way; scenario B
  establishes it empirically.
- pnpm docs — <https://pnpm.io/settings/peer-dependencies>: `autoInstallPeers` defaults
  to `true` and "any missing non-optional peer dependencies are automatically
  installed"; `strictPeerDependencies` defaults to `false`;
  `peerDependencyRules.allowedVersions` only suppresses warnings ("Unmet peer
  dependency warnings will not be printed…") and does not alter resolution — which is
  why it is not a candidate fix for sub-question 2.
- Probe workspaces: `/home/ubuntu/.claude/jobs/932f9560/tmp/fr-4059-probe/scenario{A,B,C,D,E,F,G,H}/`
