# 01 — Astryx 도입 + StyleX 빌드 배선

**Target:** main
**Blocked by:** None — can start immediately
**Status:** done

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** Astryx가 설치되고 xstyle 저작이 가능한 빌드. deps(@astryxdesign/core·theme-neutral·@stylexjs/stylex + unplugin·babel-plugin·unplugin 0.19.0 exact pin), pnpm allowBuilds, 글로벌 CSS @layer 선언 + reset.css/astryx.css import, stylexVite 설정(useCSSLayers:false, cssInjectionTarget 필수 — spike/astryx-stylex-authoring 브랜치의 검증된 설정 재사용), verify.sh에 cssInjectionTarget 센티널 체크 추가, react/에서 astryx init --features agents 실행(생성된 xstyle 지침에 '프런티어/미전환 antd 파일 제외' 완화 주석). 프로브 페이지에서 Astryx Button + xstyle 오버라이드 렌더로 검증.

## Acceptance criteria

- [x] pnpm run build:react-only PASS, Astryx CSS 방출 확인
- [x] xstyle 오버라이드가 컴포넌트 기본 스타일을 이김(emitted CSS 캐스케이드 분석으로 확인 — 아래 노트 참조; 라이브 computed style 확인은 spike 14에서 기실증)
- [x] verify.sh ALL PASS + 센티널 체크 동작
- [x] CLAUDE.md ASTRYX 블록이 StyleX 모드로 갱신됨

## Implementation notes

**Built (2026-08-07, branch `to-astryx`):**

- **deps** — `react/package.json`: dependencies에 `@astryxdesign/core@0.3.0`,
  `@astryxdesign/theme-neutral@0.3.0`, `@stylexjs/stylex@0.19.0` (exact pin);
  devDependencies에 `@astryxdesign/cli@0.3.0`, `@stylexjs/babel-plugin@0.19.0`,
  `@stylexjs/unplugin@0.19.0` (exact pin), `unplugin@^2.3.11` (hard peer, pnpm
  비호이스트). `@stylexjs/babel-plugin` 명시 선언은 `astryx init`의 StyleX 모드
  감지 조건(spike 14). `astryx` 스크립트 alias 추가 (§4-0).
- **pnpm-workspace.yaml** — `allowBuilds`에 `@astryxdesign/cli: false`,
  `@astryxdesign/core: false` (postinstall은 init 안내 출력뿐).
  `minimumReleaseAgeExclude`에 `@astryxdesign/{core,theme-neutral,cli}@0.3.0`
  (2026-08-05 발행, 7일 격리창 내 — 2026-08-12 이후 제거 가능 주석 포함).
- **글로벌 CSS** — `react/src/index.css` 최상단에
  `@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;`
  + `reset.css`/`astryx.css`/`theme-neutral/theme.css` import. 공존 기간 중
  무레이어 글로벌 리셋 반입 금지 주석 포함.
- **stylexVite** — `react/vite.config.ts`: `@stylexjs/unplugin/vite`를 `react()`
  앞에 (`@astryxdesign/build` 우회 — vite ^8 peer 회피). `useCSSLayers: false`,
  `cssInjectionTarget: /assets\/index-[^/]*\.css$/` (필수), `unstable_moduleResolution.rootDir: projectRoot`.
  spike/astryx-stylex-authoring(74f4c1a6c)의 검증 설정 그대로.
- **verify.sh 센티널 체크** — `check_stylex_injection`: (1) config 게이트
  (vite.config.ts에 cssInjectionTarget 존재), (2) 빌드 산출물이 있으면 엔트리
  `assets/index-*.css`에 센티널(`z-index:2147480001`, 프로브 페이지의 `sentinel`
  스타일)이 있고 다른 CSS로 새지 않았는지 검사. 양성(PASS)·음성(비엔트리 CSS에
  센티널 주입 시 FAIL) 모두 실동 확인.
- **프로브 페이지** — `react/src/pages/AstryxStylexProbePage.tsx` + 라우트
  `project/:projectName/stylex-probe` (`react/src/routes.tsx`). Astryx
  Button/Card + xstyle 오버라이드, tokens.stylex typed 토큰, `stylex.props()`
  plain 요소, antd 공존, 센티널.
- **astryx init --features agents** — react/에서 실행 → `react/AGENTS.md` 생성
  (StyleX 모드: "155 components", xstyle prop 지침, 강화된 SELF-CHECK). 여기에
  MIGRATION RELAXATION 줄 추가: className/style 자기검사는 Astryx-native 코드에만
  적용, 프런티어/미전환 antd 파일 제외.
- **루트 ASTRYX 블록** — 루트 `AGENTS.md`(CLAUDE.md는 심링크)에
  `<!-- ASTRYX:START/END -->` 블록을 StyleX 모드로 반입 + RELAXATION 줄 +
  재생성 절차 주석(core 범프마다 react/에서 init 재실행 후 재동기화).
- **worktree tsc misresolution 수정 (빌드 PASS의 전제)** — `pnpm run
  build:react-only`는 이 티켓 이전부터 `.claude/worktrees/*` worktree에서
  실패했음 (spike 03/14의 "pre-existing failure"). 원인 실측: vite-plugin-checker
  빌드 모드는 bare `tsc`를 npm-run-path PATH로 스폰하는데, npm-run-path는 PATH에
  이미 있는 자기 workspace `.bin`은 dedupe로 건너뛰고, PATH에 없는 조상 디렉터리
  (`.claude/worktrees/`, `.claude/`, **메인 체크아웃** `node_modules/.bin`)를
  앞에 붙인다 → 메인 체크아웃 루트 TypeScript 5.5.4가 이겨 gpt-tokenizer@3.4.0
  `.d.ts` 파싱 실패 296건. 수정: vite.config.ts에서 빌드+체커 활성 시 react/
  자신의 `.bin`을 상속 PATH에서 제거 → npm-run-path가 walk-up 최전방에 재선두
  배치 → 항상 react/의 TS 6.0.3 사용. (메인 체크아웃에서는 원래 문제 없음.)

**Verification:**

- `pnpm run build:react-only` → `✓ built in 1m 55s`, PWA precache 476 entries,
  type check 포함 PASS. Astryx CSS는 엔트리 `assets/index-BzHOZKSC.css`(155,646
  bytes)에 방출: `@layer astryx-base`(offset 2,644)·`astryx-theme`·`reset` 보존.
- **xstyle 오버라이드 우선순위 (emitted CSS 캐스케이드 분석):** 컴파일된 StyleX
  출력은 엔트리 시트의 모든 `@layer` 블록(마지막 offset 151,896) **뒤**에
  **무레이어**로 append됨 — 오버라이드 규칙
  `.x1miatn0:not(#\#):not(#\#):not(#\#){padding-top:32px}` at offset 155,625.
  CSS 캐스케이드 규칙상 무레이어 선언은 모든 named layer(astryx-base 포함)를
  구체성과 무관하게 이김 + StyleX `:not(#\#)` 사다리로 내부 순서 보장.
  라이브 computed-style 확인(32px vs 8px, hover 전환)은 동일 설정의 spike 14
  (`origin/spike/astryx-stylex-authoring`)에서 headless Chromium으로 기실증.
  이 세션에서는 로그인 가능한 백엔드 없이 앱 라우트 렌더가 불가해 브라우저
  확인은 수행하지 않음 — CSS 분석으로 대체하고 여기 기록.
- `bash scripts/verify.sh` → `=== ALL PASS ===` (Relay·Lint·Format·TypeScript·
  Vite warmup·**StyleX cssInjectionTarget**·Terminology).
- 센티널 체크 음성 테스트: 비엔트리 CSS(BAIBoard)에 센티널 주입 시
  "StyleX sentinel leaked into non-entry stylesheets" FAIL 확인 후 원복.

**Notes / follow-ups:**

- `pnpm peers check` 경고 존재: `@astryxdesign/theme-neutral` →
  `lucide-react@^1.18.0` vs catalog `^0.552.0` (spike 03 기지 리스크, Phase 0-7
  아이콘 패스에서 해소 예정). 번들에 lucide 2벌 가능성 — 이 티켓 범위 밖.
- `minimumReleaseAgeExclude`의 @astryxdesign 3종은 2026-08-12 이후 제거 가능.
- 프로브 페이지/라우트는 실제 Astryx 페이지가 생기면 제거하되, 센티널 스타일은
  verify.sh 체크와 함께 이동시킬 것 (값 `2147480001` 동기화 주석 있음).
- `astryx init`은 스펙 §4-0과 달리 이 CLI 버전에서 package.json에 alias를 직접
  추가하지 않아 수동으로 `"astryx": "astryx"` 추가함. core 범프 시 init 재실행
  → `react/AGENTS.md` 갱신 → 루트 AGENTS.md 블록 재동기화(RELAXATION 줄 유지).
