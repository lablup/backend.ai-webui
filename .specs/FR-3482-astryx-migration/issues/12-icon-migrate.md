# 12 — 아이콘 배치 전환

**Target:** to-astryx
**Blocked by:** 06, 07
**Status:** done (2026-08-07)

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** @ant-design/icons 사용 225파일을 사상표 codemod로 lucide 전환. 아이콘 외관이 달라지므로 to-astryx 대상.

## Acceptance criteria

- [x] @ant-design/icons import 0(프런티어 주석 제외)
- [x] 대표 화면 스크린샷으로 아이콘 크기/정렬 확인
- [x] verify.sh ALL PASS

## Implementation notes

### Conversion counts (this run, 2026-08-07)

- Codemod pass 1 (`--apply`): **163 files** mechanically rewritten
  (`react/src` + `packages/backend.ai-ui/src`), matching the ticket-07
  dry-run baseline exactly.
- Codemod pass 2 (after collision-guard fix, below): **11 more files**.
- Hand-resolved: **1 genuine collision file** + **4 flagged prop sites** +
  **2 tsc-surfaced sites** + **1 out-of-scan-root file** (theme-probe).
- Final state: `@ant-design/icons` **imports = 0** across the whole repo
  (`react/`, `packages/`, `react/theme-probe/`). Remaining textual mentions
  are comments/doc-strings only (iconShim header, BAIGitHub/GitLabIcon
  provenance notes). Re-running the codemod dry-run reports
  `would rewrite 0 files`. `@ant-design/icons` stays in package.json until
  the Phase-3/4 dependency-removal ticket (fix_antd.css `.anticon` selectors
  and E2E selectors still reference the class via the iconShim frame).

### Codemod bugs found & fixed during the batch (both committed)

1. **`size="1em"` insertion ate arrow functions.** The JSX post-pass matched
   the first `>` after the renamed element name — when an attribute contained
   `() => …` the insertion landed inside the arrow (`onClick={() = size="1em"> …}`),
   breaking 5 files (BAIModal, EnvVarFormList, SessionDetailContent,
   AdminDeploymentPresetModelConfigItem, AdminDeploymentPresetSettingPageContent).
   Reverted the bad insertions and re-added `size="1em"` on the elements by hand
   (6 icon sites). SessionLauncherPage additionally got a duplicate
   `CirclePlay` import (PlayCircleOutlined + PlayCircleFilled both collapse to
   CirclePlay — the import merger didn't dedupe); deduped by hand.
2. **Collision guard false positives.** The guard regex
   `(?:import|const|let|var|function)[^;]*\b<Name>\b` also matched **string
   literals** — `t('button.Info')`, story `title: 'Copy'` — so **11 of the 12
   ticket-07 "identifier already bound" skips were false positives**
   (Info ×3, Settings ×4, User ×2, Users ×1, Copy ×1). Tightened to
   `import[^;]*\bName\b[^;]*from` OR declaration-keyword-adjacent
   (`(?:const|let|var|function)\s+Name`); the 11 files then converted
   mechanically.

### The one genuine collision — ExplorerActionControls.tsx

`UploadOutlined → Upload` collides with antd's `<Upload>` component (used in
the same file). Resolved by hand: `Upload as UploadIcon` from lucide, plus the
other three glyphs (DeleteFilled→Trash2, FileAddOutlined→FilePlus,
FolderAddOutlined→FolderPlus), all `size="1em"`.

### The 4 flagged prop sites

- `LoginFormPanel.tsx` + `BAICard.tsx` (×2): `twoToneColor={token.colorX}` on
  converted glyphs → `style={{ color: token.colorX }}` (stroke-only lucide has
  no two-tone; the token color was the intended visible color).
- `ModelStoreListPageV2.tsx`: `SwapOutlined rotate={90}` had become
  `<ArrowLeftRight rotate={90}>` (lucide has no rotate prop). Lucide has the
  rotated glyph as its own icon → **`ArrowUpDown`**, no transform needed.

### tsc-surfaced fixes (props antd icons accepted but lucide doesn't)

- `Information.tsx` (×4): `title="Yes"/"No"` on Check/TriangleAlert —
  LucideProps has no `title`. Wrapped in `<span title=…>` to keep the native
  hover tooltip.
- `DiagnosticsPage.tsx`: dynamic `spin={isPending}` (codemod only rewrites the
  literal `spin` prop) → `className={isPending ? 'anticon-spin' : undefined}`.

### Out-of-scan-root stragglers

- `react/theme-probe/form.tsx` (measurement harness, outside the codemod's
  scan roots): 3 glyphs converted by hand (Info/CircleMinus/Plus). The
  harness's antd-baseline column measures Form.Item layout, not icons, so
  converting them keeps the repo-wide count at zero without changing what it
  measures.
- `BAIQuestionIconWithTooltip.stories.tsx`: doc-string still described the
  antd `QuestionCircleOutlined` prop surface → updated to `CircleHelp`
  (lucide-react).
- Drive-by fix: `react/theme-probe/gap.tsx` imported
  `../src/theme-shim/breakpoints`, which ticket 09/10 moved to
  `packages/backend.ai-ui/src/theme-shim/breakpoints` — the gap harness was
  crash-looping on boot. Re-pointed the import (needed to capture the gap
  screenshots below).

### Astryx registry note

The 18 `astryxRegistry` names in the map were left as direct lucide imports at
all call sites in this ticket: every converted site renders inside host/antd
JSX (Button `icon`, Tooltip children, table cells), not as an Astryx component
icon-prop where a registry string would apply. Component-by-component tickets
(Phase 2/3) should switch to registry strings when the surrounding component
becomes Astryx.

### Visual check — `.scratch/astryx-migration/shots/12/`

Captured with `capture.mjs` (Playwright chromium, 1400×900; dev server +
theme-probe + storybook all backend-less):

- `login.png` — dev-server login (https://to-astryx.…:1357): Mail/KeyRound
  prefix icons sit inline in the inputs at text size, EyeOff toggle, Cloud +
  Info in the Advanced row — all 1em, no oversized 24px regressions.
- `probe-form.png` — theme-probe form harness, antd vs BAIFormItem columns:
  converted Info tooltip icons align with label text identically in both
  columns; CircleMinus/Plus rows match the antd baseline.
- `probe-gap.png` / `probe-gap-full.png` — gap harness: lucide Inbox/Bell
  center correctly inside Astryx Buttons/IconButtons with BAIBadgeCount
  overlays; BAISelectionLabel ×-clear and BAICopyableText copy IconButtons
  render at the right optical size.
- `storybook-*.png` — BUI storybook story with converted icons.

Finding: icon _size/alignment_ is stable everywhere checked (the mechanical
`size="1em"` preserved antd's inline metrics). Glyph _shapes_ differ by design
(stroke-based lucide vs filled antd) — expected per the ticket-07
PILOT-DECISIONs.

### Verification

- Lint pass surfaced `import/no-duplicates` errors (14 BUI + 112 react):
  files that already imported from `lucide-react` gained a second import line
  from the codemod. Resolved mechanically with `eslint --fix` + prettier —
  no semantic changes.
- `pnpm --prefix ./react exec tsc --noEmit` clean;
  `bash scripts/verify.sh` → `=== ALL PASS ===` (final run after all edits).
- Prettier note: `scripts/**/*.mjs` is outside every prettier config scope —
  running `prettier --write` on the codemod rewrote it to double-quote style;
  reverted that churn and kept only the guard fix.
