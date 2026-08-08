# 29 — BAINotificationStack 재배선

**Target:** to-astryx
**Blocked by:** 08, 11
**Status:** done (2026-08-08)

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** useBAINotification.tsx(1파일)를 갭 컴포넌트 표현층으로 재배선. 열린 결정 #3(hover 일시정지 손실 수용 여부) 확정 포함 — 수용이면 드롭 기록, 아니면 자체 구현(단순 타이머 일시정지 수준이면 진행).

## Acceptance criteria

- [x] 백그라운드 작업 알림 시나리오 실동(진행률·자동 닫힘·액션) — `shots/29/` 12장 + `measure-29.json`, 콘솔/페이지 에러 0건
- [x] antd notification 의존 0 — `App.useApp()`·`antd/lib/notification`·`antd-style` 모두 제거, 파일 내 antd import 0
- [x] verify.sh ALL PASS

## Implementation notes

### The seam ticket 08 left, used as designed

`useBAINotification.tsx` lost the imperative opener and gained a component:

- **removed**: `import { App } from 'antd'`, `createStyles` (the
  `.ant-notification-notice-description` margin patch — nothing to target any
  more), `ArgsProps` from `antd/lib/notification`, and all seven
  `app.notification.open()/.destroy()` calls. `NotificationState` now extends a
  local `BAINotificationArgs` (title / message / description / duration / type
  — the only `ArgsProps` fields any of the 62 call sites set). `tsc` clean with
  no call-site edits.
- **added**: `BAINotificationStackHost` — reads the jotai list, maps it through
  `toBAINotificationStackItems`, renders `BAINotificationStackAstryx`. It
  injects the four things the presentational layer must not know about:
  routing (`useWebUINavigate`), i18n (`t`), the Relay-bound `node` /
  `multiStep` renderers, and `closeNotification`.
- `useBAINotificationEffect` keeps the background-task listeners and shrinks to
  the desktop-`Notification` mirror; `_activeNotificationKeys` survives only as
  that mirror's "already announced?" set.
- **mount point**: `components/NotificationHost.tsx` returns
  `<BAINotificationStackHost />` instead of `null` (2 lines + import). It is
  not `MainLayout`, so ticket 24 is untouched.

Rendering the list instead of mirroring it into a second store also deletes the
two bug classes this file used to carry guards for: the zombie re-open (antd
6.5 stopped firing `onClose` on `destroy(key)`) and the `setHoverKeys` render
loop. Both comments are gone because both hazards are.

### Open decision #3 (hover-pause) — RESOLVED: implemented, not dropped

Evidence for the call: the auto-close timer is a single `setTimeout` inside
`BAINotificationStackItemView`. Pausing it costs one `useState`, one ref that
banks the remaining budget in the timer effect's cleanup, and four handlers on
the wrapper (`mouseEnter`/`mouseLeave`, plus React's delegated `focus`/`blur`
so a keyboard user tabbing into the action buttons gets the same reprieve). No
new dependency, no new component, ~15 lines. That is well inside the ticket's
"if it's a simple timer-pause, do it" clause, so the drop clause never fired.

**Consequence: no user-visible behaviour loss, so nothing here needs user
ratification.** §6 row 3 of MIGRATION-SPEC ("유일한 실손실") can be closed as
*no loss*.

Measured (`measure-29.json`): held under the pointer for 8s with a 4s budget →
still open, `data-paused="true"`; pointer away → closes on the banked
remainder. Also asserted as a unit test.

### Bug found and fixed in the adapter (would have broken every task notice)

`toBAINotificationStackItems` mapped `duration` straight through. antd treats
`duration: 0` as **stay open** and this hook sets exactly that on every pending
background task (`upsertNotification`'s "`status === 'pending'` → `duration:
0`" default), while the view reads `0` as a zero-millisecond timer. Wired
as-is, every background-task notice would have closed on its first frame.
Fixed to `> 0 ? duration : null`; covered by a regression test and by the live
`duration 0 stays open` probe.

The `open` filter was also tightened from `!== false` to `=== true`: a
notification that never asked to be shown belongs to the drawer only, which is
the distinction antd's opener made. Also unit-tested.

### PILOT-DECISIONs (this ticket)

1. **`node` / `multiStep` land in a new `content` slot, not `children`.** Ticket
   08 guessed they would fill the collapsible `children` area, but both render
   a *complete* notice (folder/session link, status tag, step list, their own
   progress and `extraDescription`). Putting them under a title + description
   would duplicate everything. `content` replaces title/description/progress
   and takes the Banner header's content column outright.
2. **`extraDescription` → Banner `children`** (the built-in chevron disclosure),
   for general notices only — the two renderers above draw their own. This
   settles ticket 08's third deferred item essentially for free, and the
   disclosure is closer to antd's hand-rolled "See detail" toggle than
   anything else on offer.
3. **Actions moved out of the Banner's `endContent` into the description
   column.** Measured first: at the stack's 384px, `Cancel` + `View folder` in
   the header end area squeezed "Cloning folder my-training-data" into three
   wrapped lines. antd put the link and Cancel on their own row *below* the
   message; the description slot reproduces that placement exactly. Before/after
   is visible between the two `29-5-stack-light.png` captures in the run log.
   Only the dismiss ✕ and the disclosure chevron stay in the header.
4. **`toText` / `toTextKey` / "See detail" resolve in the host, via a
   `getActionText` option** — the adapter stays a pure mapper and the
   translation frontier stays on the app side (spec §0). Same for the
   `Cancel` / `Retry` labels (`cancelText` / `retryText` options).
5. **`_.truncate(200/300)` on message/description dropped.** The stack is 384px
   and wraps; hard-clipping an error message mid-word is a worse default than a
   taller notice. Recorded rather than reproduced.
6. **`icon: 'folder'` not mapped.** Every call site that sets it also sets
   `node`, so the folder glyph arrives with the `content` renderer. The view's
   `icon` prop stays available if a call site ever needs it alone.
7. **A settled promise keeps its last percent** (a task resolved at 70% shows a
   70% success bar). Parity with the antd path — `BAINotificationBackgroundProgress`
   rendered `backgroundTask.percent` unchanged too, and only the SSE `onDone`
   handler sets 100.

### Verification (2026-08-08)

Live harness: `react/theme-probe/notification29.html` + `.tsx`. Unlike ticket
08's `gap.tsx` (static item list), it mounts the **real** `NotificationHost` —
`useBAINotificationEffect` + `BAINotificationStackHost` — and only calls
`upsertNotification`, exactly as `FolderCreateModalV2` does. The background
task is driven through `backgroundTask.promise`, so the hook's own settle path
runs.

```
cd react && pnpm exec vite --config theme-probe/vite.config.mts --port 5745
node .scratch/astryx-migration/measure-29-notification.mjs
```

(Agent port range 5745–5754; the probe config's default 9198 is overridden on
the CLI.)

Results — `.scratch/astryx-migration/shots/29/measure-29.json`, **0 console /
page errors**:

- lifecycle (light + dark): `pending` indeterminate bar, no value → `70%`
  determinate, status `info` → promise resolves → status `success`,
  `duration: 4` → auto-closed, 0 notices left. Frames `29-1`…`29-4`.
- stack of three + the `extraDescription` disclosure open, light + dark
  (`29-5`, `29-6`); `ETIMEDOUT after 30000ms` visible only after the toggle.
- action button: "View folder" navigates and closes the notice (1 → 0).
- hover pause: `data-paused=true`, survives 2× its budget under the pointer,
  closes after leaving.
- `duration: 0` stays open past 6s.
- manual dismiss: 2 → 1 exiting → 1, exit transition plays.

Unit tests: `react/src/hooks/__tests__/useBAINotification.test.tsx` rewritten
against the rendered stack (8 tests, all green) — the antd `<App>` provider is
gone from the harness, which is itself part of the proof. The four legacy
regression cases are kept, plus drawer-only filtering, `duration: 0`, and
hover-pause.

Repo-wide test suite: 5 pre-existing failures in 3 unrelated files
(`usePrimaryColors`, `MyResourceWithinResourceGroup`, `backendai` — stylex
`create()` at import time under vitest, which has no stylex plugin). Verified
identical with this ticket's diff reverse-applied; untouched here.

Gates: `bash scripts/verify.sh` → `=== ALL PASS ===`. P15 import-graph gate
reports nothing on the touched files; token gate's 8 findings are the
pre-existing antd-era `BAIModal.tsx`.

### Hand-off — ticket 31 (e2e selectors)

21 `.ant-notification-notice` locators across 8 e2e files are now dead
(`e2e/utils/classes/common/NotificationHandler.ts` and
`e2e/utils/test-util-antd.ts` are the two funnels; the rest are specs in
app-launcher / serving / chat / auto-scaling-rule-preset / vfolder). Left for
ticket 31, which owns e2e selectors and can actually run the suite against a
cluster. The replacements already exist and are asserted above:
`[data-testid="bai-notification-stack"]`, `[data-notification-key="<key>"]`,
`[data-status]`, `[data-exiting]`, `[data-paused]`.
