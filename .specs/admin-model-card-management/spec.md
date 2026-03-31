# 관리자 모델 카드 관리 Spec

## 개요

RBAC 퍼미션이 부여된 관리자가 모델 스토어에 표시되는 모델 카드를 관리할 수 있는 기능. 모델 카드를 직접 생성/삭제하고, 메타데이터(제목, 설명 등)를 편집하며, 공개/비공개 상태를 제어하고, 최소한의 서비스 정의(런타임 종류, GPU 수, GPU 메모리)를 설정할 수 있다. 백엔드(core)에서 `model_cards` 테이블 기반의 CRUD API가 구현 완료되었으므로 ([PR #10703](https://github.com/lablup/backend.ai/pull/10703)), 이에 맞춰 일반적인 CRUD 방식으로 모델 스토어 아이템을 관리할 수 있는 UI를 제공한다. 단, 공개/비공개 상태 및 서비스 정의 관련 백엔드 필드는 아직 미구현이며 follow-up이 필요하다.

> **참고**: 이 스펙은 2개 레이어 중 첫 번째에 해당합니다.
> 1. **모델 카드 관리** (본 스펙) — 모델 카드 CRUD, 공개/비공개, 최소 서비스 정의
> 2. **동적 Args/Env 폼 시스템** (별도 스펙) — JSON schema 기반 동적 폼 렌더링, 런타임별 args/env 차이 처리, 우선순위 랭크. 모델 카드 편집에 폼 컴포넌트로 연동

## 문제 정의

1. **불친절한 모델 스토어 등록 과정**: 현재 모델 스토어에 아이템을 추가하려면 `model-definition.yaml`, `service-definition.toml` 등의 파일을 직접 작성해야 하며, 이 파일들이 model store item에 어떻게 반영되는지 UI가 안내하지 않는다. WebUI에서 파일 생성/수정 자체는 가능하지만, 모델 스토어 전용 워크플로우가 아니라 우회적인 방식이다.
2. **별도 테이블 부재**: 모델 스토어가 별도 테이블 없이 프로젝트 폴더 기반으로 동작하여, 아이템 추가/수정/삭제를 "일반적인 CRUD"처럼 할 수 없다. 백엔드(core)에서 별도 테이블을 추가할 예정이므로, 이에 맞춰 파일 작성 절차를 몰라도 아이템을 추가하듯 관리할 수 있는 UI가 필요하다.
3. **공개/비공개 제어 부재**: 모든 모델 카드가 모델 스토어에 일괄 노출되어, 특정 모델을 비공개로 전환하거나 준비 중인 모델을 숨길 수 없다.
4. **느린 로딩 속도**: 백엔드에서 프로젝트 폴더를 파싱하여 model definition을 읽고 metadata를 반환하는 구조라 모델 카드 로딩이 느리다. 별도 테이블로 관리하면 검색/필터/관리 속도를 크게 개선할 수 있다.

## 요구사항

### Must Have

- [ ] 관리자 전용 메뉴 내 모델 카드 관리 페이지. 첫 버전은 superadmin 전용, RBAC 세부 권한은 관련 API 완료 후 적용.
- [ ] 모델 카드 목록 조회: `modelCardsV2` query로 페이지네이션/필터/정렬 지원
- [ ] 모델 카드 생성: `adminCreateModelCardV2` mutation (name, vfolderId, projectId, domainName 필수)
  - [ ] TODO(needs-backend): GQL CreateInput에 메타데이터 필드 추가 후 생성 폼에서 모든 필드 입력 가능하게 확장
- [ ] 모델 카드 삭제: `adminDeleteModelCardV2` mutation
- [ ] 모델 카드 메타데이터 편집: `adminUpdateModelCardV2` mutation
  - [ ] 이름(name) 편집 — GQL 지원됨
  - [ ] 설명(description) 편집 — GQL 지원됨
  - [ ] TODO(needs-backend): GQL UpdateInput 확장 후 아래 필드 편집 지원
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
- [ ] 공개/비공개 상태 토글
  - [ ] TODO(needs-backend): model_cards 테이블에 visibility 필드 추가 필요
  - [ ] 각 모델 카드에 공개/비공개 상태 표시
  - [ ] 토글 버튼으로 즉시 상태 전환
  - [ ] 비공개 모델은 일반 사용자의 모델 스토어에서 노출되지 않음
  - [ ] 관리 페이지에서는 비공개 모델도 포함한 전체 목록이 표시됨 (비공개 상태가 시각적으로 구분)
- [ ] 최소 서비스 정의 설정
  - [ ] TODO(needs-backend): service definition 관련 필드/테이블 추가 필요
  - [ ] 런타임 종류 선택 (vLLM / sGLang / Custom 등). 선택 시 port, health check endpoint 등은 자동 세팅
  - [ ] GPU 수 지정 (Tensor Parallelism)
  - [ ] GPU 메모리 지정 (장당 VRAM — 24GB, 40GB, 80GB 등)
  - [ ] 상세 배포 설정(args, env 등)은 스펙 2 "동적 Args/Env 폼 시스템"의 폼 컴포넌트가 모델 카드 편집에 연동되어 확장

### Nice to Have

- [ ] 벌크 작업 지원
  - [ ] 여러 모델 카드를 선택하여 일괄 공개/비공개 전환
  - [ ] 여러 모델 카드를 선택하여 일괄 삭제
- [ ] 아이콘 설정: 모델 카드에 아이콘을 지정하여 시각적 구분
- [ ] 모델 카드 미리보기: 편집 중인 모델 카드가 일반 사용자에게 어떻게 보이는지 미리보기

## 사용자 스토리

- 관리자로서, UI에서 직접 새 모델 카드를 생성하고 싶다. 그래야 definition 파일 작성 절차를 몰라도 일반적인 폼 입력만으로 모델 스토어에 아이템을 등록할 수 있다.
- 관리자로서, 불필요한 모델 카드를 삭제하고 싶다. 그래야 더 이상 사용하지 않는 모델을 정리할 수 있다.
- 관리자로서, 모델 스토어에 표시되는 모델 카드의 메타데이터(제목, 설명, 아이콘 등)를 편집하고 싶다. 그래야 사용자에게 정확하고 유용한 정보를 제공할 수 있다.
- 관리자로서, 특정 모델 카드를 비공개로 전환하고 싶다. 그래야 아직 준비가 되지 않은 모델이나 더 이상 제공하지 않을 모델을 사용자에게 노출시키지 않을 수 있다.
- 관리자로서, 모델 카드에 런타임 종류, GPU 수, GPU 메모리를 지정하고 싶다. 그래야 사용자가 배포 시 기본 설정이 채워져 바로 시작할 수 있다.
- 관리자로서, 여러 모델 카드를 선택하여 일괄 공개/비공개 전환이나 삭제를 하고 싶다. 그래야 다수의 모델을 효율적으로 관리할 수 있다.

## 인수 조건 (Acceptance Criteria)

### 모델 카드 목록

- [ ] 첫 버전에서는 superadmin만 모델 카드 관리 기능에 접근 가능
- [ ] RBAC 세부 권한에 따른 접근 제어는 관련 권한 조회 API 완료 후 적용
- [ ] 해당 권한이 없는 사용자에게는 관리 기능이 노출되지 않음
- [ ] `modelCardsV2` query를 사용하여 모델 카드 목록 조회
- [ ] 모델 카드 목록에서 각 카드의 name, title, category, domain, project, createdAt 등을 확인 가능
- [ ] `ModelCardV2Filter` (name, domainName, projectId)로 필터링 지원
- [ ] `ModelCardV2OrderBy` (NAME, CREATED_AT)로 정렬 지원
- [ ] Relay cursor 기반 또는 offset 기반 페이지네이션 지원

### 모델 카드 생성

- [ ] 관리 페이지에서 "새 모델 카드 생성" 기능 제공
- [ ] `adminCreateModelCardV2` mutation 사용
- [ ] 필수 필드: name, vfolderId (기존 VFolder 선택), projectId, domainName
- [ ] 선택 필드: GQL Input 확장 후 author, title, description, task, category, architecture, framework, label, license, readme 입력 가능
- [ ] 생성된 모델 카드가 목록에 즉시 반영됨
- [ ] Unique constraint `(name, domain, project)` 위반 시 에러 표시

### 모델 카드 삭제

- [ ] `adminDeleteModelCardV2` mutation 사용 (id 지정)
- [ ] 삭제 전 확인 다이얼로그 표시
- [ ] 삭제된 모델 카드가 모델 스토어에서 즉시 제거됨
- [ ] VFolder FK constraint (RESTRICT)로 인해 연결된 VFolder가 먼저 삭제되면 안 됨

### 메타데이터 편집

- [ ] 모델 카드 선택 시 편집 폼/모달이 표시됨
- [ ] `adminUpdateModelCardV2` mutation 사용
- [ ] 현재 GQL 지원 필드: name, description
- [ ] GQL Input 확장 후: author, title, model_version, task, category, architecture, framework, label, license, readme 편집 가능
- [ ] 변경사항 저장 시 모델 스토어에 즉시 반영됨
- [ ] 필수 필드(name) 미입력 시 유효성 검증 에러 표시

### 공개/비공개 상태

> **Blocked**: 백엔드에 visibility 필드 미구현. follow-up 필요.

- [ ] 모델 카드의 공개/비공개 상태를 토글로 전환 가능
- [ ] 비공개로 전환된 모델은 일반 사용자의 모델 스토어 목록에서 즉시 제외됨
- [ ] 관리 페이지에서는 비공개 모델이 시각적으로 구분되어 표시됨 (예: 흐린 처리, 비공개 태그)
- [ ] 기본 상태는 "공개"

### 최소 서비스 정의

> **Blocked**: 백엔드에 service definition 관련 필드 미구현. follow-up 필요.
> `min_resource`는 DB에 존재하나 GQL에서 미노출 (REST API에서만 사용 가능).

- [ ] 런타임 종류(vLLM, sGLang, Custom 등) 선택 시 port, health check 등이 자동 설정됨
- [ ] GPU 수(Tensor Parallelism)와 GPU 메모리(장당 VRAM)를 지정 가능
- [ ] 설정된 서비스 정의가 사용자 배포 시 기본값으로 반영됨

## 범위 밖 (Out of Scope)

- 모델 파일 자체의 관리 (업로드, 삭제, 버전 관리 등)
- 동적 Args/Env 폼 시스템 및 상세 배포 설정 (별도 스펙 2)
- 모델 카드 정렬 순서 관리
- 구체적인 역할(superadmin 등)에 대한 퍼미션 매핑 정의 (RBAC 설정에 위임)
- 멀티 테넌트 환경에서 도메인별 공개/비공개 설정 (전역 공개/비공개만 지원)

## 백엔드 API 레퍼런스 (PR [#10703](https://github.com/lablup/backend.ai/pull/10703))

> **Status**: PR #10703 머지 완료. `model_cards` 테이블 기반의 full CRUD stack 제공.
> Unique constraint: `(name, domain, project)`.

### ModelCardV2 타입 (GraphQL)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | ID! | ✓ | Relay Global ID |
| rowId | UUID! | ✓ | 실제 DB row ID |
| name | String! | ✓ | 모델 카드 이름 (식별자) |
| vfolderId | UUID! | ✓ | 연결된 VFolder ID |
| domainName | String! | ✓ | 도메인명 |
| projectId | UUID! | ✓ | 프로젝트 ID |
| creatorId | UUID! | ✓ | 생성자 user ID |
| author | String | | 모델 저자 |
| title | String | | 사람이 읽을 수 있는 모델명 |
| modelVersion | String | | 모델 버전 |
| description | String | | 모델 설명 |
| task | String | | 태스크 유형 (예: text-generation) |
| category | String | | 카테고리 (예: LLM) |
| architecture | String | | 모델 아키텍처 |
| framework | [String!]! | ✓ | 프레임워크 목록 (기본 빈 배열) |
| label | [String!]! | ✓ | 라벨 태그 목록 (기본 빈 배열) |
| license | String | | 라이선스 |
| readme | String | | README 내용 |
| createdAt | DateTime! | ✓ | 생성 시각 |
| updatedAt | DateTime | | 마지막 수정 시각 |

> **Note**: 기존 `ModelCard` 타입의 `error_msg` 필드는 `ModelCardV2`에 없음. `min_resource`는 DB 테이블에 존재하나 **GQL에서는 노출되지 않음** (REST API에서만 사용 가능).

### GraphQL Queries

```graphql
# 목록 조회 (페이지네이션 + 필터 + 정렬)
modelCardsV2(
  filter: ModelCardV2Filter,
  orderBy: [ModelCardV2OrderBy!],
  before: String, after: String,
  first: Int, last: Int,
  limit: Int, offset: Int
): ModelCardV2Connection

# 단건 조회
modelCardV2(id: UUID!): ModelCardV2
```

### GraphQL Mutations (admin only)

```graphql
# 생성 — 필수: name, vfolderId, projectId, domainName
adminCreateModelCardV2(input: CreateModelCardV2Input!): CreateModelCardPayloadGQL!

# 수정 — 현재 GQL에서는 name, description만 지원
# TODO(needs-backend): GQL UpdateModelCardV2Input에 전체 메타데이터 필드 추가 필요
adminUpdateModelCardV2(input: UpdateModelCardV2Input!): UpdateModelCardPayloadGQL!

# 삭제
adminDeleteModelCardV2(id: UUID!): DeleteModelCardPayloadGQL!
```

### GraphQL Input/Filter 타입

```graphql
input CreateModelCardV2Input {
  name: String!        # 모델 카드 이름
  vfolderId: UUID!     # VFolder ID
  projectId: UUID!     # 프로젝트 ID
  domainName: String!  # 도메인명
}

input UpdateModelCardV2Input {
  id: UUID!               # 대상 모델 카드 ID
  name: String = null      # 새 이름
  description: String = null  # 새 설명
  # ⚠️ REST API (UpdateModelCardInput)에서는 author, title, model_version,
  #    task, category, architecture, framework, label, license,
  #    min_resource, readme 도 수정 가능하나 GQL에서는 아직 미노출
}

input ModelCardV2Filter {
  name: StringFilter = null      # 이름 필터 (contains, equals 등)
  domainName: String = null      # 도메인 필터
  projectId: UUID = null         # 프로젝트 필터
}

input ModelCardV2OrderBy {
  field: ModelCardV2OrderField!  # NAME | CREATED_AT
  direction: String! = "ASC"
}
```

### REST API v2 (참고)

REST API(`/v2/model-cards`)는 GQL보다 완전한 CRUD를 제공:

| Method | Path | 설명 |
|--------|------|------|
| POST | `/v2/model-cards/search` | 검색 (페이지네이션, 필터, 정렬) |
| GET | `/v2/model-cards/{card_id}` | 단건 조회 |
| POST | `/v2/model-cards` | 생성 (모든 메타데이터 필드 지원) |
| PATCH | `/v2/model-cards/{card_id}` | 수정 (모든 메타데이터 필드 지원) |
| DELETE | `/v2/model-cards/{card_id}` | 삭제 |

REST `CreateModelCardInput` 추가 필드 (GQL에 미노출):
- `creator_id`, `author`, `title`, `model_version`, `description`, `task`, `category`, `architecture`, `framework`, `label`, `license`, `min_resource` (ResourceSlotEntry 배열), `readme`

REST `UpdateModelCardInput` 추가 필드 (GQL에 미노출):
- `author`, `title`, `model_version`, `task`, `category`, `architecture`, `framework`, `label`, `license`, `min_resource`, `readme`

### 백엔드에 아직 없는 기능 (follow-up 필요)

> 아래 기능은 PR #10703에 포함되지 않았으며, 백엔드 follow-up이 필요함.

1. **공개/비공개 (visibility) 필드**: `model_cards` 테이블에 visibility/is_public 컬럼 없음. 모델 카드의 공개/비공개 상태를 제어하려면 백엔드에 필드 추가 필요.
2. **서비스 정의 (service definition) 필드**: 런타임 종류, port, health check endpoint 등의 서비스 정의 정보가 model_cards 테이블에 없음. 별도 테이블 또는 컬럼 추가 필요.
3. **GQL Create/Update Input 확장**: 현재 GQL `CreateModelCardV2Input`은 4개 필수 필드만, `UpdateModelCardV2Input`은 name/description만 지원. REST API 수준으로 확장 필요.
4. **PROJECT_TYPE.MODEL_STORE enforcement**: PR summary에 follow-up으로 명시됨.

## 관련 이슈

- [FR-2417](https://lablup.atlassian.net/browse/FR-2417) — Admin Model Card Management - Define feature spec
- [backend.ai#10703](https://github.com/lablup/backend.ai/pull/10703) — feat: add ModelCard entity with full CRUD stack
