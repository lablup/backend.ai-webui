# Deployment Preset 관리 UI Spec

> **상태**: In Review — Jira Epic: [FR-2750](https://lablup.atlassian.net/browse/FR-2750)

## 개요

Deployment Preset을 WebUI에서 직접 관리할 수 있도록 Admin CRUD 화면과 사용자용 상세 보기를 추가한다.

- **1차 마일스톤**: superadmin이 `/admin-serving`의 새 탭에서 preset을 생성·수정·삭제 (별도 페이지, step 기반 폼)
- **2차 마일스톤**: deployment revision 생성 화면에서 일반 사용자가 preset 상세 내역 확인 (read-only Drawer)

### GQL API 지원 현황

> `imageId`는 Create 시 **필수**(`UUID!`).

| 필드 그룹 | GQL Create | GQL Update |
|---|:---:|:---:|
| `name`, `description` | ✅ | ✅ |
| `imageId` | ✅ (필수) | ✅ |
| `runtimeVariantId` | ✅ (필수) | - |
| `rank` | - | ✅ |
| `clusterMode`, `clusterSize` | ✅ | ✅ |
| `resourceSlots`, `resourceOpts` | ✅ | ✅ |
| `startupCommand`, `bootstrapScript`, `environ` | ✅ | ✅ |
| `openToPublic`, `replicaCount`, `revisionHistoryLimit`, `deploymentStrategy` | ✅ | ✅ |
| `presetValues`, `modelDefinition` | ✅ | ✅ |
| `modelRuntimeConfig`, `modelMountConfig`, `extraMounts` | ❌ | ❌ |

> `modelRuntimeConfig` · `modelMountConfig` · `extraMounts`는 Preset이 아닌 deployment revision 생성 시점에 지정하는 model-specific 값이므로 Preset 관리 UI 범위 밖.

## 배경

- CLI로만 preset을 관리할 수 있어 운영 부담이 크다.
- 일반 사용자가 deployment revision 생성 시 preset 이름만 보고 선택해야 해서, 이미지·리소스·기본값을 미리 확인할 수 없다.

## 목표

1. Superadmin이 WebUI에서 deployment preset을 생성·조회·수정·삭제할 수 있다.
2. 일반 사용자가 deployment revision 생성 화면에서 현재 선택한 preset의 상세 내역을 read-only Drawer로 확인할 수 있다.
3. 일반 사용자는 admin 관리 페이지에 접근할 수 없다.

## 비목표

- Deployment revision 생성/배포 흐름 자체의 재설계
- Runtime variant 자체의 CRUD
- 벌크 작업 (다중 선택 삭제/수정)
- `modelRuntimeConfig`, `modelMountConfig`, `extraMounts` 편집

## 사용자 스토리

- Superadmin으로서, preset의 전체 설정(이미지, 리소스, 클러스터, 실행 환경, replica 기본값 등)을 WebUI에서 직접 생성·수정하고 싶다.
- Superadmin으로서, 더 이상 사용하지 않는 preset을 안전하게 삭제하고 싶다.
- 일반 사용자로서, deployment revision 생성 시 preset 후보의 상세 내역을 선택 흐름을 끊지 않고 확인하고 싶다.

## UI 목업 — Selector 상세 보기 (2차 마일스톤)

```
[Create Deployment Revision 화면]
─────────────────────────────────────────────────────────
  Deployment Preset   [  vLLM-GPU-Large     ▼ ] [ⓘ]
─────────────────────────────────────────────────────────
  ↑ VFolderSelect의 Space.Compact 버튼 패턴과 동일.
    Select 오른쪽 Space.Compact 안에 ⓘ Button 배치.
    선택 전 disabled, 선택 후 클릭 → read-only Drawer

ⓘ 클릭 → 현재 선택된 preset 상세 Drawer (read-only, 우측에서 슬라이드):

  ┌─────────────────────────────────────┐
  │  vLLM-GPU-Large                  ✕  │
  │  Large GPU preset for vLLM inference│
  │  Rank: 1                            │
  ├─────────────────────────────────────┤
  │  Runtime    vLLM                    │
  │  Image      cr.backend.ai/vllm:...  │
  ├─────────────────────────────────────┤
  │  Cluster    single-node  × 1        │
  ├─────────────────────────────────────┤
  │  Resources                          │
  │    CPU  4   Memory  16 GiB          │
  │    GPU  1   shmem   2 GiB           │
  ├─────────────────────────────────────┤
  │  Deployment Defaults                │
  │    Replicas  2   Limit  10          │
  │    Strategy  ROLLING                │
  │    Public    No                     │
  └─────────────────────────────────────┘
```

## 요구사항

### 1차 마일스톤 — Admin CRUD

**진입**
- [ ] `/admin-serving`에 "Deployment Presets" 탭 추가 (superadmin 전용)
- [ ] 비-superadmin이 탭에 직접 접근 시 기본 탭(`serving`)으로 폴백

**목록** (`/admin-serving?tab=deployment-presets`)
- [ ] Name, Description, Runtime, Image, Cluster, Replicas(default), Strategy, Rank, Created at, Actions 컬럼
- [ ] 컬럼 표시/숨김 설정 (`BAITable` `tableSettings` prop — Description, Cluster, Strategy, Rank 등은 기본 숨김 후보)
- [ ] name 필터 (문자열 포함 검색), runtime variant UUID 필터; name · rank · 생성일 정렬
- [ ] 새로고침 버튼
- [ ] "Create Preset" 버튼 → 생성 페이지로 이동
- [ ] 테이블 행 Actions → Edit 버튼 클릭 시 수정 페이지로 이동

**생성 / 수정 페이지** — `SessionLauncherPage`와 동일한 step 기반 별도 페이지:

라우트:
- 생성: `/admin-serving/deployment-presets/new`
- 수정: `/admin-serving/deployment-presets/:presetId/edit`

Step 구성 (수직 `Steps` 사이드바 + 우측 폼 영역 + Previous/Next 네비게이션):

| Step | 필드 |
|---|---|
| 1. Basic Info | `name`(필수), `description`, `runtimeVariantId`(필수, 수정 시 read-only 텍스트로 표시), `imageId`(필수) |
| 2. Cluster | `clusterMode`, `clusterSize` |
| 3. Execution | `startupCommand`, `bootstrapScript`, `environ`, `modelDefinition` |
| 4. Resources | `resourceSlots`, `resourceOpts` |
| 5. Deployment | `replicaCount`, `revisionHistoryLimit`, `openToPublic`, `presetValues`, `rank`(수정 시만) |

- Previous / Next 버튼으로 step 간 이동
- 마지막 step에서 Create / Update 버튼 노출
- Cancel 또는 완료 시 목록 탭(`/admin-serving?tab=deployment-presets`)으로 복귀

**삭제**
- [ ] 목록에서 Delete 아이콘 클릭 → `BAIDeleteConfirmModal` (preset 이름을 입력하는 typed-confirmation 방식)

### 2차 마일스톤 — Selector 상세 보기

- [ ] preset selector 오른쪽 ⓘ 아이콘 — 선택 전 비활성
- [ ] ⓘ 클릭 시 read-only Drawer: 이름, 설명, 런타임, 이미지, 클러스터, 리소스, 배포 기본값
- [ ] Drawer 내 편집·삭제 버튼 없음

### 권한

- [ ] "Deployment Presets" 탭은 superadmin만 표시
- [ ] 목록 · 생성 · 수정 페이지 모두 superadmin 전용. 비-superadmin이 직접 URL로 접근하면 `/admin-serving`의 기본 탭(`serving`)으로 폴백 (탭 직접 접근 시 동작과 동일)
- [ ] 일반 사용자는 selector 상세 보기(Drawer)만 접근 가능

## 인수 조건

- [ ] superadmin 로그인 시 `/admin-serving`에 "Deployment Presets" 탭 표시
- [ ] 일반 사용자 로그인 시 탭 미표시
- [ ] `name`, `runtimeVariantId`, `imageId` 미입력 시 생성 폼 제출 차단
- [ ] Create Preset 버튼 → `/admin-serving/deployment-presets/new` 이동
- [ ] Edit 버튼 → `/admin-serving/deployment-presets/:presetId/edit` 이동
- [ ] 생성/수정 완료 및 Cancel 시 `/admin-serving?tab=deployment-presets` 복귀
- [ ] preset 선택 전 ⓘ 비활성, 선택 후 클릭 시 상세 Drawer 열림
- [ ] 상세 Drawer 내 편집·삭제 버튼 없음

## 의존성

- 백엔드 버전 **26.4.2 이상** (BA-5874 포함)
- 백엔드 capability 키: `baiClient.supports('deployment-preset')`으로 탭 gating
- 외부 데드라인: **2026-04-30(목) 또는 2026-05-04(월)** — 1차 마일스톤 완료

## 미해결 질문

1. **삭제 시 참조 처리**: 사용 중인 deployment revision이 있을 때 백엔드 동작 (cascade vs 거절)

## 출처

- 백엔드 스키마: [`request.py`](https://github.com/lablup/backend.ai/blob/main/src/ai/backend/common/dto/manager/v2/deployment_revision_preset/request.py), [`revision_preset.py`](https://github.com/lablup/backend.ai/blob/main/src/ai/backend/manager/api/gql/deployment/types/revision_preset.py)
- 관련 이슈: [BA-5874](https://lablup.atlassian.net/browse/BA-5874)
