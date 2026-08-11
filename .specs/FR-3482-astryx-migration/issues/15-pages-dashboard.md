# 15 — 페이지군 ① Dashboard/Summary

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

**Area** (routes `dashboard` / `admin dashboard` / `agent-summary`):
`DashboardPage`, `AdminDashboardPage`, `AgentSummaryPage` + page-local
components `AgentStats`, `TotalResourceWithinResourceGroup`,
`MyResource(WithinResourceGroup)`, `SessionCountDashboardItem`,
`RecentlyCreatedSession`, `ActiveAgents`, `StorageStatusPanelCard`,
`QuotaPerStorageVolumeDashboardItem`, `AgentSummaryList`, `BAIBoard`, and the
area-owned BUI component `BAIBoardItemTitle` (consumers are all in this area).

**Conversions**
- `Skeleton active` (3 pages + 2 items) → `BAISkeletonAstryx` (gap 08).
- `Segmented` ×3 → `SegmentedControl size="sm"` + `SegmentedControlItem`.
- `Typography.Text` fontSizeHeading5+strong 타이틀 ×3 및
  `Typography.Title level={5}`(BAIBoardItemTitle) → `Heading level={3}`.
- `Tooltip` → Astryx `Tooltip` (`title`→`content`,
  `topRight`→`above`+`end`); `Empty` → `EmptyState`;
  antd `Badge count` → `BAIBadgeCountAstryx` (gap 08).
- `Tooltip`+icon `Button`(refresh, AgentSummaryList) → `IconButton`
  (`label`+`tooltip`+`isLoading`).
- `BAICard tabList`(AgentSummaryPage) → Astryx `Card padding={6}` +
  `TabList hasDivider` + `Tab` 인라인 컴포지션 (파일럿 BAICardAstryx 반입은
  16과의 충돌을 피해 하지 않음 — Astryx 직사용 정책에도 부합).
- `BAIBoard`: antd-style `createStyles` → 컴포넌트가 import하는
  `BAIBoard.css` (P17), Astryx 선언 변수만 사용 (P19 게이트 green).
- antd 타입 임포트 제거: `TableProps/ColumnsType/ColumnType/AnyObject` →
  BUI가 재수출하는 `BAITableProps/BAIColumnsType/BAIColumnType`.

**PILOT-DECISION 목록** (코드 주석에도 각각 기록)
1. Segmented→SegmentedControl의 필수 aria `label`은 기존 옵션 라벨 합성으로
   충당 (병렬 티켓 진행 중 i18n 파일 충돌 회피; 후속에서 전용 키 검토).
2. 타이틀 텍스트는 픽셀 패리티 대신 `Heading level={3}` (Astryx 기본값 정책;
   16px→17px).
3. antd `Empty PRESENTED_IMAGE_SIMPLE` 이미지는 드롭 — `EmptyState isCompact`.
4. Invited Folders 배지: antd 암묵적 red → `variant="error"` 명시
   (BAIBadgeCountAstryx의 open decision을 사이트에서 확정). sticky 타이틀
   위로 올리는 `zIndex:50`은 원본과 동일하게 유지.
5. StorageStatusPanelCard의 `.ant-tooltip-*` 화살표 미세조정 createStyles
   블록은 사망 CSS라 삭제 (P6) — Astryx placement/alignment로 대체.
6. antd fontSizeHeading1(38px) 통계 숫자 → `Text size="4xl"` (가장 근접 스텝);
   단위 라벨(fontSize 8px) → `Text color="secondary" size="2xs"`.
7. BAIBoard placeholder hover의 `colorPrimaryHover + opacity .3` →
   `var(--color-accent-muted)` (알파 틴트 토큰이 곧 그 값).

**Frontier (문서화된 잔존 antd 경로)** — P15 기준 area 파일의 direct antd 0.
남는 transitive taint는 전부 프런티어/SHIM: theme-shim(GlobalToken 타입만),
BUI 공유(BAIFlex·BAIFetchKeyButton·BAIStatistic·ResourceStatistics·
BAIRowWrapWithDividers·BAITable[티켓25]·BAIPropertyFilter[28]·
BAIAlertIconWithTooltip), 타 영역 공유 컴포넌트(SessionNodes·
SessionDetailDrawer[17], AgentList[20], BAIPanelItem·
QuotaPerStorageVolumePanelCard[16/21], BAIRadioGroup·
TableColumnsSettingModal, SharedResourceGroupSelectForCurrentProject[26–27]).

**Gate 결과**
- P15: direct antd 513→502 (area 11파일 전부 direct 해소; BAIBoard는 완전
  clean 도달).
- ant-selector-gate: area 신규 위반 0. astryx-token-gate: 신규 위반 0.
- verify.sh `=== ALL PASS ===`. react vitest: 기존 실패
  (`usePrimaryColors.test` 5건, HEAD에서도 동일)를 제외하고 전부 green —
  `MyResourceWithinResourceGroup.test` 8/8 통과.

**Shots** — `.scratch/astryx-migration/shots/15/`
(`before|after`-`board|summary`-`light|dark`.png; 하네스
`react/theme-probe/dashboard.html` + `dashboardMain.tsx`, stub client +
relay-test-utils, 재현 스크립트 `shots/15/shoot.mjs`, 포트 5615).
주의: dark 샷의 theme-shim 토큰(BAIBoardItemTitle 배경 등)은 하네스가 앱의
다크모드 상태 배선을 안 가지므로 before/after 모두 light 값으로 렌더 —
비교 축(해부도)은 유효.
