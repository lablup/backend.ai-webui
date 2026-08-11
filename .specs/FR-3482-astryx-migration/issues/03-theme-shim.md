# 03 — theme 셰임 반입 (expand)

**Target:** main
**Blocked by:** 01, 02
**Status:** done

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** antd theme.useToken() 시그니처의 드롭인 셰임이 저장소에 들어가고 1개 페이지에서 검증됨. spike/astryx-theme-shim의 640 LOC(실값 반환)를 반입, @ant-design/colors 의존분 ~200 LOC 벤더/대체, codemod(85 LOC)를 툴킷으로 등록. 대량 적용은 티켓 09/10 — 여기서는 expand만.

## Acceptance criteria

- [x] 1개 페이지 셰임 적용 후 픽셀 diff 0 재현 — 로그인 페이지(`LoginFormPanel`,
      24 refs)에 적용, before/after 픽셀 diff **0** (라이트/다크), 미적용
      대조군(route-error)도 0. liveness 대조(마진 토큰 고의 오매핑)로 5.8%
      픽셀 이동 확인 → 셰임이 실제로 렌더를 구동함.
- [x] codemod 스크립트가 툴킷 위치에 등록됨 — `scripts/codemods/antd-theme-to-shim.mjs`
- [x] verify.sh ALL PASS

## Implementation notes (2026-08-07)

**Built:**

- `react/src/theme-shim/` — antd `theme.useToken()` 드롭인 (spike 3e61fdced
  반입 + 티켓 02 결정 반영):
  - `index.tsx` — `buildTokens()` / `ThemeShimProvider` / `useToken()` /
    `theme` 네임스페이스. 반환값은 실값(치수=number, 색=hex/rgba 문자열) —
    `var(--x)` 문자열 불가 사유는 144개 산술/단위접미/hex-surgery 사이트
    (티켓 06 실측).
  - `astryxVars.ts` — 배치 프로브. **spike 대비 개선: 문서 전역 속성 무변조.**
    프로브 호스트 div가 자체 `data-astryx-theme` 스코프 + 인라인
    `color-scheme`을 들고 다녀서 `<html>` 속성을 건드리지 않음 → 셰임
    마운트만으로는 어떤 시각 변화도 불가능. 루트에 진짜 Astryx `<Theme>`가
    마운트되면(티켓 24권) 자동으로 그 cascade를 읽음(호스트 속성 생략).
    `resolveLightDark()` 헬퍼 포함(멀티 섀도 레시피의 모드 해석).
  - `mapping.ts` — 99토큰 판정표. spike의 'drift' 6종은 티켓 02가
    `ANTD_ALIGN_TOKENS`로 antd 값에 고정했으므로 **'aligned' 판정으로 재분류,
    프로브 대신 그 테이블을 직접 소비** (neutral CSS만 로드된 현재도 antd값
    보장, 브랜드 테마 채택 후에도 동일값).
  - **다크 시드/파생 정확화 (spike의 33개 다크 diff 해소):** antd 팔레트 키
    인덱스 간접층(라이트/다크가 다름: dark key5→ramp[6] 등)을 그대로 재현.
    `palette(seed,'dark')(6)`이 darkAlgorithm 시드 변형(#DC6B03→#be5e06)을
    모든 시드에 대해 정확 재현 — 티켓 02 실측표 `ANTD_DARK_ALGORITHM_OUTPUT`
    과 대조 테스트로 검증. colorPrimaryBg 다크 별칭(=Border) 포함.
  - `vendor/antdColors.ts` — **@ant-design/colors 7.2.1 벤더링 (~200 LOC)**:
    `generate()` + preset 라이트/다크 테이블 + FastColor 최소 내부(HSV 왕복,
    mix, hex 포맷; 반올림 지점까지 동일). `themeShim.test.ts`가 설치본과
    비트 동일성 검증(9 tests) — antd 제거 시점에 고정 기대값으로 전환.
  - `themeShim.test.ts` — 벤더 parity + 다크 시드 실측표 + brand/derive 전
    토큰 vs `theme.getDesignToken()` 라이트/다크 일치 + aligned 고정값.
- `scripts/codemods/antd-theme-to-shim.mjs` — 툴킷 등록 (--apply/--only/--list).
  dry-run: 218파일(199 import 분리), 알고리즘 표면 파일 10개 스킵 리포트.
- `DefaultProviders.tsx` — `ThemeShimProvider` 마운트 (BAIConfigProvider 밖,
  mode=isDarkMode, seeds=theme.json 모드별 token + fontFamily + components).
  DOM 무출력·속성 무변조라 시각 불변.
- 적용 1페이지: `LoginFormPanel.tsx` (codemod --only 1회 통과, 수정 0).

**Measured (재현: `.scratch/astryx-migration/shots/measure-03-*.mjs`, 스크린샷
`shots/03/`):**

| View | Mode | 픽셀 diff |
|---|---|---:|
| login (셰임 적용) | light | **0** |
| login | dark | **0** |
| route-error (대조군) | light | **0** |
| route-error | dark | **0** |
| login liveness (marginSM 12→36 고의 오매핑) | light | **75,642 px (5.8%) 이동** |

측정 방법 주의 2건 (다음 시각 게이트 티켓이 알아야 함):
1. **Diagonal Weave 스플래시 배경은 CSS 무한 애니메이션** — 프레임마다
   `animation/transition: none !important` 주입으로 동결해야 함.
2. **픽셀 diff는 같은 브라우저 프로세스 안에서만 0이 됨** — chromium 재기동
   간에는 동일 코드도 서브픽셀 라스터라이즈 차이(weave 11.9% 등)가 남.
   measure-03-pixel-ab.mjs가 flag-file 핸드셰이크로 단일 브라우저에서
   before/after를 이어 찍는 이유.

**PILOT-DECISION:**

- 셰임 프로브의 폴백 스코프는 `neutral` 고정 (built 브랜드 테마 스코프를
  문서에 여는 것은 그 prose/@scope 규칙을 전역 활성화하므로 티켓 24의
  루트 Theme 채택과 함께 가는 것이 맞음). 6개 값차 토큰은 aligned 경로로
  이미 antd값이라 손실 없음.
- `motionDurationSlow`는 antd 포맷('0.3s')으로 정규화해 반환 (ANTD_ALIGN_TOKENS
  의 '300ms'와 동일 시간).

**Deferred:**

- 대량 적용(잔여 217파일 + BUI ~57파일)은 티켓 09/10.
- BUI 공유를 위한 셰임의 `packages/backend.ai-ui/` 이전 검토(티켓 06 답변
  §9-3)는 BUI 재편 티켓에서.
