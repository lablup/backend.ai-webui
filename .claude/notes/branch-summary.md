# Local Branch Summary (2026-02-26)

211개 → 23개로 정리 완료. 188개 삭제됨.

## A. docs-toolkit 스택 (8개) — 현재 작업 중

| 순서 | PR | 설명 |
|---|---|---|
| 1 | [#5643](https://github.com/lablup/backend.ai-webui/pull/5643) | 마크다운→HTML 페이지 변환 코어 (`website-builder.ts`) |
| 2 | [#5644](https://github.com/lablup/backend.ai-webui/pull/5644) | 빌드 오케스트레이터 + CLI `build:web` 명령 |
| 3 | [#5645](https://github.com/lablup/backend.ai-webui/pull/5645) | 이전/다음 페이지 네비게이션 |
| 4 | [#5646](https://github.com/lablup/backend.ai-webui/pull/5646) | "Edit this page" 링크 + 마지막 수정일 |
| 5 | [#5647](https://github.com/lablup/backend.ai-webui/pull/5647) | 다국어 검색 인덱스 생성 |
| 6 | [#5648](https://github.com/lablup/backend.ai-webui/pull/5648) | 클라이언트 사이드 검색 UI |
| 7 | [#5649](https://github.com/lablup/backend.ai-webui/pull/5649) | CSS 공유 스타일시트 + `:lang()` 셀렉터 |
| 8 | [#5650](https://github.com/lablup/backend.ai-webui/pull/5650) | 개발 서버 + npm 스크립트 *(현재 브랜치, 미커밋 변경 있음)* |

## B. 활성 피처 (4개) — 머지 진행 가능

| PR | 설명 | 규모 |
|---|---|---|
| [#5547](https://github.com/lablup/backend.ai-webui/pull/5547) OPEN | 엔드포인트 실시간 메트릭 시각화 (Recharts 차트, `EndpointMetricsPanel`) | 6파일, +373줄 |
| [#5548](https://github.com/lablup/backend.ai-webui/pull/5548) OPEN | `cuda.mem` 메모리 타입 GPU 리소스 지원 | 9파일, +298줄 |
| [#5108](https://github.com/lablup/backend.ai-webui/pull/5108) OPEN | 이미지 매칭 유틸 `findMatchingImage()` 추출 + 테스트 265줄 | 4파일, +403줄 |
| [#5262](https://github.com/lablup/backend.ai-webui/pull/5262) OPEN | `useCurrentProjectValue`에 undefined/null 지원, ~30개 컴포넌트 수정 | 32파일, +273줄 |

## C. 리뷰 필요 (4개)

| PR | 설명 | 상태 | 판단 |
|---|---|---|---|
| [#5249](https://github.com/lablup/backend.ai-webui/pull/5249) **CLOSED** | 리소스 정책 관리 UI 마이그레이션 (`IdleTimeoutChecker` 613줄, 22개 언어 i18n) | 29파일, +1747줄 | PR 닫힘 — 재작업 필요하면 새 브랜치로 |
| [#5227](https://github.com/lablup/backend.ai-webui/pull/5227) OPEN | 서빙 엔드포인트 라이프사이클 E2E 테스트 7개 | 2파일, +471줄 | Draft, 2/4 이후 방치 |
| [#4619](https://github.com/lablup/backend.ai-webui/pull/4619) OPEN | 세션 시작 시 앱 자동 실행 토글 | +72줄 | **미완성** — 실행 로직 없음, 11월 이후 방치 |
| [#5002](https://github.com/lablup/backend.ai-webui/pull/5002) OPEN | 앱 런처 E2E 테스트 7개 스위트 (~4000줄) | 14파일, +3973줄 | 1/20 기준, 리베이스 필요 |

## D. 릴리스 (6개)

| 브랜치 | main 대비 뒤처짐 | 리모트 | 비고 |
|---|---|---|---|
| **26.2** | 147 | 있음 | 현재 릴리스 |
| **25.16** | 434 | 있음 | 안정 릴리스 |
| **25.16+custom** | 434 | 있음 | 커스텀 배포 |
| **25.16+custom2** | 434 | **없음** | 로컬 전용 |
| **25.15** | 484 | 있음 | 핫픽스용 |
| **25.14** | 541 | 있음 | 로컬 카피 삭제 가능 |

## E. main (1개)
