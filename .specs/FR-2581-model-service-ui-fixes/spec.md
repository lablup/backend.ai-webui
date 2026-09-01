# 모델 서비스 UI 운영 개선

## 개요

모델 서비스 운영 중 발견된 UI 이슈들을 수정한다. Custom 런타임 편집 모드에서 model definition 필드 전체가 누락되는 문제, runtime variant 정보 미표시 문제, health check initial delay 기본값이 너무 짧은 문제를 해결한다.

## 문제 정의

1. **Custom 런타임 편집 시 model definition 필드 전체 누락**: 모델 서비스 생성 시에만 model definition 관련 필드들(startCommand, port, healthCheck, initialDelay, maxRetries 등)이 표시되고, 기존 모델 서비스 편집(수정) 시에는 `modelMountDestination`(disabled)과 `modelDefinitionPath`만 표시된다. initial delay는 처음부터 정확한 값을 알 수 없고 트라이/실패를 반복하며 찾아야 하는 값이므로 편집 화면에서도 반드시 노출되어야 한다.

2. **Runtime variant 미표시**: 특정 모델 서비스가 어떤 runtime variant(vLLM, SGLang, Custom 등)를 사용하는지 서비스 목록(EndpointList)과 상세 페이지(EndpointDetailPage) 어디에도 표시되어 있지 않다.

3. **Initial delay 기본값 부적절**: health check initial delay의 기본값이 5초로 설정되어 있으나, 대형 모델(70B+) 로딩에 1~3분이 소요되므로 너무 짧다. 서버 프로세스가 아직 준비되지 않은 상태에서 health check가 시작되어 ROUTE_TERMINATION으로 세션이 종료되고 반복적으로 재시작되는 문제가 발생한다.

## 현재 상태 (As-Is)

### Custom 런타임 편집 모드
- 파일: `react/src/components/ServiceLauncherPageContent.tsx`
- 편집 모드(`endpoint` 존재 시)에서는 `modelMountDestination`(disabled)과 `modelDefinitionPath`만 표시
- 생성 모드에서만 Segmented UI(Enter Command / Use Config File)를 통해 startCommand, port, healthCheck, initialDelay, maxRetries 등 전체 model definition 필드를 제공

### Initial Delay 기본값
- 현재 기본값: **5.0초**
- 설정 위치:
  - `react/src/components/ServiceLauncherPageContent.tsx` (line 1172): `commandInitialDelay: 5.0`
  - `react/src/helper/generateModelDefinitionYaml.ts` (line 81): `initial_delay: ${input.initialDelay ?? 5.0}`
- Initial delay는 Backend.AI 자체 health check 시작 전 대기 시간으로, 컨테이너 안에서 모델이 로드되어 serving을 시작할 때까지 기다리는 시간이다. vLLM/SGLang 공식 문서의 설정값이 아닌 Backend.AI 고유 설정이다.

### Runtime Variant 표시 현황
- **EndpointDetailPage**: GraphQL 쿼리에 `runtime_variant { human_readable_name }`이 포함되어 있으나 (line 242), UI에 렌더링하는 코드가 없음
- **EndpointList**: runtime_variant 필드가 GraphQL fragment에 포함되어 있지 않아 표시 불가

## 요구사항

### 필수 (Must Have)

#### 1. Custom 런타임 편집 모드 - Model Definition 편집
- [ ] Custom 런타임의 편집(수정) 모드에서 model definition 관련 필드 전체를 수정할 수 있는 UI 제공
- [ ] 생성 모드와 동일한 필드 구성: startCommand, port, healthCheck path, initialDelay, maxRetries 등
- [ ] 기존 서비스의 model definition 값을 편집 폼에 올바르게 로드 (vfolder의 model-definition.yaml을 읽어 command 필드로 역매핑)

#### 2. Runtime Variant 표시
- [ ] 서비스 목록(EndpointList)에 runtime variant 정보 표시
- [ ] 서비스 상세 페이지(EndpointDetailPage)에 runtime variant 정보 표시
- [ ] EndpointList의 GraphQL fragment에 `runtime_variant` 필드 추가
- [ ] `human_readable_name`으로 사람이 읽을 수 있는 이름 표시

#### 3. Initial Delay 기본값 변경
- [ ] health check initial delay 기본값을 **5초에서 60초로 변경**
- [ ] `ServiceLauncherPageContent.tsx`의 초기값 변경: `commandInitialDelay: 5.0` → `60` (line 1172)
- [ ] `ServiceLauncherPageContent.tsx`의 fallback값 변경: `values.commandInitialDelay ?? 5.0` → `?? 60` (line 558)
- [ ] `generateModelDefinitionYaml.ts`의 fallback값 변경: `input.initialDelay ?? 5.0` → `input.initialDelay ?? 60` (line 81)

## 인수 조건

### Model Definition 편집
- [ ] Custom 런타임의 편집 모드에서 model definition 필드 전체가 표시된다
- [ ] 기존 서비스의 설정값이 편집 폼에 올바르게 채워진다
- [ ] 편집 후 저장 시 변경된 model definition이 반영된다
- [ ] vLLM/SGLang 런타임의 편집 모드는 기존 동작을 유지한다

### Runtime Variant 표시
- [ ] EndpointList에서 각 서비스의 runtime variant가 표시된다
- [ ] EndpointDetailPage에서 runtime variant가 표시된다
- [ ] runtime variant가 `human_readable_name`으로 표시된다

### Initial Delay
- [ ] 서비스 생성 시 initial delay 입력 필드의 기본값이 60이다
- [ ] model-definition.yaml 생성 시 initial_delay 미지정 시 fallback이 60이다
- [ ] 기존 서비스 편집 시에는 해당 서비스에 설정된 initial delay 값이 올바르게 표시된다 (요구사항 1의 model definition 편집 UI에 의존)

## 범위 밖 (Out of Scope)

- vLLM/SGLang 런타임의 model definition 편집 모드 개선 (custom 런타임만 해당)
- Runtime variant 기반 필터링이나 정렬 기능
- LLM Playground TPS 표시 개선 (FR-2582에서 별도 처리)
- 런타임 파라미터 재분류 및 CLI 플래그 수정 (FR-2547에서 처리)

## 관련 파일

- `react/src/components/ServiceLauncherPageContent.tsx` - 런타임 선택 UI, model definition 편집, initial delay 기본값
- `react/src/helper/generateModelDefinitionYaml.ts` - model-definition.yaml 생성, initial delay fallback
- `react/src/components/EndpointList.tsx` - 서비스 목록 (runtime variant 표시 추가 필요)
- `react/src/pages/EndpointDetailPage.tsx` - 서비스 상세 페이지 (runtime variant 표시 추가 필요)

## 관련 이슈

- FR-2581: 모델 서비스 수정 시 model definition 필드 누락
- FR-2547: 런타임 UI 개선 (상위 스펙, `.specs/runtime-ui-improvement/spec.md`)
