# Auto Scaling Rule 관리 기능 Spec

## 개요

슈퍼어드민이 Admin Serving 페이지에서 Prometheus Query Preset을 관리하고, 일반 사용자가 서비스 디테일 페이지에서 해당 Preset 기반의 메트릭을 선택하여 Auto Scaling Rule을 설정할 수 있도록 한다. 현재 Admin Serving 페이지는 엔드포인트 목록만 표시하는 단일 뷰이며, 새로운 "Auto Scaling Rule" 탭을 추가하여 Prometheus Query Preset CRUD 기능을 제공한다.

## 문제 정의

현재 Auto Scaling Rule 추가 시 메트릭 소스(KERNEL, INFERENCE_FRAMEWORK)와 메트릭 이름을 사용자가 직접 입력해야 한다. Prometheus 쿼리의 복잡성을 사용자에게 노출하지 않으면서도 어드민이 조직에 맞는 커스텀 메트릭 기준을 사전 정의할 수 있는 메커니즘이 필요하다. Prometheus Query Preset을 통해 어드민이 PromQL 템플릿을 미리 등록해두면, 일반 사용자는 해당 Preset의 메트릭 이름만 선택하여 Auto Scaling Rule을 쉽게 설정할 수 있게 된다.

## 요구사항

### 필수 (Must Have)

#### Admin Serving 페이지 탭 구조

- [ ] Admin Serving 페이지(`AdminServingPage.tsx`)에 탭 UI를 추가하여 "Serving" 탭과 "Auto Scaling Rule" 탭으로 분리
- [ ] 기존 엔드포인트 목록은 "Serving" 탭에 그대로 유지
- [ ] "Auto Scaling Rule" 탭에서 Prometheus Query Preset 관리 기능 제공
- [ ] 탭 전환 시 URL query parameter로 현재 탭 상태를 유지 (브라우저 뒤로가기/앞으로가기 대응)

#### Prometheus Query Preset 목록 (Read)

- [ ] "Auto Scaling Rule" 탭에서 등록된 Prometheus Query Preset 목록을 테이블로 표시
- [ ] 테이블 컬럼: Preset 이름(`name`), 메트릭 이름(`metricName`), 쿼리 템플릿(`queryTemplate`), 타임 윈도우(`timeWindow`), 생성일(`createdAt`), 수정일(`updatedAt`)
- [ ] `prometheusQueryPresets` 쿼리를 사용하여 데이터 조회 (모든 인증된 사용자 접근 가능)
- [ ] 페이지네이션 지원 (커서 기반 또는 오프셋 기반)
- [ ] `QueryDefinitionFilter`에서 제공하는 모든 필터 필드를 활용한 검색 기능 (현재 스키마 기준: `name`). 백엔드에 필터 필드가 추가되면 UI에서도 함께 지원

#### Prometheus Query Preset 생성 (Create)

- [ ] "Preset 추가" 버튼 클릭 시 모달을 통해 새 Preset 생성
- [ ] 모달 입력 필드:
  - **이름** (`name`): 고유 식별자 (텍스트 입력)
  - **메트릭 이름** (`metricName`): Prometheus 메트릭 이름 (텍스트 입력)
  - **쿼리 템플릿** (`queryTemplate`): PromQL 템플릿 문자열 (텍스트 입력). `{labels}`, `{window}`, `{group_by}` 플레이스홀더 사용 가능
  - **타임 윈도우** (`timeWindow`): 기본 시간 윈도우 (선택 사항, 텍스트 입력. 예: `5m`)
  - **필터 레이블** (`options.filterLabels`): Prometheus 쿼리의 `{labels}` 플레이스홀더에 들어갈 수 있는 레이블 키 목록. 사용자가 Auto Scaling Rule 설정 시 이 레이블들로 메트릭 범위를 필터링할 수 있다 (다중 입력)
  - **그룹 레이블** (`options.groupLabels`): Prometheus 쿼리의 `{group_by}` 플레이스홀더에 들어갈 수 있는 레이블 키 목록. 결과를 그룹화하는 기준으로 사용된다 (다중 입력)
- [ ] `adminCreatePrometheusQueryPreset` 뮤테이션 호출
- [ ] 생성 성공 시 목록 자동 갱신

#### Prometheus Query Preset 수정 (Update)

- [ ] 테이블 행의 편집 액션을 통해 기존 Preset 수정 모달 표시
- [ ] 생성과 동일한 입력 필드를 제공하되, 기존 값을 초기값으로 채움
- [ ] `adminModifyPrometheusQueryPreset` 뮤테이션 호출 (변경된 필드만 전송)

#### Prometheus Query Preset 삭제 (Delete)

- [ ] 테이블 행의 삭제 액션 제공
- [ ] 삭제 전 확인 다이얼로그 표시
- [ ] `adminDeletePrometheusQueryPreset` 뮤테이션 호출
- [ ] 삭제 성공 시 목록 자동 갱신

#### 서비스 디테일 페이지 - Preset 기반 메트릭 선택

- [ ] 기존 Auto Scaling Rule 추가/편집 모달(`AutoScalingRuleEditorModal`)에서 메트릭 선택 방식 개선
- [ ] 어드민이 등록한 Prometheus Query Preset 목록을 조회하여 메트릭 이름(`metricName`)을 선택 옵션으로 제공
- [ ] 사용자가 Preset의 메트릭 이름을 선택하면, 해당 Preset에 연결된 쿼리 템플릿과 타임 윈도우가 자동으로 적용됨
- [ ] 기존 수동 입력 방식(KERNEL metric source의 `cpu_util`, `mem` 등)도 함께 유지하여 하위 호환성 보장

#### 서비스 디테일 페이지 - 조건 모드 선택 (단일/범위)

- [ ] Auto Scaling Rule 추가/편집 모달에서 조건 설정 영역에 Segmented 컴포넌트를 추가하여 "단일" / "범위 선택" 두 가지 모드를 전환할 수 있도록 함
- [ ] **단일 모드**: 현재 UI와 동일하게 하나의 comparator (`greater_than`, `greater_than_or_equal`, `less_than`, `less_than_or_equal`)와 threshold 값을 입력
- [ ] **범위 선택 모드**: 쿼리 키를 기준으로 상한/하한 범위를 동시에 지정
  - UI 구성: `[하한값] [< 또는 ≤] [쿼리 키] [< 또는 ≤] [상한값]`
  - 왼쪽 비교 연산자: `greater_than` (`<`) 또는 `greater_than_or_equal` (`<=`) — 쿼리 키가 하한값보다 큼
  - 오른쪽 비교 연산자: `less_than` (`<`) 또는 `less_than_or_equal` (`<=`) — 쿼리 키가 상한값보다 작음
  - 각 비교 연산자는 드롭다운 또는 토글로 선택
- [ ] 기본 모드는 "단일"로 설정

#### 서비스 디테일 페이지 - 쿼리 결과값 미리보기

- [ ] Auto Scaling Rule 추가/편집 모달에서 메트릭 설정 form item의 `extra` 영역에 현재 설정 기준의 쿼리 결과값을 미리보기로 표시
- [ ] `prometheusQueryPresetResult` API를 호출하여 결과값을 조회 (모든 인증된 사용자 접근 가능)
- [ ] 쿼리 시 `options` 파라미터(`ExecuteQueryDefinitionOptionsInput`)를 통해 `filterLabels`(키-값 쌍)와 `groupLabels`(키 목록)를 전달하여 실행 시점의 필터/그룹 조건을 지정
- [ ] 표시 상태: 로딩 스피너 → 결과값 텍스트 + 새로고침 아이콘 버튼
- [ ] 새로고침 버튼 클릭 시 최신 결과값을 다시 조회
- [ ] 메트릭 설정(Preset 선택, 조건 등)이 변경되면 결과값을 자동으로 다시 조회하거나, 사용자가 새로고침 버튼으로 수동 조회

### 선택 (Nice to Have)

- [ ] Prometheus Query Preset 목록 테이블에서 정렬 기능 (`QueryDefinitionOrderBy` 활용)
- [ ] 쿼리 템플릿 입력 시 플레이스홀더(`{labels}`, `{window}`, `{group_by}`) 안내 툴팁 또는 가이드 텍스트 제공

## 사용자 스토리

- 슈퍼어드민으로서, Admin Serving 페이지에서 Prometheus Query Preset을 추가하여 조직에서 사용할 Auto Scaling 메트릭 기준을 사전 정의할 수 있다
- 슈퍼어드민으로서, 등록된 Prometheus Query Preset을 수정하거나 삭제하여 메트릭 기준을 관리할 수 있다
- 일반 사용자로서, 서비스 디테일 페이지에서 Auto Scaling Rule을 추가할 때 어드민이 미리 등록한 메트릭 이름을 선택하여 쉽게 규칙을 설정할 수 있다
- 일반 사용자로서, Auto Scaling Rule의 조건을 단일 값 또는 범위로 설정하여 더 유연한 스케일링 기준을 만들 수 있다
- 일반 사용자로서, Auto Scaling Rule 설정 시 현재 쿼리 결과값을 미리보기하여 설정이 올바른지 확인할 수 있다

## 인수 조건 (Acceptance Criteria)

### Admin Serving 페이지

- [ ] Admin Serving 페이지에 "Serving" 탭과 "Auto Scaling Rule" 탭이 표시된다
- [ ] 기본 탭은 "Serving"이다
- [ ] "Auto Scaling Rule" 탭 클릭 시 Prometheus Query Preset 목록이 표시된다
- [ ] Preset 목록에서 이름, 메트릭 이름, 쿼리 템플릿, 타임 윈도우, 생성일, 수정일이 확인 가능하다
- [ ] "Preset 추가" 버튼으로 새 Preset을 생성할 수 있다
- [ ] Preset 행의 편집 액션으로 기존 Preset을 수정할 수 있다
- [ ] Preset 행의 삭제 액션으로 Preset을 삭제할 수 있으며, 삭제 전 확인을 요청한다
- [ ] 슈퍼어드민만 "Auto Scaling Rule" 탭에 접근할 수 있다

### Prometheus Query Preset 모달

- [ ] 모든 필수 필드(`name`, `metricName`, `queryTemplate`, `options.filterLabels`, `options.groupLabels`)가 입력되어야 생성/수정이 가능하다
- [ ] `timeWindow`는 선택 사항이다
- [ ] 생성/수정 성공 시 성공 메시지가 표시되고 목록이 갱신된다
- [ ] 오류 발생 시 에러 메시지가 표시된다

### 서비스 디테일 페이지

- [ ] Auto Scaling Rule 추가 모달에서 어드민이 등록한 Prometheus Query Preset의 메트릭 이름 목록이 선택 옵션으로 표시된다
- [ ] Preset 메트릭 선택 시 관련 설정(타임 윈도우 등)이 자동으로 반영된다
- [ ] 기존 수동 입력 방식도 여전히 동작한다

### 조건 모드 선택 (단일/범위)

- [ ] Segmented 컴포넌트로 "단일" / "범위 선택" 모드를 전환할 수 있다
- [ ] 단일 모드에서는 기존처럼 하나의 comparator와 threshold를 입력한다
- [ ] 범위 선택 모드에서는 `[하한값] [</ ≤] [쿼리 키] [</≤] [상한값]` 형태로 상한/하한 범위를 지정할 수 있다
- [ ] 왼쪽 비교 연산자는 `greater_than`(`<`) 또는 `greater_than_or_equal`(`<=`)이다
- [ ] 오른쪽 비교 연산자는 `less_than`(`<`) 또는 `less_than_or_equal`(`<=`)이다
- [ ] 기본 모드는 "단일"이다

### 쿼리 결과값 미리보기

- [ ] 메트릭 설정 form item 하단(`extra`)에 현재 설정 기준의 쿼리 결과값이 표시된다
- [ ] 결과값 조회 중에는 로딩 스피너가 표시된다
- [ ] 결과값 옆에 새로고침 아이콘 버튼이 있어 수동으로 최신 결과를 다시 조회할 수 있다
- [ ] 모든 인증된 사용자가 `prometheusQueryPresetResult` API를 통해 쿼리 결과를 미리볼 수 있다

## GraphQL API 참조

### 쿼리 (모든 인증된 사용자 접근 가능)

| 쿼리 | 설명 |
|---|---|
| `prometheusQueryPresets(filter, orderBy, limit, offset)` | Preset 목록 조회 (오프셋 기반 페이지네이션) |
| `prometheusQueryPreset(id)` | 단일 Preset 조회 |
| `prometheusQueryPresetResult(id, timeRange, options, timeWindow)` | Preset 기반 쿼리 실행 및 결과 조회 |

### 뮤테이션 (어드민 전용)

| 뮤테이션 | 설명 |
|---|---|
| `adminCreatePrometheusQueryPreset(input: CreateQueryDefinitionInput!)` | Preset 생성 |
| `adminModifyPrometheusQueryPreset(id: ID!, input: ModifyQueryDefinitionInput!)` | Preset 수정 |
| `adminDeletePrometheusQueryPreset(id: ID!)` | Preset 삭제 |

### 주요 타입

**QueryDefinition** (Preset 엔티티):
- `id`, `name`, `metricName`, `queryTemplate`, `timeWindow`, `options` (filterLabels, groupLabels), `createdAt`, `updatedAt`

**ExecuteQueryDefinitionOptionsInput** (쿼리 실행 옵션):
- `filterLabels`: `[MetricLabelEntryInput!]` — 필터링할 레이블 키-값 쌍 목록
- `groupLabels`: `[String!]` — 결과를 그룹화할 레이블 키 목록

**QueryTimeRangeInput** (쿼리 시간 범위):
- Prometheus 쿼리의 시간 범위를 지정

**QueryDefinitionExecuteResult** (쿼리 실행 결과):
- `status`: Prometheus 응답 상태
- `resultType`: 결과 유형 (예: matrix)
- `result`: `[QueryDefinitionMetricResult!]!` — 메트릭 결과 항목 목록

**Seed Presets** (백엔드에서 기본 제공):

| Preset 이름 | 쿼리 템플릿 | 타임 윈도우 |
|---|---|---|
| container_gauge | `sum by ({group_by})(backendai_container_utilization{{{labels}}})` | 없음 (instant) |
| container_rate | `sum by ({group_by})(rate(backendai_container_utilization{{{labels}}}[{window}])) / 5.0` | 5m |
| container_diff | `sum by ({group_by})(rate(backendai_container_utilization{{{labels}}}[{window}]))` | 5m |

**`options.filterLabels`에 사용할 Prometheus 레이블 키 예시**: 메트릭 범위를 필터링하는 레이블 키이며, PromQL 템플릿의 `{labels}` 플레이스홀더에 대입된다.
- `container_metric_name`: 컨테이너 메트릭 종류 (예: cpu_util, mem)
- `kernel_id`, `session_id`, `agent_id`, `user_id`, `project_id`: 각각 커널/세션/에이전트/사용자/프로젝트 단위 필터
- `value_type`: 메트릭 값 유형

**`options.groupLabels`에 사용할 Prometheus 레이블 키 예시**: 결과를 그룹화하는 레이블 키이며, PromQL 템플릿의 `{group_by}` 플레이스홀더에 대입된다.
- `kernel_id`, `session_id`, `agent_id`, `user_id`, `project_id`, `value_type`

## 범위 외 (Out of Scope)

- Auto Scaling Rule 자체의 CRUD (이미 서비스 디테일 페이지에 구현되어 있음) -- 단, Preset 기반 메트릭 선택 연동은 포함
- Prometheus 서버 연결 설정 또는 Prometheus 인프라 관리
- Auto Scaling Rule 실행 이력 조회 및 모니터링 대시보드
- Prometheus Query Preset의 권한별 세분화 (현재는 슈퍼어드민만 CRUD 관리, 조회/실행은 모든 인증된 사용자 가능)
