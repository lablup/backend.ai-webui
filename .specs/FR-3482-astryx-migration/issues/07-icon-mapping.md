# 07 — 아이콘 사상표 + 어댑터 (expand)

**Target:** main
**Blocked by:** 01
**Status:** done (2026-08-07)

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** @ant-design/icons → lucide-react 전환 기반. 실사용 아이콘 99종 사상표, Icon/CustomIconComponentProps(51파일) 대응 어댑터/re-export 셈, lucide 메이저 충돌(^0.552 vs ^1.18) 해소, 배치 전환 codemod 제작. 배치 적용은 티켓 12.

## Acceptance criteria

- [x] 사상표가 실사용 99종 전부 커버(미대응은 자체 SVG 경로 명시)
- [x] codemod가 샘플 디렉터리에서 동작 증명
- [x] lucide 단일 메이저로 수렴, verify.sh ALL PASS

## Implementation notes

### Measured surface (this worktree, 2026-08-07)

- 227 files import `@ant-design/icons` across `react/src` + `packages/backend.ai-ui/src`
  (multiline imports included; own AST-less scanner, matches the ticket's profile data).
- 99 distinct imported names = 97 glyph names + `Icon` (default import, 51 files) +
  `CustomIconComponentProps` (subpath type import, same 51 files). All 51 bespoke
  `BAI*Icon` renders live in `packages/backend.ai-ui/src/icons/` — none host-side.

### Mapping table — `scripts/codemods/antd-icons-to-lucide.map.json`

- Covers 100% of the measured names. Every `lucide` target verified to exist as an
  export of the installed `lucide-react@1.28.0`.
- 95 glyphs map to lucide; 2 have **no lucide equivalent** (lucide 1.x removed brand
  icons): `GithubOutlined` / `GitlabOutlined` → own SVGs
  `packages/backend.ai-ui/src/icons/GitHub.svg` / `GitLab.svg` (antd glyph geometry
  from `@ant-design/icons-svg`, MIT) wrapped as `BAIGitHubIcon` / `BAIGitLabIcon`,
  exported from the BUI barrel.
- `astryxRegistry` fields note the 18 names whose semantics match Astryx's 28-name
  registry (close/chevron*/check/success/error/warning/info/clock/search/copy/…)
  so ticket 12 can prefer registry strings inside Astryx components.
- PILOT-DECISIONs recorded in the table:
  - **Filled/TwoTone collapse** (stroke-only lucide): DeleteFilled→Trash2 vs
    DeleteOutlined→Trash keeps the pair distinguishable, but "delete forever vs move
    to trash" now rests on the label (33-file decision flagged by MAPPING.md §7).
    All other Filled/TwoTone variants collapse onto the outlined twin; `twoToneColor`
    is dropped (codemod flags each site).
  - CaretDownOutlined→ChevronDown (filled caret inexpressible).
  - SecurityScanOutlined→ShieldCheck (composite glyph, simplicity policy).
  - StopFilled→Ban — deliberately NOT Astryx registry `stop` (that is media-stop).
  - ReloadOutlined→RotateCw (1 arrow) vs SyncOutlined→RefreshCw (2 arrows).

### Adapter shim — `packages/backend.ai-ui/src/icons/iconShim.tsx`

- Drop-in for antd's P16 surface: default `Icon` + `CustomIconComponentProps` /
  `IconBaseProps` / `IconComponentProps` types copied verbatim from
  `@ant-design/icons/lib/components/Icon.d.ts`, so the 51 consumer interfaces
  (`Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'>`) compile unchanged.
- Renders antd's exact frame: `<span role="img" class="anticon">` + svg with
  `1em/1em/currentColor/aria-hidden/focusable=false`; supports `spin`/`rotate`.
- Keeps the `anticon` class on purpose — `react/src/fix_antd.css`, unit tests and
  E2E selectors key on it until the Phase-4 selector migration.
- Baseline CSS + spin keyframes are **runtime-injected once** (`useInsertionEffect`):
  BUI has `sideEffects: false`, so a CSS-file import would be tree-shaken out of
  consumers (P17-safe delivery).

### lucide major convergence — **1.x** (catalog `^1.18.0`)

- Decision: converge UP to the Astryx side, not down. `@astryxdesign/theme-neutral@0.3.0`
  carries `lucide-react ^1.18.0` as a hard *dependency* (not peer) — overriding it to
  0.552 would force a package below its declared range and break on every theme update.
- Measured feasibility before deciding: all 78 lucide names the app already imports AND
  all 29 names theme-neutral's registry imports exist in **both** 0.552.0 and 1.28.0;
  only the two brand icons (Github/Gitlab, used once each via @ant-design/icons, not
  via lucide) are 1.x casualties → own-SVG.
- Result: app (`react/`), BUI, and theme-neutral all resolve the **same**
  `lucide-react@1.28.0` store link (`pnpm why` verified). Residual 0.469/0.553 copies
  are pulled only by `@lobehub/*`, which is out of scope here and removed entirely in
  Phase 3 (spec §7 / §1-⑤).
- 1.28.0 was published 2026-07-30 (>7d) — passes `minimumReleaseAge` without an exclude.

### Batch codemod — `scripts/codemods/antd-icons-to-lucide.mjs`

- Same CLI contract as the theme codemod (`--apply` / `--only` / `--list`; dry-run default).
- Per file: named-glyph imports → `lucide-react` (word-boundary identifier renames);
  default `Icon` + `CustomIconComponentProps` subpath → merged single iconShim import
  (`import/no-duplicates` is an error in BUI lint); own-SVG glyphs → `backend.ai-ui`
  (host) or relative (BUI) import.
- JSX post-passes: `spin` → `className="anticon-spin"` (keyframes: fix_antd.css + shim);
  `size="1em"` inserted on every renamed JSX element without an explicit size
  (**PILOT-DECISION:** antd icons are 1em inline; lucide defaults to 24px — mechanical
  1em preserves inline layout, Astryx-hosted sites can drop it in ticket 12).
- Honest-failure design: flags instead of rewrites for aliased imports, `rotate`,
  `twoToneColor`, and identifier collisions (target name already bound from a
  non-lucide source ⇒ whole file skipped + reported).
- Whole-tree dry run: **215 of 227 files mechanically rewritable**, 12 collision skips
  (Info/Settings/User/Users/Copy/Upload already bound), 4 prop flags
  (2× twoToneColor in BAICard, 1× twoToneColor LoginFormPanel, 1× rotate
  ModelStoreListPageV2).
- After `--apply`, run `pnpm exec prettier --write` on touched files (sort-imports
  plugin re-orders the rewritten lines) — documented in the codemod header.

### Sample applications — **kept** (both clean)

1. `--only backend.ai-ui/src/icons/` — all **51 bespoke icon files** now import the
   shim; the icons directory is antd-runtime-free (comments aside). This is the
   "highest-leverage pre-pass" MAPPING.md §7 calls for: 51 files converted from
   antd renders to assets, keeping the P15 grep gate honest for ticket 12.
2. `--only DeploymentRevisionDetail` — glyph conversion proof:
   `LoadingOutlined spin` ×2 → `LoaderCircle className="anticon-spin" size="1em"`.

### Verification

- `bash scripts/verify.sh` → `=== ALL PASS ===` (Relay/Lint/Format/TypeScript/
  Vite warmup/StyleX sentinel/theme build/terminology).
- `pnpm run build:react-only` → built clean (deps touched: lucide 0.552→1.28).
- BUI vitest: 369 passed | 1 skipped.
- Remaining for ticket 12: 163 files dry-run-rewritable + 12 collision files +
  4 flagged prop sites.
