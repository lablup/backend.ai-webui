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

**Strawberry API (>=26.4.0)**: `comparator` 필드 없이 `minThreshold`/`maxThreshold`로 조건을 표현한다.

| 저장된 상태 | 표시 형태 |
|---|---|
| `maxThreshold`만 설정 (상한) | `[metric_name] < [maxThreshold]` |
| `minThreshold`만 설정 (하한) | `[minThreshold] < [metric_name]` |
| 둘 다 설정 (범위) | `[minThreshold] < [metric_name] < [maxThreshold]` |

**Legacy API (<26.4.0)**: `comparator` + 단일 `threshold`로 조건을 표현한다.

| 저장된 comparator | 표시 형태 |
|---|---|
| LESS_THAN | `[metric_name] < [threshold]` |
| GREATER_THAN | `[threshold] < [metric_name]` (반전) |

에디터 모달의 비교 연산자 드롭다운은 **Legacy 단일 모드에서만** 표시하며, `<` (LESS_THAN)과 `>` (GREATER_THAN) 두 가지만 제공한다. 스키마에는 `LESS_THAN_OR_EQUAL`, `GREATER_THAN_OR_EQUAL`도 존재하지만, UI에서는 사용하지 않는다.

#### 2. 조건 모드 선택 (단일/범위)

Auto Scaling Rule 에디터 모달에 Ant Design `Segmented` 컴포넌트를 추가하여 "단일" / "범위" 모드를 전환한다.

- **단일 모드** (기본): "상한" 또는 "하한" 방향을 선택하고 threshold 값을 입력
  - 상한 (`metric < threshold`): `maxThreshold`만 설정, `minThreshold`는 null
  - 하한 (`threshold < metric`): `minThreshold`만 설정, `maxThreshold`는 null
- **범위 모드**: `[하한값]` ~ `[상한값]` 범위를 지정 (`minThreshold` + `maxThreshold` 동시 사용)
  - 하한값 >= 상한값이면 validation 에러를 표시

> **참고**: Strawberry API (>=26.4.0) 전용. Legacy (<26.4.0)에서는 `comparator` + 단일 `threshold`를 그대로 사용하며, 범위 모드는 지원하지 않는다.

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

- `timeRange` 없이 instant query로 호출하여 현재 값 1개를 표시
- 로딩 스피너 → 결과값 텍스트 + 새로고침 아이콘 버튼
- `options` 파라미터(`ExecuteQueryDefinitionOptionsInput`)로 `filterLabels`/`groupLabels` 전달
- `groupLabels`는 빈 배열 `[]`이라도 반드시 전달해야 함 (생략 시 validation error)
- `filterLabels`의 `key`는 preset의 `options.filterLabels`에 정의된 것만 허용됨
- range query (시계열 차트)는 이번 범위에 포함하지 않음

## 인수 조건 (Acceptance Criteria)

**공통 (양쪽 모두)**
- [ ] Rules 목록 테이블에서 모든 조건이 `<` 방향으로 통일되어 표시된다

**Legacy (<26.4.0)**
- [ ] GREATER_THAN으로 저장된 Rule은 threshold와 metric_name이 교환되어 `[threshold] < [metric]`로 표시된다
- [ ] 에디터 모달에서 비교 연산자 드롭다운(`<`, `>`)과 단일 threshold 입력이 동작한다
- [ ] 기존 KERNEL/INFERENCE_FRAMEWORK metric source 수동 입력이 동작한다

**Strawberry (>=26.4.0)**
- [ ] 에디터 모달에서 Segmented로 "단일"/"범위" 모드를 전환할 수 있다
- [ ] 단일 모드에서 "상한"(`maxThreshold`만) 또는 "하한"(`minThreshold`만) 방향을 선택할 수 있다
- [ ] 범위 모드에서 `minThreshold` + `maxThreshold`를 동시에 입력하고, `[min] < [metric] < [max]`로 표시된다
- [ ] 범위 모드에서 하한값 >= 상한값이면 validation 에러가 표시된다
- [ ] metric source에 `PROMETHEUS` 옵션이 추가되고, 선택 시 Prometheus Preset Select가 표시된다
- [ ] Prometheus preset 선택 시 `metricName`이 자동으로 채워지고, `queryTemplate`이 읽기 전용으로 표시된다
- [ ] Prometheus preset 선택 시 `prometheusQueryPresetId` (raw UUID)가 Rule에 저장된다
- [ ] `KERNEL`/`INFERENCE_FRAMEWORK` 선택 시 preset 선택 UI가 숨겨진다
- [ ] Rule 목록에서 `PROMETHEUS` source인 rule은 preset 이름이 표시된다
- [ ] Rule 목록은 `ModelDeployment.autoScalingRules` nested connection으로 조회된다

## 버전 게이팅 전략

| 기능 | <26.4.0 (Legacy) | >=26.4.0 (Strawberry) | >=26.4.3 |
|---|---|---|---|
| 비교 연산자 표시 정규화 | 적용 (LESS_THAN/GREATER_THAN 반전) | 적용 (min/maxThreshold 기반) | 동일 |
| 조건 모드 (단일/범위) | 단일만 지원 (Legacy에 범위 필드 없음) | 단일 + 범위 모두 지원 | 동일 |
| Metric Source: PROMETHEUS | 미표시 (KERNEL/INFERENCE_FRAMEWORK만) | PROMETHEUS 추가, Preset 기반 Select | 동일 |
| Rule 목록 preset 이름 표시 | 미표시 | `prometheusQueryPresetId` 기반 (별도 query) | `queryPreset` 필드 직접 사용 |
| 쿼리 결과값 미리보기 | 미표시 | 표시 (Nice to Have) | 동일 |

## 구현 전략: 파일 분리

Strawberry API 마이그레이션과 UX 개선을 동시에 진행하므로, 기존 Legacy 기반 컴포넌트를 legacy로 이동하고 새 파일을 정식 이름으로 생성한다.

### 파일 구조

| 파일 | API | 설명 |
|---|---|---|
| `AutoScalingRuleEditorModal.tsx` | Strawberry (>=26.4.0) | **신규**. 범위 모드, Prometheus preset, 정규화 포함 |
| `AutoScalingRuleEditorModalLegacy.tsx` | Legacy (<26.4.0) | **기존 파일 rename**. 비교 연산자 정규화만 적용 |
| `AutoScalingRuleList.tsx` | Strawberry (>=26.4.0) | **신규**. EndpointDetailPage에서 추출. 정규화된 조건 표시, 범위 표시 포함 |
| `AutoScalingRuleListLegacy.tsx` | Legacy (<26.4.0) | **EndpointDetailPage에서 추출**. 비교 연산자 정규화만 적용 |

### 분기 방식

`EndpointDetailPage.tsx`에서 `baiClient.supports('prometheus-auto-scaling-rule')` (또는 대응 키)로 분기:
- **>=26.4.0**: `AutoScalingRuleList` + `AutoScalingRuleEditorModal` (Strawberry query/mutation)
- **<26.4.0**: `AutoScalingRuleListLegacy` + `AutoScalingRuleEditorModalLegacy` (Legacy query/mutation)

### Strawberry 마이그레이션 범위

이 spec에서 함께 처리하는 마이그레이션 항목:
- Query: `endpoint_auto_scaling_rule_nodes(endpoint)` → `ModelDeployment.autoScalingRules` (nested connection)
- Mutation: `create_endpoint_auto_scaling_rule_node` → `createAutoScalingRule`, `modify_endpoint_auto_scaling_rule_node` → `updateAutoScalingRule`, `delete_endpoint_auto_scaling_rule_node` → `deleteAutoScalingRule`
- 필드: snake_case → camelCase, `threshold`+`comparator` → `minThreshold`/`maxThreshold`, `cooldown_seconds` → `timeWindow`, `endpoint` → `modelDeploymentId`

## 참조

### 현재 코드

| 파일 | 설명 |
|---|---|
| `react/src/components/AutoScalingRuleEditorModal.tsx` | 기존 Rule 추가/편집 모달 (Legacy). rename → `AutoScalingRuleEditorModalLegacy.tsx` |
| `react/src/pages/EndpointDetailPage.tsx` | Rules 목록 테이블 (line 697-926), `baiClient.supports('auto-scaling-rule')` (line 170) |

### GraphQL API

#### Auto Scaling Rule (Strawberry, >=26.4.0)

| 쿼리/뮤테이션 | 설명 |
|---|---|
| `ModelDeployment.autoScalingRules(filter, orderBy, ...)` | Rule 목록 조회 — `ModelDeployment` type의 nested connection |
| `createAutoScalingRule(input: CreateAutoScalingRuleInput!)` | Rule 생성 (`modelDeploymentId` 필수) |
| `updateAutoScalingRule(input: UpdateAutoScalingRuleInput!)` | Rule 수정 (partial update) |
| `deleteAutoScalingRule(input: DeleteAutoScalingRuleInput!)` | Rule 삭제 |

#### Prometheus Query Preset (Read only, 모든 인증된 사용자)

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

- Admin Prometheus Query Preset CUD (`adminCreatePrometheusQueryPreset`, `adminModifyPrometheusQueryPreset`, `adminDeletePrometheusQueryPreset`) — 별도 Spec
- Auto Scaling Rule CRUD 자체 (이미 구현됨, 이 spec에서는 Strawberry API로 마이그레이션)
- Legacy 코드 완전 제거 (백엔드 최소 버전 올린 후 별도 진행)
