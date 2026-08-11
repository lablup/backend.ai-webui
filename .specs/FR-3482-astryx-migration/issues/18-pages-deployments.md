# 18 — 페이지군 ④ Model Serving/Deployments

**Target:** to-astryx
**Blocked by:** 09, 10, 11, 12, 13, 14
**Status:** done

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 해당 메뉴 영역의 페이지·컴포넌트를 MAPPING.md(DIRECT+PROP-CONDITIONAL)로 전환. 원본 레이아웃 충실도 유지, 공유 컴포넌트는 프런티어 번역, 갭 컴포넌트(08) 사용. 복잡해지는 antd 기능은 단순성 정책대로 드롭+기록.

## Acceptance criteria

- [x] 영역 내 antd 컴포넌트 렌더 0(Form 계열·프런티어 제외) — P15 리졸버로 증명
      (`shots/18/p15-before-area.txt` 37 antd-family import lines →
      `p15-after-area.txt`: Form 계열(`Form`/`FormInstance`) + 프런티어 타입
      1건(`CardTabListType`, BAICard tabList shape)만 잔존. 재생성:
      `shots/18/p15-area.sh HEAD|WORK`)
- [x] 페이지별 before/after 스크린샷(라이트/다크) 시각 게이트 통과 —
      `shots/18/{before,after}-{revision,replica,drawer}-{light,dark}.png`
      (실컴포넌트 3케이스: DeploymentRevisionDetail, ReplicaStatusTag 10종,
      lab Drawer; 하니스 `react/theme-probe/deployments.html`, 캡처
      `shots/18/capture.mjs`, 포트 5645)
- [x] PILOT-DECISION/드롭 목록 기록 (아래 + 각 파일 in-code 주석)
- [x] verify.sh ALL PASS

## Implementation notes

### 범위 (라우터 기준 Deployments/Serving 메뉴 영역, 33파일 census)

- Pages: DeploymentListPage · DeploymentDetailPage · ProjectAdminDeploymentsPage ·
  AdminDeploymentPage · AdminDeploymentPresetSettingPage
- Detail cards/tabs: DeploymentBasicInfoCard · DeploymentAutoScalingCard ·
  DeploymentReplicasCard · DeploymentAccessTokensCard · DeploymentRevisionCard ·
  DeploymentCurrentRevisionTab · DeploymentRevisionHistoryTab · DeploymentAuditLogTab ·
  DeploymentRevisionDetail(+Drawer) · DeploymentPresetDetailModal · ReplicaStatusTag
- Form modals: DeploymentAddRevisionModal(2.1k LOC) · DeploymentSettingModal ·
  AdminModelCardSettingModal
- Admin: AdminDeployment · AdminModelCard · AdminDeploymentPresetReviewSummary ·
  AdminDeploymentPreset{SettingPageContent,ResourceFields,ModelConfigItem,ValidationTour}
- 이미 antd-free (변경 불필요): AdminDeploymentPreset, AdminDeploymentPresetTable,
  AdminPrometheusPreset, AdminRuntimeVariantPreset, DeploymentSchedulingHistoryModal,
  RouteSchedulingHistoryModal

### 이 티켓에서 반입한 공유 인프라

- **`@astryxdesign/lab@0.3.0-canary.12db2a1` exact pin 채택** (MIGRATION-SPEC
  §1-④ 기결정 이행; MAPPING.md가 tarball 검증한 그 빌드). `react/package.json`
  deps + `pnpm-workspace.yaml` minimumReleaseAgeExclude + `react/src/index.css`에
  `@import '@astryxdesign/lab/lab.css'` (astryx-base 레이어드 시트).
  ⚠️ lab은 단일 배럴 export라 **lexical peer 11종**(lexical + @lexical/* @0.46.0
  exact)이 dev-server 해석에 필요 — deps로 추가. `sideEffects:false`라 프로드
  번들에서는 미사용분(RichTextEditor 등)이 tree-shake됨. 사용 컴포넌트:
  Drawer(RevisionDetailDrawer) · Stepper/Step(PresetSettingPageContent) ·
  Tour/TourStep(PresetValidationTour).
- **`react/src/components/astryx-bui/astryxFormControls.tsx`** — antd Form 엔진
  안에 Astryx 컨트롤을 앉히는 어댑터 6종(TextInput/TextArea/NumberInput/
  Selector/Switch/Checkbox; 파일럿 astryxFormControls를 area 실사용(P1 grep)
  기준으로 일반화). value 병합·label isLabelHidden·onChange(value) 정규화.
- **probe**: `react/theme-probe/deployments.{html,tsx}` +
  `react/src/diagnostics/DeploymentsAstryxProbe.tsx`(Relay 소스 루트 안에서
  graphql 태그 보유, relay-test-utils mock으로 실 fragment 컴포넌트 마운트,
  `@alias` 사용) — 이후 페이지 티켓 재사용 가능. antd 다크 before는
  ConfigProvider darkAlgorithm + Astryx Theme mode 동시 적용으로 재현.

### 전환 요약 (MAPPING.md 준거)

- Skeleton→BAISkeletonAstryx, Alert→Banner, Empty/Result→EmptyState,
  Tooltip→Astryx Tooltip(content), Typography→Text/Heading/Code/BAICopyableText,
  Button→Button/IconButton/Link(4-way), Space→HStack/VStack,
  Space.Compact→ButtonGroup, Divider→Divider(orientation),
  Dropdown→DropdownMenu(button prop), Popconfirm→BAIPopconfirmAstryx,
  Descriptions→MetadataList(+Item), Tag/BAITag→Badge(**badgeVariantForStatus/**
  **ForTagColor 룩업만 사용** — replica/deployment 도메인), Collapse→Collapsible,
  Segmented→SegmentedControl, Checkbox→CheckboxInput/AstryxFormCheckbox,
  Switch→AstryxFormSwitch, Input(Number)→어댑터, AutoComplete→TextInput,
  Select(static)→AstryxFormSelector/Selector, Select mode="tags"→Tokenizer
  (hasCreate, 로컬 브리지 2곳), DatePicker showTime→DateTimeInput(dayjs↔ISO
  경계 어댑터), Grid.useBreakpoint→useBAIBreakpoint(R3),
  Drawer→lab Drawer, Steps→lab Stepper, Tour→lab Tour.
- **Form 계열 유지** (엔진): Form/Form.List/useForm/useWatch/FormInstance.
  **Form.Item→BAIFormItem 전면 롤아웃** (이 영역이 첫 적용).
  티켓 05 플래그였던 `DeploymentAddRevisionModal`의 `.ant-form-item-has-error`
  스크롤 셀렉터는 `[data-bai-form-item][data-status="error"]` 기반으로 교체
  (미전환 임베디드 폼 조각용 legacy 셀렉터는 주석 달고 한시 유지).
- 프런티어 유지: BAICard/BAIModal/BAITable/BAIFlex/BAIText/BAIButton/BAI*Select
  등 BUI 전부(티켓 25/26/27/30 소관), `CardTabListType` 타입 1건.
  `.ant-card-extra`/`.ant-modal-body` DOM 셀렉터 2곳은 프런티어(BAICard/BAIModal)
  DOM을 향하므로 유효 — in-code 주석으로 표시, 해당 컴포넌트 전환 시 재방문.

### 주요 PILOT-DECISION (전체 목록은 각 파일 in-code 주석)

1. Descriptions `bordered`(전 영역)·`size="small"`·per-item `span`·반응형
   column map → 드롭. MetadataList 기본 밀도/플로우 채택.
2. DropdownMenu 항목의 antd `danger` 적색 틴트 → 드롭 (닫힌 스펙).
3. `Select mode="tags"`의 `tokenSeparators`(콤마 분리 커밋) → 드롭 — Tokenizer는
   Enter 커밋 (AdminModelCardSettingModal·DeploymentSettingModal·
   PresetModelConfigItem).
4. lab Stepper: antd Steps의 per-step status 장식·에러 타이틀 노드 → status
   파생/문자열 라벨로 단순화; 앞으로 점프는 Next/Skip 버튼 경유.
5. lab Tour: antd의 lazy function target → open 시 1회 DOM 질의로 ref 해석
   (requestAnimationFrame; lint set-state-in-effect 준수).
6. Tooltip-on-disabled (P18): CheckboxInput은 `disabledMessage`로 이관,
   BAIButton(프런티어) 1곳은 드롭 기록 (AccessTokensCard).
7. `Typography.Text type="danger"/"warning"` → Astryx TextColor에 없음 —
   supporting/plain 텍스트로 (AdminModelCard, DeploymentSettingModal).
8. ReplicaStatusTag: `Omit<TagProps,'color'>` 공개 표면 → `{status, showTooltip}`
   최소 인터페이스 (소비처 grep 근거). 색은 `badgeVariantForStatus('replica')`.
9. RevisionDetailDrawer: `extends DrawerProps` → 명시 인터페이스(open/onClose/
   revisionFrgmt/status/title/extra), 소비처 8곳 diff 0. lab Drawer는 본문
   패딩이 없어 spacing-6(24px) 패딩을 컴포넌트에서 재현.
10. ExpiryOption 값이 number→string 리터럴로 (Selector 계약); 제출 경계에서
    Number() 복원, 공개 계약 불변 (AccessTokensCard).
11. AutoComplete(resourceOpts name)의 단일 'shmem' 제안 드롭 — placeholder로 대체.
12. InputNumber `precision`: 0→isIntegerOnly, 소수 precision 드롭 (ResourceFields).

### 시각 게이트 판독 노트

- revision(라이트/다크): MetadataList 2열, 라벨 폭 160/120 유지, 긴 값은
  셀 내 줄바꿈/코드블록 내부 가로 스크롤(`DeploymentRevisionDetail.css`,
  P17 co-located) — antd fixed-table 동작의 등가 재현.
- drawer: lab Drawer end/736px + 자체 헤딩 행. 본문 패딩 24px 재현 후 클리핑 0.
- replica: 10종 상태가 Badge semantic/카테고리 variant로, WARMING_UP 스피너 유지
  (`.anticon-spin` 사망 → 컴포넌트 CSS keyframe).

### 후속(다른 티켓 소관)

- BAITable/BAI*Nodes 내부(25), BUI select 계열(26/27), BAIPropertyFilter(28),
  notification(29), BUI 계약(30) — 이 영역 파일들의 BUI import는 그대로.
- AddRevisionModal의 임베디드 공유 폼 조각(ImageEnvironmentSelectFormItems ·
  ResourceAllocationFormItems · EnvVarFormList · VFolderTableFormItem)은 다른
  페이지와 공유되는 프런티어 — 해당 조각 전환 시 legacy 에러 셀렉터 제거.
- lab canary 핀은 core 0.3.0과 peer 불일치 경고(0.3.0-canary.12db2a1 요구)를
  용인 중 — core 범프 시 함께 정렬할 것.
