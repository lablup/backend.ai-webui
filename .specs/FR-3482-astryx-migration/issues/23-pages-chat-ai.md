# 23 — 페이지군 ⑨ Chat/AI Agents (@ant-design/x 대체 판단 포함)

**Target:** to-astryx
**Blocked by:** 09, 10, 11, 12, 13, 14
**Status:** done

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 해당 메뉴 영역의 페이지·컴포넌트를 MAPPING.md(DIRECT+PROP-CONDITIONAL)로 전환. 원본 레이아웃 충실도 유지, 공유 컴포넌트는 프런티어 번역, 갭 컴포넌트(08) 사용. 복잡해지는 antd 기능은 단순성 정책대로 드롭+기록.

## Acceptance criteria

- [x] 영역 내 antd 컴포넌트 렌더 0(Form 계열·프런티어 제외) — P15 리졸버로 증명
- [x] 페이지별 before/after 스크린샷(라이트/다크) 시각 게이트 통과
- [x] PILOT-DECISION/드롭 목록 기록
- [x] verify.sh ALL PASS

## Implementation notes

### Area (router-derived scope)

- `/chat/:id?` → `ChatPage` — `ChatCard`, `ChatHeader`, `ChatInput`, `ChatSender`,
  `ChatMessages`/`VirtualChatMessageList`, `ChatMessage`/`AssistantChatMesssage`/
  `UserChatMesssage`, `ChatMessageContent`, `ChatMessageContainer`,
  `ChatTokenCounter`, `ChatParametersSliders`, `CustomModelForm`,
  `DeploymentSelect`, `DeploymentTokenSelect`, `ModelSelect`, `AIAgentSelect`,
  `CopyButton`, `ScrollBottomHandlerButton`, `SyntaxHighlighter`, `ChatHistory`
  (hook), `ChatModel` (types).
- `/ai-agent` → `AIAgentPage` — `AgentEditorModal` (uses `useAIAgent`; distinct
  from the compute-agent `Agent*`/`AgentNodeItems` family, which belongs to
  Environments/Resources, not this ticket).
- `/model-store` → `ModelStoreListPageV2` — `ModelCardDrawer` (confirmed by
  ticket 19 as belonging here, not Environments). `ModelBrandIcon`,
  `AuthorIcon`, `TextHighlighter` shared leaves.
- `ModelCardChat.tsx` — orphaned/unreferenced (no import site anywhere in the
  router or component tree; likely pre-FR-3332 dead code). Left as-is; it
  becomes transitively antd-free automatically since its only import,
  `ChatCard`, is now converted.
- Excluded: `AgentSummaryPage`/compute-`Agent*` family (menu group `metrics`,
  infra agents, not AI) and `AdminModelCard`/`ModelCardDeployModal` callers in
  Deployments/VFolder areas (tickets 16/18 own those pages).

### Conversions (ticket-15/18/19 idioms followed)

- `Card` (bare-container composition, MAPPING §5.1): `ChatCard`'s outer
  antd `Card` (`title`=`ChatHeader`, custom `styles.body/header`) →
  hand-composed `Card padding={0}` + `BAIFlex` header/body split (no
  BAICardAstryx — its generic padded-header recipe collides with this page's
  full-bleed chat body); `ChatPage`'s page-level card → `Card padding={6}` +
  `VStack`/`HStack`; `ModelStoreListPageV2`'s per-model `Card hoverable` →
  `Card padding={3}` (antd `paddingSM`≈12px → step 3); `ModelCardDrawer`'s
  nested README `Card size="small"` → `Card padding={4}` + `VStack`/`HStack`.
- `Drawer` → lab `Drawer` (ticket-18 idiom: `hasScrim={false}`≈antd
  `mask={false}`, `side="end"`, manual heading+extra row since lab Drawer has
  no title bar): `ChatPage`'s history drawer, `ModelCardDrawer`. The latter's
  antd `loading` prop (opening-transition skeleton) has no lab equivalent →
  manual `BAISkeletonAstryx` conditional on `useDeferredValue(open) !== open`.
- `Descriptions bordered column={1} size="small"` → `MetadataList` +
  `MetadataListItem` (`ModelCardDrawer`); `bordered`/`size="small"` dropped
  (NONE, MAPPING §4).
- `Grid` responsive recipe R1 (RESPONSIVE-POLICY.md, identical on both):
  antd `Row/Col xs={24} sm={24}(/md={24}) lg={12} xl={12} xxl={8} xxxl={6}`
  (2-up first at `lg`=992px, 4-up at `xxxl`) → `Grid columns={{minWidth: 496,
  max: 4}} gap={4}` on `AIAgentPage` and `ModelStoreListPageV2` — the repo's
  two `xxxl` census sites (RESPONSIVE-POLICY.md §1).
- `Tag`/`Badge` exclusively via `badgeVariantForTagColor` (ticket-13 lookup):
  `AIAgentPage`, `ModelStoreListPageV2`, `ModelCardDrawer`, `ChatTokenCounter`.
- `Tooltip`+icon-only `Button` / `Dropdown` menus → `IconButton` (real
  i18n labels) + `DropdownMenu` (`items`+`button` data-driven trigger, no
  wrapping antd `Button`): `ChatHeader`, `ChatPage` history rows,
  `AIAgentPage` card overflow menu, `DeploymentSelect` info button. `Popover`
  → Astryx `Popover` (`placement="bottomLeft"` → `placement="below"
  alignment="start"`).
- `Typography.Text/Paragraph` → `Text` (`color="secondary"`, `weight=
  "semibold"`, `maxLines`); `Typography.Title` → `Heading level`.
- `Alert` → `Banner` (`showIcon` dropped — default; `closable` → `isDismissable`
  +`onDismiss` where the callback carries real meaning, e.g. the chat intro
  banner's dismissed-flag write).
- `Space.Compact`/`Space` → `BAIFlex`/`HStack` gap rows; the `DeploymentSelect`
  select+info-button weld is **dissolved, not preserved** (PILOT-DECISION 5).
- `Skeleton`/`Skeleton.Input` → `BAISkeletonAstryx` (`variant="input"` for the
  inline loading placeholders in `DeploymentSelect`/`ModelCardDrawer`).
- `Pagination` (`ModelStoreListPageV2`) → Astryx `Pagination
  variant="count"` (ticket-19 idiom: `showTotal` → `variant="count"`, loses
  the page-number buttons since the two are mutually exclusive on Astryx).
- `Avatar` (`ChatMessageContainer`, arbitrary emoji `children`) — self-built
  circular `BAIFlex` badge; Astryx `Avatar` has no children slot (PILOT-DECISION 3).
- `Collapse` (reasoning disclosure, `ChatMessage`) → `Collapsible`
  (`defaultIsOpen={false}` to match antd's collapsed-by-default).
- `Image` (inline image attachment, `ChatMessage`) → `Thumbnail`.

### Forms (engine stays; visuals via BAIFormItem)

- `AgentEditorModal` (23 fields) fully converted: `Input`/`Input.Password` →
  `AstryxFormTextInput`; `Input.TextArea` → new **`AstryxFormTextArea`**
  adapter (added to the shared `react/src/components/astryxFormControls.tsx`
  — the fourth adapter file this repo's Form modals need, MAPPING §3.6);
  `Radio.Group`+`Radio.Button` → new **`AstryxFormSegmented`** adapter
  (`SegmentedControl`+`SegmentedControlItem`, MAPPING §3.10); `Divider
  titlePlacement="left"` → `Divider` (label position dropped, NONE).
  `Select mode="tags"` (free-entry Tags field) → comma-separated
  `AstryxFormTextInput` (PILOT-DECISION 6 — `Tokenizer` is a real
  composition, disproportionate for one low-stakes field). The eight
  `disabled` read-only display fields (tool/model/settings catalog preview,
  never editable) simplified from disabled `Select`/`InputNumber`/`Switch`
  controls to a local `ReadOnlyField` (`BAIFormItem` + `Text`) — a disabled
  control nobody can interact with is just a styled label.
- `CustomModelForm` (2 fields): `Input`/`DeploymentTokenSelect` →
  `AstryxFormTextInput`/unchanged; `Input prefix={deploymentUrl}` (arbitrary
  text-node prefix) dropped (PILOT-DECISION 13).
- `ChatParametersSliders`: `Form.Item` → `BAIFormItem`; the antd
  `ConfigProvider` Form component-token override (tightened vertical
  spacing) is moot once `BAIFormItem` owns the visuals — replaced by
  `BAIFormItem`'s own `--bai-form-item-margin-bottom`/`-gap` CSS custom
  property override hooks on the `Form` container.
- `DeploymentTokenSelect`: antd `Select options[].label: ReactNode` (a
  two-line token-tail + expiry row) → Astryx `Selector` with `renderOption`
  (label stays a required string fallback, MAPPING §3.1 "everything else"
  branch); the hover tooltip (full issued→expiry timestamp) has no
  destination on a `Selector` option row and is dropped.
- `AIAgentSelect`: antd `Select showSearch={{filterOption:false, onSearch}}`
  (remote-shaped incremental search) → `Selector hasSearch` (client-side
  filter over the already-loaded small agent catalog — behaviourally
  equivalent here, the catalog is never large).

### PILOT-DECISION / drop list

1. **`@ant-design/x`** (`Attachments`, `Sender`, `FileCard`) — the ticket's
   named judgment call. Verdict: **FRONTIER, not converted.** Not in
   MAPPING.md (outside the measured antd core surface); no Astryx
   composer/dropzone/file-card equivalent exists (NONE by inspection).
   Rebuilding a drag-drop attachment zone + auto-resize streaming composer
   input is disproportionate to this ticket. Treated identically to the
   lobehub icon packages: kept as-is, only the antd chrome AROUND it
   converted (`ChatSender`'s `Badge`/`Button` → self-built dot overlay +
   `IconButton`). Affects `ChatInput.tsx`, `ChatSender.tsx`, `ChatMessage.tsx`
   (type-only/direct `@ant-design/x` imports — the three remaining
   frontier-flagged files in the P15 report besides the Form-engine SHIM).
2. **`ModelCardDeployModal.tsx` / `InputNumberWithSlider.tsx`** — shared
   cross-ticket components invoked from three different areas
   (Data/VFolder‑16, Sessions‑17/Deployments‑18, Chat/AI‑23). Ticket 16
   already flagged `ModelCardDeployModal` as "other-ticket shared component
   (frontier rule)" and left it unconverted; ticket 23 follows the same
   precedent for both rather than claiming unilateral ownership of a
   3-way-shared component. Still direct-antd (`Alert`/`Button`/`Space`/
   `Tooltip`); taints `ModelCardDrawer`/`ChatParametersSliders` transitively.
3. Astryx `Avatar` has no `children` slot (antd's arbitrary emoji content) —
   self-built as a fixed circular `BAIFlex` box (`ChatMessageContainer`).
4. antd `Badge dot`/count overlays have no Astryx destination (MAPPING §3.8,
   NONE) — self-built absolutely-positioned dot in a `position:relative`
   wrapper, twice: the attachment-pending indicator (`ChatSender`) and the
   selected-history-row marker (`ChatPage`'s history drawer).
5. `Space.Compact` welds dissolve to a plain gapped `BAIFlex` row wherever
   one side is `BAISelect` (BUI, still antd-shaped/frontier) — Astryx
   `ButtonGroup`/`InputGroup` can't reproduce the shared border against a
   non-Astryx element. Affects `DeploymentSelect` (select + info button).
6. `Select mode="tags"` (AgentEditorModal's Tags field) simplified to a
   comma-separated `TextInput` instead of building `Tokenizer` +
   `SearchSource` for one low-stakes catalog field.
7. antd `Typography.Text editable` (ChatPage's click-to-rename chat title)
   has no Astryx destination (MAPPING §3.4, NONE) — rebuilt as a minimal
   `Heading`+edit-`IconButton` ↔ controlled `TextInput` toggle (commit on
   blur/Enter, revert on Escape).
8. `Divider titlePlacement="left"` — label position is NONE; the label text
   itself survives as `Divider`'s children.
9. antd `Card hoverable` (shadow-on-hover) has no Astryx prop — dropped,
   `cursor: pointer` alone carries the "clickable" affordance
   (`ModelStoreListPageV2`, and implicitly the click-to-navigate
   `AIAgentPage` cards).
10. antd `ConfigProvider` Pagination component-token override (transparent
    item background, `ModelStoreListPageV2`) — no per-instance token knob on
    Astryx `Pagination`; dropped along with the `ConfigProvider` wrapper.
11. `Descriptions bordered`/`size="small"` (`ModelCardDrawer`) — NONE,
    dropped; `MetadataList` has no border/density prop.
12. `danger` on dropdown-menu items ("Delete Agent", "Delete Chatting
    Session") — `DropdownMenuItemData` has no colour field (P5, closed
    shape) — dropped, same treatment in both `AIAgentPage` and `ChatHeader`.
13. `Input prefix={deploymentUrl}` (`CustomModelForm`'s base-path field) — an
    arbitrary text-node prefix needs `InputGroup`; dropped as a decorative
    hint (the URL is still visible in the page header above the form).
14. `CopyButton.tsx` (shared, `components/Chat/`) redesigned onto Astryx
    `Button` with `isIconOnly` toggled by whether `children` (visible text)
    is passed — covers both this area's icon-only usage and two **external**
    call sites that pass visible text (`ImportNotebookForm.tsx`
    `"Copy HTML"/"Copy Markdown"` badges, `SourceCodeView.tsx`). Both
    external call sites' now-incompatible antd-shaped props (`size="small"`,
    `type="text"`, `disabled`) were fixed as a small out-of-area ripple
    (mechanical prop renames, not migration work).
15. `ChatMessageContent.tsx` keeps `antd-style`'s `createStyles` for ~140
    lines of markdown-element chrome (`tr`/`th`/`td`/`ul`/`ol`/`hr`/
    `blockquote` — semantic HTML selectors, **not** `.ant-*`, so P6 does not
    apply). Rewriting every token-interpolated value to a static
    P17/P19-compliant CSS file is a disproportionate side-quest for
    markdown-renderer chrome; documented as the one remaining direct-antd
    exception beyond the Form-engine SHIM and the `@ant-design/x`/`BAISelect`
    frontier files.

### Gates / evidence

- P15 resolver, area scope (34 files): direct antd **22 → 8**. The 8
  remaining are exactly the documented exceptions — `Form`/`FormInstance`
  SHIM (`AgentEditorModal`, `ChatParametersSliders`, `CustomModelForm`),
  `@ant-design/x` frontier (`ChatInput`, `ChatMessage`, `ChatSender`),
  type-only `BAISelect` frontier (`DeploymentSelect`'s `GetRef`/
  `SelectProps`), and the `antd-style` `createStyles` exception
  (`ChatMessageContent`). Repo-wide: direct antd **439 → 425** (−14, matching
  the area delta exactly).
- `.ant-*` grep (P6) over converted files: 0 real matches (two doc-comment
  mentions only, in `AIAgentPage.tsx`/`ChatMessageContent.tsx`); the one
  `createStyles` hover rule that previously targeted `.ant-card`
  (`AIAgentPage`) moved to a plain component-imported `AIAgentPage.css`
  targeting the converted card's own `.agent-card` class (P17).
- `var(--…, <literal>)` grep (P19): 0 matches in touched files;
  `astryx-token-gate.mjs` run over the area roots reports 0 undeclared
  tokens introduced by this ticket (all flagged findings are pre-existing,
  in `theme-probe/deployments.tsx` and `BAIModal.tsx`, outside this ticket's
  files).
- Shots: `.scratch/astryx-migration/shots/23/{before,after}-{ai-agent,
  model-store,chat-empty}-{light,dark}.png` via
  `react/theme-probe/chatai.html` (+ `chatai.tsx` stub-client/fetch-intercept
  entry, `chataiMain.tsx` relay-test-utils mount — ticket-15/19 pattern,
  data router via `createMemoryRouter`/`RouterProvider` per the ticket-16
  precedent since `useProjectPath`→`useMatches` needs one, port 5695). The
  `chat-empty` case is the only Chat state reachable without driving
  `useChat()`'s network stream (no deployment selected yet — `ChatCard`'s
  deployment query short-circuits to `store-only`, `useModels` skips its
  fetch); before/after screenshots confirm layout fidelity (header, banner,
  card chrome, error banner, message list, input bar) with no console errors
  in either state. `before-*` shots were captured by reverting the tracked
  source files to HEAD via `git checkout --` (backed by a saved `git diff`
  patch, never `git stash`) against the same unmodified harness, then
  restoring via `git apply`.
- `pnpm exec vitest run src/components/Chat/ChatTokenCounter.test.tsx`: 7/7
  pass (mock updated: `BAIQuestionIconWithTooltip` mock moved from the
  `backend.ai-ui` module mock to the new `astryx-bui/BAIQuestionIconWithTooltipAstryx`
  import).
- `bash scripts/verify.sh`: **=== ALL PASS ===**
