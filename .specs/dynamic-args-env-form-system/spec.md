# 동적 Args/Env 폼 시스템 Spec

## 개요

모델 서빙 시 필요한 설정 파라미터(args, env)를 런타임별로 동적으로 렌더링하는 프론트엔드 시스템. 백엔드 DB에 저장된 파라미터 메타데이터(스키마, 런타임별 매핑, 우선순위 등)를 조회하여, 런타임(vLLM, sGLang, Custom 등)에 맞는 폼을 자동으로 생성한다. 우선순위에 따라 자주 사용하는 옵션을 먼저 노출하고, 고급 설정은 접어두는 방식으로 사용자 경험을 개선한다.

> **참고**: 이 스펙은 2개 레이어 중 두 번째에 해당합니다.
> 1. **모델 카드 관리** (스펙 1) — 모델 카드 CRUD, 공개/비공개, 최소 서비스 정의
> 2. **동적 Args/Env 폼 시스템** (본 스펙) — JSON schema 기반 동적 폼, 런타임별 args/env 매핑, 우선순위 랭크. 고급 서비스 정의는 Nice to Have

## 배경: Args vs Env의 현실

모델 서빙 런타임(vLLM, sGLang, llama.cpp 등)마다 같은 개념의 설정이 서로 다른 방식으로 전달된다:

| 설정 | vLLM | sGLang | llama.cpp |
|------|------|--------|-----------|
| Tensor Parallelism | `--tensor-parallel-size` (arg) | `--tp` (arg) | N/A |
| GPU 메모리 비율 | `--gpu-memory-utilization` (arg) | `--mem-fraction-static` (arg) | N/A |
| 최대 컨텍스트 | `--max-model-len` (arg) | `--context-length` (arg) | `-c` (arg) |
| Quantization | `--quantization` (arg) | `--quantization` (arg) | GGUF 파일에 내장 |

설정은 크게 3가지 레이어로 나뉜다:

1. **서버 시작 Args**: 런타임 프로세스 시작 시 전달하는 CLI 인자. 런타임별로 flag 이름이 다르지만, 같은 레이어 내에서 args↔env가 바뀌는 경우는 거의 없음
2. **환경 변수(Env)**: 런타임/인프라 레벨 설정 (VLLM_*, CUDA_VISIBLE_DEVICES, NCCL_* 등). vLLM은 200개+ VLLM_* env var를 가지며, sGLang은 상대적으로 적음
3. **API 파라미터**: 추론 요청 시 전달 (temperature, max_tokens 등). OpenAI API 호환이라 런타임 간 거의 동일. 본 스펙에서는 1, 2번 레이어를 다루며, API 파라미터는 기존 서비스 배포 UI에서 처리

## 문제 정의

1. **런타임별 설정 차이를 사용자가 직접 파악해야 함**: 같은 "tensor parallelism" 설정이 vLLM에서는 `--tensor-parallel-size`, sGLang에서는 `--tp`이며, 사용자가 이를 매번 확인해야 한다.
2. **설정 옵션이 너무 많아 압도적임**: vLLM만 해도 수십 개의 서버 인자와 200개+ 환경 변수가 존재. 대부분의 사용자는 5~10개의 핵심 설정만 필요.
3. **모델별 권장 serving parameter를 사전 정의하여 배포 시 자동 적용할 수 없음**: `model-definition.yaml`에서 서비스 기동 설정(start_command, port, health check)은 정의할 수 있지만, 런타임별 serving parameter(quantization, context length, GPU 메모리 사용률 등)를 권장값으로 사전 정의하고 배포 시 자동으로 채워주는 공식적인 메커니즘은 없다.
4. **설정 폼이 정적임**: 런타임이 바뀌면 유효한 설정도 바뀌지만, 현재 UI는 이를 동적으로 반영하지 못한다.

## 설계 방향: 선언적 파라미터 메타데이터

파라미터 정의(스키마)는 백엔드 DB에서 관리하며, 프론트엔드는 이를 조회하여 동적으로 폼을 렌더링한다. 각 파라미터에 대해 식별자, UI 렌더링 힌트, 값 제약 조건, 카테고리, 런타임별 매핑이 포함된 메타데이터를 백엔드에서 제공하면, UI는 이를 읽어 폼을 자동 생성한다.

```typescript
// 파라미터 메타데이터 구조 예시
interface ParameterMeta {
  key: string;                    // 파라미터 식별자
  displayName: string;            // UI 표시명
  description: string;            // 설명
  dataType: "number" | "string" | "boolean";  // 값의 실제 데이터 타입
  uiType: "slider" | "input" | "checkbox" | "radio" | "dropdown";  // UI 렌더링 타입
  constraints?: {
    min?: number;
    max?: number;
    step?: number;
    options?: { value: string; label: string }[];
  };
  defaultValue?: any;
  category: "resource" | "optimization" | "inference" | "advanced";
  priority: number;               // 우선순위 (낮을수록 먼저 노출)
  runtimeMapping: {
    [runtime: string]: {          // "vllm" | "sglang" | "custom" | ...
      method: "arg" | "env";
      flag: string;               // 예: "--tensor-parallel-size" 또는 "VLLM_TP_SIZE"
    } | null;                     // null = 해당 런타임 미지원
  };
}
```

위 구조는 프론트엔드가 필요로 하는 정보를 예시한 것이며, 실제 백엔드 API 응답 포맷은 백엔드 스펙에 따른다. 핵심은 **런타임별 차이를 추상화**할 수 있는 매핑 정보와, **핵심 설정을 먼저 노출**할 수 있는 우선순위 정보가 어떤 형태로든 제공되어야 한다는 점이다.

## 요구사항

### Must Have

- [ ] 백엔드가 제공하는 파라미터 정의 스키마를 소비: 백엔드가 제공하는 메타데이터를 조회하여 폼 생성. 제공 방식(GraphQL 타입, JSONString 필드 등)은 백엔드 스펙에 따르되, 프론트엔드가 기대하는 최소 데이터 구조는 아래와 같음:
  - [ ] 파라미터 식별자(key), 표시명, 설명
  - [ ] 데이터 타입 및 UI 렌더링 힌트 (숫자 슬라이더, 드롭다운, 체크박스, 텍스트 입력 등)
  - [ ] 값 제약 조건 (min, max, step, 허용값 목록 등)
  - [ ] 기본값
  - [ ] 카테고리 분류 (예: 리소스, 최적화, 추론 파라미터, 고급 설정)
- [ ] 런타임별 매핑 반영: 백엔드가 제공하는 런타임별 매핑 정보를 기반으로 폼을 렌더링
  - [ ] 전달 방식(CLI arg / 환경 변수)에 따라 적절히 표시
  - [ ] 런타임별 flag 이름 차이를 추상화 (예: tensor_parallelism → vLLM: `--tensor-parallel-size`, sGLang: `--tp`)
  - [ ] 특정 런타임에서 지원하지 않는 파라미터는 해당 런타임 선택 시 폼에서 숨김
- [ ] 우선순위(priority, 값이 낮을수록 우선) 시스템
  - [ ] 각 파라미터에 우선순위(priority) 값 부여 (백엔드 DB에 사전 정의된 정수 값 사용, 값이 작을수록 우선순위가 높음)
  - [ ] priority 값이 낮은(=우선순위 높은) 파라미터는 기본 노출, priority 값이 높은(=우선순위 낮은) 파라미터는 "고급 설정" 섹션에 접힘
- [ ] 동적 폼 렌더링
  - [ ] 런타임 선택에 따라 유효한 파라미터만 표시
  - [ ] 파라미터 정의에 따라 적절한 UI 컴포넌트 자동 선택 (슬라이더, 드롭다운 등)
  - [ ] 카테고리별 그룹핑 및 고급 설정 토글
- [ ] 어드민 모델 카드 편집 연동 (스펙 1)
  - [ ] 모델 카드 편집 화면에서 이 폼 컴포넌트를 사용하여 모델별 권장 파라미터 값을 설정
  - [ ] 설정된 권장값이 모델 카드와 함께 백엔드에 저장됨
  - [ ] 스펙 1의 "최소 서비스 정의"(런타임, GPU 수, GPU 메모리)는 전용 필드로 유지하고, 본 폼은 그 외 상세 파라미터를 담당

### Nice to Have

- [ ] 파라미터 프리셋: 모델 크기별(Small/Medium/Large) 또는 용도별(개발/프로덕션) 프리셋 정의
- [ ] 파라미터 검증: 값 입력 시 실시간 유효성 검증 (범위 초과, 타입 불일치 등)
- [ ] 파라미터 의존성: 특정 파라미터 선택 시 다른 파라미터가 활성화/비활성화 (예: quantization 선택 시 관련 옵션 노출)
- [ ] 파라미터 가져오기/내보내기: JSON 형태로 설정 내보내기 및 가져오기
- [ ] 커스텀 파라미터: 사전 정의된 파라미터 외에 사용자가 임의의 arg/env를 key-value 형태로 추가
- [ ] 고급 서비스 정의
  - [ ] start_command 커스터마이징: 런타임 기본 명령어를 관리자가 덮어쓰기
  - [ ] health check 상세 설정: path, interval, timeout, initial_delay 조정
  - [ ] pre-start actions 설정: 서비스 시작 전 실행할 사전 작업 정의

## 사용자 스토리

- 관리자로서, 런타임에 구애받지 않고 통일된 폼에서 모델별 파라미터 값을 설정하고 싶다. 그래야 런타임이 바뀌어도 같은 개념의 설정을 일관되게 관리할 수 있다.
- 관리자로서, 자주 사용하는 핵심 파라미터가 먼저 보이고 고급 설정은 접혀 있었으면 좋겠다. 그래야 사용자가 핵심 설정에 집중하고 고급 설정에 압도되지 않는다.
- 관리자로서, 특정 모델 카드에 권장 파라미터 값을 미리 설정해두고 싶다. 그래야 사용자가 별도 조사 없이 최적 설정으로 바로 배포할 수 있다.
- 사용자로서, 모델 배포 시 런타임에 맞는 설정 폼을 자동으로 보고 싶다. 그래야 어떤 flag를 어떤 형식으로 전달해야 하는지 외울 필요가 없다.
- 사용자로서, 관리자가 사전 설정한 권장값을 확인하고 필요하면 조정하고 싶다. 그래야 대부분의 경우 기본값으로 빠르게 시작하면서도 필요 시 커스터마이징이 가능하다.

> **향후 필요**: 사용자 서비스 배포 UI에서 이 폼 컴포넌트를 재사용하여, 관리자가 설정한 권장값을 기본으로 보여주고 사용자가 오버라이드할 수 있는 기능 (별도 스펙)

## 인수 조건 (Acceptance Criteria)

### 파라미터 정의 스키마

- [ ] 파라미터 정의가 아래 구조를 포함:
  ```
  key, displayName, description, dataType, uiType,
  constraints (min/max/step/options), defaultValue,
  category, runtimeMapping (per-runtime arg/env flag),
  priority
  ```
- [ ] 백엔드에서 제공하는 파라미터 정의를 기반으로 폼이 렌더링됨
- [ ] 기본 파라미터 세트(vLLM/sGLang 핵심 파라미터)가 백엔드에 사전 등록되어 있음

### 런타임별 매핑

- [ ] 런타임 선택 시 해당 런타임에서 지원하지 않는 파라미터가 폼에서 자동으로 숨겨짐
- [ ] 같은 파라미터가 런타임에 따라 올바른 arg/env 형태로 변환됨
- [ ] 새로운 런타임이 백엔드에 추가되면 프론트엔드 코드 변경 없이 폼이 자동 반영됨

### 우선순위 시스템

- [ ] priority 값을 오름차순으로 정렬했을 때 앞의 N개(=priority 값이 가장 낮은 N개) 파라미터가 기본 노출 영역에 표시됨
- [ ] 나머지 파라미터는 "고급 설정" 토글 뒤에 숨겨짐
- [ ] 백엔드에서 제공하는 priority 값을 기준으로 오름차순 정렬됨 (priority 값이 낮을수록 먼저 노출)

### 동적 폼 렌더링

- [ ] 숫자 타입 파라미터: 슬라이더 또는 숫자 입력 (min/max/step 적용)
- [ ] 선택 타입 파라미터: 드롭다운 또는 라디오 버튼
- [ ] 불리언 타입 파라미터: 체크박스 또는 토글
- [ ] 텍스트 타입 파라미터: 텍스트 입력
- [ ] 각 파라미터 옆에 설명 툴팁 표시

### 어드민 모델 카드 편집 연동

- [ ] 모델 카드 편집 시 이 폼 컴포넌트로 모델별 권장 파라미터 값을 설정 가능
- [ ] 설정된 권장값이 모델 카드와 함께 백엔드에 저장됨

## 범위 밖 (Out of Scope)

- 파라미터 정의의 버전 관리 (이력 추적)
- 런타임별 파라미터 자동 검출 (런타임에서 지원하는 파라미터를 자동으로 파악하는 기능)
- GPU 리소스 프리셋 시스템 (Small/Medium/Large 프리셋 정의는 Nice to Have로 별도 검토)

## 참고: 핵심 파라미터 초기 세트 (예시)

시스템에 사전 등록할 파라미터 예시:

| key | category | priority | vLLM arg | sGLang arg | 설명 |
|-----|----------|----------|----------|------------|------|
| tensor_parallelism | 리소스 | 1 | `--tensor-parallel-size` | `--tp` | GPU 분산 수 |
| gpu_memory_utilization | 리소스 | 2 | `--gpu-memory-utilization` | `--mem-fraction-static` | GPU 메모리 사용률 |
| max_model_len | 리소스 | 3 | `--max-model-len` | `--context-length` | 최대 컨텍스트 길이 |
| quantization | 최적화 | 4 | `--quantization` | `--quantization` | 양자화 방식 |
| dtype | 최적화 | 5 | `--dtype` | `--dtype` | 데이터 타입 |
| max_num_seqs | 성능 | 6 | `--max-num-seqs` | `--max-running-requests` | 최대 동시 요청 수 |
| pipeline_parallelism | 리소스 | 10 | `--pipeline-parallel-size` | N/A | 파이프라인 병렬 |
| enforce_eager | 고급 | 15 | `--enforce-eager` | `--disable-cuda-graph` (deprecated 가능성 있음) | CUDA graph 비활성화 |

> 위 목록은 백엔드에 사전 등록할 초기 세트 예시이며, 새로운 런타임/모델 등장 시 백엔드에서 확장한다.

## 관련 이슈

- [FR-2418](https://lablup.atlassian.net/browse/FR-2418) — Dynamic Args/Env Form System - Define feature spec
- 선행 스펙: [스펙 1 - 관리자 모델 카드 관리](../admin-model-card-management/spec.md) ([FR-2417](https://lablup.atlassian.net/browse/FR-2417))
