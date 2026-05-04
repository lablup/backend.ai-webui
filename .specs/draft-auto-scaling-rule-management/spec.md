# Auto Scaling Rule 관리 기능 Spec

## 개요

슈퍼어드민이 Admin Serving 페이지에서 Prometheus Query Preset을 관리할 수 있도록 한다. 현재 Admin Serving 페이지는 엔드포인트 목록만 표시하는 단일 뷰이며, 새로운 "Auto Scaling Rule" 탭을 추가하여 Prometheus Query Preset CRUD 기능을 제공한다.

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
  - **이름** (`name`): 고유 식별자, 유니크 (필수, 텍스트 입력)
  - **설명** (`description`): 사용자에게 표시되는 Preset 설명 (선택 사항)
  - **카테고리** (`categoryId`): Preset을 묶는 그룹 (선택 사항, 드롭다운)
  - **정렬 순서** (`rank`): 드롭다운에서 표시 순서. 낮을수록 위에 표시 (선택 사항, 숫자 입력, 기본값 0)
  - **메트릭 이름** (`metricName`): Prometheus 메트릭 이름 (필수, 텍스트 입력)
  - **쿼리 템플릿** (`queryTemplate`): PromQL 템플릿 문자열 (필수, 텍스트 입력). `{labels}`, `{window}`, `{group_by}` 플레이스홀더 사용 가능
  - **타임 윈도우** (`timeWindow`): 기본 시간 윈도우 (선택 사항, 문자열 입력. 예: `5m`)
  - **필터 레이블** (`options.filterLabels`): PromQL 템플릿의 `{labels}` 플레이스홀더에 대입될 레이블 키 목록 (필수, 빈 배열 허용. 다중 입력)
  - **그룹 레이블** (`options.groupLabels`): PromQL 템플릿의 `{group_by}` 플레이스홀더에 대입될 레이블 키 목록 (필수, 빈 배열 허용. 다중 입력)
- [ ] `adminCreatePrometheusQueryPreset` 뮤테이션 호출
- [ ] 생성 성공 시 목록 자동 갱신

#### Prometheus Query Preset 수정 (Update)

- [ ] 테이블 행의 편집 액션을 통해 기존 Preset 수정 모달 표시
- [ ] 생성과 동일한 입력 필드를 제공하되, 기존 값을 초기값으로 채움
- [ ] 수정 모달에서 쿼리 결과값 미리보기 제공 (아래 "미리보기" 섹션 참조)
- [ ] `adminModifyPrometheusQueryPreset` 뮤테이션 호출 (변경된 필드만 전송)

#### Prometheus Query Preset 미리보기 (Edit 모달 전용)

`prometheusQueryPresetResult` API는 저장된 Preset의 ID를 필요로 하므로 미리보기는 **수정(Edit) 모달에서만** 제공한다. 생성 모달에서는 ID가 없어 미리보기 불가.

- [ ] 수정 모달 상단(또는 쿼리 템플릿 필드 하단)에 "현재 값(Current value):" 레이블 + 결과값 텍스트 + 새로고침 버튼을 표시
- [ ] `prometheusQueryPresetResult(id, options: { filterLabels: [], groupLabels: [] })` instant query로 현재 값 조회
- [ ] 결과값이 단일 시리즈인 경우 최신 값(소수점 둘째자리 반올림)을 표시
- [ ] 결과값이 다중 시리즈인 경우 시리즈 수 및 첫 번째 최신 값을 표시
- [ ] 데이터 없을 경우 "No data available" 표시
- [ ] 새로고침 버튼 클릭 시 최신 결과를 재조회. 초기 로딩 및 재조회 중에는 버튼에 로딩 인디케이터 표시
- [ ] 구현 참조: `AutoScalingRuleEditorModal.tsx`의 `PreviewValue` / `PrometheusPresetPreview` 컴포넌트 패턴을 따름

#### Prometheus Query Preset 삭제 (Delete)

- [ ] 테이블 행의 삭제 액션 제공
- [ ] 삭제 전 확인 다이얼로그 표시
- [ ] `adminDeletePrometheusQueryPreset` 뮤테이션 호출
- [ ] 삭제 성공 시 목록 자동 갱신

### 선택 (Nice to Have)

- [ ] Prometheus Query Preset 목록 테이블에서 정렬 기능 (`QueryDefinitionOrderBy` 활용)
- [ ] 쿼리 템플릿 입력 시 플레이스홀더(`{labels}`, `{window}`, `{group_by}`) 안내 툴팁 또는 가이드 텍스트 제공

## 사용자 스토리

- 슈퍼어드민으로서, Admin Serving 페이지에서 Prometheus Query Preset을 추가하여 조직에서 사용할 Auto Scaling 메트릭 기준을 사전 정의할 수 있다
- 슈퍼어드민으로서, 등록된 Prometheus Query Preset을 수정하거나 삭제하여 메트릭 기준을 관리할 수 있다

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

- [ ] 필수 필드(`name`, `metricName`, `queryTemplate`)가 비어있으면 생성/수정이 불가하다
- [ ] `options.filterLabels`와 `options.groupLabels`는 빈 배열로도 제출 가능하다
- [ ] `description`, `categoryId`, `rank`, `timeWindow`는 선택 사항이다
- [ ] 생성/수정 성공 시 성공 메시지가 표시되고 목록이 갱신된다
- [ ] 오류 발생 시 에러 메시지가 표시된다

### 수정 모달 미리보기

- [ ] 수정 모달에 "현재 값:" 레이블 + 결과값 + 새로고침 버튼이 표시된다
- [ ] 새로고침 버튼 클릭 시 최신 쿼리 결과를 재조회한다
- [ ] 조회 중 버튼에 로딩 인디케이터가 표시된다
- [ ] 결과가 없으면 "No data available"이 표시된다

## GraphQL API 참조

### 쿼리 (모든 인증된 사용자 접근 가능)

| 쿼리 | 설명 |
|---|---|
| `prometheusQueryPresets(filter, orderBy, limit, offset)` | Preset 목록 조회 (오프셋 기반 페이지네이션) |
| `prometheusQueryPreset(id)` | 단일 Preset 조회 |
| `prometheusQueryPresetResult(id, options)` | Preset 기반 instant query 실행 (수정 모달 미리보기용) |

### 뮤테이션 (어드민 전용)

| 뮤테이션 | 설명 |
|---|---|
| `adminCreatePrometheusQueryPreset(input: CreateQueryDefinitionInput!)` | Preset 생성 |
| `adminModifyPrometheusQueryPreset(id: ID!, input: ModifyQueryDefinitionInput!)` | Preset 수정 |
| `adminDeletePrometheusQueryPreset(id: ID!)` | Preset 삭제 |
| `adminCreatePrometheusQueryPresetCategory(input: CreateCategoryInput!)` | 카테고리 생성 (Category CRUD는 이번 범위에서 미구현, 참고용) |
| `adminDeletePrometheusQueryPresetCategory(id: ID!)` | 카테고리 삭제 (동일) |

### 주요 타입

**QueryDefinition** (Preset 엔티티):
- `id`, `name`, `description`, `rank`, `categoryId`, `category` (>=26.4.3), `metricName`, `queryTemplate`, `timeWindow`, `options` (filterLabels, groupLabels), `createdAt`, `updatedAt`

**CreateQueryDefinitionInput**:
- 필수: `name`, `metricName`, `queryTemplate`, `options` (filterLabels `[String!]!`, groupLabels `[String!]!`)
- 선택: `description`, `rank` (기본값 0), `categoryId`, `timeWindow`

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

- Auto Scaling Rule 자체의 CRUD 및 에디터 UX (서비스 디테일 페이지) → `draft-auto-scaling-rule-ux` 스펙에서 다룸
- Prometheus 서버 연결 설정 또는 Prometheus 인프라 관리
- Auto Scaling Rule 실행 이력 조회 및 모니터링 대시보드
- Prometheus Query Preset의 권한별 세분화 (현재는 슈퍼어드민만 CRUD 관리, 조회는 모든 인증된 사용자 가능)
