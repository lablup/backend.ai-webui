# 0040 — One auto-mount per folder

## Summary

> 낯선 용어는 문서 맨 아래 [용어](#용어)에 모아 두었다.

- manager는 [auto-mount](#용어)를 한 [scope](#용어), 즉 사용자나 프로젝트 하나에 붙는 설정으로 저장한다. manager는 같은 scope에 같은 폴더의 살아 있는 auto-mount를 두 번째로 만드는 것을 거부하지만, 같은 폴더를 여러 scope에 거는 것은 받아들인다.
- WebUI는 폴더를 소유한 scope에만 auto-mount를 설정한다. 사용자 소유 폴더는 개인 프로젝트에서 그 소유자에게 auto-mount된다. 프로젝트 폴더는 프로젝트 어드민이 그 프로젝트에 auto-mount한다.
- 이 규칙 때문에 WebUI는 폴더 하나에 auto-mount가 최대 하나라고 보고, 폴더의 auto-mount를 읽는 모든 곳은 행 하나만 요청한다.
- **Out of scope**: 다른 client가 폴더를 소유하지 않은 scope에 설정한 auto-mount. WebUI는 이를 보여주거나 관리하지 않는다.

## Context

- **Manager model**: 26.10부터 manager는 auto-mount를 `vfolder_auto_mounts` 테이블에 scope와 폴더당 한 행으로 저장한다. unique index `uq_vfolder_auto_mounts_live_vfolder`는 삭제되지 않은 행의 `scope_type`, `scope_id`, `vfolder_id`를 묶고, `uq_vfolder_auto_mounts_live_destination`은 `scope_type`, `scope_id`, `mount_destination`을 묶는다.
- **No owner check in the manager**: `createVfolderAutoMount`는 어떤 scope와 폴더든 받는다. manager의 어떤 코드도 scope가 그 폴더를 소유하는지 검사하지 않는다.
- **One read path**: 폴더 목록과 폴더 탐색기는 모두 `VFolderNodesV2AutoMountCellFragment`로 폴더 자신의 `VFolder.vfolderAutoMounts`를 읽는다. 한 폴더가 여러 scope에 걸려 있으면 이 connection은 여러 행을 돌려준다.

## 설계도

```mermaid
flowchart LR
  subgraph owner["폴더 소유"]
    userFolder["사용자 소유 폴더"]
    projectFolder["프로젝트 폴더"]
  end
  subgraph set["WebUI가 설정하는 곳"]
    personal["개인 프로젝트<br/>FolderCreateModal, 탐색기"]
    admin["프로젝트 어드민<br/>FolderCreateModal, 탐색기"]
  end
  subgraph manager["Manager"]
    userScope["소유자의 USER scope"]
    projectScope["폴더가 속한 프로젝트의 PROJECT scope"]
  end
  subgraph read["WebUI 읽기"]
    list["VFolderNodesV2<br/>vfolderAutoMounts limit 1"]
    explorer["VFolderAutoMountMetadataSection<br/>vfolderAutoMounts limit 1"]
  end
  userFolder -- "소유자가 설정" --> personal
  projectFolder -- "어드민이 설정" --> admin
  personal -- "createVfolderAutoMount scope USER" --> userScope
  admin -- "createVfolderAutoMount scope PROJECT" --> projectScope
  userScope -- "폴더당 한 행" --> list
  projectScope -- "폴더당 한 행" --> list
  userScope -- "목록과 같은 fragment" --> explorer
  projectScope -- "목록과 같은 fragment" --> explorer
```

## Decision

### 1. 소유 scope만이 유일한 scope다

- **Scope choice**: auto-mount를 만드는 WebUI의 모든 경로는 폴더 소유자로부터 scope를 정한다. `accessControl.ownershipType`이 `USER`인 폴더는 `ownership.userId`의 `USER` scope를 받는다. `ownership.project.basicInfo.type`이 `PERSONAL`인 프로젝트 소유 폴더는 누가 열든 그 프로젝트의 유일한 사용자인 `ownership.creatorId`의 `USER` scope를 받는다. 그 밖의 폴더는 `ownership.projectId`의 `PROJECT` scope를 받는다.
- **Revision model folder**: `DeploymentAddRevisionModal`은 배포 프로젝트(`metadata.projectV2.basicInfo.type`)가 `PERSONAL`이면 배포의 `creator`와 함께 `USER`를, 아니면 `PROJECT`를 넘긴다. 그래서 슈퍼어드민이 다른 사용자의 개인 프로젝트 배포에 리비전을 추가할 때 새 폴더는 그 주인에게 auto-mount되고, 이때 `FolderCreateModal`도 같은 다른 사용자 경고를 보여준다.
- **Another user's scope**: `USER` scope가 호출한 사람 자신의 것이 아닐 때(슈퍼어드민이 다른 사용자의 폴더를 다룰 때), `VFolderAutoMountSettingModal`은 그 사용자의 auto-mount로 지정된다는 경고를 `ownership.creatorEmail`로 이름을 밝혀 보여준다.
- **Creation paths**: `FolderCreateModal`은 개인 프로젝트에서도 항상 `createVFolderInProject`로 프로젝트 폴더를 만든다. 개인 프로젝트에서는 그 폴더를 사용자에게 auto-mount하고, 다른 프로젝트에서는 그 프로젝트에 auto-mount한다. 두 component 모두 scope를 스스로 정하지 않는다. `FolderCreateModal`을 여는 쪽이 `autoMountScopeType`을 넘기고(대상이 자기 개인 프로젝트면 `USER`, 기본값은 `PROJECT`), `VFolderAutoMountMetadataSection`은 폴더에 대한 자기 fragment로 scope를 정한다.
- **Folder entry points**: auto-mount는 폴더에서만 추가한다. `FolderCreateModal`과 폴더 탐색기의 `VFolderAutoMountMetadataSection`이 그곳이다. `VFolderAutoMountSettingModal`은 항상 그 폴더를 받고, 폴더 선택 박스를 보여주지 않는다.

### 2. 읽을 때는 폴더당 한 행

| Component                         | Query                                                                    | Limit      |
| --------------------------------- | ------------------------------------------------------------------------ | ---------- |
| `VFolderNodesV2`                  | 각 `VFolder` 행의 `vfolderAutoMounts`                                    | `limit: 1` |
| `VFolderAutoMountMetadataSection` | 탐색기의 폴더 쿼리에 spread한 같은 `VFolderNodesV2AutoMountCellFragment` | `limit: 1` |

- **Single value**: 폴더 목록 셀과 탐색기 섹션은 첫 행을 그 폴더의 auto-mount 설정으로 그린다.
- **Explorer actions**: 탐색기 섹션은 행이 없으면 추가를, 있으면 수정이나 삭제를 보여준다. 같은 폴더에 두 번째 추가는 보여주지 않는다.

### 3. 권한은 표시가 아니라 동작을 막는다

- **Display**: `VFolderAutoMountMetadataSection`은 폴더 목록과 똑같이 `VFolderNodesV2AutoMountCellFragment`가 돌려준 것을 보여준다. 권한 확인은 표시를 가리지 않는다.
- **Action permissions**: 수정과 삭제는 기존 행의 `scopeType`/`scopeId`에서 `UPDATE`와 `SOFT_DELETE`를 확인하고, 추가는 1절의 scope에서 `CREATE`를 확인한다. 둘 다 `entityType: "vfolder_auto_mount"`로 `myScopePermissions`를 읽는다.
- **Missing permission**: 호출한 사람이 할 수 없는 동작은 숨기지 않고 비활성으로 두며, 권한이 부족하다는 tooltip을 붙인다(`BAINameActionCell`의 `disabled: { reason }`). `ownership.project`를 읽지 못해 scope를 정할 수 없을 때도 추가를 같은 방식으로 비활성으로 둔다.
- **V2 fields only**: 프로젝트 타입은 `vfolderV2.ownership.project`에서 읽고, 섹션 자기 fragment에서 `@catch(to: NULL)`로 받는다. 그래서 공유받은 사람이 프로젝트를 읽지 못해도 탐색기의 폴더 노드는 실패하지 않는다(#10647). 레거시 `group_node`는 쓰지 않는다.

## 대안과 기각 사유

- **Several auto-mounts per folder**: WebUI가 폴더가 걸린 모든 scope를 나열하고 더 추가하게 할 수 있다. manager 상태를 전부 보여준다는 장점이 있지만, WebUI는 그런 폴더를 만들지 않고 그 목록은 다른 client만 만들 수 있는 상태를 위한 UI가 되므로 기각한다.
- **Manager-side uniqueness per folder**: `vfolder_id` 하나에 unique index를 두면 모든 client에서 규칙이 지켜진다. index는 manager의 몫이므로 WebUI에서는 기각한다. WebUI는 manager의 scope별 모델을 따르고, 자기 생성 경로에서 규칙을 지킨다.

## Consequences

- **Fewer rows**: 폴더 목록은 connection 전체 대신 행마다 auto-mount 하나만 manager에 요청한다.
- **Hidden extra rows**: 다른 client가 두 번째 scope에 건 폴더는 폴더 목록에서 auto-mount 하나만 보이고, 탐색기는 소유 scope의 행만 보여준다.
- **Rule location**: 이 규칙은 WebUI의 모든 생성 경로가 소유자로부터 scope를 정할 때만 성립한다. 사용자가 scope를 고르게 하는 새 경로는 이 ADR을 다시 검토해야 한다.

## 출처

- #10529 — auto-mount 폴더 표시와 설정.
- Manager migration `456a338e7c3a_add_vfolder_auto_mounts.py` (lablup/backend.ai, 26.10.0a9) — 두 unique index.
- Manager change BA-8682 (lablup/backend.ai#16212) — `VFolder.vfolderAutoMounts`.
- 2026-11-16 결정.

## 용어

| 용어       | 뜻                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| auto-mount | manager가 한 scope가 만드는 모든 세션에 폴더를 정해진 위치와 권한으로 마운트하게 하는 설정이다.                     |
| scope      | auto-mount가 걸리는 사용자나 프로젝트이며, GraphQL API에서는 `scopeType`(`USER` 또는 `PROJECT`)과 `scopeId`로 쓴다. |
