# Model Service Definition 파일 스키마 검증 Spec

## 개요

Backend.AI WebUI의 파일 편집기(Monaco Editor)에서 `model-definition.yaml`, `service-definition.toml` 파일을 편집할 때, JSON Schema 기반 실시간 유효성 검사 및 자동완성을 제공하여 사용자가 형식 오류를 즉시 인지하고 수정할 수 있도록 한다.

`deployment-config.yaml`은 별도 이슈로 진행한다.

## 문제 정의

현재 사용자가 model service 관련 설정 파일을 WebUI 파일 편집기에서 작성할 때, 형식 오류에 대한 피드백이 전혀 없다. 잘못된 YAML 구조, 필수 필드 누락, 타입 불일치 등의 오류는 실제 서비스 배포 시점에서야 발견되며, 이로 인해 디버깅에 불필요한 시간이 소요된다.

스키마 검증을 통해 편집 시점에 오류를 표시함으로써 사용자 경험을 개선하고, 배포 실패를 사전에 방지한다.

## 대상 파일

| 파일명 | 형식 | 설명 | 스키마 파일 |
|---|---|---|---|
| `model-definition.yaml` (`.yml` 포함) | YAML | 모델 정의 (모델 목록, 서비스 구성, 메타데이터) | `resources/model-definition.schema.json` |
| `service-definition.toml` | TOML | 서비스 정의 (command, shell, env 등) | `resources/service-definition.schema.json` |

## 스키마 상세

### model-definition.yaml 스키마

**출처**: FR-2453 첨부 `model-definition.schema.json` (JSON Schema Draft 2020-12)

- 루트: `{ models: ModelConfig[] }` — `models` 필수, `minItems: 1`
- `ModelConfig`: `name` (필수), `model_path` (필수), `service` (선택, ModelServiceConfig), `metadata` (선택, ModelMetadata)
- `ModelServiceConfig`: `start_command` (필수), `port` (필수, exclusiveMinimum: 1), `shell`, `pre_start_actions`, `health_check`
- `ModelHealthCheck`: `path` (필수), `interval`, `max_retries` (minimum: 1), `max_wait_time`, `expected_status_code` (minimum: 100), `initial_delay`
- `ModelMetadata`: `author`, `title`, `version`, `created`, `last_modified`, `description`, `task`, `category`, `architecture`, `framework`, `label`, `license`, `min_resource`
- `additionalProperties: false`로 알 수 없는 키 감지

**Core 대비 불일치 참고**:

스키마는 FR-2453 첨부 초안을 그대로 사용한다. Core Pydantic 모델과 일부 차이가 있으나(`minItems`, `expected_status_code` 범위 등), 서버 버전별로 Core 스키마가 달라질 수 있으므로 WebUI에서는 warning 수준에서 대응한다. 스키마 불일치로 인한 경고는 사용자에게 참고 정보를 제공하는 수준이며, 파일 저장을 차단하지 않는다.

### service-definition.toml 스키마

**출처**: FR-2453 첨부 `service-definition.schema.json` (JSON Schema Draft 2020-12)

- 루트: `{ command (필수), shell, noop, url_template, prestart, env, allowed_envs, allowed_arguments, default_arguments }`
- `command`: string 또는 string[] — 서비스 시작 명령어
- `prestart`: Action[] — 사전 실행 액션 (`action` 필수, `args` 필수, `ref` 선택)
- `env`: { [key]: string } — 환경변수
- `additionalProperties: false`로 알 수 없는 키 감지

참고: 스키마의 `prestart` 필드명은 Core 내부에서 `prestart_actions`로 자동 변환되나, 실제 파일에서 사용하는 이름이 `prestart`이므로 스키마가 올바르다.

참고: `useModelServiceLauncher.ts`에 이미 `service-definition.toml` 파싱 및 `runtime_variants` 검증 로직이 존재한다.

## 요구사항

### Must Have

- [x] `model-definition.yaml` 파일 편집 시 `model-definition.schema.json` 기반 실시간 유효성 검사가 Monaco Editor에서 동작해야 한다
- [x] `service-definition.toml` 파일 편집 시 `service-definition.schema.json` 기반 실시간 유효성 검사가 Monaco Editor에서 동작해야 한다
- [x] 스키마 위반 및 구문 문제는 Monaco Editor의 diagnostics(인라인 경고 표시)로 표시되어야 한다
  - 경고 위치가 해당 라인에 밑줄로 표시된다
  - 마우스 호버 시 경고 메시지가 툴팁으로 표시된다 (Monaco 기본 제공)
  - 별도의 Problems 패널/에디터 하단 경고 목록 UI는 본 범위에 포함하지 않으며, 경고 확인은 에디터 내 marker(밑줄/hover)로 가능해야 한다
- [x] 스키마 위반 및 YAML/TOML 파싱 문제는 파일 저장을 차단하지 않아야 하며, Monaco diagnostics에서 항상 `MarkerSeverity.Warning`(또는 이에 상응하는 warning severity)으로 표시되어야 한다
- [x] 다음 유형의 문제를 검출해야 한다:
  - 필수 필드 누락 (예: `models[0].name` 없음)
  - 잘못된 타입 (예: `port`에 문자열 입력)
  - 잘못된 값 범위 (예: `port: 0`, `max_retries: -1`)
  - 알 수 없는 키 (정의되지 않은 필드 사용 시 경고)
  - 잘못된 YAML/TOML 구문 (파싱 문제를 경고로 표시)
- [x] 파일명이 `model-definition.yaml`(`.yml` 포함) 또는 `service-definition.toml`인 경우에만 스키마 검증이 활성화되어야 한다
- [x] YAML 파일 편집 시 스키마 기반 자동완성(autocomplete)이 제공되어야 한다 (TOML은 대상 외)

### Future Work

- [ ] `deployment-config.yaml` 파일 편집 시 `deployment-config.schema.json` 기반 실시간 유효성 검사 — 별도 이슈로 진행 (스키마 신규 작성 필요)
- [ ] `deployment-config.yaml`에서 런타임 변형 섹션 내부의 구조도 루트 레벨과 동일한 스키마로 검증

## 사용자 스토리

- 사용자로서, `model-definition.yaml`을 편집할 때 필수 필드를 누락하면 에디터에서 즉시 경고를 확인하여, 배포 실패 전에 수정할 수 있다.
- 사용자로서, `model-definition.yaml`을 편집할 때 자동완성을 통해 유효한 필드명과 구조를 쉽게 입력할 수 있다.
- 사용자로서, 스키마에 맞지 않는 내용이 있더라도 파일을 저장할 수 있어서, 작성 중인 내용을 잃지 않는다.
- 사용자로서, 어떤 필드가 필수이고 어떤 값이 유효한지 모를 때, 에디터의 인라인 경고를 통해 올바른 형식을 학습할 수 있다.

## 수용 기준 (Acceptance Criteria)

- [x] `VFolderTextFileEditorModal`에서 `model-definition.yaml` 파일을 열었을 때, 필수 필드(`name`, `model_path`)가 누락된 경우 해당 위치에 경고가 표시된다
- [x] `model-definition.yaml`에서 `port` 필드에 문자열을 입력하면 타입 오류 경고가 표시된다
- [x] `model-definition.yaml`에서 `port: 0` 입력 시 값 범위 오류 경고가 표시된다
- [x] `service-definition.toml` 파일을 열었을 때, `command` 필드 누락 시 경고가 표시된다
- [x] 스키마 에러가 있는 상태에서 저장 버튼을 클릭하면 정상적으로 파일이 저장된다
- [x] 파일명이 대상 파일이 아닌 파일에서는 스키마 검증이 동작하지 않는다
- [x] 사용자가 타이핑하는 도중 실시간으로 검증이 수행되며, 타이핑이 끝난 후 적절한 디바운스 시간(300ms) 내에 결과가 반영된다
- [x] `model-definition.yaml` 편집 시 스키마 기반 자동완성이 동작하며, 현재 커서 위치의 컨텍스트에 맞는 프로퍼티를 제안한다

## 범위 외 (Out of Scope)

- 서버 사이드 스키마 검증 (백엔드 API를 통한 검증)
- 파일 생성 시 템플릿/보일러플레이트 자동 생성
- 스키마 버전 관리 (Backend.AI 버전별 스키마 분기)
- `model-definition.yaml`과 `deployment-config.yaml` 간의 교차 검증 (예: 모델 서비스 포트와 배포 설정 간 정합성)
- 스키마 에러 시 저장 차단 (blocking)
- YAML/TOML 파일 자동 포맷팅 (prettier/formatter 기능)
- Core Pydantic 모델과의 스키마 정합성 맞추기 (서버 버전별 차이가 있으므로 warning 수준 대응)
- `deployment-config.yaml` 검증 (별도 이슈로 진행)

## 기술 구성

### 스키마 파일

| 스키마 파일 | 대상 | 출처 |
|---|---|---|
| `resources/model-definition.schema.json` | `model-definition.yaml` | FR-2453 첨부 파일 |
| `resources/service-definition.schema.json` | `service-definition.toml` | FR-2453 첨부 파일 |

파일 위치는 기존 스키마 파일(`resources/theme.schema.json`, `resources/device_metadata.schema.json` 등)과 동일하게 `resources/` 디렉토리에 배치한다. Electron 데스크톱 빌드의 `file://` 프로토콜 핸들러는 루트에서 `resources/`와 `manifest/`만 직접 서빙하므로, `docs/schemas/`는 런타임에서 접근 불가하여 사용하지 않는다.

### 검증 방식

| 대상 파일 | 검증 도구 | 방식 |
|---|---|---|
| `model-definition.yaml` | `yaml` + `ajv` + `setModelMarkers` + `CompletionItemProvider` | YAML 파싱 후 JSON Schema로 검증, 스키마 기반 자동완성 |
| `service-definition.toml` | `smol-toml` + `ajv` + `setModelMarkers` | TOML 파싱 후 JSON Schema로 검증, 커스텀 monarch tokenizer로 구문 강조 |

- **YAML**: `monaco-yaml`은 CDN으로 로드되는 Monaco (`@monaco-editor/react`가 jsDelivr에서 로드)의 Worker 프로토콜과 호환되지 않아 사용 불가. 대신 `yaml` 파서로 파싱 후 `ajv` (Ajv2020, Draft 2020-12)로 JSON Schema 검증을 수행하고, `setModelMarkers()`로 warning marker를 표시한다. 자동완성은 `monaco.languages.registerCompletionItemProvider()`로 커스텀 CompletionItemProvider를 등록하여, 커서 위치의 들여쓰기 컨텍스트를 분석하고 JSON Schema에서 해당 위치에 유효한 프로퍼티를 제안한다.
- **TOML**: Monaco에 TOML 언어가 내장되어 있지 않으므로, 커스텀 monarch tokenizer를 등록하여 구문 강조를 제공한다. `smol-toml`(이미 사용 중)으로 파싱 후 `ajv`로 JSON Schema 검증을 수행한다. 파싱 오류와 스키마 검증 오류 모두 `MarkerSeverity.Warning`으로 표시한다.
- **공통**: Ajv 스키마 컴파일은 validator 생성 시 1회만 수행(매 키스트로크마다 재컴파일하지 않음). 비동기 검증 결과의 race condition 방지를 위해 version counter를 사용. 검증은 마운트 시 즉시 1회 수행 + 이후 `onDidChangeContent` 이벤트에 300ms 디바운스로 수행.

### 구현 파일

| 파일 | 설명 |
|---|---|
| `react/src/helper/monacoSchemaValidator.ts` | 공통 스키마 검증 코어 (Ajv 캐싱, race condition guard, disposable 패턴) |
| `react/src/helper/monacoYamlValidator.ts` | YAML 파서 + 오류 매핑 |
| `react/src/helper/monacoYamlCompletion.ts` | YAML 스키마 기반 자동완성 (들여쓰기 인식 경로 탐지, `$ref` 해석) |
| `react/src/helper/monacoTomlValidator.ts` | TOML 파서 + 오류 매핑 |
| `react/src/helper/monacoTomlLanguage.ts` | TOML 언어 등록 + monarch tokenizer |
| `react/src/components/VFolderTextFileEditorModal.tsx` | 파일 타입별 스키마 디스패치 |

### 의존성

| 패키지 | 용도 | 비고 |
|---|---|---|
| `yaml` (^2.8.3) | YAML 파싱 | 신규 추가 |
| `ajv` (^8.18.0) | JSON Schema 검증 (Draft 2020-12) | devDependencies → dependencies 이동 |
| `smol-toml` | TOML 파싱 | 기존 의존성 활용 |
| `@monaco-editor/react` (^4.7.0) | Monaco Editor | 기존 의존성 활용 |

**`monaco-yaml` 미사용 사유**: `@monaco-editor/react`는 Monaco를 jsDelivr CDN에서 로드한다. `monaco-yaml`은 `monaco.editor.createWebWorker()`를 통해 YAML language service worker를 생성하지만, CDN 로드 방식의 Monaco worker infrastructure와 프로토콜이 호환되지 않아 "Could not create web worker(s)" / "Missing requestHandler or method" 오류가 발생한다. `MonacoEnvironment.getWorker` 오버라이드로도 해결되지 않았다.

## 현재 편집기 구조

편집 대상 컴포넌트: `VFolderTextFileEditorModal` (`react/src/components/VFolderTextFileEditorModal.tsx`)
- Monaco Editor (`@monaco-editor/react`)를 사용
- 파일명 기반 언어 감지 (`detectLanguageAndMimeType`) 기능이 이미 존재
- `onMount` 콜백에서 editor/monaco 인스턴스에 접근 가능
- `destroyOnHidden` 모달 패턴으로 닫힐 때 컴포넌트 언마운트 보장
- `disposablesRef`로 validator/completion provider의 정리(cleanup)를 관리

## 참고 구현 (기존 코드베이스)

| 항목 | 위치 | 설명 |
|---|---|---|
| Monaco JSON 스키마 검증 | `ThemeJsonConfigModal.tsx`의 Monaco JSON schema diagnostics 설정 블록 | `jsonDefaults.setDiagnosticsOptions()`로 실시간 스키마 검증 구현 |
| 스키마 파일 관리 | `resources/*.schema.json` | 기존 JSON Schema 파일 6개+ 존재 (동일 패턴 따름) |
| 서비스 정의 파싱 | `useModelServiceLauncher.ts`의 `service-definition.toml` 파싱/검증 로직 | `service-definition.toml` 파싱 및 `runtime_variants` 검증 로직 |
| 파일명 언어 감지 | `VFolderTextFileEditorModal.tsx`의 `detectLanguageAndMimeType` | `detectLanguageAndMimeType`으로 Monaco 언어 자동 설정 |
| AJV 스키마 검증 | `react/src/hooks/backendai.test.tsx`의 AJV schema validation 테스트 블록 | `ajv ^8.18.0`으로 JSON Schema 검증 (동일 패턴) |

## 구현 PR

- **PR #6438**: `feat(FR-2453): add JSON schema validation and autocomplete for definition files in Monaco editor`

## 관련 이슈

- **FR-2453** (GitHub #6363): "Enable JSON Schema validation and autocomplete for model/service definition files in Monaco editor"
  - 이 스펙의 원본 이슈. JSON Schema 파일 경로(`model-definition.schema.json`, `service-definition.schema.json`)와 검증 수준(warning) 정의

## 관련 참조

- Backend.AI Core 스키마 소스:
  - `model-definition.yaml`: `ai.backend.common.config.ModelDefinition` (Pydantic)
  - `deployment-config.yaml`: `ai.backend.manager.data.deployment.types.DeploymentConfig` (Pydantic) — 별도 이슈로 진행
  - 런타임 변형: `ai.backend.common.types.RuntimeVariant` (StrEnum)
