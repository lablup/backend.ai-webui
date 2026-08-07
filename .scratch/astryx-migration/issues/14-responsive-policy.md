# 14 — Row/Col 반응형 방침 확정 + 레시피

**Target:** to-astryx
**Blocked by:** 08
**Status:** done-with-notes — **방침은 PROVISIONAL(사용자 재가 대기)**

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 열린 결정 #5 확정 포함(사용자와 논의): 79개 브레이크포인트 지점의 전역 방침 — useBAIBreakpoint 유지 vs Grid minWidth 모델. 확정 후 전환 레시피 문서 + 대표 사례 3건 실전환.

## Acceptance criteria

- [x] 방침이 기록됨 — **PROVISIONAL — pending user ratification** (사용자 부재로
      세션이 증거 기반으로 잠정 확정; 근거·기각 대안·flip cost 전부
      `../RESPONSIVE-POLICY.md`에 기록. 사용자 재가 시 §Status 한 줄만 갱신,
      번복 시 flip cost 절 참조)
- [x] 레시피 문서 + 실전환 3건 스크린샷
- [x] verify.sh ALL PASS (`=== ALL PASS ===`, 2026-08-07)

## Implementation notes

### 결정 (PROVISIONAL): 하이브리드, CSS 우선

1. **트랙 레이아웃 반응형** (Row/Col 브레이크포인트 prop 전부) → Astryx
   `Grid columns={{minWidth, max?}}` — 컨테이너 기준 CSS 모델.
2. **JS 동작 분기** (`Grid.useBreakpoint()` 18파일) → `useBAIBreakpoint()`
   import 교체 (티켓 08 갭 컴포넌트).
3. **`token.screen*` px 상수** (3지점) → `BAI_BREAKPOINTS.<step>`
   (단, screenXS=480은 대응 없음 — 레시피 R4 참조).

핵심 근거: 반응형 Col prop을 가진 13파일 중 9개가 **모달/카드 내부** —
viewport 기준 antd 스팬은 참조 프레임 자체가 틀렸고, 컨테이너 기준 minWidth가
구조적으로 더 옳다. Astryx에는 브레이크포인트 체계가 아예 없어(MAPPING §3.9
verdict NONE) JS 에뮬레이션은 §0 단순성 정책 위반(영구 antd-parity 셰임).
반면 렌더 트리 분기 18곳은 CSS로 표현 불가 + Astryx `useMediaQuery`는 첫
렌더 false(플래시)라 useBAIBreakpoint 유지가 유일한 무결점 경로. 전문:
`../RESPONSIVE-POLICY.md` §2 (기각 대안·flip cost 포함).

### 실측 census (2026-08-07, 이 워크트리)

- Col 브레이크포인트 prop **89개** (xs36 sm22 lg9 md8 xl8 xxl4 xxxl2) / 13파일
- `<Col>` 72 / `<Row>` 32 / gutter 25 — `offset`/`push`/`pull` 0
- `Grid.useBreakpoint()` 18파일, `token.screenXS/SM` 상수 3지점
- antd v6 `xxxl`(2000px) 2지점 — 둘 다 카드 그리드라 minWidth 모델에 흡수

### 레시피 문서 위치

**`.scratch/astryx-migration/RESPONSIVE-POLICY.md`** (이 트래커 옆) — 페이지
티켓 15–24는 브레이크포인트 지점을 만나면 이 문서의 R1–R5를 적용.

### 실전환 3건 (다양성: 그리드 / JS 분기 / 상수)

| Pilot | 파일 | 패턴 | 결과 |
|---|---|---|---|
| A | `react/src/components/LightDarkColorPicker.tsx` | `Row gutter={[16,4]}` + `Col xl={6} lg={24}` → `Grid columns={{minWidth:300, max:4}} columnGap={4} rowGap={1}` | 1400px에서 antd xl={6} 트랙 폭 재현(≈수px 오차), 500px에서 세로 스택. antd의 992–1199 구간에서만 스택되고 그 아래에선 비좁게 나란하던 비일관 거동은 컨테이너 기준으로 정규화(의도된 레이아웃 판단, R1 명시) |
| B | `react/src/components/BAIContentWithDrawerArea.tsx` | `Grid.useBreakpoint()` → `useBAIBreakpoint()` | xl 게이트(1200px)의 margin-style/overlay-style 분기 before/after 픽셀 동일 |
| C | `react/src/components/KeypairResourcePolicyInfoModal.tsx` | `width={token.screenSM}` → `width={BAI_BREAKPOINTS.sm}` (+ 미사용 useToken 제거) | 576px 모달 폭 동일 |

스크린샷: `.scratch/astryx-migration/shots/14/{before,after}-{picker,drawer,modal}-*.png`
(picker 1400/1100/900/500 · drawer 1400/1000 · modal 900).

### 이 티켓에서 함께 반입된 공유 인프라

- theme-shim 공개 표면에 브레이크포인트 export 추가:
  `packages/backend.ai-ui/src/theme-shim/index.tsx` + `react/src/theme-shim/index.tsx`
  (`useBAIBreakpoint`·`useBAIActiveBreakpoint`·`BAI_BREAKPOINTS`·`BAI_BREAKPOINT_KEYS`·
  `BAI_BREAKPOINT_QUERIES`·타입 2종) — 18개 호출 지점의 import 교체 경로.
- 프로브 하니스 확장: `react/theme-probe/responsive.html`/`responsive.tsx`
  (실컴포넌트 3종 마운트), `theme-probe/vite.config.mts`에 react/src 대상
  babel-plugin-relay + `define: {global}` 추가 — Relay fragment 컴포넌트를
  `relay-test-utils` mock env로 프로브에서 렌더 가능해짐 (이후 티켓 재사용).

### 유의 사항

- 사용자 재가 전까지 페이지 티켓들이 R1을 적용해도 안전: flip 시 diff에 원본
  스팬이 남아 기계적 역변환 가능 (RESPONSIVE-POLICY §5).
- MIGRATION-SPEC §7 열린 결정 #5는 스펙 파일이 워크트리 밖이라 이 세션에서
  건드리지 않음 — 재가 시점에 스펙 표를 갱신할 것.
