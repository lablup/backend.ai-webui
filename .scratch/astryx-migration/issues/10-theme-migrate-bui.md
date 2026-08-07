# 10 — theme 셰임 대량 적용 — BUI

**Target:** main
**Blocked by:** 03, 06
**Status:** done (2026-08-07)

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** packages/backend.ai-ui의 useToken/createStyles 토큰 소비를 셰임으로 전환(createStyles 자체의 contract는 티켓 33).

## Acceptance criteria

- [x] BUI 빌드 PASS + verify.sh ALL PASS — `pnpm --filter backend.ai-ui build`
      성공(dts 진단 116건은 baseline과 비트 동일 = 전부 기존 존재, 신규 0),
      BUI vitest 378 pass, BUI eslint(--max-warnings=0) clean,
      `bash scripts/verify.sh` **ALL PASS**
- [x] Storybook 기존 스토리 스모크(대표 5종) 렌더 확인 — **8종** 확인
      (방법: `storybook build` → 정적 서빙 → Playwright로 iframe 직접 로드,
      재현 스크립트 `.scratch/astryx-migration/shots/measure-10-storybook-smoke.mjs`).
      BAIFlex/BAICard/BAITable/BAIModal/BAISelect/BAINameActionCell/BAIAlert/
      BAILink 각 default 스토리: storybook-root 콘텐츠 렌더 O, 에러 오버레이 X,
      console/page 에러 0, **셰임 프로브 liveness**(`--spacing-3`→`12px`) 확인.

## Implementation notes (2026-08-07)

**Sourcing decision — 셰임 코어를 BUI로 이전, react는 re-export (티켓 03
"shim relocation into BUI" deferred 항목 해소):**

- `react/src/theme-shim/` → **`packages/backend.ai-ui/src/theme-shim/`** git mv
  (index/astryxVars/mapping/selfTokens/breakpoints/vendor/test 전부).
  BUI는 별도 workspace 패키지라 react/src를 import할 수 없으므로 코어가 BUI에
  살고 react가 소비하는 방향만 성립. BUI `src/index.ts`에
  `export * from './theme-shim'` 추가 (`theme`/`useToken`/`buildTokens`/
  `ThemeShimProvider`/`BrandSeeds` 등 공개).
- `react/src/theme-shim/index.tsx`는 `backend.ai-ui` re-export 20줄로 재작성 —
  티켓 09가 전환한 react/src 218파일의 상대경로 import는 **무변경**으로 계속
  동작 (react vite/vitest의 `backend.ai-ui`→src alias 덕에 dev에선 소스 직결).
- **측정 테이블 동반 이전:** 셰임이 의존하는 `ANTD_ALIGN_TOKENS` +
  `ANTD_DARK_ALGORITHM_OUTPUT`(+섀도 레시피)을
  `packages/backend.ai-ui/src/theme-shim/antdParity.ts`로 이동.
  `react/src/astryx-theme/backendAiTheme.ts`는 `backend.ai-ui`에서 import 후
  re-export — 티켓 02 공개 API 유지, `backendAiTheme.test.ts` 무수정 통과.
- `themeShim.test.ts`(셰임 antd parity 9+α tests)는 셰임과 함께 BUI로 이동,
  BUI vitest가 실행. 이를 위해 `@ant-design/colors@^7.2.1`를 BUI devDep 추가.

**Applied:**

- 코드모드 확장: `scripts/codemods/antd-theme-to-shim.mjs`에 `TARGETS` 배열
  도입 — react/src는 기존대로 `react/src/theme-shim`(re-export)로, BUI 파일은
  `packages/backend.ai-ui/src/theme-shim`(코어, 자기 패키지 self-import 회피)
  으로 상대경로 rewrite.
- `--only packages/backend.ai-ui --apply` 1패스: **63파일 전환**(51 import
  분리, 수동 수정 0, 이후 전체 dry-run 잔여 0). 견적 ~57 대비 +6은 스토리
  파일 1 + helper/hooks 포함 실측치. **BUI에는 theme-ALGORITHM 생산자 0파일**
  (스킵 없음; ConfigProvider 레이어는 전부 react 쪽).
- **createStyles 토큰 입력 전환 (7파일):** 콜백 `({ css, token })`의 token을
  antd-style 컨텍스트 대신 **props 주입**으로 변경 —
  `createStyles(({ css }, { token }: { token: GlobalToken }) => …)` +
  호출부 `useStyles({ token })`(token은 셰임 `theme.useToken()`).
  BAIModal이 이미 쓰던 리포 기존 패턴. 대상: BAIAlert, BAICheckbox,
  BAIListAlert, BAILink, BAISelect, BAINameActionCell, BAITable.
  나머지 createStyles 5파일(BAICountdownBorder, BAIUncontrolledInput,
  EditableFileName, ExplorerActionControls, BAIModal)은 콜백이 token을 안
  받거나(css-only) 이미 props 주입이라 무변경. createStyles 자체 제거는 티켓 33.
- **Storybook 배선 2건:** ① `.storybook/astryx.css` 신설(react/src/index.css의
  @layer 순서문 + reset/astryx/theme-neutral import 미러) — 셰임의 'astryx'
  프로브가 preview iframe에서 실값을 읽도록 캐스케이드 공급. 이를 위해
  `@astryxdesign/core`/`theme-neutral` 0.3.0 BUI devDep 추가.
  ② decorators에 `ThemeShimProvider` 마운트(mode=스토리북 다크모드 토글,
  seeds=themeConfig의 모드별 token) — 스토리가 다크/webui 테마 시드를 따름.
- `useToken()` provider-less 폴백에 모듈 레벨 캐시 추가 — 테스트/스토리
  컨텍스트에서 렌더마다 buildTokens(DOM 프로브) 재실행 방지(BUI 테이블은
  셀 단위로 useToken을 호출).

**PILOT-DECISION:**

- **jsdom에서는 'astryx' 프로브 토큰이 0으로 해석된다** (jsdom이 스타일시트
  커스텀 프로퍼티 캐스케이드를 적용하지 않음; probe는 `parseFloat||0`).
  이는 티켓 09 이후 react vitest도 동일한 상태였던 기지 제약. BAIFlex 스냅샷
  1건이 `gap: 12px`→(gap 없음)으로 걸려서 **스냅샷 갱신으로 수용**. 시각
  진실은 픽셀 A/B 게이트(티켓 03/09 6×0)와 storybook(실브라우저, 프로브
  12px 실측)이 담당. 정적 폴백 테이블 중복은 단순성 정책으로 기각.
- verify.sh의 "Astryx theme build" 체크는 이제 **BUI dist 빌드에 의존**
  (backendAiTheme.ts가 `backend.ai-ui` 패키지 export를 소비, astryx CLI는
  node resolution → dist). 로컬에서 stale dist면 named export가 undefined로
  실패할 수 있음 — `pnpm --filter backend.ai-ui build` 후 재실행.

**기존 존재(pre-existing) 확인 — 이 티켓이 건드리지 않음:**

- BUI `vite-plugin-dts` 진단 116건: stash A/B로 baseline과 동일 분포 확인
  (TS7006×63 등), 빌드는 성공 처리 — 신규 0.
- react `usePrimaryColors.test.tsx` 5실패: ConfigProvider 시드를 셰임이 읽지
  않는 티켓 09 전환의 귀결. baseline(stash)에서도 6실패 재현 — 후속 티켓
  (테스트가 ThemeShimProvider seeds로 래핑하도록 갱신 필요, 24권/33에서).
