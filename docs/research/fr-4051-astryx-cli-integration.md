# Astryx CLI: integrations, wrapping, and upgrade codemods (FR-4051)

Research for the wayfinder ticket FR-4051 (parent map FR-4046). The plan under
study: `@lablup/ui-common` re-exposes Astryx so `backend.ai-webui` stops
depending on `@astryxdesign/*` directly, and ui-common ships (1) the Astryx CLI's
functionality and (2) a command that absorbs upstream Astryx upgrades.

**Versions.** The ticket names CLI 0.5.4, but `main` moved to **0.6.2** in
FR-4034 (#9854, `pnpm-workspace.yaml` catalog). Both were read. 0.6.x changed
several answers (implicit integration loading, `agentDocs.append`, the import
line fix), so **0.6.2 is the baseline below**; 0.5.4 differences are called out.

**Sources.** The primary source is the published package itself, read from the
pnpm store: `@astryxdesign/cli@0.6.2` (and `@0.5.4`), paths below are relative
to the package root. Behaviour claims marked *(verified)* were reproduced by
running the CLI bin against a scratch project in `/tmp` with a fake
`@lablup/ui-common` integration and the real `@astryxdesign/core@0.6.2`.

---

## TL;DR

| Question | Answer |
|---|---|
| Can ui-common contribute components / docs / templates / codemods / themes? | **Yes**, via a root `astryx.integration.{ts,mjs,js}` manifest. Same mechanism BUI uses today. |
| Does the consumer have to list it in `astryx.config`? | **No, since 0.6.1**: a *declared* dependency that ships a manifest is loaded automatically. Not transitive. |
| Can ui-common **hide** a core component (e.g. core `Button`)? | **No.** There is no mechanism. A same-name component makes unscoped `astryx component Button` fail as ambiguous; `search`/`--list` show both. Doc topics *can* be replaced (`replaces:`), components cannot. |
| Does the CLI work if the app no longer declares `@astryxdesign/core`? | **No.** `component`, `search`, `build`, `upgrade` require `node_modules/@astryxdesign/core` within 5 directory levels up from cwd, else `ERR_CORE_NOT_FOUND`. With pnpm's isolated layout that means keep a (dev)dependency or public-hoist it. |
| Can the CLI be wrapped as a ui-common bin? | **Yes.** Spawn the bin (resolved through the `"."` export) or call the typed `@astryxdesign/cli/api` functions. No exported Commander program. Hints in text output hardcode `astryx`. |
| Do `upgrade --apply` codemods still work when consumers import from `@lablup/ui-common`? | **Partly.** 22 of 66 core transforms only touch imports whose specifier is `@astryxdesign/core[/…]` and would skip ui-common imports; the other 44 match JSX names/props, CSS selectors, or token strings and would still fire, including on ui-common's own same-named components. Integration codemods are keyed by **core** version, not the integration's. |
| How is the AGENTS block generated? | Hardcoded template in `foundation/agent-docs/agent-docs.mjs`. Dynamic parts: version, core component count, invocation stem, styling system, doc-topic list, and (0.6.0+) each integration's `agentDocs.append` lines. Hand edits inside the markers are overwritten by `init` and by `upgrade --apply`. |
| Licence | MIT, © 2026 Meta Platforms. Forking, vendoring or reimplementing is permitted with the copyright and permission notice kept. |

---

## 1. What the CLI offers integrations

### 1.1 The two files

- **Consumer:** `astryx.config.{ts,mjs,js}`, a sibling of the nearest
  `package.json` (`foundation/config/project.mjs`, `findConfigPath`). Fields:
  `integrations: string[]`, `issuesUrl`, `hooks.postCodemod`, `debug`,
  `experimental.xle.components` (`authoring/config/type.ts`). Unknown keys are a
  hard error (strict schema).
- **Author:** `astryx.integration.{ts,mjs,js}` at the package root, a sibling of
  the package's `package.json`. Exactly one must exist
  (`foundation/integrations/integrations.mjs`, `resolveManifestPath`). Fields
  (`authoring/integration/type.ts`, 0.6.2):

  | Field | Contributes |
  |---|---|
  | `components` | dir scanned recursively for same-stem `{Name}.doc.{ts,mjs,js}` (the doc is authoritative; a sibling `{Name}.tsx` is the swizzleable source) |
  | `templates` | page/block templates for `template` / `build` |
  | `codemods` | `<root>/<version>/<id>.{ts,mjs,js}` for `upgrade` |
  | `docs` | `{topic}.doc.*` reference topics for `docs` / `search` / the agent block; may `replaces:` or `extends:` a built-in topic |
  | `themes` (0.6.1+) | source themes for `theme list` / `theme add` |
  | `agentDocs.append` (0.6.0+) | static lines appended to the managed AGENTS block |
  | `issuesUrl` | routing for "report an issue" links |

  Named exports `debug` and `gapReport` are also read. Unknown manifest keys are
  ignored with a warning (not fatal), so a manifest written for a newer CLI still
  loads in an older one (CHANGELOG 0.5.x, #5119).

`.ts` manifests and docs are loaded through `jiti`, so an integration can ship
TypeScript sources (`foundation/fs/module-loader.mjs`).

### 1.2 How integrations are found

- **Explicit:** each name in `astryx.config`'s `integrations` is resolved from
  `<configDir>/node_modules/<name>`, must be a bare package name, and must not
  escape `node_modules` (`resolvePackageDir`).
- **Implicit, 0.6.1+:** a package listed in the project's `dependencies`,
  `devDependencies` or `optionalDependencies` that ships a root manifest is
  loaded with no config entry. `node_modules` is never walked, so **a dependency
  of a dependency does not contribute** (CHANGELOG 0.6.1, #6202). *(Verified:
  with no `astryx.config`, a declared `@lablup/ui-common` was loaded and
  `doctor` reported "Implicitly linked integrations".)*
- **Legacy:** packages with `package.json#astryx.docs` are still scanned for
  `discover` (`foundation/fs/paths.mjs`, `discoverExternalPackages`). Do not use
  this for new work.

Discovery is fault-tolerant: a broken integration is skipped with a one-line
warning, never crashing the command (`Project` class, "SKIP + WARN policy").
`astryx validate-integration <pkg>` and `astryx doctor` report details.

### 1.3 Which commands see integration contributions

| Command | Integration content |
|---|---|
| `component <Name>`, `component --list` | yes, with an owner `package` and a resolved `import` |
| `search` | yes (components since #5259, doc topics since #5311) |
| `build "<idea>"` | yes, through `search`. The always-on `FRAME` / `FOUNDATION` lists (`AppShell`, `Layout`, `Card`, `Button`, `Text`, …) are **hardcoded core names** in `api/build/kit/kit.mjs` |
| `template` | yes |
| `docs` | yes, with add / replace / extend |
| `upgrade` | yes (integration codemods) |
| `theme list/add` | yes (0.6.1+) |
| `init --features agents` / `upgrade --apply` block refresh | topic names plus `agentDocs.append` lines (0.6.0+) |
| `hook` | **core only**; integrations cannot contribute hooks |
| `swizzle` | core, plus integration source when a sibling `.tsx` exists |

0.6.1 also added authoring tools: `astryx integration add <kind> <name>`,
`astryx integration pack --check` (confirms the contributions survive
`npm pack`), and `doctor integration` checks for overlaps with core
(`integrationComponentConflicts`, `integrationTemplateConflicts`,
`integrationDocConflicts` in `api/integration/authoring-checks.mjs`).

---

## 2. How `backend.ai-ui` is registered today

Landed in FR-3708 (#9132, commit `0690f820c`).

- `react/astryx.config.ts` declares `integrations: ['backend.ai-ui']` plus
  `issuesUrl`. It lives in `react/` because the CLI finds the config next to the
  nearest `package.json` and resolves integrations from that directory's
  `node_modules`. `react/` is the workspace that has `@astryxdesign/cli` as a
  devDependency. Root `package.json` proxies `pnpm run astryx` to
  `pnpm --prefix ./react exec astryx`.
- `packages/backend.ai-ui/astryx.integration.ts` declares
  `components: './src/components'`, `docs: './src/astryx-docs'`, and
  `issuesUrl`. It ships no templates or codemods.
- **The `.doc.ts` convention.** There are 83 `*.doc.ts` files beside their
  components under `packages/backend.ai-ui/src/components/**`. Each file:
  - `import type { ComponentDoc } from '@astryxdesign/cli/authoring'`;
  - `export const docs = { type: 'component', name, displayName, category, keywords, usage: { description, bestPractices }, props: [...] }`, plus `export default docs`.
    The CLI's component loader reads the **named** export, while the authoring
    docs describe a default export, so BUI ships both;
  - has a `name` equal to the file stem, because discovery keys on the stem;
  - omits `type` when documenting several components via `components: [...]`
    (the stamped schema has no multi-component variant);
  - may set `hidden: true` to stay out of listings but still count as
    documented.
- `packages/backend.ai-ui/src/astryx-docs/backend-ai-ui.doc.ts` is a
  `ReferenceDoc` topic, `astryx docs backend-ai-ui`.
- `packages/backend.ai-ui/src/astryx-docs/astryxIntegration.test.ts` enforces
  the rules above and checks that every component exported from the barrel has a
  doc. The CLI itself only warns about a doc that fails the schema, which drops
  the component silently; the test is what catches it.

**Side findings about the current repository:**

1. `react/AGENTS.md`, `AGENTS.md` and `CLAUDE.md` carry hand-added lines
   **inside** `<!-- ASTRYX:START/END -->` (MIGRATION RELAXATION, STATUS
   SEMANTICS, BUI INTEGRATION). `init --features agents` rewrites the whole
   block, and so does `upgrade --apply` whenever the block's version is stale
   (`refreshAgentDocs` in `api/upgrade/_adapter.mjs`). Both delete those lines.
   The supported home for them since 0.6.0 is `agentDocs.append` in
   `backend.ai-ui`'s manifest. The limits are 8 lines per integration, 240 code
   points per line, and 32 lines per project (`authoring/integration/schema.mjs`,
   `MAX_PROJECT_AGENT_DOC_LINES`). The current lines are 499, 576 and 691
   characters long, so they would have to be condensed.
2. The repository's CLAUDE.md says the wrong **Import** line for BUI
   components is "an upstream CLI bug, still present in 0.5.4". It was fixed in
   0.6.1 (#5294). *(Verified: with 0.6.2, `component Button --package
   @lablup/ui-common` prints `import {Button} from '@lablup/ui-common'`.)* The
   caveat in CLAUDE.md and `backend-ai-ui.doc.ts` is now stale.

---

## 3. Can a third package (ui-common) contribute, and can it hide core?

### Contributing: yes

ui-common can ship the same manifest as BUI. Requirements:

- The manifest and every contribution root must be **in the published
  tarball**. Today ui-common's `files` is `["dist", "NOTICE"]`, so
  `astryx.integration.*` and the doc/template/codemod roots must be added, or
  emitted into `dist/`. `astryx integration pack --check` verifies this.
- The import specifier the CLI reports comes from the doc's own `import` field.
  Without one, it is resolved against the owning package's `exports`. 0.6.2
  understands wildcard keys such as ui-common's `./components/*`
  (`exportsPublish` in `foundation/discovery/component-discovery.mjs`); 0.5.4
  matched exact keys only and fell back to the package root.
- In backend.ai-webui, declaring `@lablup/ui-common` as a dependency of
  `react/` is enough on 0.6.1+. BUI keeps loading as before, because it is
  declared (`workspace:`) and also listed in the config.

### Hiding core components: not supported

- Core components are always discovered from `@astryxdesign/core`'s own tree
  (`Project.components()` calls `discoverOwnedComponents(coreDir, [])` first).
  The only hide switches are `hidden: true` / `hiddenComponents: [...]` inside
  **core's own** `.doc.mjs` files (`readDocMeta`). An integration's `hidden`
  applies only to that integration's own docs.
- A name owned by two packages is refused. *(Verified, 0.5.4 and 0.6.2:)*
  `astryx component Button` returns
  `Component "Button" is provided by multiple packages. Re-run with --package <pkg> to choose one.`
  with `code: ERR_UNKNOWN_COMPONENT` (the README's table lists
  `ERR_AMBIGUOUS_COMPONENT` for this case, but the code path in
  `api/component/_adapter.mjs` `assertUnambiguousOwners` emits
  `ERR_UNKNOWN_COMPONENT`). `search` and `component --list` show **both**, and
  `build` always includes core's hardcoded `FRAME` / `FOUNDATION` names.
- Core has no `Modal` component (it has `Dialog`), so the ticket's example does
  not collide. ui-common's current component names that do overlap with core
  include `Button`, `Badge`, `Select`, `Skeleton`, `Tooltip`, `Tabs` and
  `Drawer`. `doctor integration components` lists them for a real package.
- Doc topics are the exception: an integration topic can `replaces: '<topic>'`
  a built-in one, and the old name stays as an alias
  (`foundation/discovery/docs-discovery.mjs`). *(Verified: a ui-common
  `getting-started` topic with `replaces: 'getting-started'` is served in place
  of core's.)*

**Ways to get the "hide" effect:**

1. **Name differently** (e.g. `LuiButton`) and document it with `agentDocs`
   plus a `replaces`/`extends` topic. This works with the stock CLI and needs
   no maintenance.
2. **Wrapper post-filtering.** A ui-common bin calls `--json` and removes
   `package: "@astryxdesign/core"` entries that ui-common shadows from `search`,
   `component --list` and `build`. For `component <Name>`, it adds
   `--package @lablup/ui-common` when ui-common owns the name.
3. **pnpm-patch core's doc files** to set `hidden: true`. backend.ai-webui
   already patches `@astryxdesign/core` (`pnpm-workspace.yaml`
   `patchedDependencies`). It is fragile: the patch has to be refreshed on every
   bump, and it hides the component from everyone.
4. **Upstream feature request** for an integration-level `shadows` or `hides`
   field. None exists in 0.6.2.

---

## 4. The core-resolution constraint

This matters for the goal of not depending on `@astryxdesign/*` directly.

`findCoreDir(cwd)` (`foundation/fs/paths.mjs`) looks for
`<dir>/packages/core` or `<dir>/node_modules/@astryxdesign/core`, walking up at
most 5 levels from cwd. 0.6.2 adds a Yarn PnP lookup. `component`, `search`,
`build` and `component --list` throw `ERR_CORE_NOT_FOUND` without it, and
`upgrade` throws `ERR_VERSION_DETECT` because `detectInstalledTargetVersion`
reads `cwd/node_modules/@astryxdesign/core/package.json` only. `docs` still
works. *(Verified by removing the core link: `component` and `search` fail,
`docs` succeeds.)*

Under pnpm's isolated layout, a core that is only a dependency **of
ui-common** is not at `react/node_modules/@astryxdesign/core`. The options:

- keep `@astryxdesign/core` as a `devDependency` of `react/`, for tooling only;
- set `publicHoistPattern: ['@astryxdesign/*']` in `pnpm-workspace.yaml`;
- have the wrapper create the link, which is a hack.

Runtime code can still import only from `@lablup/ui-common`. The dependency
exists for the tool.

---

## 5. Wrapping the CLI as a ui-common bin

What the package exposes (`package.json` `exports`, 0.6.2):

- `"."` → `./clients/cli/bin/astryx.mjs`. This is the bin itself, and importing
  it runs the CLI (top-level await). Use it for **resolution only**:
  `fileURLToPath(import.meta.resolve('@astryxdesign/cli'))`, then
  `spawn(process.execPath, [bin, ...argv], {cwd, stdio: 'inherit'})`.
  `./package.json` is **not** exported.
- `./api` → typed functions: `component`, `docs`, `search`, `build`,
  `template`, `hook`, `swizzle`, `upgrade`, `init`, `doctor`, `theme*`,
  `layout*`, `integrationAdd*`, `integrationPackCheck`, `validateIntegration`,
  `integration*Conflicts`, `gapReport`, plus `AstryxError`. Most take a
  `{cwd}` context or option. The README states these return the same data as
  `--json`, because the CLI handlers are thin wrappers over them.
- `./json` (`parseResponse`, `isError`, `assertResponse`, plus the response
  types), `./authoring` (doc, config, integration and codemod types and
  parsers), `./codemod`, `./config`, `./integration`, `./doc`, `./template`,
  `./debug`, `./xle`.
- **Not exported:** the Commander program (`clients/cli/index.mjs`
  `createProgram`), the core codemod transforms
  (`assets/codemods/transforms/**`), and the built-in docs and templates. A
  wrapper cannot import them by specifier. It can only reach them through a
  resolved filesystem path, which is unsupported.

Stability signals:

- The JSON envelope carries `apiVersion: 1`, and error `code`s are
  "append-only" (README).
- A `manifest --json` command describes every command and flag, so a wrapper
  can detect drift.
- It is still **0.x with real breaks.** 0.3.0 removed all `create*` authoring
  factories. 0.6.0 changed the debug-event schema and the meaning of a field.
  0.6.1 replaced `GapReportWriter`. Pin exactly, as the repository already does.

Wrapper limits:

- Text output and hints hardcode the `astryx` bin name and `@astryxdesign/*`
  (`CLI_BIN`, `CLI_PACKAGE` in `foundation/env/package-manager.mjs`).
- The agent block's SETUP lines hardcode
  `import "@astryxdesign/core/reset.css"` and `…/astryx.css`.

A wrapper that wants ui-common-branded output has to rewrite `--json` results
or render its own text. `agentDocs.append` can add counter-guidance ("import
from `@lablup/ui-common`") but cannot remove core lines.

---

## 6. `upgrade --apply` codemods

**Pipeline** (`api/upgrade/run/run.mjs`):

1. Require `--from <old core version>`. The target version is the installed
   `@astryxdesign/core` in `cwd/node_modules`.
2. Refresh the agent block, on every path.
3. Run **core** transforms for versions in `(from, to]` from
   `assets/codemods/registry.mjs`. There are 21 version folders in 0.6.2,
   `v0.0.2` … `v0.6.0`.
4. Load the config and run **integration** codemods.
5. Run `hooks.postCodemod`.

Files come from `--path` (default `./src`, confined to cwd), with the
extensions `.tsx .ts .jsx .js .mjs .cjs` by default, plus `.css` for the CSS
transforms. Transforms are jscodeshift.

**What the transforms match** (count of the 66 transform modules in 0.6.2):

| Kind | Count | Behaviour for `import { X } from '@lablup/ui-common'` |
|---|---|---|
| Gated on an `@astryxdesign/core` specifier. Most use an exact set such as `IMPORT_SOURCES = {'@astryxdesign/core', '@astryxdesign/core/Avatar'}`; `banner-collapsible-content` uses `startsWith('@astryxdesign/core')` | 22 | **Skipped.** Never fires. |
| Match JSX element or prop names, string literals, token names, or CSS selectors, with no import check (e.g. `rename-status-variants`, `rename-switch-label-spacing-default-to-hug`, `migrate-astryx-theme-selectors-*`) | 44 | **Fires** on any matching name, whatever the import. It also hits a ui-common component that shares a core name but has a different API. |

**Integration codemods** live under `<codemods>/<version>/<id>.{ts,mjs,js}`,
default-export `{type: 'code' | 'config', title, transform, fileExtensions?,
isOptional?}` (`authoring/codemod/type.ts`), and have ids unique across versions.
**Version folders are compared against the core range** `(--from, installed
core]` (`selectIntegrationCodemods` in
`assets/codemods/integration-discovery.mjs`), **not** against the
integration's own version. An integration can therefore attach migrations to a
core bump. It cannot attach them to its own release, such as ui-common 0.2 →
0.3.

**What this means for tool (2):**

- **Inside ui-common's repository**, ui-common declares core and imports it
  directly, so stock `astryx upgrade --from <old> --path src --apply` works
  unchanged. This covers "absorb upstream upgrades" for ui-common's own
  wrappers.
- **For consumers**, if ui-common **re-exports** Astryx components verbatim,
  core codemods are only partly effective (the 22 import-gated ones miss).
  ui-common would ship integration codemods keyed by core version that re-apply
  those 22 with `@lablup/ui-common` added to the source set. The transforms are
  not exported, so this means vendoring them under MIT or loading them by
  resolved path. If ui-common **wraps** components with its own API, core
  codemods are mostly irrelevant or harmful to consumers. ui-common then owns
  its migrations. The keying mismatch above means those migrations need
  ui-common's own runner (a `ui-common upgrade --from <ui-common version>` that
  drives jscodeshift over the consumer's source, reusing
  `@astryxdesign/cli/codemod` types), or an upstream request to key integration
  codemods by the integration's version.
- `hooks.postCodemod` in the consumer's config can run prettier or eslint on
  the written files. jscodeshift emits double quotes (CHANGELOG notes this
  failed `prettier-format` before the writtenFiles fix).

---

## 7. How `astryx init --features agents` builds the block

`api/init/run/run.mjs` → `installAgentDocs` → `renderAgentDocsBlock` →
`generateCompressedIndex` (`foundation/agent-docs/agent-docs.mjs`):

- **Targets:** existing `CLAUDE.md` / `.claude/CLAUDE.md`, `AGENTS.md`,
  `.cursorrules`, Hermes files, or `--agent <claude|cursor|codex|hermes|muse|all>`
  / `--agent-docs-path`. When none exist, it creates `AGENTS.md`.
- **Markers:** `<!-- ASTRYX:START -->` … `<!-- ASTRYX:END -->`
  (`agent-doc-state.mjs`), plus the legacy `XDS:` markers. The content between
  them is replaced wholesale. A START without an END is refused rather than
  duplicated.
- **Body:** a fixed text template. Only these parts vary:
  - the core version and the **core-only** component count, which is why the
    count excludes BUI;
  - the invocation stem (`getCliInvocation()`, e.g. `pnpm exec astryx`);
  - the styling system (`detectStylingSystem`: stylex / tailwind / css);
  - the `docs <topic>` list, which includes integration topics;
  - **since 0.6.0**, an `INTEGRATIONS:` section rendering each integration's
    `agentDocs.append` lines as `` - `<pkg>`: <line> ``.

  *(Verified in `/tmp`: a ui-common manifest with
  `agentDocs.append: ['Import every component from @lablup/ui-common…']`
  produced that section.)*
- **Refresh:** `upgrade` rewrites stale blocks on `--apply`, and only in files
  that already contain markers (`onlyReplace`).

For ui-common this means the stock generator can carry up to 8 lines of
ui-common guidance through `agentDocs.append`. The core-centric text (SETUP CSS
imports, `@astryxdesign/core/theme/tokens.stylex`, "Badge = counts only") stays.
A fully ui-common-branded block requires ui-common's own generator with its own
markers, so the two do not overwrite each other.

---

## 8. Licensing

`LICENSE` in `@astryxdesign/cli` (and in `@astryxdesign/core`,
`package.json#license: "MIT"`) is **MIT, Copyright (c) 2026 Meta Platforms,
Inc.** Forking, vendoring transforms or docs, and reimplementing are all
permitted, provided the copyright and permission notice travel with any
substantial portion. ui-common is Apache-2.0, which can include MIT code; list
it in `NOTICE` or a third-party licence file. Source files carry
`// Copyright (c) Meta Platforms, Inc. and affiliates.` headers, which must be
kept in copied files. The "Astryx" name is not covered by the licence, so a fork
should not be branded as Astryx.

---

## 9. Implications for FR-4046 (for the decision owner)

1. **Tool (1), CLI through ui-common.** The low-cost path is to make ui-common a
   regular Astryx **integration**: a root manifest, same-stem `.doc.ts` files,
   topics, and `agentDocs.append`, shipped in `files` and checked with
   `integration pack --check`. Then keep using the stock `astryx` CLI. A thin
   `ui-common` bin that spawns it and applies the post-filters from §3 adds
   ui-common branding and core-hiding. A full reimplementation is legal but
   gains little over the typed `./api`.
2. **Unavoidable constraint:** the CLI needs `@astryxdesign/core` resolvable
   from the app directory (§4). "No direct dependency" is achievable for
   runtime imports, not for tooling. Use a devDependency or a public-hoist.
3. **Tool (2), absorbing upgrades.** Stock `upgrade` works inside ui-common's
   own repository. Consumer-side migrations need ui-common-authored codemods,
   and because integration codemods are keyed by core version (§6), ui-common
   probably needs its own `upgrade` runner keyed by ui-common's version.
4. **Housekeeping in this repository**, independent of the plan:
   - move the in-marker hand-edited lines to `backend.ai-ui`'s `agentDocs.append`,
     condensed to 240 characters or fewer;
   - drop the stale "Import line bug" caveat, fixed in 0.6.1.
