# PR 리뷰 마이그레이션 컨텍스트

> 목표: 5933 스택의 리뷰 반영 사항을 5968 스택으로 이전하여 하나의 통합 스택으로 만들기

---

## 1. 5968 스택 (원래 스택) — 이미 APPROVED

이 스택은 이미 모든 리뷰가 반영되어 APPROVED 상태. 아래는 반영된 주요 사항들.

### PR #5968 — feat(FR-2301): diagnostics 스펙
- 리뷰 이슈 없음. APPROVED.

### PR #5969 — feat(FR-2300): category 필드 추가
- [x] CI 실패 (JEST coverage) → 해결됨

### PR #5970 — feat(FR-2300): CSP frame-src 체크
- [x] i18n: 다른 언어 번역 누락 → #5980에서 처리 예정으로 답변
- [x] "Blocked from iframe Embedding" 문구 → "Iframe Embedding"으로 수정

### PR #5971 — refactor(FR-2300): SSL mismatch → configRules 이동
- [x] diagnostic id `ssl-mismatch` → `config-ssl-mismatch`으로 변경, 테스트/호출 코드 업데이트

### PR #5973 — test(FR-2300): configRules 유닛 테스트
- 리뷰 이슈 없음. APPROVED.

### PR #5974 — feat(FR-2300): storage volume threshold
- [x] `parseStorageWarningThreshold`: `Number(raw)` 대신 타입/포맷 검증 강화 (boolean, empty string 거부)
- [x] `DEFAULT_STORAGE_WARNING_THRESHOLD`를 `storageProxyRules.ts`에서 export하여 공유
- [x] 불필요한 `useMemo` 제거 (React Compiler `'use memo'` 디렉티브 사용)

---

## 2. 5933 스택 — E2E 테스트 (FR-2300과 무관, 별도 관리)

### PR #5933 — test(FR-2286): Chat E2E 테스트
| 상태 | 리뷰어 | 피드백 | 반영 내용 |
|------|--------|--------|-----------|
| [x] | nowgnuesLee | `e2e-coverage-report.md` 업데이트 필요 | 확인 필요 |
| [x] | ironAiken2 | 스킵된 테스트의 설명이 부정확 | FIXME 설명 수정 |
| [x] | ironAiken2 | History drawer FIXME 내용이 실제 동작과 불일치 | FIXME 설명 3차 수정 완료 |
| [x] | ironAiken2 | 충돌 해결 필요 | 해결됨 (APPROVED) |
| [x] | Copilot | `request: any` → `APIRequestContext` 타입 사용 | 수정됨 |
| [x] | Copilot | `.ant-card-head-title` History 버튼 셀렉터 | Ant Design 6에서는 정상 동작 확인 |
| [x] | Copilot | `getByRole('row').first()` → hidden measure row 매칭 문제 | `tbody tr.ant-table-row`로 변경 |

### PR #5940 — test(FR-2295): Serving deploy 통합 테스트
| 상태 | 리뷰어 | 피드백 | 반영 내용 |
|------|--------|--------|-----------|
| [x] | ironAiken2 | 로컬에서 모든 케이스 실패 | 라이브 클러스터 필요 설명 |
| [x] | ironAiken2 | restack 필요 | - |
| [x] | ironAiken2 | `E2E-COVERAGE_REPORT.md` 업데이트 필요 | - |
| [x] | ironAiken2 | resource group 설정도 필요 | 명시적 선택으로 수정 |
| [x] | ironAiken2 | 타임아웃 너무 길고 새로고침 반복 문제 | table refresh 버튼 사용으로 변경 |
| [x] | ironAiken2 | 상태 확인에 페이지 새로고침 불필요 | table reload 버튼 사용 |
| [x] | Copilot | 서비스 생성 확인 로직 개선 | `waitForURL` + 테이블 row 확인 |
| [x] | Copilot | 필수 필드 `isVisible().catch()` 패턴 → `expect().toBeVisible()` | fail-fast 패턴으로 수정 |
| [x] | Copilot | terminateService: 상세 페이지 대신 리스트 row delete | 리스트 row 삭제 액션 사용 |
| [x] | Copilot | 서비스 이름 길이 24자 초과 문제 | 6자 랜덤 suffix 사용 |
| [x] | Copilot | beforeAll/afterAll 타임아웃 | 10분/5분으로 설정 |
| [x] | Copilot | 페이지네이션으로 서비스 row 못 찾을 수 있음 | 검색/필터 추가 |
| [x] | Copilot | `waitForTimeout()` → deterministic 대기 | `waitForLoadState('networkidle')` |
| [x] | Copilot | `.ant-select` endpoint 셀렉터 → card-scoped | card-scoped locator 사용 |

---

## 3. 5933 스택의 FR-2300 PR들 — 5968 스택으로 이전 필요

### PR #5975 — feat(FR-2300): CORS diagnostics 체크
> **5968 스택에는 없는 새 기능.** 리뷰 반영 후 5968 스택 #5974 위에 추가 필요.

| 상태 | 리뷰어 | 피드백 | 반영 내용 | 5968 적용 |
|------|--------|--------|-----------|-----------|
| [x] | ironAiken2 | CORS로 차단되면 진단 페이지 자체에 접근 불가할 수 있음 → 검증 필요 | 미해결 (CHANGES_REQUESTED 상태) | **확인 필요** |
| [x] | Copilot | `TypeError`를 CORS 차단으로 잘못 판단 가능 | `no-cors` fallback probe 추가로 구분 | **반영** |
| [x] | Copilot | `'Unknown error'` 하드코딩 → i18n | `undefined`로 변경, i18n 처리 | **반영** |
| [x] | ironAiken2 | 다른 언어 번역 누락 | #5980에서 처리 | **반영** |
| [x] | ironAiken2 | 관련 없는 spec 파일 포함 | 삭제됨 | **반영** |
| [x] | ironAiken2 | `staleTime`을 0으로 → 재진단 시 즉시 최신 데이터 | `staleTime: 0`으로 변경 | **반영** |

### PR #5976 — feat(FR-2300): 통과 결과 숨기기 토글
> **5968 스택에는 없는 새 기능.**

| 상태 | 리뷰어 | 피드백 | 반영 내용 | 5968 적용 |
|------|--------|--------|-----------|-----------|
| [ ] | ironAiken2 | 토글 텍스트를 "Show only failed items"로 변경 제안 | **미반영 — 확인 필요** | **반영 필요** |
| [ ] | ironAiken2 | 토글 활성화 시 내용 없는 섹션은 숨기기 제안 | **미반영 — 확인 필요** | **반영 필요** |

### PR #5977 — feat(FR-2300): 진단 결과 내보내기
> **5968 스택에는 없는 새 기능.**

| 상태 | 리뷰어 | 피드백 | 반영 내용 | 5968 적용 |
|------|--------|--------|-----------|-----------|
| [x] | Copilot | `makeOnResults()` 매 렌더링마다 새 콜백 → 안정적 콜백 | per-section `useCallback` 핸들러로 변경 | **반영** |
| [x] | Copilot | 다운로드 로직 중복 → `downloadBlob` 공유 헬퍼 사용 | `csv-util.ts`의 `downloadBlob` 사용 | **반영** |
| [ ] | ironAiken2 | export 버튼 disabled 대신 클릭 시 메시지 표시 | always enable + handleExport에서 체크 | **반영 필요** |
| [ ] | ironAiken2 | `key`로 강제 refresh 대신 `fetchKey` prop으로 refetch | fetchKey prop 패턴으로 변경 | **반영 필요** |
| [ ] | ironAiken2 | 프로퍼티명 `onResults` → `onResultsChange`로 변경 | 이름 변경됨 | **반영 필요** |
| [ ] | ironAiken2 | `useMemo` 제거 (React Compiler 사용) - useCspDiagnostics | `useMemo` 제거됨 | **반영 필요** |
| [ ] | ironAiken2 | `useMemo` 제거 - useWebServerConfigDiagnostics | `useMemo` 제거됨 | **반영 필요** |
| [ ] | ironAiken2 | `useFetchKey` hook 사용 | `useState(0)` → `useFetchKey()`, fetchKey 타입 `number` → `string` | **반영 필요** |

### PR #5978 — feat(FR-2300): 로그인 후 자동 진단
> **5968 스택에는 없는 새 기능.**

| 상태 | 리뷰어 | 피드백 | 반영 내용 | 5968 적용 |
|------|--------|--------|-----------|-----------|
| [x] | Copilot | `checkSslMismatch` severity `warning`인데 `critical`만 필터링 | `warning`도 포함하도록 수정 | **반영** |
| [x] | Copilot | 알림에 `onClick` 핸들러 없음 | "View Diagnostics" 버튼 추가 + `/diagnostics` 네비게이션 | **반영** |
| [x] | Copilot | `'Unknown error'` 하드코딩 | `undefined`로 변경 | **반영** |
| [x] | Copilot | 빈 `catch {}` 블록들 | 코멘트 추가, early return 처리 | **반영** |
| [ ] | ironAiken2 | MainLayout.tsx 대신 routes.tsx `'/'` 경로에 배치 | routes.tsx로 이동 | **반영 필요** |
| [ ] | ironAiken2 | 기존 진단 hooks 재사용 (별도 API 요청 X) | 기존 hooks 재사용으로 리팩토링 | **반영 필요** |
| [ ] | ironAiken2 | 충돌 해결 필요 | - | **해결 필요** |

### PR #5980 — chore(FR-2300): i18n 번역 (22개 언어)
> **5968 스택에는 없는 새 기능.**

| 상태 | 리뷰어 | 피드백 | 반영 내용 | 5968 적용 |
|------|--------|--------|-----------|-----------|
| [x] | Copilot | 러시아어 문법 오류 "оба" → "обе" | 수정됨 | **반영** |
| [ ] | ironAiken2 | export 파일 포맷 명시 | 툴팁에 JSON 포맷 표시 추가 | **반영 필요** |
| [ ] | ironAiken2 | 충돌 해결 필요 | - | **해결 필요** |

---

## 4. 반영 필요 항목 요약 (5968 스택에 적용할 것)

### 우선순위 높음 (ironAiken2 리뷰 — CHANGES_REQUESTED 원인)

1. **#5975**: CORS 차단 시 진단 페이지 접근 가능 여부 검증
2. **#5975**: `staleTime: 0`으로 변경
3. **#5975**: `no-cors` fallback probe로 CORS vs 네트워크 오류 구분
4. **#5976**: 토글 텍스트 → "Show only failed items" (로그 페이지와 일관성)
5. **#5976**: 토글 시 빈 섹션 숨기기
6. **#5977**: export 버튼 always enable + 클릭 시 메시지
7. **#5977**: `key` 대신 `fetchKey` prop으로 refetch
8. **#5977**: `onResults` → `onResultsChange` 프로퍼티명 변경
9. **#5977**: `useMemo` 제거 (useCspDiagnostics, useWebServerConfigDiagnostics)
10. **#5977**: `useFetchKey` hook 사용, fetchKey 타입 `string`
11. **#5978**: auto-diagnostics를 MainLayout → routes.tsx `'/'` 경로로 이동
12. **#5978**: 기존 진단 hooks 재사용
13. **#5980**: export 파일 포맷(JSON) 툴팁 표시

### 코드 변경 사항 (Copilot 리뷰 반영 완료, 코드 이식 필요)

14. **#5975**: `'Unknown error'` → `undefined` (i18n 처리)
15. **#5975**: 관련 없는 spec 파일 제거
16. **#5977**: `makeOnResults()` → per-section `useCallback` 핸들러
17. **#5977**: 다운로드 로직 → `downloadBlob` 공유 헬퍼 사용
18. **#5978**: `warning` severity 포함하도록 필터 수정
19. **#5978**: "View Diagnostics" 버튼 + 네비게이션
20. **#5978**: 빈 `catch {}` → 코멘트 + early return
21. **#5980**: 러시아어 문법 수정 "оба" → "обе"

### 충돌 해결 필요

22. **#5978**: 충돌 해결
23. **#5980**: 충돌 해결

---

## 5. 이전 작업 순서 (권장)

```
5968 스택 (현재 #5974까지 APPROVED)
 └── Step 1: #5975 코드 + 리뷰 반영 (CORS 체크) 이식
      └── Step 2: #5976 코드 + 리뷰 반영 (토글) 이식
           └── Step 3: #5977 코드 + 리뷰 반영 (내보내기) 이식
                └── Step 4: #5978 코드 + 리뷰 반영 (자동 진단) 이식
                     └── Step 5: #5980 코드 + 리뷰 반영 (i18n) 이식
```

각 Step에서:
1. 5933 스택의 해당 PR 최신 코드 확인
2. 위 체크리스트의 미반영 항목 추가 반영
3. 5968 스택 위에 새 브랜치로 커밋
4. verify.sh 통과 확인
