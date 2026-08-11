# 24 — 페이지군 ⑩ 공통 프레임/로그인/잔여

**Target:** to-astryx
**Blocked by:** 09, 10, 11, 12, 13, 14
**Status:** done

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 해당 메뉴 영역의 페이지·컴포넌트를 MAPPING.md(DIRECT+PROP-CONDITIONAL)로 전환. 원본 레이아웃 충실도 유지, 공유 컴포넌트는 프런티어 번역, 갭 컴포넌트(08) 사용. 복잡해지는 antd 기능은 단순성 정책대로 드롭+기록.

## Acceptance criteria

- [x] 영역 내 antd 컴포넌트 렌더 0(Form 계열·프런티어 제외) — P15 리졸버로 증명
      (`shots/24/p15-before-area.txt` 38파일 중 37파일 direct antd import →
      `p15-after-area.txt`: 29파일 antd-free. 잔존 9건은 전부 문서화된 예외
      — `Form`/`FormInstance`(SHIM) 7파일 + `MainLayout`의 admin accent
      `ConfigProvider`/`App`(티켓 35) + antd-style `createGlobalStyle`
      2파일(티켓 33). 재생성: `shots/24/p15-area.sh HEAD|WORK`)
- [x] 페이지별 before/after 스크린샷(라이트/다크) 시각 게이트 통과 —
      `shots/24/{before,after}-{login,sider,routeError}-{light,dark}.png`
      (login 은 **실 dev 서버** `vite --port 5707`, frame/routeError 은
      하니스 `react/theme-probe/frame24.html` + `frame24Main.tsx`, 포트 5706.
      러너: `shots/24/shoot-login.mjs`, `shots/24/shoot.mjs`)
- [x] PILOT-DECISION/드롭 목록 기록 (아래 + 각 파일 in-code 주석)
- [x] verify.sh ALL PASS

## Implementation notes

### 영역 (38파일)

프레임 · 로그인/인증 · 라우트 에러 · 최상위 잔여. `shots/24/p15-area.sh` 의
`FILES` 가 정본이다.

- **프레임**: `MainLayout` · `WebUIHeader` · `WebUISider` · `ProjectScopeLayout` ·
  `BAISider` · `BAIMenu` · `SiderToggleButton` · `WebUIBreadcrumb` ·
  `LocationStateBreadCrumb` · `BAIContentWithDrawerArea` · `useWebUIMenuItems` ·
  `UserDropdownMenu` · `WebUIThemeToggleButton` · `WEBUIHelpButton` ·
  `BAIHelpDrawer` · `LoginSessionExtendButton` · `NetworkStatusBanner` ·
  `AnnouncementAlert`
- **로그인/인증**: `LoginView` · `LoginFormPanel` · `SignupModal` ·
  `ChangePasswordView` · `EmailVerificationView` · `STokenLoginBoundary` ·
  `SignoutModal` · `InteractiveLoginPage` · `TermsOfServiceModal` ·
  `PrivacyPolicyModal` · `AboutBackendAIModal`
- **에러/잔여**: `RouteErrorContent` · `Page404` · `ForbiddenPage` ·
  `BAIErrorBoundary` · `FlexActivityIndicator` · `ActionItemContent` ·
  `EduAppLauncher` · `routes.tsx` · `StartPage`(이미 antd 없음)

**영역 밖으로 명시 제외**

- `Information.tsx` — admin System 메뉴 그룹의 페이지. 병렬 실행 중인
  티켓 22(Settings/admin) 소관.
- `BAINotificationButton` / `WEBUINotificationDrawer` / `BAI*NotificationItem`
  4종 — 티켓 29(BAINotificationStack 재배선)가 `useBAINotification.tsx` 와
  한 덩어리로 다룬다. 헤더에서 호출만 유지.
- `MaintenancePage` / `ConfigurationsPage` / `BrandingPage` / `DiagnosticsPage`
  등 admin 설정 페이지 — 티켓 22.

### 이 티켓에서 반입한 공유 인프라

- **`react/src/astryx-theme/AstryxReverseTheme.tsx`** — `ReverseThemeProvider`
  (antd ConfigProvider algorithm 뒤집기)의 Astryx 대응. 중첩 `<Theme>` 에
  부모의 **resolved** mode 반대값을 명시 전달. 헤더(브랜드 배경 위 콘텐츠)와
  operator `sider.theme` 오버라이드가 사용.
- **`react/src/components/astryx-bui/AstryxRouterLink.tsx`** — Astryx 의 `as`
  링크 슬롯이 넘기는 `href` 를 react-router 의 `to` 로 번역하는 12줄 어댑터.
  `BreadcrumbItem` / `SideNavItem` 등 네비게이션 지점 공통.
- **`react/src/components/MainLayout/WebUIHeader.css`** — Electron 드래그
  영역(구 `createStyles`)을 컴포넌트가 직접 import 하는 CSS 로 이관(P17).
- **probe**: `react/theme-probe/frame24.{html,tsx}` + `frame24Main.tsx`.
  **before/after 양쪽 트리에서 같은 파일이 렌더되도록 API-agnostic 으로 작성**
  (메뉴 항목이 `label`(antd) 과 `labelText`(Astryx) 를 동시에 들고,
  sider props 는 superset 을 `as never` 로 전달). 덕분에 base 커밋을
  `git checkout <base> -- react/src` 로 되돌려 before 를 찍고 복원하는 방식이
  성립한다(worktree 추가·stash 금지 제약 준수).

### ★ 앱 전역 Astryx `<Theme>` 마운트 (이 티켓의 최대 발견)

`AstryxBrandTheme` 은 지금까지 **probe 페이지에만** 마운트돼 있었다. 즉
티켓 15–20 이 전환한 모든 화면이 **Astryx 기본 테마 + `mode: 'system'`** 으로
렌더되고 있었다 — OS=light + 앱=dark 조합에서 전환 영역이 어두운 페이지 안에
밝게 그려지는, SKILL.md 가 경고하는 바로 그 상태(두 스위치는 독립).
`DefaultProviders` 에서 antd 프로바이더 스택 **바깥에** `AstryxBrandTheme` 을
감싸 해결했다. antd `ConfigProvider` 는 Form 엔진과 미전환 표면 때문에 그대로
유지(티켓 35 제거) — 두 스위치가 이제 `useThemeMode` 한 소스를 따른다.
다크 로그인 스크린샷이 이 수정의 실증이다.

### ★ PILOT-DECISION #1 — 프레임: `SideNav` 채택, `AppShell` 미채택

MAPPING §5 는 `Layout`/`Sider` → `AppShell` + `SideNav` 를 지시한다. **절반만
채택**했다.

- **채택**: `BAISider` = Astryx `SideNav`(header/children/footer/collapsible),
  `BAIMenu` = `SideNavSection` + `SideNavItem`. 폭 240→260, 접힘 74→48
  (시각값 정책: Astryx 기본값 수용).
- **미채택**: `AppShell`. 이유 3가지 (in-code 주석 `MainLayout.tsx`):
  1. `AppShell` 이 스크롤 컨테이너와 `<main>` 을 소유한다. 이 레이아웃은
     **자기 스크롤 컨테이너 ref 를 jotai atom(`mainContentDivRefState`)으로
     공개**하고 페이지들이 스크롤-투-탑/무한스크롤에 쓰며, sticky 헤더도 그
     엘리먼트를 스크롤 부모로 전제한다. AppShell 은 스크롤러 ref 를 노출하지
     않아 `main` 안에 스크롤 컨테이너를 하나 더 중첩해야 하고 → sticky 헤더가
     즉시 깨진다.
  2. `topNav` 슬롯은 **전체 폭**(사이드바 위)이다. 이 앱의 헤더는 콘텐츠 열
     폭만 차지하고 사이드바는 자기 브랜드 로고 밴드를 갖는다. topNav 로 옮기면
     브랜드 바가 이동한다 — 포팅이 아니라 레이아웃 변경(원본 충실도 위반).
  3. `BAIContentWithDrawerArea`(알림 드로어 열릴 때 콘텐츠 시프트)에 대응하는
     AppShell 슬롯이 없다.
- 대체: 바깥 `Layout` → 평범한 flex row `<div>`(`LayoutWithPageTestId` 가
  `data-testid=page-*` 유지). 알림 드로어와 스크롤-ref 소비처가 이동하는
  티켓 35 에서 재검토.

### ★ 발견 — antd anchor reset vs Astryx `SideNavItem` (P6 계열, 무음)

`SideNavItem` 은 진짜 `<a>` 를 렌더한다(라우터를 통해도 middle-click /
"새 탭에서 열기" 가 살아있는 이유). antd 의 전역 anchor reset
(`:where(.css-dev-only-do-not-override-*) a`)이 앱 전역에 남아있는 동안
`color: colorLink` 와 `background-color: transparent` 를 강제해
**메뉴 라벨이 링크 파랑으로, 선택행 틴트와 hover 오버레이가 전부 사라졌다**.
컴파일도 타입체크도 통과하고 스크린샷으로만 잡히는 종류다. `BAISider.css`
에서 Astryx 토큰(`--color-text-primary` / `--color-neutral` /
`--color-overlay-hover`)으로 복구하고, antd 프로바이더가 사라지는 티켓 35 에서
삭제하도록 주석을 남겼다. 실측 확인: `shots/24/scripts/{probecolor,selected,
whywins}.mjs`.

### 전환 요약 (MAPPING.md 준거)

- `Layout.Sider`+`Menu` → `SideNav`+`SideNavSection`+`SideNavItem` (위 참조).
  `useWebUIMenuItems` 의 메뉴 모델을 **UI 라이브러리 중립**으로 재정의:
  `label:<WebUILink>` JSX → `labelText:string` + `to:string`, 그룹 라벨 JSX →
  `labelText:string`(`SideNavSection.title` 은 required string).
- `Button` 4갈래(§3.3): 아이콘 전용 → `IconButton`(+ 자체 `tooltip`, P18 회피),
  `type="primary"` → `variant="primary"`, `danger` → `variant="destructive"`,
  `block` → `width="100%"`, children → `label`, `loading`→`isLoading`.
- `Typography.Text/Title/Paragraph` → `Text`/`Heading`/`Text as="p"`.
  `<pre>` 를 감싸던 Paragraph 는 `as="div"`(antd Paragraph 는 `<div>` 렌더였고
  `as="p"` 는 무효 중첩을 새로 만든다).
- `Alert` → `Banner`(`type`→`status`, `showIcon` 드롭, `closable`→
  `isDismissable`+`onDismiss`, `action`→`endContent`, `banner`→
  `container="section"`).
- `Result` → `EmptyState`(+ 직접 고른 `icon`), `Spin` → `Spinner`,
  `Skeleton` → `BAISkeletonAstryx`(routes.tsx 42지점 포함).
- `Dropdown menu={{items}}` → `DropdownMenu items`(§3.7). placement 분해
  (`bottomRight` → `placement="below" alignment="end"`).
- `Breadcrumb items + itemRender` → `Breadcrumbs`+`BreadcrumbItem`
  (+`as={AstryxRouterLink}`).
- `Descriptions` → `MetadataList`+`MetadataListItem`, `Segmented` →
  `SegmentedControl`+`Item`, `Steps` → lab `Stepper`+`Step`,
  `Drawer` → lab `Drawer`, `Badge dot` 오버레이 → `BAIBadgeCountAstryx`(08).
- `Grid.useBreakpoint()` → `useBAIBreakpoint()`(R3) 4파일.
- Form 계열은 SHIM 유지, 시각층만 `BAIFormItem` + `astryx-bui/
  astryxFormControls` 어댑터로 교체(7파일).
- i18n: `webui.menu.Menu` 키 신설(햄버거 버튼의 접근 가능한 이름, P8) — 21개
  로케일 전부에 추가.

### PILOT-DECISION / 드롭 목록

1. **`AppShell` 미채택** — 위 ★ 참조.
2. **antd anchor reset 가드** — 위 ★ 참조(티켓 35 에서 삭제).
3. `BAIMenu` 의 `ConfigProvider` 컴포넌트 토큰 블록 전량 드롭
   (`itemHeight:40` / `itemBorderRadius:20` / `itemMarginInline` /
   `itemSelectedBg`=액센트 15% alpha / `fontSize:fontSizeLG`). 교과서적 P11:
   antd 기본 외관과 싸우려고 존재하던 래퍼는 착지점이 없다. 선택행은 Astryx
   자체 처리(neutral 10%)로 바뀐다 — before/after 사이더 스크린샷의 최대 차이.
4. `BAIMenu` 의 `createStyles`(`ul.ant-menu-item-group-list li.ant-menu-item`
   등) **번역이 아니라 삭제**. 대상 DOM 자체가 사라졌으므로 남기면 P6 무음사.
5. `BAISider` 의 중첩 `ConfigProvider algorithm` 제거 — 폴라리티 결정은
   호출부(`AstryxReverseTheme`)로 이동. `xs ? 0 : collapsedWidth`(폰 폭에서
   0폭 접힘)는 `SideNav` 에 zero-width 상태가 없어 드롭.
6. `Layout.Sider breakpoint="md"` 콜백 → `useBAIBreakpoint()` + effect
   (Astryx 는 브레이크포인트 시스템 자체가 없다, §3.9).
7. `SiderToggleButton`: `ConfigProvider defaultBorderColor` 드롭(P5),
   툴팁의 `[` 단축키 힌트가 JSX → `tooltip:string` 이므로 텍스트에 접합(P2),
   `shape="circle"` → 라운드 사각형.
8. `LoginSessionExtendButton`: "hack to change the primary hover color for
   header" `ConfigProvider` 드롭 — per-instance 색 탈출구 없음(P5/P11).
9. `WEBUIHelpButton` / `BAIHelpDrawer` 의 `Button href target="_blank"` →
   `IconButton` + `window.open`. `IconButton` 은 `<button>` 이라 앵커
   어포던스(가운데 클릭·링크 주소 복사) 손실, 새 탭 동작은 동일.
10. `UserDropdownMenu`: `buttonRender` 탈출구 제거(`DropdownMenu` 가 트리거를
    소유). 항목별 `data-testid` 드롭(P7) — e2e 는 **텍스트**로 클릭하고
    `user-dropdown-button` 만 앵커로 쓰므로 안전. 17px `Avatar` 로 감싼 아이콘
    → 맨 lucide 아이콘(Astryx `Avatar` 는 children 을 받지 않는다).
11. `WebUIHeader`: `Divider orientation="vertical"` +
    `borderColor:'transparent'` 는 **선이 아니라 스페이서**였다 → 간격으로 표현.
12. `LoginFormPanel`: `Input prefix`(봉투/열쇠/자물쇠 글리프)·`maxLength`·
    `autoComplete` 드롭(§3.6, 어댑터 표면에 없음). `Input.Password` 의 눈
    토글도 드롭(티켓 19 기결정 재사용). before/after 로그인 스크린샷의 주요 차이.
13. `LoginView`: **티켓 11 의 생존자 `App as AntdApp` 제거**. SignupModal 이
    Astryx 화되어(그 `App.useApp()` 은 app-shim) antd context 소비자가 없다.
    같은 이유로 `ConfigProvider Message.zIndexPopup` 도 제거 — 이 화면의
    message 는 이미 app-shim(Toast) 경유라 오버라이드가 죽은 코드였다.
14. `LoginView` 엔드포인트 드롭다운: 항목 label 이 JSX → string 이므로
    `env` Tag 는 라벨 텍스트 `"<url> (env)"` 로, 행 안의 빨간 Delete 버튼은
    **엔드포인트마다 별도 메뉴 행**으로 분리(`DropdownMenuItemData` 에 트레일링
    슬롯 없음). 헤더 행은 antd 의 disabled 가짜 행 → 네이티브
    `{type:'section', title}` 로 개선.
15. `SignupModal` 약관 동의: antd `Checkbox` 가 임의 JSX children 을 받아
    문장 안에 링크 2개를 품고 있었다. `CheckboxInput.label` 은 required
    **string** 이므로 문장은 라벨(접근 가능한 이름이 비로소 완전해짐),
    링크 2개는 `BAIFormItem extra` 행으로 분리 — `<label>` 안에 중첩돼 클릭이
    삼켜지던 문제도 함께 해소.
16. `STokenLoginBoundary`: `Input.OTP`(6칸 세그먼트) → 단순성 정책대로 드롭,
    평범한 `TextInput` + 기존 `^\d{6}$` 규칙 유지.
17. `EduAppLauncher`: antd `Steps` 의 per-item 생애주기 enum
    (`wait|process|finish|error`) → lab `Stepper` 는 `activeStep` 에서 진행을
    파생하고 `status` 는 시맨틱 enum 이다. `error` 만 명시 status 로 살아남고
    나머지는 `activeStep` 이 표현.
18. `ActionItemContent`: 손으로 칠하던 `backgroundColor`(user=액센트,
    admin=info 파랑, `themeColor` 오버라이드) 드롭 — 모든 액션 버튼이 테마
    액센트를 쓴다(P5).
19. `RouteErrorContent`: `Typography.Title` 의 수제 타입 램프
    (`fontSizeHeading3` + letter-spacing + line-height) 드롭, `Heading level={4}`
    기본값 채택.
20. `WebUIBreadcrumb`: 끝에 `/` 하나를 더 그리려고 있던 빈 `dummy_tail` 항목
    드롭(Astryx 는 항목 사이에만 구분자를 그린다).
21. `FlexActivityIndicator`: `Spin indicator`(커스텀 lucide 스피너) 드롭 —
    Astryx `Spinner` 는 자기 스피너를 그린다. `spinSize` 는 40여 소비처를 위해
    antd 모양(`small|default|large`)의 프런티어로 유지하고 내부에서 번역.
22. `AnnouncementAlert`: `BAIAlert` → `Banner` 직접 사용(호출부 DISSOLVE).
    마크다운 본문은 antd `description`(BAIAlert 가 빈 message 를 강제) →
    Banner 의 required `title` 로 이동, 내용 블록 수는 동일.
23. `InteractiveLoginPage`: `Descriptions bordered` → `MetadataList`
    (`bordered` 드롭은 티켓 20 이후 전역 기결정), `Card` → `BAICard`.

### 문서화된 잔존 antd (영역 내 9건)

| 파일 | 잔존 | 소관 |
|---|---|---|
| LoginView / LoginFormPanel / SignupModal / ChangePasswordView / EmailVerificationView / STokenLoginBoundary / SignoutModal | `Form`, `FormInstance` | **SHIM** — 티켓 34 (폼 엔진 교체) |
| MainLayout | `App`, `ConfigProvider` (admin scope accent) | 티켓 35. Astryx 쪽 절반(`AstryxAdminTheme`)은 **이번에 나란히 추가** — 두 스위치가 독립이라 admin 페이지가 양쪽에서 옳게 보이려면 둘 다 필요 |
| MainLayout / BAIContentWithDrawerArea | antd-style `createGlobalStyle` | 티켓 33 (createStyles → plain CSS). 둘 다 CSP nonce 때문에 `createGlobalStyle` 을 쓰고, BAIContentWithDrawerArea 의 `.ant-drawer-content-wrapper` 규칙은 알림 드로어가 antd 인 동안 **살아있는** 규칙이다 |

### 게이트 / 증거

- P15: `shots/24/p15-{before,after}-area.txt` (재생성 `p15-area.sh HEAD|WORK`).
  38파일 중 before 37 → after 잔존 9(전부 위 표).
- P6 `.ant-*`: 전환 파일에서 0. 유일한 잔존은 `BAIContentWithDrawerArea`
  2건이며 antd Drawer 를 향한 **살아있는** 규칙.
- P19 `var()` 토큰 게이트: 신규 위반 0. 이번에 새로 쓴 토큰
  `--spacing-2` / `--spacing-6` / `--color-accent` / `--color-text-primary` /
  `--color-neutral` / `--color-overlay-hover` 전부 `dist/astryx.css` 에 선언 확인.
- 시각: `shots/24/{before,after}-{login,sider,routeError}-{light,dark}.png`.
  로그인은 실 dev 서버(5707), 프레임/에러는 하니스(5706). **포트 정책 5705–5714 준수.**
- `bash scripts/verify.sh`: **=== ALL PASS ===**

### 시각 게이트 판독 노트

- **login(라이트/다크)**: 레이아웃·간격·모달 폭 동일. 차이는 (a) 입력 앞
  글리프 소실, (b) 비밀번호 눈 토글 소실, (c) "Advanced" 링크가 Astryx
  링크 색/크기. 다크는 앱 전역 `<Theme>` 마운트 이후 입력·모달이 제대로
  어두워진다(마운트 전에는 밝게 남았다).
- **sider(라이트/다크)**: 폭 240→260, 접힘 74→48, 메뉴 항목이 antd 의 알약형
  선택 표시(액센트 15% alpha)에서 Astryx 의 중성 10% 사각 하이라이트로,
  그룹 헤더는 밑줄 대신 `SideNavSection` 기본 헤더로 바뀐다. 브랜드 로고
  밴드는 negative margin 으로 풀블리드 유지. (하니스는 theme.json 시드를
  주입하지 않아 before 샷의 밴드가 antd 기본 파랑으로 나온다 — 실앱에서는
  before/after 모두 액센트 색이다.)
- **routeError(라이트/다크)**: 경로 pill·물결 밑줄·CTA 위치 동일, 제목
  타이포만 Astryx `Heading` 램프로 이동.

### 후속(다른 티켓 소관)

- `BAITable`/`BAISelect`/`BAIPropertyFilter`/`BAIModal`/`BAICard`/`BAIButton`/
  `BAIFlex`/`BAIAlert` 등 BUI 프런티어 — 티켓 25–30.
- 알림 버튼/드로어/아이템 4종 + `useBAINotification` — 티켓 29.
- `Information.tsx` 및 admin 설정 페이지들 — 티켓 22.
- antd-style 3파일 → plain CSS — 티켓 33.
- `MainLayout` 의 antd `ConfigProvider`/`App`, 로그인 계열 `Form` — 티켓 34/35.
- **e2e (티켓 31 소관, 이번 변경의 직접 결과)**: `user-dropdown-button` /
  `button-terms-of-service` / `button-privacy-policy` /
  `button-about-backend-ai` / `button-leave-service` / `webui-header` /
  `webui-breadcrumb` / `page-*` 등 `data-testid` 앵커는 전부 유지했다.
  다만 `e2e/config/page-access-control.spec.ts` 의 7지점이 사이더 항목의
  **비활성 상태를 `.ant-menu-item-disabled` 클래스로** 단언한다 — antd `Menu`
  가 사라졌으므로 이 단언은 무효다. 대체 앵커는 Astryx 가 이미 내보내는
  `a.astryx-side-nav-item[aria-disabled]` / `button.astryx-side-nav-item
  [disabled]` (선택 상태는 `[data-selected="selected"]` /
  `aria-current="page"`). e2e 스위트는 풀 클러스터가 필요해 이 세션에서
  실행·검증할 수 없어 티켓 31 로 넘긴다.
