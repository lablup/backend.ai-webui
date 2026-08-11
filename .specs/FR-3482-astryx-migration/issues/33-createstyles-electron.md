# 33 — createStyles contract + Electron 검증

**Target:** to-astryx
**Blocked by:** 30
**Status:** done

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** antd-style createStyles 49파일을 plain CSS/xstyle + var(--…)로 최종 전환(P6/P17 grep 게이트로 무음 사망 방지), antd-style 의존 제거 준비. Electron 빌드 경로 실검증.

## Acceptance criteria

- [x] antd-style import 0 — 소스 전체에서 `antd-style` 임포트가 사라졌고, `pnpm-workspace.yaml` catalog / `react/package.json` / `packages/backend.ai-ui/package.json` 에서도 제거. 남은 문자열은 전부 산문(주석·문서).
- [~] Electron 앱 기동 + 대표 화면 스모크 — **이 환경에서는 불가**. 아래 "Electron 검증 범위" 참조. 정적으로 검증 가능한 것은 전부 수행(`make dep` 성공, publicPath 패치 검증, 엔트리 스타일시트에 드래그 영역 규칙 존재, es6 프로토콜의 `text/css` MIME 확인).
- [x] verify.sh ALL PASS

## Implementation notes

### 전환한 파일 (25개 → co-located CSS 25개 신설)

**BUI (`packages/backend.ai-ui/src`) — 12 블록 / 11 파일**

| 컴포넌트 | 새 CSS | 비고 |
|---|---|---|
| `BAIAlert` | `BAIAlert.css` | `.ant-alert-*` 유지(P6) |
| `BAICheckbox` | `BAICheckbox.css` | `colorErrorHover` → `--color-error` (PILOT-DECISION) |
| `BAICountdownBorder` | `BAICountdownBorder.css` | keyframes를 BUI 스코프 이름으로 최상위 선언 |
| `BAILink` | `BAILink.css` | `colorLinkHover` → `--color-accent` (PILOT-DECISION) |
| `BAIListAlert` | `BAIListAlert.css` | 스크롤바 |
| `BAIModal` | `BAIModal.css` | 가장 큼(217줄). 아래 "동적 블록 정적화" 참조 |
| `BAISelect` | `BAISelect.css` | ghost/custom 두 블록 |
| `BAIUncontrolledInput` | `BAIUncontrolledInput.css` | number spinner 숨김 |
| `Table/BAINameActionCell` | `Table/BAINameActionCell.css` | 클래스 네임스페이스 주의(아래) |
| `Table/BAITable` | `Table/BAITable.css` | `theme.useToken()` 자체가 불필요해져 제거 |
| `baiClient/FileExplorer/EditableFileName` | `EditableFileName.css` | |
| `baiClient/FileExplorer/ExplorerActionControls` | `ExplorerActionControls.css` | |

**앱 (`react/src`) — 16 블록 / 14 파일**

`AllocationHistoryStatistics`, `BAIContentWithDrawerArea`(createGlobalStyle),
`BAIMultiStepNotificationItem`, `BAIPanelItem`, `Chat/ChatMessageContent`,
`FairShareItems/FairShareList`, `FairShareItems/UsageBucketChartContent`,
`FolderCreateModal`, `FolderExplorerModal`, `MainLayout/MainLayout`
(createGlobalStyle ×2 + createStyles), `SourceCodeView`,
`StoragePermissionEditModal`, `TerminateSessionModalForProjectAdmin`,
`DefaultProviders`(엔진 배선 제거).

`ChatMessageContent` 는 티켓 24가 "FRONTIER, 33이 소유"로 넘긴 ~110줄 마크다운
크롬이다. `.ant-*` 가 아니라 시맨틱 HTML이라 P6 대상이 아니었고, 티켓 22의
`AnnouncementEditModal.css` 와 같은 토큰 매핑 결정을 그대로 따랐다.

### 관례 (모두 헤더 주석에 기록)

- **UNLAYERED**. 대체 대상인 emotion 스타일이 unlayered였고, antd cssinjs는 자기
  `<style>` 을 `<head>` 앞쪽에 prepend(`prependQueue`)하므로 번들 스타일시트가
  동률 싸움에서 이긴다. `@layer components` 에 넣었으면 모든 규칙이 조용히
  antd에게 졌을 것이다(P6와 같은 실패 양식). BUI의 `styles/backend.ai-ui.css`
  (`.anticon` 베이스라인)만 기존대로 `@layer components` 유지.
- **토큰**: 모든 값을 `packages/backend.ai-ui/src/theme-shim/mapping.ts` 의 정본
  매핑표대로 `var(--…)` 로 옮겼다. `verdict: 'self'` (Astryx 대응 없음) 토큰은
  파일 헤더에 대체 결정을 명시했다 — 예: `colorTextQuaternary` →
  `--color-text-disabled`, `colorFillTertiary` → `--color-overlay-hover`,
  `colorBgSpotlight` → `--color-background-inverted`, `controlHeightSM`(24px)와
  `lineHeight`(1.5714)는 리터럴 유지.
- **P19**: 토큰 게이트 undeclared 9 → 8. 새로 도입한 미선언 토큰 0. 줄어든 1건은
  `BAIModal` 의 `var(--ant-color-bg-elevated, #fff)` 를 `--color-background-popover`
  로 바꾼 것. 남은 8건은 전부 기존 항목(호스트 소유 `--general-modal-*`,
  theme-probe 1건).
- **P6**: `.ant-*` 셀렉터는 살아 있는 것만 그대로 보존했다. 셀렉터 gate 카운트는
  앱 소스 기준으로만 이동(파일 위치가 tsx → css로 옮겨간 것).

### BAIModal — 동적 블록을 정적으로

`createStyles` 가 프롭 8개를 하나의 emotion 클래스에 보간하고 있었다. 8개 모두
**열거 가능**이라 각각 modifier 클래스가 됐다: `bai-modal-sticky-title`,
`bai-modal-type-{warning,error}`, `bai-modal-window-controls`,
`bai-modal-state-{maximized,fullscreen,minimized}`,
`bai-modal-minimized-{top,bottom}` + `-{left,right}`. 진짜 연속값이던
`controlHeightSM` 은 `--bai-modal-control-size` 커스텀 프로퍼티로 한 번만 선언.

### BAINameActionCell — 클래스 네임스페이스 (읽고 나서 바꿀 것)

- `bai-name-action-cell-title-icon` / `bai-name-action-cell-actions` 는 **마커**다.
  전자는 `calculateVisibleActions` 가 `querySelector` 로 재고, 후자는 e2e 스펙
  ~20개가 로케이터로 쓴다. 유지했다.
- 스타일 훅은 `bai-nac-*` 로 별도 네임스페이스를 뒀다. 앱의 Astryx 재구현
  (`react/src/components/astryx-bui/astryxBui.css`, 티켓 16)이 이미
  `bai-name-action-cell-*` 계열을 **다른 액션 버튼 색으로** 소유하고 있어서,
  같은 이름을 쓰면 로드 순서가 승자를 정하게 된다.

### createGlobalStyle 2건

- `BAIContentWithDrawerArea`: `drawerWidth` 는 자기 엘리먼트의 인라인 커스텀
  프로퍼티(`--bai-drawer-area-width`)로. 포털(body 레벨)에 있는
  `.ant-drawer-content-wrapper` 규칙은 명령형 속성 토글 대신 `:has()` 로
  콘텐츠 div의 `margin-style` 클래스를 참조한다 — 선언적이고, 원본의 전역
  스코프를 그대로 재현한다.
- `MainLayout`: 전역 스크롤바 규칙은 그대로 CSS 파일로. `TokenCssVariables`
  (`resources/webui.css` 가 읽는 `--token-*` 브리지)는 테마마다 값이 바뀌므로
  `document.documentElement.style.setProperty` (CSSOM)로 전환했다. CSP는 CSSOM
  쓰기를 가로채지 않는다(`style-src` 는 파싱된 `<style>` 과 `style` **속성**을
  관장).

### 엔진 배선 제거 (DefaultProviders)

`<CacheProvider value={emotionGlobalCache}>` + `<StyleProvider nonce>` 제거.
런타임 스타일 주입기가 사라져서 nonce 배선이 필요 없어졌고, `@emotion/cache` /
`@emotion/react` 도 `react/package.json` 에서 제거했다(pnpm install 시 21개 패키지
제거). antd 자체 cssinjs의 nonce는 `<ConfigProvider csp={{ nonce }}>` 가 계속
담당한다 — 손대지 않았다.

`CSP.md` 를 실제 상태에 맞게 갱신: nonce 경로 목록에서 두 항목 삭제, 그리고
`'unsafe-inline'` 을 강제하던 주입기 3개 중 `@emotion/css` 싱글턴이 사라져 2개로
줄었다(로그뷰어 `styleInject`, `getScrollBarSize`).

### 테스트 1건 수정

`BAILink.test.tsx` 의 "disabled 링크 클릭 차단" 테스트는 emotion이 런타임에
`pointer-events: none` 을 주입하는 데 의존해서 `userEvent.click` 이 거부되는 것을
단언했다. co-located CSS는 vitest/jsdom에서 로드되지 않으므로(Vite가 `.css`
임포트를 스텁), 컴포넌트가 실제로 소유하는 것 — `bai-link-disabled` 클래스 —
을 단언하도록 바꿨다. **이 함정은 앞으로 다른 티켓에서도 재발한다**: 스타일
단언이 있는 테스트는 CSS 파일 전환 시 반드시 다시 봐야 한다.

테스트 전량 통과: BUI 441, 앱 1106, 루트 104.

### 죽은 파일 2개 (기존 상태, 이번 변경과 무관)

`react/src/components/FolderCreateModal.tsx` 와 `FolderExplorerModal.tsx` 는 어디에서도
임포트되지 않는다(V2로 대체됨). 프로덕션 번들에 JS도 CSS도 들어가지 않는 것을
빌드 산출물 grep으로 확인했다. 일관성을 위해 전환은 해뒀지만, 삭제 후보다.

### Electron 검증 범위

**검증한 것 (headless로 가능한 전부):**

1. `pnpm run build` 성공 → `build/web/`.
2. `make dep` (= `dep_web` + `dep_electron`) 성공. wsproxy webpack 번들 생성,
   `build/electron-app/` 에 pnpm install, `app/` · `resources/` · `manifest/` 복사,
   preload 배치까지 완료.
3. `scripts/patch-electron-publicpath.js` 자체 검증 통과 —
   `index.html` 이 `es6://assets/index-u-mJ_YWy.css` 를 링크하고, `url(/assets/…)`
   를 가진 CSS도 패치됐다.
4. **엔트리 스타일시트에 `-webkit-app-region` 규칙 7개(drag 2 / no-drag 5)가 모두
   들어 있다.** 이 중 BAIModal의 close 버튼·윈도우 컨트롤 no-drag 규칙은 전에는
   emotion이 런타임에 주입하던 것이다 — 이번 전환으로 Electron 프레임리스 창의
   드래그 영역이 컴포넌트 렌더 타이밍에 의존하지 않게 됐다(개선).
5. 신설 CSS 클래스 34개가 각각 **자기 컴포넌트가 속한 청크의 스타일시트**에
   실제로 방출됐는지 빌드 산출물 grep으로 전수 확인. 누락 2개는 위의 죽은 파일뿐.
6. `node --check` 로 `electron-app/main.js` · `preload.js` · 패키징된 `main.js` 구문 확인.
7. `es6://` 프로토콜 핸들러가 쓰는 `mime-types` 가 `.css` → `text/css` 를 반환하는지 확인.
8. CSP 측면: `es6://` 는 `registerSchemesAsPrivileged` 에서 `bypassCSP: true` 라
   Electron 쪽엔 영향 없음. 웹 쪽은 번들 동일 출처 스타일시트라
   `style-src 'self'` 로 이미 커버된다.
9. `:has()` (BAIContentWithDrawerArea.css) — 이 저장소의 Electron은 실제로
   39.8.10(Chromium ~140)이라 여유 있게 지원. (README/CLAUDE.md의 "Electron 35"
   표기는 이 티켓 범위 밖이지만 실물과 어긋나 있음.)

**검증 못 한 것 — 실제 앱 기동:**

이 개발 서버에는 X 디스플레이도, Xvfb도, GTK-3 공유 라이브러리도 없다:

```
node_modules/.bin/electron --version
→ error while loading shared libraries: libgtk-3.so.0: cannot open shared object file
```

docker도 없어서 컨테이너 우회도 불가. 따라서 **"Electron 앱 기동 + 대표 화면
스모크"는 디스플레이가 있는 머신에서 별도로 수행해야 한다.** 남은 리스크는
정적 검증으로 못 잡는 종류로 한정된다 — 즉 번들 CSS의 로드/순서 문제가 아니라
(그건 위 4·5로 확인됨), 스타일 엔진 제거가 antd 스크롤락/모달 측정 같은
런타임 경로에 미치는 부수효과가 있는지 여부. 스모크 시 우선 확인할 화면:
프레임리스 헤더 드래그, BAIModal 최대화/최소화/풀스크린, 알림 드로어
(margin-style일 때 좌측 보더), 그리고 Chat 마크다운.

### 후속 티켓에 남기는 것

- `scripts/antd-zero-gate.sh` 와 `migration-gates/antd-import-graph.mjs` 는 여전히
  `antd-style` 을 스캔 대상에 두고 있다 — 방어적으로 그대로 뒀다(재유입 감지).
- 안내 문서(`AGENTS.md`, `react/AGENTS.md`, `react/README.md`,
  `.github/copilot-instructions.md`, `.github/instructions/react.instructions.md`,
  `.claude/skills/react-layout/SKILL.md`, `packages/backend.ai-ui/README.md`)에서
  "antd-style 을 써라"는 지시를 전부 co-located CSS 관례로 교체했다. 안 했으면
  다음 에이전트가 즉시 되살렸을 것이다.
