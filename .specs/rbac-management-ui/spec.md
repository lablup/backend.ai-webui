# RBAC 관리 UI 기능 명세서

## 개요

Backend.AI WebUI에 역할 기반 접근 제어(RBAC) 관리 화면을 추가한다. 슈퍼어드민이 역할(Role)을 생성/수정/삭제하고, 각 역할에 사용자를 할당하며, 세분화된 퍼미션을 부여할 수 있는 전체 관리 UI를 제공한다. 백엔드 GraphQL API(v26.3.0)에 대응하며, Relay 기반 페이지네이션과 Ant Design 6 컴포넌트를 사용한다.

## 문제 정의

현재 Backend.AI WebUI에는 RBAC를 관리할 수 있는 UI가 없다. 백엔드에 RBAC GraphQL API가 구현되어 있지만, 관리자가 역할과 퍼미션을 관리하려면 직접 GraphQL 쿼리를 실행해야 한다. 이 명세는 슈퍼어드민을 위한 완전한 RBAC 관리 인터페이스를 정의한다.

---

## 핵심 설계 결정

### 1. 스코프 모델

Role은 이름/설명만 가지는 컨테이너이다. **스코프는 Role이 아닌 Permission에 존재한다.**

- Permission 구조: `(roleId, scopeType, scopeId, entityType, operation)`
- Assignment 구조: `(userId, roleId, grantedBy, grantedAt)`
- 예시: 사용자 A가 "test role"을 통해 Example Project의 VFolder UPDATE 권한을 가지는 경우:
  - Permission: `scopeType=PROJECT, scopeId=<example_project_id>, entityType=VFOLDER, operation=UPDATE`
  - Assignment: `userId=<user_A_id>, roleId=<test_role_id>`

### 2. Role 하위 커넥션 구조

`type Role`에는 `permissions`와 `roleAssignments` 두 개의 Relay 커넥션이 추가될 예정이다. 이를 통해 역할 상세 조회 시 별도의 top-level 쿼리 없이 Role 노드의 하위 커넥션으로 퍼미션과 할당 데이터를 조회할 수 있다.

```
Role (Node)
├── permissions: PermissionConnection     ← 해당 역할의 퍼미션 목록
│   └── edges[].node: Permission
└── roleAssignments: RoleAssignmentConnection  ← 해당 역할에 할당된 사용자 목록
    └── edges[].node: RoleAssignment
```

이 구조에 의해:
- 역할 목록 페이지에서는 top-level `adminRoles` 쿼리로 역할 목록을 조회한다.
- 역할 상세 Drawer에서는 Role fragment 내부에서 `permissions`와 `roleAssignments` 커넥션을 spread하여 조회한다.
- 각 커넥션은 Relay 페이지네이션(`first`, `after`)을 지원하므로 Drawer 내 탭에서 독립적으로 페이지네이션할 수 있다.

### 3. scopeType-entityType 매핑

백엔드에 `rbacScopeEntityCombinations` 쿼리가 **구현 완료**되어 있다 (BA-4808, BA-4809). 이 쿼리는 각 scopeType에 대해 유효한 entityType 목록을 반환한다. 프론트엔드는 퍼미션 추가 시 이 쿼리를 호출하여 scopeType 선택에 따라 유효한 entityType만 표시해야 한다.

**유효한 scopeType → entityType 조합** (소스: `VALID_SCOPE_ENTITY_COMBINATIONS`):

| scopeType | 유효한 entityType |
|-----------|------------------|
| `DOMAIN` | RESOURCE_GROUP, CONTAINER_REGISTRY, USER, PROJECT, NETWORK, STORAGE_HOST |
| `PROJECT` | RESOURCE_GROUP, CONTAINER_REGISTRY, SESSION, VFOLDER, DEPLOYMENT, NETWORK, USER, STORAGE_HOST |
| `USER` | RESOURCE_GROUP, SESSION, VFOLDER, DEPLOYMENT, KEYPAIR |
| `RESOURCE_GROUP` | AGENT |
| `AGENT` | KERNEL |
| `SESSION` | KERNEL |
| `MODEL_DEPLOYMENT` | ROUTING, SESSION |
| `CONTAINER_REGISTRY` | IMAGE |
| `STORAGE_HOST` | VFOLDER |

> **NOTE**: scopeType은 DOMAIN/PROJECT/USER 뿐 아니라 RESOURCE_GROUP, AGENT, SESSION, MODEL_DEPLOYMENT, CONTAINER_REGISTRY, STORAGE_HOST도 포함된다. 퍼미션 추가 Modal의 스코프 타입 Select에는 이 모든 scopeType을 표시해야 한다.

### 4. 레이아웃

| 화면 | 형태 | 설명 |
|------|------|------|
| 역할 목록 | 전체 페이지 (테이블) | `adminRoles` top-level 쿼리로 조회 |
| 역할 상세 | Drawer (우측 사이드 패널) | Role 노드의 fragment로 메타데이터 + 하위 커넥션 조회 |
| 역할 생성/수정 | Modal | `adminCreateRole` / `adminUpdateRole` mutation |
| 사용자 추가 | Modal | `adminAssignRole` mutation |
| 퍼미션 추가 | Modal | `adminCreatePermission` mutation |

### 5. 시스템 역할 (SYSTEM source)

- 역할 목록 테이블에 Source 컬럼으로 구분하여 표시 (Tag 컴포넌트)
- 이름/설명 수정 불가 (읽기 전용)
- 단, 사용자 할당/제거 및 퍼미션 추가/삭제는 SYSTEM 역할에서도 가능
- CUSTOM 역할은 이름/설명을 포함한 모든 편집 가능

### 6. 상태 생명주기

- 역할 목록 페이지에 Segmented 컨트롤로 상태 필터: **ACTIVE** / **INACTIVE** / **DELETED**
- 상태 전이 규칙:

```
ACTIVE ──비활성화──→ INACTIVE
ACTIVE ──삭제──────→ DELETED
INACTIVE ──활성화──→ ACTIVE
INACTIVE ──삭제───→ DELETED
DELETED ──purge───→ (영구 제거)
```

- 활성화/비활성화: `adminUpdateRole` mutation의 `status` 필드 사용 (구현 완료)
- 소프트 삭제: `adminDeleteRole` mutation
- 완전 삭제: `adminPurgeRole` mutation

---

## 백엔드 GraphQL API 참조

> 출처: `backend.ai` 저장소 `chore/rbac-gql-summary` 브랜치의 `docs/manager/graphql-reference/rbac-schema.graphql`

### Enum 타입

```graphql
enum RBACElementType {
  # 스코프 계층 — scopeType에 사용 가능하며, 스코프 계층의 상위 레벨은
  #   DOMAIN / PROJECT / USER 세 가지로 한정됨
  #   (이후에 나오는 RESOURCE_GROUP, SESSION, AGENT 등 일부 값도 scopeType으로
  #    사용 가능하지만, 계층 구조에는 포함되지 않음)
  DOMAIN
  PROJECT
  USER

  # 루트 쿼리 가능 엔티티 (스코프 기반) — entityType에 사용 가능
  SESSION
  VFOLDER
  DEPLOYMENT
  MODEL_DEPLOYMENT
  KEYPAIR
  NOTIFICATION_CHANNEL
  NETWORK
  RESOURCE_GROUP
  CONTAINER_REGISTRY
  STORAGE_HOST
  IMAGE
  ARTIFACT
  ARTIFACT_REGISTRY
  SESSION_TEMPLATE
  APP_CONFIG

  # 루트 쿼리 가능 엔티티 (슈퍼어드민 전용) — entityType에 사용 가능
  RESOURCE_PRESET
  USER_RESOURCE_POLICY
  KEYPAIR_RESOURCE_POLICY
  PROJECT_RESOURCE_POLICY
  ROLE
  AUDIT_LOG
  EVENT_LOG

  # 자동 전용 엔티티 — entityType에 사용 가능
  NOTIFICATION_RULE

  # 인프라 엔티티
  AGENT
  KERNEL
  ROUTING

  # 엔티티 레벨 스코프
  ARTIFACT_REVISION
}

enum OperationType {
  CREATE
  READ
  UPDATE
  SOFT_DELETE
  HARD_DELETE
  GRANT_ALL
  GRANT_READ
  GRANT_UPDATE
  GRANT_SOFT_DELETE
  GRANT_HARD_DELETE
}

enum RoleSource { SYSTEM, CUSTOM }
enum RoleStatus { ACTIVE, INACTIVE, DELETED }
enum RoleOrderField { NAME, CREATED_AT, UPDATED_AT }
enum PermissionOrderField { ID, ENTITY_TYPE }
```

### 주요 타입

```graphql
type Role implements Node {
  id: ID!
  name: String!
  description: String
  source: RoleSource!
  status: RoleStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
  deletedAt: DateTime

  # ── 추가 예정 커넥션 (Role 하위에 직접 접근) ──
  permissions(
    filter: PermissionFilter
    orderBy: [PermissionOrderBy!]
    first: Int, after: String
    last: Int, before: String
  ): PermissionConnection!

  roleAssignments(
    filter: RoleAssignmentFilter
    first: Int, after: String
    last: Int, before: String
  ): RoleAssignmentConnection!
}
```

> **NOTE**: `permissions`와 `roleAssignments` 커넥션은 백엔드에서 추가 예정이다.
> 현재 `chore/rbac-gql-summary` 브랜치의 `Role` 타입에는 이 커넥션이 아직 없지만,
> 프론트엔드 구현 시점에는 사용 가능할 예정이다.
> 만약 커넥션이 아직 제공되지 않은 경우, fallback으로 top-level 쿼리
> (`adminPermissions(filter: { roleId })`, `adminRoleAssignments(filter: { roleId })`)를
> 사용하되, 커넥션이 추가되면 전환한다.

```graphql
type Permission implements Node {
  id: ID!
  roleId: UUID!
  scopeType: RBACElementType!
  scopeId: String!
  entityType: RBACElementType!
  operation: OperationType!
  role: Role              # 이 퍼미션이 속한 역할
  scope: EntityNode       # 스코프 엔티티 (resolve 가능)
}

type RoleAssignment implements Node {
  id: ID!
  userId: UUID!
  roleId: UUID!
  grantedBy: UUID
  grantedAt: DateTime!
  role: Role              # 할당된 역할
  user: UserV2            # 할당된 사용자
}

type EntityRef implements Node {
  id: ID!
  scopeType: RBACElementType!
  scopeId: String!
  entityType: RBACElementType!
  entityId: String!
  registeredAt: DateTime!
  entity: EntityNode      # resolve된 엔티티 객체
}

# EntityNode union — scope 필드 등에서 사용
union EntityNode =
    UserV2 | ProjectV2 | DomainV2
  | VirtualFolderNode | ImageV2 | ComputeSessionNode
  | Artifact | ArtifactRegistry | AppConfig
  | NotificationChannel | NotificationRule
  | ModelDeployment | ResourceGroup | ArtifactRevision | Role
```

### 커넥션 타입

```graphql
type RoleConnection {
  pageInfo: PageInfo!
  edges: [RoleEdge!]!
  count: Int!             # 전체 개수 (Badge 표시 등에 활용)
}

type RoleEdge {
  cursor: String!
  node: Role!
}

type PermissionConnection {
  pageInfo: PageInfo!
  edges: [PermissionEdge!]!
  count: Int!
}

type PermissionEdge {
  cursor: String!
  node: Permission!
}

type RoleAssignmentConnection {
  pageInfo: PageInfo!
  edges: [RoleAssignmentEdge!]!
  count: Int!
}

type RoleAssignmentEdge {
  cursor: String!
  node: RoleAssignment!
}
```

### Filter & OrderBy Input 타입

```graphql
input RoleFilter {
  name: StringFilter = null
  source: [RoleSource!] = null
  status: [RoleStatus!] = null
  AND: [RoleFilter!] = null
  OR: [RoleFilter!] = null
  NOT: RoleFilter = null
}

input RoleOrderBy {
  field: RoleOrderField!
  direction: OrderDirection! = DESC
}

input PermissionFilter {
  roleId: UUID = null
  scopeType: RBACElementType = null
  entityType: RBACElementType = null
}

input PermissionOrderBy {
  field: PermissionOrderField!
  direction: OrderDirection! = DESC
}

input RoleAssignmentFilter {
  roleId: UUID = null
}
```

### 추가 타입 — scopeType-entityType 조합

```graphql
type ScopeEntityCombination {
  scopeType: RBACElementType!
  validEntityTypes: [RBACElementType!]!
}
```

### Top-Level Query

| Query | 설명 | 용도 |
|-------|------|------|
| `adminRole(id: UUID!)` | 단일 역할 조회 | Drawer refetch 시 |
| `adminRoles(filter, orderBy, first, after, ...)` | 역할 목록 (페이지네이션) | 역할 목록 페이지 |
| `adminPermissions(filter, orderBy, first, after, ...)` | 퍼미션 목록 (페이지네이션) | fallback: Role 커넥션 미제공 시 |
| `adminRoleAssignments(filter, first, after, ...)` | 역할 할당 목록 (페이지네이션) | fallback: Role 커넥션 미제공 시 |
| `adminEntities(filter, orderBy, first, after, ...)` | 엔티티 연관 검색 | 스코프 ID 선택 시 엔티티 검색 |
| `rbacScopeEntityCombinations` | 유효한 scopeType-entityType 조합 목록 | 퍼미션 추가 Modal에서 entityType 필터링 |

### Mutation

| Mutation | Input | 반환 | 용도 |
|----------|-------|------|------|
| `adminCreateRole` | `CreateRoleInput(name!, description?, source?)` | `Role` | 역할 생성 |
| `adminUpdateRole` | `UpdateRoleInput(id!, name?, description?, status?)` | `Role` | 역할 수정 (상태 변경 포함) |
| `adminDeleteRole` | `DeleteRoleInput(id!)` | `DeleteRolePayload(id)` | 소프트 삭제 |
| `adminPurgeRole` | `PurgeRoleInput(id!)` | `PurgeRolePayload(id)` | 완전 삭제 |
| `adminCreatePermission` | `CreatePermissionInput(roleId!, scopeType!, scopeId!, entityType!, operation!)` | `Permission` | 퍼미션 추가 |
| `adminDeletePermission` | `DeletePermissionInput(id!)` | `DeletePermissionPayload(id)` | 퍼미션 삭제 |
| `adminAssignRole` | `AssignRoleInput(userId!, roleId!)` | `RoleAssignment` | 사용자 할당 |
| `adminRevokeRole` | `RevokeRoleInput(userId!, roleId!)` | `RoleAssignment` | 사용자 제거 |

### 백엔드 구현 상태

**구현 완료:**
- **`rbacScopeEntityCombinations` 쿼리** (BA-4808, BA-4809): 유효한 scopeType-entityType 조합을 `ScopeEntityCombination[]`으로 반환. 퍼미션 추가 Modal에서 이 쿼리를 호출하여 entityType을 동적으로 필터링한다.
- **`myRoles` 쿼리** (BA-4812): 현재 사용자의 할당된 역할 조회. 이 스펙 범위 외이지만 백엔드에 구현 완료되어 추후 활용 가능.
- **`assignments_by_role_loader` DataLoader** (BA-4792): 역할 ID로 할당 데이터를 배치 로딩. Role 커넥션 내부에서 사용될 예정.

**미지원 (TODO):**
- **Role 하위 커넥션 (permissions, roleAssignments)**: `feature/rbac-role-permissions-field` 브랜치에서 개발 중 (BA-4785: permissions 필드, BA-4787: roleAssignments 필드). main 미머지 상태. 추가 전까지는 top-level 쿼리(`adminPermissions`, `adminRoleAssignments`)로 fallback한다.
- **퍼미션 수정 Mutation**: 현재 퍼미션의 개별 필드(scopeType, scopeId, entityType, operation)를 수정하는 mutation이 없음. 백엔드에 `adminUpdatePermission` mutation 추가 필요. 추가 전까지는 삭제 후 재생성으로 대체한다.
- **일괄 할당 Mutation**: 현재 `adminAssignRole`은 단일 사용자만 할당 가능. 복수 사용자 일괄 할당을 위한 배치 mutation이 없음. 백엔드에 배치 할당 mutation 추가 필요. 추가 전까지는 클라이언트에서 순차적으로 호출한다.

---

## 요구사항

### 필수 (Must Have)

- [ ] 슈퍼어드민이 역할 목록을 테이블 형태로 조회할 수 있다
- [ ] 상태별 Segmented 컨트롤(ACTIVE/INACTIVE/DELETED)로 역할을 필터링할 수 있다
- [ ] 역할 이름으로 검색할 수 있다
- [ ] Source(SYSTEM/CUSTOM) 필터를 적용할 수 있다
- [ ] 역할 이름, 생성일, 수정일 기준으로 정렬할 수 있다
- [ ] Modal을 통해 새 역할(이름, 설명)을 생성할 수 있다
- [ ] Drawer에서 역할 상세 정보(메타데이터 + 할당 탭 + 퍼미션 탭)를 조회할 수 있다
- [ ] Drawer의 할당/퍼미션 탭은 Role 노드의 하위 커넥션으로 데이터를 조회한다
- [ ] Modal을 통해 CUSTOM 역할의 이름과 설명을 수정할 수 있다
- [ ] SYSTEM 역할은 이름/설명 수정이 불가능하다 (할당/퍼미션 변경은 가능)
- [ ] 역할을 소프트 삭제(DELETED 상태 전환)할 수 있다
- [ ] DELETED 상태의 역할을 완전 삭제(purge)할 수 있다
- [ ] 활성화/비활성화 토글을 통해 역할 상태를 전환할 수 있다
- [ ] 할당 탭에서 역할에 할당된 사용자 목록을 조회할 수 있다
- [ ] 할당 탭에서 사용자를 역할에 추가할 수 있다
- [ ] 할당 탭에서 사용자를 역할에서 제거할 수 있다
- [ ] 퍼미션 탭에서 플랫 테이블로 퍼미션 목록을 조회할 수 있다
- [ ] 퍼미션 탭에서 새 퍼미션(scopeType, scopeId, entityType, operation)을 추가할 수 있다
- [ ] 퍼미션 탭에서 개별 퍼미션을 삭제할 수 있다
- [ ] 할당 탭에서 복수 사용자를 일괄 추가/제거할 수 있다

### 선택 (Nice to Have)

- [ ] 역할 생성 Modal에 "Create another" 체크박스 (생성 후 Modal 유지, 폼 초기화)
- [ ] 퍼미션 추가 시 한 번에 여러 operation을 선택하여 일괄 생성
- [ ] 퍼미션 테이블의 scopeType, entityType 컬럼 필터링
- [ ] 역할 목록 테이블에서 행 선택 후 일괄 삭제

---

## 사용자 스토리

### US-1: 역할 목록 조회 및 필터링

**사용자 스토리**: 슈퍼어드민으로서, 시스템에 정의된 모든 역할을 테이블로 조회하고 상태/소스/이름으로 필터링하여 원하는 역할을 빠르게 찾을 수 있다.

**화면 구성**:

```
┌─────────────────────────────────────────────────────────────┐
│  Role Management                    [+ 역할 생성] [새로고침] │
├─────────────────────────────────────────────────────────────┤
│  [ ACTIVE | INACTIVE | DELETED ]                            │
│  [이름 검색...]  [Source: 전체 ▼]                             │
├──────┬──────────┬──────────┬──────────┬──────────┬─────────┤
│ 이름  │ 설명     │ Source   │ 생성일    │ 수정일    │ 액션    │
├──────┼──────────┼──────────┼──────────┼──────────┼─────────┤
│ role1│ 설명...  │ CUSTOM   │ 2026-... │ 2026-... │ [⋮]     │
│ role2│ 설명...  │ SYSTEM   │ 2026-... │ 2026-... │         │
│ role3│ 설명...  │ CUSTOM   │ 2026-... │ 2026-... │ [⋮]     │
└──────┴──────────┴──────────┴──────────┴──────────┴─────────┘
                     [< 1 2 3 ... >]
```

- 전체 페이지 레이아웃
- 상단: 페이지 제목 + 역할 생성 버튼 + 새로고침 버튼
- Segmented 컨트롤: ACTIVE (기본) / INACTIVE / DELETED
- 검색/필터 영역: BAIPropertyFilter로 이름 검색 + Source 필터(SYSTEM/CUSTOM/전체) 통합 제공
- 테이블 컬럼:

| 컬럼 | 데이터 소스 | 정렬 | 비고 |
|------|------------|------|------|
| 이름 | `name` | O (`RoleOrderField.NAME`) | 클릭 시 역할 상세 Drawer 열림. `<Typography.Link>` 스타일. |
| 설명 | `description` | X | 텍스트 말줄임 (`ellipsis`). 없을 경우 `-` 표시. |
| Source | `source` | X | `Tag` 컴포넌트. SYSTEM=기본색(회색), CUSTOM=녹색 등 시각적 구분. |
| 생성일 | `createdAt` | O (`RoleOrderField.CREATED_AT`) | `dayjs(createdAt).format('lll')` |
| 수정일 | `updatedAt` | O (`RoleOrderField.UPDATED_AT`) | `dayjs(updatedAt).format('lll')` |
| 액션 | - | X | CUSTOM 역할: 수정/삭제 버튼 표시. SYSTEM 역할: 삭제 버튼만 표시 (수정 불가). |

**데이터 조회 — GraphQL 쿼리 구조**:

```graphql
query AdminRolesPageQuery(
  $filter: RoleFilter
  $orderBy: [RoleOrderBy!]
  $first: Int
  $after: String
) {
  adminRoles(
    filter: $filter
    orderBy: $orderBy
    first: $first
    after: $after
  ) @connection(key: "AdminRolesPage_adminRoles") {
    count
    edges {
      node {
        id
        ...RoleNodesFragment
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}

fragment RoleNodesFragment on Role @relay(plural: true) {
  id
  name
  description
  source
  status
  createdAt
  updatedAt
  # NOTE: Drawer용 상세 데이터(permissions, roleAssignments 커넥션)는
  # 목록 쿼리에 포함하지 않는다. Drawer 오픈 시 adminRole(id: ...) 별도 쿼리
  # 또는 refetchable fragment로 조회하여 over-fetching을 방지한다.
}
```

- `filter` 변수: Segmented 상태값 + 이름 검색어 + Source 필터를 조합하여 전달
  - 예: `{ status: [ACTIVE], name: { contains: "검색어" }, source: [CUSTOM] }`
- `orderBy` 변수: 컬럼 헤더 클릭 시 정렬 필드/방향 전환
  - 예: `[{ field: NAME, direction: ASC }]`
- Segmented 컨트롤 변경 시 `filter.status` 값 변경 → 쿼리 refetch
- 이름 검색 시 `filter.name` 값 변경 → 쿼리 refetch (디바운스 적용)

**역할 이름 클릭 → Drawer 열기 흐름**:

1. 사용자가 테이블에서 역할 이름을 클릭한다
2. 선택된 역할의 ID를 Drawer 컴포넌트에 전달한다
3. Drawer가 열리면서 `adminRole(id: ...)` 쿼리로 해당 Role의 상세 정보를 조회한다
4. 역할 메타데이터와 함께 하위 커넥션(permissions, roleAssignments)이 탭에 표시된다

**인수 조건**:
- [ ] 페이지 진입 시 ACTIVE 상태의 역할 목록이 기본으로 표시된다
- [ ] Segmented 컨트롤 클릭 시 해당 상태의 역할만 필터링된다
- [ ] 이름 검색 시 `StringFilter`를 사용하여 서버사이드 필터링된다
- [ ] Source 필터(SYSTEM/CUSTOM) 적용 시 서버사이드 필터링된다
- [ ] 컬럼 헤더 클릭으로 이름/생성일/수정일 기준 오름차순/내림차순 정렬이 가능하다
- [ ] Relay 커서 기반 페이지네이션이 동작한다
- [ ] 역할 이름 클릭 시 해당 역할의 상세 Drawer가 열린다
- [ ] SYSTEM 역할 행의 액션 컬럼에는 수정 버튼이 표시되지 않는다 (삭제 버튼은 표시)
- [ ] 테이블 로딩 중 Skeleton 또는 Spin이 표시된다
- [ ] DELETED 세그먼트에서는 purge(완전 삭제) 버튼이 액션에 표시된다
- [ ] 빈 상태 (역할이 없을 때) 적절한 Empty 컴포넌트가 표시된다
- [ ] Segmented 전환, 검색, 필터 적용 시 페이지네이션이 첫 페이지로 리셋된다

---

### US-2: 역할 생성

**사용자 스토리**: 슈퍼어드민으로서, 새로운 커스텀 역할을 생성하여 RBAC 체계에 추가할 수 있다.

**화면 구성**:

```
┌─────────────────────────────────┐
│  역할 생성                   [X] │
├─────────────────────────────────┤
│                                 │
│  이름 *                         │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  설명                           │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
├─────────────────────────────────┤
│              [취소]  [생성]      │
└─────────────────────────────────┘
```

- Modal 다이얼로그
- 입력 필드:
  - **이름** (필수): `Input` 컴포넌트.
  - **설명** (선택): `Input.TextArea` 컴포넌트. 빈 값 허용.
  - **상태** (선택): `Select` 컴포넌트. ACTIVE(기본값) / INACTIVE 선택 가능.
- 하단: 취소 / 생성 버튼 (`BAIButton` action prop 사용)
- 생성/추가 버튼은 기본 활성화 상태이며, 클릭 시 validation 수행

**Mutation**:

```graphql
mutation AdminCreateRoleMutation($input: CreateRoleInput!) {
  adminCreateRole(input: $input) {
    id
    name
    description
    source
    status
    createdAt
    updatedAt
  }
}
```

- `input`: `{ name: "역할 이름", description: "설명" }`
- `source`는 전달하지 않음 (백엔드에서 기본값 CUSTOM 적용)

**에러 처리**:

| 에러 조건 | HTTP | 프론트 대응 |
|----------|------|-----------|
| 이름 미입력 | - | 이름 필드 하단에 인라인 validation 에러 표시 ("역할 이름을 입력해주세요") |
| 중복 역할 이름 | 409 (unique constraint) | 이름 필드 하단에 인라인 에러 표시 ("이미 존재하는 역할 이름입니다"). Modal은 닫지 않고 사용자가 이름을 수정할 수 있도록 유지 |
| 기타 서버 에러 | 4xx/5xx | `message.error`로 에러 메시지 표시 |

**사용자 시나리오 — 중복 이름 생성 시도**:

1. 슈퍼어드민이 "역할 생성" 버튼을 클릭한다
2. Modal에서 이미 존재하는 역할 이름 "관리자"를 입력한다
3. "생성" 버튼을 클릭한다
4. 백엔드에서 409 에러가 반환된다
5. Modal은 닫히지 않고, 이름 필드 하단에 "이미 존재하는 역할 이름입니다" 인라인 에러가 표시된다
6. 사용자가 이름을 "프로젝트 관리자"로 수정하고 다시 "생성"을 클릭한다
7. 생성 성공 → 성공 알림 표시 후 Modal 닫힘

**인수 조건**:
- [ ] 역할 목록 페이지의 "역할 생성" 버튼 클릭 시 Modal이 열린다
- [ ] 이름 필드는 필수 입력이며, 빈 값일 때 생성 버튼 클릭 시 validation 에러가 표시된다
- [ ] `adminCreateRole` mutation을 호출하여 역할을 생성한다
- [ ] 생성 성공 시 성공 알림 메시지(`message.success`)를 표시하고 Modal을 닫는다
- [ ] 생성 성공 후 역할 목록이 자동으로 갱신된다 (refetch)
- [ ] 중복 역할 이름 시 Modal을 닫지 않고 이름 필드에 인라인 에러를 표시한다
- [ ] 기타 mutation 에러 시 `message.error`로 에러 메시지를 표시한다
- [ ] 생성 중 버튼에 로딩 상태가 표시된다 (`BAIButton` action prop 활용)
- [ ] Modal 닫힘 시 폼이 초기화된다
- [ ] 이름 필드에 포커스가 자동으로 설정된다 (Modal 열릴 때)

---

### US-3: 역할 상세 조회

**사용자 스토리**: 슈퍼어드민으로서, 특정 역할의 상세 정보를 Drawer에서 확인하고, 해당 역할에 할당된 사용자와 퍼미션을 탭으로 나누어 조회할 수 있다.

**화면 구성**:

```
┌──────────────────────────────────────────┐
│  역할 이름                    [수정] [X]  │
├──────────────────────────────────────────┤
│  ┌────────────────────────────────────┐  │
│  │ 설명       역할에 대한 설명 텍스트   │  │
│  │ Source     CUSTOM                  │  │
│  │ 상태       ACTIVE                  │  │
│  │ 생성일     2026-03-01 10:00        │  │
│  │ 수정일     2026-03-02 15:30        │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌─ 할당 (3) ─┬─ 퍼미션 (5) ──────────┐  │
│  │                                    │  │
│  │  [+ 사용자 추가]                    │  │
│  │  ┌──────┬──────┬──────┬──────┬──┐  │  │
│  │  │이메일 │이름   │할당자 │할당일 │  │  │  │
│  │  ├──────┼──────┼──────┼──────┼──┤  │  │
│  │  │a@..  │김OO  │admin │03-01 │🗑│  │  │
│  │  │b@..  │이OO  │admin │03-02 │🗑│  │  │
│  │  └──────┴──────┴──────┴──────┴──┘  │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

- Drawer (우측 사이드 패널, 너비 800px 이상)
- 상단: 역할 이름 (Typography.Title) + 수정 버튼 (CUSTOM만) + 닫기 버튼
- 메타데이터 영역 (Ant Design `Descriptions` 컴포넌트):
  - 설명, Source (Tag), 상태 (Tag), 생성일, 수정일
- 탭 2개 (Ant Design `Tabs` 컴포넌트):
  - **할당 (Assignment)** 탭: 사용자 할당 테이블 (→ US-6)
  - **퍼미션 (Permission)** 탭: 퍼미션 테이블 (→ US-7)
  - 각 탭 레이블에 `Badge`로 `count` 표시 (커넥션의 `count` 필드 활용)

**데이터 조회 — Drawer 별도 쿼리 구조**:

역할 목록에서 이름 클릭 시, 해당 Role의 ID가 Drawer에 전달된다. Drawer 내부에서 `useLazyLoadQuery`로 `adminRole(id: ...)` 쿼리를 호출하여 Role 메타데이터와 하위 커넥션을 조회한다. 이렇게 목록 쿼리와 분리하여 over-fetching을 방지한다.

```graphql
# Drawer에서 사용하는 별도 쿼리
query RoleDetailDrawerQuery($id: UUID!) {
  adminRole(id: $id) {
    ...RoleDetailDrawerContentFragment
  }
}

# Drawer 컨텐츠 컴포넌트의 fragment
fragment RoleDetailDrawerContentFragment on Role {
  id
  name
  description
  source
  status
  createdAt
  updatedAt
  deletedAt

  # 할당 탭용 커넥션 fragment spread
  ...RoleAssignmentTabFragment

  # 퍼미션 탭용 커넥션 fragment spread
  ...RolePermissionTabFragment
}

# 할당 탭 컴포넌트의 fragment — Role의 roleAssignments 커넥션
fragment RoleAssignmentTabFragment on Role {
  roleAssignments(first: 20)
    @connection(key: "RoleAssignmentTab_roleAssignments") {
    count
    edges {
      node {
        id
        userId
        grantedBy
        grantedAt
        user {
          email
          username
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}

# 퍼미션 탭 컴포넌트의 fragment — Role의 permissions 커넥션
fragment RolePermissionTabFragment on Role {
  permissions(first: 20)
    @connection(key: "RolePermissionTab_permissions") {
    count
    edges {
      node {
        id
        scopeType
        scopeId
        entityType
        operation
        scope {
          ... on ProjectV2 { name }
          ... on DomainV2 { name }
          ... on UserV2 { email }
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

**데이터 흐름 상세**:

1. 역할 목록 테이블에서 이름 클릭 → Drawer open state 변경 + 선택된 Role의 ID를 Drawer에 전달
2. Drawer 내부에서 `useLazyLoadQuery(RoleDetailDrawerQuery, { id: roleId })`로 별도 쿼리를 호출한다
3. 쿼리 결과의 fragment ref를 `RoleDetailDrawerContent` 컴포넌트에 전달하여 `useFragment`로 데이터를 읽는다
4. 메타데이터 영역은 Role의 직접 필드로 렌더링
5. 탭 컴포넌트는 각각 `RoleAssignmentTabFragment`, `RolePermissionTabFragment`를 별도의 `useFragment`로 읽어 하위 커넥션 데이터를 렌더링
6. Mutation 후에는 refetch로 테이블 데이터를 갱신한다

> **Fallback 전략**: Role 하위 커넥션이 아직 백엔드에 없는 경우, 탭 컴포넌트에서 별도의 `useLazyLoadQuery`로 top-level 쿼리를 호출한다:
> - 할당 탭: `adminRoleAssignments(filter: { roleId: $roleId })`
> - 퍼미션 탭: `adminPermissions(filter: { roleId: $roleId })`
> 커넥션이 추가되면 fragment 기반으로 전환한다.

**인수 조건**:
- [ ] 역할 목록에서 이름 클릭 시 Drawer가 우측에서 열린다
- [ ] Drawer 상단에 역할 이름이 `Typography.Title`로 표시된다
- [ ] 메타데이터 영역에 설명, Source (Tag), 상태 (Tag), 생성일, 수정일이 `Descriptions` 컴포넌트로 표시된다
- [ ] CUSTOM 역할일 때 상단에 "수정" 버튼이 표시된다
- [ ] SYSTEM 역할일 때 "수정" 버튼이 표시되지 않는다
- [ ] "할당" 탭과 "퍼미션" 탭이 존재하고, 기본은 "할당" 탭이 선택된다
- [ ] 각 탭 레이블에 해당 커넥션의 `count` 값이 `Badge`로 표시된다
- [ ] 탭 전환 시 이미 조회된 데이터가 유지된다 (Relay cache)
- [ ] Drawer 닫힘 시 탭 상태가 "할당" 탭으로 초기화된다
- [ ] Drawer 내용 로딩 중 `Skeleton` 또는 `Spin`이 표시된다
- [ ] 다른 역할을 클릭하면 Drawer 내용이 해당 역할로 갱신된다

---

### US-4: 역할 수정

**사용자 스토리**: 슈퍼어드민으로서, 기존 커스텀 역할의 이름과 설명을 수정할 수 있다.

**화면 구성**:
- Modal 다이얼로그 (생성 Modal과 동일한 형태)
- 기존 값이 입력 필드에 미리 채워진 상태
- 상태(status) 필드 포함: ACTIVE / INACTIVE 선택 가능
- 하단: 취소 / 저장 버튼 (기본 활성화, 클릭 시 validation)

**Mutation**:

```graphql
mutation AdminUpdateRoleMutation($input: UpdateRoleInput!) {
  adminUpdateRole(input: $input) {
    id
    name
    description
    updatedAt
  }
}
```

- `input`: `{ id: "<role_uuid>", name: "새 이름", description: "새 설명", status: ACTIVE }`
- 변경되지 않은 필드는 `null`로 전달하여 기존 값 유지

**에러 처리**:

| 에러 조건 | HTTP | 프론트 대응 |
|----------|------|-----------|
| 중복 역할 이름 | 409 (unique constraint) | 이름 필드 하단에 인라인 에러 표시 ("이미 존재하는 역할 이름입니다"). Modal 유지 |
| 역할을 찾을 수 없음 | 404 | `message.error` ("해당 역할을 찾을 수 없습니다"). Modal 닫기 + 목록 refetch |
| 기타 서버 에러 | 4xx/5xx | `message.error`로 에러 메시지 표시 |

**인수 조건**:
- [ ] 역할 상세 Drawer의 "수정" 버튼 또는 목록의 액션 버튼 클릭 시 수정 Modal이 열린다
- [ ] Modal에 기존 이름과 설명이 미리 입력되어 있다
- [ ] SYSTEM 역할에 대해서는 수정 Modal이 열리지 않는다 (버튼 자체가 없음)
- [ ] `adminUpdateRole` mutation을 호출하여 역할을 수정한다
- [ ] 수정 성공 시 성공 알림 메시지를 표시하고 Modal을 닫는다
- [ ] 수정 성공 후 Drawer의 메타데이터와 목록 테이블이 자동으로 갱신된다 (refetch)
- [ ] 중복 역할 이름으로 수정 시 Modal을 닫지 않고 이름 필드에 인라인 에러를 표시한다
- [ ] 변경 사항이 없을 때 저장 버튼이 비활성화된다
- [ ] 수정 중 버튼에 로딩 상태가 표시된다

---

### US-5: 역할 상태 관리 (활성화/비활성화/삭제/완전삭제)

**사용자 스토리**: 슈퍼어드민으로서, 역할을 비활성화하여 일시적으로 사용 중단하거나, 소프트 삭제하여 삭제 상태로 전환하거나, 완전 삭제(purge)하여 시스템에서 제거할 수 있다.

**동작 정의**:

| 현재 상태 | 가능한 액션 | 결과 상태 | API | 확인 다이얼로그 |
|-----------|-------------|-----------|-----|----------------|
| ACTIVE | 비활성화 | INACTIVE | `adminUpdateRole(input: { id, status: INACTIVE })` | 간단한 확인 |
| ACTIVE | 삭제 | DELETED | `adminDeleteRole` | 경고 확인 |
| INACTIVE | 활성화 | ACTIVE | `adminUpdateRole(input: { id, status: ACTIVE })` | 없음 |
| INACTIVE | 삭제 | DELETED | `adminDeleteRole` | 경고 확인 |
| DELETED | 완전 삭제 | (영구 제거) | `adminPurgeRole` | 강한 경고 확인 |

**액션 위치**:
- 역할 목록 테이블의 액션 컬럼 (버튼으로 표시)
- 역할 상세 Drawer 상단 (버튼으로 표시)

**확인 다이얼로그 내용**:
- **삭제**: "역할 '{name}'을(를) 삭제하시겠습니까? 이 역할에 할당된 사용자와 퍼미션 데이터는 유지되지만, 역할은 삭제(DELETED) 상태로 전환되어 더 이상 접근 권한을 부여하지 않으며 필요 시 복구만 가능합니다."
- **완전 삭제 (purge)**: "역할 '{name}'을(를) 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 관련된 모든 할당과 퍼미션이 함께 삭제됩니다." (Drawer에서 확인 가능한 할당 N명, 퍼미션 M개 정보를 다이얼로그에 포함하여 영향 범위를 사전에 안내)

**에러 처리**:

| 에러 조건 | HTTP | 프론트 대응 |
|----------|------|-----------|
| 역할을 찾을 수 없음 | 404 | `message.error` ("해당 역할을 찾을 수 없습니다"). 목록 refetch |
| purge 시 FK 제약 위반 (할당/퍼미션 잔존) | 409 | `message.error` ("역할에 할당된 사용자 또는 퍼미션이 남아있어 영구 삭제할 수 없습니다. 먼저 할당과 퍼미션을 제거해주세요.") |
| 기타 서버 에러 | 4xx/5xx | `message.error`로 에러 메시지 표시 |

**사용자 시나리오 — purge 실패 시**:

1. 슈퍼어드민이 DELETED 세그먼트에서 역할의 "완전 삭제" 버튼을 클릭한다
2. 강한 경고 확인 다이얼로그가 표시된다: "역할 '{name}'을(를) 영구적으로 삭제하시겠습니까? 할당된 사용자 3명, 퍼미션 5개가 함께 삭제됩니다."
3. 사용자가 "확인"을 클릭한다
4. 만약 백엔드에서 FK 제약 위반 에러(409)가 반환되면:
   - `message.error`로 "역할에 할당된 사용자 또는 퍼미션이 남아있어 영구 삭제할 수 없습니다. 먼저 할당과 퍼미션을 제거해주세요." 표시
   - 사용자는 해당 역할의 Drawer를 열어 할당/퍼미션을 먼저 제거한 후 다시 purge를 시도한다

**Mutation**:

```graphql
# 소프트 삭제
mutation AdminDeleteRoleMutation($input: DeleteRoleInput!) {
  adminDeleteRole(input: $input) { id }
}

# 완전 삭제
mutation AdminPurgeRoleMutation($input: PurgeRoleInput!) {
  adminPurgeRole(input: $input) { id }
}
```

**인수 조건**:
- [ ] ACTIVE 역할에 대해 "비활성화" 액션이 가능하다 (`adminUpdateRole`의 `status` 필드 사용)
- [ ] INACTIVE 역할에 대해 "활성화" 액션이 가능하다 (`adminUpdateRole`의 `status` 필드 사용)
- [ ] ACTIVE/INACTIVE 역할에 대해 "삭제" 액션이 가능하다 (소프트 삭제)
- [ ] DELETED 역할에 대해 "완전 삭제(purge)" 액션이 가능하다
- [ ] 삭제/완전 삭제 실행 전 확인 다이얼로그가 표시된다
- [ ] 완전 삭제(purge) 확인 다이얼로그에는 강한 경고 메시지와 함께 영향 범위(할당 N명, 퍼미션 M개)가 표시된다
- [ ] 완전 삭제 실패 시 (FK 제약 위반 409) 사용자에게 할당/퍼미션 먼저 제거를 안내하는 에러 메시지를 표시한다
- [ ] SYSTEM 역할에 대해서는 이름/설명 수정 액션만 비활성화된다 (상태 변경, 할당, 퍼미션 변경은 가능)
- [ ] 상태 변경 후 목록이 자동으로 갱신된다 (현재 Segmented 상태에 해당 역할이 더 이상 없으면 목록에서 사라짐)
- [ ] Drawer가 열린 상태에서 삭제 시 Drawer가 닫힌다

---

### US-6: 역할 할당 관리 (사용자)

**사용자 스토리**: 슈퍼어드민으로서, 특정 역할에 사용자를 할당하거나 제거하여 해당 역할의 권한을 사용자에게 부여하거나 회수할 수 있다.

**화면 구성 — 할당 탭 (Drawer 내부)**:

```
┌────────────────────────────────────────┐
│                      [새로고침] [+ 사용자 추가] │
├──────────┬──────┬──────┬──────┬───────┤
│ 이메일    │ 이름  │ 할당자│ 할당일│ 액션  │
├──────────┼──────┼──────┼──────┼───────┤
│ a@ex.com │ 김OO │admin │03-01 │ [제거] │
│ b@ex.com │ 이OO │admin │03-02 │ [제거] │
└──────────┴──────┴──────┴──────┴───────┘
          [< 1 2 ... >]
```

- 역할 상세 Drawer의 "할당" 탭
- 상단 우측: "새로고침" 버튼 + "사용자 추가" 버튼 (주 액션인 "사용자 추가"가 가장 오른쪽)
- 할당된 사용자 테이블 컬럼:

| 컬럼 | 데이터 소스 | 비고 |
|------|------------|------|
| 이메일 | `node.user.email` | `UserV2`의 `email` 필드 |
| 이름 | `node.user.username` | `UserV2`의 `username` 필드 |
| 할당자 | `node.grantedBy` | UUID. 가능한 경우 사용자 이름으로 resolve |
| 할당일 | `node.grantedAt` | `dayjs(grantedAt).format('lll')` |
| 액션 | - | "제거" 버튼 |

**데이터 조회**:

Role의 `roleAssignments` 커넥션을 통해 조회한다 (US-3의 `RoleAssignmentTabFragment` 참조).

```graphql
# 할당 탭 — Role 하위 커넥션
fragment RoleAssignmentTabFragment on Role {
  id                    # adminRevokeRole에 roleId로 사용
  source                # SYSTEM 여부 판단
  roleAssignments(first: 20)
    @connection(key: "RoleAssignmentTab_roleAssignments") {
    count
    edges {
      node {
        id
        userId
        grantedBy
        grantedAt
        user {
          email
          username
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

**화면 구성 — 사용자 추가 Modal**:

```
┌──────────────────────────────────┐
│  사용자 추가                  [X] │
├──────────────────────────────────┤
│  [이메일 또는 이름으로 검색...]    │
│  ┌──────────┬──────┬──────────┐  │
│  │ ☐ 이메일  │ 이름  │ 상태     │  │
│  ├──────────┼──────┼──────────┤  │
│  │ ☑ c@..   │ 박OO │ ACTIVE   │  │
│  │ ☐ d@..   │ 최OO │ ACTIVE   │  │
│  │ ☐ e@..   │ 정OO │ INACTIVE │  │
│  └──────────┴──────┴──────────┘  │
│                                  │
│  선택됨: 1명                      │
├──────────────────────────────────┤
│              [취소]  [추가]       │
└──────────────────────────────────┘
```

- 사용자 검색: BAIPropertyFilter를 사용하여 이메일/이름으로 서버사이드 검색 (credential 페이지와 동일한 UX)
- 사용자 선택: 체크박스로 복수 선택 가능
- 이미 할당된 사용자는 목록에서 제외하거나 비활성화(disabled) 표시
- 선택된 사용자 수 표시
- "추가" 버튼: 기본 활성화 상태이며, 클릭 시 선택 여부를 validation

**Mutation**:

```graphql
# 사용자 할당
mutation AdminAssignRoleMutation($input: AssignRoleInput!) {
  adminAssignRole(input: $input) {
    id
    userId
    roleId
    grantedBy
    grantedAt
    user { email username }
  }
}

# 사용자 제거
mutation AdminRevokeRoleMutation($input: RevokeRoleInput!) {
  adminRevokeRole(input: $input) {
    id
    userId
    roleId
  }
}
```

- 복수 사용자 선택 시 각 사용자에 대해 `adminAssignRole` mutation을 순차적으로 호출 (배치 할당 mutation은 백엔드 미지원, TODO)
- 할당 성공 후 테이블 refetch로 데이터 갱신
- 제거 성공 후 테이블 refetch로 데이터 갱신

**인수 조건**:
- [ ] "할당" 탭 선택 시 해당 역할의 `roleAssignments` 커넥션 데이터가 표시된다
- [ ] 사용자 목록이 Relay 커서 기반 페이지네이션으로 표시된다
- [ ] "사용자 추가" 버튼 클릭 시 사용자 선택 Modal이 열린다
- [ ] Modal에서 이메일/이름으로 사용자를 검색할 수 있다
- [ ] 이미 할당된 사용자는 Modal 목록에서 제외되거나 비활성화 표시된다
- [ ] 하나 이상의 사용자를 선택하고 "추가" 클릭 시 `adminAssignRole` mutation으로 할당된다
- [ ] 할당 성공 시 성공 메시지를 표시하고 할당 테이블이 갱신된다
- [ ] 이미 할당된 사용자를 다시 할당하려 하면 에러 메시지가 표시된다
- [ ] "제거" 버튼 클릭 시 확인 다이얼로그 후 `adminRevokeRole` mutation으로 사용자를 제거한다
- [ ] 제거 성공 시 성공 메시지를 표시하고 할당 테이블이 갱신된다
- [ ] 할당/제거 성공 시 Drawer 탭 레이블의 Badge 카운트가 갱신된다
- [ ] SYSTEM 역할에서도 "사용자 추가" 및 "제거" 기능이 동일하게 사용 가능하다
- [ ] 할당된 사용자가 없을 때 적절한 Empty 컴포넌트가 표시된다

---

### US-7: 퍼미션 관리

**사용자 스토리**: 슈퍼어드민으로서, 특정 역할에 세분화된 퍼미션(스코프 + 엔티티 타입 + 오퍼레이션)을 추가하거나 삭제하여 해당 역할의 권한을 정밀하게 제어할 수 있다.

**화면 구성 — 퍼미션 탭 (Drawer 내부)**:

```
┌────────────────────────────────────────────────────────────────┐
│  [필터...]                          [새로고침] [+ 퍼미션 추가] │
├───────────┬──────────────┬───────────┬───────────┬────────────┤
│ 스코프 타입│ 스코프 ID     │ 엔티티 타입│ 오퍼레이션 │ 액션       │
├───────────┼──────────────┼───────────┼───────────┼────────────┤
│ PROJECT   │ My Project   │ VFOLDER   │ CREATE    │ [삭제]     │
│ PROJECT   │ My Project   │ VFOLDER   │ READ      │ [삭제]     │
│ PROJECT   │ My Project   │ VFOLDER   │ UPDATE    │ [삭제]     │
│ DOMAIN    │ Default      │ IMAGE     │ READ      │ [삭제]     │
└───────────┴──────────────┴───────────┴───────────┴────────────┘
                          [< 1 2 ... >]
```

- 역할 상세 Drawer의 "퍼미션" 탭
- 상단: 좌측에 필터 UI (선택 사항), 우측에 "새로고침" + "퍼미션 추가" 버튼 (주 액션인 "퍼미션 추가"가 가장 오른쪽)
- 플랫 테이블 (한 행 = 하나의 Permission 레코드) 컬럼:

| 컬럼 | 데이터 소스 | 비고 |
|------|------------|------|
| 스코프 타입 | `node.scopeType` | `Tag` 컴포넌트로 표시 (DOMAIN=파란, PROJECT=초록, USER=주황 등) |
| 스코프 ID | `node.scopeId` + `node.scope` | 기본적으로 `scopeId` 표시. `scope` union이 resolve 가능하면 이름으로 표시 (예: ProjectV2.name, DomainV2.name). resolve 실패 시 UUID 그대로 표시. |
| 엔티티 타입 | `node.entityType` | `Tag` 컴포넌트로 표시 |
| 오퍼레이션 | `node.operation` | `Tag` 컴포넌트로 표시 (색상으로 읽기/쓰기/삭제 구분) |
| 액션 | - | "삭제" 버튼 |

**데이터 조회**:

Role의 `permissions` 커넥션을 통해 조회한다 (US-3의 `RolePermissionTabFragment` 참조).

```graphql
fragment RolePermissionTabFragment on Role {
  id                    # adminCreatePermission에 roleId로 사용
  source                # SYSTEM 여부 판단
  permissions(first: 20)
    @connection(key: "RolePermissionTab_permissions") {
    count
    edges {
      node {
        id
        scopeType
        scopeId
        entityType
        operation
        scope {
          # 스코프 엔티티 이름 resolve
          ... on ProjectV2 { name }
          ... on DomainV2 { name }
          ... on UserV2 { email username }
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

**화면 구성 — 퍼미션 추가 Modal**:

```
┌──────────────────────────────────────┐
│  퍼미션 추가                      [X] │
├──────────────────────────────────────┤
│                                      │
│  스코프 타입 *                        │
│  ┌──────────────────────────────┐    │
│  │ PROJECT                   ▼  │    │  ← rbacScopeEntityCombinations
│  └──────────────────────────────┘    │    에서 scopeType 목록 로딩
│                                      │
│  스코프 ID *                          │
│  ┌──────────────────────────────┐    │
│  │ [도메인 선택 ▼] [프로젝트 선택 ▼]│   │  ← scopeType에 따라 동적 UI
│  └──────────────────────────────┘    │
│                                      │
│  엔티티 타입 *                        │
│  ┌──────────────────────────────┐    │
│  │ VFOLDER                   ▼  │    │
│  └──────────────────────────────┘    │
│                                      │
│  오퍼레이션 *                         │
│  ┌──────────────────────────────┐    │
│  │ CREATE                    ▼  │    │
│  └──────────────────────────────┘    │
│                                      │
├──────────────────────────────────────┤
│                  [취소]  [추가]       │
└──────────────────────────────────────┘
```

- **스코프 타입 선택** (`Select`): `rbacScopeEntityCombinations` 쿼리의 결과에서 `scopeType` 값 목록을 표시
  - 유효한 scopeType: DOMAIN, PROJECT, USER, RESOURCE_GROUP, AGENT, SESSION, MODEL_DEPLOYMENT, CONTAINER_REGISTRY, STORAGE_HOST

- **스코프 ID 입력/선택** (스코프 타입에 따라 동적 UI):
  - `DOMAIN`: 도메인 목록 `Select` (기존 도메인 목록 쿼리 활용)
  - `PROJECT`: 도메인 `Select` → 해당 도메인의 프로젝트 `Select` (연쇄 선택)
  - `USER`: 사용자 검색 `Select` (이메일/이름 검색)
  - `RESOURCE_GROUP`: 자원 그룹 목록 `Select`
  - `SESSION`, `AGENT`, `MODEL_DEPLOYMENT`, `CONTAINER_REGISTRY`, `STORAGE_HOST`: 해당 엔티티 목록 `Select` 또는 ID 직접 입력
  - 스코프 타입 변경 시 스코프 ID 필드 초기화

- **엔티티 타입 선택** (`Select`): `rbacScopeEntityCombinations` 쿼리를 사용하여 선택된 scopeType에 해당하는 `validEntityTypes`만 표시
  - 예: scopeType=PROJECT 선택 시 → RESOURCE_GROUP, CONTAINER_REGISTRY, SESSION, VFOLDER, DEPLOYMENT, NETWORK, USER, STORAGE_HOST만 선택 가능
  - scopeType 변경 시 entityType 필드 초기화

- **오퍼레이션 선택** (`Select`): `OperationType` 값 단일 선택
  - Nice to Have: 복수 선택 후 일괄 생성

- "추가" 버튼은 기본 활성화 상태이며, 클릭 시 필수 필드가 채워졌는지 validation 수행

**Mutation**:

```graphql
mutation AdminCreatePermissionMutation($input: CreatePermissionInput!) {
  adminCreatePermission(input: $input) {
    id
    roleId
    scopeType
    scopeId
    entityType
    operation
    scope {
      ... on ProjectV2 { name }
      ... on DomainV2 { name }
      ... on UserV2 { email username }
    }
  }
}

mutation AdminDeletePermissionMutation($input: DeletePermissionInput!) {
  adminDeletePermission(input: $input) { id }
}
```

- 퍼미션 추가 성공 후 테이블 refetch로 데이터 갱신
- 퍼미션 삭제 성공 후 테이블 refetch로 데이터 갱신

**scopeType-entityType 조합 조회 (퍼미션 추가 Modal 초기 로딩)**:

```graphql
query RbacScopeEntityCombinationsQuery {
  rbacScopeEntityCombinations {
    scopeType
    validEntityTypes
  }
}
```

- Modal이 열릴 때 (또는 앱 초기화 시) 이 쿼리를 호출하여 조합 데이터를 캐싱한다
- scopeType Select에는 조합 데이터의 `scopeType` 값들을 나열한다
- 사용자가 scopeType을 선택하면 해당 항목의 `validEntityTypes`만 entityType Select에 표시한다

**인수 조건**:
- [ ] "퍼미션" 탭 선택 시 해당 역할의 `permissions` 커넥션 데이터가 플랫 테이블로 표시된다
- [ ] 각 퍼미션이 한 행으로 표시된다 (한 행 = scopeType + scopeId + entityType + operation)
- [ ] scopeType, entityType, operation은 `Tag` 컴포넌트로 색상 구분되어 표시된다
- [ ] scopeId는 `scope` union 타입이 resolve 가능한 경우 엔티티 이름으로 표시된다 (예: ProjectV2.name → "My Project")
- [ ] scopeId가 resolve 불가능한 경우 UUID 값 그대로 표시된다
- [ ] "퍼미션 추가" 버튼 클릭 시 퍼미션 추가 Modal이 열린다
- [ ] Modal에서 스코프 타입 선택 시 스코프 ID 입력 UI가 동적으로 변경된다
  - [ ] `DOMAIN` 선택: 도메인 목록 Select가 표시된다
  - [ ] `PROJECT` 선택: 도메인 Select + 프로젝트 Select가 연쇄로 표시된다
  - [ ] `USER` 선택: 사용자 검색 Select가 표시된다
  - [ ] `RESOURCE_GROUP` 선택: 자원 그룹 목록 Select가 표시된다
  - [ ] 그 외 scopeType: 해당 엔티티 목록 Select 또는 ID 직접 입력이 표시된다
- [ ] 스코프 타입 변경 시 스코프 ID 필드와 엔티티 타입 필드가 모두 초기화된다
- [ ] 엔티티 타입 Select는 `rbacScopeEntityCombinations` 쿼리를 사용하여 선택된 scopeType에 해당하는 유효한 entityType만 표시한다
- [ ] scopeType 선택 전에는 엔티티 타입 Select가 비활성화된다
- [ ] "추가" 버튼은 기본 활성화 상태이며, 클릭 시 필수 필드가 채워졌는지 validation을 수행한다
- [ ] `adminCreatePermission` mutation으로 퍼미션을 추가한다
- [ ] 추가 성공 시 성공 메시지를 표시하고 퍼미션 테이블이 갱신된다
- [ ] 중복 퍼미션 추가 시 에러 메시지가 표시된다
- [ ] "삭제" 버튼 클릭 시 확인 다이얼로그 후 `adminDeletePermission` mutation으로 퍼미션을 삭제한다
- [ ] 삭제 성공 시 성공 메시지를 표시하고 퍼미션 테이블이 갱신된다
- [ ] 추가/삭제 성공 시 Drawer 탭 레이블의 Badge 카운트가 갱신된다
- [ ] SYSTEM 역할에서도 "퍼미션 추가" 및 "삭제" 기능이 동일하게 사용 가능하다
- [ ] 퍼미션이 없을 때 적절한 Empty 컴포넌트가 표시된다
- [ ] 퍼미션 테이블이 Relay 커서 기반 페이지네이션을 지원한다

---

## 범위 외 (Out of Scope)

- **my-role 쿼리 / 셀프서비스 역할 조회**: 일반 사용자가 자신의 역할을 확인하는 UI는 이 스펙에 포함하지 않는다
- **엔티티 화면 통합 (Phase 2)**: 각 엔티티 목록 화면에 RBAC 권한 컬럼/버튼을 추가하는 것은 Phase 2로 분리한다
- **역할 기반 UI 가시성 제어**: 역할에 따라 메뉴/버튼을 동적으로 표시/숨김하는 기능은 포함하지 않는다
- **일괄 퍼미션 템플릿**: 미리 정의된 퍼미션 세트를 한 번에 적용하는 기능은 포함하지 않는다
- **퍼미션 상속/계층**: 역할 간 퍼미션 상속 구조는 포함하지 않는다
- **RBAC 변경 감사 로그**: 역할/퍼미션/할당 변경 이력 UI는 포함하지 않는다
- **비-관리자 접근**: 이 UI는 슈퍼어드민만 사용한다. 다른 역할의 접근 제어는 고려하지 않는다

---

## 목업 대비 변경 사항

> 기존 목업 참조: `backend.ai-control-panel` 저장소, `feat/FR-1642-rbac-management-ui-mockup` 브랜치

| # | 변경 내용 | 이유 |
|---|-----------|------|
| 1 | Role에서 Scope 제거 | 스코프는 Permission에 존재. Role은 이름/설명 컨테이너일 뿐 |
| 2 | Permission 테이블을 플랫으로 변경 | 모든 퍼미션이 동일한 `(scopeType, scopeId, entityType, operation)` 구조 |
| 3 | 탭 3개 → 2개 | "스코프 권한"과 "엔티티 권한"을 하나의 "퍼미션" 탭으로 통합 |
| 4 | 상태 Segmented 컨트롤 추가 | ACTIVE/INACTIVE/DELETED 생명주기 관리 |
| 5 | System 역할 구분 (Source 컬럼) | SYSTEM 역할은 읽기 전용으로 보호 |
| 6 | Entity 타입 확장 | 목업의 4개(VFolder, Session, Image, Endpoint)에서 전체 RBACElementType enum으로 확장 |

---

## 관련 이슈

- FR-1642: RBAC Management UI 목업 구현 (control-panel 저장소)
- BA-4808: RBAC scope-entity combination constants 정의 (**구현 완료**, main 머지됨)
- BA-4809: RBAC scope-entity combinations GraphQL 쿼리 (**구현 완료**, main 머지됨)
- BA-4792: assignments_by_role_loader DataLoader 구현 (**구현 완료**, main 머지됨)
- BA-4812: my_roles GraphQL query 추가 (**구현 완료**, main 머지됨, 이 스펙 범위 외)
- BA-4785: Role type에 permissions 커넥션 추가 (개발 중, `feature/rbac-role-permissions-field` 브랜치)
- BA-4787: Role type에 roleAssignments 커넥션 추가 (개발 중, `feature/rbac-role-permissions-field` 브랜치)

---

## 기술 참고 사항 (구현자 참고용)

> 이 섹션은 구현자에게 참고 정보를 제공하기 위한 것으로, 구현 방식을 강제하지 않는다.

### Relay 패턴

- Query orchestrator + Fragment component 아키텍처 사용
- 역할 목록 페이지: `useLazyLoadQuery` (query orchestrator) + `useFragment` (RoleNodes fragment component)
- 역할 상세 Drawer: `adminRole(id: ...)` 별도 쿼리로 조회 (목록 쿼리와 분리하여 over-fetching 방지)
- 하위 커넥션 (permissions, roleAssignments): 각 탭 컴포넌트에서 `useFragment` + `@connection` 디렉티브 사용
- Mutation 후 refetch로 테이블 데이터 갱신 (테이블 UI에서 Relay store를 직접 다루면 테이블 사이즈 불일치 문제 발생. store 직접 업데이트는 무한 스크롤 UX에 적합)

### 컴포넌트 패턴 참고

기존 프로젝트 내 유사한 테이블+Drawer 패턴을 참고한다:

- `react/src/pages/ComputeSessionListPage.tsx` — 테이블 + Drawer 열기 패턴
- `react/src/components/AgentDetailDrawerContent.tsx` — Drawer 내부 Descriptions + Tabs 패턴
- `react/src/components/MountedVFolderLinks.tsx` — 부모 노드의 하위 커넥션 (`vfolder_nodes.edges`) 접근 패턴
- `react/src/components/SessionNodes.tsx` — `@relay(plural: true)` fragment 패턴
- `react/src/pages/ReservoirArtifactDetailPage.tsx` — `@connection` 디렉티브 사용 패턴

### BAI 컴포넌트

Ant Design 기본 컴포넌트보다 프로젝트 커스텀 컴포넌트를 우선 사용한다:

- `BAIButton` — async `action` prop (자동 로딩 상태)
- `BAIPropertyFilter` — 검색/필터 UI
- `BAITable` — 프로젝트 표준 테이블
- `BAIFlex` — 레이아웃 플렉스 컨테이너
- `BAIErrorBoundary` / `ErrorBoundaryWithNullFallback` — 에러 바운더리

### React Compiler

- 컴포넌트 상단에 `'use memo'` 디렉티브 사용

### i18n

- 모든 사용자 대면 문자열에 `useTranslation()` 사용
- 한국어/영어 최소 지원
- 번역 키 네이밍: `rbac.RoleName`, `rbac.CreateRole`, `rbac.Permission` 등
