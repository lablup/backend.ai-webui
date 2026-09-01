# 런타임 파라미터 설정 UI 스펙

> **Epic**: FR-2446 ([link](https://lablup.atlassian.net/browse/FR-2446))

## 개요

모델 서비스 런처에서 vLLM 또는 SGLang 런타임 선택 시, 사용자가 슬라이더/입력 컨트롤을 통해 런타임 파라미터(샘플링, 컨텍스트/엔진 설정 등)를 직관적으로 설정할 수 있는 UI를 제공한다.

`VLLM_EXTRA_ARGS`, `SGLANG_EXTRA_ARGS`는 Backend.AI 고유의 환경 변수로, 표준 vLLM/SGLang을 사용해 온 사용자에게는 생소한 개념이다. 이 UI는 사용자가 이러한 Backend.AI 전용 변수의 존재를 알 필요 없이, 표준 vLLM/SGLang 파라미터명으로 설정하면 내부적으로 올바른 환경 변수 형식으로 자동 변환해 준다.

## 문제 정의

현재 vLLM/SGLang의 런타임 파라미터를 조정하려면 사용자가 `VLLM_EXTRA_ARGS` 환경 변수에 `--max-model-len 4096 --gpu-memory-utilization 0.9`와 같은 CLI 인자 문자열을 직접 입력해야 한다. 이는 다음 문제를 야기한다:

1. **Backend.AI 전용 변수에 대한 인지 부담**: `VLLM_EXTRA_ARGS`와 `SGLANG_EXTRA_ARGS`는 표준 vLLM/SGLang 환경 변수가 아니라 Backend.AI가 자체적으로 정의한 환경 변수이다. 표준 vLLM/SGLang만 사용해 본 사용자는 이 변수의 존재와 용도를 별도로 학습해야 한다.
2. **높은 진입 장벽**: vLLM/SGLang CLI 인자 이름, 유효 범위, 기본값을 사전에 알아야 함
3. **오류 가능성**: 오타, 범위 초과 값, 잘못된 인자명 등 실수를 검증할 수단이 없음
4. **런타임 간 차이 인지 부담**: vLLM과 SGLang이 서로 다른 인자명과 범위를 사용하는 것을 사용자가 파악해야 함
5. **샘플링 외 설정 부재**: 컨텍스트 크기, 배치 크기 등 엔진/서버 설정도 동일한 extra args 메커니즘을 통해 설정해야 하지만, 현재 이를 안내하는 UI가 없음

서버에서 런타임별 파라미터 스키마를 제공하고, 프론트엔드가 이를 기반으로 동적 UI를 렌더링하면 위 문제를 해결할 수 있다.

## 요구사항

### 필수 (Must Have)

- [ ] 런타임 variant가 `vllm` 또는 `sglang`일 때만 런타임 파라미터 섹션 표시
- [ ] 파라미터 메타데이터(서버 GraphQL `RuntimeVariantPreset` 또는 프론트엔드 fallback)를 기반으로 UI 컴포넌트 동적 렌더링
- [ ] 파라미터를 카테고리별로 그룹화하여 표시 (`sampling`, `context`, `advanced`)
- [ ] 파라미터 타입별 적절한 UI 컴포넌트 매핑: slider, number input, select, checkbox
- [ ] 각 파라미터의 유효 범위(min/max/step) 제약 적용
- [ ] 사용자가 조정한 파라미터 값을 해당 런타임의 환경 변수(`VLLM_EXTRA_ARGS` 또는 `SGLANG_EXTRA_ARGS`)로 자동 변환
- [ ] UI에서 생성한 인자와 사용자가 수동으로 EXTRA_ARGS 텍스트 필드에 입력한 인자를 병합 (충돌 시 수동 입력 우선)
- [ ] 파라미터 스키마에 포함된 `rank` (중요도) 필드를 기준으로 파라미터 정렬/표시 순서 결정
- [ ] 기본값과 다른 값만 extra args 문자열에 포함 (불필요한 인자 전달 방지)
- [ ] 서비스 편집 시 기존 `VLLM_EXTRA_ARGS`/`SGLANG_EXTRA_ARGS` 값을 파싱하여 UI에 역매핑
- [ ] 파라미터 스키마 API 실패 또는 미지원 시 기존 텍스트 입력 방식으로 graceful fallback
- [ ] Runtime Variant 선택 영역 바로 아래에 배치 (vllm/sglang 선택 시 항상 표시, Advanced 모드와 무관)

### 있으면 좋은 것 (Nice to Have)

- [ ] 파라미터를 "기본 표시"와 "고급 표시"로 구분: `category`가 `"sampling"` 또는 `"context"`인 파라미터는 기본 노출, `"advanced"`는 "더 보기"로 펼침
- [ ] "기본값으로 초기화" 버튼으로 모든 파라미터를 서버 제공 기본값으로 리셋
- [ ] 각 파라미터 옆 tooltip으로 설명(description) 표시
- [ ] 서비스 편집 시 변경된 파라미터 값 하이라이트
- [ ] 병합 시 충돌이 발생한 파라미터에 대해 경고 표시 (예: "수동 입력 값이 UI 설정값을 덮어씁니다")

## 서버 파라미터 스키마 (GraphQL API)

### 기존 GraphQL 타입 활용

Backend.AI 서버는 이미 `RuntimeVariantPreset` GraphQL 타입을 통해 런타임별 설정 가능 파라미터를 관리하고 있다. 프론트엔드는 이 기존 API를 활용한다.

**GraphQL 쿼리 (제안)**:

프론트엔드는 런타임 variant **이름**(`"vllm"`, `"sglang"`)만 알고 있으므로, 2단계 쿼리가 필요하다:

1단계: `runtimeVariants`에서 variant 이름으로 UUID 조회
2단계: `runtimeVariantPresets`에서 해당 UUID로 프리셋 목록 조회

```graphql
# 1단계: variant 이름 → UUID
query RuntimeVariantByNameQuery($filter: RuntimeVariantFilter) {
  runtimeVariants(filter: $filter) {
    edges {
      node {
        id
        rowId
        name
      }
    }
  }
}

# 2단계: UUID로 프리셋 조회
query RuntimeVariantPresetsQuery(
  $filter: RuntimeVariantPresetFilter
  $orderBy: [RuntimeVariantPresetOrderBy!]
) {
  runtimeVariantPresets(
    filter: $filter
    orderBy: $orderBy
  ) {
    edges {
      node {
        id
        rowId
        name
        description
        rank
        targetSpec {
          presetTarget    # "env" | "args"
          valueType       # "str" | "int" | "float" | "bool"
          defaultValue    # 문자열 또는 null
          key             # env: 환경변수명, args: CLI 플래그명
        }
      }
    }
    count
  }
}
```

> **참고**: `RuntimeVariantPresetFilter`는 현재 `runtimeVariantId` (UUID)만 지원한다. 향후 variant 이름으로 직접 필터링할 수 있도록 서버 확장 시 1단계 쿼리를 생략할 수 있다.

### 서버 확장 필요 사항

현재 `RuntimeVariantPreset`의 `target_spec`은 기본적인 타입 정보(`value_type`, `default_value`, `key`)만 제공한다. 슬라이더 UI 렌더링을 위해 다음 필드가 추가되어야 한다:

```jsonc
// target_spec 확장 (제안)
{
  "preset_target": "args",
  "value_type": "float",
  "default_value": "1.0",
  "key": "--temperature",
  // === 추가 필요 필드 ===
  "category": "sampling",        // "sampling" | "context" | "advanced"
  "ui_type": "slider",           // "slider" | "number_input" | "select" | "checkbox" | "text_input"
  "min": 0.0,                    // numeric 타입 최소값
  "max": 2.0,                    // numeric 타입 최대값
  "step": 0.05,                  // 슬라이더/입력 증감 단위
  "options": [                   // enum 타입일 때 선택지 (선택)
    { "value": "auto", "label": "Auto" }
  ]
}
```

> **참고**: 서버 확장이 완료되기 전까지는 프론트엔드에서 런타임별 하드코딩된 기본 메타데이터를 fallback으로 사용할 수 있다. 서버 스키마가 제공되면 서버 값을 우선 사용한다.

### 파라미터 카테고리 및 예시

#### 샘플링 파라미터 (category: "sampling")

| 파라미터 | vLLM CLI 플래그 | SGLang CLI 플래그 | 타입 | 범위 (step) | UI 기본값 | rank | 비고 |
|---------|----------------|------------------|------|-------------|-----------|------|------|
| temperature | `--temperature` | `--temperature` | float | 0.0 - 2.0 (0.05) | 0.8 | 1 | vLLM 실제 기본값은 1.0이나, 일반적 추론 용도에 맞춰 0.8 사용 |
| top_p | `--top-p` | `--top-p` | float | 0.0 - 1.0 (0.05) | 0.9 | 2 | |
| top_k | `--top-k` | `--top-k` | int | -1 - 100 (1) | 40 | 3 | vLLM 런타임 기본값=0(disabled), SGLang=-1(disabled). UI에서는 활성 상태의 합리적 기본값 40 사용. -1=disabled |
| min_p | `--min-p` | `--min-p` | float | 0.0 - 1.0 (0.05) | 0.1 | 4 | |
| frequency_penalty | `--frequency-penalty` | `--frequency-penalty` | float | 0.0 - 2.0 (0.1) | 0.0 | 5 | |
| presence_penalty | `--presence-penalty` | `--presence-penalty` | float | 0.0 - 2.0 (0.1) | 0.0 | 6 | |
| repetition_penalty | `--repetition-penalty` | `--repetition-penalty` | float | 1.0 - 2.0 (0.05) | 1.0 | 7 | |
| seed | `--seed` | `--seed` | int | -1 - 2147483647 (1) | -1 | 8 | |

> **UI 기본값 vs 런타임 기본값**: 위 "UI 기본값"은 프론트엔드 fallback에서 슬라이더 초기 위치로 사용하는 값이며, 실제 vLLM/SGLang 런타임의 기본값과 다를 수 있다. 서버 스키마가 확장되면 서버에서 런타임별 정확한 기본값을 제공하여 이 차이를 해소한다.

#### 컨텍스트/엔진 파라미터 (category: "context")

| 파라미터 | vLLM CLI 플래그 | SGLang CLI 플래그 | 타입 | 범위 (step) | 기본값 | rank |
|---------|----------------|------------------|------|-------------|--------|------|
| max_model_len / context_length | `--max-model-len` | `--context-length` | int | 512 - 131072 (512) | 4096 | 1 |
| gpu_memory_utilization | `--gpu-memory-utilization` | `--mem-fraction-static` | float | 0.0 - 1.0 (0.05) | 0.9 | 2 |

#### 고급 엔진 파라미터 (category: "advanced")

| 파라미터 | vLLM CLI 플래그 | SGLang CLI 플래그 | 타입 | 기본값 | rank |
|---------|----------------|------------------|------|--------|------|
| enforce_eager / disable_cuda_graph | `--enforce-eager` | `--disable-cuda-graph` | bool | false | 1 |
| dtype | `--dtype` | `--dtype` | enum ("auto", "float16", "bfloat16", "float32") | "auto" | 2 |
| kv_cache_dtype | `--kv-cache-dtype` | `--kv-cache-dtype` | enum ("auto", "f32", "f16", "bf16", "q8_0", "q4_0", "q4_1", "q5_0", "q5_1") | "auto" | 3 |
| trust_remote_code | `--trust-remote-code` | `--trust-remote-code` | bool | false | 4 |

### 스키마 설계 원칙

1. **`target_spec.key`가 핵심**: `preset_target`이 `"args"`인 경우, `key` 값이 CLI 플래그명이며 프론트엔드는 이를 사용하여 `VLLM_EXTRA_ARGS`/`SGLANG_EXTRA_ARGS` 문자열을 조립함. `"env"`인 경우 별도 환경 변수로 설정.
2. **`rank`로 중요도 표현**: rank 값이 작을수록 상단에 표시, 일정 rank 이상은 "고급" 그룹으로 분류 가능
3. **`default_value`가 null**: 해당 파라미터는 선택적이며, 명시적으로 설정하지 않으면 런타임 자체 기본값 사용
4. **`category`로 그룹화**: UI에서 "샘플링", "컨텍스트/엔진", "고급" 탭 또는 섹션으로 구분하여 표시
5. **런타임별 차이는 서버가 관리** (목표 상태): vLLM과 SGLang의 인자명/범위 차이를 서버 스키마에서 흡수. 프론트엔드는 스키마만 읽고 렌더링. 단, 서버 확장 전까지는 프론트엔드 fallback 메타데이터에서 런타임별 차이를 직접 관리한다 (`// TODO(needs-backend): FR-2446`).

### vLLM vs SGLang 주요 차이점

아래 차이점은 서버가 런타임별로 적절한 스키마를 반환하여 처리한다.

| 구분 | vLLM | SGLang |
|------|------|--------|
| 환경 변수 | `VLLM_EXTRA_ARGS` | `SGLANG_EXTRA_ARGS` |
| 서버 시작 인자 형식 | `--flag value` | `--flag value` (대부분 동일) |
| temperature 런타임 기본값 | 1.0 | model config 또는 1.0 (UI 기본값은 0.8) |
| top_k 런타임 기본값 | 0 (=disabled) | -1 (=disabled) (UI 기본값은 40) |
| gpu_memory_utilization | `--gpu-memory-utilization` | `--mem-fraction-static` |
| max_model_len | `--max-model-len` | `--context-length` |
| enforce_eager | `--enforce-eager` | `--disable-cuda-graph` |
| dtype 플래그 | `--dtype` | `--dtype` |

> **참고**: 위 차이점의 세부 사항은 서버 개발 시 각 런타임 버전별로 정확히 매핑해야 한다. 프론트엔드는 서버가 반환한 스키마를 그대로 사용하므로 런타임 간 차이를 직접 처리하지 않는다.

## 사용자 스토리

- **ML 엔지니어**로서, vLLM으로 모델 서비스를 생성할 때 temperature와 top_p를 슬라이더로 간편하게 조정하여 최적의 추론 설정을 찾고 싶다.
- **ML 엔지니어**로서, 컨텍스트 크기(max_model_len)와 GPU 메모리 사용률을 슬라이더로 직관적으로 설정하고 싶다. `VLLM_EXTRA_ARGS`라는 Backend.AI 전용 변수를 별도로 학습하고 싶지 않다.
- **데이터 사이언티스트**로서, SGLang 런타임의 가용 파라미터를 CLI 문서를 찾아보지 않고도 UI에서 확인하고 설정하고 싶다.
- **플랫폼 관리자**로서, 사용자들이 잘못된 extra args 문자열로 서비스 시작에 실패하는 일을 줄이고 싶다.
- **사용자**로서, 기존 서비스를 편집할 때 이전에 설정한 런타임 파라미터 값이 슬라이더에 그대로 반영되어 있길 원한다.
- **사용자**로서, UI 슬라이더로 설정한 값과 직접 텍스트로 입력한 extra args가 충돌할 때, 내가 직접 입력한 값이 우선 적용되길 원한다.
- **사용자**로서, 서버가 파라미터 스키마를 아직 지원하지 않는 경우에도 기존처럼 텍스트 입력으로 extra args를 직접 입력할 수 있어야 한다.

## 인수 조건 (Acceptance Criteria)

### 조건부 표시

- [ ] `runtimeVariant`가 `vllm`일 때 런타임 파라미터 UI 섹션 표시
- [ ] `runtimeVariant`가 `sglang`일 때 런타임 파라미터 UI 섹션 표시
- [ ] `runtimeVariant`가 `custom`, `nim` 등 vllm/sglang 이외일 때 해당 섹션 미표시
- [ ] `runtimeVariant` 변경 시 기존 파라미터 값 유지 (사용자 액션 없이 자동으로 값을 변경하지 않음)

### 동적 렌더링

- [ ] 파라미터 메타데이터의 `ui_type: "slider"` 파라미터에 Ant Design Slider + InputNumber 조합 렌더링
- [ ] 파라미터 메타데이터의 `ui_type: "number_input"` 파라미터에 InputNumber 렌더링
- [ ] 파라미터 메타데이터의 `ui_type: "select"` 파라미터에 Select 렌더링
- [ ] 파라미터 메타데이터의 `ui_type: "checkbox"` 파라미터에 Checkbox 렌더링
- [ ] 파라미터 목록은 `rank` 오름차순으로 정렬하여 표시
- [ ] 파라미터는 `category`별로 그룹화하여 표시 (`sampling`, `context`, `advanced`)
- [ ] 각 파라미터에 `min`, `max`, `step` 제약이 UI에 적용됨
- [ ] 메타데이터에 없는 `ui_type`은 `text_input`으로 fallback

### 환경 변수 변환 및 병합

- [ ] 사용자가 설정한 파라미터 중 기본값과 다른 값만 수집
- [ ] `preset_target: "args"`인 파라미터는 `{key} {value}` 형식으로 조립 (예: `--temperature 0.7 --top-p 0.95`)
- [ ] `preset_target: "env"`인 파라미터는 별도 환경 변수로 설정
- [ ] 조립된 args 문자열을 해당 런타임의 환경 변수(`VLLM_EXTRA_ARGS` 또는 `SGLANG_EXTRA_ARGS`)에 설정
- [ ] bool 타입 파라미터: `true`일 때 `{key}`만 추가, `false`일 때 생략
- [ ] **병합 동작**: 사용자가 EXTRA_ARGS 텍스트 필드에 직접 입력한 인자와 UI에서 생성한 인자를 병합
  - UI에서 생성한 인자: 서버 스키마 기반 `{key: value}` 맵으로 관리 (각 key는 실제 CLI 플래그 문자열, 예: `--temperature`)
  - 텍스트 필드 수동 입력 인자: 아래 문법을 기준으로 파싱하여 `{key: value}` 맵으로 변환
    - 지원 문법:
      - `--flag value` (공백 구분)
      - `--flag=value` (= 구분)
      - 값에 공백이 포함된 경우 `"value with space"` 또는 `'value with space'` 따옴표 지원
      - bool 옵션: `--flag`만 존재 시 `true`, `--no-flag` 존재 시 `false`
      - 동일 옵션에 `--flag`와 `--no-flag` 모두 존재 시 나중에 등장한 값 우선 (last-wins)
    - 비지원/제한 사항:
      - short 옵션(`-f`, `-abc` 등)은 파싱 대상에서 제외, 원문 문자열로만 보존
      - 인자 이름 없이 값만 존재하는 토큰, 비정상 인용 등은 파싱 실패로 간주하고 원문 텍스트만 유지
  - 중복 및 우선순위 규칙:
    - 동일 key가 하나의 소스(UI 또는 수동) 내에서 여러 번 등장 시 나중 값 우선 (last-wins)
    - UI 맵과 수동 입력 맵 병합 시 동일 key에 대해 **수동 입력 값이 UI 값을 덮어씀**
  - 최종 병합 결과를 CLI 인자 문자열로 직렬화하여 `VLLM_EXTRA_ARGS`/`SGLANG_EXTRA_ARGS` 값으로 설정

### 편집 모드 역매핑

- [ ] 기존 서비스의 `VLLM_EXTRA_ARGS`/`SGLANG_EXTRA_ARGS` 값에서 위 병합 동작과 동일한 문법으로 파싱
- [ ] 파싱된 값을 서버 스키마의 `target_spec.key`와 대조하여 해당 파라미터 UI에 매핑 (매핑 가능한 플래그는 UI 컨트롤 값으로 복원)
- [ ] 스키마에 없는 인자나 파싱 규칙 바깥의 토큰(short 옵션, 파싱 실패 토큰 등)은 별도 "추가 인자" 텍스트 필드에 원문 그대로 표시

### Fallback 동작

Fallback은 2단계로 동작한다:
- **1단계**: GraphQL 쿼리 실패 또는 빈 결과 → 프론트엔드 하드코딩 fallback 메타데이터로 슬라이더/입력 UI 렌더링 (사용자 경험 유지)
- **2단계**: 하드코딩 fallback도 해당 런타임을 지원하지 않는 경우 → 기존 `EXTRA_ARGS` 텍스트 입력 UI로 fallback

인수 조건:
- [ ] GraphQL 쿼리 실패 시 (네트워크 오류, 서버 미지원) 프론트엔드 하드코딩 fallback으로 슬라이더 UI 렌더링
- [ ] 하드코딩 fallback에도 해당 런타임 메타데이터가 없을 시 기존 텍스트 입력 UI로 graceful fallback
- [ ] 모든 fallback 상태에서도 `VLLM_EXTRA_ARGS`/`SGLANG_EXTRA_ARGS` 텍스트 직접 입력 가능

### 배치 위치

- [ ] 런타임 파라미터 UI는 Runtime Variant 선택 영역 바로 아래에 위치 (기본 모드에서 항상 표시)
- [ ] FR-2444 Advanced 모드와 독립적 — Advanced 토글 상태와 무관하게 vllm/sglang 선택 시 항상 보임

## 범위 밖 (Out of Scope)

- 서버 측 `RuntimeVariantPreset`에 `category`, `ui_type`, `min/max/step` 등 확장 필드 추가 구현 (이 스펙의 제안을 바탕으로 별도 서버 개발 진행)
- vLLM/SGLang 외 다른 런타임(nim, custom 등)의 파라미터 UI
- 요청 수준(per-request) 샘플링 파라미터 UI (이 스펙은 서비스 시작 시 서버 기본값 설정에 초점)
- 파라미터 프리셋/템플릿 저장 기능
- 파라미터 간 상호 의존성 검증 (예: temperature=0이면 top_p 무시 등 — 향후 확장)
- `VLLM_EXTRA_ARGS`/`SGLANG_EXTRA_ARGS` 이외의 런타임별 환경 변수(예: `VLLM_TP_SIZE`, `VLLM_QUANTIZATION`) 통합 (이들은 기존 `useRuntimeEnvVarConfigs`에서 별도 처리)

## 프론트엔드 구현 전략

### Fallback 우선 접근

현재 서버의 `PresetTargetSpec`은 기본 필드(`preset_target`, `value_type`, `default_value`, `key`)만 제공하며, UI 렌더링에 필요한 확장 필드(`category`, `ui_type`, `min`, `max`, `step`, `options`)는 아직 지원하지 않는다.

따라서 프론트엔드에서 런타임별 파라미터 메타데이터를 **하드코딩 fallback으로 먼저 구현**하고, 서버 확장이 완료되면 서버 데이터를 우선 사용하도록 전환한다. 모든 fallback 코드에는 `// TODO(needs-backend): FR-2446` 마커를 남긴다.

```
[프론트엔드 데이터 흐름]

1. GraphQL로 RuntimeVariantPresets 조회 시도
2. 성공 → 서버 스키마의 기본 필드 + fallback 메타데이터 병합 (서버 값 우선)
3. 실패 또는 빈 결과 → 전체 하드코딩 fallback 사용
4. 사용자 설정값 → VLLM_EXTRA_ARGS/SGLANG_EXTRA_ARGS 문자열로 변환
5. 편집 모드 → 기존 EXTRA_ARGS 파싱 → UI 역매핑
```

### Fallback 파라미터 메타데이터

프론트엔드 하드코딩 fallback에서 사용할 파라미터 목록, UI 기본값, 범위, UI 타입은 위 "파라미터 카테고리 및 예시" 섹션의 테이블을 그대로 따른다. 서버 스키마가 확장되면 이 값들은 서버 응답으로 대체된다.

### Extra Args 파싱 및 병합 로직

기존 `react/src/helper/parseCliCommand.ts`의 `tokenizeShellCommand()` 함수를 재사용하여 extra args 문자열을 파싱한다.

**파싱 흐름:**
```
VLLM_EXTRA_ARGS 문자열
  → tokenizeShellCommand()로 토큰화
  → 토큰을 순회하며 {key: value} 맵 생성
    - --flag=value → key="--flag", value="value"
    - --flag value → key="--flag", value=다음 토큰
    - --flag (bool) → key="--flag", value=true
    - --no-flag → key="--flag", value=false
    - short opts (-f 등) → unknownTokens에 보존
  → 스키마의 target_spec.key와 대조하여 UI 매핑 / 미매핑 분리
```

**병합 흐름 (preset_target: "args"):**
```
UI 파라미터 맵 (슬라이더/입력으로 설정한 값)
  + 수동 입력 맵 (텍스트 필드에 직접 입력한 값)
  → 동일 key 시 수동 입력 우선 (덮어쓰기)
  → 기본값과 동일한 값은 제외
  → CLI 인자 문자열로 직렬화
  → VLLM_EXTRA_ARGS / SGLANG_EXTRA_ARGS 환경 변수에 설정
```

**env 타입 처리 (preset_target: "env"):**
```
preset_target이 "env"인 파라미터는 EXTRA_ARGS에 포함하지 않고,
개별 환경 변수로 직접 설정한다.
예: key="VLLM_TENSOR_PARALLEL_SIZE", value="2"
  → envvars에 { variable: "VLLM_TENSOR_PARALLEL_SIZE", value: "2" } 추가
```

> **참고**: 현재 스펙 범위의 fallback 파라미터는 모두 `preset_target: "args"` 타입이다. `env` 타입은 서버 스키마에서 제공될 때 지원하며, 기존 `useRuntimeEnvVarConfigs`에서 관리하는 환경 변수(`VLLM_TP_SIZE` 등)와는 별도로 처리한다.

### Stacked PR 전략

구현은 다음 4개의 PR로 분할하여 순차적으로 리뷰/머지한다.

**PR 1: `feat(FR-2446): add runtime extra args parser utility`**
- 새 파일: `react/src/helper/runtimeExtraArgsParser.ts`
- 새 파일: `react/src/helper/runtimeExtraArgsParser.test.ts`
- 내용: CLI 인자 문자열 파싱/직렬화/병합 유틸리티 + 단위 테스트
- 의존성: 없음 (독립적)

**PR 2: `feat(FR-2446): add runtime parameter fallback metadata`**
- 새 파일: `react/src/constants/runtimeParameterFallbacks.ts`
- 내용: vLLM/SGLang 파라미터 하드코딩 메타데이터 (`RuntimeParameterDef` 타입 + 상수)
- 의존성: 없음 (PR 1과 병렬 가능)

**PR 3: `feat(FR-2446): add runtime parameter schema hook and form component`**
- 새 파일: `react/src/hooks/useRuntimeParameterSchema.ts`
- 새 파일: `react/src/components/RuntimeParameterFormSection.tsx`
- 내용: GraphQL 스키마 fetch + fallback 병합 hook, 동적 폼 렌더링 컴포넌트
- 의존성: PR 1 + PR 2

**PR 4: `feat(FR-2446): integrate runtime parameter UI into service launcher`**
- 수정: `react/src/components/ServiceLauncherPageContent.tsx`
- 수정: `react/src/hooks/useVariantConfigs.ts`
- 수정: `resources/i18n/` (i18n 키 추가)
- 내용: 서비스 런처에 RuntimeParameterFormSection 통합, 환경 변수 변환 연동, 편집 모드 역매핑
- 의존성: PR 3

## 영향받는 주요 컴포넌트

### 수정 대상

- `react/src/components/ServiceLauncherPageContent.tsx` — Runtime Variant 선택 아래에 런타임 파라미터 섹션 삽입, vllm/sglang 조건부 표시, 제출 시 EXTRA_ARGS 변환, 편집 모드 역매핑
- `react/src/hooks/useVariantConfigs.ts` — `VLLM_EXTRA_ARGS`/`SGLANG_EXTRA_ARGS` 설명/placeholder 업데이트

### 신규 생성

- `react/src/helper/runtimeExtraArgsParser.ts` — CLI 인자 문자열 파싱/직렬화/병합 유틸 (`tokenizeShellCommand` 재사용)
- `react/src/helper/runtimeExtraArgsParser.test.ts` — 파서 단위 테스트
- `react/src/constants/runtimeParameterFallbacks.ts` — 런타임별 파라미터 하드코딩 메타데이터 + `RuntimeParameterDef` 타입
- `react/src/hooks/useRuntimeParameterSchema.ts` — GraphQL 스키마 fetch + fallback 병합 hook
- `react/src/components/RuntimeParameterFormSection.tsx` — 카테고리별 그룹화, ui_type별 Ant Design 컴포넌트 매핑, 기본값 리셋, 수동 extra args 텍스트 영역

### 재사용 기존 코드

- `react/src/helper/parseCliCommand.ts` — `tokenizeShellCommand()` 함수 (쉘 토큰화)
- `react/src/components/InputNumberWithSlider.tsx` — 슬라이더+숫자입력 조합 컴포넌트

## 참고 자료

- [vLLM Engine Arguments](https://docs.vllm.ai/en/v0.10.2/configuration/engine_args.html)
- [vLLM Sampling Parameters](https://github.com/vllm-project/vllm/blob/main/vllm/sampling_params.py)
- [SGLang Server Arguments](https://docs.sglang.io/advanced_features/server_arguments.html)
- [SGLang Sampling Parameters](https://docs.sglang.io/basic_usage/sampling_params.html)
- Backend.AI 서버 — `src/ai/backend/manager/api/gql/runtime_variant_preset/types.py` (`RuntimeVariantPreset` GQL 타입)
- Backend.AI 서버 — `src/ai/backend/manager/data/deployment/inference_runtime_config.py` (`VLLMRuntimeConfig`, `SGLangRuntimeConfig` Pydantic 모델)

## 관련 이슈

- FR-2444: 모델 서비스 런처 Advanced 모드 (관련 기능 — 런타임 파라미터 UI는 Advanced와 독립적으로 항상 표시)
- FR-2446: Epic — 런타임 파라미터 설정 UI
- FR-2447: Task — 피처 스펙 정의
