# 16 — 페이지군 ② Data/VFolder — 파일럿 반입 포함

**Target:** to-astryx
**Blocked by:** 09, 10, 11, 12, 13, 14
**Status:** done

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 해당 메뉴 영역의 페이지·컴포넌트를 MAPPING.md(DIRECT+PROP-CONDITIONAL)로 전환. spike/astryx-pilot의 전환 결과를 그대로 반입하는 것에서 시작. 원본 레이아웃 충실도 유지, 공유 컴포넌트는 프런티어 번역, 갭 컴포넌트(08) 사용. 복잡해지는 antd 기능은 단순성 정책대로 드롭+기록.

## Acceptance criteria

- [x] 영역 내 antd 컴포넌트 렌더 0(Form 계열·프런티어 제외) — P15 리졸버로 증명
      (아래 "P15 evidence")
- [x] 페이지별 before/after 스크린샷(라이트/다크) 시각 게이트 통과
      (`shots/16/{before,after}-{nodes,create,frame,confirm}-{light,dark}.png`)
- [x] PILOT-DECISION/드롭 목록 기록 (아래)
- [x] verify.sh ALL PASS

## Implementation notes

### Scope (converted files)

Pages: `VFolderNodeListPage`, `AdminVFolderNodeListPage` (AstryxAdminTheme
wrap), `ProjectAdminDataPage`.
Lists: `VFolderNodes`, `VFolderNodesV2` — **BAITable stays antd (ticket 25
frontier)**; cells/satellites converted (BAINameActionCellAstryx, Badge via
ticket-13 lookup, Text, BAICopyableText, BAIModalAstryx host-quota modal).
Modals: `DeleteVFolderModal(V2)`, `RestoreVFolderModal(V2)`,
`DeleteForeverVFolderModalV2` (typed confirm → BAIDeleteConfirmModalAstryx),
`FolderCreateModalV2` (Form 엔진 유지 + BAIFormItem + astryxFormControls),
`SharedFolderPermissionInfoModal(V2)`, `InviteFolderSettingModal`,
`FolderInvitationResponseModal`, `VFolderTextFileEditorModal`.
Cells/leaves: `VFolderPermissionCell(V2)`, `VFolderNodeIdenticon(V2)`
(token→`var(--color-border)`, shim 제거), `EditableVFolderNameV2` (native
rebuild), `VFolderNodeDescriptionV2` (Descriptions→MetadataList),
`VirtualFolderPathV2`, `FileUploadManager`.
Explorer: `FolderExplorerModalV2` (Splitter→useResizable+ResizeHandle,
Tabs→BAITabs, Grid.useBreakpoint→useBAIBreakpoint R2, custom header via
BAIModalAstryx `headerContent`), `FolderExplorerHeaderV2`.
Frontier translators (같은 경로 재작성, 소비자 무변경): `BAITabs`
(TabList/Tab + panel 렌더), `BAIRadioGroup` (SegmentedControl).

### Pilot import (astryx-bui/ 신규 반입, worktree agent-a6ce329048bfcb164)

`BAICardAstryx`, `BAIModalAstryx` (+ticket-16 확장: `headerContent`/
`closeLabel`/`bodyRef`), `BAIDeleteConfirmModalAstryx`, `BAIListAlertAstryx`,
`BAINameActionCellAstryx`, `BAIPropertyFilterAstryx` (PowerSearch, DSL
직렬화+역파서), `BAIVFolderDeleteButtonAstryx` (+새 V2 변형, `VFolder` 타입
fragment), `BAIQuestionIconWithTooltipAstryx`, `astryxFormControls`
(+`AstryxFormSelector`, `hasAutoFocus` 확장), `BAICopyableText` `copyText`
확장. `astryxBui.css`에 name-action-cell + list-alert 절 추가 (P19 검증됨).

### PILOT-DECISIONs / drops (이 티켓 신규분; 파일럿 상속분은 코드 주석 참조)

1. Tab count badge: antd Badge의 임의 `color`(선택=브랜드/비선택=disabled) →
   Astryx Badge closed variant (`info`/`neutral`) + `endContent` 분리.
2. `EditableVFolderNameV2`: antd Typography `editable` config
   (`triggerType`, text-click 편집 시작) → boolean + 연필 IconButton.
   `Input suffix`(corner-down glyph)·`count={{max,show}}` 드롭 (§3.6 NONE).
   Escape 취소는 wrapper keydown으로 보존.
3. `Descriptions bordered`/`size="small"` (Shared modal, DescriptionV2) →
   MetadataList로 드롭 (MAPPING §4 NONE, defaults-first).
4. DescriptionV2 "Path" 라벨의 copyable → 값 옆 copy IconButton으로 이동
   (`MetadataListItem.label`은 string, P2).
5. 권한 select의 disabled-option 내 Tooltip (DescriptionV2) → 드롭; onChange
   가드는 유지.
6. HostQuotaModal 타이틀 내 help-tooltip 아이콘 → 본문 상단으로 이동 (P2).
7. `InviteFolderSettingModal`: `Input.onPressEnter` → wrapper keydown;
   `popupMatchSelectWidth` 드롭.
8. V2 name-cell의 popConfirm `okButtonProps.danger` → confirm popover의
   primary 버튼 (BAINameActionCellAstryx confirm 형태).
9. `VFolderTextFileEditorModal`: JSX 타이틀 → `title`+`subtitle` 분리;
   `keyboard={false}` → Escape가 unsaved-changes 확인 플로로 라우팅.
10. `FolderExplorerModalV2`: `type={xl?'card':'line'}` 탭 비주얼 → 단일
    underline; `styles.body` 100vh → Dialog `maxHeight 95vh`; resizable
    split은 useResizable로 유지 (기능 드롭 없음).
11. `FolderInvitationResponseModal`: `List locale.emptyText` → 명시적
    `EmptyState`.
12. astryx-bui P19 수정 1건: `--color-background-secondary`(미선언) →
    `--color-background-muted`.

### Frontier (전환하지 않음, 사유 기록)

- `BAITable`(+BAIFileExplorer, ScopedAuditLog 테이블) — ticket 25.
- `BAIGraphQLPropertyFilter` — object-filter DSL은 ticket 28 (PowerSearch
  일반화)에서.
- `StorageSelect` — ComplexSelector 재구축은 tickets 26/27.
- `AutoUpdateFetchKeyButton`, `BAIUnmountAfterClose`, `BAILink`,
  `BAIAlertIconWithTooltip`, `StorageUsageBadge`, `QuotaPerStorageVolumePanelCard`,
  `FileBrowserButtonV2`/`SFTPServerButtonV2`, `VFolderDeployModal`,
  `DeploymentSettingModal` — 타 영역/타 티켓 공유 컴포넌트 (프런티어 규칙).
- Form 계열 (`Form`, `Form.Item` 상태 엔진) — SHIM (ticket 34까지 유지).
- 타입 전용 antd 임포트: `TabsProps`/`RadioGroupProps`(프런티어 전술),
  `RcFile`, `FormInstance` — §6 규칙대로 마지막 단계.
- Dead V1 파일(라이브 그래프에서 도달 불가, 미전환): `FolderExplorerModal`,
  `FolderExplorerHeader`, `VFolderNodeDescription`, `FolderCreateModal`,
  `EditableVFolderName` (V1; fragment 선언만 페이지 쿼리에 잔존).
- 크로스 영역 VFolder 컴포넌트(세션/모델 페이지 소유): `VFolderLazyView(V2)`,
  `MountedVFolderLinks`, `FolderLink`, `VFolderTable`, `VFolderPermissionTag`,
  `UserFolderPermissionPanel(V2)`, `ProjectFolderPermissionPanel` — 해당
  페이지 티켓(17/20 등)에서.

### P15 evidence

Direct antd value-imports (영역 28파일): **before 27 → after 3**, 잔여 3은
전부 `import { Form } from 'antd'` (SHIM 제외 대상). `.ant-*` 셀렉터 참조 0
(주석 제외), `createStyles` 0. astryx-token-gate: 영역/astryx-bui 발견 0.
BUI barrel 경유 잔여 렌더는 위 Frontier 목록이 전수 — 그 외 영역 파일의
`backend.ai-ui` named import는 non-rendering helper뿐
(`toLocalId`/`filterOut*`/`badgeVariantForStatus` 등).

### Visual gate

`react/theme-probe/ticket16.{html,tsx}` + `ticket16-env.ts`(client stub) +
`ticket16-frame.tsx` + `shoot16.mjs` — 실컴포넌트를 mock Relay
(`createOperationDescriptor`+`MockPayloadGenerator`+`commitPayload`, graphql
태그 없이 생성 아티팩트 직접 임포트)로 마운트. 프로브는 앱과 동일하게 antd
`ConfigProvider darkAlgorithm`을 다크에 결합 (프런티어 표면이 다크에서
밝게 나오는 혼합 표면 왜곡 방지). 실행:
`cd react && pnpm exec vite --config theme-probe/vite.config.mts --port 5625 --strictPort`
→ `node theme-probe/shoot16.mjs ../.scratch/astryx-migration/shots/16 <cases> <prefix>`.
판정: 레이아웃 해부도 동일(컬럼 구성·행 구조·모달 anatomy), 색·형태 차이는
Astryx 기본값(시각값 정책 부합). before는 tracked 변경 stash 후 동일 프로브로
캡처 (`before-{nodes,create}-{light,dark}`; frame/confirm은 after 전용 —
frame은 페이지 셸 합성 케이스, confirm은 신규 컴포넌트).

### 참고

- 페이지 쿼리의 fragment 스프레드 변경: `BAIVFolderDeleteButtonFragment` →
  `BAIVFolderDeleteButtonAstryxFragment`, `BAIVFolderDeleteButtonV2Fragment`
  → `BAIVFolderDeleteButtonV2AstryxFragment` (컴포넌트 재구축 리플).
- i18n: PowerSearch operator 라벨은 `t('propertyFilter.*', default)` 패치
  (P13 — 키 이관은 후속), 나머지는 기존 호스트 키 재사용
  (`dialog.PleaseTypeToConfirm`, `data.folders.DeleteForeverDescription` 등).
- `BAITabs`/`BAIRadioGroup`는 타 페이지 20+ 소비자와 공유 — 시블링 티켓
  (15/17/18)이 동일 전환을 반입하면 cherry-pick 충돌 가능 (내용 동일 예상).
