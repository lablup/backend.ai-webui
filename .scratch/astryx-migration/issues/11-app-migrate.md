# 11 — App 셰임 대량 적용

**Target:** main
**Blocked by:** 04, 06
**Status:** done

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** App.useApp() 호출 134지점 import 교체(95% 기계) + 6곳 소정리 + 진짜 갭 1곳(VFolderTextFileEditorModal 3버튼 footer) 재작성.

## Acceptance criteria

- [x] 전 지점 전환, antd App import 0(프런티어 제외) — 135 caller files on the
      shim; survivors are exactly the 4 documented frontier files (below).
- [x] 파괴적 액션 흐름(typed confirm) 회귀 없음 — RTL substitution (below;
      no destructive flow is reachable without a live cluster).
- [x] verify.sh ALL PASS

## Implementation notes (2026-08-07)

**Shim core moved to BUI (ticket-10 theme-shim precedent):**
`react/src/app-shim/{bridge,message,modal,index,appShim.test}` →
`packages/backend.ai-ui/src/app-shim/` (BUI has `@astryxdesign/core` +
`lucide-react`; zero react/src-only deps; no export-name collisions).
`react/src/app-shim/index.tsx` is now a pure re-export of `backend.ai-ui`,
so all react/src `'../app-shim'` imports keep working, and BUI files import
the core via relative path (self-package import would be circular).
`export * from './app-shim'` added to BUI `index.ts`. Measured first: 16 BUI
files call `App.useApp()`, so react-scoped was not an option.

**Site counts (measured, not the ticket's estimate):**

- 137 files imported antd `App` at start; **135 caller files** end on the shim
  (LoginView/LoginFormPanel were already converted in ticket 04).
- **131 files** converted by the new codemod
  `scripts/codemods/antd-app-to-shim.mjs` (dry-run → `--apply`; 121 needed an
  antd import split; frontier detection: `<App` JSX render / `AppProps` /
  `app.notification` → skip + report). Same TARGETS structure as
  `antd-theme-to-shim.mjs`.
- **7 manual cleanup sites** (answers/07 §1.3 — the "6곳" was 7 by the final
  measure): `SignoutModal.tsx` (`message.useMessage()` + contextHolder →
  shim static `message`, contextHolder deleted), `MainLayout/WebUIHeader.tsx`
  (`Modal.useModal()` + contextHolder → shim static `modal`), and 5 static
  `import { message } from 'antd'` files → shim `message` import swap:
  `DeleteVFolderModal`, `RestoreVFolderModal`, `RestoreVFolderModalV2`,
  `QuotaSettingModal` (react/src), `BAIDeleteArtifactRevisionsModal` (BUI).
- **8 BUI story files** wrapped stories in a bare antd `<App>` purely for
  imperative context — wrappers deleted, replaced once by `<BAIAppProvider>`
  in `.storybook/decorators.tsx` (inside ThemeShimProvider), so story-driven
  message/modal flows now really work in Storybook (antd's context-less
  fallback used to no-op with a console warning).

**Shim type widening forced by real call sites (4 tsc errors after codemod):**
`ModalShimFuncProps` gained `closable` (accepted-and-ignored — Escape already
cancels per the existing maskClosable/keyboard PILOT-DECISION, so a header-X
toggle enforces nothing), `okButtonProps.loading` (accepted-and-ignored —
antd only honors a *static* loading here and this repo never `.update()`s;
typed `unknown` because antd ButtonProps `loading` is `boolean|{delay…}`),
and `cancelButtonProps` (**`disabled` is honoured** on the Dialog-branch
cancel button; other keys ignored). Sites: `MyKeypairManagementModal`,
`SessionLauncherPage`, `BAIPullingArtifactRevisionAlert`,
`BAINameActionCell`.

**Gap rewrite — `VFolderTextFileEditorModal.tsx`:** the 3-button unsaved-
changes confirm (Save / Don't Save / Cancel + mid-flow `.destroy()`) had no
shim/AlertDialog analog. Rewritten as a **controlled Astryx `Dialog`**
(`purpose="form"`) with a hand-built `Layout` footer — the same composition
technique as the shim's ReactNode branch, local `isUnsavedConfirmOpen` state
instead of the imperative handle. Same button order (Cancel · Don't Save ·
Save), same semantics (Save closes the confirm then runs the save mutation;
the editor modal's own confirmLoading covers the pending state, as before).
No PILOT-DECISION needed — no capability was dropped.

**Survivors (antd `App` import > 0, all deliberate frontier):**

1. `react/src/components/DefaultProviders.tsx` — root antd `<App>` element +
   `AppProps` (provider layer; also hosts `<BAIAppProvider>`).
2. `react/src/components/MainLayout/MainLayout.tsx` — nested antd `<App>`
   element (`display: contents`) for not-yet-converted children.
3. `react/src/components/LoginView.tsx` — `App as AntdApp` nested element
   (SignupModal subtree, ticket-04 frontier).
4. `react/src/hooks/useBAINotification.tsx` (+ its test) — the notification
   leg, deliberately out of scope (answers/07 §2, independent ticket).

**Destructive-confirm smoke (recorded substitution):** every typed-confirm
flow (delete-forever vfolder, purge user, endpoint terminate) requires a live
cluster, so no e2e spec is runnable here. Substituted with an RTL test —
`packages/backend.ai-ui/src/app-shim/destructiveConfirmFlow.test.tsx` —
reproducing the exact post-ticket wiring: `BAIDeleteConfirmModal`
(`requireConfirmInput`) inside `BAIAppProvider`, `onOk` reporting via shim
`message.success`. Asserts the typed gate (OK disabled until the exact
string) and that the success toast renders in the Astryx viewport (text
appears in toast body + a11y live region). 1/1 PASS; full BUI suite 389
passed / 1 skipped.

**Verification:** `bash scripts/verify.sh` → `=== ALL PASS ===` (Relay, Lint,
Format, TypeScript, Vite warmup, StyleX, Astryx theme build, Terminology).
react vitest: 1097 passed, 5 failed — all 5 in
`src/hooks/usePrimaryColors.test.tsx` and **pre-existing on the branch**
(re-verified identical with this ticket's changes stashed; theme-shim ticket
fallout, not App-related).
