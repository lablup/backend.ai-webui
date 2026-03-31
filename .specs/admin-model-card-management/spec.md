# 관리자 모델 카드 관리 Spec

## 개요

RBAC 퍼미션이 부여된 관리자가 모델 스토어에 표시되는 모델 카드를 관리할 수 있는 기능. 모델 카드를 직접 생성/삭제하고, 메타데이터(제목, 설명 등)를 편집하며, 공개/비공개(access level) 상태를 제어할 수 있다. 백엔드(core)에서 `model_cards` 테이블 기반의 full CRUD API가 구현 완료되었으며 ([PR #10703](https://github.com/lablup/backend.ai/pull/10703) 초기 구현, [PR #10783](https://github.com/lablup/backend.ai/pull/10783) 전체 필드 확장 및 배포 연동), GQL에서 모든 메타데이터 필드, access level, 벌크 삭제, 프로젝트 스캔 기능을 지원한다.

> **참고**: 이 스펙은 2개 레이어 중 첫 번째에 해당합니다.
> 1. **모델 카드 관리** (본 스펙) — 모델 카드 CRUD, 공개/비공개
> 2. **동적 Args/Env 폼 시스템 + 모델 배포** (별도 스펙) — JSON schema 기반 동적 폼 렌더링, 런타임별 args/env 차이 처리, 우선순위 랭크. 모델 카드에서 직접 배포(`deployModelCardV2`) 및 revision preset 기반 배포 워크플로우 포함 ([#6355](https://github.com/lablup/backend.ai-webui/issues/6355))

## 문제 정의

1. **불친절한 모델 스토어 등록 과정**: 현재 모델 스토어에 아이템을 추가하려면 `model-definition.yaml`, `service-definition.toml` 등의 파일을 직접 작성해야 하며, 이 파일들이 model store item에 어떻게 반영되는지 UI가 안내하지 않는다. WebUI에서 파일 생성/수정 자체는 가능하지만, 모델 스토어 전용 워크플로우가 아니라 우회적인 방식이다.
2. **별도 테이블 부재**: 모델 스토어가 별도 테이블 없이 프로젝트 폴더 기반으로 동작하여, 아이템 추가/수정/삭제를 "일반적인 CRUD"처럼 할 수 없었다. 백엔드(core)에서 `model_cards` 별도 테이블이 추가되었으므로, 파일 작성 절차를 몰라도 아이템을 추가하듯 관리할 수 있는 UI가 필요하다.
3. **공개/비공개 제어 부재**: 모든 모델 카드가 모델 스토어에 일괄 노출되어, 특정 모델을 비공개로 전환하거나 준비 중인 모델을 숨길 수 없다.
4. **느린 로딩 속도**: 백엔드에서 프로젝트 폴더를 파싱하여 model definition을 읽고 metadata를 반환하는 구조라 모델 카드 로딩이 느리다. 별도 테이블로 관리하면 검색/필터/관리 속도를 크게 개선할 수 있다.

## 요구사항

### Must Have

- [ ] 관리자 전용 메뉴 내 모델 카드 관리 페이지. RBAC `MODEL_CARD` 엔티티 퍼미션 기반 접근 제어 (백엔드에 RBAC 마이그레이션 완료). 첫 버전은 superadmin 전용으로 시작하되, RBAC 권한 조회 API가 준비되면 세부 권한 적용.
- [ ] 모델 카드 목록 조회: `adminModelCardsV2` query로 페이지네이션/필터/정렬 지원
- [ ] 모델 카드 생성: `adminCreateModelCardV2` mutation
  - [ ] 필수 필드: name, vfolderId, projectId
  - [ ] 선택 필드: domainName, author, title, modelVersion, description, task, category, architecture, framework, label, license, readme, accessLevel — GQL에서 모두 지원됨
- [ ] 모델 카드 삭제: `adminDeleteModelCardV2` mutation (단건)
- [ ] 모델 카드 벌크 삭제: `adminDeleteModelCardsV2` mutation (ids 배열)
- [ ] 모델 카드 메타데이터 편집: `adminUpdateModelCardV2` mutation — GQL에서 모든 필드 지원됨
  - [ ] 이름(name) 편집
  - [ ] 설명(description) 편집
  - [ ] 제목(title) 편집
  - [ ] 저자(author) 편집
  - [ ] 카테고리(category) 편집
  - [ ] 태스크(task) 편집
  - [ ] 라벨(label) 편집
  - [ ] 라이선스(license) 편집
  - [ ] 아키텍처(architecture) 편집
  - [ ] 프레임워크(framework) 편집
  - [ ] 모델 버전(modelVersion) 편집
  - [ ] README(readme) 편집
- [ ] 공개/비공개(Access Level) 상태 제어
  - [ ] `ModelCardV2AccessLevel` enum: `PUBLIC` / `INTERNAL` (기본값: `INTERNAL`)
  - [ ] 각 모델 카드에 access level 상태 표시
  - [ ] 토글/셀렉트로 즉시 상태 전환 (`adminUpdateModelCardV2`의 `accessLevel` 필드)
  - [ ] `INTERNAL` 모델은 일반 사용자의 모델 스토어에서 노출되지 않음
  - [ ] 관리 페이지에서는 모든 access level의 모델이 표시됨 (상태가 시각적으로 구분)
- [ ] 프로젝트 VFolder 스캔 (기존 동작 호환): `scanProjectModelCardsV2` mutation으로 MODEL_STORE 프로젝트의 VFolder들을 스캔하여 model-definition.yaml 기반으로 모델 카드를 자동 생성/업데이트. 기존 파일 기반으로 등록된 모델들의 마이그레이션 용도.

### Nice to Have

- [ ] 프로젝트 스코프 목록 조회: `projectModelCardsV2` query — 향후 프로젝트 단위로 모델 카드를 별도 표시하는 UI 확장 시 활용
- [ ] 벌크 작업 지원
  - [ ] 여러 모델 카드를 선택하여 일괄 access level 전환
  - [ ] 여러 모델 카드를 선택하여 일괄 삭제 — `adminDeleteModelCardsV2` GQL 지원됨
- [ ] 아이콘 설정: 모델 카드에 아이콘을 지정하여 시각적 구분
- [ ] 모델 카드 미리보기: 편집 중인 모델 카드가 일반 사용자에게 어떻게 보이는지 미리보기

## 사용자 스토리

- 관리자로서, UI에서 직접 새 모델 카드를 생성하고 싶다. 그래야 definition 파일 작성 절차를 몰라도 일반적인 폼 입력만으로 모델 스토어에 아이템을 등록할 수 있다.
- 관리자로서, 모델 카드 생성 시 모델 전용 VFolder를 함께 생성하고 싶다. 그래야 별도로 폴더를 미리 만들어두지 않아도 된다.
- 관리자로서, 불필요한 모델 카드를 삭제하고 싶다. 그래야 더 이상 사용하지 않는 모델을 정리할 수 있다.
- 관리자로서, 모델 스토어에 표시되는 모델 카드의 메타데이터(제목, 설명 등)를 편집하고 싶다. 그래야 사용자에게 정확하고 유용한 정보를 제공할 수 있다.
- 관리자로서, 특정 모델 카드를 INTERNAL로 전환하고 싶다. 그래야 아직 준비가 되지 않은 모델이나 더 이상 제공하지 않을 모델을 사용자에게 노출시키지 않을 수 있다.
- 관리자로서, 기존 파일 기반 모델들을 스캔하여 모델 카드로 마이그레이션하고 싶다. 그래야 기존 model-definition.yaml로 등록된 모델들을 새 시스템으로 전환할 수 있다.
- 관리자로서, 여러 모델 카드를 선택하여 일괄 access level 전환이나 삭제를 하고 싶다. 그래야 다수의 모델을 효율적으로 관리할 수 있다.

## 인수 조건 (Acceptance Criteria)

### 모델 카드 목록

- [ ] 첫 버전에서는 superadmin만 모델 카드 관리 기능에 접근 가능
- [ ] RBAC `MODEL_CARD` 엔티티 퍼미션 기반 접근 제어 (백엔드 마이그레이션 완료, 프론트 적용 시 권한 조회 API 연동)
- [ ] 해당 권한이 없는 사용자에게는 관리 기능이 노출되지 않음
- [ ] `adminModelCardsV2` query를 사용하여 전체 모델 카드 목록 조회 (superadmin용)
- [ ] 모델 카드 목록에서 각 카드의 name, metadata(title, category 등), domainName, projectId, accessLevel, createdAt 등을 확인 가능
- [ ] `ModelCardV2Filter` (name: StringFilter, domainName, projectId)로 필터링 지원
- [ ] `ModelCardV2OrderBy` (NAME, CREATED_AT)로 정렬 지원
- [ ] Relay cursor 기반 또는 offset 기반 페이지네이션 지원

### 모델 카드 생성

- [ ] 관리 페이지에서 "새 모델 카드 생성" 기능 제공
- [ ] `adminCreateModelCardV2` mutation 사용
- [ ] 필수 필드: name, vfolderId (기존 VFolder 선택), projectId
- [ ] 선택 필드: domainName, author, title, modelVersion, description, task, category, architecture, framework, label, license, readme, accessLevel — GQL에서 모두 지원됨
- [ ] VFolder 선택 UI: `BAIVFolderSelect`로 기존 VFolder 선택 + 옆에 폴더 생성 버튼 (+ 아이콘)
  - [ ] TODO(needs-backend): 모델 폴더 전용 `deployModelFolder` API가 추가되면 생성 버튼에서 해당 API로 모델 전용 폴더 생성
  - [ ] 폴더 생성 완료 시 `BAIVFolderSelect`에 자동 반영 및 선택 (`BAIVFolderSelectRef.refetch()`)
- [ ] 생성된 모델 카드가 목록에 즉시 반영됨
- [ ] Unique constraint `(name, domain, project)` 위반 시 에러 표시

### 프로젝트 VFolder 스캔

- [ ] `scanProjectModelCardsV2(projectId: UUID!)` mutation으로 MODEL_STORE 프로젝트 스캔
- [ ] 스캔 결과: `createdCount` (신규 생성), `updatedCount` (업데이트), `errors` (VFolder별 오류 메시지)
- [ ] 스캔 완료 후 결과를 사용자에게 표시 (생성/업데이트 건수, 오류 목록)

### 모델 카드 삭제

- [ ] `adminDeleteModelCardV2` mutation 사용 (단건, id 지정)
- [ ] `adminDeleteModelCardsV2` mutation 사용 (벌크, ids 배열 — 결과: `deletedCount`)
- [ ] 삭제 전 확인 다이얼로그 표시
- [ ] 삭제된 모델 카드가 모델 스토어에서 즉시 제거됨
- [ ] VFolder FK constraint (RESTRICT)로 인해 연결된 VFolder가 먼저 삭제되면 안 됨

### 메타데이터 편집

- [ ] 모델 카드 선택 시 편집 폼/모달이 표시됨
- [ ] `adminUpdateModelCardV2` mutation 사용
- [ ] GQL에서 모든 메타데이터 필드 편집 가능: name, author, title, modelVersion, description, task, category, architecture, framework, label, license, readme, accessLevel
- [ ] 변경사항 저장 시 모델 스토어에 즉시 반영됨
- [ ] 필수 필드(name) 미입력 시 유효성 검증 에러 표시
- [ ] 참고: `ModelCardV2` 노드에서 메타데이터는 `metadata: ModelCardV2Metadata!` 서브타입으로 분리됨 (author, title, modelVersion, description, task, category, architecture, framework, label, license)

### Access Level (공개/비공개)

- [ ] `ModelCardV2AccessLevel` enum: `PUBLIC` / `INTERNAL` (기본값: `INTERNAL`)
- [ ] 모델 카드의 access level을 토글/셀렉트로 전환 가능 (`adminUpdateModelCardV2`의 `accessLevel` 필드)
- [ ] `INTERNAL`로 전환된 모델은 일반 사용자의 모델 스토어 목록에서 즉시 제외됨
- [ ] 관리 페이지에서는 모든 access level의 모델이 표시됨 (예: 흐린 처리, INTERNAL 태그)
- [ ] 기본 상태는 `INTERNAL`

### 리소스 요구사항 (min_resource)

> **참고**: DB에 `model_card_resource_requirements` 테이블이 추가되었으나 (slot_name, min_quantity 구조), GQL 스키마에는 아직 미노출. REST API에서만 사용 가능.

- [ ] TODO(needs-backend): GQL에서 리소스 요구사항 필드 노출 필요
- [ ] 리소스 요구사항이 GQL에 노출되면, 모델 카드별 최소 리소스(CPU, 메모리, GPU 등)를 설정하는 UI 추가

## 범위 밖 (Out of Scope)

- 모델 카드 배포 (`deployModelCardV2`) — [#6355](https://github.com/lablup/backend.ai-webui/issues/6355)에서 별도 다룸
- 모델 파일 자체의 관리 (업로드, 삭제, 버전 관리 등)
- 동적 Args/Env 폼 시스템 및 상세 배포 설정 (별도 스펙 2)
- 모델 카드 정렬 순서 관리
- 구체적인 역할(superadmin 등)에 대한 퍼미션 매핑 정의 (RBAC 설정에 위임)
- 멀티 테넌트 환경에서 도메인별 access level 설정 (전역 PUBLIC/INTERNAL만 지원)
- 리소스 요구사항 UI (GQL 미노출 상태 — REST에서만 사용 가능)

## 백엔드 API 레퍼런스

> **Status**: PR #10703 (초기 CRUD) + PR #10783 (전체 필드 확장, access level, 배포, RBAC) 머지 완료.
> `model_cards` 테이블 기반의 full CRUD + 배포 연동 stack 제공.
> Unique constraint: `(name, domain, project)`.

### ModelCardV2 타입 (GraphQL)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | ID! | ✓ | Relay Global ID |
| rowId | UUID! | ✓ | 실제 DB row ID |
| name | String! | ✓ | 모델 카드 이름 (식별자) |
| vfolderId | UUID! | ✓ | 연결된 VFolder ID |
| domainName | String! | ✓ | 도메인명 |
| projectId | UUID! | ✓ | 프로젝트 ID (MODEL_STORE 타입) |
| creatorId | UUID! | ✓ | 생성자 user ID |
| metadata | ModelCardV2Metadata! | ✓ | 메타데이터 서브타입 (아래 참조) |
| readme | String | | README 내용 |
| accessLevel | ModelCardV2AccessLevel! | ✓ | PUBLIC / INTERNAL (기본 INTERNAL) |
| createdAt | DateTime! | ✓ | 생성 시각 |
| updatedAt | DateTime | | 마지막 수정 시각 |

### ModelCardV2Metadata 서브타입

| 필드 | 타입 | 설명 |
|------|------|------|
| author | String | 모델 저자 |
| title | String | 사람이 읽을 수 있는 모델명 |
| modelVersion | String | 모델 버전 |
| description | String | 모델 설명 |
| task | String | 태스크 유형 (예: text-generation) |
| category | String | 카테고리 (예: LLM) |
| architecture | String | 모델 아키텍처 |
| framework | [String!]! | 프레임워크 목록 (기본 빈 배열) |
| label | [String!]! | 라벨 태그 목록 (기본 빈 배열) |
| license | String | 라이선스 |

> **Note**: 기존 `ModelCard` 타입의 `error_msg` 필드는 `ModelCardV2`에 없음. `min_resource`는 DB 테이블(`model_card_resource_requirements`)에 존재하나 **GQL에서는 노출되지 않음**.

### GraphQL Queries

```graphql
# 전체 목록 조회 (superadmin only, 페이지네이션 + 필터 + 정렬)
adminModelCardsV2(
  filter: ModelCardV2Filter,
  orderBy: [ModelCardV2OrderBy!],
  before: String, after: String,
  first: Int, last: Int,
  limit: Int, offset: Int
): ModelCardV2Connection

# 프로젝트 스코프 목록 조회 (MODEL_STORE 프로젝트 내)
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

### GraphQL Mutations

```graphql
# 생성 (admin only) — 필수: name, vfolderId, projectId
adminCreateModelCardV2(input: CreateModelCardV2Input!): CreateModelCardPayloadGQL!

# 수정 (admin only) — 모든 메타데이터 필드 + accessLevel 지원
adminUpdateModelCardV2(input: UpdateModelCardV2Input!): UpdateModelCardPayloadGQL!

# 단건 삭제 (admin only)
adminDeleteModelCardV2(id: UUID!): DeleteModelCardPayloadGQL!

# 벌크 삭제 (admin only) — ids 배열 입력, deletedCount 반환
adminDeleteModelCardsV2(input: DeleteModelCardsV2Input!): DeleteModelCardsV2Payload!

# 프로젝트 VFolder 스캔 — model-definition.yaml 기반 자동 생성/업데이트
scanProjectModelCardsV2(projectId: UUID!): ScanProjectModelCardsV2Payload!

# 배포 — revision preset 기반으로 deployment 생성
deployModelCardV2(cardId: UUID!, input: DeployModelCardV2Input!): DeployModelCardV2Payload!
```

### GraphQL Input/Filter 타입

```graphql
input CreateModelCardV2Input {
  name: String!                          # 모델 카드 이름 (필수)
  vfolderId: UUID!                       # VFolder ID (필수)
  projectId: UUID!                       # 프로젝트 ID (필수)
  domainName: String = null              # 도메인명 (선택)
  author: String = null                  # 저자
  title: String = null                   # 제목
  modelVersion: String = null            # 모델 버전
  description: String = null             # 설명
  task: String = null                    # 태스크 유형
  category: String = null                # 카테고리
  architecture: String = null            # 아키텍처
  framework: [String!] = null            # 프레임워크 목록
  label: [String!] = null                # 라벨 목록
  license: String = null                 # 라이선스
  readme: String = null                  # README
  accessLevel: ModelCardV2AccessLevel = null  # PUBLIC / INTERNAL
}

input UpdateModelCardV2Input {
  id: UUID!                              # 대상 모델 카드 ID (필수)
  name: String = null                    # 새 이름
  author: String = null                  # 저자
  title: String = null                   # 제목
  modelVersion: String = null            # 모델 버전
  description: String = null             # 설명
  task: String = null                    # 태스크 유형
  category: String = null                # 카테고리
  architecture: String = null            # 아키텍처
  framework: [String!] = null            # 프레임워크 목록
  label: [String!] = null                # 라벨 목록
  license: String = null                 # 라이선스
  readme: String = null                  # README
  accessLevel: ModelCardV2AccessLevel = null  # PUBLIC / INTERNAL
}

input DeleteModelCardsV2Input {
  ids: [UUID!]!                          # 삭제할 모델 카드 ID 목록
}

input DeployModelCardV2Input {
  projectId: UUID!                       # 배포 대상 프로젝트
  revisionPresetId: UUID!                # Revision preset UUID
  resourceGroup: String!                 # 리소스 그룹(스케일링 그룹)
  desiredReplicaCount: Int! = 1          # 레플리카 수
}

input ProjectModelCardV2Scope {
  projectId: UUID!                       # MODEL_STORE 프로젝트 UUID
}

input ModelCardV2Filter {
  name: StringFilter = null              # 이름 필터 (contains, equals 등)
  domainName: String = null              # 도메인 필터
  projectId: UUID = null                 # 프로젝트 필터
}

input ModelCardV2OrderBy {
  field: ModelCardV2OrderField!          # NAME | CREATED_AT
  direction: String! = "ASC"
}

enum ModelCardV2AccessLevel {
  PUBLIC
  INTERNAL
}
```

### GraphQL Payload 타입

```graphql
type CreateModelCardPayloadGQL { modelCard: ModelCardV2! }
type UpdateModelCardPayloadGQL { modelCard: ModelCardV2! }
type DeleteModelCardPayloadGQL { id: UUID! }
type DeleteModelCardsV2Payload { deletedCount: Int! }
type ScanProjectModelCardsV2Payload { createdCount: Int!, updatedCount: Int!, errors: [String!]! }
type DeployModelCardV2Payload { deploymentId: UUID!, deploymentName: String! }
```

### REST API v2 (참고)

REST API(`/v2/model-cards`)는 GQL과 동등한 CRUD + 추가 기능을 제공:

| Method | Path | 설명 |
|--------|------|------|
| POST | `/v2/model-cards/search` | 검색 (superadmin, 페이지네이션/필터/정렬) |
| POST | `/v2/model-cards/projects/{project_id}/search` | 프로젝트 스코프 검색 |
| GET | `/v2/model-cards/{card_id}` | 단건 조회 |
| POST | `/v2/model-cards` | 생성 (모든 메타데이터 + min_resource 지원) |
| PATCH | `/v2/model-cards/{card_id}` | 수정 (모든 메타데이터 + min_resource 지원) |
| DELETE | `/v2/model-cards/{card_id}` | 단건 삭제 |
| POST | `/v2/model-cards/delete` | 벌크 삭제 |
| POST | `/v2/model-cards/projects/{project_id}/scan` | 프로젝트 VFolder 스캔 |
| POST | `/v2/model-cards/{card_id}/deploy` | 배포 |
| POST | `/v2/model-cards/{card_id}/available-presets/search` | 호환 preset 검색 |

> REST에서만 지원되는 추가 필드: `min_resource` (ResourceSlotEntry 배열 — slot_name + min_quantity)

### 백엔드에 아직 없는 기능 (follow-up 필요)

1. **모델 전용 폴더 생성 API (`deployModelFolder`)**: 모델 카드 생성 시 모델 전용 VFolder를 생성하는 전용 API. 현재는 기존 VFolder만 선택 가능.
2. **GQL에서 리소스 요구사항(min_resource) 노출**: DB 테이블(`model_card_resource_requirements`)과 REST API에서는 지원되나, GQL 스키마에서는 미노출. GQL 확장 필요.
3. **호환 preset 검색 GQL**: REST에서 `available-presets/search` 엔드포인트가 있으나 GQL에서는 미노출.

## 관련 이슈

- [FR-2417](https://lablup.atlassian.net/browse/FR-2417) — Admin Model Card Management - Define feature spec
- [backend.ai#10703](https://github.com/lablup/backend.ai/pull/10703) — feat: add ModelCard entity with full CRUD stack
- [backend.ai#10783](https://github.com/lablup/backend.ai/pull/10783) — feat: expand model card fields, add access level, deployment, RBAC
