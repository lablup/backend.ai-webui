# Mutation 이후 refetch 패턴 정리

> **Epic**: FR-3170
> **Spec Task**: FR-3372
> **Status**: Draft
> **Date**: 2026-07-25

## 개요

Setting modal 계열이 create/update를 한 컴포넌트에서 분기하면서 두 경우 모두 `onRequestClose(true)`로 보고하고, 호출부는 `if (success) updateFetchKey()`로 목록 전체를 다시 조회합니다. 단순 필드 수정에도 목록 쿼리가 재실행되어 Relay 정규화 캐시를 쓰는 의미가 사라집니다.

이 문서는 무엇이 잘못되어 있는지를 분류하고, 각 분류별 수정 방침과 작업 단위를 정의합니다.

## 문제 정의

**의미론 문제.** `onRequestClose(success: boolean)`의 `success`는 "해당 mutation이 성공했다"는 뜻입니다. 그런데 refetch를 막기 위해 update 성공 시 `false`를 넘기는 우회가 이미 코드에 들어와 있습니다. `false`는 이미 "사용자가 취소함"을 뜻하므로, 호출부는 **취소와 성공을 구분할 수 없게** 됩니다. 나중에 "성공 시 토스트" 같은 동작을 호출부에 추가하면 update에서만 조용히 동작하지 않습니다.

**책임 위치 문제.** create/update 구분은 콜백으로 전달할 필요가 없습니다. 호출부는 이미 그 정보를 가지고 있습니다 — 인스턴스를 둘로 나눠 렌더링하거나(`AdminUserManagement`), 단일 인스턴스라도 `editingX` 상태가 핸들러 클로저에 들어와 있습니다(`ResourcePresetList`, `KeypairResourcePolicyList` 등). 즉 prop 시그니처를 바꾸지 않고도 호출부에서 판단할 수 있습니다.

**payload 문제.** update mutation이 변경된 필드를 반환하지 않으면 store를 갱신할 방법이 없어 refetch가 실제로 load-bearing해집니다. 스키마상으로는 update 계열 payload 50개 중 **41개가 이미 노드를 반환**하는데, 프론트가 selection set을 비워두고 있습니다.

**문서 문제.** `react-modal-drawer` 스킬이 `if (result) updateFetchKey(); // success path`를 close 콜백 규약으로 기술하고 있었고, `react-suspense-fetching`·`react-async-actions`도 update/create 구분 없이 `updateFetchKey()`를 예시로 제시했습니다. 사람과 에이전트 모두 문서대로 이 패턴을 재생산해 왔습니다.

## 잘못되어 있는 부분

아래 수치는 현재 트리를 스크립트로 집계하고, 개별 사례는 파일을 직접 열어 확인한 것입니다.

### A. `success`의 의미를 훼손한 우회 — 최우선

| 위치                       | 내용                                                |
| -------------------------- | --------------------------------------------------- |
| `UserSettingModal.tsx:468` | update 성공 시 `onRequestClose(false)`              |
| `UserSettingModal.tsx:523` | keypair 없는 create 성공 시 `onRequestClose(false)` |
| `UserSettingModal.tsx:554` | 취소 시 `onRequestClose(false)` — 위 둘과 구분 불가 |

prop 선언은 `onRequestClose: (success: boolean) => void`입니다. 성공을 `false`로 보고하는 것은 계약 위반이며, refetch 억제를 위한 우회입니다.

### B. payload에 `id` 누락 — 네트워크 비용만 지불

| 위치                                       | 내용                                                       |
| ------------------------------------------ | ---------------------------------------------------------- |
| `AutoScalingRuleEditorModalLegacy.tsx:136` | `rule { metric_name … }` 8개 필드를 반환하면서 `id` 미선택 |

Relay는 노드 id로 정규화 레코드를 식별하므로, `id` 없는 payload는 분리된 레코드에 기록되고 병합되지 않습니다. 데이터를 받아오고도 UI를 갱신하지 못합니다.

### C. 부분 커버리지 — refetch도 없고 store 갱신도 없음

| 위치                   | 내용                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `UserSettingModal.tsx` | `groupIds`를 전송(`:448`)하고 fragment는 `projects`를 읽는데(`:213`) payload가 `projects` 미선택. update 경로는 refetch도 생략 |

사용자의 프로젝트 소속을 변경하면 서버에는 반영되지만 UI는 이전 값을 계속 보여줍니다. **A/B보다 위험한 형태**로, refetch를 제거할 때 가장 흔히 발생할 수 있는 실패 모드입니다.

> D 분류에서 `UserSettingModal`은 `OK`로 잡힙니다. 축이 다르기 때문입니다 — D는 **테이블(뷰) fragment** 커버리지만 보고, 여기 C는 **모달 자신의 fragment**가 읽는 `projects`를 봅니다. 즉 목록은 최신인데 모달을 다시 열면 옛 값이 보이는 형태입니다. 두 축 모두 확인해야 합니다.

### D. update mutation의 payload 커버리지 — 35건 전수 분류

판정 기준은 **"테이블(뷰)이 fragment로 읽는 필드를, 같은 타입을 수정하는 mutation이 반환하는가"** 입니다. 스키마의 payload 타입 → 노드 타입 → 해당 타입의 뷰 소유 fragment를 스크립트로 대조했습니다(fragment spread는 재귀 전개).

| 분류                | 건수 | 의미                                                | 조치                               |
| ------------------- | ---- | --------------------------------------------------- | ---------------------------------- |
| `NO_NODE`           | 10   | payload에 노드 필드 자체가 없음 (레거시 `ok`/`msg`) | 후속 mutation 이관 또는 `updater:` |
| `NODE_NOT_SELECTED` | 5    | payload는 노드를 줄 수 있는데 selection에 없음      | selection set만 채우면 됨          |
| `GAP`               | 13   | 노드는 선택했으나 뷰가 읽는 필드 일부 누락          | 필드 보강 후 refetch 제거          |
| `OK`                | 7    | 뷰 fragment를 모두 커버                             | refetch 즉시 제거 가능             |

**`NO_NODE` (10) — 범위 밖.** `modify_keypair_resource_policy`, `modify_project_resource_policy`, `modify_user_resource_policy`, `modify_scaling_group`(2곳), `modify_keypair`(2곳), `modify_image`(2곳), `modify_agent`. payload가 데이터를 주지 않아 프론트에서 풀 방법이 없으므로 **refetch를 유지**합니다. 앞 4종은 노드 반환 후속이 스키마에 있지만(`UpdateKeypairResourcePolicyPayload` 등) 백엔드 버전 호환이 얽혀 이번 범위에서 제외했습니다. `modify_agent`는 이미 `updater:`로 보완되어 **정상**입니다.

**`NODE_NOT_SELECTED` (5)** — `modify_group`(`BAIProjectBulkEditModal`, `ProjectStoragePermissionTable`, `ProjectPage`), `modify_domain`(`ContainerRegistryList`, `DomainStoragePermissionTable`). 프론트만 고치면 되는 가장 싼 건들입니다.

**`OK` (7)** — `UserSettingModal`, `UserProfileSettingModal`, `UserResourcePolicyV2SettingModal`, `MyKeypairManagementModal`, `ContainerRegistryEditorModal`, `BAIProjectSettingModal`, `BAIHuggingFaceRegistrySettingModal`.

#### D-1. 실질 위험 — 뷰가 읽고, input이 바꿀 수 있는데, 반환하지 않는 필드

`GAP` 13건 중 **mutation input에 존재하는 필드**만으로 좁히면 7건이 남습니다. 이 중 파일을 직접 열어 확인한 확정 건은 다음과 같습니다.

| 위치                                       | mutation 반환               | 뷰가 읽는 누락 필드                                                                                                                     |
| ------------------------------------------ | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `AdminUserManagement.tsx:189`              | `user { id }`               | `BAIAdminUserV2Table`이 `status.status` 등 14개. **이 mutation이 바로 상태 토글**이라 바꾼 값 자체가 안 돌아옴                          |
| `DeploymentSettingModal.tsx:103`           | `deployment { id }`         | `BAIModelDeploymentNodes`·`DeploymentBasicInfoCard` 등 8개 fragment가 `metadata.name`, `metadata.tags`, `networkAccess.openToPublic` 등 |
| `AutoScalingRuleEditorModalLegacy.tsx:136` | `rule { …8개 }` (`id` 없음) | 병합 자체가 불가 — B 항목과 동일 건                                                                                                     |
| `ResourceGroupFairShareSettingModal.tsx`   | `resourceGroup { id name }` | `ResourceGroupFairShareTable`이 편집 대상인 `fairShareSpec.*` 4개                                                                       |
| `AdminDeploymentPresetSettingPage.tsx`     | 일부 spread + `id name`     | `AdminDeploymentPresetNodes` 등이 `cluster.*`, `deploymentDefaults.*`, `execution.*` 등 13~15개                                         |

**분석 한계.** 위 판정은 mutation 타입의 input 필드 기준이라 **호출부가 실제로 무엇을 보내는지까지는 보지 않습니다**. 예로 `RBACManagementPage.tsx:145`의 `adminUpdateRole`은 `id status`만 선택하는데 input 타입상 `name`/`description`도 바꿀 수 있어 후보로 잡혔지만, 실제로는 상태 토글 전용이라 **정상**입니다. 착수 전 건별로 폼이 실제 편집하는 필드를 확인해야 합니다.

### E. refetch 호출부 — `react/src` 전수 149곳 분류

`update*FetchKey(...)` 호출은 총 **149곳**입니다. 두 계층으로 나눠 전수 분류했습니다.

| 계층                              | 건수    | 위반 후보 |
| --------------------------------- | ------- | --------- |
| 인라인 `onRequestClose` 핸들러    | 33      | 17        |
| 그 외 전부 (명명 핸들러 5건 포함) | 116     | 16        |
| **합계**                          | **149** | **33**    |

위반 후보를 뺀 나머지는 정당한 refetch이며, 두 계층을 합쳐 수동 새로고침 버튼 39곳, 삭제 16곳, 대량 작업 6곳, 폴링 2곳, 필터·탭·업로드 완료 등 이벤트 7곳이 그 대부분입니다. (표의 "그 외 전부" 116과 숫자가 겹치지만 다른 집합입니다.)

위반 33건은 **상한**입니다. 아래 각 항의 확정 건과 한계 조건을 함께 보고 건별로 판단해야 합니다.

#### E-1. `onRequestClose` 계층 — 위반 후보 17곳

**단일 인스턴스가 create/update를 겸하는 곳** (`open={!!editingX || isCreating}`):
`ResourcePresetList.tsx:239`, `KeypairResourcePolicyList.tsx:390`, `UserResourcePolicyList.tsx:268`, `ProjectResourcePolicyList.tsx:267`, `ResourceGroupList.tsx:465`, `AdminUserCredentialList.tsx:552`, `PrometheusPresetTab.tsx:205`, `AdminModelCardListPage.tsx:456`, `DeploymentListPage.tsx:416`, `AdminDeploymentListPage.tsx:461`, `ProjectAdminDeploymentsPage.tsx:418`, `AutoScalingRuleListLegacy.tsx:285`

**update 전용인데도 목록 전체를 재조회**: `DeploymentBasicInfoCard.tsx:401`, `ImageList.tsx:511`·`:522`, `FairShareList.tsx:873`, `AdminUserManagement.tsx:614`

#### E-2. 그 외 계층 — 위반 16곳, 대부분 **행 단위 토글**

목록의 한 행을 활성/비활성으로 바꾸면서 목록 전체를 재조회하는 형태가 지배적입니다.

| 위치                                      | 내용                                                       |
| ----------------------------------------- | ---------------------------------------------------------- |
| `ResourceGroupList.tsx:227`               | `modify_scaling_group(is_active)` 토글, payload `ok`/`msg` |
| `AdminUserCredentialList.tsx:340`·`:390`  | `modify_keypair(is_active)` 토글, payload `ok`/`msg`       |
| `ContainerRegistryList.tsx:390`           | 행 `<Switch>` → `modify_domain`, payload `ok`/`msg`        |
| `ContainerRegistryList.tsx:520`           | `onOk('create'\|'modify')`를 받고도 양쪽 모두 refetch      |
| `AdminUserManagement.tsx:255`             | 상태 토글인데 `user { id }`만 반환 (D-1과 동일 건)         |
| `ProjectPage.tsx:294`·`:337`              | 프로젝트 활성/비활성 토글, payload `ok`/`msg`              |
| `ProjectPage.tsx:630`                     | `BAIProjectSettingModal onOk` — create/edit 양쪽 refetch   |
| `MyKeypairManagementModal.tsx:299`·`:315` | `updateMyKeypair` payload에 **`id` 누락**으로 병합 불가    |
| `RBACManagementPage.tsx:181`              | 소프트 비활성인데 payload가 `status` 미포함                |
| `FairShareList.tsx:680`                   | `afterUpdate` 콜백 경유, 필드 전용 수정                    |
| `UserSettingModal.tsx:902`                | REST TOTP 제거 후 무관한 access-key 목록 재조회            |

#### E-3. 가장 싼 수정 — payload가 **이미** 변경 필드를 반환하는데도 refetch

둘 다 파일을 직접 열어 확인했습니다. mutation selection을 손댈 필요 없이 refetch 호출만 지우면 됩니다.

- **`RBACManagementPage.tsx:202`** — `adminUpdateRole`이 `{ id, status }`를 반환(`:145`)해 Relay가 이미 패치하는데 `updateFetchKey()`를 호출
- **`ReservoirArtifactDetailPage.tsx:329`** — `cancelImportArtifact`가 `artifactRevision { id status }`를 반환하는데 페이지 전체 재조회

**필터 연동 주의.** 토글 대상이 목록의 필터 조건인 경우(`MyKeypairManagementModal`의 `isActive` 필터, `ProjectPage`의 활성/비활성 탭, `ReservoirPage`의 availability 필터) store 패치만으로는 **행이 목록에서 빠지지 않습니다**. 이때는 refetch가 정당하며, 그 이유를 주석으로 남겨야 합니다.

### F. 문서가 anti-pattern을 규약으로 기술 — 본 PR에서 수정 완료

- `react-modal-drawer` — close 콜백 규약 예시 자체가 anti-pattern이었음
- `react-suspense-fetching` — mutation 예시에 create/update 구분 없음
- `react-async-actions` §6 — 계층은 옳았으나 update 예외를 명시하지 않음
- `relay-patterns` — mutation 관련 가이드 부재

## 요구사항

### Must Have

- [ ] `success`는 mutation 성공 여부를 그대로 전달한다. 성공을 `false`로 보고하는 우회를 제거한다
- [ ] refetch 여부는 호출부에서 판단한다. 호출부가 이미 가진 create/update 컨텍스트를 사용하며, prop 시그니처 변경을 기본으로 하지 않는다
- [ ] update mutation payload는 `id`와 UI가 읽는 변경 가능 필드를 모두 선택한다
- [ ] refetch를 제거하기 전 fragment가 읽는 필드와 payload가 반환하는 필드를 대조한다
- [ ] 남는 refetch에는 store로 갱신할 수 없는 이유를 주석으로 남긴다

### Should Have

- [ ] create는 가능한 경우 `@appendEdge`로 connection에 삽입한다. 서버 정렬에 의존하면 refetch를 유지하고 이유를 남긴다

## 수정 방침

호출부가 create/update를 아는 두 가지 형태가 있고, 둘 다 prop 변경이 필요 없습니다. 표준 형태는 `relay-mutation-store-updates` 스킬 §5에 있으며, 여기서는 방침과 구현 시 주의점만 정리합니다.

- **인스턴스 분리형** (`AdminUserManagement`) — edit 인스턴스는 refetch하지 않습니다.
- **단일 인스턴스형** (`ResourcePresetList` 등) — 편집 상태가 이미 핸들러 클로저에 있으므로 그대로 사용합니다.

단일 인스턴스형에서 유일한 함정은 **판단 시점**입니다. 상태 초기화보다 먼저 읽어야 합니다.

```tsx
const wasCreating = !editingResourcePreset; // setState 이전 클로저 값으로 먼저 확정
setEditingResourcePreset(null);
setIsCreating(false);
if (success && wasCreating) {
  /* refetch */
}
```

호출부가 정말로 알 수 없는 경우에만 결과를 풍부하게 만듭니다(`onOk('create' | 'modify')` 선례 존재). `success`에 거짓을 싣는 방식은 채택하지 않습니다.

## 작업 분해

의존성이 없어 병렬 진행이 가능하며, 1은 나머지의 참조 구현이 됩니다.

1. **죽은 refetch 제거 (E-3)** — `RBACManagementPage.tsx:202`, `ReservoirArtifactDetailPage.tsx:329`. payload가 이미 변경 필드를 반환하므로 호출 한 줄씩만 삭제. 가장 싸고 위험이 없어 먼저 머지
2. **한 줄 payload 버그 (B) 수정** — `AutoScalingRuleEditorModalLegacy`에 `id` 추가, `MyKeypairManagementModal`의 `updateMyKeypair`에 `id` 추가
3. **C 수정** — `UserSettingModal` payload에 `projects` 추가
4. **A 제거** — `UserSettingModal`의 `onRequestClose(false)` 우회를 걷어내고 호출부(`AdminUserManagement`)로 판단 이동
5. **행 단위 토글 (E-2)** — 토글 mutation의 selection에 `id` + 변경 필드를 넣고 refetch 제거. 단 필터 연동 건은 refetch 유지 + 사유 주석
6. **D — selection 보강** — `NODE_NOT_SELECTED` 5건은 selection만 채우고, `GAP` 중 D-1 확정 건은 필드 보강 후 호출부 refetch 제거

## 검증

- 각 수정 건마다 Network 탭에서 update 시 목록 쿼리가 재발생하지 않는지 확인
- update 직후 목록/상세의 변경 필드가 즉시 반영되는지 확인 (store 갱신 확인)
- 취소와 성공이 호출부에서 구분되는지 확인 (A 회귀 방지)
- `bash scripts/verify.sh`

## 범위 밖

- **레거시 `ok`/`msg` mutation (`NO_NODE` 10건)** — 후속 mutation 이관도, `updater:` 작성도 하지 않고 **refetch를 그대로 둡니다.** 백엔드 payload가 데이터를 주지 않는 이상 프론트에서 깔끔하게 풀 방법이 없고, 후속 mutation 이관은 백엔드 버전 호환까지 얽혀 비용 대비 효과가 낮습니다. 이미 `updater:`로 보완된 `AgentSettingModal`은 그대로 둡니다
- **lint 규칙 / `verify.sh` 검사** — 이번 범위에서 제외. 가드레일은 `relay-mutation-store-updates` 스킬 문서로만 둡니다
- delete/purge 경로의 refetch — connection 삭제 지시자 도입은 별도 과제
- REST(`useTanMutation`) 기반 수정 경로 — Relay store와 무관
- 목록 쿼리 자체의 통합/축소 — FR-3170의 다른 축
