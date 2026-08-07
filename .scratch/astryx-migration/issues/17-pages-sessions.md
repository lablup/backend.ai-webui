# 17 — 페이지군 ③ Sessions 목록/상세

**Target:** to-astryx
**Blocked by:** 09, 10, 11, 12, 13, 14
**Status:** done (agent, 2026-08-07)

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 해당 메뉴 영역의 페이지·컴포넌트를 MAPPING.md(DIRECT+PROP-CONDITIONAL)로 전환. 원본 레이아웃 충실도 유지, 공유 컴포넌트는 프런티어 번역, 갭 컴포넌트(08) 사용. 복잡해지는 antd 기능은 단순성 정책대로 드롭+기록.

## Acceptance criteria

- [x] 영역 내 antd 컴포넌트 렌더 0(Form 계열·프런티어 제외) — P15 리졸버로 증명 (아래 evidence)
- [x] 페이지별 before/after 스크린샷(라이트/다크) 시각 게이트 통과 (`shots/17/`)
- [x] PILOT-DECISION/드롭 목록 기록 (아래)
- [x] verify.sh ALL PASS

## Implementation notes

### Converted (antd render -> Astryx, 34 files)

Pages: `ComputeSessionListPage`, `AdminComputeSessionListPage`, `AdminSessionPage`,
`ProjectAdminSessionPage`, `SessionLauncherPage`(non-form chrome).
Components: `SessionNodes`, `SessionDetailDrawer`(body), `SessionDetailContent`,
`SessionUsageMonitor`, `SessionMetricGraph`(+`SessionMetricGraph.css`),
`SessionTemplateModal`, `SessionLauncherPreview`, and 17 files under
`ComputeSessionNodeItems/` (status tag/reservation/idle checks/reclamation
cell+popover/slot cell/action buttons/terminate modal/app launcher + all
connection-info modals/container log/commit/status detail/editable name).

Mappings applied per MAPPING.md: Alert->Banner, Tag/BAITag->Badge (via
`badgeVariantForStatus` session/kernel/sessionStatusInfo domains, ticket 13),
Descriptions->MetadataList(+Item), Tabs->TabList+Tab (panel rendered by page),
Tooltip->Tooltip (`title`->`content`, compound placements split), icon-only
Button->IconButton (real `label`s, P8), Button->Button (`label`, `clickAction`),
Typography.Text/Paragraph/Title->Text/Heading, Skeleton(.Input)->BAISkeletonAstryx,
antd dot-Badge->StatusDot, hover Popover->HoverCard, Divider->Divider,
Checkbox(비폼)->CheckboxInput, Space.Compact+Dropdown 분할 버튼->ButtonGroup+
DropdownMenu, Popconfirm->BAIPopconfirmAstryx(gap 08), copyable->BAICopyableText,
Empty->EmptyState, antd Image(preview:false)->plain img.

Responsive (ticket 14 policy): R1 Grid minWidth — SessionUsageMonitor
(xs24/sm12 -> minWidth 280 max 2 + GridSpan 'full'), SessionLauncherPage HPC
threads row; R2 fixed Grid — AppLauncherModal 4-up tiles, ComputeSessionListPage
top row (24-col Grid + GridSpan, spans from `useBAIBreakpoint` because the
action card unmounts below lg — R3); R3 import swap — `Grid.useBreakpoint` ->
`useBAIBreakpoint` (ComputeSessionListPage, SessionDetailContent,
ContainerLogModal, SessionLauncherPage).

createStyles removed (P6/P17): TerminateSessionModal (ul rules -> StyleX on the
`<ul>`), SFTPConnectionInfoModal (`.ant-descriptions-*` rules die with the
Descriptions conversion — deleted), SessionMetricGraph (recharts rules ->
component-imported `SessionMetricGraph.css`, P19-checked var names),
SessionTemplateModal (editable-align hack obsolete).

### P15 evidence (after)

Remaining `from 'antd'` in the area (all documented Form family / frontier /
type-only — zero non-frontier antd renders):

- Form engine + Form.Item controls (locked SHIM, ticket 34): SessionLauncherPage
  (Checkbox/Input/InputNumber/Radio/Select/Space.Compact/Switch inside
  Form.Item), AppLauncherModal·ContainerCommitModal·TensorboardPathModal·
  EditableSessionName (Form+Input), SessionLauncherPreview (Form read-only),
  SessionNameFormItem, SessionLauncherFormIncompatibleValueChecker,
  SessionFormItems/* , SessionOwnerSetterCard — 각 파일에 FRONTIER 주석.
- LAB frontier (lab canary 미도입): SessionDetailDrawer(Drawer),
  SessionLauncherPage(Steps), SessionLauncherErrorTourProps(Tour).
- Type-only: ModalProps, ButtonProps(frontier prop surface), DrawerProps,
  StepsProps, ColumnType, FormInstance.
- BUI frontier (tickets 25–30): BAITable/BAIModal/BAICard/BAISelect/BAITabs/
  BAIRadioGroup/BAIPropertyFilter/BAISessionNodesV2 등 — 소비만, 직접 antd
  import 없음.
- `SessionListColums/SessionInfoCell.tsx`: 소비자 0인 dead code — 미변환(스코프
  외로 기록).

Before: 동일 파일들이 Alert/Badge/Button/Card/Checkbox/Col/Descriptions/
Divider/Dropdown/Empty/Grid/Image/Popconfirm/Radio/Row/Select/Space/Steps/
Switch/Table/Tabs/Tag/Tooltip/Typography를 직접 렌더(HEAD 8694a9c52 기준,
`git show HEAD:<file>`로 재현 가능).

### Visual gate

`shots/17/{before,after}-{tags,tags-sched,idle,detail}-{light,dark}.png` —
harness: `react/theme-probe/sessions.{html,tsx}` +
`react/src/pages/AstryxSessionProbeCases.tsx` (real fragment components,
relay-test-utils mock env + minimal client stub; StyleX plugin added to
theme-probe vite config). Port 5635. Dark shots show the antd BAIModal frame
staying light (documented frontier; converted internals are theme-aware).

### PILOT-DECISION / drop list

1. Tab count-Badge (Compute/Admin session list): antd count Badge의 임의 토큰
   색(brand/disabled) -> Badge `variant={PRIMARY_TAG_VARIANT|'neutral'}`;
   fontSize 10/paddingXS 드롭 (P5, defaults-first).
2. SessionStatusTag: 상태별 색 로컬맵 삭제 -> 전역 lookup. 결합형 이중 pill
   (11px 라디우스/dashed/80px ellipsis) -> Badge 2개 나열로 단순화.
3. SessionDetailContent: `display:none`이던 usage-target Select 제거(dead UI);
   Descriptions `bordered`/`span`, size="small" 드롭(MetadataList에 없음);
   JSX 라벨(경고 트라이앵글·헬프 아이콘)은 P2에 따라 라벨은 문자열로, 아이콘은
   값 셀로 이동.
4. EditableSessionName: antd Typography `editable`/`copyable` 재구축(Astryx
   Heading/Text + ghost IconButton copy/pencil), props를 Astryx 형태로 재설계
   (`level`/`editable`/`dimmed`; 소비자 1곳). after-edit focus 복원 드롭.
5. TerminateSessionModal: `Typography.Text mark`(하이라이트) -> weight
   semibold (mark는 NONE); Paragraph danger -> `--color-error` xstyle.
   기존 1-click 확인 모달 시맨틱 유지(typed-confirm은 원래 없던 흐름).
6. SessionTemplateModal: Typography editable 인라인 rename -> TextInput +
   pencil IconButton 재구축.
7. VSCodeDesktopConnectionModal: antd Button href/target -> window.open.
8. SessionActionButtons: size small의 "native title" 특례 -> IconButton
   `tooltip`으로 통일; Space.Compact -> ButtonGroup; antd `size` prop은
   프런티어 표면으로 유지(내부 변환).
9. SessionLauncherPage: `type="primary" ghost`(outlined) -> `secondary`
   (변형 없음, P5); danger text-link Reset -> ghost Button + isDanger
   Popconfirm; batch timeout의 Space.Compact+InputNumber+Select 묶음은 폼
   컨트롤로서 프런티어 유지.
10. Text danger/warning 톤: `--color-error`/`--color-warning` xstyle
    (선언 변수 P19 확인) — MAPPING §3.4의 사이트별 결정.
11. SessionMetricGraph: Empty PRESENTED_IMAGE_SIMPLE -> EmptyState
    (title 필수 -> 기존 키 `autoScalingRule.NoDataAvailable` 재사용).
12. recharts 스트로크 색은 theme-shim 토큰 유지(recharts는 별도 트랙).

### Frontier record (ticket 34 form-visual remainder)

SessionLauncherPage의 스텝 chrome(카드/버튼/그리드/스텝 rail 제외한 Steps
자체)은 전환 완료; **폼 표면 전체**(Form.Item 컨트롤 + SessionFormItems/
ResourceAllocationFormItems + SessionOwnerSetterCard + SessionNameFormItem +
EnvVarFormList/PortSelectFormItem/VFolderTableFormItem/ImageEnvironment
SelectFormItems 등 공유 폼 아이템)는 antd 폼 엔진과 함께 ticket 34로 이관.
LAB 3종(Drawer/Steps/Tour)은 lab canary 도입 티켓에서 교체.

### verify

`bash scripts/verify.sh` → `=== ALL PASS ===` (커밋 후 기준; Relay drift
체크는 커밋된 산출물 기준으로 판정됨).
