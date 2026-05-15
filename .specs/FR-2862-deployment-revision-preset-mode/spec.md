# Deployment Revision Preset Mode UX Spec

> **Epic**: FR-2862 ([link](https://lablup.atlassian.net/browse/FR-2862))
> **Spec Task**: FR-2863 ([link](https://lablup.atlassian.net/browse/FR-2863))
> **Source**: FR-2750 (Deployment Revision Preset Management UI)

## 개요

Deployment revision 생성 흐름을 두 갈래의 UX로 정리한다.

- **VFolder / Model Store 진입** — "Deploy" 버튼을 누르면 그 자리에서 **Preset Mode 전용 모달**이 열린다. preset 만 골라 빠르게 배포한다 (진입 컨텍스트에서 이미 vfolder UUID 또는 model card UUID 가 결정돼 있으므로 폴더 선택 UI는 노출하지 않음). 모드 스위치 없음.
- **기존 Deployment → Add Revision** — 기존 `DeploymentAddRevisionModal`에 **Preset / Custom Segmented** 를 추가해 한 모달 안에서 모드를 전환한다. 마지막 선택한 모드는 사용자 설정(`useBAISettingUserState`)에 영속화한다.

또한 본 스펙 범위 진입점 3곳(`VFolderDeployModal`, `ModelCardDeployModal`, `DeploymentAddRevisionModal` 의 Preset 경로)에 흩어진 form / mutation 호출 코드를 공용 hook(`useDeploymentRevisionForm` 등)으로 추출해 중복을 제거한다. 페이지 이동(navigate)은 없고, 모달 open 상태는 query string으로 관리한다 (`VFolderLazyViewV2`의 `?folder=<uuid>` 패턴 참조). `DeploymentSettingModal` (deployment shell 생성)은 본 스펙 범위 밖이라 hook 공유 대상에서 제외한다.

3개의 마일스톤으로 나눠 진행한다. 순서는 **M1 → M2 → M3** 으로 고정한다.

- **M1 — 공용 hook 추출 + query-string 모달 관리**: 진입점 UX(VFolder/ModelStore에서 그 자리에서 모달이 뜨는 동작)는 유지. 모달 open 상태는 query string으로 관리. form state · validation · mutation 호출은 공용 hook으로 추출하되, 실제 호출 mutation은 진입 컨텍스트에 따라 분기한다 — VFolder 컨텍스트 → `deployVfolderV2(vfolderId, input)`, Model Card 컨텍스트 → `deployModelCardV2(cardId, input)`. 두 input 스키마(`DeployVFolderV2Input`, `DeployModelCardV2Input`)는 모양이 동일하므로 form layer는 공유한다. 페이지 navigate 없음.
- **M2 — VFolder / Model Store Preset-only 모달**: VFolder 리스트와 Model Card 의 "Deploy" 모달을 Preset Mode 전용으로 정리. **모드 스위치는 두지 않는다**. Model Folder selector는 컨텍스트에 이미 vfolder가 있으므로 노출하지 않는다. Empty preset 안내는 deployment 생성 모달 직접 링크로 처리.
- **M3 — Add Revision Preset / Custom Segmented**: `DeploymentAddRevisionModal`에만 Preset / Custom Segmented 추가. Preset → Custom 전환 시 `form.setFieldsValue()` 로 preset 값 prefill. 모드 선택값은 `useBAISettingUserState`로 영속화. 현재 적용된 revision이 있을 경우 자동 prefill 대신 상단 Alert의 "현재 revision 불러오기" 버튼으로 수동 로드.

## 배경

- 진입점이 3곳 분산: `VFolderDeployModal`, `ModelCardDeployModal`, `DeploymentAddRevisionModal`. preset path / custom path가 surface별로 갈려 있다.
- VFolder / Model Store 경로는 본질적으로 "이 vfolder로 빠르게 배포"인데, 현재 모달이 replicaCount / openToPublic 등 굳이 입력할 필요 없는 필드를 노출하고 있다. 이 값들은 preset 안에 이미 정의돼 있다.
- Add Revision 모달은 항상 Custom 폼만 보여줘 "preset으로 새 revision" 흐름이 없다. 그리고 현재 적용된 revision의 값을 **자동으로** 폼에 채우는 동작이 사용자가 원하지 않는 prefill로 작용한다 (방금 다른 값을 시도하려고 모달을 열었는데도 자동 prefill됨).

## 목표

1. VFolder / Model Store 진입에서는 preset 하나만 골라 즉시 배포한다. 폼에 다른 결정 항목을 늘리지 않는다.
2. Add Revision 모달에서는 Preset / Custom 모드를 한 모달 안에서 자유롭게 오갈 수 있고, 마지막 선택한 모드가 다음 번에도 유지된다.
3. Add Revision 모달의 Custom 모드에서 현재 revision의 값은 **사용자가 명시적으로 요청할 때만** 폼에 로드한다.

## 비목표

- Deployment revision 자체의 백엔드 스키마 변경 (이미 `deployVfolderV2` / `deployModelCardV2` mutation으로 충분)
- Preset의 CRUD UI (FR-2750 / FR-2760 / FR-2761에서 이미 다룸)
- VFolder / Model Store 모달에 mode 스위치 추가 — 이 두 진입점은 Preset 전용
- Custom Mode의 폼 구조 자체 재설계 (기존 `DeploymentAddRevisionModal` 폼 재활용)
- Preset Mode에서 preset 값 override (override가 필요하면 Custom Mode로 전환)
- 별도 전체-launcher 페이지 도입 (`react/src/pages/DeploymentLauncherPage.tsx` 파일은 남아 있으나 현재 `react/src/routes.tsx` 에 mount 되지 않은 legacy 코드 — 본 스펙에서 다루지 않는다)
- 모든 진입을 단일 URL 로 funnel 하기 (페이지 navigate 없음, 모달은 그 자리에서 띄움)

## 사용자 스토리

- VFolder / Model Store에서 "Deploy"를 눌렀을 때, 이미 어느 vfolder인지 알고 있는 상태이므로 preset과 resource group만 골라 즉시 배포하고 싶다.
- 적절한 preset이 없으면 "preset으로 배포할 수 없다"는 안내와 함께 **새 deployment를 만드는 모달**(`DeploymentSettingModal`) 로 바로 갈 수 있는 링크를 보고 싶다.
- 기존 deployment에 revision을 추가할 때, 보통은 preset만 골라 빠르게 추가하지만, 가끔 세부값을 바꿔야 할 때 Custom 모드로 전환해 같은 모달에서 마무리하고 싶다.
- Preset 모드에서 고른 preset의 값(image, runtime variant, replicas 등)이 Custom 모드로 전환되는 순간 폼에 그대로 prefill되어, 일부만 바꾸면 되는 상태이길 원한다.
- 평소 Custom 모드를 주로 쓰는 운영자라면, 모달을 열 때마다 Custom으로 매번 다시 전환하고 싶지 않다 — 마지막 선택한 모드가 기억되어야 한다.
- Add Revision 모달의 Custom 모드를 열었을 때, 현재 revision 값이 자동으로 들어오는 게 아니라, 필요할 때만 상단 Alert의 "현재 revision 불러오기" 버튼으로 명시적으로 로드하고 싶다.

## 현황 (As-Is) — 진입점 매핑

`react/src/routes.tsx` 기준 실제로 활성화된 진입점만 정리한다. `DeploymentLauncherPage` 파일은 남아 있지만 라우터에 mount 되어 있지 않으므로 표에서 제외한다 (FR-2675 / FR-2822 에서 in-page `DeploymentSettingModal` 로 대체됨).

| 위치 | 컴포넌트 | 진입점 | 사용 mutation |
|---|---|---|---|
| `/deployments` (Deployment 리스트) → "Create Deployment" | `DeploymentListPage` → `DeploymentSettingModal` | Modal (in-place) | `createModelDeployment` 계열 (Custom path) |
| VFolder 리스트 → "Deploy" | `VFolderDeployModal` | Modal (in-place) | `deployVfolderV2` (Preset path) |
| Model Card → "Deploy" | `ModelCardDeployModal` | Modal (in-place) | `deployModelCardV2` (Preset path, model-card variant) |
| 기존 deployment → "Add Revision" | `DeploymentAddRevisionModal` | Modal | `addModelRevision` (Custom path) — 항상 현재 revision 값 자동 prefill |

문제:

- VFolder / Model Store 모달이 preset 외에 굳이 입력하지 않아도 되는 필드를 노출.
- Add Revision 모달에 Preset 경로가 없음.
- Add Revision Custom 모달이 항상 자동 prefill되어 빈 폼에서 시작하기 어려움.
- form / mutation 호출 코드가 진입점마다 중복.

## 목표 상태 (To-Be)

| 위치 | 동작 | 모드 스위치 | Model Folder 선택 UI |
|---|---|---|---|
| `/deployments` → "Create Deployment" | 본 스펙 범위 밖 (현재 동작 그대로 `DeploymentSettingModal` 유지) | — | — |
| VFolder 리스트 → "Deploy" | **Preset Mode 전용** 모달 (`useDeploymentRevisionForm` 사용). 모달 open은 query string으로 관리. | **없음** | **숨김** (vfolder 컨텍스트에서 이미 결정) |
| Model Card → "Deploy" | **Preset Mode 전용** 모달 (동일 hook 사용) | **없음** | **숨김** (model card 컨텍스트에서 이미 결정) |
| 기존 deployment → "Add Revision" | **Preset / Custom Segmented** 모달. 기본값은 `useBAISettingUserState('deploymentRevisionCreationMode')` 의 마지막 선택값. | **있음** | Preset Mode에서 노출 (기존 deployment의 model folder를 default로 prefill) |

페이지 navigate 없음. 모든 진입점은 그 자리에서 모달로 처리한다.

## UI 목업

### (a) VFolder / Model Store — Preset Mode 전용 모달

폼 본문에 모드 스위치가 없고, Model Folder selector도 없다. preset + resource group만 노출한다.

```
╔══════════════════════════════════════════════════════════╗
║  Preset을 이용한 새 배포 생성                          ✕  ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║   Deployment Preset *                                    ║
║   ┌──────────────────────────────────────┐ ┌──┐          ║
║   │  vLLM-GPU-Large              ▼       │ │ⓘ│          ║
║   └──────────────────────────────────────┘ └──┘          ║
║                                                          ║
║   Resource Group *                                       ║
║   ┌──────────────────────────────────────┐               ║
║   │  default                     ▼       │               ║
║   └──────────────────────────────────────┘               ║
║                                                          ║
╠══════════════════════════════════════════════════════════╣
║                              [ Cancel ]   [ Create ]     ║
╚══════════════════════════════════════════════════════════╝
```

ⓘ 클릭 시 현재 선택된 preset의 read-only detail Modal이 열린다 (FR-2762에서 이미 구현된 `DeploymentPresetDetailContent` 재사용).

### (a-2) VFolder / Model Store — Preset이 없을 때

사용 가능한 preset이 0개일 때, "preset이 없어서 preset으로 배포할 수 없음"을 명시하고 **deployment 생성 모달**(`DeploymentSettingModal`, `react/src/components/DeploymentSettingModal.tsx`) 로 바로 갈 수 있는 링크를 노출한다.

```
╔══════════════════════════════════════════════════════════╗
║  Preset을 이용한 새 배포 생성                          ✕  ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║   ┌──────────────────────────────────────────────────┐   ║
║   │ ⓘ  사용 가능한 deployment preset이 없습니다.     │   ║
║   │                                                  │   ║
║   │    대신 새 deployment를 만들어 시작하세요.       │   ║
║   │                                                  │   ║
║   │    [ Deployment 생성 모달 열기 → ]               │   ║
║   └──────────────────────────────────────────────────┘   ║
║                                                          ║
╠══════════════════════════════════════════════════════════╣
║                                       [ Cancel ]         ║
╚══════════════════════════════════════════════════════════╝
```

"Deployment 생성 모달 열기" 링크는 현재 모달을 닫고 `DeploymentSettingModal` (deployment shell 생성: name / openToPublic / replicaCount) 을 띄운다 — `/deployments` 페이지의 "Create Deployment" 버튼과 동일한 동작.

### (b) Add Revision Modal — Preset Mode

```
╔══════════════════════════════════════════════════════════╗
║  Add Revision — my-deployment                         ✕  ║
╠══════════════════════════════════════════════════════════╣
║   ┌───────────────────────────┐                          ║
║   │  Preset │ Custom            │   (Segmented)          ║
║   └───────────────────────────┘                          ║
║                                                          ║
║   Deployment Preset *                                    ║
║   ┌──────────────────────────────────────┐ ┌──┐          ║
║   │  vLLM-GPU-Large              ▼       │ │ⓘ│          ║
║   └──────────────────────────────────────┘ └──┘          ║
║                                                          ║
║   Resource Group *                                       ║
║   ┌──────────────────────────────────────┐               ║
║   │  default                     ▼       │               ║
║   └──────────────────────────────────────┘               ║
║                                                          ║
║   Model Folder *                                         ║
║   ┌──────────────────────────────────────┐               ║
║   │  llama-3-8b-instruct         ▼       │               ║
║   └──────────────────────────────────────┘               ║
║                                                          ║
╠══════════════════════════════════════════════════════════╣
║                              [ Cancel ]   [ Add ]        ║
╚══════════════════════════════════════════════════════════╝
```

Add Revision 컨텍스트에서는 부모 deployment의 model folder를 default로 prefill하되 변경할 수 있다.

### (c) Add Revision Modal — Custom Mode + 현재 revision 수동 로드

```
╔══════════════════════════════════════════════════════════╗
║  Add Revision — my-deployment                         ✕  ║
╠══════════════════════════════════════════════════════════╣
║   ┌───────────────────────────┐                          ║
║   │  Preset │ Custom            │   (Segmented)          ║
║   └───────────────────────────┘                          ║
║                                                          ║
║   ┌──────────────────────────────────────────────────┐   ║
║   │ ⓘ  현재 적용된 revision (v3) 이 있습니다.        │   ║
║   │    [ 현재 revision 불러오기 ]                    │   ║
║   └──────────────────────────────────────────────────┘   ║
║                                                          ║
║   ── Image & Environment ─────────────────────────────   ║
║   Image *           [                              ▼ ]   ║
║   Runtime Variant * [                              ▼ ]   ║
║                                                          ║
║   ── Resources ────────────────────────────────────────  ║
║   CPU [  ]  Memory [    ]  GPU [  ]                      ║
║   ...                                                    ║
║                                                          ║
║   ── Execution ────────────────────────────────────────  ║
║   Startup command [                                 ]    ║
║   ...                                                    ║
╠══════════════════════════════════════════════════════════╣
║                              [ Cancel ]   [ Add ]        ║
╚══════════════════════════════════════════════════════════╝
```

- 모달을 처음 열 때 초기 모드가 Custom이라면 폼은 **빈 상태**로 시작한다. 현재 적용된 revision 값을 자동으로 prefill 하지 않는다.
- 단, Preset 모드에서 preset을 고른 뒤 Custom으로 전환한 경우에는 선택된 preset의 값으로 prefill된다 ((d) 참조). 즉 "빈 상태로 시작"은 Custom으로 모달을 처음 들어왔을 때(혹은 Preset 모드에서 아무 preset도 고르지 않은 채 전환한 경우)에만 적용된다.
- 현재 적용된 revision이 존재하면 상단에 `Alert` (`type="info"`, antd v6: `title` prop) 가 떠서 "현재 적용된 revision (vN) 이 있습니다" + "현재 revision 불러오기" 액션 버튼을 제공한다.
- 버튼을 누르면 현재 revision의 값을 `form.setFieldsValue()` 로 폼에 채운다. 한 번 채운 뒤 Alert를 어떻게 처리할지(닫기 / 유지)는 구현 단계에서 결정한다 — spec 수준에서는 "수동 로드 가능"만 보장한다.

### (d) Add Revision Modal — Preset → Custom 전환

Preset 모드에서 preset을 고른 상태로 Custom 모드로 전환하면, 선택된 preset의 모든 값(image, runtime variant, cluster mode/size, resourceSlots, env, startupCommand, replicaCount, openToPublic 등)이 `form.setFieldsValue()` 로 Custom 폼에 prefill된다. Preset 모드에서 고른 Resource Group, Model Folder도 그대로 유지된다.

Custom 모드에서 다시 Preset 모드로 돌아가면, Custom에서 편집한 값은 버려지고 (또는 직전 Preset에서 선택한 값으로 되돌아가고) preset selector가 다시 보인다.

## Schema 참조 — `deployVfolderV2` / `deployModelCardV2`

진입 컨텍스트에 따라 호출하는 mutation 이 달라진다.

| 진입 컨텍스트 | Mutation | 식별자 argument |
|---|---|---|
| VFolder 리스트 → Deploy | `deployVfolderV2(vfolderId, input)` | `vfolderId` (선택한 vfolder UUID) |
| Model Card → Deploy | `deployModelCardV2(cardId, input)` | `cardId` (model card UUID) |
| Add Revision → Preset Mode | `deployVfolderV2(vfolderId, input)` | `vfolderId` (부모 deployment 의 vfolder, default; 사용자 변경 가능) |

두 mutation 의 `input` 타입(`DeployVFolderV2Input`, `DeployModelCardV2Input`) 은 모양이 동일하다 (`data/merged_schema.graphql:5510` `DeployModelCardV2Input`, `data/merged_schema.graphql:5556` `DeployVFolderV2Input`):

```graphql
input DeployVFolderV2Input {     # 그리고 DeployModelCardV2Input 도 동일 필드
  projectId: UUID!               # required
  revisionPresetId: UUID!        # required (non-null 확정)
  resourceGroup: String!         # required
  desiredReplicaCount: Int! = 1  # required, default 1
  openToPublic: Boolean = null   # "Defaults to the preset value, then False"
  replicaCount: Int = null       # "Defaults to the preset value, then desired_replica_count"
  revisionHistoryLimit: Int = null                     # "Defaults to the preset value, then 10"
  deploymentStrategy: PresetDeploymentStrategyInput = null  # "Defaults to the preset value, then none"
}
```

**Preset Mode 의 mutation 호출 input** (VFolder / Model Card / Add Revision 공통 — input 모양이 같으므로 동일 객체):

```ts
input: {
  projectId,                 // 현재 활성 project (자동)
  revisionPresetId,          // 사용자 선택
  resourceGroup,             // 사용자 선택
  desiredReplicaCount: 1,    // 고정 (preset 의 replicaCount 가 따로 적용됨)
  // openToPublic, replicaCount, revisionHistoryLimit, deploymentStrategy:
  // 모두 미전송 → 백엔드가 preset 값으로 채움
}
```

식별자(`vfolderId` / `cardId`) 는 mutation argument 로 따로 전달.

## 영속화 키 — `useBAISettingUserState`

마지막 선택한 모드를 사용자 설정에 저장한다. 참조: `react/src/pages/UserSettingsPage.tsx:46` (`useBAISettingUserState` 사용 패턴).

```ts
const [revisionCreationMode, setRevisionCreationMode] =
  useBAISettingUserState('deploymentRevisionCreationMode');
// type: 'preset' | 'custom' | null
// 초기값(null) 일 때 default 는 'preset'
```

> 참고: 새 키를 사용하려면 `react/src/hooks/useBAISetting.tsx` 의 `UserSettings` 타입에 `deploymentRevisionCreationMode?: 'preset' | 'custom'` 항목을 먼저 추가해야 타입-세이프하게 쓸 수 있다. `useBAISettingUserState` 는 값이 없을 때 `rawToSetting()` 을 거쳐 `null` 을 돌려준다 (`undefined` 아님).

적용 범위:

- **Add Revision Modal 에만 적용**한다. Modal 이 열릴 때 저장된 값으로 Segmented 초기값을 결정한다. 사용자가 모드를 바꾸면 즉시 저장한다.
- VFolder / Model Store 모달은 모드 스위치가 없으므로 이 설정을 사용하지 않는다.

## 요구사항

### M1 — 공용 hook 추출 + query-string 모달 관리

**범위**: 진입점 UX는 유지하고, 내부 form/mutation 코드만 공용화.

- [ ] `useDeploymentRevisionForm` (또는 동등한 이름) hook 추출: project / preset / resource group / 식별자(vfolderId 또는 cardId) 입력값, validation, mutation 호출, endpoint propagation 대기 (`waitForEndpointReady` 패턴) 를 한 곳에서 관리.
- [ ] Hook 은 진입 컨텍스트(예: `{ kind: 'vfolder', vfolderId }` 또는 `{ kind: 'modelCard', cardId }`) 를 받아 그에 맞는 mutation (`deployVfolderV2` / `deployModelCardV2`) 을 내부에서 분기 호출한다. 두 input 스키마가 동일하므로 form layer / validation 은 공유한다.
- [ ] VFolder 리스트와 Model Card 의 "Deploy" 액션이 새 hook 을 사용하도록 마이그레이션 (기존 모달은 hook 의 첫 consumer).
- [ ] 모달 open 상태는 query string 으로 관리 (`VFolderLazyViewV2`의 `?folder=<uuid>` 패턴 참조). 모달이 열려 있는 상태가 URL 에 반영되어 deep-link / 뒤로가기로 모달을 닫을 수 있어야 한다.
- [ ] 페이지 navigate 없음. 단일 URL 로 funnel 하지 않는다 (각 진입점에서 그 자리에서 모달을 띄움).

### M2 — VFolder / Model Store Preset-only 모달

**진입**: VFolder 리스트와 Model Card 의 "Deploy" 버튼.

**모드 스위치**: 없음.

**Preset Mode 의 사용자 노출 필드 — 정확히 2개**:

- [ ] **Deployment Preset** (`revisionPresetId`) — 필수, `BAISelect`
- [ ] **Resource Group** (`resourceGroup`) — 필수, `BAIProjectResourceGroupSelect`

**노출하지 않는 항목**:

- **Model Folder** — 진입 컨텍스트(VFolder / Model Card)에서 이미 결정됐으므로 UI에 노출하지 않음
- `replicas` / `replicaCount` — preset 의 `replicaCount` 가 자동 적용됨 (input.replicaCount 미전송)
- `openToPublic`, `revisionHistoryLimit`, `deploymentStrategy` — 모두 preset 기본값
- "Auto activate after creation" 같은 부수 체크박스

**Mutation 호출** — 진입 컨텍스트에 따라 분기:

- [ ] **VFolder 컨텍스트**: `deployVfolderV2(vfolderId: $vfolderId, input: $input)` 사용. `vfolderId` 는 진입 컨텍스트의 vfolder id.
- [ ] **Model Card 컨텍스트**: `deployModelCardV2(cardId: $cardId, input: $input)` 사용. `cardId` 는 진입 컨텍스트의 model card id. `deployVfolderV2` 를 호출하지 않는다.
- [ ] 두 경우 모두 `input` 에는 정확히 `{ projectId, revisionPresetId, resourceGroup, desiredReplicaCount: 1 }` 만 채움 (`DeployVFolderV2Input` 과 `DeployModelCardV2Input` 의 모양이 동일하므로 같은 input 객체 사용 가능).
- [ ] 나머지 input 필드(`openToPublic`, `replicaCount`, `revisionHistoryLimit`, `deploymentStrategy`)는 미전송 (= preset 값 위임).
- [ ] 제출 후 endpoint 가 v1 projection 에 잡힐 때까지 poll 후 `/serving/:deploymentId` 로 navigate.

**Preset 선택 후 detail 조회**:

- [ ] Select 오른쪽 Space.Compact 안에 ⓘ Button 배치, 선택 전 disabled, 선택 후 클릭 시 read-only Modal 열림 (FR-2762 의 `DeploymentPresetDetailContent` 재사용).

**Empty preset 처리**:

- [ ] 사용 가능한 preset 이 0 개일 때 inline 안내 메시지("사용 가능한 deployment preset이 없습니다 / 대신 새 deployment를 만들어 시작하세요") + **deployment 생성 모달**(`DeploymentSettingModal`) 로 가는 링크 버튼.
- [ ] 링크 버튼 클릭 시 현재 모달은 닫고 `DeploymentSettingModal` 을 띄운다 (= `/deployments` 페이지 "Create Deployment" 와 동일 동작).

### M3 — Add Revision Preset / Custom Segmented

**범위**: `DeploymentAddRevisionModal` 에 모드 스위치를 추가하고 Preset Mode 경로를 새로 만든다. Custom Mode 폼 본문은 기존 그대로 유지하되, 자동 prefill 동작은 제거하고 수동 로드 버튼으로 바꾼다.

**모드 스위치**:

- [ ] 모달 최상단에 Preset / Custom Segmented 배치.
- [ ] 모달이 열릴 때 초기 모드는 `useBAISettingUserState('deploymentRevisionCreationMode')` 의 저장값. 저장값이 없으면 `'preset'`.
- [ ] 사용자가 모드를 바꾸면 즉시 저장한다 (다음 번 모달 오픈 시 동일 모드로 시작).

**Preset Mode** (Add Revision 컨텍스트):

- [ ] 필드 구성: Deployment Preset, Resource Group, Model Folder (M2 의 VFolder/ModelStore Preset Mode 와 달리, Add Revision 에서는 Model Folder를 변경할 수 있어야 하므로 노출)
- [ ] Model Folder default: 부모 deployment 의 model folder. 사용자가 변경 가능.
- [ ] Mutation: `deployVfolderV2` (M2 와 동일 input 규약). `addModelRevision` 사용 안 함.

**Custom Mode** (Add Revision 컨텍스트):

- [ ] 폼 본문은 **현재 `DeploymentAddRevisionModal` 의 폼 그대로** (`addModelRevision` mutation 유지).
- [ ] 모달이 처음 열릴 때 (초기 모드가 Custom) **자동 prefill 동작은 제거**. Custom 폼은 빈 상태로 시작. (단, Preset → Custom 전환으로 진입한 경우에는 모드 전환 규칙에 따라 preset 값으로 prefill — 아래 "모드 전환 시 값 보존" 참조.)
- [ ] 현재 적용된 revision이 존재하면 폼 상단에 `Alert` (`type="info"`, antd v6 `title` prop) 노출:
  - title: "현재 적용된 revision (vN) 이 있습니다" (i18n)
  - action: "현재 revision 불러오기" 버튼
- [ ] 버튼 클릭 시 현재 revision 의 값을 `form.setFieldsValue()` 로 폼에 적용.

**모드 전환 시 값 보존**:

- [ ] **Preset → Custom 전환**: 현재 선택된 preset 의 모든 값(image, runtime variant, cluster mode/size, resourceSlots, env, startupCommand, replicaCount, openToPublic 등) 을 `form.setFieldsValue()` 로 Custom 폼에 prefill. Resource Group, Model Folder 도 그대로 유지.
- [ ] **Custom → Preset 전환**: 폼은 Preset Mode 의 3개 필드만 보이는 상태로 돌아간다. Custom 에서 편집한 image / cluster mode 등은 폐기 (또는 모드 segmented 가 disable되어 있다가 다시 전환할 때 직전 Preset 값으로 복원 — 상세 동작은 구현 단계에서 결정).

### 권한 / 가시성

- [ ] Preset 목록은 현재 활성 project 의 권한 범위 내에서 조회 (`deploymentRevisionPresets` connection 그대로 사용).
- [ ] 사용 가능한 preset 이 없을 때 빈 상태로 안내:
  - VFolder / Model Store 모달: **"Deployment 생성 모달 열기"** 링크 노출 (`DeploymentSettingModal`)
  - Add Revision Preset Mode: "사용 가능한 preset이 없습니다" 안내 + Custom 모드로 전환 안내

## 인수 조건

### M1

- [ ] VFolder 리스트와 Model Card 의 "Deploy" 액션이 공용 hook (`useDeploymentRevisionForm` 등) 을 사용해 동작한다.
- [ ] 두 진입점 모두 그 자리에서 모달이 열리고, 모달 open 상태가 URL query string 에 반영된다 (deep-link / 뒤로가기로 모달 닫기 가능).
- [ ] 페이지 navigate 발생 없음.

### M2

- [ ] VFolder 리스트의 "Deploy" 모달과 Model Card 의 "Deploy" 모달 양쪽 모두에서 모드 스위치가 보이지 않는다 (Preset 전용).
- [ ] 두 모달의 사용자 노출 필드는 정확히 2개: Deployment Preset, Resource Group. Model Folder selector 는 노출되지 않는다.
- [ ] Create 클릭 시 진입 컨텍스트에 맞는 mutation 이 호출된다 — VFolder 진입은 `deployVfolderV2(vfolderId, input)`, Model Card 진입은 `deployModelCardV2(cardId, input)`. 두 경우 모두 `input` 은 정확히 `{ projectId, revisionPresetId, resourceGroup, desiredReplicaCount: 1 }` 이고, `openToPublic`, `replicaCount`, `revisionHistoryLimit`, `deploymentStrategy` 는 input 에 포함되지 않는다.
- [ ] 사용 가능한 preset 이 0 개일 때 "사용 가능한 deployment preset이 없습니다 / 대신 새 deployment를 만들어 시작하세요" 안내와 함께 **deployment 생성 모달**(`DeploymentSettingModal`) 로 가는 링크 버튼이 보인다.
- [ ] Preset 선택 후 ⓘ 클릭 시 read-only detail Modal 이 열린다 (편집/삭제 버튼 없음).
- [ ] 제출 성공 시 `/serving/:deploymentId` 로 이동하고, 첫 paint 에서 detail 페이지가 placeholder("-") 없이 데이터를 보여준다 (`waitForEndpointReady` 패턴).

### M3

- [ ] `DeploymentAddRevisionModal` 최상단에 Preset / Custom Segmented 가 보인다.
- [ ] 모달이 처음 열릴 때 (저장값 없음): Preset 모드로 시작.
- [ ] Preset → Custom 전환 시: 현재 선택된 preset 의 image / runtime variant / cluster / resources / env / replicas / openToPublic 등 모든 값이 Custom 폼에 prefill 된다.
- [ ] 초기 모드가 Custom인 상태로 모달이 열리면 폼은 **빈 상태**로 시작한다 (현재 적용된 revision 값을 자동으로 채우지 않는다). Preset → Custom 전환으로 진입한 경우에는 위의 "Preset → Custom 전환" 규칙에 따라 preset 값으로 prefill된다.
- [ ] 현재 적용된 revision 이 있으면 폼 상단에 "현재 적용된 revision (vN) 이 있습니다 / [현재 revision 불러오기]" Alert 가 보인다. 버튼 클릭 시 현재 revision 값이 폼에 들어간다.
- [ ] Preset Mode 의 mutation 호출은 `deployVfolderV2` (M2 와 동일 input 규약). Custom Mode 의 mutation 호출은 기존 `addModelRevision`.
- [ ] 사용자가 모드를 바꾸면 `useBAISettingUserState('deploymentRevisionCreationMode')` 에 저장되어, 다음 번 모달 오픈 시 같은 모드로 시작한다.

## 의존성 / 가정

- 백엔드 버전 **26.4.2 이상** (`deployVfolderV2` / `DeployVFolderV2Input`, `deployModelCardV2` / `DeployModelCardV2Input` 포함).
- 백엔드 capability: `baiClient.supports('deployment-preset')` 가 true 일 때만 모드 스위치 / Preset 진입 노출.
- `DeploymentSettingModal` (`react/src/components/DeploymentSettingModal.tsx`) 이 외부에서 호출 가능해야 한다 (M2 의 "Deployment 생성 모달 열기" 링크가 사용).
- FR-2762 (`DeploymentPresetDetailContent` read-only view) 가 이미 머지됨.

## 백엔드 확인 항목

| # | 항목 | 상태 |
|---|---|---|
| 1 | `DeployVFolderV2Input.revisionPresetId` / `DeployModelCardV2Input.revisionPresetId` 가 required 인지 | **확인 완료** — schema 에서 양쪽 모두 `UUID!` (non-null) |
| 2 | Add Revision 컨텍스트(기존 deployment 에 새 revision 추가) 에서도 `deployVfolderV2` 를 사용해도 되는지 | **확정** — 사용자(프로덕트) 결정: Yes |
| 3 | `input.replicaCount` 등을 미전송했을 때 preset 값이 채워지는 동작이 schema 설명대로 보장되는지 (`deployVfolderV2` / `deployModelCardV2` 둘 다) | schema 에 명시("Defaults to the preset value") — 별도 백엔드 확인 불필요, E2E 로 검증 |

## 구현 참고

- 공용 hook: `useDeploymentRevisionForm` (신규). 위치 후보: `react/src/hooks/useDeploymentRevisionForm.ts`. 진입 컨텍스트(`{ kind: 'vfolder', vfolderId }` 또는 `{ kind: 'modelCard', cardId }`) 를 받아 내부에서 `deployVfolderV2` / `deployModelCardV2` mutation 을 분기 호출. `waitForEndpointReady` 로직과 query string 동기화도 담당.
- Query-string 모달 패턴: `react/src/components/VFolderLazyViewV2.tsx` 의 `?folder=<uuid>` 처리 코드 참조.
- 영속화: `react/src/pages/UserSettingsPage.tsx:46` 의 `useBAISettingUserState` 사용 패턴 참조. 키: `deploymentRevisionCreationMode`.
- VFolder Deploy 모달 마이그레이션: `react/src/components/VFolderDeployModal.tsx` 의 select / resource group / mutation 호출 코드 → hook 으로 이동.
- Model Card Deploy 모달 마이그레이션: `react/src/components/ModelCardDeployModal.tsx` 도 동일 hook 사용.
- Add Revision 모달: `react/src/components/DeploymentAddRevisionModal.tsx` 폼 본문 위에 Segmented 추가, 자동 prefill 제거 후 Alert + 수동 로드 버튼으로 교체.
- Read-only preset detail: `react/src/components/DeploymentPresetDetailContent.tsx` (FR-2762).
- Endpoint propagation 패턴: `VFolderDeployModal.waitForEndpointReady` + `ModelCardDeployModal` 의 동일 패턴.
- Alert: antd v6 prop 규약 — `title` 사용 (`message` 는 deprecated). `.claude/rules/antd-v6-props.md` 참조.

## 출처

- 백엔드 스키마: `data/merged_schema.graphql:5510` (`DeployModelCardV2Input`), `data/merged_schema.graphql:5556` (`DeployVFolderV2Input`) — 두 input 모양 동일
- 관련 Epic / Task: FR-2750 (Deployment Revision Preset Management UI)
- 관련 구현 issues: FR-2760, FR-2761, FR-2762, FR-2767, FR-2801
- 참고 패턴: `VFolderLazyViewV2` (query-string modal), `UserSettingsPage:46` (useBAISettingUserState)
