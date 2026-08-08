# 20 — 페이지군 ⑥ Resources/Agent/자원그룹

**Target:** to-astryx
**Blocked by:** 09, 10, 11, 12, 13, 14
**Status:** done

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 해당 메뉴 영역의 페이지·컴포넌트를 MAPPING.md(DIRECT+PROP-CONDITIONAL)로 전환. 원본 레이아웃 충실도 유지, 공유 컴포넌트는 프런티어 번역, 갭 컴포넌트(08) 사용. 복잡해지는 antd 기능은 단순성 정책대로 드롭+기록.

## Acceptance criteria

- [x] 영역 내 antd 컴포넌트 렌더 0(Form 계열·프런티어 제외) — P15 리졸버로 증명
      (`shots/20/p15-before-area.txt` 21개 파일 direct antd import →
      `p15-after-area.txt`: `Form`/`FormInstance`(SHIM) 3파일만 잔존. 재생성:
      `shots/20/p15-area.sh HEAD|WORK`)
- [x] 페이지별 before/after 스크린샷(라이트/다크) 시각 게이트 통과 —
      `shots/20/{before,after}-{agent,resourceGroup}-{light,dark}.png`
      (대표 케이스 2종: AgentDetailDrawer 풀체인, ResourceGroupInfoModal;
      하니스 `react/theme-probe/resources.html` + `resourcesMain.tsx`,
      graphql orchestrator `react/src/diagnostics/ResourcesAstryxProbe.tsx`
      — relay-test-utils mock, 포트 5665)
- [x] PILOT-DECISION/드롭 목록 기록 (아래 + 각 파일 in-code 주석)
- [x] verify.sh ALL PASS

## Implementation notes

### 범위 (라우터 기준 `/agent` → `webui.menu.Resources`, 23파일)

- Page: `ResourcesPage`(탭: Agent/StorageProxies/ResourceGroup)
- Agent: `AgentList` · `AgentDetailDrawer`(+`AgentDetailDrawerContent`) ·
  `AgentDetailModal` · `AgentSettingModal` · `AgentLifeCycleControlModal` ·
  `AgentNodeItems/{AgentActionButtons,AgentComputePlugins,AgentResources,
  AgentStatusTag}`
- Storage proxy: `StorageProxyList` · `StorageHostDetailDrawer`(+Content) ·
  `StorageHostResourcePanel` · `StorageHostSettingsPanel` ·
  `ProjectFolderPermissionPanel` · `UserFolderPermissionPanel`(+V2)
- Resource group: `ResourceGroupList` · `ResourceGroupInfoModal` ·
  `ResourceGroupSettingModal` · `UpdateResourceGroupsModal`
- `AgentSummaryPage`/`AgentSummaryList`(ticket 15) · `BAIRadioGroup` ·
  `TableColumnsSettingModal` · `BAITable`/`BAI*Select`(25–27) ·
  `BAIPropertyFilter`(28) · `BAIModal`/`BAICard`/`BAIButton`/`BAITag`/
  `BAIDoubleTag`/`BAIText`/`BAIFlex`(다수 소비처, 프런티어) 는 타 티켓 소관
  — 이 영역 파일들의 BUI import는 그대로.

### 이 티켓에서 반입한 공유 인프라

- **`react/src/components/astryx-bui/astryxFormControls.tsx`에
  `AstryxFormMultiSelector` 추가** — antd `Select mode="multiple"`
  static-options 분기(MAPPING §3.1)의 Form-bound 어댑터가 이전 티켓엔 없었음
  (`ResourceGroupSettingModal`의 AllowedSessionTypes 다중선택 필드에서 반입).
  기존 5종(TextInput/TextArea/NumberInput/Selector/Switch/Checkbox)과 동일한
  계약(`value`/`onChange`/필수 `label`+`isLabelHidden`).
- **probe**: `react/theme-probe/resources.{html,tsx}` +
  `resourcesMain.tsx`(stub client + relay-test-utils mock env) +
  `react/src/diagnostics/ResourcesAstryxProbe.tsx`(Relay 소스 루트 안에서
  graphql 태그 보유, 실 `AgentDetailDrawer`/`ResourceGroupInfoModal` 컴포넌트
  마운트) — 이후 페이지 티켓 재사용 가능. ticket 15/18의 stub-client +
  mock-environment 패턴을 그대로 따름.

### 전환 요약 (MAPPING.md 준거)

- Descriptions(bordered/size/column/labelStyle/span) → MetadataList(+Item)
  — `bordered`/`size`/per-item `span`/`labelStyle` 드롭(기결정 PILOT-DECISION
  프로젝트 전역 유지), `column`은 `useBAIBreakpoint`로 반응형 유지.
- Typography.Title → Heading(level 매핑: antd level5→Astryx level={3},
  ticket 15 기결정 그대로), Typography.Text → Text(색상/사이즈 prop 매핑),
  copyable → `astryx-bui/BAICopyableText`.
- Tag/Tag color → Badge, 도메인 상태는 `badgeVariantForStatus('agent'|
  'cloudPlatform'|'storageBackend', …)` 룩업만 사용(ticket 13). 순수 장식
  Tag(무색)는 `variant="neutral"`.
- Tabs → TabList+Tab(패널은 직접 렌더), Skeleton(전종) →
  `BAISkeletonAstryx`(+`variant="input"` for `Skeleton.Input`), Empty →
  EmptyState(`isCompact`), Alert(BAIAlert 포함) → Banner(call-site DISSOLVE —
  `BAIAlert`은 여전히 23개 소비처의 프런티어이므로 컴포넌트 자체는 미변경,
  이 영역의 호출부만 Astryx `Banner` 직접 사용으로 전환).
- Row/Col(uniform 2-up, gutter 16/24) → Grid columns={{minWidth,max:2}}
  gap(RESPONSIVE-POLICY R1); Row/Col span={12}×2(반응형 아님) → Grid
  columns={2}(R2). Col 래퍼는 대부분 소거.
- Progress(strokeColor/status="exception") → ProgressBar variant, 임계값
  함수로 통합(StorageHostResourcePanel).
- Space.Compact(버튼) → ButtonGroup(+IconButton), Tooltip+아이콘전용
  BAIButton → IconButton(자체 `tooltip`, disabled 대상은 Tooltip 래핑 금지
  계약 회피). Space.Compact(두 select, 둘 다 프런티어 antd Select) → 접합
  불가로 평범한 BAIFlex 드롭(PILOT-DECISION).
- Grid.useBreakpoint() → useBAIBreakpoint()(R3, theme-shim), 순수 import
  스왑.
- Form.Item → BAIFormItem 전면 적용(AgentSettingModal,
  ResourceGroupSettingModal, UpdateResourceGroupsModal), Form 엔진 자체는
  유지(SHIM). antd 컨트롤(Input/Input.TextArea/Input.Password/InputNumber/
  Select/Switch)은 `astryxFormControls.tsx` 어댑터로 교체.
- antd 타입 임포트 제거: `TableColumnsType`/`ColumnsType<T>` →
  `BAIColumnsType`, `ModalProps` → `BAIModalProps`(BUI 재수출, 내부적으론
  여전히 BAITable/BAIModal이 antd 기반이지만 애플리케이션 코드가 antd를
  직접 import하지 않도록 함).

### 주요 PILOT-DECISION (전체 목록은 각 파일 in-code 주석)

1. Descriptions `bordered`·`size="small"`·per-item `span`·`labelStyle` →
   드롭(전 영역 6개 Descriptions 블록 공통). MetadataList 기본 밀도 채택.
2. `Typography.Title level={3} copyable`(AgentDetailDrawerContent 상단
   Agent ID) → `BAICopyableText`(Text 기반) `type="large" weight="semibold"`
   로 근사 — Astryx엔 copyable Heading이 없어 시맨틱 `<h3>` 손실, 단순성
   정책상 수용.
3. `MetadataListItem`의 label-adjacent 슬롯은 `icon`(label 앞) 뿐 —
   Utilization 항목의 "상세정보" 아이콘버튼(원래 label 뒤)이 앞으로 이동
   (AgentResources).
4. StorageHostResourcePanel: `Progress strokeColor`(임계값 함수)+
   `status="exception"` → 단일 `usageProgressVariant()` 함수로 통합, 100%
   이상은 error variant.
5. `Space.Compact`로 감싼 두 antd Select(하나는 라벨 표시용 고정 select,
   하나는 `BAIDomainSelect`) → 접합 불가(둘 다 프런티어 antd 컴포넌트라
   Astryx InputGroup 자식 계약 미충족) → 평범한 `BAIFlex gap="xxs"` 드롭,
   시각적 결합선만 손실(ProjectFolderPermissionPanel).
6. `Typography.Text type="danger"`(선택 한도 초과 경고) → Astryx TextColor에
   danger 없음(MAPPING §3.4) → `type="supporting"`로 톤 드롭, select 자체의
   `status="error"`가 이미 오류 상태를 전달하므로 정보 손실 최소
   (UserFolderPermissionPanel, AdminModelCard와 동일 판단 재사용).
7. `StorageProxyList`/`AgentList`의 로컬 `backendType`/`platformData`
   색상 맵은 유지 — `BAIDoubleTag`가 여전히 antd `Tag color` 기반 프런티어
   (16개 소비처)이므로 legacy 프리셋 문자열이 필요. `storageBackend`/
   `cloudPlatform` 도메인 룩업(ticket 13)은 각 파일의 **DIRECT** `Tag`
   렌더(무색 배지·지역 배지)에만 적용, BAIDoubleTag 호출부는 그대로.
8. `AgentDetailDrawer`/`StorageHostDetailDrawer`: antd `Drawer` → lab
   `Drawer`(ticket 18 정확히 같은 레시피 — `open`→`isOpen`, 헤딩+extra를
   본문 첫 행으로 직접 렌더, spacing-6 패딩 재현). Props 인터페이스는 antd
   `DrawerProps` 확장 대신 실제 소비처(P1 grep) 기준 명시 인터페이스로 축소.
9. `ResourceGroupSettingModal`/`AgentSettingModal`: `ModalProps`/암묵적
   antd 확장 → `BAIModalProps`(BUI 재수출)로 교체해 애플리케이션 코드의
   직접 antd 타입 임포트 제거(MAPPING §6).

### 시각 게이트 판독 노트

- agent(라이트/다크): MetadataList 2열(브레이크포인트 `md`), ButtonGroup
  4-IconButton(설정/재시작/시작/정지, 정지 아이콘 ALIVE일 때 error 컬러),
  BAICopyableText로 ID/주소 복사 가능, TabList 1개 탭("Resources") 아래
  Grid 기반 리소스 할당/GPU 배정/사용률 카드 — antd bordered-table 룩과
  견주어 밀도는 낮아졌지만 정보 계층은 동일.
- resourceGroup(라이트/다크): MetadataList 3블록(Information/
  SchedulerOptions/DriverOptions), Badge pill(Allowed session types),
  antd Descriptions의 트레일링 콜론(`Name:`)은 MetadataList에 없어 드롭 —
  라벨 텍스트만 남음(레이아웃 동등, 타이포 디테일만 차이).

### 후속(다른 티켓 소관)

- `BAITable`/`BAIAgentTable`(25), `BAISelect` 계열(`BAIDomainSelect`,
  `BAIAdminResourceGroupSelect`, `BAIStorageProxySelect`,
  `BAIAdminKeypairResourcePolicySelect`, `BAIUserSelect`, `BAIAdminProjectSelect`
  등, 26–27), `BAIPropertyFilter`(28), `BAIRadioGroup`/`BAITabs`(26 consumers,
  ticket 18에서 이미 frontier로 확정) — 이 영역 파일들의 BUI import는 그대로.
- `BAIAlert`/`BAIDoubleTag`/`BAITag`/`BAIModal`/`BAICard`/`BAIButton`/
  `BAIText`/`BAIFlex` 자체의 DISSOLVE(컴포넌트 재작성)는 각각 수십 개
  소비처를 가진 전역 프런티어라 이 티켓 범위 밖 — 호출부 레벨에서만
  Astryx 직접 사용으로 전환 가능한 곳(Banner, Badge)은 전환 완료.
- e2e 셀렉터(`e2e/agent/agent.spec.ts`)의 `.ant-table*`은 `BAITable`이
  여전히 antd 기반이라 유효 — ticket 25/31 소관.
