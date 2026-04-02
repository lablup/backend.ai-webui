# Model Store Improvement Spec

> **Epic**: FR-2338 ([link](https://lablup.atlassian.net/browse/FR-2338))
> **관련 Epic**: FR-1927 (Refactoring Model Store), FR-1368 (Model Deployment & Revision)

## 개요

Model Store의 현재 사용성 문제를 정리하고, 개선 방향 및 신규 기능 요구사항을 정의한다. 본 스펙은 구체적인 구현 방식을 결정하기 이전 단계로, "무엇이 문제이고, 무엇이 필요한가"를 명확히 하는 데 목적이 있다.

## 배경

Model Store는 관리자가 등록한 모델을 사용자가 탐색하고 clone하여 모델 서비스에 활용할 수 있도록 하는 기능이다. 현재 다음과 같은 워크플로우로 운영된다:

1. (어드민) 모델 타입의 vfolder 생성 (cloneable 체크)
2. (어드민) 모델 메타데이터 업로드 (HuggingFace 등에서)
3. (어드민) 필요 시 model-definition, service-definition 작성
4. (사용자) Model Store에서 모델 탐색 및 clone
5. (사용자) 서비스 페이지에서 모델 서비스 생성

이 과정에서 다양한 불편 사항과 기능 부재가 확인되었으며, 내부 Teams 논의(2026-01-21, devops > Backend.AI Cloud)와 Jira 이슈들(FR-1927 하위)을 통해 구체적인 개선 요구가 도출되었다.

> **참고**: 모델 반입(import)과 관련된 기능은 Model Reservoir(enable_reservoir 설정 필요)에서 다루며, 모델 서비스 실행 간소화는 Model Deployment(FR-1368)에서 별도로 진행 중이다. 본 스펙은 **Model Store UI/UX 자체의 개선**에 집중한다.

## 현재 문제점

### 1. 클론 가용성을 사전에 알 수 없음 (FR-389, FR-1919)

- 모델 카드에서 clone 가능 여부를 확인하려면 매번 개별 모델을 클릭해봐야 한다.
- 접근 불가능한 storage에 저장된 모델도 clone 가능한 것처럼 표시되어, 실제 clone 시도 시 실패한다.
- clone 실패 시 명확한 에러 메시지가 없어 사용자가 원인을 파악하기 어렵다.
- model store 프로젝트 폴더에서 `cloneable`이 false일 때 일반 사용자에게 안내가 부족하다.

### 2. 프로젝트별 모델 가시성 부재 (FR-2078)

- 현재 Model Store 목록은 모든 storage의 모델을 표시한다.
- 사용자의 프로젝트에 할당된 storage에 없는 모델도 보이므로, 실제로 사용 불가능한 모델이 노출된다.
- 이로 인해 사용자가 "이 모델을 쓸 수 있는지"를 매번 확인해야 하는 비효율이 발생한다.

### 3. 정렬 및 필터링 부재 (FR-1926)

- Model Store에 정렬 기능이 없어 원하는 모델을 찾기 어렵다.
- 모델 수가 늘어날수록 탐색 효율이 급격히 떨어진다.
- 카테고리, 모델 크기, 런타임 호환성 등 기준으로 필터링할 수 없다.

### 4. 썸네일 미지원 (FR-1928)

- 대부분의 모델이 fallback(기본) 이미지로 표시된다.
- 이전에 `model_card_metadata.json`에서 썸네일을 가져오는 로직이 있었으나 현재 사용되지 않는다.
- 모델 스토어 폴더에 이미지를 업로드하고 썸네일로 지정하는 기능이 없다.
- 썸네일 관련 레거시 코드(`model_card_metadata.json`) 정리가 필요하다.

### 5. 모델 정보의 부족

- 모델 카드에 표시되는 정보가 제한적이다 (README 기반).
- 모델의 최소 필요 자원(GPU, RAM 등), 지원 런타임, 파라미터 수 등의 핵심 정보가 목록에서 바로 보이지 않는다.
- service-definition 유무를 한눈에 파악하기 어렵다.

### 6. 모델 카드 UI의 가독성 부족

- 현재 모델 카드 레이아웃은 여러 모델을 한눈에 비교하기 어렵다.
- AI 카탈로그(NVIDIA NIM 등)처럼 모델 정보를 카드 형태로 깔끔하게 보여주는 방향이 요구되고 있다.
- 태그, 카테고리 등의 메타데이터가 카드에 시각적으로 표현되지 않는다.

## 개선 요구사항

### Must Have

#### 클론 가용성 자동 확인
- Model Store 목록에서 각 모델의 clone 가능 여부를 사전에 표시해야 한다.
- 사용자 프로젝트에 할당된 storage 기준으로 clone 가능/불가를 판단해야 한다.
- clone 불가 시 사유를 안내해야 한다 (storage 미연결, cloneable 미설정 등).
- clone 실패 시 명확한 에러 메시지를 제공해야 한다.

#### 프로젝트 기반 모델 가시성
- 사용자의 현재 프로젝트에 할당된 storage를 기준으로 Model Store 목록을 필터링해야 한다.
- 사용 불가능한 모델은 숨기거나, 시각적으로 구분하여 표시해야 한다.

#### 정렬 기능
- Model Store 목록에 정렬 기능을 추가해야 한다.
- 최소한 이름, 등록일 기준 정렬을 지원해야 한다.

### Should Have

#### 썸네일 지원
- 모델 스토어 폴더에 이미지를 업로드하고 썸네일로 지정할 수 있어야 한다.
- 서버 측 스키마 변경이 필요할 수 있다 (백엔드 협의 필요).
- `model_card_metadata.json` 관련 레거시 코드를 정리해야 한다.

#### 검색 기능
- 모델 이름, 설명, 태그 등으로 모델을 검색할 수 있어야 한다.
- 검색은 목록 상단에서 즉시 접근 가능해야 한다.
- 글로벌 검색(Cmd+K / Ctrl+K)으로 페이지 어디서든 빠르게 모델을 검색할 수 있으면 좋다.

#### 필터링 기능
- 모델 타입, 런타임 호환성, 모델 크기 등 기준으로 필터링할 수 있으면 좋다.

#### 모델 카드 정보 보강
- 모델 카드에 핵심 메타데이터(파라미터 수, 지원 런타임, 최소 자원 등)를 표시한다.
- service-definition 존재 여부, 바로 실행 가능 여부를 시각적으로 표시한다.
- 모델의 인기도/사용량(clone 횟수 등)을 카드에 표시하여 사용자가 검증된 모델을 빠르게 선택할 수 있도록 한다.
- 모델의 배포 가능 상태를 뱃지로 구분한다 (예: "바로 실행 가능", "definition 작성 필요", "clone만 가능" 등).
- 지원 런타임(vLLM, TensorRT 등)을 태그로 표시하여 환경 호환성을 빠르게 식별할 수 있도록 한다.
- 퍼블리셔/등록자 정보를 표시한다.

#### 모델 카드 UI 개선
- 여러 모델을 한눈에 비교할 수 있도록 카드 레이아웃을 개선한다.
- NVIDIA NIM, AI 카탈로그 등을 참고하여 태그, 카테고리, 핵심 정보가 카드에 시각적으로 잘 드러나도록 한다.

#### 다중 축 필터링 (Faceted Filter)
- 단일 필터가 아닌, 여러 축(Use Case, 런타임, 퍼블리셔 등)으로 동시에 필터링할 수 있도록 한다.
- 각 필터 옵션에 해당하는 모델 수를 함께 표시한다.

### Nice to Have

#### 모델 서비스 빠른 실행
- model-definition과 service-definition이 갖춰진 모델은 카드에서 바로 서비스를 생성할 수 있으면 좋다.
- 단, 이 부분은 **Model Deployment(FR-1368)** 기능과 밀접하게 연관되므로, 해당 Epic의 진행 상황에 따라 연동 방식을 결정한다.

#### 자원 프리셋 연동
- 모델별 최소 자원을 매번 지정하는 대신, preset(small, medium, large 등)을 선택하여 서비스를 생성할 수 있으면 좋다.
- 이 역시 Deployment 기능과의 연계가 필요하다.

#### 모델 카테고리 다양화
- 현재 Model Store는 관리자가 등록한 모델만 나열되며 출처나 유형에 대한 구분이 없다.
- 기본 제공 모델(Built-in), 사용자 정의 모델(Custom), 커뮤니티 모델(Community) 등으로 카테고리를 나누어 다양한 모델 소스를 지원하면 좋다.
- 카테고리별 탐색이 가능하면 사용자가 목적에 맞는 모델을 더 빠르게 찾을 수 있다.

#### 모델 비교 기능
- 2~3개 모델을 선택하여 스펙(파라미터 수, 필요 자원, 지원 런타임 등)을 나란히 비교할 수 있으면, 어떤 모델을 사용할지 결정하기 쉬워진다.

#### 최근 사용 / 즐겨찾기
- 자주 사용하거나 최근에 clone한 모델을 빠르게 접근할 수 있는 기능.
- 모델 수가 늘어날수록 매번 검색해서 찾는 것은 비효율적이므로, 개인화된 바로가기가 있으면 좋다.

#### 모델 사용 통계 (어드민)
- 어드민 관점에서 각 모델의 clone 횟수, clone 실패율 등 사용 통계를 확인할 수 있으면 모델 관리에 도움이 된다.
- 인기 모델 파악, 문제 있는 모델 조기 발견 등에 활용할 수 있다.

#### 모델 버전 관리
- 같은 모델의 여러 버전(예: Llama 3.1 vs 3.2)을 그룹으로 묶어서 보여주고, 버전 간 차이를 표시한다.
- 모델 수가 늘어나면 개별 카드로 나열하는 것보다 버전 그룹으로 정리하는 것이 가독성에 유리하다.

#### 모델 Deprecation / Lifecycle 관리
- 오래되거나 더 이상 권장하지 않는 모델을 deprecated로 표시하고, 대체 모델을 안내하는 기능.
- Teams 논의에서도 "모델들이 너무 예전 것들만 있다"는 지적이 있었으며, 새 모델 추가뿐 아니라 오래된 모델을 정리하는 lifecycle 관리 흐름이 필요하다.

#### 자원 호환성 사전 검증 (Deployment 연계)
- clone 전에 "이 모델을 현재 프로젝트의 자원으로 실행 가능한지" 미리 안내하는 기능.
- 예: "이 모델은 GPU 80GB 필요하지만 현재 프로젝트에는 40GB만 할당됨" 같은 경고를 표시한다.
- Deployment(FR-1368) 기능과의 연계가 필요하며, 백엔드에서 모델별 최소 자원 정보를 제공해야 한다.

#### Quantization 그룹 지원
- 같은 모델의 여러 quantization 변형(예: GGUF Q4_K_M, Q5_K_S 등)을 그룹으로 묶어서 표시한다.
- Backend.AI GO에서 제공하는 디렉토리 기반 GGUF quantization 그룹핑을 참고하여, 사용자가 원하는 정밀도/크기 트레이드오프를 쉽게 선택할 수 있도록 한다.

#### 모델 활성화 상태 표시
- 현재 실행 중인 서비스에서 사용 중인 모델을 시각적으로 구분한다.
- Backend.AI GO처럼 모델이 "활성(loaded)" 상태인지, 단순 저장만 된 상태인지를 한눈에 파악할 수 있도록 한다.

#### 하드웨어 가속 호환성 표시
- 모델별로 지원하는 하드웨어 가속 경로(CUDA, ROCm 등)를 표시하여, 사용자의 환경에서 최적의 성능을 낼 수 있는 모델을 쉽게 식별할 수 있도록 한다.

## 관련 이슈 및 의존성

| 이슈 | 요약 | 상태 |
|------|------|------|
| [FR-1927](https://lablup.atlassian.net/browse/FR-1927) | Refactoring Model Store (기존 Epic) | To Do |
| [FR-389](https://lablup.atlassian.net/browse/FR-389) | Can't clone certain model from model store | In Issue Review |
| [FR-1919](https://lablup.atlassian.net/browse/FR-1919) | Automate Clone Availability Check | To Do |
| [FR-1926](https://lablup.atlassian.net/browse/FR-1926) | Support sorting in model store | To Do |
| [FR-1928](https://lablup.atlassian.net/browse/FR-1928) | Support setting thumbnails for model store card items | To Do |
| [FR-2078](https://lablup.atlassian.net/browse/FR-2078) | Model Store List Visibility by Assigned Storage | To Do |
| [FR-1368](https://lablup.atlassian.net/browse/FR-1368) | Model Deployment & Revision (별도 Epic, 의존) | To Do |
| [BA-3980](https://lablup.atlassian.net/browse/BA-3980) | Storage health check 관련 (백엔드) | - |

## 백엔드 의존성

다음 항목들은 백엔드(core) 측 변경이 필요할 수 있다:

- **프로젝트별 storage 기반 모델 가시성**: 프로젝트에 할당된 storage 정보를 기반으로 모델 목록을 필터링하는 GQL 필드/쿼리가 필요할 수 있다.
- **clone 가용성 사전 확인**: 모델별 clone 가능 여부를 batch로 조회할 수 있는 API가 필요하다.
- **썸네일 지정**: 모델 폴더 내 이미지를 썸네일로 지정하는 스키마 확장이 필요할 수 있다.
- **Storage health check**: storage 노드의 접근 가능 여부를 GQL로 노출해야 할 수 있다 (BA-3980 참조).

## 참고 자료

- [Teams 원본 스레드 - Model store 손보기](https://teams.microsoft.com/l/message/19:77773a3171f04070acd8b1098be60045@thread.skype/1768976527546?tenantId=13c6a44d-9b52-4b9e-aa34-0513ee7131f2&groupId=74ae2c4d-ec4d-4fdf-b2c2-f5041d1e8631&parentMessageId=1768976527546&teamName=devops&channelName=Backend.AI%20Cloud&createdTime=1768976527546) (devops > Backend.AI Cloud, 2026-01-21)
- [Teams 스레드 - 모델스토어 스펙 논의](https://teams.microsoft.com/l/message/19:14c484402d874dafb15806d093b95a82@thread.skype/1774238347882?tenantId=13c6a44d-9b52-4b9e-aa34-0513ee7131f2&groupId=74ae2c4d-ec4d-4fdf-b2c2-f5041d1e8631&parentMessageId=1774238347882&teamName=devops&channelName=Frontend&createdTime=1774238347882) (devops > Frontend, 2026-03-23)
- [NVIDIA NIM API Catalog](https://build.nvidia.com/models) — 모델 카탈로그 UI 레퍼런스
- [Backend.AI GO](https://go.backend.ai) — 로컬 모델 관리 UI 레퍼런스
- [Reservoir v2 (core) Loop 문서](https://lablup.sharepoint.com/:fl:/g/contentstorage/CSP_93a3ec6b-3a47-4174-aba8-e022f64d2e6a/IQAf7b4tk_7_SIUrRrJ0DDDVAcI2farRVUNvNElCVXpHr6o)
