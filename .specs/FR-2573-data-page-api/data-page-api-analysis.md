# VFolder 조회 API 마이그레이션 — Phase 1

- **Jira**: [FR-2573](https://lablup.atlassian.net/browse/FR-2573)
- **조사일**: 2026-04-15
- **Phase 1 스코프**: `vfolder_nodes` 기반 **목록 조회 페이지 2개** 를 신규 쿼리로 마이그레이션

## 1. Phase 1 대상 페이지

| 라우트        | 페이지                                        | 현재 Operation                                                | 마이그레이션 후                            |
| ------------- | --------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------ |
| `/data`       | `VFolderNodeListPage` (`routes.tsx:354`)      | `VFolderNodeListPageQuery` (`vfolder_nodes` + `scopeId`)      | `myVfolders` (+ 필요 시 `projectVfolders`) |
| `/admin-data` | `AdminVFolderNodeListPage` (`routes.tsx:436`) | `AdminVFolderNodeListPageQuery` (`vfolder_nodes`, scope 없음) | `adminVfoldersV2`                          |

두 페이지는 동일한 `vfolder_nodes` 루트 필드 + `VFolderNodesFragment` + `VFolderNodes` 컴포넌트를 공유하고 있으며, 유일한 차이는 쿼리 변수에 `scopeId`가 있는지 뿐. Phase 1에서는 이 공유 구조를 분리해 각 페이지의 의도에 맞는 전용 쿼리로 교체.

### 분리 요구사항

- **어드민 페이지**: 관리자가 **모든 생성된 폴더**를 조회
- **사용자 페이지**: 자신이 **생성한 / 공유받은 / 소속 프로젝트의 폴더**만 조회
- 현재 `VFolderNodes` 내부에 있는 `vfolder.user === currentUser?.uuid` 분기(`VFolderNodes.tsx:296`)는 사용자 컨텍스트 전용 로직이므로, 어드민 페이지에서는 분리가 자연스러움 > 이거 adminVFolderV2 나 다른 쿼리들도 전부 vfolder connection 사용하고 있어서, VFolderNodes 컴포넌트 자체는 fragment 를 쓰고 각 페이지에서 useLazyLoadQuery 할 때 각각에 맞는 쿼리만 호출하도록 바꾸면 분리할 수 있겟네요.

## 2. 신규 쿼리 (26.4.2 추가)

`data/schema.graphql:13320-13332`

| 쿼리              | 설명                              | 권한            | 파라미터                                                          |
| ----------------- | --------------------------------- | --------------- | ----------------------------------------------------------------- |
| `adminVfoldersV2` | 전체 vfolder 검색                 | superadmin only | `filter: VFolderFilter`, `orderBy: [VFolderOrderBy!]`, pagination |
| `myVfolders`      | 현재 사용자가 접근 가능한 vfolder | 일반 사용자     | `filter`, `orderBy`, pagination                                   |
| `projectVfolders` | 특정 프로젝트의 vfolder           | —               | `projectId: UUID!` + `filter`, `orderBy`, pagination              |

- 반환 타입: `VFolderConnection!` (`schema.graphql:18754`) — `edges { node: VFolder! cursor }`, `count`, `pageInfo`
- WebUI에서 도메인 어드민은 각 도메인별 별도 endpoint로 superadmin 역할을 수행하므로 `adminVfoldersV2`의 "superadmin only" 제약과 충돌 없음.

### ❓ 구현하며 검증할 점

- `myVfolders`의 "accessible to the current user" 범위가 **공유받은 폴더 + 프로젝트 폴더**를 포함하는지 (스키마 주석만으론 불명)
  - **포함** 시 → 사용자 페이지는 `myVfolders` 단일 쿼리로 완결
  - **미포함** 시 → `myVfolders` + `projectVfolders` 병렬 호출 + 클라이언트 머지, 공유 폴더 경로는 별도 고민

## 3. 타입 호환성 — `VFolder` vs `VirtualFolderNode` (⚠ 비호환)

- 신규 쿼리: `VFolderConnection.edges.node: VFolder!` (Strawberry, `schema.graphql:18709`)
- 기존 Fragment: `VirtualFolderNode` (Graphene, `schema.graphql:19101`)
- 구조가 근본적으로 다름 (flat → nested) → **Fragment 전면 재작성 필수**

### 신규 `VFolder` 전체 구조 (확인 완료)

```
VFolder {
  id
  host: String!
  status: VFolderOperationStatus!     # READY | CLONING | DELETE_PENDING | DELETE_ONGOING | DELETE_COMPLETE | DELETE_ERROR
  unmanagedPath: String
  metadata: VFolderMetadataInfo {
    name, usageMode, quotaScopeId, createdAt, lastUsed, cloneable
  }
  accessControl: VFolderAccessControlInfo {
    permission: VFolderMountPermission,   # READ_ONLY | READ_WRITE | RW_DELETE
    ownershipType: VFolderOwnershipType   # USER | GROUP
  }
  ownership: VFolderOwnershipInfo {
    user, project, creator, userId, projectId, creatorId, creatorEmail
  }
}
```

### 필드 매핑

| 기존 `VirtualFolderNode`                     | 신규 `VFolder`                                            | 비고                                                                                                                                                                                                                     |
| -------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`, `host`                                 | `id`, `host`                                              | 동일                                                                                                                                                                                                                     |
| `status: String`                             | `status: VFolderOperationStatus!`                         | String → enum (`ready` → `READY` 등)                                                                                                                                                                                     |
| `unmanaged_path`                             | `unmanagedPath`                                           |                                                                                                                                                                                                                          |
| `name`                                       | `metadata.name`                                           |                                                                                                                                                                                                                          |
| `usage_mode: String`                         | `metadata.usageMode: VFolderUsageMode!`                   | String → enum                                                                                                                                                                                                            |
| `quota_scope_id`                             | `metadata.quotaScopeId`                                   |                                                                                                                                                                                                                          |
| `created_at`                                 | `metadata.createdAt`                                      |                                                                                                                                                                                                                          |
| `last_used`                                  | `metadata.lastUsed`                                       |                                                                                                                                                                                                                          |
| `cloneable`                                  | `metadata.cloneable`                                      |                                                                                                                                                                                                                          |
| `permissions: [VFolderPermissionValueField]` | `accessControl.permission: VFolderMountPermission`        | 기존엔 배열에서 `mount_rw` 포함 여부로 RO/RW 판단 (`VFolderPermissionCell.tsx:51`). 신규는 단일 enum으로 대체. 삭제 권한 판단(`delete_vfolder` 포함 여부, `VFolderNodes.tsx:108`)은 `permission === 'RW_DELETE'` 로 대체 |
| `ownership_type: String`                     | `accessControl.ownershipType: VFolderOwnershipType`       | `user` → `USER`, `group` → `GROUP`                                                                                                                                                                                       |
| `user: UUID`                                 | `ownership.userId`                                        |                                                                                                                                                                                                                          |
| `user_email`                                 | `ownership.creatorEmail` 또는 `ownership.user { email }`  | 엄밀히는 creator 이메일. owner 이메일이 필요하면 node resolver 사용                                                                                                                                                      |
| `group: UUID`                                | `ownership.projectId`                                     | group → project 네이밍 변경                                                                                                                                                                                              |
| `group_name`                                 | `ownership.project { name }`                              | node resolver 사용                                                                                                                                                                                                       |
| `creator`                                    | `ownership.creator { ... }` 또는 `ownership.creatorEmail` |                                                                                                                                                                                                                          |
| `row_id`                                     | —                                                         | 신규 타입에 없음. 기존 `toLocalId` 파싱 로직 재검토                                                                                                                                                                      |

### ⚠ 신규 타입에 없는 필드 (Phase 1 이후 TODO)

다음 필드들은 신규 `VFolder` / `VFolderMetadataInfo` 에 존재하지 않음. 모두 현재 `VFolderNodes.tsx`의 **숨김(default hidden) 컬럼**으로 단순 표시 용도이므로, Phase 1에서는 **해당 컬럼을 임시 제거**하고 TODO 로 남긴 뒤, 백엔드에 필드 추가를 요청해 Phase 2 이후 복원.

| 사라진 필드 | 기존 용도         | 위치                   |
| ----------- | ----------------- | ---------------------- |
| `num_files` | 파일 수 컬럼      | `VFolderNodes.tsx:474` |
| `cur_size`  | 현재 사용량 컬럼  | `VFolderNodes.tsx:483` |
| `max_files` | 최대 파일 수 컬럼 | `VFolderNodes.tsx:492` |
| `max_size`  | 최대 크기 컬럼    | `VFolderNodes.tsx:501` |

> TODO(backend): 위 4개 필드를 `VFolderMetadataInfo` 또는 별도 타입에 추가 요청. 추가되면 숨김 컬럼 복원.

### 파급 효과 (Phase 1 내 작업 범위)

`VFolderNodeListPage` / `AdminVFolderNodeListPage` 에서 사용하는 fragment 체인 전체가 `VFolder` 타입 기반으로 재작성되어야 함:

- `VFolderNodesFragment` (`VFolderNodes.tsx:227`) → 재작성
- `DeleteVFolderModalFragment` (`DeleteVFolderModal.tsx:43`)
- `RestoreVFolderModalFragment` (`RestoreVFolderModal.tsx:41`)
- `SharedFolderPermissionInfoModalFragment` (`SharedFolderPermissionInfoModal.tsx:53`)
- `VFolderPermissionCellFragment` (`VFolderPermissionCell.tsx:27`)
- `VFolderNodeIdenticonFragment`, `EditableVFolderNameFragment`, `BAIVFolderDeleteButtonFragment`, `BAINodeNotificationItemFragment` — 리스트 쿼리에 spread되는 다른 fragment도 타입 호환 확인 필요

테이블 렌더링/로직 수정:

- `VFolderNodes.tsx`의 컬럼 `render` — nested 필드 접근 (`vfolder.metadata.name` 등)
- `statusTagColor` 키를 `VFolderOperationStatus` enum 값(UPPER_CASE: `READY`, `DELETE_PENDING` …)으로 맞춤
- `availableVFolderSorterKeys` 재정의 — 기존 문자열 → `VFolderOrderBy` 입력 타입 기반

## 4. 필터/정렬 — `BAIGraphQLPropertyFilter` 활용

- 위치: `packages/backend.ai-ui/src/components/BAIGraphQLPropertyFilter.tsx`
- 이미 `StringFilter`, `IntFilter`, `UUIDFilter`, `DateTimeFilter` 등 스키마 호환 타입을 export. typed filter 입력 UI 지원.
- 기존 사용처: `RoleAssignmentTab`, `RolePermissionTab`, `FairShareList`, `SessionSchedulingHistoryModal`, `MyKeypairManagementModal`, `ProjectAdminUsersPage`, `EndpointDetailPage`, `ReservoirPage`, `RBACManagementPage`, `ModelStoreListPageV2`, `AdminModelCardListPage` 등 — 레퍼런스 충분

### `VFolderFilter` 스키마 (`schema.graphql:18804`)

```graphql
input VFolderFilter {
  name: StringFilter
  host: StringFilter
  status: VFolderOperationStatusFilter
  usageMode: VFolderUsageModeFilter
  cloneable: Boolean
  createdAt: DateTimeFilter
  AND: [VFolderFilter!]
  OR: [VFolderFilter!]
  NOT: [VFolderFilter!]
}
```

→ 기존 `filter: String` / `order: String` 쿼리 파라미터를 `BAIGraphQLPropertyFilter` 기반 typed 입력으로 전환.

### 4-1. Usage Mode 프리셋 필터 재작성 (`VFolderNodeListPage.tsx:152-166`)

현재 `getUsageModeFilter(mode)` 는 ILIKE 구문을 문자열로 조립. 신규 `VFolderFilter` + `StringFilter` + `VFolderUsageModeFilter` 로 모두 표현 가능함을 확인:

- `StringFilter` (`schema.graphql:16275`): `startsWith`, `notStartsWith`, `iStartsWith` 등 전부 지원
- `VFolderUsageMode` enum: `GENERAL | MODEL | DATA`
- `VFolderUsageModeFilter`: `in` / `notIn`

| 모드                                           | 기존 ILIKE 식                                     | 신규 `VFolderFilter`                                                                    |
| ---------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `all`                                          | —                                                 | `undefined`                                                                             |
| `automount`                                    | `name ilike ".%"`                                 | `{ name: { startsWith: "." } }`                                                         |
| `general`                                      | `(! name ilike ".%") & (usage_mode == "general")` | `{ AND: [{ NOT: [{ name: { startsWith: "." } }] }, { usageMode: { in: [GENERAL] } }] }` |
| `pipeline` (feature flag: `fasttrackEndpoint`) | `usage_mode == "data"`                            | `{ usageMode: { in: [DATA] } }`                                                         |
| `model` (feature flag: `enableModelFolders`)   | `usage_mode == "model"`                           | `{ usageMode: { in: [MODEL] } }`                                                        |

- 프리셋 필터와 사용자가 `BAIGraphQLPropertyFilter` 로 입력한 필터는 최상위 `AND: [...]` 로 합성. 기존 `mergeFilterValues(...)` 대체.
- 탭 카운트용 status 프리셋(`FILTER_BY_STATUS_CATEGORY`) 도 같은 방식으로 `VFolderOperationStatusFilter.in` 기반 객체 리터럴로 재작성.

## 5. 탭 카운트 (active/deleted)

현재 두 페이지 모두 `vfolder_nodes` 를 3번(`vfolder_nodes`, `active`, `deleted`) alias로 호출해 탭 배지 숫자를 구함. 신규 구조에서도 동일 패턴으로 `myVfolders` / `adminVfoldersV2` 를 `VFolderOperationStatusFilter` 로 3번 호출해 해결 가능.

- **확인 필요**: `VFolderConnection` 에 count-only 혹은 aggregate 엔드포인트 지원 여부 (없으면 기존 alias 전략 유지)

## 6. 행 액션 관련 Mutation — V2 전환 가능성

`/data` / `/admin-data` 페이지의 행 액션(휴지통 이동, 영구 삭제, 복원)은 현재 모두 REST 기반이지만, 일부는 V2 mutation이 이미 존재함. 스키마 전수조사 결과:

| 기능                                  | V2 mutation                                      | 현재 REST                                                                                                                                                                                                       | 상태                                   |
| ------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 휴지통 이동 (soft delete) — 단건      | `deleteVfolderV2(vfolderId)`                     | `baiClient.vfolder.delete_by_id()` (`VFolderNodes.tsx:260`)                                                                                                                                                     | ✅ 전환 가능                           |
| 영구 삭제 (purge) — 단건              | `purgeVfolderV2(vfolderId)`                      | `baiClient.vfolder.delete_from_trash_bin()` (`VFolderNodes.tsx:272`)                                                                                                                                            | ✅ 전환 가능                           |
| 휴지통 이동 — 벌크                    | `bulkDeleteVfoldersV2(input: { ids: [UUID!]! })` | `DeleteVFolderModal` 에서 `delete_by_id` 를 `Promise.allSettled` 로 반복 호출 (`DeleteVFolderModal.tsx:74-80`)                                                                                                  | ✅ 단발 mutation 으로 단순화 가능      |
| 영구 삭제 — 벌크                      | `bulkPurgeVfoldersV2(input: { ids: [UUID!]! })`  | (벌크 purge 별도 UI 없음, 단건 영구 삭제만)                                                                                                                                                                     | ➕ 추후 벌크 영구 삭제 UX 도입 시 활용 |
| **복원 (trash → active) — 단건/벌크** | ❌ **없음**                                      | 단건: `baiClient.vfolder.restore_from_trash_bin()` (`VFolderNodes.tsx:266`)<br>벌크: `RestoreVFolderModal` 에서 `restore_from_trash_bin` 을 `Promise.allSettled` 로 반복 호출 (`RestoreVFolderModal.tsx:64-73`) | ⚠ REST 유지 (단건/벌크 모두)           |

### 벌크 삭제 동작 세부사항 (`DeleteVFolderModal`)

- `DeleteVFolderModalFragment` 에서 `permissions` 배열을 조회해, `delete_vfolder` 포함 여부로 `deletable` / `undeletable` 를 그룹핑 (`DeleteVFolderModal.tsx:59-64`)
- `undeletable` 폴더는 실행 전 경고 영역에 리스트로 노출
- V2 전환 시 이 분기는 `accessControl.permission === 'RW_DELETE'` 기반으로 재작성 필요 (§3 필드 매핑 참조)

### `VFolder` 정보/상태 변경 mutation 부재

스키마 전수조사 결과, `updateVfolderV2` / `modifyVfolderV2` / `restoreVfolderV2` 뿐만 아니라 **`VFolder`의 status/info를 변경할 수 있는 mutation 자체가 존재하지 않음**. 즉 "update mutation으로 status 를 `READY` 로 되돌리는" 우회 경로도 불가능.

### Phase 1 방침

- **복원은 REST (`restore_from_trash_bin`) 유지** — 기능 손실을 피하면서 나머지 삭제 흐름만 V2 전환. 혼재는 감수.
- Phase 1에서 mutation 전환을 스코프에 포함할지, 아니면 쿼리 마이그레이션만 먼저 끝내고 mutation 전환은 별도로 묶을지는 작업량 보며 결정.
- TODO(backend): `restoreVfolderV2` (또는 동등한 status 변경 mutation) 추가 여부 문의. 추가되면 Phase 2에서 REST 제거.

## 7. Phase 1 작업 항목 (요약)

1. `VFolderNodeListPageQuery` → `myVfolders` 기반으로 재작성 (+ 필요 시 `projectVfolders` 병합)
2. `AdminVFolderNodeListPageQuery` → `adminVfoldersV2` 기반으로 재작성
3. `VFolderNodes` 및 하위 Fragment 체인을 `VFolder` 타입에 맞춰 재작성
4. 필터/정렬 UI를 `BAIGraphQLPropertyFilter` + `VFolderFilter` / `VFolderOrderBy` 로 전환
5. 탭 카운트 쿼리 전략 결정 (alias 3회 유지 or aggregate 대체)
6. `myVfolders`의 "accessible" 범위 실측 검증 후 프로젝트/공유 폴더 조합 전략 확정
7. 행 액션 mutation 전환: `deleteVfolderV2` / `purgeVfolderV2` (+ 선택적으로 `bulkDeleteVfoldersV2` / `bulkPurgeVfoldersV2`). 복원은 REST 유지.
8. 숨김 컬럼(`num_files`/`cur_size`/`max_files`/`max_size`) 임시 제거 + `FIXME` 주석

### 구현 규칙 — 백엔드 확인/수정 대기 항목 처리

Phase 1 구현 중 백엔드 추가 작업이 필요한 항목은 **기존 로직을 그대로 유지**하고 코드에 `FIXME` 코멘트를 남긴다. 스코프를 흐리는 선제 대응(더미 필드, 가짜 상태 변환 등)은 하지 않는다.

구체적인 `FIXME` 대상:

- **복원 기능** — `baiClient.vfolder.restore_from_trash_bin()` 호출을 그대로 유지
  - `FIXME(FR-2573): restoreVfolderV2 mutation 추가 후 V2로 전환` 주석을 호출부(`VFolderNodes.tsx:266`)에 남김
- **숨김 컬럼 4종** (`num_files`, `cur_size`, `max_files`, `max_size`) — 컬럼 정의를 즉시 제거하지 말고, 데이터 소스만 `undefined`/`null`로 바꿔 렌더가 `-` 로 떨어지게 한 뒤 컬럼 자체는 남긴다
  - `FIXME(FR-2573): VFolderMetadataInfo에 해당 필드 추가 요청 후 복원` 주석을 각 컬럼 정의 바로 위에 남김
- 기타 구현 중 발견되는 "V2 스키마에 없지만 기존 동작 유지가 필요한" 지점에도 동일한 `FIXME(FR-2573): ...` 형식 사용

## 8. Phase 1 스코프 밖 (Phase 2 이후)

Phase 1 종료 후 다시 조사 및 계획 수립 예정.

- `vfolder_node` (단건) 사용처: `FolderExplorerModal`, `VFolderNodeDescription`, `EditableVFolderName`, `VFolderLazyView`
- 다른 `vfolder_nodes` 사용처: `VFolderMountFormItem` (세션/서비스 마운트 선택), `MountedVFolderLinks`, `SessionDetailContent`
- Legacy 화면: `LegacyModelStoreListPage`, `LegacyModelCardModal`, `LegacyModelTryContentButton`
- REST 기반 폴더 CRUD / 공유·초대 / 파일 업다운로드 → GraphQL mutation 전환 가능성 (복원 mutation 추가되면 함께 반영)
- 백엔드에 요청할 신규 필드/mutation (`num_files`/`cur_size`/`max_files`/`max_size`, `restoreVfolderV2`) 반영
- `StorageStatusPanelCard`, `QuotaPerStorageVolumePanelCard` 쿼리 합치기 (TODO 주석 존재)

<!-- TODO: Phase 1 진행하면서 확정된 사항을 이 아래에 업데이트 -->
