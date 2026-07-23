# 런타임 UI 개선 스펙

## 개요

모델 서비스 런처의 런타임 관련 UI를 개선한다. 기본 런타임을 Custom으로 변경하고, 프론트엔드에 하드코딩된 14개 런타임 파라미터를 모두 제거한 뒤 백엔드 RuntimeVariantPreset API 기반으로 동적 렌더링하도록 전환한다.

## 문제 정의

현재 모델 서비스 런처의 런타임 UI에 다음과 같은 문제가 있다:

1. **기본 런타임 선택값이 VLLM**: Custom 런타임에서도 메트릭이 정상 노출되어 VLLM/SGLang 전용 런타임의 이점이 줄었으나, 기본값이 여전히 VLLM으로 설정되어 있어 매번 수동으로 변경해야 한다.
2. **프론트엔드 하드코딩 파라미터**: 14개 런타임 파라미터가 `runtimeParameterFallbacks.ts`에 하드코딩되어 있다. 백엔드에서 RuntimeVariantPreset API를 통해 29개 파라미터를 `category`, `rank`, `targetSpec`, `uiOption`과 함께 제공하므로, 프론트엔드 하드코딩을 제거하고 API 기반으로 전환해야 한다.
3. **잘못된 CLI 플래그**: 하드코딩된 sampling 파라미터(temperature 등)가 개별 CLI 플래그(`--temperature`)로 구현되어 있으나 이는 존재하지 않는 플래그이다. 서버 기동 시 generation config override 메커니즘이 런타임별로 다르다 — vLLM은 `--override-generation-config` JSON, SGLang은 `--sampling-defaults`/`--preferred-sampling-params`/`--json-model-override-args` 삼원 구조. 요청 단위에서는 둘 다 sampling_params로 자유롭게 오버라이드 가능하다. 하드코딩 제거 및 API 전환(요구사항 2)으로 해소되며, 런타임별 flag 차이는 `targetSpec.key`가 흡수한다.
4. **파라미터 분류/순서 불일치**: 프론트엔드는 sampling/context/advanced 3개 카테고리이나, 백엔드 프리셋은 model_loading/resource_memory/serving_performance 등 9개 카테고리와 rank 기반 정렬을 제공한다.

## 현재 상태 (As-Is)

### 기본 런타임
- 현재 기본값은 다음 위치들에서 `runtimeVariant: 'vllm'`로 설정되어 있다:
  - `react/src/components/ServiceLauncherPageContent.tsx`
  - `react/src/hooks/useModelServiceLauncher.ts`
  - `react/src/components/LegacyModelTryContentButton.tsx`
- 기본 런타임을 Custom으로 변경할 때 위 위치들을 함께 반영해야 하며, 가능하면 기본값 정의를 단일 소스로 모으는 방향도 검토한다.

### 프론트엔드 하드코딩 파라미터 (제거 대상)
- 파일: `react/src/constants/runtimeParameterFallbacks.ts`
- vLLM 14개, SGLang 14개 (대부분 동일 구조) — sampling 7개, context 2개, advanced 5개
- 이 파일 전체를 제거하고 백엔드 API로 대체

### 백엔드 RuntimeVariantPreset API (대체 소스)
- GraphQL query: `runtimeVariantPresets(filter: { runtimeVariantId }, orderBy: [{ field: RANK, direction: ASC }])`
- 스키마 (`data/schema.graphql` line 15046):

```graphql
type RuntimeVariantPreset {
  id: ID!
  runtimeVariantId: UUID!
  name: String!
  description: String
  rank: Int!                    # 표시 순서 (낮을수록 먼저)
  category: String              # UI 그룹 (model_loading, resource_memory, ...)
  displayName: String           # UI 표시 라벨
  targetSpec: PresetTargetSpec! # { presetTarget: ENV|ARGS, valueType: STR|INT|FLOAT|BOOL|FLAG, defaultValue, key }
  uiOption: UIOption            # { uiType, slider, number, choices, text }
}
```

- `targetSpec.presetTarget`: `ENV`(환경변수) 또는 `ARGS`(CLI 플래그)로 값 적용 방식 결정
- `targetSpec.key`: 실제 CLI 플래그(예: `--dtype`) 또는 환경변수명(예: `HF_TOKEN`)
- `uiOption.uiType`: UI 렌더링 타입 (slider, number_input, select, checkbox, text_input)
- 필터링: `runtimeVariantId`로 선택된 런타임의 프리셋만 조회
- Runtime variants: `fixtures/manager/example-runtime-variants.json`에 vllm, sglang, nim, huggingface-tgi, modular-max, cmd, custom 정의

### 백엔드 프리셋 현황
- `fixtures/manager/example-runtime-variant-presets.json`에 vLLM 프리셋 29개 존재
- SGLang 프리셋도 백엔드에서 추가 예정 (이 스펙 구현 시점에 함께 제공)
- 프론트엔드는 `runtimeVariantId`로 필터링하여 조회하므로 런타임별 프리셋 수와 무관하게 동일한 로직으로 동작

### 런타임별 환경 변수 (useVariantConfigs.ts)
- VLLM: `BACKEND_MODEL_NAME`, `VLLM_QUANTIZATION`, `VLLM_TP_SIZE`, `VLLM_PP_SIZE`, `VLLM_EXTRA_ARGS`
- SGLang: `BACKEND_MODEL_NAME`, `SGLANG_QUANTIZATION`, `SGLANG_TP_SIZE`, `SGLANG_PP_SIZE`, `SGLANG_EXTRA_ARGS`
- API 전환 후: `targetSpec.presetTarget=ENV`인 프리셋은 환경변수로, `ARGS`인 프리셋은 `EXTRA_ARGS`에 CLI 플래그로 직렬화

> **프론트엔드에만 있고 백엔드 프리셋에 없는 항목 처리**:
> - Seed (`--seed`): 디버깅/재현성 용도, 사용 빈도 낮음 → 백엔드 프리셋에 없으므로 UI에서 제거
> - Enforce Eager (`--enforce-eager`): 디버깅 전용, 고급 → 백엔드 프리셋에 없으므로 UI에서 제거
> - Sampling 파라미터 7개 (temperature, top_p 등): 서버 시작 CLI 플래그가 아닌 요청 단위 파라미터 → 백엔드 프리셋에 없으므로 UI에서 제거 (향후 요청 파라미터 UI가 필요하면 별도 스펙으로 진행)

## 요구사항

### 필수 (Must Have)

#### 1. 기본 런타임 변경
- [ ] 서비스 생성 시 기본 런타임을 `'vllm'`에서 `'custom'`으로 변경
- [ ] 관련된 모든 위치(ServiceLauncherPageContent, useModelServiceLauncher, LegacyModelTryContentButton)에 일관되게 반영

#### 2. 프론트엔드 하드코딩 제거 및 백엔드 API 연동
- [ ] `runtimeParameterFallbacks.ts` 파일 제거 (하드코딩된 14개 파라미터 정의 전체, `getExtraArgsEnvVar`/`getAllExtraArgsEnvVars` 포함)
- [ ] `EXTRA_ARGS` 환경변수 직렬화 로직을 API의 `targetSpec` 기반으로 마이그레이션 (ServiceLauncherPageContent에서 6곳 사용 중)
- [ ] `runtimeVariantPresets` GraphQL query로 선택된 런타임의 프리셋을 동적으로 조회
- [ ] `rank` 순서대로 파라미터 UI 렌더링
- [ ] `category`별 그룹핑하여 섹션 구분 표시
- [ ] `uiOption`에 따라 적절한 UI 컴포넌트 렌더링 (slider, number_input, select, checkbox, text_input)
- [ ] `targetSpec`에 따라 값을 ENV 또는 ARGS로 직렬화
- [ ] 기존 `RuntimeParameterFormSection`, `useRuntimeParameterSchema` 등 하드코딩에 의존하는 코드 리팩토링

#### 3. Fallback 처리
- [ ] 프리셋이 0개인 런타임은 프리셋이 없는 다른 runtime variant와 동일하게 동작 (별도 처리 없음)
- [ ] 백엔드에서 프리셋을 가져올 수 없는 경우(API 미지원 버전, 네트워크 오류 등) 적절한 에러 처리

## 사용자 스토리

- 모델 서비스를 처음 생성하는 사용자로서, 런타임 선택 시 가장 범용적인 Custom이 기본 선택되어 있어서 별도 변경 없이 바로 설정을 진행할 수 있다.
- VLLM/SGLang을 사용하는 사용자로서, 백엔드에서 정의한 파라미터가 category별로 그룹핑되고 rank 순으로 정렬되어 중요한 설정을 빠르게 찾을 수 있다.
- 관리자로서, 백엔드에서 프리셋을 추가/수정하면 프론트엔드 배포 없이 UI에 반영되어 운영 유연성이 높아진다.

## 인수 조건

### 기본 런타임 변경
- [ ] 서비스 생성 페이지 진입 시 런타임 선택의 기본값이 Custom이다
- [ ] 기존 서비스 편집 시에는 해당 서비스에 설정된 런타임이 올바르게 표시된다

### 백엔드 API 연동
- [ ] 런타임(vLLM/SGLang) 선택 시 `runtimeVariantPresets` API에서 해당 런타임의 프리셋을 조회한다
- [ ] 파라미터가 `rank` 순서대로 표시된다
- [ ] 파라미터가 `category`별로 그룹핑되어 표시된다
- [ ] 각 파라미터의 UI 컴포넌트가 `uiOption.uiType`에 따라 렌더링된다 (slider, number_input, select, checkbox, text_input)
- [ ] 사용자가 입력한 값이 `targetSpec.presetTarget`에 따라 환경변수(ENV) 또는 CLI 인자(ARGS)로 올바르게 직렬화된다
- [ ] `runtimeParameterFallbacks.ts` 파일이 제거되어 있다

### Fallback
- [ ] 프리셋이 0개인 런타임은 다른 프리셋 없는 runtime variant와 동일하게 동작한다
- [ ] API 호출 실패 시 에러 상태가 사용자에게 표시된다

## 범위 밖 (Out of Scope)

- Sampling 파라미터 UI (temperature, top_p 등은 서버 기동 파라미터가 아닌 요청 단위 파라미터이므로, LLM Playground 등 요청 시점 UI에서 별도 스펙으로 처리)
- 백엔드 프리셋 CRUD 관리 UI (어드민 패널)
- 프리셋의 i18n 처리 (백엔드에서 `displayName`/`description` 제공, 프론트엔드 번역 키 매핑은 별도)
- Custom 런타임의 model definition 편집 개선 (FR-2581에서 처리)

## 관련 파일

### 제거 대상
- `react/src/constants/runtimeParameterFallbacks.ts` - 하드코딩 파라미터 정의 (전체 제거)

### 수정 대상
- `react/src/components/ServiceLauncherPageContent.tsx` - 기본 런타임 설정, 런타임 선택 UI
- `react/src/components/RuntimeParameterFormSection.tsx` - 파라미터 폼 UI (API 기반으로 리팩토링)
- `react/src/hooks/useRuntimeParameterSchema.ts` - 파라미터 스키마 훅 (API 조회로 전환)
- `react/src/hooks/useVariantConfigs.ts` - 런타임별 환경 변수 설정 (API의 targetSpec.presetTarget=ENV 활용)
- `react/src/hooks/useVariantConfigs.test.ts` - 위 훅의 테스트 파일
- `react/src/hooks/useModelServiceLauncher.ts` - 기본 런타임 설정
- `react/src/components/LegacyModelTryContentButton.tsx` - 기본 런타임 설정 (vllm 참조 3곳: 기본값, case문, cloneOrCreateModelService 호출)

## 관련 리소스

- [lablup/backend.ai#10889](https://github.com/lablup/backend.ai/pull/10889) - RuntimeVariantPreset 29개 vLLM fixture 정의 (백엔드)
- [vLLM v0.17.0 Serve 인자 목록](https://docs.vllm.ai/en/stable/serving/openai_compatible_server.html) - vLLM 공식 문서
