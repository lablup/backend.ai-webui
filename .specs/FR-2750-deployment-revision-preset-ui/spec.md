# Deployment Preset 관리 UI Spec

> **상태**: In Review — Jira Epic: [FR-2750](https://lablup.atlassian.net/browse/FR-2750)

## 개요

Deployment Preset을 WebUI에서 직접 관리할 수 있도록 Admin CRUD 화면과 사용자용 상세 보기를 추가한다.

- **1차 마일스톤**: superadmin이 `/admin-serving`의 새 탭에서 preset을 생성·수정·삭제
- **2차 마일스톤**: deployment revision 생성 화면에서 일반 사용자가 preset 상세 내역 확인

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
2. 일반 사용자가 deployment revision 생성 화면에서 preset 상세 내역을 Modal로 확인할 수 있다 (read-only).
3. 일반 사용자는 admin 관리 탭에 접근할 수 없다.

## 비목표

- Deployment revision 생성/배포 흐름 자체의 재설계
- Runtime variant 자체의 CRUD
- 벌크 작업 (다중 선택 삭제/수정)
- `modelRuntimeConfig`, `modelMountConfig`, `extraMounts` 편집

## 사용자 스토리

- Superadmin으로서, preset의 전체 설정(이미지, 리소스, 클러스터, 실행 환경, replica 기본값 등)을 WebUI에서 직접 생성·수정하고 싶다.
- Superadmin으로서, 더 이상 사용하지 않는 preset을 안전하게 삭제하고 싶다.
- 일반 사용자로서, deployment revision 생성 시 preset 후보의 상세 내역을 선택 흐름을 끊지 않고 확인하고 싶다.

## UI 목업 — Selector 상세 보기

```
[Create Deployment Revision 화면]
─────────────────────────────────────────────────────────
  Deployment Preset   [  vLLM-GPU-Large     ▼ ] [ⓘ]
─────────────────────────────────────────────────────────
  ↑ VFolderSelect의 Space.Compact 버튼 패턴과 동일.
    Select 오른쪽 Space.Compact 안에 ⓘ Button 배치.
    선택 전 disabled, 선택 후 클릭 → Modal

ⓘ 클릭 → 현재 선택된 preset 상세 Modal (read-only):

  ╔══════════════════════════════════════╗
  ║  vLLM-GPU-Large                  ✕   ║
  ╠══════════════════════════════════════╣
  ║  Large GPU preset for vLLM inference ║
  ║  Rank: 1                             ║
  ╠──────────────────────────────────────╣
  ║  Runtime    vLLM                     ║
  ║  Image      cr.backend.ai/vllm:...   ║
  ╠──────────────────────────────────────╣
  ║  Cluster    single-node  × 1         ║
  ╠──────────────────────────────────────╣
  ║  Resources                           ║
  ║    CPU  4   Memory  16 GiB           ║
  ║    GPU  1   shmem   2 GiB            ║
  ╠──────────────────────────────────────╣
  ║  Deployment Defaults                 ║
  ║    Replicas  2   Limit  10           ║
  ║    Strategy  ROLLING                 ║
  ║    Public    No                      ║
  ╚══════════════════════════════════════╝
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
- [ ] "Create Preset" 버튼 → `/admin-serving/deployment-presets/new`
- [ ] 테이블 행 Actions → Edit 버튼 → `/admin-serving/deployment-presets/:presetId/edit`

**생성 / 수정 페이지** — `DeploymentLauncherPage` 패턴과 동일한 구조:

라우트:
- 생성: `/admin-serving/deployment-presets/new`
- 수정: `/admin-serving/deployment-presets/:presetId/edit`

파일 구조 (2-컴포넌트 구조):
- `pages/AdminDeploymentPresetSettingPage.tsx` — 페이지 오케스트레이터
  - `AdminDeploymentPresetSettingPage` (outer) — `Form.useForm()` + `Suspense` 소유
  - `AdminDeploymentPresetSettingPageInner` (inner) — `useLazyLoadQuery` (preset fetch, `@skip`), runtimeVariants query, create/update mutations, navigation, UI 렌더링
- `components/AdminDeploymentPresetSettingPageContent.tsx` — 다단계 폼 바디
  - step을 nuqs `?step=` URL에 sync (`parseAsStringLiteral`)
  - 각 step을 antd `Card` (title 포함) + `display: none/block`으로 렌더링
  - `BAIFlex direction="row"`: 왼쪽 폼 영역(flex: 1, maxWidth: 800) + 오른쪽 `Steps` 사이드바(`screens.lg`에서만 표시)
  - Footer: `BAIFlex justify="between"` — Cancel 왼쪽, Previous/Next/Create 오른쪽

Step 구성 (4 steps, DeploymentLauncher와 동일한 구조):

| Step | i18n 키 | 필드 |
|---|---|---|
| 1. Basic Info | `adminDeploymentPreset.step.BasicInfo` | `name`(필수), `description`, `runtimeVariantId`(필수, 수정 시 read-only 표시), `imageId`(필수) |
| 2. Model & Execution | `adminDeploymentPreset.step.ModelAndExecution` | `clusterMode`, `clusterSize`, `startupCommand`, `bootstrapScript`, `environ`, `modelDefinition` |
| 3. Resources | `adminDeploymentPreset.step.Resources` | `resourceSlots`, `resourceOpts` |
| 4. Deployment | `adminDeploymentPreset.step.Deployment` | `replicaCount`, `revisionHistoryLimit`, `openToPublic`, `presetValues`, `rank`(수정 시만) |

- 마지막 step에서 Create / Update 버튼 노출 (`BAIButton action=`)
- "Skip to Review" 없음 (4 steps, review step 없음)
- 완료 또는 Cancel 시 `/admin-serving?tab=deployment-presets` 복귀

**삭제**
- [ ] 목록에서 Delete 아이콘 클릭 → `BAIDeleteConfirmModal` (preset 이름을 입력하는 typed-confirmation 방식)

### 2차 마일스톤 — Selector 상세 보기

- [ ] preset selector 오른쪽 ⓘ 아이콘 — 선택 전 비활성
- [ ] ⓘ 클릭 시 read-only Modal: 이름, 설명, 런타임, 이미지, 클러스터, 리소스, 배포 기본값
- [ ] Modal 내 편집·삭제 버튼 없음

### 권한

- [ ] "Deployment Presets" 탭은 superadmin만 표시
- [ ] 목록 · 생성 · 수정 페이지 모두 superadmin 전용. 비-superadmin이 직접 URL로 접근하면 `/admin-serving`의 기본 탭(`serving`)으로 폴백 (탭 직접 접근 시 동작과 동일)
- [ ] 일반 사용자는 selector 상세 보기(Modal)만 접근 가능

## 인수 조건

- [ ] superadmin 로그인 시 `/admin-serving`에 "Deployment Presets" 탭 표시
- [ ] 일반 사용자 로그인 시 탭 미표시
- [ ] `name`, `runtimeVariantId`, `imageId` 미입력 시 생성 폼 제출 차단
- [ ] Create Preset 버튼 → `/admin-serving/deployment-presets/new` 이동
- [ ] Edit 버튼 → `/admin-serving/deployment-presets/:presetId/edit` 이동
- [ ] 생성/수정 완료 및 Cancel 시 `/admin-serving?tab=deployment-presets` 복귀
- [ ] preset 선택 전 ⓘ 비활성, 선택 후 클릭 시 상세 Modal 열림
- [ ] 상세 Modal 내 편집·삭제 버튼 없음

## 구현 참고

- `DeploymentLauncherPage.tsx` / `DeploymentLauncherPageContent.tsx` (FR-2776 스택) 패턴을 기준으로 구현
  - Page 파일: `CreateView` / `EditView` / `PageLayout` 세 sub-component 분리
  - Content 파일: nuqs URL-sync step, antd `Card` per step, `screens.lg` Steps 사이드바
- Runtime variant 목록: `runtimeVariants(limit: 100)` GQL query (FR-2776에서 확인)
- Image selector: `BAIImageSelect` (`packages/backend.ai-ui`) — `adminImagesV2` (ImageV2) 기반, paginated, `toLocalId` UUID 저장, mutation 입력에 직접 사용 가능

## 의존성

- 백엔드 버전 **26.4.2 이상** (BA-5874 포함)
- 백엔드 capability 키: `baiClient.supports('deployment-preset')`으로 탭 gating
- 외부 데드라인: **2026-04-30(목) 또는 2026-05-04(월)** — 1차 마일스톤 완료

## 출처

- 백엔드 스키마: [`request.py`](https://github.com/lablup/backend.ai/blob/main/src/ai/backend/common/dto/manager/v2/deployment_revision_preset/request.py), [`revision_preset.py`](https://github.com/lablup/backend.ai/blob/main/src/ai/backend/manager/api/gql/deployment/types/revision_preset.py)
- 관련 이슈: [BA-5874](https://lablup.atlassian.net/browse/BA-5874)
