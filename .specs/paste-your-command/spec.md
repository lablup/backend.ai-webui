# Paste Your Command - CLI 명령어 기반 모델 서비스 설정

> **Status**: Draft
> **Date**: 2026-04-02

## 개요

Backend.AI 서비스 런처에서 CUSTOM runtime variant를 선택했을 때, 사용자가 CLI 명령어(예: `vllm serve`, `python -m sglang.launch_server`, `docker run` 등)를 텍스트 필드에 붙여넣으면 명령어를 자동으로 파싱하여 `model-definition.yaml`을 생성하고, 서비스 생성 시 사용자가 선택한 모델 vfolder에 자동 업로드하는 기능이다.

## 문제 정의

현재 CUSTOM runtime variant로 모델 서비스를 실행하려면 사용자가 `model-definition.yaml`을 직접 작성하여 모델 vfolder에 업로드해야 한다. 이 과정에서 다음과 같은 어려움이 있다:

1. **Backend.AI 고유 개념에 대한 사전 지식 요구**: `runtime_variant_preset`, `BACKEND_MODEL_NAME`, `BACKEND_MODEL_PATH` 등 Backend.AI 고유 환경변수와 시스템 구조를 이해해야만 yaml을 올바르게 작성할 수 있다.
2. **CLI 명령어와 yaml 포맷 간의 괴리**: 대부분의 사용자는 `vllm serve my-model --tensor-parallel-size 2` 같은 CLI 명령어에 익숙하지만, 이를 Backend.AI의 yaml 포맷으로 변환하는 것은 별도의 학습이 필요하다.
3. **환경변수 매핑의 복잡성**: CLI 플래그(예: `--tensor-parallel-size`)를 Backend.AI 환경변수(예: `VLLM_TENSOR_PARALLEL_SIZE`)로 변환하는 규칙을 사용자가 직접 파악해야 한다.
4. **반복적인 수동 작업**: yaml 파일을 로컬에서 작성하고 vfolder에 업로드하는 과정이 번거롭다.

## 설계 결정 사항

### D1. API에 전달하는 runtime_variant는 항상 CUSTOM

사용자가 `vllm serve ...` 명령어를 붙여넣어 runtime이 "vLLM"으로 감지되더라도, API에 전달하는 `runtime_variant`는 항상 `"custom"`이다. 코어에서 CUSTOM variant만 model-definition.yaml의 `start_command`를 사용하기 때문이다. 감지된 runtime type은 port 기본값, health_check path 적용 등 내부 힌트 용도로만 활용한다.

### D2. CLI 플래그는 start_command에 그대로 유지, 환경변수 매핑 안 함

CUSTOM variant에서는 start_command가 그대로 실행되므로, `--tensor-parallel-size 2` 같은 CLI 플래그는 start_command에 포함시키고 `VLLM_TENSOR_PARALLEL_SIZE=2` 같은 환경변수로 이중 매핑하지 않는다. CLI 플래그 정보는 GPU 수 추정 등 UI 힌트에만 활용한다. 단, `docker run -e KEY=VALUE`에서 추출된 명시적 환경변수는 `config.environ`에 포함한다.

### D3. yaml 업로드는 서비스 생성 시 자동 수행 (1-step)

별도 "적용" 버튼 없이, 사용자가 [서비스 생성] 버튼을 클릭하면 **yaml 업로드 → 서비스 생성**이 한 번에 수행된다. 사용자가 신경 쓸 액션을 하나로 줄여 UX를 단순화한다. 업로드 전에 vfolder에 기존 model-definition.yaml이 있는지 확인하고, 있으면 덮어쓸지 Confirm 모달로 확인한다.

### D4. "명령어 입력" / "설정 파일 사용" Segmented 전환

CUSTOM variant 선택 시 Segmented 컴포넌트(Ant Design)로 두 모드를 제공한다. **"명령어 입력"이 기본 선택**이어서 CLI 사용자는 바로 placeholder 예시를 보고 시작할 수 있다. "설정 파일 사용"은 이미 vfolder에 yaml을 올려둔 기존 사용자를 위한 것으로, 기존 UI(modelMountDestination, modelDefinitionPath)를 그대로 유지한다.

### D5. 최소 파싱 + 기본값이 채워진 편집 가능 필드

전체 CLI 파싱 대신, `--port`만 추출하고 런타임 감지(첫 토큰 기반)로 기본값을 결정하는 최소 파싱을 수행한다. Port, Health Check, Model Mount 필드는 항상 기본값이 채워진 상태로 표시되며 사용자가 수정 가능하다. 파싱이 실패하거나 감지할 수 없는 런타임이어도 범용 기본값(port: 8000, health: /health, mount: /models)이 채워져 있으므로 대부분의 경우 그대로 사용할 수 있다. GPU 추정(`--tp`, `--tensor-parallel-size`)도 같은 수준의 최소 파싱으로 참고 정보를 제공한다.

### D6. 감지된 런타임 이름은 UI에 노출하지 않음

드롭다운에 "Custom"이 선택되어 있는데 파싱 결과에 "감지된 런타임: vLLM"이라고 표시하면 혼란스럽다. 런타임 감지 결과는 내부적으로 port/health_check 기본값 적용에만 사용하고, UI에는 노출하지 않는다.

### D7. 서비스 수정(Edit) 모드에서는 미지원

이 기능은 신규 서비스 생성에만 적용한다. 수정 모드에서는 이미 runtime_variant와 model-definition.yaml이 확정된 상태이므로, 명령어 재파싱으로 인한 정합성 문제를 피하기 위해 첫 버전에서는 범위 밖으로 둔다.

## 유저 플로우

```
1. vFolderID 선택 (모델 스토리지)
2. Runtime Variant 드롭다운에서 "Custom" 선택
3. Model Definition 영역 표시 — "명령어 입력"이 기본 선택됨
4. Start Command에 CLI 명령어 붙여넣기 (예: vllm serve /models/my-model --tp 2)
   - placeholder에 예시 명령어가 보임
5. 필드 자동 채움:
   - Port: 8000 (--port 플래그가 있으면 해당 값, 없으면 기본값)
   - Health Check: /health (런타임 감지 기반 또는 범용 기본값)
   - Model Mount: /models (기본값)
6. 필요하면 Port, Health Check, Model Mount 값을 수정
7. 이미지, 리소스, 환경변수 등 나머지 설정 완료
8. [서비스 생성] 클릭
   → vfolder에 기존 yaml 있으면 Confirm
   → model-definition.yaml 자동 생성 및 업로드
   → POST /services 호출

※ "설정 파일 사용" 선택 시: 기존 UI(Model Mount + Definition Path)가 표시되며,
   vfolder에 이미 올려둔 yaml을 그대로 사용하는 기존 동작과 동일
```

### UI 레이아웃

#### "명령어 입력" 선택 시 (기본)

```
┌─ Service Launcher ──────────────────────────────────────────┐
│                                                              │
│  Service Name: [my-service          ]                       │
│  ☐ Open to Public                                           │
│  Model Storage to Mount: [my-llama-model ▼]                 │
│                                                              │
│  Runtime Variant: [Custom ▼]                                │
│                                                              │
│  ┌─ Model Definition ───────────────────────────────────┐   │
│  │                                                       │   │
│  │  [ 명령어 입력 | 설정 파일 사용 ]  ← Segmented       │   │
│  │    ━━━━━━━━━━━                                        │   │
│  │                                                       │   │
│  │  Start Command:                                       │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │ 예: vllm serve /models/my-model --tp 2           │ │   │
│  │  │     python -m sglang.launch_server --model ...   │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  │                                                       │   │
│  │  Port            [8000   ]                            │   │
│  │  Health Check    [/health]                            │   │
│  │  Model Mount     [/models]                            │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  Environment Variables:                                      │
│  [KEY    ] = [VALUE    ]  [+] [-]                           │
│                                                              │
│  Additional Mounts: ...                                      │
│  Image: ...                                                  │
│  Resources: CPU / Memory / GPU ...                          │
│  ⚡ Start command 기준 GPU 2개 이상 권장                     │
│                                                              │
│                                 [Cancel]  [Create Service]   │
└──────────────────────────────────────────────────────────────┘
```

#### "설정 파일 사용" 선택 시 (기존 UI 유지)

```
│  ┌─ Model Definition ───────────────────────────────────┐   │
│  │                                                       │   │
│  │  [ 명령어 입력 | 설정 파일 사용 ]  ← Segmented       │   │
│  │                  ━━━━━━━━━━━━━━                        │   │
│  │                                                       │   │
│  │  Model Mount     [/models             ]               │   │
│  │  Definition Path [model-definition.yaml]               │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
```

## 사용자 스토리

- ML 엔지니어로서, 이미 알고 있는 CLI 명령어를 붙여넣기만 하면 Backend.AI에서 모델 서비스가 설정되길 원한다. Backend.AI의 yaml 포맷을 별도로 학습하지 않아도 되도록.
- ML 엔지니어로서, Port/Health Check 등 자동 채워진 값을 확인하고, 필요하면 수정하거나 "설정 파일 사용" 모드로 전환할 수 있어야 한다.
- 관리자로서, 폐쇄망 환경에서도 이 기능이 동작해야 한다. 외부 API 호출 없이 로컬에서 파싱이 완료되어야 하므로.
- 기존 사용자로서, 이미 vfolder에 yaml을 직접 올려서 사용하는 방식도 계속 쓸 수 있어야 한다. "설정 파일 사용" 모드로 기존 워크플로우가 유지되어야 하므로.
- ML 엔지니어로서, 명령어에서 추출된 GPU 수 요구사항을 확인하고 리소스 할당에 반영할 수 있어야 한다. 올바른 리소스 설정으로 서비스가 실행되도록.

## 요구사항

### Must Have

#### UI 구조
- [ ] CUSTOM runtime variant 선택 시 "Model Definition" 영역에 Segmented 컴포넌트로 "명령어 입력" / "설정 파일 사용" 전환이 표시되어야 한다
- [ ] "명령어 입력"이 기본 선택이어야 한다
- [ ] "설정 파일 사용" 선택 시 기존 UI(modelMountDestination, modelDefinitionPath)가 그대로 표시되어야 한다
- [ ] "명령어 입력" 선택 시 다음이 표시되어야 한다:
  - Start Command 텍스트 영역 (여러 줄 입력 가능)
  - Port 입력 필드 (기본값: 8000, 편집 가능)
  - Health Check 입력 필드 (기본값: /health, 편집 가능)
  - Model Mount 입력 필드 (기본값: /models, 편집 가능)
- [ ] 신규 서비스 생성 모드에서만 동작한다 (서비스 수정 모드에서는 노출하지 않음)

#### 최소 파싱 (클라이언트 사이드, 폐쇄망 호환)
- [ ] `--port N` 또는 `--port=N` 플래그를 추출하여 Port 필드에 반영해야 한다
- [ ] 명령어 첫 토큰(또는 `python -m` 뒤 모듈명)으로 런타임을 감지하여 기본값을 조정해야 한다:
  - `vllm` → port 8000, health `/health`
  - `sglang` → port 9001, health `/health`
  - `text-generation-launcher` → port 3000, health `/info`
  - 기타/감지 불가 → 범용 기본값 유지 (port 8000, health `/health`)
- [ ] `--tensor-parallel-size N`, `--tp N` 플래그에서 GPU 수를 추정하여 리소스 설정 영역 근처에 참고 정보로 표시해야 한다 (예: `⚡ Start command 기준 GPU 2개 이상 권장`)
- [ ] `docker run -e KEY=VALUE`에서 환경변수를 추출하여 폼의 envvars 목록에 추가해야 한다
- [ ] `docker run -p HOST:CONTAINER` 에서 컨테이너 포트를 추출하여 Port 필드에 반영해야 한다
- [ ] 모든 파싱 로직은 클라이언트 사이드에서 동작해야 한다 (외부 API 호출 없음)

#### yaml 생성 및 서비스 생성
- [ ] [서비스 생성] 클릭 시, "명령어 입력" 모드이면 Start Command + Port + Health Check + Model Mount 값으로 `model-definition.yaml`을 자동 생성해야 한다
  - Start Command 텍스트를 쉘 토큰 단위로 분리하여 yaml의 `start_command` 배열에 저장 (예: `"vllm serve --tp 2"` → `["vllm", "serve", "--tp", "2"]`)
  - yaml 구조: `models[].name`, `models[].model_path`, `models[].service.start_command`, `models[].service.port`, `models[].service.health_check`
- [ ] "명령어 입력" 모드에서 서비스 생성 API의 `config.model_definition_path`는 자동으로 `"model-definition.yaml"`로 고정된다 (사용자에게 별도 입력 받지 않음)
- [ ] 생성된 yaml을 선택된 모델 vfolder에 업로드한 후 서비스 생성 API를 호출해야 한다 (1-step)
- [ ] yaml 업로드 전에 vfolder에 기존 `model-definition.yaml`이 존재하는지 확인하고, 있으면 덮어쓸지 Confirm 모달로 사용자에게 확인해야 한다
- [ ] yaml 업로드 실패 시 서비스 생성으로 진행하지 않고 에러를 표시해야 한다

### Nice to Have

- [ ] docker run 명령어에서 `--gpus`, `--shm-size` 등 리소스 관련 플래그를 인식하여 Backend.AI 리소스 설정에 반영
- [ ] 모델 vfolder의 파일 크기 합산을 통한 모델 가중치 크기 추정
- [ ] 모델 vfolder 내 `config.json` 파일 분석을 통한 KV cache 크기 추정 (num_layers, hidden_size 기반)
- [ ] 명령어 이력 저장 (최근 사용한 명령어를 다시 선택 가능)
- [ ] NIM runtime 명령어 패턴 지원

## 수락 기준

### 진입점 및 UI

- [ ] runtime variant 드롭다운에서 CUSTOM을 선택하면 "Model Definition" 영역에 Segmented("명령어 입력" / "설정 파일 사용")가 표시된다
- [ ] "명령어 입력"이 기본 선택된 상태여야 한다
- [ ] CUSTOM 이외의 variant(VLLM, SGLANG 등)를 선택하면 해당 영역이 표시되지 않는다
- [ ] "설정 파일 사용" 모드에서는 기존 UI(modelMountDestination + modelDefinitionPath)가 그대로 동작한다
- [ ] "명령어 입력" 모드에서는 Start Command 텍스트 영역 + Port / Health Check / Model Mount 필드가 표시된다
- [ ] Start Command 텍스트 영역에는 placeholder로 예시 명령어가 표시된다 (예: `vllm serve /models/my-model --tp 2`)
- [ ] Port, Health Check, Model Mount 필드에는 항상 기본값이 채워져 있다 (port: 8000, health: /health, mount: /models)
- [ ] 각 필드는 사용자가 자유롭게 수정 가능하다
- [ ] 서비스 수정 모드(endpoint가 있는 경우)에서는 이 기능이 노출되지 않는다

### 최소 파싱 동작

- [ ] 명령어 입력 시(debounce 300~500ms) `--port N` 플래그가 있으면 Port 필드를 해당 값으로 업데이트한다
- [ ] `vllm` 감지 시 기본값을 port 8000, health `/health`로 설정한다
- [ ] `sglang` 감지 시 기본값을 port 9001, health `/health`로 설정한다
- [ ] `text-generation-launcher` 감지 시 기본값을 port 3000, health `/info`로 설정한다
- [ ] 런타임을 감지할 수 없으면 범용 기본값(port 8000, health `/health`)을 유지한다
- [ ] `--tensor-parallel-size N` 또는 `--tp N` 감지 시 `⚡ GPU N개 이상 필요` 참고 정보를 표시한다
- [ ] `docker run -e KEY=VALUE` 감지 시 환경변수를 폼의 envvars 목록에 자동 추가한다
- [ ] `docker run -p HOST:CONTAINER` 감지 시 CONTAINER 포트를 Port 필드에 반영한다

### 파싱 예시

- [ ] `vllm serve /models/my-model --tensor-parallel-size 2 --quantization awq --port 8080` 입력 시:
  - Port: `8080` (--port에서 추출)
  - Health Check: `/health` (vllm 기본값)
  - GPU 참고: `⚡ GPU 2개 이상 필요`
- [ ] `python -m sglang.launch_server --model /models/llama --tp 4 --port 9001` 입력 시:
  - Port: `9001` (--port에서 추출)
  - Health Check: `/health` (sglang 기본값)
  - GPU 참고: `⚡ GPU 4개 이상 필요`
- [ ] `text-generation-launcher --model-id /models/my-model --port 3000` 입력 시:
  - Port: `3000`
  - Health Check: `/info` (tgi 기본값)
- [ ] `docker run -e MY_VAR=hello -p 9090:8080 my-image:latest python serve.py` 입력 시:
  - Port: `8080` (컨테이너 포트)
  - 환경변수: `MY_VAR=hello`가 envvars에 추가
  - start_command: `python serve.py`
- [ ] `python my_server.py --port 8000 --workers 4` 입력 시:
  - Port: `8000` (--port에서 추출)
  - Health Check: `/health` (범용 기본값)
- [ ] `./run.sh` 같은 인식 불가 명령어 입력 시:
  - Port: `8000` (범용 기본값, 사용자가 수정 가능)
  - Health Check: `/health` (범용 기본값, 사용자가 수정 가능)

### yaml 생성 및 업로드

- [ ] [서비스 생성] 클릭 시, Start Command + Port + Health Check + Model Mount 값으로 유효한 `model-definition.yaml`이 생성된다
- [ ] 생성된 yaml이 Backend.AI의 model-definition.yaml 스키마를 준수한다
- [ ] yaml 업로드 → 서비스 생성 API 호출이 순차적으로 수행된다
- [ ] yaml 업로드 전에 vfolder에 기존 파일이 있으면 Confirm 모달이 표시된다
- [ ] yaml 업로드 실패 시 서비스 생성으로 진행하지 않고 에러를 표시한다

### 환경변수 처리

- [ ] `docker run -e KEY=VALUE`에서 추출된 환경변수는 폼의 envvars 목록에 자동 추가된다
- [ ] CLI 플래그(예: `--tensor-parallel-size`)는 env var로 이중 매핑하지 않고 start_command에만 포함된다

### 폐쇄망 호환성

- [ ] 인터넷 연결 없이 모든 파싱 기능이 동작한다
- [ ] 외부 서버로의 API 호출이 발생하지 않는다

## 범위 밖 (Out of Scope)

- LLM/AI 기반 명령어 파싱 (규칙 기반 파싱만 사용)
- 원격 모델 레지스트리(HuggingFace Hub 등)에서 모델 정보 자동 조회
- CUSTOM 이외의 runtime variant(VLLM, SGLANG 등)에서의 명령어 입력 지원 (이 variant들은 기존 전용 UI 사용)
- 파싱된 명령어의 실행 가능성 검증 (해당 바이너리/패키지가 이미지에 설치되어 있는지 확인)
- docker-compose.yaml 파싱
- Kubernetes manifest 파싱
- 서비스 런처 외의 다른 페이지에서 이 기능 제공
- 리소스 자동 할당 (추정값을 자동으로 리소스 설정에 반영하는 것)
- CLI 플래그 → 환경변수 이중 매핑 (start_command에 플래그가 이미 포함되므로 불필요)
- 감지된 런타임 이름의 UI 노출 (내부 힌트로만 사용)
- 전체 CLI 파싱 (모든 플래그 분석, env var 매핑 등) — `--port`와 `--tp`/`--tensor-parallel-size`만 최소 파싱
- **서비스 수정(Edit) 모드 지원** — 기존 서비스의 runtime_variant와 model-definition.yaml이 확정된 상태에서 명령어 재파싱은 정합성 문제를 유발할 수 있으므로, 첫 버전에서는 신규 생성에만 적용

## 관련 컨텍스트

### 기존 코드 참조

- `react/src/components/ServiceLauncherPageContent.tsx` — 서비스 런처 메인 UI, CUSTOM variant 선택 시 UI (라인 1041-1088)
- `react/src/hooks/useModelServiceLauncher.ts` — 서비스 실행 로직, definition 파일 파싱
- `react/src/hooks/useVariantConfigs.ts` — runtime별 환경변수 설정 (VLLM, SGLANG, NIM)
- `react/src/components/ServiceLauncherPageContent.tsx:400-486` — 서비스 생성 mutation (yaml 업로드 로직 삽입 지점)

### Runtime Profile 기본값 (파싱 시 fallback으로 사용)

| Runtime | 기본 Port | Health Check Path |
|---------|-----------|-------------------|
| VLLM | 8000 | /health |
| SGLANG | 9001 | /health |
| HUGGINGFACE_TGI | 3000 | /info |
| NIM | 8000 | /v1/health/ready |
| MODULAR_MAX | 8000 | /health |
| CMD | 8000 | (없음) |
| CUSTOM | (없음) | (없음) |

### model-definition.yaml 구조

```yaml
models:
  - name: "model-name"
    model_path: "/models"
    service:
      start_command:
        - vllm
        - serve
        - /models/my-model
        - --tensor-parallel-size
        - "2"
      port: 8000
      health_check:
        path: /health
        initial_delay: 5.0
        max_retries: 10
```

### Backend.AI 자동 주입 환경변수 (파싱 결과에서 제외 대상)

- `BACKEND_MODEL_NAME` — Backend.AI가 model definition의 name에서 설정
- `BACKEND_MODEL_PATH` — Backend.AI가 model definition의 model_path에서 설정
- `GPU_TYPE`, `GPU_MODEL_NAME`, `GPU_CONFIG` — 하드웨어 할당에서 설정
- `GPU_COUNT`, `N_GPUS` — 가속기 수에서 설정
- `TF_GPU_MEMORY_ALLOC` — GPU 메모리 할당에서 설정

### 관련 스펙

- `.specs/FR-1927-model-store-improvement/spec.md` — Model Store 개선 (서비스 실행 플로우 관련)
