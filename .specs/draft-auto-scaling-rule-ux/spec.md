# Auto Scaling Rule UX 개선 Spec

## 개요

서비스 디테일 페이지의 Auto Scaling Rule 편집/목록 UI를 개선한다. 비교 연산자 표시 방향을 정규화하고, 단일/범위 조건 모드를 추가하며, 백엔드 >=26.4.0에서 Prometheus Query Preset 기반 메트릭 선택을 지원한다.

## 문제 정의

1. **규칙 목록에서 비교 연산자 방향이 혼재**: `>`, `<`가 섞여 표시되어 한눈에 조건을 파악하기 어렵다
2. **범위 조건 미지원**: 백엔드 API에 `minThreshold`/`maxThreshold` 필드가 이미 존재하지만, UI에서 범위 입력을 지원하지 않는다
3. **메트릭 선택이 수동 입력 의존**: Prometheus Query Preset이 등록되어 있어도 활용할 수 없다

## 요구사항

### 필수 (Must Have)

#### 1. 규칙 목록 테이블 비교 연산자 표시 정규화

`EndpointDetailPage`의 Auto Scaling Rules 테이블에서 조건을 항상 `<` 방향으로 표시한다.

| 저장된 comparator | 표시 형태 |
|---|---|
| LESS_THAN | `[metric_name] < [threshold]` |
| GREATER_THAN | `[threshold] < [metric_name]` (반전) |
| 범위 (minThreshold + maxThreshold) | `[minThreshold] < [metric_name] < [maxThreshold]` |

에디터 모달의 비교 연산자 드롭다운은 **단일 모드에서만** 표시하며, `<` (LESS_THAN)과 `>` (GREATER_THAN) 두 가지만 제공한다. 범위 모드에서는 드롭다운 없이 `<`로 고정된다.

#### 2. 조건 모드 선택 (단일/범위)

Auto Scaling Rule 에디터 모달에 Ant Design `Segmented` 컴포넌트를 추가하여 "단일" / "범위" 모드를 전환한다.

- **단일 모드** (기본): 비교 연산자(`<`, `>`) 하나와 threshold 값을 입력
- **범위 모드**: `[하한값]` ~ `[상한값]` 범위를 지정 (`minThreshold`/`maxThreshold` 사용). 비교 연산자는 `<`로 고정 (드롭다운 미표시)
  - 하한값 >= 상한값이면 validation 에러를 표시

#### 3. Prometheus Preset 기반 메트릭 선택

- `baiClient.supports('prometheus-auto-scaling-rule')` (또는 >=26.4.0 대응 키)로 기능 게이팅
- **>=26.4.0**: 새로운 metric source가 추가될 예정. Condition 영역에서 `prometheusQueryPresets` 기반 Select로 metric name을 선택할 수 있도록 함. Preset 선택 시 `queryTemplate`과 `timeWindow`가 자동 적용
- **<26.4.0**: 기존 방식 유지 (metric source 선택 + metric name 수동 입력)
- **TODO(needs-backend)**: 새로운 metric source의 구체적인 enum 값과 동작은 백엔드 PR 머지 후 확정

### 선택 (Nice to Have)

#### 쿼리 결과값 미리보기

Prometheus Preset 모드(>=26.4.0)에서 메트릭 설정 form item의 `extra` 영역에 `prometheusQueryPresetResult` API 호출 결과를 표시한다.

- 로딩 스피너 → 결과값 텍스트 + 새로고침 아이콘 버튼
- `options` 파라미터(`ExecuteQueryDefinitionOptionsInput`)로 `filterLabels`/`groupLabels` 전달

## 인수 조건 (Acceptance Criteria)

- [ ] Rules 목록 테이블에서 모든 조건이 `<` 방향으로 통일되어 표시된다
- [ ] GREATER_THAN으로 저장된 Rule은 threshold와 metric_name이 교환되어 표시된다
- [ ] 범위 Rule(minThreshold + maxThreshold)은 `[min] < [metric] < [max]` 형태로 표시된다
- [ ] 에디터 모달의 비교 연산자 드롭다운은 단일 모드에서만 표시되며, `<`와 `>`만 제공된다
- [ ] 범위 모드에서는 비교 연산자가 `<`로 고정되고 드롭다운이 표시되지 않는다
- [ ] 에디터 모달에서 Segmented로 "단일"/"범위" 모드를 전환할 수 있다
- [ ] 범위 모드에서 하한값 >= 상한값이면 validation 에러가 표시된다
- [ ] 범위 모드는 `minThreshold`/`maxThreshold` 필드를 사용하여 하나의 Rule로 저장된다
- [ ] >=26.4.0에서 Condition 영역에 Prometheus Preset 기반 metric name Select가 표시되고, 선택 시 queryTemplate/timeWindow가 자동 반영된다
- [ ] <26.4.0에서는 기존 KERNEL/INFERENCE_FRAMEWORK 수동 입력이 동작한다

## 버전 게이팅 전략

| 기능 | <26.4.0 | >=26.4.0 |
|---|---|---|
| 비교 연산자 목록 정규화 | 적용 | 적용 |
| 조건 모드 (단일/범위) | 적용 | 적용 |
| Prometheus Preset 메트릭 선택 | 기존 수동 입력 유지 | Preset 기반 Select |
| 쿼리 결과값 미리보기 | 미표시 | 표시 (Nice to Have) |

## 참조

### 현재 코드

| 파일 | 설명 |
|---|---|
| `react/src/components/AutoScalingRuleEditorModal.tsx` | Rule 추가/편집 모달. `COMPARATOR_LABELS` (line 53-58), `METRIC_NAMES_MAP` (line 60-65) |
| `react/src/pages/EndpointDetailPage.tsx` | Rules 목록 테이블 (line 697-926), `baiClient.supports('auto-scaling-rule')` (line 170) |

### GraphQL API (모든 인증된 사용자)

| 쿼리 | 설명 |
|---|---|
| `prometheusQueryPresets(filter, orderBy, limit, offset)` | Preset 목록 조회 |
| `prometheusQueryPresetResult(id, timeRange, options, timeWindow)` | Preset 기반 쿼리 실행 결과 조회 |

### 주요 타입

- **QueryDefinition**: `id`, `name`, `metricName`, `queryTemplate`, `timeWindow`, `options`(`filterLabels`, `groupLabels`)
- **ExecuteQueryDefinitionOptionsInput**: `filterLabels`(`[MetricLabelEntryInput!]`), `groupLabels`(`[String!]`)
- **CreateAutoScalingRuleInput**: `metricSource`, `metricName`, `minThreshold`, `maxThreshold`, `stepSize`, `timeWindow`, `minReplicas`, `maxReplicas`

## 범위 외 (Out of Scope)

- Admin Serving 페이지 Prometheus Query Preset CRUD (별도 Spec)
- Auto Scaling Rule CRUD 자체 (이미 구현됨)
- `metric_source` 필드의 백엔드 변경 대응 (TODO, 백엔드 PR 머지 후 처리)
