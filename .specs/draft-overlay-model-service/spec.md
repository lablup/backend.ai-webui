# 모델 스토어 오버레이 기반 모델 서비스 생성 Spec

> **Status**: Draft (백엔드 API 미확정)

## 개요

모델 스토어에서 서비스를 생성할 때 기존 deep copy(clone) 방식 대신 파일시스템 오버레이를 활용하여, 복사 대기 없이 즉시 서비스를 시작할 수 있도록 개선한다. 또한 runtime variant 선택을 하드코딩에서 `service-definition.toml` 기반 동적 선택으로 변경한다.

## 문제 정의

### 현재 방식의 문제점

1. **불필요한 데이터 복사**: 모델 폴더 전체를 deep copy(clone)해야 서비스를 시작할 수 있어, 대용량 모델의 경우 수분~수십분 대기 필요
2. **스토리지 낭비**: 동일한 모델 데이터가 사용자 수만큼 중복 저장됨
3. **복잡한 비동기 흐름**: clone 완료를 notification polling으로 감지한 뒤 서비스 생성을 이어가는 복잡한 로직 (`pendingCloneRef`, `useEffect` notification 감시 등)
4. **Runtime variant 하드코딩**: `'vllm'`으로 고정되어 있어, 모델별 최적 variant를 선택할 수 없음

### 기대 효과

- 복사 대기 시간 제거 (즉시 서비스 시작)
- 스토리지 사용량 절감 (원본 모델 공유, 변경분만 저장)
- 코드 복잡도 감소 (clone 관련 로직 전면 제거)
- 모델별 적합한 runtime variant 자동/수동 선택

## 요구사항

### Must Have

- [ ] "Run This Model" 클릭 시 clone 없이 오버레이 기반으로 서비스 생성 요청
- [ ] Stepper 모달 UI로 서비스 생성 flow 제공 (폴더 선택 → 런타임 확인)
- [ ] 오버레이 Upper 폴더 선택 UI 제공
  - 사용자에게는 "내 설정 폴더"로 표시하며, overlay/lower/upper 등 기술 용어는 노출하지 않음
  - 폴더 선택: `BAIVFolderSelect` 컴포넌트 사용 (filter + 무한 스크롤, 단일 선택)
  - [새 폴더] 버튼은 Select 외부에 별도 배치
  - "설정 폴더 없이 진행" 체크박스는 Select 하위에 배치 (체크 시 Select 비활성화)
- [ ] 모델 스토어 폴더(원본)의 `service-definition.toml`을 프론트엔드에서 직접 파싱하여 `runtime_variants` 필드 확인
  - definition 파일은 항상 모델 스토어 폴더에서만 읽음 (설정 폴더의 definition은 무시)
  - 설정 폴더는 순수하게 diff 저장용 (어댑터, 설정 파일 등 사용자 추가/변경 파일만)
- [ ] `runtime_variants` 기반 동적 runtime variant 선택
  - 1개 (CUSTOM 외): 자동 선택, 바로 서비스 생성
  - 1개 (CUSTOM): 모델 스토어 폴더에서 `model-definition.yaml` 존재 확인 → 있으면 바로 생성, 없으면 에러
  - 여러 개: 런타임 확인 단계에서 Radio 리스트로 선택
    - CUSTOM 포함 + `model-definition.yaml` 없음: CUSTOM은 disabled + tooltip("model-definition.yaml 필요"), 나머지 중 선택
    - CUSTOM 포함 + `model-definition.yaml` 있음: `runtime_variants`에 명시된 variant 전부 선택 가능
    - CUSTOM 미포함: `runtime_variants`에 명시된 variant 전부 선택 가능
  - 0개 (필드 없음): 에러 메시지 + 서비스 런처로 이동 버튼
- [ ] 에러 케이스에서 "서비스 런처에서 설정하기" 버튼으로 서비스 런처 페이지로 이동
  - 이동 시 모델 폴더 ID, 설정 폴더 ID(선택한 경우), runtime variant 후보 등을 prefill 데이터로 전달
- [ ] 서비스 생성 완료 후 확인 단계 없이 바로 서비스 상세 페이지(`/serving/{endpoint_id}`)로 이동
- [ ] 기존 clone 관련 코드 제거
  - `pendingCloneRef` 및 clone 완료 감시 `useEffect` 제거
  - `mutationToClone` 제거
  - clone notification 로직 제거
- [ ] Runtime variant 하드코딩(`'vllm'`) 제거
- [ ] 리소스/환경변수 설정 단계 없이 바로 생성 (기존과 동일, 상세 설정은 ServiceLauncher에서 별도 제공)

### Nice to Have

- [ ] 설정 폴더에 변경분만 저장됨을 안내하는 간단한 도움말 텍스트
- [ ] 서비스 생성 진행 중 로딩 상태 표시 (현재 notification 기반 → 간소화 가능)
- [ ] 모델 스토어 아이템 카드에서 지원하는 runtime variant 목록 미리보기

## 사용자 스토리

- 일반 사용자로서, 모델 스토어에서 모델을 선택하고 "Run This Model"을 클릭하면 복사 대기 없이 바로 서비스를 시작할 수 있다.
- 일반 사용자로서, 서비스 시작 시 내 설정을 저장할 폴더를 선택하거나 새로 만들 수 있다.
- 일반 사용자로서, 모델이 여러 runtime variant를 지원하는 경우 원하는 variant를 선택할 수 있다.
- 일반 사용자로서, 서비스 생성이 완료되면 별도 확인 없이 바로 서비스 상세 페이지에서 상태를 확인할 수 있다.

## 서비스 생성 Flow

### Step 0: "Run This Model" 클릭

- 진입점: `ModelCardModal` 내 `ModelTryContentButton` (또는 새로운 컴포넌트)
- Stepper 모달을 띄운다

### Step 1: 설정 폴더 선택

Stepper 모달의 첫 번째 단계. 사용자에게 "내 설정 폴더" 선택 UI를 제공한다.

```
┌──────────────────────────────────────────────┐
│  모델 서비스 시작: LLaMA-3-70B                  │
├──────────────────────────────────────────────┤
│  ● ━━━━━━━━━━━━━━━ ○                        │
│  폴더 선택             런타임 확인               │
├──────────────────────────────────────────────┤
│  ℹ️ 변경한 파일만 이 폴더에 저장됩니다.             │
│                                              │
│  [▼ BAIVFolderSelect (filter + 무한스크롤) ]    │
│                                   [+ 새 폴더]  │
│  □ 설정 폴더 없이 진행                          │
│                                              │
│                                              │
│                                [취소] [다음]   │
└──────────────────────────────────────────────┘
```

**UI 구성:**
- 최상단 안내 텍스트
- `BAIVFolderSelect` (filter + 무한 스크롤, 단일 선택)
- [새 폴더] 버튼 (Select 외부에 별도 배치)
- "설정 폴더 없이 진행" 체크박스 (Select 하위에 배치)
  - 체크 시: `BAIVFolderSelect` + [새 폴더] 버튼 비활성화(dim), [다음] 활성화
  - 체크 해제 시: Select 다시 활성화, 폴더 미선택이면 [다음] 비활성화

**[다음] 클릭 시:**
- 모델 스토어 폴더(원본)에서 `service-definition.toml`을 프론트엔드에서 직접 읽어 TOML 파싱
  - definition 파일은 설정 폴더 선택 여부와 무관하게 항상 모델 스토어 폴더에서만 읽음
- Step 2(런타임 확인)로 이동

### Step 2: 런타임 확인 (자동 검증 단계)

`service-definition.toml` 파싱 결과의 `runtime_variants`에 따라 자동 분기한다.

**분기 로직:**

```
service-definition.toml 파싱
        │
        ├─ runtime_variants 없음 (필드 자체가 없거나 빈 배열)
        │   → ⚠️ Alert: "런타임이 지정되지 않아 서비스를 실행할 수 없습니다"
        │     [서비스 런처에서 설정하기 →]
        │
        ├─ 1개
        │   ├─ CUSTOM
        │   │   ├─ model-definition.yaml 있음 → 바로 서비스 생성 → 상세 페이지 이동
        │   │   └─ model-definition.yaml 없음
        │   │       → ⚠️ Alert: "model-definition.yaml이 필요합니다"
        │   │         [서비스 런처에서 설정하기 →]
        │   │
        │   └─ CUSTOM 외 → 바로 서비스 생성 → 상세 페이지 이동
        │
        └─ 여러 개 → Radio 리스트로 선택
```

**에러 케이스 UI:**

```
┌──────────────────────────────────────────────┐
│  모델 서비스 시작: LLaMA-3-70B                  │
├──────────────────────────────────────────────┤
│  ✅ ━━━━━━━━━━━━━━━ ❌                       │
│  폴더 선택             런타임 확인              │
├──────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ ⚠️ 런타임이 지정되지 않아 서비스를        │    │
│  │    실행할 수 없습니다.                  │    │
│  │                                      │    │
│  │    서비스 런처에서 직접 런타임과 리소스를  │    │
│  │    설정하여 시작할 수 있습니다.          │    │
│  └──────────────────────────────────────┘    │
│                                              │
│              [취소] [서비스 런처에서 설정하기 →]  │
└──────────────────────────────────────────────┘
```

**런타임 선택 UI (variant가 여러 개일 때):**

Radio 리스트로 variant를 선택한다. 이름만 표시 (health check/port 불필요).

```
┌──────────────────────────────────────────────┐
│  모델 서비스 시작: LLaMA-3-70B                  │
├──────────────────────────────────────────────┤
│  ✅ ━━━━━━━━━━━━━━━ ●                        │
│  폴더 선택             런타임 확인              │
├──────────────────────────────────────────────┤
│                                              │
│  ⚙️ 런타임 선택                                │
│                                              │
│  ○ vLLM                                      │
│  ● NVIDIA NIM                                │
│  ○ Custom                          │
│                                              │
│                          [이전] [서비스 시작]   │
└──────────────────────────────────────────────┘
```

**CUSTOM disabled 케이스 (model-definition.yaml 없음):**

```
│  ○ vLLM                                      │
│  ● NVIDIA NIM                                │
│  ○ Custom  ← disabled              │
│    ⓘ model-definition.yaml이 없어 선택 불가    │
```

- CUSTOM은 disabled 상태 + tooltip으로 사유 안내
- 나머지 variant 중 Radio 선택 가능

### 전체 Runtime Variant 목록

> **키 표기 규칙:** Variant Key는 대문자 enum (`VLLM`, `CUSTOM` 등)을 사용한다. `service-definition.toml`의 `runtime_variants` 값이 소문자(`vllm`)인 경우 대소문자 무시(case-insensitive)로 매핑한다. UI에는 표시명을 사용한다.

| Variant Key | 표시명 |
|-------------|--------|
| `CUSTOM` | Custom |
| `VLLM` | vLLM |
| `NIM` | NVIDIA NIM |
| `HUGGINGFACE_TGI` | Huggingface TGI |
| `SGLANG` | SGLang |
| `MODULAR_MAX` | Modular MAX |
| `CMD` | Predefined Image Command |

### Step 3: 서비스 생성 및 이동

- 오버레이 API를 호출하여 서비스 생성 요청
- 요청 성공 시 확인 모달 없이 바로 `/serving/{endpoint_id}` 페이지로 이동
- 요청 실패 시 에러 메시지 표시

## 수용 기준

### 폴더 선택 (Step 1)
- [ ] `BAIVFolderSelect`(filter + 무한 스크롤)로 폴더를 단일 선택할 수 있다
- [ ] [새 폴더] 버튼이 Select 외부에 별도 배치되어 정상 동작한다
- [ ] "설정 폴더 없이 진행" 체크박스가 Select 하위에 배치되어 동작한다 (체크 시 Select 비활성화, [다음] 활성화)
- [ ] 새 폴더 생성이 정상 동작한다

### 런타임 확인 (Step 2)
- [ ] 모델 스토어 폴더(원본)의 `service-definition.toml`을 프론트엔드에서 TOML 파싱한다 (설정 폴더의 definition은 무시)
- [ ] `runtime_variants` 없음 → 에러 Alert + "서비스 런처에서 설정하기" 버튼 표시
- [ ] `runtime_variants` 1개 (CUSTOM 외) → 자동 선택, 바로 서비스 생성
- [ ] `runtime_variants` 1개 (CUSTOM) + `model-definition.yaml` 있음 → 바로 서비스 생성
- [ ] `runtime_variants` 1개 (CUSTOM) + `model-definition.yaml` 없음 → 에러 Alert + "서비스 런처에서 설정하기" 버튼 표시
- [ ] `runtime_variants` 여러 개 → Radio 리스트로 variant 선택 (이름만 표시)
- [ ] 여러 개 + CUSTOM 포함 + `model-definition.yaml` 없음 → CUSTOM disabled + tooltip 표시, 나머지 선택 가능
- [ ] 여러 개 + CUSTOM 포함 + `model-definition.yaml` 있음 → `runtime_variants`에 명시된 variant 전부 선택 가능

### 서비스 생성 (Step 3)
- [ ] "Run This Model" 클릭 후 clone 프로세스가 발생하지 않는다
- [ ] 서비스 생성 성공 시 확인 단계 없이 서비스 상세 페이지로 이동한다
- [ ] 서비스 생성 실패 시 에러 메시지가 표시된다

### 공통
- [ ] UI에 overlay, lower layer, upper layer 등 기술 용어가 노출되지 않는다
- [ ] 기존 clone 관련 코드(`pendingCloneRef`, clone notification polling, `mutationToClone`)가 제거된다
- [ ] Runtime variant 하드코딩(`'vllm'`)이 제거되고 `service-definition.toml` 기반으로 동작한다

## 범위 외 (Out of Scope)

- Merged view (오버레이로 합쳐진 전체 파일 목록 보기) 기능
- 오버레이 Lower/Upper layer의 파일 단위 diff 표시 기능
- 서비스 생성 시 리소스(GPU, CPU, 메모리) 세부 설정 (기존 ServiceLauncher 페이지에서 별도 제공)
- 백엔드 오버레이 API 설계 (프론트엔드 UI spec만 다룸)
- `ModelCloneModal` 컴포넌트 자체의 제거 여부 (별도 clone 기능으로 유지 가능)
- 관리자의 모델 스토어 아이템 관리 기능 변경

## 영향받는 기존 코드

| 파일 | 변경 내용 |
|------|----------|
| `react/src/components/ModelTryContentButton.tsx` | 전면 리팩토링: clone 로직 제거, overlay API 호출로 대체, runtime variant 동적 선택 추가 |
| `react/src/components/ModelCardModal.tsx` | `ModelTryContentButton` 변경에 따른 props/fragment 업데이트 |
| `react/src/components/ModelCloneModal.tsx` | 직접 변경 없음 (별도 clone 기능으로 유지 가능) |
| `react/src/hooks/useVariantConfigs.ts` | 전체 runtime variant 목록 반영 필요 |
| `react/src/components/ServiceLauncherPageContent.tsx` | `ServiceCreateType` 인터페이스에 overlay 관련 필드 추가 가능 |

## 백엔드 API 의존성

> 백엔드 API는 아직 확정되지 않았다. 아래는 프론트엔드에서 필요로 하는 API 요구사항이다.

### 필요 API

1. **오버레이 기반 서비스 생성 API**: 기존 `/services` POST에 overlay 관련 파라미터 추가 또는 별도 endpoint
   - 입력: 모델 폴더 ID(lower), 설정 폴더 ID(upper), runtime variant, 기타 서비스 설정
   - 출력: `endpoint_id`

2. **`service-definition.toml` 파일 내용 조회 API**: 모델 폴더 내 `service-definition.toml` 파일 내용을 가져오는 API
   - 프론트엔드에서 TOML 파싱 수행 (별도 파싱 API 불필요)
   - 현재 `useSearchVFolderFiles`로 파일 존재 여부만 확인하고 있으므로, 파일 내용 읽기가 추가로 필요

3. **설정 폴더 생성/목록 API**: 기존 vfolder API 활용 가능 (별도 API 불필요할 수 있음)
   - ⚠️ **논의 필요**: 설정 폴더(upper) 생성 시 스토리지 호스트 제약 여부. 모델 폴더(lower)와 같은 호스트여야 overlay가 가능한지, cross-host overlay를 백엔드가 지원하는지에 따라 `FolderCreateModal`에서 호스트 선택을 제한해야 할 수 있음

## 관련 이슈

- (백엔드 API 확정 후 Jira 이슈 연결 예정)
