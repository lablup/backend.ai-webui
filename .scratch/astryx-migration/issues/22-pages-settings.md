# 22 — 페이지군 ⑧ Settings/Maintenance/Information

**Target:** to-astryx
**Blocked by:** 09, 10, 11, 12, 13, 14
**Status:** done

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 해당 메뉴 영역의 페이지·컴포넌트를 MAPPING.md(DIRECT+PROP-CONDITIONAL)로 전환. 원본 레이아웃 충실도 유지, 공유 컴포넌트는 프런티어 번역, 갭 컴포넌트(08) 사용. 복잡해지는 antd 기능은 단순성 정책대로 드롭+기록.

## Acceptance criteria

- [x] 영역 내 antd 컴포넌트 렌더 0(Form 계열·프런티어 제외) — P15 리졸버로 증명
      (`shots/22/p15-before-area.txt` 37 antd-family import lines →
      `p15-after-area.txt`: 12줄, 전부 `Form`/`FormInstance`(SHIM, 3파일) +
      theme-ALGORITHM 생산자 `theme`(스킵리스트, 3파일) + `ColorPicker`
      갭 컴포넌트(1파일) + 타입 전용 `ColumnsType`(1파일). 재생성:
      `shots/22/p15-area.sh HEAD|WORK`)
- [x] 페이지별 before/after 스크린샷(라이트/다크) 시각 게이트 통과 —
      `shots/22/{before,after}-{settingList,information}-{light,dark}.png`
      (실컴포넌트 2케이스: `SettingList`+`SettingItem`(체크박스/셀렉트/커스텀
      행, 탭 카운트 뱃지, 검색/필터 툴바 — 다른 모든 Settings 하위 페이지가
      공유하는 코어), `Information`(Descriptions→MetadataList, Card, Grid,
      Badge, Overlay+Spinner); 하니스 `react/theme-probe/settings.{html,tsx}`,
      캡처 `shots/22/capture.mjs`, 포트 5685)
- [x] PILOT-DECISION/드롭 목록 기록 (아래 + 각 파일 in-code 주석)
- [x] verify.sh ALL PASS

## Implementation notes

### 범위 (라우터 기준 Settings 메뉴 영역, 30파일)

- Pages: `UserSettingsPage`(`/usersettings`) · `ConfigurationsPage`(admin
  `/settings`) · `MaintenancePage` · `BrandingPage`
- Settings 코어(전 영역 공유): `SettingList` · `SettingItem` — 체크박스/셀렉트/
  커스텀 3종 항목 타입, 탭+검색+변경필터+리셋 확인 모달을 렌더하는 공유 엔진.
  `ConfigurationsSettingList`(설정) · `MaintenanceSettingList`(유지보수) ·
  `BrandingSettingList`(브랜딩)가 전부 이 엔진 위에 얹힘.
- Settings 모달: `OverlayNetworkSettingModal` · `SchedulerSettingModal` ·
  `AnnouncementEditModal`(마크다운 에디터+포맷 툴바+라이브 프리뷰) ·
  `ShellScriptEditModal`(부트스트랩/유저설정 스크립트 에디터, split-button
  저장 UI)
- Branding 하위: `BrandingSettingItems/{LogoPreviewer,LogoSizeSettingItem,
  ThemeJsonConfigModal}` (+ theme-ALGORITHM 생산자 2종, 아래 프런티어 참조)
- 계정/키페어: `MyKeypairManagementModal`(신규 GraphQL API) ·
  `MyKeypairInfoModalLegacy`(구버전 백엔드 호환, 26.4.0 이전) ·
  `SSHKeypairManagementModal` · `SSHKeypairGenerationModal` ·
  `SSHKeypairManualFormModal`
- 로그: `ErrorLogList` (LoginHistory/LoginSession은 이미 antd-free — 변경 불필요)
- Information: `Information`(시스템 정보 카드 4종) · `DescriptionLabel`(라벨+
  서브타이틀 헬퍼, Information 전용)

### 전환 요약 (MAPPING.md 준거)

- Tabs→BAITabs(count 뱃지 endContent), Alert→Banner, Skeleton→
  BAISkeletonAstryx, Empty→EmptyState, Checkbox→CheckboxInput/
  AstryxFormCheckbox, Input→TextInput, Select(static)→Selector/
  AstryxFormSelector, Typography→Text/Heading, Descriptions→MetadataList,
  Tag→Badge(**badgeVariantForTagColor만 사용**), Dropdown→DropdownMenu,
  Popconfirm→BAIPopconfirmAstryx, Space.Compact→ButtonGroup(버튼) 또는 드롭
  (버튼이 아닌 필드 쌍), Spin→Overlay+Spinner, Card(raw antd)→Astryx Card
  직사용, Row/Col→Grid(반응형), Upload(picker)→self-built hidden
  `<input type=file>`+IconButton(FileInput은 필드형이라 아이콘 버튼 트리거에
  부적합), Image(비정사각 비율 필요)→plain `<img>`+onError.
- **Form 계열 유지**(엔진): `Form`/`FormInstance`. `Form.Item→BAIFormItem`
  전면 적용(3파일: OverlayNetworkSettingModal·SchedulerSettingModal·
  SSHKeypairManualFormModal), 컨트롤은 `astryx-bui/astryxFormControls`
  어댑터(AstryxFormNumberInput/Checkbox/Selector/TextArea).
- `createStyles`(antd-style) 1건 발견(AnnouncementEditModal 마크다운 프리뷰
  타이포+포맷 툴바 배경) → co-located `AnnouncementEditModal.css`로 이관,
  전 토큰을 `astryx docs color|spacing|shape|typography`로 검증(P19).
- 프런티어 유지: `BAICard/BAIModal/BAITable/BAIFlex/BAIText/BAIRadioGroup/
  BAIGraphQLPropertyFilter/BAIFetchKeyButton/BAIDeleteConfirmModal` 등 BUI
  전부(티켓 25/30 소관) — 페이지 레벨에서 그대로 유지(15/17/18과 동일 전례;
  16의 `BAICardAstryx` 파일럿 반입은 이 영역에서 채택하지 않음, 3/4 선행
  티켓이 plain `BAICard` 유지를 택함). 타 영역 공유 컴포넌트도 미전환:
  `AutoUpdateFetchKeyButton`(27곳) · `BAICodeEditor`(5곳) ·
  `TextHighlighter`/`TableColumnsSettingModal`(로그 테이블, 7-9곳) ·
  `SyntaxHighlighter`(Chat 소유).

### 주요 PILOT-DECISION (전체 목록은 각 파일 in-code 주석)

1. ~~**SettingList 세로 탭(`tabDirection`/antd `tabPlacement="start"`) 드롭.**~~
   **SUPERSEDED 2026-08-08 — 세로 내비게이션 복원.** 아래 "PILOT-DECISION #1
   철회" 참조.

   (원문, 기록 보존) 최초에는 `tabPlacement`를 존재하지 않는 prop으로
   오판했으나(antd 실제 prop은 `tabPosition`이 **deprecated**, `tabPlacement`가
   현재 prop) — before 스크린샷으로 실제로 좌측 세로 탭이 렌더됨을 확인 후
   정정. Astryx `TabList`는 세로/사이드 배치 자체가 없는 진짜 capability
   gap(코드 정리가 아님) — 수평 상단 탭으로 수렴, in-code 주석에 before
   스크린샷 경로 기록.
2. SettingItem 리셋: antd `Dropdown`(단일 "Reset" 항목, danger 틴트) 감싼
   구조 → 직접 클릭 `IconButton`(ShellScriptEditModal의 reset도 동일 패턴).
   메뉴 한 항목짜리 인디렉션 제거(단순성).
3. SettingItem 체크박스: antd는 `description`(종종 줄바꿈 포함 rich JSX)을
   체크박스 자신의 클릭 가능한 라벨로 렌더 → `CheckboxInput.label`은 string
   전용(P2)이라 라벨은 `title`(hidden)로, description은 체크박스 아래 보조
   Text로 이동 — "설명 텍스트 클릭 시 토글" 상호작용 소실, rich 콘텐츠는 보존.
4. Descriptions `bordered`·`column` 반응형 맵(전 영역) → MetadataList 기본
   단일 컬럼 플로우 채택 (16/18과 동일 결정).
5. `DescriptionLabel`(title+subtitle 블록 전체가 antd `label` ReactNode) →
   title은 `MetadataListItem.label`(string)로, subtitle은 `icon` 슬롯의
   물음표 툴팁 아이콘으로 이동(라벨 앞, 원래는 라벨 아래였음 — 유일한 가용
   슬롯). `newLineToBrElement` 1건(Redis 설명)은 툴팁이 plain string만
   받아 줄바꿈 서식 소실.
6. antd `Image`(Information에는 없음, LogoPreviewer 전용) → `Thumbnail`은
   정사각 cover-fit 강제라 와이드 로고 왜곡 → plain `<img>` + `onError`
   폴백(1x1 gif)으로 임의 비율 보존.
7. antd `Upload`(피커 전용, `beforeUpload`+`showUploadList=false`) →
   `FileInput`은 라벨 있는 전체 필드라 아이콘 전용 트리거 UX에 안 맞음 →
   숨김 `<input type=file>` + 트리거 버튼 self-build(LogoPreviewer,
   ThemeJsonConfigModal 2곳).
8. `Typography.Text copyable={{text}}` 빈 children(아이콘만 렌더) →
   `BAICopyableText`는 텍스트+아이콘 항상 페어라 부적합 → bare
   `IconButton`+`navigator.clipboard`(SSHKeypairManagementModal,
   SSHKeypairGenerationModal ×2).
9. `Typography.Text type="danger"` → Astryx TextColor에 danger 없음
   (AdminModelCard.tsx 기존 전례 재사용) — `type="supporting" color="primary"`
   로 적색 틴트만 드롭(SSHKeypairGenerationModal).
10. MyKeypairManagementModal: `Tooltip`이 감싼 순수 장식용 아이콘(비활성
    버튼 아님) → `BAIQuestionIconWithTooltipAstryx`와 동일한 unstyled-button
    래퍼 패턴 재사용. `color: token.colorInfo` 아이콘 틴트 드롭(P5, 닫힌
    variant enum). `Tooltip`+`disabled` 아이콘 버튼(MainKeyCannotDeactivate)
    → `IconButton`엔 `disabledMessage` 없음(P18, 티켓18 전례 재사용) — 호버
    설명 드롭.
11. ShellScriptEditModal: `Space.Compact`로 묶인 "Save & Close" 주 버튼 +
    "Save without close" 대안 액션(chevron 드롭다운) → `ButtonGroup`+
    `DropdownMenu`(MAPPING §5.3 split-button 레시피).
12. AnnouncementEditModal 툴바: antd `Tooltip`이 각 텍스트 없는 `Button`을
    개별로 감싸던 9개 포맷 버튼 → `IconButton`의 네이티브 `tooltip` prop으로
    합쳐 컴포넌트 1개로 축소(P8: `label`이 접근성 이름, `tooltip`이 호버
    힌트, 둘 다 하나의 컴포넌트가 제공).
13. ErrorLogList 하단 컬럼설정 버튼: antd `type="text"` 아이콘 전용
    `Button`이 접근성 이름 전무 → `IconButton`으로 전환하며 처음으로 실제
    `label`/`tooltip` 부여(P8 개선, 신규 회귀 아님).
14. MyKeypairInfoModalLegacy(레거시 26.4.0 이전 호환): raw antd `Table` →
    `BAITable`(프런티어 래퍼, ErrorLogList와 동일 전례) — `BAITable` 자체
    전환은 티켓 25 소관이므로 그대로 재사용.

### P15 evidence

Direct antd value-imports(영역 30파일): **before 37 → after 12**. 잔여 12줄
전부 프런티어/SHIM/스킵리스트: `Form`/`FormInstance`(SHIM, 3파일) ·
`theme`(theme-ALGORITHM 생산자, 티켓09 스킵리스트, 3파일:
`FontFamilySettingItem`·`BrandingSettingItems/ThemeColorPicker`·
`ThemeAccentColorPicker`) · `ColorPicker`(갭 컴포넌트, Astryx에 컬러피커
없음 — `astryx search "color picker"` 확인, `LightDarkColorPicker` 1파일) ·
`ColumnsType`(타입 전용, `ErrorLogList` 1파일). `.ant-*` 셀렉트 참조 0(주석
제외), `createStyles` 0(co-located CSS로 이관). 재생성:
`shots/22/p15-area.sh HEAD|WORK`.

### PILOT-DECISION #1 철회 (2026-08-08) — settings-sidebar 패턴 채택

**결론: #1은 틀렸다.** `TabList`에 세로 배치가 없다는 관찰은 맞지만, 좌측 탭
레일의 Astryx 등가물은 "세로 TabList"가 아니라 **페이지 셸**이고, Astryx는 그걸
`settings-sidebar` 페이지 템플릿("Settings Panels")으로 이미 제공한다. 컴포넌트
레벨 조회(`astryx component TabList`)만으로는 안 보이고 `astryx template --list`
/ `astryx search "settings sidebar"`로 발견된다 — discover-don't-guess의 범위를
컴포넌트에서 템플릿까지 넓혀야 했던 사례.

`SettingList`는 이제 템플릿 조합을 그대로 따른다:

- `Layout height="auto" padding={0}`
  + `start={<LayoutPanel hasDivider padding={0} width={240} role="navigation">}`
  + `content={<LayoutContent padding={4}>}`
- 내비 열은 `List density="spacious"` + `ListItem`
  (`isSelected` 활성 표시, `endContent`에 카운트 `Badge` — 22에서 만든 카운트
  뱃지 그대로 이동)
- 좁은 화면(< `md`, 768px)은 템플릿과 동일한 master→detail 드릴다운:
  `start` 슬롯을 통째로 제거하고 내비 리스트를 전폭으로, 선택 시 `Toolbar` +
  ghost 백 버튼 + 섹션명. 이 모드에서는 pane 안의 그룹 제목을 숨겨 중복 제거
  (`GroupSettingItems hideTitle`).
- 브레이크포인트는 RESPONSIVE-POLICY §2대로 `useBAIBreakpoint()`
  (Astryx `useMediaQuery`는 첫 렌더 `false` → 플래시).
- `width={240}`: 레거시는 `tabBarStyle={{ minWidth: 200 }}`(콘텐츠에 맞춰 성장),
  `LayoutPanel.width`는 고정 예산이라 200에서 "Experimental features"가 잘려
  한 단계 넓힘. 프레임 우선(frame-first) 규칙에 따른 px 예산이며 per-component
  색/위치 해킹이 아니다.
- 신규 i18n 키 0: 백 버튼 `webui.menu.GoBack`, 내비 랜드마크 라벨
  `webui.menu.Settings` 재사용.

**URL 계약 무영향.** 좌측 레일 선택은 antd `Tabs`가 들고 있던 것과 동일한
페이지 내부 state(`activeTabKey`, `useState`)다. 페이지 레벨 `?tab=`
(nuqs `useTabQuerySnapshot` on `BAICard`)은 손대지 않았고, 라이브에서
`?tab=logs` 클릭 → 새로고침 → `?tab=logs` + Logs 탭 활성 확인.

**증거:** `.scratch/astryx-migration/shots/settings-sidebar/{before,after}-*.png`
(usersettings / configurations / maintenance / branding × 라이트·다크 wide,
usersettings 좁은 화면 nav·detail × 라이트·다크, 활성 항목 하이라이트,
`?tab=` 왕복). 캡처 스크립트: `.scratch/astryx-migration/settings-sidebar-shots.mjs`
(`PHASE=before|after`, before는 `git show HEAD:...`로 파일만 임시 교체 후 복원 —
git stash 금지 정책 준수).

**일반화:** 이 조합은 앞으로 antd 세로 탭을 만나는 모든 표면의 표준 관용구다.
`.scratch/astryx-migration/CONVERSION-IDIOMS.md` §1에 레시피로 기록.

### 시각 게이트 판독 노트

- settingList: 탭 카운트 뱃지, StatusDot(변경됨 표시), Selector, hover 리셋
  아이콘 버튼 — 라이트/다크 모두 레이아웃 해부도 동일(탭 구조·행 구조·모달
  anatomy), 세로→가로 탭 배치 변경은 PILOT-DECISION #1 기록. **(2026-08-08:
  #1 철회 — 세로 내비게이션이 `settings-sidebar` 조합으로 복원됨. 최신 시각
  증거는 `shots/settings-sidebar/`.)**
- information: 2열 그리드(Core/Security) + 전폭 카드(Component/License),
  MetadataList 단일 컬럼(antd bordered 4/2열 그리드 대비 밀도 하락은
  PILOT-DECISION #4), 헬프 툴팁 아이콘, Badge 파일, BAIDoubleTag.
- before 캡처는 `git diff to-astryx -- <pair> | git apply -R`로 해당 파일
  쌍만 임시 되돌린 뒤 동일 하니스로 촬영, 직후 `git apply`로 복원(git stash
  금지 정책 준수 — patch 파일 방식).

### 후속(다른 티켓 소관)

- `BAITable`/`BAI*Nodes` 내부(25), BUI select 계열(26/27),
  `BAIGraphQLPropertyFilter`(28), notification(29), BUI 계약(30) — 이 영역
  파일들의 BUI import는 그대로.
- `AutoUpdateFetchKeyButton`/`BAICodeEditor`/`TextHighlighter`/
  `TableColumnsSettingModal`/`SyntaxHighlighter`(Chat) — 타 영역 공유
  컴포넌트, 해당 소유 티켓에서.
- `LightDarkColorPicker`의 antd `ColorPicker`는 Astryx에 대응 컴포넌트가
  없는 진짜 갭 — 08 계열 갭 컴포넌트로 self-build할지는 후속 판단 필요.
