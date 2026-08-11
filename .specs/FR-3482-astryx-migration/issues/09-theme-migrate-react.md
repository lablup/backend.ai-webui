# 09 — theme 셰임 대량 적용 — react/src

**Target:** main
**Blocked by:** 03, 06
**Status:** done (2026-08-07)

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** react/src의 theme.useToken() 사용 전체(≈218파일+)를 셰임 import로 codemod 전환. 잔여(토큰 생산자 9파일: darkAlgorithm/getDesignToken)는 스킵 목록 명시.

## Acceptance criteria

- [x] codemod 적용 + tsc 0 + verify.sh ALL PASS — 217파일 1패스 전환(198
      import 분리), 수동 수정 0건, `tsc --noEmit` 0 에러, verify.sh ALL PASS
- [x] 대표 페이지 3종 픽셀 diff 0(시각 하네스) — login `/` +
      route-error `/no-such-route` + change-password `/change-password`,
      라이트/다크 6프레임 전부 **0 px** (단일 브라우저 A/B)
- [x] 잔여 파일 목록과 사유 기록 — 아래 스킵 10파일

## Implementation notes (2026-08-07)

**Applied:** `node scripts/codemods/antd-theme-to-shim.mjs --apply` →
**217파일 전환** (LoginFormPanel은 티켓 03에서 선적용, 합계 218). 198파일은
`import { Button, theme } from 'antd'` 형태라 import 분리. 후처리는 prettier
import 정렬뿐 — **codemod가 수동 수정을 요구한 파일 0건**, tsc 0 에러.
전환 후 `react/src`에서 `theme`을 antd에서 import하는 파일은 아래 스킵
목록 + `theme-shim/themeShim.test.ts`(셰임 자체의 antd parity 테스트,
의도적)뿐임을 grep으로 확인.

**Skipped (10파일, codemod 자동 검출) — 전부 theme-ALGORITHM 표면
(`darkAlgorithm`/`defaultAlgorithm`/`compactAlgorithm`/`getDesignToken`)을
쓰는 토큰 생산자(ConfigProvider 레이어). 셰임은 토큰 소비자용이므로 이들은
ConfigProvider 교체 티켓(24권 프레임 작업)에서 함께 제거된다:**

| 파일 | 사유 |
|---|---|
| `react/src/astryx-theme/backendAiTheme.ts` | 티켓 02 산출물 — `getDesignToken`으로 antd 실측값을 뽑는 쪽 (셰임의 대조 기준) |
| `react/src/components/DefaultProviders.tsx` | ConfigProvider 루트 — `darkAlgorithm` 선택 + `ThemeShimProvider` 마운트 지점 자체 |
| `react/src/components/ReverseThemeProvider.tsx` | 중첩 ConfigProvider(역모드) — 알고리즘 전환 생산자 |
| `react/src/components/ThemeAdminProvider.tsx` | admin 스코프 ConfigProvider 생산자 |
| `react/src/components/ThemeSecondaryProvider.tsx` | secondary 스코프 ConfigProvider 생산자 |
| `react/src/components/BAISider.tsx` | 사이더 전용 ConfigProvider(다크 고정) 생산자 |
| `react/src/components/MainLayout/WebUISider.tsx` | 위 BAISider 조합 + 알고리즘 참조 |
| `react/src/components/ThemeAccentColorPicker.tsx` | `getDesignToken` 기반 팔레트 미리보기 |
| `react/src/components/BrandingSettingItems/ThemeColorPicker.tsx` | `getDesignToken` 기반 브랜딩 설정 |
| `react/src/components/BrandingSettingItems/FontFamilySettingItem.tsx` | `getDesignToken` 기반 브랜딩 설정 |

**Measured (재현: dev 서버 5299 +
`SHOT_DIR=… node .scratch/astryx-migration/shots/measure-09-pixel-ab.mjs`,
스크린샷/로그 `shots/09/`):** measure-03의 단일 브라우저 flag-file 핸드셰이크
방식. before = 셰임 미적용(react/src stash), after = codemod 적용본. 3뷰는
백엔드 없이 도달 가능한 페이지로 선정 — login `/`(스플래시+로그인 카드),
route-error `/no-such-route`(`RouteErrorContent` 전환분), change-password
`/change-password`(`ChangePasswordView` 전환분).

| View | light | dark |
|---|---:|---:|
| login | **0 px** | **0 px** |
| route-error | **0 px** | **0 px** |
| change-password | **0 px** | **0 px** |

콘솔/페이지 에러: before/after 동일 2건(기존 존재 — `-webkit-app-region`
경고, antd Dropdown `overlayStyle` deprecation). 신규 에러 0.

**측정 방법 개선 — 하네스에 warm-up 패스 추가 (후속 시각 게이트 티켓 참고):**
1차 A/B에서 login/light만 11.9% diff가 났는데, diff 이미지가 스플래시 weave
격자+푸터 텍스트(전부 index.html 소유의 비-React 레이어)만 붉게 표시 —
React 콘텐츠(로그인 카드)는 0. 원인은 코드가 아니라 측정: 스왑 직후 첫
로드에서 vite가 217개 모듈을 재변환하느라 로드가 길어지고, 그 동안 weave
CSS 애니메이션 이력이 달라져 레이어 라스터화가 통째로 서브픽셀 이동(티켓
03이 "재기동 간 weave 11.9%"로 기록한 것과 동일 시그니처). 검증: A/A 대조
(스왑 없이 동일 상태 2회 캡처) 6프레임 전부 0 → 하네스 자체는 안정.
measure-09에 **캡처 전 전 뷰 1회 throwaway warm-up 방문**을 추가한 뒤 재실행한
진짜 A/B가 위 표(6×0). 교훈: dev 서버 기반 A/B는 스왑 후 모듈 재변환을
warm-up으로 소진시킨 뒤 측정할 것.

**Deferred:** BUI(`packages/backend.ai-ui`) ~57파일은 티켓 10. 스킵 10파일의
알고리즘 표면 제거는 ConfigProvider 교체(티켓 24권)에서.
