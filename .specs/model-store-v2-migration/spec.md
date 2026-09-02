# 사용자 모델 스토어 페이지 modelCardV2 마이그레이션 Spec

## 개요

사용자 메뉴의 Model Store 페이지(`ModelStoreListPage`)가 현재 사용하는 레거시 `model_cards` (Graphene) GQL API를 새로운 `projectModelCardsV2` (Strawberry) API로 전환한다. 기존 Row/Col 그리드 카드 레이아웃을 유지하면서, 서버 사이드 페이지네이션/필터링/정렬을 도입하고, access level 기반 노출 제어를 반영한다. 모델 카드 상세 모달은 Drawer로 대체하며, 서비스 시작(배포) UX는 별도 이슈에서 다룬다.

## 문제 정의

1. **레거시 API 의존**: 현재 `ModelStoreListPage`는 Graphene 기반의 `model_cards` query를 사용한다. 이 API는 `first: 200`으로 전체를 가져온 뒤 클라이언트에서 필터링/정렬하는 구조라 성능이 좋지 않고, 백엔드의 새로운 `model_cards` 테이블([PR #10703](https://github.com/lablup/backend.ai/pull/10703) + [PR #10783](https://github.com/lablup/backend.ai/pull/10783))이 제공하는 서버 사이드 기능을 활용하지 못한다.
2. **페이지네이션 부재**: 모델 카드가 많아질 경우 전체를 한번에 로드하므로 느리고, GQL 응답이 과도하게 크다.
3. **서비스 시작 UX 개선 필요**: `ModelTryContentButton`이 모달 footer에 위치하며, `service-definition.toml`과 `model-definition.yaml` 파일 존재 여부에 의존하는 구조이다. modelCardV2 기반으로 전환하면서 `RuntimeVariant` + `RuntimeVariantPreset` 기반의 새로운 서비스 시작 플로우가 필요하다.
4. **데이터 구조 차이**: `ModelCard`(v1)은 flat 구조이고, `ModelCardV2`는 메타데이터가 `metadata: ModelCardV2Metadata` 서브 타입으로 분리되어 있다. `error_msg`, `min_resource`, `vfolder_node` 필드가 v2에 없고, 대신 `vfolderId`(UUID)로 대체된다. 또한 `accessLevel` (PUBLIC/INTERNAL) 필드가 추가되어 노출 제어가 가능하다.

## 요구사항

### Must Have

- [ ] 백엔드 버전에 따른 컴포넌트 분기
  - [ ] 기존 컴포넌트를 Legacy로 리네이밍 (`LegacyModelStoreListPage`, `LegacyModelCardModal` 등)
  - [ ] 새 컴포넌트를 기존 이름으로 생성 (`ModelStoreListPage`, `ModelCardModal` 등)
  - [ ] modelCardV2 지원 버전: 새 컴포넌트 표시
  - [ ] modelCardV2 미지원 버전: Legacy 컴포넌트 표시
  - [ ] `baiClient.supports()` 또는 `isManagerVersionCompatibleWith()`로 버전 분기
- [ ] 새 `ModelStoreListPage`의 GQL query를 `projectModelCardsV2`로 구성
  - [ ] `ProjectModelCardV2Scope`의 `projectId`에 MODEL_STORE 프로젝트 ID 지정
  - [ ] 백엔드에서 access level 기반으로 `PUBLIC` 모델만 일반 사용자에게 반환 (INTERNAL 모델은 자동 필터링됨)
- [ ] `ModelCardV2Filter`에 포함된 필드만 사용한 서버 사이드 필터링
  - [ ] 이름(name) 필터: `StringFilter` (contains 등) 사용
  - [ ] 도메인(domainName) 필터: scope에서 프로젝트를 지정하면 도메인이 암시적으로 결정됨. 필요 시 추가 필터링.
  - [ ] 프로젝트(projectId) 필터: scope에서 이미 적용됨
  - [ ] 기존 category/task/label 클라이언트 필터는 제거 (ModelCardV2Filter에 미포함)
- [ ] `ModelCardV2OrderBy`를 사용한 서버 사이드 정렬
  - [ ] NAME (ASC/DESC) 정렬
  - [ ] CREATED_AT (ASC/DESC) 정렬
- [ ] Relay cursor 기반 페이지네이션 (`first`, `after`) + "더 보기" 버튼 방식의 점진적 로딩 적용 (카드 그리드에 적합)
- [ ] 기존 Row/Col 그리드 카드 레이아웃 유지
  - [ ] 각 카드에 name, `metadata.title`, task, `createdAt`/`updatedAt` 표시
  - [ ] 태그(label 등)는 카드의 description 영역으로 이동
  - [ ] 모든 태그 색상을 default로 통일 (기존 success, blue, geekblue 등 제거)
  - [ ] 카드 클릭 시 모델 카드 상세 Drawer 열기
- [ ] `ModelCardModal`을 `ModelCardV2` 타입으로 전환
  - [ ] fragment를 `ModelCardV2` 타입 기반으로 재작성
  - [ ] `metadata` 서브 타입에서 author, title, description, task, category, architecture, framework, label, license 표시
  - [ ] 모달 내 태그(task, category, label, license)도 모두 default 색상으로 통일
  - [ ] `readme` 필드로 README 마크다운 렌더링
  - [ ] `vfolderId`를 File Browser 링크로 표시 (data 페이지의 file browser 열기 링크 활용)
- [ ] 모델 카드 상세를 Drawer로 표시 (modal 대체). Drawer의 primary action은 `extra` prop으로 Header 우상단에 배치. 서비스 시작 UX(배포 로직, RuntimeVariant 연동)는 별도 이슈에서 구현.
- [ ] 기존 클라이언트 사이드 필터링(category, task, label Select) 제거
  - [ ] `ModelCardV2Filter`에 포함된 필드(name, domainName, projectId)만 사용
- [ ] 기존 `ModelBrandIcon` 유지 (모델 이름 기반 아이콘)
- [ ] 검색어 입력 시 debounce 적용하여 서버 요청 최적화 (참고: `BAIVFolderSelect`에서 `useDebouncedDeferredValue` + `useTransition` 조합으로 debounce와 React transition을 함께 사용하는 패턴이 구현되어 있음)

### Nice to Have
- [ ] 빈 상태(모델 카드 없음) UI 개선
- [ ] 모델 카드 로딩 시 스켈레톤 카드 표시

## 사용자 스토리

- 사용자로서, 모델 스토어에서 모델 카드 목록을 빠르게 조회하고 싶다. 서버 사이드 페이지네이션으로 초기 로딩이 빨라야 한다.
- 사용자로서, 모델 이름으로 검색하고, 생성일/이름 기준으로 정렬하여 원하는 모델을 쉽게 찾고 싶다.
- 사용자로서, 모델 카드를 클릭하면 상세 정보(메타데이터, README)를 확인하고 싶다.

## 인수 조건 (Acceptance Criteria)

### 목록 페이지

- [ ] `projectModelCardsV2` query를 사용하여 모델 카드 목록을 조회함 (`ProjectModelCardV2Scope`에 MODEL_STORE 프로젝트 ID 지정)
- [ ] `PUBLIC` access level 모델만 표시됨 (백엔드에서 자동 필터링)
- [ ] TODO(needs-backend): 모델 카드 목록에서 현재 프로젝트에서 mount 가능한 storage의 model 폴더만 필터링하여 표시. 백엔드에서 `StoragePermissionInfo { storageHostName, permissions: [StoragePermissionType] }` 형태의 타입을 제공 예정 (필드명/타입명 미확정). 해당 API가 확정되면 mount 가능 여부를 기반으로 모델 카드 필터링 적용
- [ ] 이름 검색 시 `ModelCardV2Filter.name` (StringFilter)을 사용하여 서버에서 필터링됨
- [ ] 정렬 드롭다운에서 NAME/CREATED_AT (ASC/DESC) 선택 가능하고, 서버에서 정렬됨
- [ ] cursor 기반 페이지네이션 + "더 보기" 버튼으로 점진적 로딩이 동작함
- [ ] 각 모델 카드에 title(또는 name), task, 업데이트 시간이 표시됨 (category는 카드 목록에서 표시하지 않음)
- [ ] Row/Col 그리드 레이아웃이 기존과 동일하게 유지됨 (xs~sm: 24, lg: 12)
- [ ] 새로고침 버튼으로 목록을 다시 불러올 수 있음

### 모델 카드 상세 (별도 이슈에서 구현)

> modal → drawer로 변경 예정. 서비스 시작 UX, RuntimeVariant 연동, 배포 로직 포함.

### 데이터 마이그레이션 호환성

- [ ] v1 `ModelCard` 필드와 v2 `ModelCardV2` 필드의 차이가 UI에 반영됨
  - `error_msg`: v2에 없음 — error 표시 로직 제거
  - `min_resource`: v2에서 `minResource: [ModelCardV2ResourceSlotEntry!]`로 GQL 노출됨 — 리소스 요구사항 표시 가능
  - `vfolder_node`: v2에서는 `vfolderId` (UUID) + `vfolder` (VFolder 관계 필드, DataLoader 기반)로 대체
  - `metadata` 서브 타입: author, title, description 등이 nested 구조
  - `accessLevel`: v2 신규 — `PUBLIC` 모델만 사용자에게 노출 (백엔드에서 자동 필터링)

## 범위 밖 (Out of Scope)

- 관리자 모델 카드 관리 (CRUD) — 별도 스펙 (`admin-model-card-management`)
- 모델 카드 배포 상세 (`deployModelCardV2`) — 별도 이슈에서 다룸
- 동적 Args/Env 폼 시스템 — 별도 스펙 (`dynamic-args-env-form-system`)
- 모델 파일 업로드/다운로드/버전 관리
- 모델 카드 생성/수정/삭제 (사용자는 읽기 전용)
- `RuntimeVariant` ↔ `ModelCardV2` 연결 관계의 백엔드 구현 (코어 팀 담당)
- 기존 model_cards (v1) Legacy 컴포넌트 제거 (v2 안정화 이후 별도 진행)
- 모델 목록 UI를 리스트 형태로 변경 (FR-1927 스펙에서 다룸)

## V1 vs V2 필드 매핑 참고

| v1 ModelCard 필드 | v2 ModelCardV2 필드 | 비고 |
|---|---|---|
| id (Relay ID) | id (Relay ID) | 동일 |
| name | name | 동일 |
| (없음) | rowId | v2 전용 모델 카드 DB row ID |
| row_id (VFolder UUID) | vfolderId | v1에서 VFolder의 row_id → v2에서 vfolderId로 명칭 변경 |
| author | metadata.author | nested |
| title | metadata.title | nested |
| version | metadata.modelVersion | 이름 변경 + nested |
| description | metadata.description | nested |
| task | metadata.task | nested |
| category | metadata.category | nested |
| architecture | metadata.architecture | nested |
| framework | metadata.framework | nested |
| label | metadata.label | nested |
| license | metadata.license | nested |
| readme | readme | 동일 (top-level) |
| (없음) | accessLevel | v2 신규: PUBLIC / INTERNAL |
| created_at | createdAt | 네이밍 변경 |
| modified_at | updatedAt | 이름 변경 |
| vfolder_node | vfolderId (UUID) + vfolder (VFolder) | vfolderId는 UUID, vfolder는 DataLoader 기반 관계 필드 |
| error_msg | (없음) | v2에서 제거됨 |
| min_resource | minResource: [ModelCardV2ResourceSlotEntry!] | GQL에 노출됨 (resourceType + quantity) |
| readme_filetype | (없음) | v2에서 제거됨 |
| (없음) | availablePresets | v2 신규: 호환 배포 preset connection |

## 백엔드 API 레퍼런스

### 사용자용 Query

```graphql
# 프로젝트 스코프 목록 조회 (사용자용 — MODEL_STORE 프로젝트 내, PUBLIC만 반환)
projectModelCardsV2(
  scope: ProjectModelCardV2Scope!,
  filter: ModelCardV2Filter,
  orderBy: [ModelCardV2OrderBy!],
  before: String, after: String,
  first: Int, last: Int,
  limit: Int, offset: Int
): ModelCardV2Connection

# 단건 조회
modelCardV2(id: UUID!): ModelCardV2
```

### Input 타입

```graphql
input ProjectModelCardV2Scope {
  projectId: UUID!                # MODEL_STORE 프로젝트 UUID
}

input ModelCardV2Filter {
  name: StringFilter = null       # 이름 필터 (contains, equals 등)
  domainName: String = null       # 도메인 필터 (exact)
  projectId: UUID = null          # 프로젝트 필터 (exact)
}

input ModelCardV2OrderBy {
  field: ModelCardV2OrderField!   # NAME | CREATED_AT
  direction: String! = "ASC"      # ASC | DESC
}

enum ModelCardV2AccessLevel {
  PUBLIC                          # 일반 사용자에게 노출
  INTERNAL                        # 관리자만 볼 수 있음
}
```

### 배포 Mutation (상세는 #6355에서 다룸)

```graphql
deployModelCardV2(cardId: UUID!, input: DeployModelCardV2Input!): DeployModelCardV2Payload!

input DeployModelCardV2Input {
  projectId: UUID!                # 배포 대상 프로젝트
  revisionPresetId: UUID!         # Revision preset UUID
  resourceGroup: String!          # 리소스 그룹
  desiredReplicaCount: Int! = 1   # 레플리카 수
  openToPublic: Boolean = null    # 공개 여부 오버라이드 (preset 기본값 → False)
  replicaCount: Int = null        # 레플리카 수 오버라이드 (preset 기본값 → desiredReplicaCount)
  revisionHistoryLimit: Int = null # 리비전 히스토리 제한 오버라이드 (preset 기본값 → 10)
  deploymentStrategy: PresetDeploymentStrategyInput = null  # 배포 전략 오버라이드
}
```

### RuntimeVariant / RuntimeVariantPreset (참고)

`RuntimeVariant`는 추론 런타임 엔진(vLLM, SGLang, NIM, TGI 등)을 나타내는 별도 엔티티. `RuntimeVariantPreset`은 각 런타임의 설정 파라미터(tensor parallelism, quantization 등)를 정의.

```graphql
# 런타임 목록 조회
runtimeVariants(filter: RuntimeVariantFilter, ...): RuntimeVariantConnection

# 런타임 preset 목록 조회
runtimeVariantPresets(filter: RuntimeVariantPresetFilter, ...): RuntimeVariantPresetConnection
```

### 모델 카드별 호환 Preset 검색

모델 카드의 `minResource`를 충족하는 배포 가능한 revision preset 목록을 반환:

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
  filter: DeploymentRevisionPresetFilter,
  ...
): DeploymentRevisionPresetConnection
```

> REST에서도 동일: `POST /v2/model-cards/{card_id}/available-presets/search`

### 백엔드에 아직 없는 기능 (follow-up 필요)

1. **mountable storage 필터링**: 백엔드에서 `StoragePermissionInfo { storageHostName, permissions: [StoragePermissionType] }` 형태의 타입 제공 예정 (필드명/타입명 미확정). 해당 API 확정 후 mount 가능한 storage의 model 폴더만 필터링하여 표시하도록 적용.

## 관련 이슈

- [admin-model-card-management spec](../admin-model-card-management/spec.md) — 관리자 모델 카드 CRUD 스펙
- [FR-1927 model-store-improvement spec](../FR-1927-model-store-improvement/spec.md) — 모델 스토어 UI/UX 개선 스펙
- [backend.ai#10703](https://github.com/lablup/backend.ai/pull/10703) — feat: add ModelCard entity with full CRUD stack
- [backend.ai#10783](https://github.com/lablup/backend.ai/pull/10783) — feat: expand model card fields, add access level, deployment, RBAC
