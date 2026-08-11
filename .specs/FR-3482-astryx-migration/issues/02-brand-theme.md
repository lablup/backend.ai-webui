# 02 — 브랜드 테마 패키지

**Target:** main
**Blocked by:** 01
**Status:** done-with-notes

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** Backend.AI 브랜드 테마가 라이트/다크/admin 중첩에서 동작. defineTheme: resources/theme.json 시드, 다크는 antd darkAlgorithm 산출값을 실측 추출해 [light,dark] 튜플 고정(확정 결정), 값차 6종(borderRadiusLG 등)을 tokens 오버라이드로 antd 값에 정렬 — 목표는 현행 외관 근사. AstryxAdminTheme/AstryxSecondaryTheme(mode 명시 상속 어댑터 — 중첩 Theme은 mode 비상속), 테마 name 채번 규칙(패밀리 4종 대비), astryx theme build 프로덕션 경로 + theme.json 런타임 재정의 경로. spike/astryx-pilot의 테마 작업 재사용.

## Acceptance criteria

- [x] 파일럿 페이지에서 브랜드 오렌지 라이트/다크 정확 렌더(computed style) —
      standalone 하네스에서 computed style 20/20 PASS (라이트 rgb(255,122,0) /
      다크 rgb(190,94,6)=#be5e06). in-app probe(/stylex-probe)는 백엔드 클러스터
      부재로 로그인 게이트에 막혀 브라우저 실측은 하네스로 대체 (아래 노트).
- [x] admin 중첩 테마 최근접 우선 + 부모 mode 추종 — computed style 실측:
      중첩 admin #028DF2/#0387bf가 부모 mode를 추종, 형제 스와치는 브랜드 유지
      (무누수), mode 미지정 중첩은 OS(light)로 이탈함을 하네스에서 재현.
- [ ] 현행 화면과 나란히 스크린샷으로 근사 확인 — **유예**: 이 박스에서
      Backend.AI 클러스터 접근 불가라 로그인 이후 화면 비교 불가.
      `shots/02-app-unreachable.png`(현행 antd 로그인, 브랜드 오렌지)와
      `shots/02-brand-{light,dark}.png`(Astryx 하네스)를 참고 비교용으로 남김.
      실제 side-by-side는 페이지 전환 티켓(15+)의 before/after 게이트에서 수행.
- [x] verify.sh ALL PASS (신규 "Astryx theme build" 게이트 포함) +
      `pnpm run build:react-only` PASS

## Implementation notes (2026-08-07)

**Built (all under `react/src/astryx-theme/`):**

- `backendAiTheme.ts` — pure theme module (no React/antd imports; antd 제거 후에도
  생존). `defineTheme(extends: neutralTheme, color:{accent}, tokens:{…})`:
  - **다크 튜플 확정 반영**: `ANTD_DARK_ALGORITHM_OUTPUT` 실측표
    (#DC6B03→#be5e06, #DC4446→#be3d3f, #03A487→#068e76, #009BDD→#0387bf,
    #FAAD14→#d89614). 튜플 = [라이트 시드, 실측 다크 산출값].
  - **값차 6종 정렬** `ANTD_ALIGN_TOKENS`: --radius-element 8px,
    --font-size-lg 16px(fontSizeLG+Heading5), --font-size-4xl 38px,
    --duration-slow 300ms, --shadow-med antd boxShadowSecondary 레시피.
  - 브랜드 소유 status 색(error/success/warning + muted), fontFamily(Ubuntu)
    토큰 오버라이드 포함. info 색은 Astryx에 없음 → admin 중첩 테마가 담당.
  - **name 채번 규칙**: `bai-r{REV}-{family}-{role}-h{hash}` — hash는 CSS에
    영향 주는 시드 전체의 djb2. 동명 defineTheme 선등록 무음 승리 문제를
    이름=내용 함수로 차단, 동일 시드는 캐시로 단일 등록. REV=1.
  - `themeOptionsFromConfig()` — theme.json(antd ThemeConfig 모양) →
    role별(brand=colorPrimary/admin=colorInfo/secondary=colorSuccess) 옵션.
- `built/` — **`astryx theme build` 프로덕션 경로**: `backendai-default.ts`
  (CLI 엔트리) → `backendai-default-built.css` + `bai-r1-…js/.d.ts`(테마명
  파일명, `__built:true`). `built/index.ts`가 안정 재수출 래퍼(리빌드 시 이
  한 줄만 갱신). verify.sh에 `astryx theme build -c` 스테일 게이트 추가,
  래퍼↔아티팩트 정합은 `backendAiTheme.test.ts`가 커버.
- `resolveRoleTheme.ts` — **theme.json 런타임 재정의 경로**: 시드가 기본값과
  일치하면(이름 비교, defineTheme 미호출) built 테마, 다르면 런타임 주입 테마.
- `AstryxBrandTheme.tsx` / `AstryxAdminTheme.tsx` / `AstryxSecondaryTheme.tsx` —
  어댑터. Brand는 `useThemeMode` mode 명시, Admin/Secondary는 Astryx
  `useTheme().mode`(최근접 조상 Theme의 resolved mode, 'system' 불가)를 명시
  재전달 — isParentDark 대응물. 액센트는 `useCustomThemeConfig`(family 병합
  포함) 경유.
- `backendAiTheme.test.ts` — 17 tests (다크 튜플, 정렬 토큰, 채번, built 정합,
  런타임 경로).
- Probe: `AstryxStylexProbePage.tsx`에 BrandThemeProbe 섹션(mode 토글 + 스와치
  id들), `react/theme-probe/`(brand.html/brand.tsx + 전용 vite.config.mts)
  standalone 하네스. 측정 스크립트 `.scratch/astryx-migration/shots/measure-02*.mjs`,
  스크린샷 `02-brand-{light,dark}.png`.

**Measured findings (다음 티켓들이 알아야 할 것):**

1. **`--shadow-med`에 [light,dark] 튜플 금지** — defineTheme이 튜플을
   `light-dark(a, b)`로 직렬화하는데 light-dark()는 색상 전용이라 멀티 섀도
   레시피 튜플은 invalid CSS가 되어 사용처 box-shadow가 무음 사망. 색상
   위치마다 light-dark()를 넣은 **단일 문자열**로 해결 (Astryx 자체 섀도
   기본값과 같은 형태).
2. **테마 name 세그먼트는 숫자로 시작 금지** — `astryx theme build`가 name을
   camelCase export 식별자로 변환하는데 숫자 시작 세그먼트는 invalid JS
   식별자를 생성(CLI 버그). hash에 `h` 접두사로 회피.
3. **앱 dev 서버는 추가 html을 서빙 못함** — `projectRootStaticPlugin`의
   `transformIndexHtml(order:'pre')`이 모든 html을 앱 템플릿으로 대체.
   standalone probe는 `theme-probe/vite.config.mts`(별도 최소 config) 사용.
4. `astryx theme build -o`는 CSS 파일명만 제어, js/d.ts는 테마명 파일명 고정 —
   그래서 `built/index.ts` 래퍼가 필요.
5. 생성 아티팩트는 prettier/eslint 대상 제외 필수(-c 바이트 비교와 충돌):
   `.prettierignore`, `.gitattributes`(linguist-generated), react eslint
   ignores에 `src/astryx-theme/built/bai-r*` 추가됨.

**PILOT-DECISION:**

- **미실측 다크 시드는 verbatim 통과** — 실측표에 없는(운영자 리브랜딩) 다크
  시드는 antd darkAlgorithm(~250 LOC) 재이식 대신 선언값 그대로 사용.
  단순성 정책 준수; 실배포 리포트가 있을 때만 재검토.
- **프리빌드는 기본 브랜드 테마만** — admin/secondary/런타임 오버라이드는
  런타임 주입 유지(리전 스코프라 지연 로드가 구조적, 인스턴스당 ~19KB,
  SSR 없음). built CSS는 현재 유일한 소비자(probe page) 청크에 실림 —
  DefaultProviders 채택 시(티켓 24권) 엔트리로 이동.

**Deferred:**

- 현행 화면 side-by-side (위 3번 크리테리아 — 페이지 전환 티켓의 게이트로 이관).
- 사용자 액센트(custom_primary_color) 런타임 전환은 `useCustomThemeConfig`가
  colorPrimary에 병합해 주므로 경로는 존재하나 전용 실측은 미수행(티켓 13
  파일럿에서 기전 실증됨).
- theme.json families 4종의 Astryx 전환 UI — name 채번/빌더는 준비됨
  (`family` 파라미터), 실제 전환 배선은 후속.
