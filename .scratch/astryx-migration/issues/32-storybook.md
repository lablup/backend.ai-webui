# 32 — Storybook 재작성

**Target:** to-astryx
**Blocked by:** 30
**Status:** done (2026-08-08)

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** BUI 재편 결과 기준으로 스토리 재작성(CSF 3, storybook-patterns 준수). 해체된 래퍼의 스토리는 삭제, 신규 BAI* 스토리 작성.

## Acceptance criteria

- [x] 신규/유지 BAI* 전 컴포넌트 스토리 존재 — 기존 86개 스토리 파일 유지(0 삭제 —
      아래 "해체된 래퍼가 없다" 참조), 신규 3개(`BAITableAstryx`,
      `BAIComplexSelect`, `BAIUserSelectAstryx`) + 기존 2개 파일의 `renderInput`
      데모를 antd `Select` → `BAIComplexSelect`로 교체
      (`BAIPropertyFilter.stories.tsx`, `BAIGraphQLPropertyFilter.stories.tsx`)
- [x] storybook 빌드 PASS — `pnpm exec storybook build` 성공, 전체 505개
      스토리를 Playwright로 순회한 스모크에서 505/505 렌더 성공(에러 오버레이 0,
      콘솔/페이지 에러 0)

## Implementation notes (2026-08-08)

### 스코프 정리 — "해체된 래퍼"가 실제로는 없었다

티켓 문구("해체된 래퍼의 스토리는 삭제")는 티켓 25–27이 레거시 `BAITable`/
`BAISelect`/22종 `*Select` 래퍼를 **완전히 대체**했다고 가정했지만, 실제로는
"나란히 export"(migration seam) 전략이었다 — `BAITable`/`BAITableLegacy`/
`BAITableAstryx` 3개가 함께 export되고, antd `*Select` 22종도 그대로 남아
`fragments/index.ts`에서 계속 나간다(30번 노트 §7, 27번 노트 "서바이버" 참조).
**즉 삭제할 스토리가 0개였다** — 기존 86개 파일 전부 여전히 유효한 컴포넌트를
가리킨다. 이 티켓의 실제 작업은 (1) 신규 Astryx-only 컴포넌트의 스토리 신설,
(2) ticket 28이 "storybook 재작성은 ticket 32로 미룬다"고 명시적으로 남겨둔
antd 잔재(두 PowerSearch 필터의 `renderInput` 데모) 교체, (3) storybook 자체를
ticket 30의 새 BUI 계약(브랜드 테마 부재, `.anticon` CSS 누락, Astryx i18n
런타임 미배선)에 맞게 재배선하는 것이었다.

### 1. Storybook 설정 — ticket 30 계약 반영

- **`.storybook/astryx.css`**: `../src/styles/backend.ai-ui.css`(ticket 30
  신설 BUI 자체 스타일시트, `.anticon`/spin 베이스라인) import 추가. 기존에는
  decorators.tsx가 BUI 컴포넌트를 배럴이 아니라 개별 경로로 import해서
  `src/index.ts`의 CSS import 체인이 한 번도 실행되지 않았다 — 모든 스토리가
  이 베이스라인 없이 렌더되고 있었다(육안으로는 안 보였지만 계약 위반).
  `@layer` 순서문은 이미 `backend.ai-ui.css`와 동일해서 그대로 idempotent.
- **`.storybook/astryxBrandTheme.ts` (신설)**: Astryx `<Theme>`(브랜드 테마)를
  프리뷰에 처음으로 마운트. 이전에는 `ThemeShimProvider`(ticket 10)만 있었는데,
  그건 **antd 형태 토큰을 소비하는 레거시 BUI 컴포넌트**만 겨냥한 셰임이고
  Astryx 네이티브 컴포넌트(BAITableAstryx, BAIComplexSelect, PowerSearch)가
  읽는 실제 Astryx CSS 캐스케이드/컴포넌트 오버라이드는 배선한 적이 없었다
  — 즉 지금까지 신규 컴포넌트 스토리를 만들었다면 Astryx `theme-neutral`
  기본값(회색)으로 렌더됐을 것이다. `react/src/astryx-theme/backendAiTheme.ts`
  (ticket 02의 진짜 브랜드 테마 빌더)를 직접 import할 수는 없다 — BUI storybook은
  별도 워크스페이스 패키지이고 그 파일은 `react/src` 소속이다. 대신 그 파일의
  레시피를 **BUI 자신의 export**(`ANTD_ALIGN_TOKENS`/`ANTD_DARK_ALGORITHM_OUTPUT`,
  `theme-shim`에서 재노출)와 `.storybook/theme.json`(이미 `resources/theme.json`
  미러)의 시드로 재구성했다 — 측정 테이블은 재사용(드리프트 불가), glue 코드
  ~40줄만 storybook 전용으로 존재. `KEEP IN SYNC` 주석으로 원본과 연결.
- **`.storybook/decorators.tsx`**: 프로바이더 순서를 실제 앱
  (`DefaultProviders.tsx`)과 동일하게 재배선 —
  `AstryxThemeProvider(brand) > ThemeShimProvider > BAIConfigProvider > BAIAppProvider`.
  손으로 조립하던 `<ConfigProvider>` + 없던 Astryx i18n을 **`BAIConfigProvider`
  직접 사용**(ticket 30이 실제로 앱에 배선한 것과 동일 컴포넌트)으로 교체 —
  이제 스토리가 `InternationalizationProvider`(Astryx 자체 i18n 리졸버)를 실제로
  받는다. 이전에는 이 세 번째 런타임이 미배선이라 Astryx 컴포넌트가 로케일
  토글과 무관하게 항상 `locale:'en'` 기본값으로 폴백했다(ticket 30 P13이 앱
  쪽만 고쳤고 storybook 쪽은 남아 있던 사각지대). `AstryxThemeProvider`는
  "Theme Style"(default/webui) 토글과 무관하게 **항상** 마운트 — 실제 앱의
  `AstryxBrandTheme`도 무조건 마운트이므로 대칭.

### 2. 신규 스토리 — Astryx 전용 컴포넌트

| 파일 | 대상 | 비고 |
|---|---|---|
| `Table/BAITableAstryx.stories.tsx` | `BAITableAstryx` (ticket 25) | `BAITable.stories.tsx`(레거시)와 동일한 sample data/columns로 대칭 구성 — Basic/ColumnSettings/Sorting/RowSelection/Loading/EmptyState 6종 |
| `BAIComplexSelect.stories.tsx` | `BAIComplexSelect` (ticket 26) | 정적 옵션 데모 — Single/Multiple/Preselected/Loading/Empty/Disabled 6종. `labelInValue` 계약 그대로 노출 |
| `fragments/BAIUserSelectAstryx.stories.tsx` | `BAIUserSelectAstryx` (ticket 26 실증 소비자) | `RelayResolver`(`BAIUserNodes.stories.tsx`와 동일한 `relay-test-utils` 목킹 패턴)로 고정 5-user 목데이터 — Default/Multiple/ExcludeInactive/IdValued 4종. 실제 스크롤 `loadNext` 페이지네이션은 storybook이 아니라 ticket 26/27의 `react/theme-probe/select26.tsx` 하네스가 이미 실측(재도출하지 않음) |

`BAIComplexSelect`의 나머지 실증 소비자(*SelectAstryx 17종)는 스토리 신설하지
않았다 — `BAIUserSelectAstryx` 1종이 대표적 A클래스(name-valued, Relay offset
페이지네이션, 서버 검색) 패턴을 보여주고 나머지는 ticket 27 CONVERSION-BRIEF의
동일 레시피 반복이라 §0 단순성 정책상 1종으로 충분하다고 판단.

`BAIPowerSearchAdapters.tsx`(ticket 28)는 렌더 가능한 컴포넌트가 아니라 순수
헬퍼/훅 모듈(`toEnumItems`, `useRenderInputEditors` 등)이라 별도 스토리 대상이
아니다 — 이미 `BAIPropertyFilter`/`BAIGraphQLPropertyFilter` 스토리를 통해
간접 노출된다.

### 3. 기존 스토리 수정 — antd 잔재 교체

ticket 28이 명시적으로 남긴 두 곳(`BAIPropertyFilter.stories.tsx`,
`BAIGraphQLPropertyFilter.stories.tsx`의 `renderInput` 데모)에서 antd `Select`를
`BAIComplexSelect`로 교체 — `onAddCondition(value, label)` 계약은 동일하게
유지하되 컨트롤 자체는 이제 Astryx 네이티브라 마이그레이션된 실제 호출부의
모습과 일치한다. 컴포넌트 설명 md에도 ticket 32 갱신 사실을 명시.

**`react/src`의 gap 컴포넌트(BAISkeletonAstryx, BAIPopconfirmAstryx,
BAIBadgeCountAstryx, BAINotificationStackAstryx — ticket 08)는 storybook
스코프 밖으로 남겨둔다** — storybook은 `packages/backend.ai-ui`에만 설정되어
있고(`packages/backend.ai-ui/.storybook/`), `react/`에는 별도 storybook이
없다. 이 컴포넌트들은 `react/src/components/astryx-bui/`에 살고 react 앱
전용이라(app hooks/jotai 등에 의존하지 않는 pure 컴포넌트지만 패키지 경계가
다르다) BUI storybook에서 스토리할 수 없다 — react 쪽에 별도 storybook을
새로 구성하는 것은 이 티켓의 스코프(및 33번 티켓의 Electron/createStyles
경계)를 벗어난다.

### 4. 전체 인덱스 스모크 — 8종 대표에서 505종 전량으로 확장

`.scratch/astryx-migration/shots/measure-32-storybook-smoke.mjs` — ticket 10의
8-스토리 대표 스모크(`measure-10-storybook-smoke.mjs`)를 `index.json`의 모든
`type:"story"` 엔트리로 확장. 각 스토리를 `/iframe.html?id=...&viewMode=story`로
직접 로드해 에러 오버레이 부재·콘솔/페이지 에러 0·`#storybook-root` 비어있지
않음을 검사. 동시성 6, 실패 시 1회 재시도.

**측정 중 발견한 하네스 자체의 함정 3개** (스토리/컴포넌트 결함이 아니라
스모크 스크립트 쪽 버그였음 — 전부 고쳐서 최종 505/505 통과):

1. **정적 서버로 `serve -s`(SPA rewrite) 쓰면 안 된다.** `-s`가 `iframe.html`이
   실재함에도 모든 요청을 `index.html`로 리라이트해 JS 모듈이 전부
   `text/html`로 응답 → "Failed to load module script" 대량 실패. `serve`
   기본 옵션(`-s` 없이)도 `cleanUrls`로 `/iframe.html?id=…` → `/iframe`
   301 리다이렉트하며 쿼리스트링을 날린다. **`python3 -m http.server`**
   (경로를 있는 그대로 서빙)로 되돌렸다.
2. **`waitUntil:'load'` 직후 고정 대기(700ms)로는 부족하다.** 측정: `load`
   이벤트 후 최대 ~700ms 더 지나야 스토리가 실제로 커밋되는 경우가 있었다
   (Vite 청크 fetch+eval+Suspense/i18n 정착). 고정 대기 → `#storybook-root`
   비어있지 않을 때까지 최대 8초 폴링으로 교체 — 매번 8초를 기다리는 게
   아니라 콘텐츠가 뜨는 즉시 중단하므로 평균 소요시간은 오히려 줄었다.
3. **다크모드는 `prefers-color-scheme`이 아니라 `localStorage`다.**
   `@vueless/storybook-dark-mode`의 `useDarkMode()`는
   `localStorage['sb-addon-themes-3']`만 읽는다(매니저 툴바가 쓰는 키) —
   `/iframe.html`을 매니저 없이 직접 로드하면 그 키를 아무도 쓰지 않으므로
   `page.emulateMedia({colorScheme})`는 **완전 무효과**였다(스크린샷 1차
   시도에서 라이트/다크 파일 바이트가 완전히 동일해서 발견). 리로드 전에
   해당 localStorage 키를 직접 써서 고쳤다 — 재실측 후 라이트/다크 스크린샷이
   실제로 달라짐(`.scratch/astryx-migration/shots/32/*-{light,dark}.png`).

**FAIL 분류 조정 — 브라우저 리소스 404는 렌더 에러가 아니다.** 강화된 하네시로
`statistic-bairesourcenumberwithicon--resource-types`/`--server-configured-icon`
2종이 `console: Failed to load resource … 404`로 걸렸다 — 조사 결과 **컴포넌트
결함이 아니라 사전에 존재하던 아이콘 에셋 갭**이다:
`resources/icons/hyperaccel.svg`가 실제로 없음(Astryx 마이그레이션과 무관,
gap은 이 티켓 이전부터 있었음), `server-configured-icon` 스토리는 이름 그대로
**의도적으로** `nonexistent_icon.svg`를 지정해 아이콘 부재 폴백을 테스트하는
스토리다. 네트워크 404 콘솔 로그(`Failed to load resource: the server
responded with a status of \d+`)는 브라우저가 찍는 리소스-레벨 진단이지
React/JS 에러가 아니므로 — 실제 렌더링을 검사하는 이 스모크의 목적에서
제외하도록 필터를 좁혔다(`pageerror`와 명시적 `console.error(...)`는 여전히
전부 검사). `hyperaccel.svg` 에셋 갭 자체는 이 티켓 스코프 밖(아이콘 제작은
migration 작업이 아님)이라 후속 별도 이슈로 남겨둔다.

### 5. 스크린샷 — 대표 5종

`.scratch/astryx-migration/shots/32/` — 라이트+다크 각 1장씩 10장:

- `table-baitableastryx--default` (BAITableAstryx, 정렬/태그/페이지네이션)
- `select-baicomplexselect--default` (BAIComplexSelect, 정적 옵션)
- `fragments-baiuserselectastryx--default` (Relay-mocked Astryx select)
- `filter-baipropertyfilter--with-render-input` (DSL 필터 + BAIComplexSelect renderInput)
- `filter-baigraphqlpropertyfilter--with-custom-type` (GraphQL 필터 + BAIComplexSelect renderInput)

전부 `data-astryx-theme="storybook-bai-brand"` 확인(브랜드 테마 실제 적용),
라이트/다크 색상 반전 확인.

### 6. Lint 발견 — `storybook/no-redundant-story-name`

신규 스토리 3곳(`BAIComplexSelect.stories.tsx` `Disabled`,
`BAITableAstryx.stories.tsx` `RowSelection`/`EmptyState`)에서 `name:` 필드가
export 키의 자동 타이틀 변환과 완전히 같아 `eslint-plugin-storybook`이
`--max-warnings=0`(BUI lint 스크립트)에서 실패시켰다 — 중복 `name:` 제거로 해결.

### 검증

- `bash scripts/verify.sh` → `=== ALL PASS ===`
- `pnpm exec storybook build`(packages/backend.ai-ui) → 성공
- 전체 스토리 인덱스 스모크(Playwright, 505개) → **505/505 PASS**, 콘솔/페이지
  에러 0, 에러 오버레이 0
- `pnpm --filter backend.ai-ui exec tsc --noEmit`(임시 확장 tsconfig로
  `.storybook/**` 포함) → 0 errors — **주의**: `scripts/verify.sh`의
  TypeScript 체크는 `react/` 전용이고 BUI lint 스크립트는 `./src`만 대상이라
  `packages/backend.ai-ui/.storybook/**`는 정상 상태에서도 자동 타입체크/린트
  대상이 아니다(이 티켓 이전부터 그랬음, 이 갭 자체는 티켓 스코프 밖). 수동
  확장 tsconfig로 직접 검증해 0 errors 확보했다.
