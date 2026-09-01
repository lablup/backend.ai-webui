# 08 — 갭 컴포넌트 5종 반입

**Target:** main
**Blocked by:** 01, 02
**Status:** done (2026-08-07)

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** BAISkeleton·useBAIBreakpoint(+브레이크포인트 토큰)·BAIPopconfirm·BAIBadgeCount·BAINotificationStack(표현층+어댑터)을 spike/astryx-pilot에서 반입, 데모 라우트 포함, 앱에서는 아직 미사용. bare-SVG 아이콘 버튼 2건(BAISelectionLabel ✕, BAICopyableText) IconButton 전환 후속 포함.

## Acceptance criteria

- [x] 데모 라우트에서 5종 상태별 렌더 + 스크린샷(라이트/다크) — `shots/08/` 21장, 콘솔/페이지 에러 0건
- [x] P8/P9/P19 체크리스트 통과 — 토큰 게이트에서 신규 파일 0건 (아래 참조)
- [x] verify.sh ALL PASS

## Implementation notes

Imported from `origin/spike/astryx-pilot` (f8c36888f, 2f753a9ba, d0815a005) with the
P19 fixes from 40be82cd1 already folded in. Files:

- `react/src/components/astryx-bui/BAISkeletonAstryx.tsx`
- `react/src/theme-shim/breakpoints.ts` (`useBAIBreakpoint`, `BAI_BREAKPOINTS`,
  `BAI_BREAKPOINT_QUERIES` — antd values verbatim, `useSyncExternalStore` so the
  first render is already correct)
- `react/src/components/astryx-bui/BAIPopconfirmAstryx.tsx`
- `react/src/components/astryx-bui/BAIBadgeCountAstryx.tsx`
- `react/src/components/astryx-bui/BAINotificationStackAstryx.tsx` + `BAINotificationStackAdapter.tsx`
- `react/src/components/astryx-bui/astryxBui.css` — badge-count + notification-stack
  sections only (countdown-border/name-action-cell/list-alert rules stay with their
  components in later tickets)
- Follow-up pair, converted to Astryx `IconButton` on import:
  `BAISelectionLabel.tsx` (✕ clear), `BAICopyableText.tsx` (copy control)

Nothing in `react/src/App.tsx` / `routes.tsx` / hooks is rewired — the app does not
use these yet (per ticket).

### Demo route — choice noted

**theme-probe extension**, not an in-app route: `react/theme-probe/gap.html` +
`gap.tsx` + `gap.css`. Rationale: the app dev server's
`projectRootStaticPlugin.transformIndexHtml` discards extra HTML entries (see
theme-probe/vite.config.mts header), the harness needs no backend/auth, and
tickets 02–05 already measure through it. Serve:
`cd react && pnpm exec vite --config theme-probe/vite.config.mts` →
`http://127.0.0.1:9198/theme-probe/gap.html`. `?state=popconfirm|notifications`
selects deterministic frames; colour mode follows `prefers-color-scheme`.

### Verification (2026-08-07)

- Screenshots: `.scratch/astryx-migration/shots/08/` — overview/per-column
  light+dark, popconfirm open light+dark, notifications light+dark, breakpoint at
  480/900/1700px (`node .scratch/astryx-migration/measure-08-gap.mjs`).
- Behaviour asserts, all green, zero console/page errors:
  - breakpoint: 1700px → xxl true, 500px → xs true, **no reload**
  - popconfirm: focus on open = "Cancel" (safe action), Escape closes, focus
    returns to trigger ("Set as main")
  - notification close: 4 → exiting 1 → 3 remaining (exit transition plays)
  - follow-up: ✕ and copy are reachable by role=button; ✕ click clears the label
- P19 (`node scripts/migration-gates/astryx-token-gate.mjs`): **0 findings in the
  new files**; remaining 8 are pre-existing `BAIModal.tsx` (antd-era, out of scope).
- `.ant-*` selector gate: 0 references in the new files (1041 repo-wide are the
  known Phase-1 backlog).
- P15 (`node scripts/migration-gates/antd-import-graph.mjs`): all 8 new files
  classified **clean** (antd-free transitive graph).
- P8: popconfirm focus contract asserted; badge overlay `role="status"` +
  `aria-label`; ProgressBar `label` always set; IconButtons carry `label` +
  `tooltip`.
- P9: spacing steps mapped by value (skeleton LINE_GAP step 4 = 16px, stack inset
  `--spacing-6` = 24px = antd's notification inset).
- `bash scripts/verify.sh` → `=== ALL PASS ===`.

### PILOT-DECISIONs (this ticket)

1. **Adapter is structurally typed.** `BAINotificationSource` (subset of
   `NotificationState`) replaces the spike's type-only import of the hook module:
   a type-only import is erased at runtime but the static P15 gate counts it as an
   edge, and the gate's judgement is what this directory must satisfy. Rewiring
   stays a one-file change; `NotificationState` satisfies the shape with no cast.
2. **`useEffectEvent` for the auto-close timer** (was an
   `eslint-disable react-hooks/exhaustive-deps` in the spike) — project rule
   `use-effect-event.md`; the timer no longer restarts when a parent re-creates
   `onClose`.
3. **IconButton conversions grow the hit box** from the bare 14/16px glyph to the
   `sm` ghost control box — accepted; the hover surface + focus ring is the point,
   pixel equality is a non-goal (spec §0 시각값 정책).
4. **Demo's Suspense-card pairing uses Astryx `Card` directly** — `BAICardAstryx`
   is not part of this ticket; per the wrapper policy the demo composes
   Card + HStack header instead of importing a pilot component out of scope.
5. Carried from the spike, still open: skeleton `size="small"` = 28px
   (+4px vs antd 24), BadgeCount default variant = Astryx neutral (antd was
   implicitly red — each migrated site must state its colour), notification
   hover-pause loss (spec §6-3), deferred `node`/`multiStep`/`extraDescription`
   renderers (annotated in the component header).
6. **Gates parse comments too**: three comment strings (a `var(--x, literal)`
   example, a `.ant-…` class-name mention, an inline `import … from` example)
   tripped the token/selector/import-graph gates and were reworded. Lesson for
   later tickets: don't quote forbidden patterns verbatim in comments.
