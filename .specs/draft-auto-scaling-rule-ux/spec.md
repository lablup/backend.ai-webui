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
- **>=26.4.0**: `AutoScalingMetricSource.PROMETHEUS`가 추가됨. Condition 영역에서 metric source로 `PROMETHEUS`를 선택하면, `prometheusQueryPresets` 기반 Select로 preset을 선택할 수 있도록 함. Preset 선택 시 `queryTemplate`과 `timeWindow`가 자동 적용되고, `prometheusQueryPresetId`가 Rule에 저장됨
- **<26.4.0**: 기존 방식 유지 (metric source `KERNEL`/`INFERENCE_FRAMEWORK` 선택 + metric name 수동 입력)

##### Metric Source별 UI 분기 (>=26.4.0 전용)

`<26.4.0`에서는 `KERNEL`/`INFERENCE_FRAMEWORK`만 표시되며, `PROMETHEUS`는 노출하지 않는다.

| metricSource | Preset 선택 UI | prometheusQueryPresetId | metric name |
|---|---|---|---|
| `KERNEL` | 숨김 | `null` | AutoComplete (자동완성 목록: `cpu_util`, `mem`, `net_rx`, `net_tx` + 자유 입력 가능) |
| `INFERENCE_FRAMEWORK` | 숨김 | `null` | AutoComplete (자동완성 목록 없음, 자유 입력) |
| `PROMETHEUS` | 표시 (필수) | 필수 | preset의 `metricName`에서 자동 채움 (입력 불필요) |

##### Preset 선택 UI 동작

1. metric source 드롭다운에서 `PROMETHEUS` 선택 시 Prometheus Query Preset Select가 추가로 노출
2. Preset 목록은 `prometheusQueryPresets` query로 로드하여 카테고리별로 그룹핑(`category.name`)하고 `name`을 드롭다운에 표시
3. Preset 선택 시:
   - `prometheusQueryPresetId`에 선택된 preset의 UUID 저장 (Relay global ID를 디코딩한 raw UUID)
   - `metricName`은 preset의 `metricName`에서 자동으로 채움 (사용자 입력 불필요)
   - `queryTemplate`을 읽기 전용으로 표시하여 사용자가 쿼리 내용 확인 가능
   - `timeWindow`가 자동 적용 (preset의 `timeWindow`가 null이면 사용자 입력)

##### Rule 목록에서 Prometheus preset 표시

`metricSource`가 `PROMETHEUS`인 rule은 목록에서 preset 이름을 표시한다. `AutoScalingRule.queryPreset` 필드(>=26.4.3)를 직접 사용하여 preset 이름과 카테고리를 조회한다. `prometheusQueryPresetId`는 Rule 수정 시 preset select 초기값 복원에만 사용한다.

##### Rule 수정 시 주의사항

- `updateAutoScalingRule`은 partial update — 변경할 필드만 전달
- `prometheusQueryPresetId: null`은 "미변경"(UNSET) 의미이며, 명시적으로 null로 설정할 수 없음
- `metricSource`를 `KERNEL`로 변경해도 `prometheusQueryPresetId`가 자동 클리어되지 않음 — UI에서 `KERNEL`/`INFERENCE_FRAMEWORK`일 때 preset 필드를 숨기는 것으로 처리

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

| 기능 | <26.4.0 (Legacy) | >=26.4.0 (Strawberry) | >=26.4.3 |
|---|---|---|---|
| 비교 연산자 표시 정규화 | 적용 (LESS_THAN/GREATER_THAN 반전) | 적용 (min/maxThreshold 기반) | 동일 |
| 조건 모드 (단일/범위) | 단일만 지원 (Legacy에 범위 필드 없음) | 단일 + 범위 모두 지원 | 동일 |
| Metric Source: PROMETHEUS | 미표시 (KERNEL/INFERENCE_FRAMEWORK만) | PROMETHEUS 추가, Preset 기반 Select | 동일 |
| Rule 목록 preset 이름 표시 | 미표시 | `prometheusQueryPresetId` 기반 (별도 query) | `queryPreset` 필드 직접 사용 |
| 쿼리 결과값 미리보기 | 미표시 | 표시 (Nice to Have) | 동일 |

## 참조

### 현재 코드

| 파일 | 설명 |
|---|---|
| `react/src/components/AutoScalingRuleEditorModal.tsx` | Rule 추가/편집 모달. `COMPARATOR_LABELS` (line 53-58), `METRIC_NAMES_MAP` (line 60-65) |
| `react/src/pages/EndpointDetailPage.tsx` | Rules 목록 테이블 (line 697-926), `baiClient.supports('auto-scaling-rule')` (line 170) |

### GraphQL API (모든 인증된 사용자)

| 쿼리 | 설명 |
|---|---|
| `prometheusQueryPresets(filter, orderBy, limit, offset)` | Preset 목록 조회 (`QueryDefinition.category` 필드로 카테고리 정보 함께 조회 가능) |
| `prometheusQueryPreset(id: ID!)` | Preset 단건 조회 |
| `prometheusQueryPresetResult(id, timeRange, options, timeWindow)` | Preset 기반 쿼리 실행 결과 (Nice to Have) |
| `prometheusQueryPresetCategories(filter, orderBy, ...)` | Preset 카테고리 목록 조회 |
| `prometheusQueryPresetCategory(id: ID!)` | Preset 카테고리 단건 조회 |

### ID 변환 주의사항

- Preset 목록 조회 (`prometheusQueryPresets`) 응답의 `id`는 Relay global ID (base64 인코딩)
- Rule 생성/수정 시 `prometheusQueryPresetId`에는 `toLocalId(globalId)`로 디코딩한 raw UUID를 전달
- Rule 조회 응답의 `prometheusQueryPresetId`는 raw UUID로 반환됨
- `AutoScalingRule.queryPreset` 필드(>=26.4.3)를 사용하면 ID 변환 없이 preset 이름/카테고리 등 정보를 직접 조회 가능
- Rule 수정 시 preset select 초기값 복원은 `prometheusQueryPresetId`와 preset 목록 Relay global ID를 `toLocalId()`로 변환하여 매칭

### 주요 타입 (스키마 기준)

#### AutoScalingMetricComparator (enum)
`LESS_THAN`, `LESS_THAN_OR_EQUAL`, `GREATER_THAN`, `GREATER_THAN_OR_EQUAL`

#### AutoScalingMetricSource (enum)
`KERNEL`, `INFERENCE_FRAMEWORK`, `PROMETHEUS` (PROMETHEUS는 >=26.4.0)

#### AutoScalingRule (type, added 25.19.0)
`id`, `metricSource`, `metricName`, `minThreshold: Decimal`, `maxThreshold: Decimal`, `stepSize`, `timeWindow`, `minReplicas`, `maxReplicas`, `prometheusQueryPresetId: ID` (added 26.4.2), `createdAt`, `lastTriggeredAt`, `queryPreset: QueryDefinition` (added 26.4.3 — preset 객체 직접 resolve)

#### CreateAutoScalingRuleInput
`modelDeploymentId: ID!`, `metricSource: AutoScalingMetricSource!`, `metricName: String!`, `minThreshold: Decimal`, `maxThreshold: Decimal`, `stepSize: Int!`, `timeWindow: Int!`, `minReplicas: Int`, `maxReplicas: Int`, `prometheusQueryPresetId: ID`

#### UpdateAutoScalingRuleInput
`id: ID!`, `metricSource`, `metricName`, `minThreshold`, `maxThreshold`, `stepSize`, `timeWindow`, `minReplicas`, `maxReplicas`, `prometheusQueryPresetId: ID`

#### QueryDefinition (type, added 26.3.0)
`id`, `name`, `description: String`, `rank: Int!`, `categoryId: UUID`, `metricName`, `queryTemplate`, `timeWindow: String`, `options: QueryDefinitionOptions!` (`filterLabels: [String!]!`, `groupLabels: [String!]!`), `createdAt`, `updatedAt`, `category: QueryPresetCategory` (added 26.4.3 — 카테고리 엔티티 직접 resolve)

#### QueryPresetCategory (type, added 26.3.0)
`id: UUID!`, `name: String!`, `description: String`, `createdAt: DateTime!`, `updatedAt: DateTime!`

#### QueryDefinitionExecuteResult (type, added 26.3.0)
`status: String!`, `resultType: String!`, `result: [QueryDefinitionMetricResult!]!`
- **QueryDefinitionMetricResult**: `metric: [MetricLabelEntry!]!`, `values: [QueryDefinitionMetricResultValue!]!`
- **QueryDefinitionMetricResultValue**: `timestamp: Float!`, `value: String!`

#### ExecuteQueryDefinitionOptionsInput
`filterLabels: [MetricLabelEntryInput!]`, `groupLabels: [String!]`

#### QueryTimeRangeInput (added 26.3.0)
`start: DateTime!`, `end: DateTime!`, `step: String!`

## 범위 외 (Out of Scope)

- Admin Serving 페이지 Prometheus Query Preset CRUD (별도 Spec)
- Auto Scaling Rule CRUD 자체 (이미 구현됨)
