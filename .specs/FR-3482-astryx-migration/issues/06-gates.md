# 06 — 게이트 일체 구축·CI 연결

**Target:** main
**Blocked by:** 01
**Status:** done (2026-08-07)

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 마이그레이션 게이트가 CI에서 정보성으로 가동. antd-zero-gate.sh 반입 + P15 임포트 그래프 리졸버 보강, .ant-* 셀렉터 grep 게이트, P19 var() 미선언 토큰 대조 게이트, 시각 비교 하네스(페이지 before/after 라이트/다크 — 판정 기준은 픽셀 일치가 아니라 레이아웃 해부도+토큰 준수).

## Acceptance criteria

- [x] CI에서 게이트가 돌고 현재 위반을 리포트(정보성, 비차단) — `.github/workflows/astryx-migration-gates.yml` (report.sh는 항상 exit 0, visual job은 continue-on-error)
- [x] 시각 하네스로 파일럿 페이지 비교 1건 산출 — `shots/06/report.md` (form probe: antd Form.Item baseline vs BAIFormItem, light/dark)
- [x] P19 게이트가 기지의 무음 패턴을 실제로 검출함을 테스트로 증명 — `scripts/migration-gates/astryx-token-gate.test.ts` 12건 green (spike 40be82cd1의 3개 패턴 재현 + 실제 Astryx 선언셋 대조)

## Implementation notes

### 산출물

| 파일 | 내용 |
|---|---|
| `scripts/antd-zero-gate.sh` | 최종 게이트 반입(기술 문서화만, 배경 제거). (a) prod 의존 그래프 (b) build/web 시그니처 (c) **신규: P15 소스 임포트 그래프**(`--strict` 호출). 위반 시 exit 1 |
| `scripts/migration-gates/antd-import-graph.mjs` | P15 리졸버: import/export/require 스펙 파싱, 상대경로 + `backend.ai-ui`/`backend.ai-client` alias(tsconfig paths 미러) 해석, 역방향 BFS로 taint 전파. "파일의 임포트 그래프 전체가 antd-free여야 그 파일이 antd-free" |
| `scripts/migration-gates/ant-selector-gate.mjs` | `.ant-[a-zA-Z]` grep — app source(react/src, BUI src) + e2e 섹션 분리. `--counts`(CI 요약용)/`--json`/`--strict` |
| `scripts/migration-gates/astryx-token-gate.mjs` | P19: 사용 `var(--…)` ↔ 선언셋(core astryx.css+reset.css, theme-neutral, built brand theme, 소스 자체 선언) 대조. 중첩 fallback 내부 이름도 검사, JS 주석 제외, 동적 `var(--x-${…})` 별도 리포트, 근접 선언명 제안 |
| `scripts/migration-gates/token-gate.allowlist.json` | 의도적 fallback-default 훅만 허용(현재 `--bai-form-item-*` prefix 1건, 사유 필수) |
| `scripts/migration-gates/astryx-token-gate.test.ts` | 검출 증명 테스트(root vitest, `scripts/**` 포함으로 vitest.yml에서도 돎) |
| `scripts/migration-gates/visual-compare.mjs` | 시각 하네스: `capture`(light/dark 스크린샷 + anatomy.json + tokens.json) / `compare`(report.md/json). 판정: ① 레이아웃 해부도(랜드마크 key 매칭·순서 inversion·톨러런스 초과 이동) ② 토큰 준수(선언 토큰을 페이지 내 probe로 실값 해석 — light-dark()가 custom property 계산값에서 미해석되므로 theme-shim 기법 재사용 — 후 computed color/length 값 소속 검사). 픽셀 일치는 비목표로 명시 |
| `scripts/migration-gates/report.sh` | 정보성 러너: antd-zero-gate + selector(--counts) + token 게이트 실행, `$GITHUB_STEP_SUMMARY` 미러, **항상 exit 0** |
| `.github/workflows/astryx-migration-gates.yml` | push(to-astryx)/PR(base to-astryx)/dispatch. `static-gates` job(report.sh) + `visual-harness` job(continue-on-error: theme-probe vite 기동→before/after 캡처→compare→artifact 업로드+summary) |
| `react/theme-probe/form.tsx` | `?mode=light\|dark` param 추가(Theme mode + 배경 `var(--color-background-surface)`) — 다크 캡처용 |
| `.scratch/astryx-migration/shots/06/` | 산출된 비교 1건: before-antd/, after-bai/ (각 light·dark png+json), report.md/json |

### 현재 위반 실측 (게이트가 리포트하는 것)

- **P15 임포트 그래프**: 879파일 중 direct antd 601, transitive 159(파일 grep이 놓치는 몫), antd-free 119(13.5%). 최대 hub: `packages/backend.ai-ui/src/locale/index.ts`(630파일 오염 — `antd/es/locale` Locale 타입 1건이 원인), BAIFlex(595), helper/index(586)
- **`.ant-*` 셀렉터**: 총 1,040건 (app source + e2e ~570건; e2e는 Phase 4 data-* 전환 대상)
- **P19**: 미선언 8건(BAIModal의 `--general-modal-*` 5종/8사용 + `--ant-color-bg-elevated` — 구 lit 테마 유산, fallback이 항상 승리 중), allowlist 12건(`--bai-form-item-*` 설계상 훅), 동적 2건(theme-shim probe — 이름이 선언셋에서 오므로 안전)
- **prod 그래프**: antd family 63패키지 도달 가능 (@lobehub 경유 포함 — 스크립트 헤더 caveat 참조)

### 시각 하네스 비교 1건 판독 (shots/06/report.md)

form probe, before=antd Form.Item / after=BAIFormItem, light+dark. 두 모드 모두 REVIEW:
- **anatomy**: 52↔52 랜드마크 중 45 매칭, inversion 0. missing/extra 7쌍은 전부 `label:Metric source` ↔ `label:*Metric source` — antd는 required `*`를 ::before 의사요소로, BAIFormItem은 실 텍스트 노드로 렌더(accessible name에 `*` 포함)하는 실제 DOM 차이를 하네스가 포착한 것. moved 2건은 BAI label이 전폭(1374px)으로 늘어나는 box-model 차이
- **token compliance**: light 42.9%→59.1%, dark 38.0%→54.4% — after가 상승(BAIFormItem이 Astryx 토큰 소비). dark에서 before가 낮은 것은 probe에 ConfigProvider darkAlgorithm이 없어 antd 열이 라이트로 남는 "독립 다크 스위치" 프런티어 해저드 그 자체(SKILL.md Verification 절) — 의도된 시연

### 사용법 요약

```bash
bash scripts/migration-gates/report.sh          # 정보성 전체 리포트 (exit 0)
bash scripts/antd-zero-gate.sh                  # 최종 게이트 (현재 FAIL이 정상)
node scripts/migration-gates/antd-import-graph.mjs [--list clean|tainted|direct]
node scripts/migration-gates/ant-selector-gate.mjs [--counts]
node scripts/migration-gates/astryx-token-gate.mjs
node scripts/migration-gates/visual-compare.mjs capture --url <u> --out <dir> \
  [--mode-param mode] [--wait <sel>]
node scripts/migration-gates/visual-compare.mjs compare --before <a> --after <b> \
  --out <dir> [--ignore <key-regex>] [--tolerance <px>]
```

### 주의/후속

- 워크플로는 required-checks ruleset에 **넣지 말 것** (헤더에 명시). 최종 스위치 시점에 `--strict`/antd-zero-gate를 차단형으로 전환
- visual-compare의 토큰 해석 probe는 document.body(루트 테마 스코프)에서 수행 — 중첩 테마 영역의 토큰 값은 루트 기준으로 판정됨(한계, 헤더에 문서화)
- verify.sh는 건드리지 않음(게이트는 분리·정보성) — `=== ALL PASS ===` 확인
- P19 allowlist 추가는 "설계된 fallback-default 훅"만, 오타 무마 금지(allowlist $comment)
