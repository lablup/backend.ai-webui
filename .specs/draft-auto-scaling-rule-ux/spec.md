# Auto Scaling Rule UX 개선 Spec

## 개요

서비스 디테일 페이지의 Auto Scaling Rule 편집/목록 UI를 개선한다. 비교 연산자 표시 방향을 정규화하고, Scale In / Scale Out / Scale In & Out 세 가지 조건 방향 선택을 추가하며, 백엔드 >=26.4.0에서 Prometheus Query Preset 기반 메트릭 선택을 지원한다.

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
| `minThreshold`만 설정 (Scale In) | `[metric_name] < [minThreshold]` |
| `maxThreshold`만 설정 (Scale Out) | `[maxThreshold] < [metric_name]` |
| 둘 다 설정 (Scale In & Out) | `[metric_name] < [minThreshold]` + `[maxThreshold] < [metric_name]` (두 줄) |

**Legacy API (<26.4.0)**: `comparator` + 단일 `threshold`로 조건을 표현한다.

| 저장된 comparator | 표시 형태 |
|---|---|
| LESS_THAN | `[metric_name] < [threshold]` |
| GREATER_THAN | `[threshold] < [metric_name]` (반전) |

에디터 모달의 비교 연산자 드롭다운은 **Legacy 단일 모드에서만** 표시하며, `<` (LESS_THAN)과 `>` (GREATER_THAN) 두 가지만 제공한다. 스키마에는 `LESS_THAN_OR_EQUAL`, `GREATER_THAN_OR_EQUAL`도 존재하지만, UI에서는 사용하지 않는다.

#### 2. 조건 모드 선택 (Scale In / Scale Out / Scale In & Out)

Auto Scaling Rule 에디터 모달에 Ant Design `Radio.Group` (버튼형) 컴포넌트를 추가하여 세 가지 조건 방향을 선택한다. 비교 연산자는 항상 `<` (strict less than)만 사용하며, `≤` 선택 UI는 제공하지 않는다.

- **Scale In** (`metric < threshold`): `minThreshold`만 설정, `maxThreshold`는 null
  - UI: `Metric < [입력값]`
- **Scale Out** (`threshold < metric`): `maxThreshold`만 설정, `minThreshold`는 null
  - UI: `[입력값] < Metric`
  - 기본 선택값
- **Scale In & Out** (범위): `minThreshold` + `maxThreshold` 동시 설정
  - UI: `Metric < [하한값]` + `[상한값] < Metric` 두 행으로 표시
  - 하한값 >= 상한값이면 validation 에러를 표시

스텝 사이즈 필드의 prefix 기호는 조건 모드에 따라 자동으로 변경된다:
- Scale In: `−` (minus)
- Scale Out: `+` (plus)
- Scale In & Out: `±`

> **참고**: Strawberry API (>=26.4.0) 전용. Legacy (<26.4.0)에서는 `comparator` + 단일 `threshold`를 그대로 사용하며, Scale In & Out(범위) 모드는 지원하지 않는다.

#### 3. Prometheus Preset 기반 메트릭 선택

`baiClient.supports('prometheus-auto-scaling-rule')` (`isSupportPrometheusAutoScalingRule`)로 기능 게이팅한다.

**버전별 metric source 드롭다운 구성:**

| metricSource | `<26.4.0` | `>=26.4.0` | metric name 입력 |
|---|---|---|---|
| `KERNEL` | 표시 | 표시 | AutoComplete (`cpu_util`, `mem`, `net_rx`, `net_tx` + 자유 입력) |
| `INFERENCE_FRAMEWORK` | 표시 | **숨김** | AutoComplete (자유 입력) |
| `PROMETHEUS` | **숨김** | 표시 | preset 선택 시 자동 채움 (숨김 필드) |

`>=26.4.0`에서는 `INFERENCE_FRAMEWORK`가 드롭다운에서 제거되고 `KERNEL` / `PROMETHEUS` 두 가지만 표시된다.

##### Preset 선택 UI 동작

1. metric source 드롭다운에서 `PROMETHEUS` 선택 시 Prometheus Query Preset Select가 추가로 노출
2. Preset 목록은 `prometheusQueryPresets` query로 로드하여 `rank` 오름차순으로 정렬한 뒤, 카테고리가 있는 항목은 `category.name`으로 그룹핑하고, 카테고리 없는 항목은 그룹 뒤에 평탄하게 나열한다
3. Preset 선택 시:
   - `prometheusQueryPresetId`에 선택된 preset의 UUID 저장 (Relay global ID를 디코딩한 raw UUID)
   - `metricName`은 preset의 `metricName`에서 자동으로 채움 (사용자 입력 불필요, 숨김 필드)
   - `timeWindow`가 자동 적용 (preset의 `timeWindow`가 유효한 숫자값이면 적용, null이면 기존값 유지)

##### Rule 목록에서 Prometheus preset 표시

`metricSource`가 `PROMETHEUS`인 rule은 목록에서 metric name 대신 preset 이름을 표시한다. 구현 방식: `prometheusQueryPresets` 쿼리로 전체 preset 목록을 로드한 뒤 `(raw UUID → name)` 맵을 만들고, rule의 `prometheusQueryPresetId`로 이름을 조회한다. 조회 실패 시 `metricName`을 fallback으로 표시한다.

> **참고**: `AutoScalingRule.queryPreset` 필드(>=26.4.3)가 스키마에 존재하지만, 현재 구현에서는 사용하지 않고 별도 쿼리 맵 방식을 사용한다.

##### Rule 수정 시 주의사항

- `updateAutoScalingRule`은 partial update — 변경할 필드만 전달
- `prometheusQueryPresetId: null`은 "미변경"(UNSET) 의미이며, 명시적으로 null로 설정할 수 없음
- `metricSource`를 `KERNEL`로 변경해도 `prometheusQueryPresetId`가 자동 클리어되지 않음 — UI에서 `PROMETHEUS`가 아닐 때 preset 필드를 숨기는 것으로 처리

### 선택 (Nice to Have)

#### 쿼리 결과값 미리보기

Prometheus Preset 모드(>=26.4.0)에서 메트릭 설정 form item의 `extra` 영역에 `prometheusQueryPresetResult` API 호출 결과를 표시한다.

- `timeRange` 없이 instant query로 호출하여 현재 값 1개를 표시
- 로딩 스피너 → 결과값 텍스트 + 새로고침 아이콘 버튼
- `options` 파라미터(`ExecuteQueryDefinitionOptionsInput`)로 `filterLabels: []`, `groupLabels: []`를 고정 전달 (현재 구현은 빈 배열 고정, 동적 레이블 필터링은 미지원)
- range query (시계열 차트)는 이번 범위에 포함하지 않음

## 인수 조건 (Acceptance Criteria)

**공통 (양쪽 모두)**
- [ ] Rules 목록 테이블에서 모든 조건이 `<` 방향으로 통일되어 표시된다

**Legacy (<26.4.0)**
- [ ] GREATER_THAN으로 저장된 Rule은 threshold와 metric_name이 교환되어 `[threshold] < [metric]`로 표시된다
- [ ] 에디터 모달에서 비교 연산자 드롭다운(`<`, `>`)과 단일 threshold 입력이 동작한다
- [ ] 기존 KERNEL/INFERENCE_FRAMEWORK metric source 수동 입력이 동작한다

**Strawberry (>=26.4.0)**
- [ ] 에디터 모달에서 Radio.Group 버튼으로 "Scale In" / "Scale Out" / "Scale In & Out" 세 가지 조건 방향을 선택할 수 있다
- [ ] Scale In 선택 시 `minThreshold`만 설정되고, `Metric < [값]` UI가 표시된다
- [ ] Scale Out 선택 시 `maxThreshold`만 설정되고, `[값] < Metric` UI가 표시된다 (기본값)
- [ ] Scale In & Out 선택 시 `minThreshold` + `maxThreshold`를 동시에 입력하고, 두 행으로 표시된다
- [ ] Scale In & Out 모드에서 하한값 >= 상한값이면 validation 에러가 표시된다
- [ ] Step Size 필드의 prefix가 조건 모드에 따라 `−`/`+`/`±`로 자동 변경된다
- [ ] metric source 드롭다운에 `KERNEL`과 `PROMETHEUS`만 표시된다 (`INFERENCE_FRAMEWORK` 숨김)
- [ ] metric source에 `PROMETHEUS` 선택 시 Prometheus Preset Select가 표시된다
- [ ] Prometheus preset 선택 시 `metricName`이 자동으로 채워진다 (숨김 필드)
- [ ] Prometheus preset 선택 시 `prometheusQueryPresetId` (raw UUID)가 Rule에 저장된다
- [ ] `KERNEL` 선택 시 preset 선택 UI가 숨겨진다
- [ ] Rule 목록에서 `PROMETHEUS` source인 rule은 preset 이름이 표시된다
- [ ] Rule 목록은 `ModelDeployment.autoScalingRules` nested connection으로 조회된다

## 버전 게이팅 전략

| 기능 | <26.4.0 (Legacy) | >=26.4.0 (Strawberry) | >=26.4.3 |
|---|---|---|---|
| 비교 연산자 표시 정규화 | 적용 (LESS_THAN/GREATER_THAN 반전) | 적용 (min/maxThreshold 기반, 항상 `<`) | 동일 |
| 조건 모드 UI | 단일만 지원 (Legacy에 범위 필드 없음) | Radio.Group 3-way: Scale In / Scale Out / Scale In & Out | 동일 |
| Metric Source: INFERENCE_FRAMEWORK | 표시 | 숨김 (`isSupportPrometheusAutoScalingRule`) | 동일 |
| Metric Source: PROMETHEUS | 미표시 | 추가, Preset 기반 Select (카테고리별 그룹핑) | 동일 |
| Step Size prefix | 없음 | `−`/`+`/`±` (조건 모드 연동) | 동일 |
| Rule 목록 preset 이름 표시 | 미표시 | `prometheusQueryPresets` 별도 쿼리 맵 기반 | 동일 (`queryPreset` 필드 미사용) |
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
