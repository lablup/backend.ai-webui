# Model Service Definition 파일 스키마 검증 Spec

## 개요

Backend.AI WebUI의 파일 편집기(Monaco Editor)에서 `model-definition.yaml`, `deployment-config.yaml`, `service-definition.toml` 파일을 편집할 때, JSON Schema 기반 실시간 유효성 검사를 제공하여 사용자가 형식 오류를 즉시 인지하고 수정할 수 있도록 한다.

## 문제 정의

현재 사용자가 model service 관련 설정 파일을 WebUI 파일 편집기에서 작성할 때, 형식 오류에 대한 피드백이 전혀 없다. 잘못된 YAML 구조, 필수 필드 누락, 타입 불일치 등의 오류는 실제 서비스 배포 시점에서야 발견되며, 이로 인해 디버깅에 불필요한 시간이 소요된다.

스키마 검증을 통해 편집 시점에 오류를 표시함으로써 사용자 경험을 개선하고, 배포 실패를 사전에 방지한다.

## 대상 파일

| 파일명 | 형식 | 설명 | 스키마 파일 |
|---|---|---|---|
| `model-definition.yaml` | YAML | 모델 정의 (모델 목록, 서비스 구성, 메타데이터) | `model-definition.schema.json` (FR-2453 첨부 초안 있음, 레포 추가 필요) |
| `deployment-config.yaml` | YAML | 배포 설정 (이미지, 리소스, 환경변수) | `deployment-config.schema.json` (신규 작성 필요) |
| `service-definition.toml` | TOML | 서비스 정의 (command, shell, env 등) | `service-definition.schema.json` (FR-2453 첨부 초안 있음, 레포 추가 필요) |

## 스키마 상세

### model-definition.yaml 스키마

**출처**: FR-2453 첨부 `model-definition.schema.json` (JSON Schema Draft 2020-12)

- 루트: `{ models: ModelConfig[] }` — `models` 필수, `minItems: 1`
- `ModelConfig`: `name` (필수), `model_path` (필수), `service` (선택, ModelServiceConfig), `metadata` (선택, ModelMetadata)
- `ModelServiceConfig`: `start_command` (필수), `port` (필수, exclusiveMinimum: 1), `shell`, `pre_start_actions`, `health_check`
- `ModelHealthCheck`: `path` (필수), `interval`, `max_retries` (minimum: 1), `max_wait_time`, `expected_status_code` (minimum: 100), `initial_delay`
- `ModelMetadata`: `author`, `title`, `version`, `created`, `last_modified`, `description`, `task`, `category`, `architecture`, `framework`, `label`, `license`, `min_resource`
- `additionalProperties: false`로 알 수 없는 키 감지

**Core 대비 불일치 (구현 전 수정 필요)**:

| 항목 | 현재 스키마 | Core 모델 (`ai.backend.common.config`) | 수정 방향 |
|---|---|---|---|
| `models` minItems | `minItems: 1` (최소 1개 필수) | `default_factory=list` (빈 리스트 허용) | `minItems: 1` 제거, Core 기준 따름 |
| `expected_status_code` | `minimum: 100` (100 허용) | `gt=100` (101부터 허용) | `exclusiveMinimum: 100`으로 변경 |

### service-definition.toml 스키마

**출처**: FR-2453 첨부 `service-definition.schema.json` (JSON Schema Draft 2020-12)

- 루트: `{ command (필수), shell, noop, url_template, prestart, env, allowed_envs, allowed_arguments, default_arguments }`
- `command`: string 또는 string[] — 서비스 시작 명령어
- `prestart`: Action[] — 사전 실행 액션 (`action` 필수, `args` 필수, `ref` 선택)
- `env`: { [key]: string } — 환경변수
- `additionalProperties: false`로 알 수 없는 키 감지

**Core 대비 불일치 (구현 전 수정 필요)**:

| 항목 | 현재 스키마 | Core 모델 (`ai.backend.kernel.service`) | 수정 방향 |
|---|---|---|---|
| `shell` 기본값 | `"bash"` | service.py: `"bash"`, config validator: `"/bin/bash"` | Core 내부 불일치 확인 후 결정 |

참고: 스키마의 `prestart` 필드명은 Core 내부에서 `prestart_actions`로 자동 변환되나, 실제 파일에서 사용하는 이름이 `prestart`이므로 스키마가 올바르다.

참고: `useModelServiceLauncher.ts`에 이미 `service-definition.toml` 파싱 및 `runtime_variants` 검증 로직이 존재한다.

### deployment-config.yaml 스키마

**출처**: **신규 작성 필요** — Backend.AI Core의 `DeploymentConfig` Pydantic 모델에서 추출

- 루트 레벨: `environment` (image, architecture), `resource_slots`, `resource_opts`, `environ`
- 런타임 변형별 오버라이드: `vllm`, `nim`, `cmd`, `huggingface-tgi`, `sglang`, `modular-max`, `custom` — 각각 루트와 동일 구조

## 요구사항

### Must Have

- [ ] `model-definition.yaml` 파일 편집 시 `model-definition.schema.json` 기반 실시간 유효성 검사가 Monaco Editor에서 동작해야 한다
- [ ] `deployment-config.yaml` 파일 편집 시 `deployment-config.schema.json` 기반 실시간 유효성 검사가 Monaco Editor에서 동작해야 한다
- [ ] `service-definition.toml` 파일 편집 시 `service-definition.schema.json` 기반 실시간 유효성 검사가 Monaco Editor에서 동작해야 한다
- [ ] 스키마 위반 및 구문 문제는 Monaco Editor의 diagnostics(인라인 경고 표시)로 표시되어야 한다
  - 경고 위치가 해당 라인에 밑줄로 표시된다
  - 마우스 호버 시 경고 메시지가 툴팁으로 표시된다
  - 별도의 Problems 패널/에디터 하단 경고 목록 UI는 본 범위에 포함하지 않으며, 경고 확인은 에디터 내 marker(밑줄/hover)로 가능해야 한다
- [ ] 스키마 위반 및 YAML/TOML 파싱 문제는 파일 저장을 차단하지 않아야 하며, Monaco diagnostics에서 항상 `MarkerSeverity.Warning`(또는 이에 상응하는 warning severity)으로 표시되어야 한다
- [ ] 다음 유형의 문제를 검출해야 한다:
  - 필수 필드 누락 (예: `models[0].name` 없음)
  - 잘못된 타입 (예: `port`에 문자열 입력)
  - 잘못된 값 범위 (예: `port: 0`, `max_retries: -1`)
  - 알 수 없는 키 (정의되지 않은 필드 사용 시 경고)
  - 잘못된 YAML/TOML 구문 (파싱 문제를 경고로 표시)
- [ ] 파일명이 `model-definition.yaml`(`.yml` 포함), `deployment-config.yaml`(`.yml` 포함), 또는 `service-definition.toml`인 경우에만 스키마 검증이 활성화되어야 한다

### Nice to Have

- [ ] YAML 파일 스키마 기반 자동완성(autocomplete) 및 호버 툴팁 지원 — `monaco-yaml`이 기본 제공하므로 추가 구현 불필요 (TOML은 대상 외)
- [ ] `deployment-config.yaml`에서 런타임 변형 섹션 내부의 구조도 루트 레벨과 동일한 스키마로 검증

## 사용자 스토리

- 사용자로서, `model-definition.yaml`을 편집할 때 필수 필드를 누락하면 에디터에서 즉시 경고를 확인하여, 배포 실패 전에 수정할 수 있다.
- 사용자로서, `deployment-config.yaml`을 편집할 때 잘못된 리소스 설정을 입력하면 에디터에서 바로 오류를 확인하여, 올바른 형식으로 수정할 수 있다.
- 사용자로서, 스키마에 맞지 않는 내용이 있더라도 파일을 저장할 수 있어서, 작성 중인 내용을 잃지 않는다.
- 사용자로서, 어떤 필드가 필수이고 어떤 값이 유효한지 모를 때, 에디터의 인라인 경고를 통해 올바른 형식을 학습할 수 있다.

## 수용 기준 (Acceptance Criteria)

- [ ] `VFolderTextFileEditorModal`에서 `model-definition.yaml` 파일을 열었을 때, 필수 필드(`name`, `model_path`)가 누락된 경우 해당 위치에 경고가 표시된다
- [ ] `model-definition.yaml`에서 `port` 필드에 문자열을 입력하면 타입 오류 경고가 표시된다
- [ ] `model-definition.yaml`에서 `port: 0` 입력 시 값 범위 오류 경고가 표시된다
- [ ] `deployment-config.yaml` 파일을 열었을 때, `environment` 아래에 `image`나 `architecture` 없이 다른 키만 있으면 경고가 표시된다
- [ ] `service-definition.toml` 파일을 열었을 때, `command` 필드 누락 시 경고가 표시된다
- [ ] 스키마 에러가 있는 상태에서 저장 버튼을 클릭하면 정상적으로 파일이 저장된다
- [ ] 파일명이 대상 파일 3종이 아닌 파일에서는 스키마 검증이 동작하지 않는다
- [ ] 사용자가 타이핑하는 도중 실시간으로 검증이 수행되며, 타이핑이 끝난 후 적절한 디바운스 시간 내에 결과가 반영된다

## 범위 외 (Out of Scope)

- 서버 사이드 스키마 검증 (백엔드 API를 통한 검증)
- 파일 생성 시 템플릿/보일러플레이트 자동 생성
- 스키마 버전 관리 (Backend.AI 버전별 스키마 분기)
- `model-definition.yaml`과 `deployment-config.yaml` 간의 교차 검증 (예: 모델 서비스 포트와 배포 설정 간 정합성)
- 스키마 에러 시 저장 차단 (blocking)

## 기술 구성

### 스키마 파일

| 스키마 파일 | 대상 | 출처 |
|---|---|---|
| `model-definition.schema.json` | `model-definition.yaml` | FR-2453 첨부 파일 (완성됨) |
| `service-definition.schema.json` | `service-definition.toml` | FR-2453 첨부 파일 (완성됨) |
| `deployment-config.schema.json` | `deployment-config.yaml` | **신규 작성 필요** — Core의 `DeploymentConfig` Pydantic 모델에서 추출 |

파일 위치는 기존 스키마 파일(`resources/theme.schema.json`, `resources/device_metadata.schema.json` 등)과 동일하게 `resources/` 디렉토리에 배치한다. Electron 데스크톱 빌드의 `file://` 프로토콜 핸들러는 루트에서 `resources/`와 `manifest/`만 직접 서빙하므로, `docs/schemas/`는 런타임에서 접근 불가하여 사용하지 않는다.

### 검증 방식

| 대상 파일 | 검증 도구 | 방식 |
|---|---|---|
| `model-definition.yaml` | `monaco-yaml` | JSON Schema 등록, 실시간 검증 + 자동완성, 스키마 위반은 항상 warning severity로 표시 |
| `deployment-config.yaml` | `monaco-yaml` | 동일 |
| `service-definition.toml` | `smol-toml` + `ajv` + `setModelMarkers` | TOML 파싱 후 JSON Schema로 검증하고, 검증/파싱 결과를 warning severity 마커로 표시 |

- **YAML**: `monaco-yaml` 패키지를 사용하여 Monaco Editor에 YAML language server를 통합한다. `ThemeJsonConfigModal.tsx`의 JSON 스키마 검증 패턴(`setDiagnosticsOptions`)과 유사한 API를 제공하되, 해당 구현의 `jsonDefaults.setDiagnosticsOptions({ schemaValidation: 'error' })` 설정을 그대로 복사하지 않는다. 본 기능의 스키마 위반 표시는 항상 warning이어야 하므로, YAML diagnostics 설정에서 schema validation severity를 warning으로 강제하는 구현 포인트를 둔다.
- **TOML**: `monaco-yaml`은 TOML을 지원하지 않으므로, `smol-toml`(이미 사용 중)으로 파싱 후 `ajv`(이미 설치됨)로 JSON Schema 검증을 수행한다. 이때 파싱 오류와 스키마 검증 오류 모두 `monaco.editor.setModelMarkers()`에 전달하기 전에 `monaco.MarkerSeverity.Warning`으로 변환하여, TOML에서도 스키마 위반이 항상 warning severity로 표시되도록 한다.

### 새로운 의존성

| 패키지 | 용도 |
|---|---|
| `monaco-yaml` | Monaco Editor YAML language server 통합 (스키마 검증, 자동완성, 호버 툴팁) |

기존 의존성 활용: `ajv` (^8.18.0), `smol-toml`, `@monaco-editor/react` (^4.7.0)

## 현재 편집기 구조

편집 대상 컴포넌트: `VFolderTextFileEditorModal` (`react/src/components/VFolderTextFileEditorModal.tsx`)
- Monaco Editor (`@monaco-editor/react`)를 사용
- 파일명 기반 언어 감지 (`detectLanguageAndMimeType`) 기능이 이미 존재
- `onMount` 콜백에서 editor/monaco 인스턴스에 접근 가능
- 파일 저장은 `saveMutation`으로 처리되며, 현재 검증 로직 없음

## 참고 구현 (기존 코드베이스)

| 항목 | 위치 | 설명 |
|---|---|---|
| Monaco JSON 스키마 검증 | `ThemeJsonConfigModal.tsx`의 Monaco JSON schema diagnostics 설정 블록 | `jsonDefaults.setDiagnosticsOptions()`로 실시간 스키마 검증 구현 |
| 스키마 파일 관리 | `resources/*.schema.json` | 기존 JSON Schema 파일 6개+ 존재 (동일 패턴 따름) |
| 서비스 정의 파싱 | `useModelServiceLauncher.ts`의 `service-definition.toml` 파싱/검증 로직 | `service-definition.toml` 파싱 및 `runtime_variants` 검증 로직 |
| 파일명 언어 감지 | `VFolderTextFileEditorModal.tsx`의 `detectLanguageAndMimeType` | `detectLanguageAndMimeType`으로 Monaco 언어 자동 설정 |
| AJV 스키마 검증 | `react/src/hooks/backendai.test.tsx`의 AJV schema validation 테스트 블록 | `ajv ^8.18.0`으로 JSON Schema 검증 (동일 패턴) |

## 관련 이슈

- **FR-2453** (GitHub #6363): "Enable JSON Schema validation and autocomplete for model/service definition files in Monaco editor"
  - 이 스펙의 원본 이슈. JSON Schema 파일 경로(`model-definition.schema.json`, `service-definition.schema.json`)와 검증 수준(warning) 정의
  - FR-2453에 초안 스키마 파일이 첨부되어 있으나 레포에는 아직 추가되지 않은 상태. 구현 시 Core Pydantic 모델과 대조하여 불일치 사항(위 표 참조)을 수정한 뒤 `resources/` 디렉토리에 추가 필요

## 관련 참조

- Backend.AI Core 스키마 소스:
  - `model-definition.yaml`: `ai.backend.common.config.ModelDefinition` (Pydantic)
  - `deployment-config.yaml`: `ai.backend.manager.data.deployment.types.DeploymentConfig` (Pydantic)
  - 런타임 변형: `ai.backend.common.types.RuntimeVariant` (StrEnum)
