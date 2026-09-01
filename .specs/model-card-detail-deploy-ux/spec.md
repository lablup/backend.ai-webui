# 모델 카드 상세 Drawer + 배포 UX Spec

## 개요

사용자 모델 스토어의 모델 카드 상세 UI를 기존 Modal에서 Drawer로 변경하고, `deployModelCardV2` mutation과 `RuntimeVariant`/`DeploymentRevisionPreset` 기반의 배포 UX를 구현한다. 호환 preset 유무에 따라 3가지 시나리오로 분기되는 배포 플로우를 제공한다.

## 문제 정의

1. **Modal → Drawer 전환 필요**: 기존 `ModelCardModal`은 모달 방식으로 상세 정보를 표시한다. Session Detail과 동일하게 Drawer 방식으로 전환하여 일관된 UX를 제공한다.
2. **기존 서비스 시작 버튼 제거**: 기존 `ModelTryContentButton`은 `service-definition.toml`/`model-definition.yaml` 파일 존재 여부에 의존하는 레거시 구조이다. 새로운 `deployModelCardV2` 기반 배포 플로우가 필요하다.
3. **호환 preset 기반 배포 분기**: 모델 카드에 대해 호환 가능한 `DeploymentRevisionPreset`이 있는지에 따라 배포 가능 여부와 UX가 달라져야 한다.

## 핵심 개념

### 배포 플로우 (Deploy Flow)

`deployModelCardV2` mutation은 다음 입력을 받아 모델 서비스를 생성한다:
- `cardId`: 배포할 모델 카드 UUID
- `projectId`: 배포 대상 프로젝트 UUID
- `revisionPresetId`: 선택된 DeploymentRevisionPreset UUID
- `resourceGroup`: 리소스 그룹 이름
- `desiredReplicaCount`: 레플리카 수 (기본값 1)

### RuntimeVariant ↔ RuntimeVariantPreset 관계

- `RuntimeVariant`: 추론 런타임 엔진 (예: vLLM, SGLang, NIM, TGI)
- `RuntimeVariantPreset`: 각 런타임의 설정 파라미터 세트. `runtimeVariantId`로 RuntimeVariant에 연결됨
  - `rank` 필드로 표시 우선순위 결정 (낮을수록 우선)
  - `targetSpec`: env 또는 args로 적용되는 파라미터 사양
  - `category`, `displayName`, `uiOption` 등 UI 렌더링 정보 포함

### DeploymentRevisionPreset (호환 Preset)

- `DeploymentRevisionPreset`: 모델 카드의 `minResource`를 충족하는 재사용 가능한 배포 구성 템플릿. `runtimeVariantId`로 RuntimeVariant에 연결됨
  - `name`, `description`, `rank` — 표시 정보
  - `cluster`: 클러스터 토폴로지 (단일/멀티 노드)
  - `resource`: 리소스 할당 (CPU, 메모리, 가속기)
  - `execution`: 실행 설정 (이미지, 커맨드, 환경변수)
  - `presetValues`: 런타임 파라미터 자동 설정 값
  - `resourceSlots`: 리소스 슬롯 할당 (connection)

### 호환 Preset 검색

모델 카드의 `minResource`를 충족하는 배포 가능한 `DeploymentRevisionPreset` 목록을 반환:

```graphql
# ModelCardV2 노드에서 직접 조회 (connection 필드)
ModelCardV2.availablePresets(
  filter: DeploymentRevisionPresetFilter,
  orderBy: [DeploymentRevisionPresetOrderBy!],
  ...
): DeploymentRevisionPresetConnection

# 또는 루트 쿼리로 조회
modelCardAvailablePresets(
  scope: ModelCardAvailablePresetsScope!,  # { modelCardId: UUID! }
  ...
): DeploymentRevisionPresetConnection
```

## 요구사항

### Must Have

- [ ] 모델 카드 상세 Modal을 Drawer로 변경
  - [ ] 기존 `ModelCardModal` (`react/src/components/ModelCardModal.tsx`) → `LegacyModelCardModal`로 리네이밍
  - [ ] 새 `ModelCardDrawer`를 생성
  - [ ] 기존 모달 footer 버튼 모두 제거 (`ModelTryContentButton`, Clone to Folder, Close)
  - [ ] Primary action(배포 버튼)은 Drawer Header 우상단에 배치 (Ant Design Drawer `extra` prop 활용)
- [ ] Drawer 내 모델 카드 상세 표시
  - [ ] `ModelCardV2` fragment 기반으로 메타데이터 표시 (기존 `ModelCardModalFragment`의 v1 flat 구조 → v2 nested `metadata` 구조로 전환)
  - [ ] `metadata` 서브 타입: author, title, description, task, category, architecture, framework, label, license
  - [ ] 태그(task, category, label, license) 모두 default 색상으로 통일 (기존 `ModelCardModal`의 success/blue/geekblue 등 제거)
  - [ ] `readme` 필드로 README 마크다운 렌더링 (Drawer 자체 스크롤로 처리, 별도 스크롤 영역 없음)
  - [ ] Framework 아이콘: 기존 `imageMetaData` 기반 아이콘 표시 유지
  - [ ] `ModelBrandIcon`: 모델 이름 기반 아이콘 표시 유지
  - [ ] `vfolder` 관계 필드 (DataLoader 기반)로 VFolder 정보 표시: `VFolderNodeIdenticon` + File Browser 링크 형식 (기존 `ModelCardModal`의 identicon 패턴 참고)
  - [ ] `minResource: [ModelCardV2ResourceSlotEntry!]` 표시 (resourceType + quantity). 기존 session detail page 등에서 사용하는 컴포넌트를 활용
  - [ ] v1에서 제거되는 항목: `error_msg` 표시 제거
    > **Note**: v1의 `error_msg`는 `model-definition.yaml` 파싱 실패 시 발생했으나, v2에서는 scan 실패 시 카드가 생성되지 않고, create는 관리자가 직접 입력하므로 파싱 에러가 구조적으로 발생하지 않아 필드가 제거됨.
- [ ] 배포 기능
  - [ ] `deployModelCardV2` mutation 호출로 모델 서비스 생성
  - [ ] 배포 성공 시 `/serving/${deploymentId}` (`EndpointDetailPage`)로 바로 이동
- [ ] 호환 preset 기반 3가지 배포 시나리오 구현
  - [ ] **시나리오 1 — 호환 preset 없음**: `ModelCardV2.availablePresets { count }` fragment로 목록 조회 시 호환 preset 유무 파악. count === 0인 카드는 목록에서 opacity 처리하여 시각적으로 구분 (클릭하여 Drawer 열기는 가능). Drawer 열림 시 "호환 가능한 preset이 없어 배포할 수 없습니다" error Alert 표시
  - [ ] **시나리오 2 — 단일 preset + 단일 리소스 그룹**: 배포 버튼 클릭 시 모달 없이 바로 `deployModelCardV2` 호출 (자동 결정). 확인 대화 상자 없이 즉시 배포.
  - [ ] **시나리오 3 — 복수 preset 또는 (1개 이상 preset + 복수 리소스 그룹)**: 배포 버튼 클릭 시 선택 모달 표시. preset 개수가 핵심 기준. preset이 0개이면 리소스 그룹 수와 무관하게 모달 표시하지 않음 (시나리오 1).
- [ ] 배포 선택 모달 (시나리오 3)
  - [ ] Runtime 드롭다운: `runtimeVariants` query로 RuntimeVariant 목록 조회
  - [ ] Preset 드롭다운: `ModelCardV2.availablePresets(filter: { runtimeVariantId })` 또는 `modelCardAvailablePresets` 쿼리로 호환 preset 조회
    - [ ] Runtime 선택 시 `DeploymentRevisionPresetFilter.runtimeVariantId`로 자동 필터링
    - [ ] `orderBy: [{ field: RANK, direction: "ASC" }]`로 정렬, rank가 가장 낮은 preset 자동 선택 (기본값)
  - [ ] Resource Group 드롭다운: `BAIResourceGroupSelect` 컴포넌트 활용 (`packages/backend.ai-ui/src/components/fragments/BAIResourceGroupSelect.tsx`)
  - [ ] 취소 / 배포 버튼
- [ ] 서비스 디테일 페이지 (`EndpointDetailPage`) 상단 Alert — 배포 후 상태 안내
  - [ ] `deploymentScopedSchedulingHistories` query로 최초 서빙 여부 판별
    - [ ] `scope: { deploymentId }`, `filter: { toStatus: ["READY"] }`, `limit: 1` → `count === 0`이면 최초 배포
  - [ ] 최초 서빙 전: info Alert — "서비스를 준비하고 있습니다. 모델 크기에 따라 수 분이 소요될 수 있습니다."
  - [ ] 최초 서빙 완료 + 채팅 가능 모델: success Alert — "서비스가 준비되었습니다. 이 모델은 채팅을 지원합니다." + [바로 채팅하기] 버튼
    - [ ] 바로 채팅하기 → `/chat?endpointId=${endpoint_id}`로 이동
  - [ ] 채팅 가능 여부 판별: `baiClient._config.blockList`에 `'chat'`이 포함되지 않고, healthy route가 존재할 때 (`hasAnyHealthyRoute` 로직 참고, `EndpointDetailPage.tsx:398`)

### Nice to Have

- [ ] Runtime 드롭다운에서 추천 런타임 표시 (예: "(추천)" 라벨)
- [ ] Preset 드롭다운에서 기본 preset 표시 (예: "(기본)" 라벨)
- [ ] 배포 중 로딩 상태 표시
- [ ] 모델 카드 아이템 hover 시 더보기 버튼 표시 → 메뉴에서 바로 배포 가능

## 사용자 스토리

- 사용자로서, 모델 카드를 클릭하면 상세 정보를 Drawer에서 확인하고 싶다.
- 사용자로서, 모델 상세에서 바로 배포 버튼을 눌러 서비스를 시작하고 싶다.
- 사용자로서, 호환 가능한 런타임과 preset이 여러 개일 때 원하는 조합을 선택하여 배포하고 싶다.
- 사용자로서, 배포가 불가능한 모델(호환 preset 없음)은 목록에서 바로 알 수 있고, 상세에서 이유를 확인하고 싶다.
- 사용자로서, 배포 직후 서비스 준비 상태를 확인하고, 준비되면 바로 채팅을 시작하고 싶다.

## 인수 조건 (Acceptance Criteria)

### Drawer

- [ ] 모델 카드 클릭 시 오른쪽에서 Drawer가 열림
- [ ] Drawer에 title, author, description, task, category, architecture, framework, label, license가 표시됨
- [ ] 태그가 모두 default 색상으로 표시됨
- [ ] README 마크다운이 Drawer 본문 내에 렌더링되고, Drawer 자체 스크롤로 처리됨 (별도 스크롤 영역 없음)
- [ ] `vfolder` 관계 필드를 사용하여 VFolder identicon + File Browser 링크가 표시됨
- [ ] `minResource` (리소스 요구사항)가 표시됨
- [ ] 기존 모달 footer 버튼(`ModelTryContentButton`, Clone to Folder, Close)이 모두 제거됨
- [ ] 배포 버튼이 Drawer Header 우상단(`extra`)에 위치함
- [ ] `ModelBrandIcon`이 Drawer에 표시됨
- [ ] v1의 `error_msg` 표시가 제거됨

### 배포 — 시나리오 1 (호환 preset 없음)

- [ ] 해당 모델 카드가 목록에서 opacity 처리되어 시각적으로 구분됨 (클릭하여 Drawer 열기는 가능)
- [ ] Drawer Header의 배포 버튼이 비활성화됨
- [ ] Drawer 본문에 error Alert가 표시됨 ("호환 가능한 preset이 없어 배포할 수 없습니다")

### 배포 — 시나리오 2 (단일 preset + 단일 리소스 그룹)

- [ ] 배포 버튼 클릭 시 모달 없이 즉시 `deployModelCardV2` mutation 호출 (확인 대화 상자 없음)
- [ ] 배포 성공 시 `/serving/${deploymentId}` 페이지로 바로 이동

### 배포 — 시나리오 3 (복수 preset 또는 1개 이상 preset + 복수 리소스 그룹)

- [ ] 배포 버튼 클릭 시 선택 모달이 열림
- [ ] Runtime 드롭다운에서 해당 모델 카드의 호환 preset이 있는 런타임 목록이 표시됨
- [ ] Runtime 선택 시 Preset 드롭다운이 `availablePresets(filter: { runtimeVariantId })` 결과로 필터링됨
- [ ] rank가 가장 낮은 preset이 자동 선택됨
- [ ] Resource Group 드롭다운에서 `BAIResourceGroupSelect` 기반 목록이 표시됨
- [ ] 배포 버튼 클릭 시 `deployModelCardV2` mutation이 올바른 파라미터로 호출됨
- [ ] 배포 성공 시 `/serving/${deploymentId}` 페이지로 바로 이동

### 배포 후 서비스 디테일 페이지 Alert

- [ ] `deploymentScopedSchedulingHistories(scope: { deploymentId }, filter: { toStatus: ["READY"] }, limit: 1)` count로 최초 서빙 여부 판별
- [ ] 최초 서빙 전 (count === 0): info Alert 표시
- [ ] 최초 서빙 완료 + 채팅 가능 (`blockList`에 `'chat'` 미포함 + healthy route 존재): success Alert + [바로 채팅하기] 버튼 (`/chat?endpointId=...`)

## 범위 밖 (Out of Scope)

- 모델 카드 목록 페이지 마이그레이션 — `model-store-v2-migration` 스펙에서 다룸
- 관리자 모델 카드 CRUD — `admin-model-card-management` 스펙에서 다룸
- 동적 Args/Env 폼 시스템 — 별도 스펙 (`dynamic-args-env-form-system`)에서 다룸
- RuntimeVariant/RuntimeVariantPreset 관리 (생성/수정/삭제) — 관리자 기능
- `desiredReplicaCount` 사용자 지정 UI — 기본값 1로 고정, 추후 확장

## 고려사항

### 호환 preset 검색 API

`ModelCardV2.availablePresets` connection 필드가 GQL에 추가됨. fragment에 `availablePresets { count }`를 포함하면 목록 조회 시 한번에 호환 preset 유무를 파악할 수 있다.

### 호환 preset 검색 시점

시나리오 1에서 목록의 모델 카드를 opacity 처리하려면 목록 로드 시점에 각 모델 카드의 호환 preset 유무를 알아야 한다. `ModelCardV2.availablePresets` connection 필드를 사용하여 fragment에 `availablePresets { count }`를 포함하면 목록 조회 시 한번에 파악 가능하다.

### `revisionPresetId` 매핑

`deployModelCardV2`의 `revisionPresetId`는 `ModelCardV2.availablePresets`가 반환하는 `DeploymentRevisionPreset`의 UUID이다. 배포 선택 모달에서 사용자가 preset을 선택하면, 해당 `DeploymentRevisionPreset`의 `rowId`를 `revisionPresetId`로 전달한다.

### 배포 대상 프로젝트 선택

`DeployModelCardV2Input.projectId`는 배포 대상 프로젝트를 지정한다. 현재 스펙에서는 사용자의 현재 프로젝트를 기본값으로 사용하되, 선택 UI는 배포 선택 모달에 포함하지 않는다 (추후 필요 시 추가).

### 레플리카 수

`desiredReplicaCount`는 기본값 1로 고정한다. 고급 사용자를 위한 레플리카 수 조정은 별도 이슈에서 다룬다.

## 백엔드 API 레퍼런스

### 배포 Mutation

```graphql
deployModelCardV2(cardId: UUID!, input: DeployModelCardV2Input!): DeployModelCardV2Payload!

input DeployModelCardV2Input {
  projectId: UUID!                # 배포 대상 프로젝트
  revisionPresetId: UUID!         # DeploymentRevisionPreset UUID
  resourceGroup: String!          # 리소스 그룹
  desiredReplicaCount: Int! = 1   # 레플리카 수
  openToPublic: Boolean = null    # preset 기본값 → False
  replicaCount: Int = null        # preset 기본값 → desiredReplicaCount
  revisionHistoryLimit: Int = null # preset 기본값 → 10
  deploymentStrategy: PresetDeploymentStrategyInput = null  # preset 기본값 → none
}

type DeployModelCardV2Payload {
  deploymentId: UUID!             # 생성된 서비스 ID
  deploymentName: String!         # 생성된 서비스 이름
}
```

### RuntimeVariant / RuntimeVariantPreset Query

```graphql
# 런타임 목록 조회
runtimeVariants(
  filter: RuntimeVariantFilter,
  orderBy: [RuntimeVariantOrderBy!],
  first: Int, last: Int, before: String, after: String,
  limit: Int, offset: Int
): RuntimeVariantConnection

# 런타임 preset 목록 조회
runtimeVariantPresets(
  filter: RuntimeVariantPresetFilter,  # runtimeVariantId로 필터링 가능
  orderBy: [RuntimeVariantPresetOrderBy!],
  first: Int, last: Int, before: String, after: String,
  limit: Int, offset: Int
): RuntimeVariantPresetConnection
```

### 주요 타입

```graphql
type RuntimeVariant {
  id: ID!
  rowId: UUID!
  name: String!                   # 예: "vllm", "sglang", "nim", "tgi"
  description: String
  createdAt: DateTime!
  updatedAt: DateTime
}

type RuntimeVariantPreset {
  id: ID!
  rowId: UUID!
  runtimeVariantId: UUID!         # 소속 RuntimeVariant
  name: String!                   # 예: "Tensor Parallel Size"
  description: String
  rank: Int!                      # 표시 우선순위 (낮을수록 우선)
  targetSpec: PresetTargetSpec!   # env 또는 args 적용 사양
  category: String                # UI 카테고리 그룹
  displayName: String             # UI 표시 라벨
  uiOption: UIOption              # UI 렌더링 옵션
  createdAt: DateTime!
  updatedAt: DateTime
}

type PresetTargetSpec {
  presetTarget: String!           # "env" 또는 "args"
  valueType: String!              # "str", "int", "float", "bool"
  defaultValue: String
  key: String!                    # env key 또는 args flag
}

input RuntimeVariantPresetFilter {
  name: StringFilter = null
  runtimeVariantId: UUID = null   # 특정 RuntimeVariant의 preset만 조회
}
```

### 배포 후 상태 조회

```graphql
# 배포의 스케줄링 이력 조회 — 최초 서빙 여부 판별용
deploymentScopedSchedulingHistories(
  scope: DeploymentScope!,          # { deploymentId: UUID! }
  filter: DeploymentHistoryFilter,  # { toStatus: ["READY"] }
  limit: Int
): DeploymentHistoryConnection      # count === 0이면 아직 READY 도달 전 (최초 배포)

type DeploymentHistory {
  id: ID!
  deploymentId: ID!
  phase: String!
  fromStatus: String
  toStatus: String
  result: SchedulingResult!
  errorCode: String
  message: String
  subSteps: [SubStepResultGQL!]!
  attempts: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### 호환 Preset 검색

```graphql
# ModelCardV2 노드에서 직접 조회
ModelCardV2.availablePresets(
  filter: DeploymentRevisionPresetFilter,
  orderBy: [DeploymentRevisionPresetOrderBy!],
  ...
): DeploymentRevisionPresetConnection

# 루트 쿼리로 조회
modelCardAvailablePresets(
  scope: ModelCardAvailablePresetsScope!,  # { modelCardId: UUID! }
  ...
): DeploymentRevisionPresetConnection
```

모델 카드의 `minResource`를 충족하는 배포 가능한 `DeploymentRevisionPreset` 목록을 반환한다.

### DeploymentRevisionPreset 주요 필드

```graphql
type DeploymentRevisionPreset {
  id: ID!
  rowId: UUID!                    # deployModelCardV2의 revisionPresetId로 전달
  runtimeVariantId: UUID!         # 소속 RuntimeVariant
  name: String!
  description: String
  rank: Int!                      # 표시 우선순위 (낮을수록 우선)
  cluster: PresetClusterSpec!     # 클러스터 토폴로지
  resource: PresetResourceAllocation!  # 리소스 할당
  execution: PresetExecutionSpec! # 실행 설정
  presetValues: [DeploymentRevisionPresetValueEntry!]!  # 런타임 파라미터
  resourceSlots: AllocatedResourceSlotConnection!
  createdAt: DateTime!
  updatedAt: DateTime
}

input DeploymentRevisionPresetFilter {
  name: StringFilter = null
  runtimeVariantId: UUID = null   # 특정 RuntimeVariant의 preset만 조회
}

input DeploymentRevisionPresetOrderBy {
  field: DeploymentRevisionPresetOrderField!  # NAME | RANK | CREATED_AT
  direction: String! = "ASC"
}
```

## UI 와이어프레임

### Drawer 레이아웃

```
┌─────────────────────────────────────────────┐
│ [Drawer Header: 모델 카드 이름]  [배포] [X] │
│                        (extra prop ↑)       │
├─────────────────────────────────────────────┤
│ (시나리오 1: 호환 preset 없음 시)           │
│ ┌─────────────────────────────────────────┐ │
│ │ ❌ Error Alert: 배포 불가 안내          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Title: metadata.title                       │
│ Author: metadata.author                     │
│ Description: metadata.description           │
│                                             │
│ Tags: [task] [category] [label...] [license]│
│ (모두 default 색상)                          │
│                                             │
│ Architecture: metadata.architecture         │
│ Framework: metadata.framework               │
│ Version: metadata.modelVersion              │
│                                             │
│ 📁 VFolder: [identicon + File Browser 링크] │
│ ⚙️ Min Resource: cpu: 4, mem: 16G, ...     │
│                                             │
│ ─── README ───                              │
│ (마크다운 렌더링)                            │
│                                             │
└─────────────────────────────────────────────┘
```

### 배포 선택 모달 (시나리오 3)

```
┌──────────────────────────────────────┐
│         모델 배포 설정                │
├──────────────────────────────────────┤
│                                      │
│ Runtime                              │
│ ┌──────────────────────────────┐     │
│ │ vllm (추천)              ▼  │     │
│ └──────────────────────────────┘     │
│                                      │
│ Preset                               │
│ ┌──────────────────────────────┐     │
│ │ vllm-4xA100 (기본)      ▼  │     │
│ └──────────────────────────────┘     │
│                                      │
│ Resource Group                       │
│ ┌──────────────────────────────┐     │
│ │ default                  ▼  │     │
│ └──────────────────────────────┘     │
│                                      │
│           [취소]  [배포]             │
└──────────────────────────────────────┘
```

## 관련 파일

| 파일 | 역할 | 비고 |
|------|------|------|
| `react/src/components/ModelCardModal.tsx` | 기존 모델 카드 상세 모달 | → `LegacyModelCardModal`로 리네이밍 |
| `react/src/pages/ModelStoreListPage.tsx` | 기존 모델 스토어 목록 페이지 | v1 `model_cards` query 사용 |
| `react/src/components/ModelTryContentButton.tsx` | 레거시 서비스 시작 버튼 | 제거 대상 (Drawer에서 미사용) |
| `react/src/components/ModelBrandIcon.tsx` | 모델 이름 기반 아이콘 | Drawer에서 유지 |
| `react/src/pages/EndpointDetailPage.tsx` | 서비스 디테일 페이지 | 배포 후 이동 대상, 채팅 버튼 로직 포함 |
| `react/src/pages/ChatPage.tsx` | 채팅 페이지 | `/chat?endpointId=` 경로 |
| `packages/backend.ai-ui/src/components/fragments/BAIResourceGroupSelect.tsx` | 리소스 그룹 선택 컴포넌트 | 배포 선택 모달에서 재사용 |

## 관련 이슈

- [model-store-v2-migration spec](../model-store-v2-migration/spec.md) — 사용자 모델 스토어 페이지 마이그레이션 스펙
- [admin-model-card-management spec](../admin-model-card-management/spec.md) — 관리자 모델 카드 CRUD 스펙
- [backend.ai#10703](https://github.com/lablup/backend.ai/pull/10703) — feat: add ModelCard entity with full CRUD stack
- [backend.ai#10783](https://github.com/lablup/backend.ai/pull/10783) — feat: expand model card fields, add access level, deployment, RBAC
