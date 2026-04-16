# Model Definition GraphQL 활용 개선

**Epic**: [FR-2588](https://lablup.atlassian.net/browse/FR-2588)

## 개요

모델 서비스 상세 페이지(EndpointDetailPage)에 현재 리비전의 model definition 정보를 표시하고, 
custom 런타임 편집 시 vfolder 파일 파싱 대신 GraphQL `currentRevision.modelDefinition` 쿼리를 
사용하도록 개선한다. 또한 편집(Update) 시 model-definition.yaml 덮어쓰기 전 확인 모달을 추가한다.

## 문제 정의

1. **Model Definition 정보 미표시**: 모델 서비스 상세 페이지의 Service Info 카드에 현재 배포된 
   model definition 정보(모델명, 모델 경로, 서비스 설정)가 표시되지 않아, 운영자가 현재 서비스의 
   구성을 확인하려면 별도로 vfolder 파일을 직접 열어봐야 한다.

2. **vfolder 파일 파싱 의존성**: custom 런타임 편집 모드에서 기존 설정값을 로드할 때 vfolder의 
   model-definition.yaml 파일을 직접 다운로드하여 YAML 파싱하는 방식을 사용한다. 이는 불필요한 
   네트워크 요청이며, 서버가 이미 `currentRevision.modelDefinition`으로 정규화된 데이터를 
   제공하므로 GraphQL 쿼리를 활용하는 것이 더 안정적이다.

3. **Update 시 덮어쓰기 경고 미표시**: 서비스 생성(Create) 시에는 기존 model-definition.yaml이 
   있으면 덮어쓰기 확인 모달(`modal.confirm`)이 표시되지만, 편집(Update) 시에는 확인 없이 
   즉시 파일을 덮어쓴다. 의도치 않은 설정 변경을 방지해야 한다.

## 현재 상태 (As-Is)

### EndpointDetailPage Service Info
- 파일: `react/src/pages/EndpointDetailPage.tsx`
- `Descriptions` 컴포넌트의 `items` 배열에 서비스 이름, 상태, 런타임 변형, 엔드포인트 등이 표시됨
- `currentRevision.modelDefinition` 관련 정보는 표시되지 않음
- GraphQL 쿼리에 `deploymentId` 변수가 이미 존재하며 `toGlobalId('ModelDeployment', serviceId)` 패턴으로 deployment를 조회 가능

### Custom 런타임 편집 모드 데이터 로드
- 파일: `react/src/components/ServiceLauncherPageContent.tsx`
- `loadModelDefinitionForEdit` 함수가 vfolder에서 model-definition.yaml을 다운로드
- `baiClient.vfolder.request_download_token` → `fetch(downloadUrl)` → YAML 파싱 → form 필드 설정
- YAML 파싱 실패 시 기본값 유지

### Update 시 덮어쓰기 흐름
- 파일: `react/src/components/ServiceLauncherPageContent.tsx`
- 편집 모드에서 command 모드일 때 즉시 업로드 (확인 없음)
- 생성 모드에만 `modal.confirm`으로 덮어쓰기 확인이 있음

## GraphQL 스키마 참조

```graphql
type ModelDeployment implements Node {
  id: ID!
  currentRevision: ModelRevision
}

type ModelRevision implements Node {
  modelDefinition: ModelDefinition
}

type ModelDefinition {
  models: [ModelConfig!]!
}

type ModelConfig {
  name: String!
  modelPath: String!
  service: ModelServiceConfig
  metadata: ModelMetadata
}

type ModelServiceConfig {
  preStartActions: [PreStartAction!]!
  startCommand: JSON!
  shell: String!
  port: Int!
  healthCheck: ModelHealthCheck
}

type ModelHealthCheck {
  interval: Float!
  path: String!
  maxRetries: Int!
  maxWaitTime: Float!
  expectedStatusCode: Int!
  initialDelay: Float!
}
```

## 요구사항

### 필수 (Must Have)

#### 1. EndpointDetailPage에 Model Definition 정보 표시
- [ ] EndpointDetailPage의 GraphQL 쿼리에 `ModelDeployment` 노드 쿼리를 추가하여 `currentRevision.modelDefinition` 데이터를 조회
- [ ] Service Info 카드의 `Descriptions` items 배열에 model definition 관련 항목 추가
- [ ] 표시할 필드 (ModelConfig 기준):
  - `name` — 모델 이름
  - `modelPath` — 모델 경로
  - `service.startCommand` — 시작 명령어
  - `service.port` — 서비스 포트
  - `service.healthCheck.path` — 헬스체크 경로
  - `service.healthCheck.initialDelay` — 초기 지연 시간
  - `service.healthCheck.maxRetries` — 최대 재시도 횟수
- [ ] `metadata` 필드는 표시하지 않음
- [ ] `models` 배열이 비어있거나 `currentRevision`이 null인 경우 해당 항목을 표시하지 않거나 "-" 등의 빈 상태 표시

#### 2. Custom 런타임 편집 시 GraphQL 데이터 활용
- [ ] `loadModelDefinitionForEdit` 함수의 vfolder 파일 다운로드/YAML 파싱 방식을 `currentRevision.modelDefinition` GraphQL 쿼리 결과로 대체
- [ ] `ModelConfig.service` 필드에서 `startCommand`, `port`, `healthCheck` 등을 form 필드에 매핑
- [ ] GraphQL 데이터가 없는 경우(구 버전 서비스 등) 기존 vfolder 파싱 방식을 fallback으로 유지
- [ ] 불필요한 네트워크 요청(vfolder download token + file fetch) 제거

#### 3. Update 시 model-definition.yaml 덮어쓰기 확인 모달
- [ ] 편집(Update) 모드에서 command 모드로 저장 시, model-definition.yaml 업로드 전에 `modal.confirm`으로 덮어쓰기 확인 표시
- [ ] 생성 모드에서 이미 사용 중인 것과 동일한 UX 패턴 적용
- [ ] 사용자가 취소하면 저장 프로세스를 중단
- [ ] 확인 모달은 항상 표시

### 있으면 좋은 것 (Nice to Have)
- [ ] `models` 배열에 여러 모델이 있는 경우 각 모델별로 접기/펼치기 가능한 UI 제공
- [ ] model definition 정보 영역을 별도 카드나 섹션으로 분리하여 가독성 향상

## 사용자 시나리오

- 운영자로서, 모델 서비스 상세 페이지에서 현재 배포된 모델의 시작 명령어, 포트, 헬스체크 설정을 확인할 수 있어서, 서비스 문제 발생 시 설정을 빠르게 확인할 수 있다.
- 운영자로서, custom 런타임 서비스를 편집할 때 기존 설정값이 GraphQL에서 안정적으로 로드되어, vfolder 파일 접근 실패에 의존하지 않고 정확한 값을 확인하고 수정할 수 있다.
- 운영자로서, 서비스 편집 시 model-definition.yaml 파일을 덮어쓰기 전에 확인 대화상자를 통해 의도하지 않은 설정 변경을 방지할 수 있다.

## 인수 조건

### Model Definition 표시
- [ ] EndpointDetailPage의 Service Info 카드에 model definition 정보가 Descriptions 항목으로 표시된다
- [ ] `currentRevision`이 null인 서비스에서는 model definition 항목이 표시되지 않거나 빈 상태("-")로 표시된다
- [ ] `metadata` 필드는 UI에 노출되지 않는다

### GraphQL 데이터 로드
- [ ] custom 런타임 편집 모드 진입 시 GraphQL `currentRevision.modelDefinition`에서 데이터를 가져와 form 필드가 올바르게 채워진다
- [ ] GraphQL에 `modelDefinition`이 없는 경우 기존 vfolder 파싱 fallback이 동작한다
- [ ] 편집 폼의 startCommand, port, healthCheck path, initialDelay, maxRetries 필드에 기존 값이 정확히 표시된다

### 덮어쓰기 확인 모달
- [ ] 편집 모드에서 command 모드로 저장 시 확인 모달이 표시된다
- [ ] 확인 클릭 시 정상적으로 저장이 진행된다
- [ ] 취소 클릭 시 저장이 중단되고 폼 상태가 유지된다
- [ ] 생성 모드의 기존 덮어쓰기 확인 동작이 변경되지 않는다

## 범위 밖 (Out of Scope)

- vLLM/SGLang 런타임의 model definition 편집 개선 (custom 런타임만 해당)
- model definition 편집을 위한 전용 모달이나 페이지 제작
- `ModelMetadata` 필드의 UI 표시
- `preStartActions` 필드의 UI 표시 및 편집
- revision 목록 조회 및 과거 revision의 model definition 비교
- model-definition.yaml 파일의 직접 편집 (코드 에디터 등)

## 관련 파일

- `react/src/pages/EndpointDetailPage.tsx` — Service Info Descriptions 항목 추가, GraphQL 쿼리에 ModelDeployment.currentRevision.modelDefinition 추가
- `react/src/components/ServiceLauncherPageContent.tsx` — `loadModelDefinitionForEdit` 함수 수정 (GraphQL 활용), Update 시 modal.confirm 추가
- `data/schema.graphql` — ModelDeployment, ModelRevision, ModelDefinition, ModelServiceConfig 타입 참조

## 관련 이슈

- FR-2581: 엔드포인트 목록 및 상세 페이지에 런타임 변형 표시 (상위 이슈)
