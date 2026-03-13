# PR 스택 비교: #5968 vs #5933

## 요약

두 스택 모두 **FR-2300 (Diagnostics 시스템 개선)** 관련 작업을 포함하지만, 어느 시점에서 분기되어 별도 스택으로 발전했습니다.

- **5968 스택**: 원래 스택. Diagnostics 기반 작업 (스펙, 카테고리, CSP, SSL 리팩토링, 테스트, 스토리지). **모두 APPROVED**.
- **5933 스택**: 분기된 스택. E2E 테스트 + Diagnostics 후속 기능 (CORS, 토글, 내보내기, 자동진단, i18n). **대부분 CHANGES_REQUESTED** (리뷰 활발).

---

## 5968 스택 (원래 스택) — 6개 PR, 모두 APPROVED

| 순서 | PR # | 제목 | Base | 리뷰 상태 |
|------|------|------|------|-----------|
| 1 | [#5968](https://github.com/lablup/backend.ai-webui/pull/5968) | feat(FR-2301): add diagnostics system enhancement feature spec | `main` | APPROVED |
| 2 | [#5969](https://github.com/lablup/backend.ai-webui/pull/5969) | feat(FR-2300): add category field to DiagnosticResult type | #5968 | APPROVED |
| 3 | [#5970](https://github.com/lablup/backend.ai-webui/pull/5970) | feat(FR-2300): add CSP frame-src diagnostic check | #5969 | APPROVED |
| 4 | [#5971](https://github.com/lablup/backend.ai-webui/pull/5971) | refactor(FR-2300): move checkSslMismatch to configRules | #5970 | APPROVED |
| 5 | [#5973](https://github.com/lablup/backend.ai-webui/pull/5973) | test(FR-2300): add comprehensive configRules unit tests | graphite-base/5973 | APPROVED |
| 6 | [#5974](https://github.com/lablup/backend.ai-webui/pull/5974) | feat(FR-2300): add configurable storage volume threshold | #5973 | APPROVED |

### 스택 체인
```
main
 └── #5968 (FR-2301 스펙)
      └── #5969 (카테고리 필드)
           └── #5970 (CSP frame-src 체크)
                └── #5971 (SSL mismatch → configRules 리팩토링)
                     └── #5973 (configRules 유닛 테스트)
                          └── #5974 (스토리지 볼륨 threshold)
```

---

## 5933 스택 (분기 스택) — 7개 PR, 대부분 CHANGES_REQUESTED

| 순서 | PR # | 제목 | Base | 리뷰 상태 |
|------|------|------|------|-----------|
| 1 | [#5933](https://github.com/lablup/backend.ai-webui/pull/5933) | test(FR-2286): add E2E tests for chat service with mock model service | `main` | CHANGES_REQUESTED |
| 2a | [#5940](https://github.com/lablup/backend.ai-webui/pull/5940) | test(FR-2295): add serving deploy lifecycle integration test | #5933 | CHANGES_REQUESTED |
| 2b | [#5975](https://github.com/lablup/backend.ai-webui/pull/5975) | feat(FR-2300): add CORS diagnostics check | #5933 | CHANGES_REQUESTED |
| 3 | [#5976](https://github.com/lablup/backend.ai-webui/pull/5976) | feat(FR-2300): add toggle to hide passed diagnostics results | #5975 | CHANGES_REQUESTED |
| 4 | [#5977](https://github.com/lablup/backend.ai-webui/pull/5977) | feat(FR-2300): add diagnostics result export | #5976 | CHANGES_REQUESTED |
| 5 | [#5978](https://github.com/lablup/backend.ai-webui/pull/5978) | feat(FR-2300): add auto-diagnostics notification after login | #5977 | CHANGES_REQUESTED |
| 6 | [#5980](https://github.com/lablup/backend.ai-webui/pull/5980) | chore(FR-2300): add i18n translations for diagnostics keys across all languages | #5978 | CHANGES_REQUESTED |

### 스택 체인
```
main
 └── #5933 (E2E chat 테스트)
      ├── #5940 (서빙 배포 통합 테스트) ← 별도 분기
      └── #5975 (CORS 진단 체크) ← FR-2300 후속
           └── #5976 (통과 결과 숨기기 토글)
                └── #5977 (진단 결과 내보내기)
                     └── #5978 (로그인 후 자동 진단)
                          └── #5980 (i18n 번역 키)
```

---

## 주요 리뷰어

| 리뷰어 | 5968 스택 | 5933 스택 |
|--------|-----------|-----------|
| ironAiken2 | 모든 PR APPROVED | 대부분 CHANGES_REQUESTED |
| agatha197 | COMMENTED | COMMENTED (활발한 코멘트) |
| nowgnuesLee | - | #5933에 CHANGES_REQUESTED |

---

## FR-2300 관련 PR 전체 흐름 (두 스택 합산)

5968 스택의 FR-2300 PR들이 **기반 작업** (스펙, 타입, 리팩토링, 테스트)이고,
5933 스택의 FR-2300 PR들이 **기능 구현** (CORS, 토글, 내보내기, 자동진단, i18n)입니다.

### 이상적인 통합 순서
```
main
 └── #5968 (FR-2301 스펙)
      └── #5969 (카테고리 필드)
           └── #5970 (CSP frame-src 체크)
                └── #5971 (SSL → configRules 리팩토링)
                     └── #5973 (configRules 유닛 테스트)
                          └── #5974 (스토리지 볼륨 threshold)
                               └── #5975 (CORS 진단 체크) ← 5933에서 이동
                                    └── #5976 (통과 결과 숨기기)
                                         └── #5977 (결과 내보내기)
                                              └── #5978 (자동 진단)
                                                   └── #5980 (i18n 번역)
```

별도 관리 필요:
- **#5933**: E2E chat 테스트 (FR-2286) — FR-2300과 무관, 독립 PR로 분리 가능
- **#5940**: 서빙 배포 통합 테스트 (FR-2295) — FR-2300과 무관, 독립 PR로 분리 가능
