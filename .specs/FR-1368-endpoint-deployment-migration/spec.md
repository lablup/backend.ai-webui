# Endpoint → Deployment UI 마이그레이션 스펙

> **상태**: DRAFT — 사용자 최종 승인 대기 중

---

## 개요

모델 서빙 UI의 용어와 아키텍처를 "Endpoint" 중심에서 "Deployment" 중심으로 전면 재구축합니다.  
백엔드의 신규 Strawberry GraphQL API(`ModelDeployment`, `Route`, `ModelReplica`)와 정합성을 맞추며, 배포 라이프사이클과 레플리카 헬스 상태를 사용자가 한눈에 파악할 수 있는 Deployment UX를 새로 설계합니다.

**최소 지원 백엔드 버전**: 26.4.x (최신 LTS)  
구버전 호환성 fallback 없음. 신규 Strawberry API 전용으로 구현하며, 구버전 Graphene 기반 Endpoint 컴포넌트는 삭제합니다.

---

## 문제 정의

백엔드는 단순한 `Endpoint` 개념에서 다음과 같은 더 풍부한 모델로 발전했습니다:

- **ModelDeployment** — 서빙 최상위 단위 (기존 "Endpoint"에 대응)
- **Route** — 배포 내 단일 레플리카 슬롯. 독립된 생명주기와 헬스 상태 보유 (`RouteStatus` + `RouteHealthStatus`)
- **ModelReplica** — Route를 감싼 GQL 타입. Route와 1:1 관계

현재 WebUI(`EndpointDetailPage`, `EndpointList`, `EndpointStatusTag` 등)는 구버전 Graphene API 기준으로 구현되어 있으며, 다음 사항이 반영되어 있지 않습니다:

1. **AppProxy Active Pool** 개념 — HEALTHY 상태의 Route만 트래픽을 수신함
2. **Route 헬스 상태 머신 전체** — `NOT_CHECKED → HEALTHY/UNHEALTHY/DEGRADED → TERMINATING`
3. **레플리카 단위 헬스 세분화** — `readinessStatus`, `livenessStatus`, `activenessStatus`
4. **UNHEALTHY(확정 실패, red)와 DEGRADED(체크 불가 유예, amber)의 색상 구분 미흡**
5. **Revision History 및 Rollback** — 설정 변경 이력 추적, 이전 상태로 롤백

---

## 주요 결정 사항

| # | 항목 | 결정 내용 |
|---|------|-----------|
| 1 | URL 경로 | `/deployments`로 변경. 기존 `/serving` → `/deployments` 리디렉션 fallback 유지 |
| 2 | API 호환성 | 최신 LTS 26.4.x만 지원. 구버전 Graphene API 대응 없음. 신규 Strawberry API 전용으로 구현 |
| 3 | 헬스 색상 구분 | UNHEALTHY → **red/error**, DEGRADED → **amber/warning** |
| 4 | Route vs Replica | Route는 내부 구현 개념. UI에서는 **Replicas**로만 노출. 헬스/트래픽 상태는 각 Replica의 속성으로 표시 |
| 5 | Active Pool 위치 | **Replicas 탭**에서 확인 (Overview 섹션에 배치하지 않음 — 중복) |
| 6 | 최소 백엔드 버전 | **26.4.x** (최신 LTS). `sessionV2`(26.4.3+) 같은 상위 버전 필드는 optional 처리하고 `@since` 디렉티브 또는 런타임 가드로 감싼다 |
| 7 | 구버전 컴포넌트 처리 | 구버전 Graphene 기반 페이지/컴포넌트는 **삭제**. 신규 Deployment 컴포넌트로 완전 교체 |
| 8 | 편집 = 새 리비전 | 설정 변경 시 덮어쓰기 없음. `addModelRevision` mutation으로 새 리비전 스냅샷 생성 |

---

## 아키텍처 컨텍스트

### AppProxy 라우팅 구조

```
Manager ──(HEALTHY 라우트 동기화)──→ AppProxy
                                        ├── Health Checker (레플리카 프로브)
                                        └── Active Pool (HEALTHY 레플리카만 포함)
                                                │
                                    사용자 ────→ Replica A (HEALTHY ✓) — 트래픽 수신
                                                 Replica B (HEALTHY ✓) — 트래픽 수신
                                                 Replica C (UNHEALTHY ✗) — 트래픽 차단
                                                 Replica D (DEGRADED  ~) — 유예 중, 차단
```

`healthStatus = HEALTHY` AND `trafficStatus = ACTIVE`인 Replica만 AppProxy Active Pool에 포함되어 실제 사용자 트래픽을 수신합니다.

### Route 헬스 상태 머신

```
NOT_CHECKED
    │ (첫 번째 성공 시)
    ↓
HEALTHY ──(N회 연속 실패)──→ UNHEALTHY
    │                              │
    │                         (성공 시 회복)
    ↓                              │
DEGRADED                           ↓
(체크 불가 유예 중)              HEALTHY
    │
    └──(연속 실패)──→ UNHEALTHY ──(축출)──→ TERMINATING(RouteStatus)
```

| 상태 | 의미 | UI 색상 | Active Pool 포함 여부 |
|------|------|---------|----------------------|
| NOT_CHECKED | 초기 지연 기간, 판정 미결 | gray/default | 미포함 |
| HEALTHY | 정상, 트래픽 수신 중 | green/success | 포함 |
| UNHEALTHY | N회 연속 실패로 비정상 확정 | **red/error** | 미포함 |
| DEGRADED | 헬스체커 도달 불가 유예 | **amber/warning** | 미포함 |
| TERMINATING | `RouteStatus`로 표현 (종료 중) | — | 미포함 |

> **주의**: `RouteHealthStatus`는 `NOT_CHECKED | HEALTHY | UNHEALTHY | DEGRADED` 4가지 값을 가지며, TERMINATING은 `RouteStatus.TERMINATING`으로 별도 표현됩니다.

### 내부 Route 구조와 UI Replica의 관계

```
DeploymentRevisionRow
    └── routings (1:N)
            └── RoutingRow (내부 Route, 단일 Replica 슬롯)
                    └── session (FK → SessionRow, 1:1)

ModelReplica (Strawberry GQL 타입)
    └── RoutingRow를 감싼 사용자 노출용 래퍼
```

- 내부 `RoutingRow` 하나 = `SessionRow` 하나 = **UI상 Replica 하나**
- Route는 내부 구현 세부사항. **UI에서는 Replicas 탭으로만 노출**
- `healthStatus` / `trafficStatus`는 각 Replica의 속성으로 표시 (별도 Routes 탭 없음)
- 1개 리비전에 N개 Replica가 있어 카나리/블루-그린 배포(트래픽 분산)를 지원

---

## ID 명명 규칙

스펙 전반에서 배포 식별자를 명확히 구분합니다.

| 용도 | 이름 | 타입 | 설명 |
|------|------|------|------|
| URL 경로 파라미터 | `:deploymentId` | UUID (문자열) | `ModelDeployment.endpointId` 값 (사용자에게 노출되는 안정된 식별자, 기존 endpoint UUID와 동일) |
| GraphQL 쿼리/뮤테이션 입력 | `$deploymentId` | `ID!` (GlobalID) | `toGlobalId('ModelDeployment', uuid)`로 UUID를 Relay GlobalID로 변환하여 전달 |
| 레거시 리디렉션 소스 | `:endpointId` / `:serviceId` | UUID | 기존 URL의 파라미터 이름 유지 (리디렉션 대상에서도 같은 UUID 값을 `:deploymentId`로 매핑) |

**일관성 원칙**: 신규 URL에서는 항상 `:deploymentId`를 사용하고, 레거시 리디렉션 코드에서도 파라미터 값을 그대로 `:deploymentId` 자리에 넣는다.

---

## Feature Flag (backend.ai-client-esm.ts)

```ts
if (this.isManagerVersionCompatibleWith('26.4.3')) {
  this._features['model-deployment-extended-filter'] = true;
}
```

- `model-deployment-extended-filter`: 26.4.3+ 조건부 필터 필드 노출 여부 (관리자 전용 `domainName`, `resourceGroup`, `createdAt` 등)

---

## 페이지 간 내비게이션 흐름

**사용자 경로**

| 단계 | 진입 | 페이지 | URL |
|------|------|--------|-----|
| 1 | 사이드바 "Deployments" 클릭 | `DeploymentListPage` (배포 목록) | `/deployments` |
| 2a | 목록에서 "New Deployment" 클릭 | `DeploymentLauncherPage` (새 배포 생성) | `/deployments/create` |
| 2b | 생성 성공 | `DeploymentDetailPage` (배포 상세) | `/deployments/:deploymentId` |
| 3 | 목록에서 행 클릭 | `DeploymentDetailPage` (배포 상세) | `/deployments/:deploymentId` |
| 4a | 상세 페이지의 "Edit Configuration" 클릭 | `DeploymentLauncherPage` (배포 편집) | `/deployments/:deploymentId/edit` |
| 4b | 편집 성공 (새 리비전 생성) | `DeploymentDetailPage` (복귀) | `/deployments/:deploymentId` |

**관리자 경로**

| 단계 | 진입 | 페이지 | URL |
|------|------|--------|-----|
| 1 | 관리자 사이드바 "Deployments" 클릭 | `AdminDeploymentListPage` (전체 배포 목록) | `/admin-deployments` |
| 2 | 행 클릭 | `DeploymentDetailPage` (사용자 화면과 동일) | `/deployments/:deploymentId` |

---

## 요구사항

### 필수 구현 (Must Have)

---

#### Flow 1: 배포 목록 (Deployments List)

사용자가 사이드바에서 "Deployments"를 클릭하면 `/deployments` 페이지로 이동합니다.

**페이지: `DeploymentListPage`**

사용자 경험:
1. 배포 목록 테이블 표시
2. 각 행에서 배포의 핵심 상태를 즉시 파악 가능
3. 행 클릭 → Flow 3 (상세 페이지)
4. "New Deployment" 버튼 클릭 → Flow 2 (생성 페이지)

테이블 컬럼:
- 배포 이름
- 상태 (`DeploymentStatusTag`)
- 레플리카 요약 (`2 / 3 Healthy` 형태, 헬스 배지)
- Endpoint URL (복사 버튼 포함)
- 생성일

구현 요구사항:
- [ ] `DeploymentListPage.tsx` 신규 생성 (`/deployments` 경로)
- [ ] `DeploymentList.tsx` 신규 생성 — Relay 복수형 fragment를 받는 Table 컴포넌트 (`myDeployments` query 소유는 `DeploymentListPage`, `DeploymentList`는 `fragmentRef` 수신)
- [ ] `DeploymentStatusTag.tsx` 신규 생성 (배포 라이프사이클 상태 표시)
- [ ] 레플리카 헬스 요약 (`activeReplicas / replicas Healthy`) 컬럼 표시
- [ ] "New Deployment" 버튼 → `/deployments/create`로 이동
- [ ] 행 클릭 → `/deployments/:deploymentId`로 이동

**서버사이드 필터 / 정렬 / 페이지네이션 요구사항** (DeploymentList.tsx):

- [ ] `BAIGraphQLPropertyFilter` 연동 — `DeploymentFilter` 지원 필드만 노출:

  | 필드 | GQL 타입 | 버전 | 비고 |
  |------|----------|------|------|
  | `name` | `StringFilter` | 26.4.2+ | 항상 노출 |
  | `status` | `DeploymentStatusFilter` | 26.4.2+ | `equals` 고정, `PENDING/SCALING/DEPLOYING/READY/STOPPING/STOPPED` 선택 |
  | `endpointUrl` | `StringFilter` | 26.4.2+ | 항상 노출 |
  | `tags` | `StringFilter` | 26.4.2+ | 항상 노출 |
  | `openToPublic` | `Boolean` | 26.4.2+ | `valueMode: 'scalar'`, boolean 타입 |

  필터 객체는 `nuqs`의 `parseAsJson<DeploymentFilter>`로 URL 직렬화:
  ```ts
  filter: parseAsJson<DeploymentFilter>((v) => v as DeploymentFilter)
  ```

- [ ] `BAITable` `order` / `onChangeOrder` 연동 — 서버에서 지원하는 필드에만 `sorter: true` 부여 (`isEnableSorter` 패턴):

  ```ts
  // DeploymentOrderField 기준으로 지원 여부 결정
  const SORTABLE_KEYS = ['name', 'createdAt'] as const;
  const isEnableSorter = (key: string) => SORTABLE_KEYS.includes(key as any);
  ```

  | 컬럼 | sorter | DeploymentOrderField 매핑 |
  |------|--------|--------------------------|
  | 배포 이름 (`name`) | ✅ | `NAME` |
  | 상태 (`status`) | ❌ | 미지원 |
  | 레플리카 요약 | ❌ | 미지원 |
  | Endpoint URL | ❌ | 미지원 |
  | 생성일 (`createdAt`) | ✅ | `CREATED_AT` |

  BAITable의 `order` 문자열(`"name"` / `"-createdAt"` 등)을 `convertToOrderBy<DeploymentOrderBy>()` 헬퍼로 변환하여 query 변수에 전달:
  ```ts
  import { convertToOrderBy } from '../helper';
  // "−createdAt" → [{ field: "CREATED_AT", direction: "DESC" }]
  orderBy: convertToOrderBy<DeploymentOrderBy>(queryParams.order)
  ```

- [ ] URL 상태 (`nuqs` `useQueryStates`) — `urlKeyPrefix` 파라미터로 복수 인스턴스 충돌 방지:
  ```ts
  const [queryParams, setQueryParams] = useQueryStates({
    current:  parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(20),
    order:    parseAsStringLiteral(deploymentSortableFields),
    filter:   parseAsJson<DeploymentFilter>(...),
  }, { history: 'replace', urlKeys: { current: 'dPage', pageSize: 'dSize', order: 'dOrder', filter: 'dFilter' } });
  ```

- [ ] 서버사이드 pagination: `myDeployments(limit, offset, ...)` — `count` 필드를 `BAITable.pagination.total`에 전달

---

#### Flow 2: 새 배포 생성 (Create Deployment)

사용자가 "New Deployment"를 클릭하면 **즉시 빈 런처 폼으로 진입**합니다. 세션 런처와 동일한 UX 패턴을 따릅니다.

**페이지: `DeploymentLauncherPage` (`/deployments/create`)**

**레이아웃 — 세션 런처(`SessionLauncherPage`)와 동일한 구조**

```
┌──────────────────────────────────────────────────────────────────────┐
│  New Deployment                                                       │
├────────────────────────────────────────────────┬─────────────────────┤
│                                                │  1. Basic Info      │
│  (폼 본문 — 현재 step 내용)                    │     ●               │
│                                                │  2. Model & Runtime │
│                                                │     ○               │
│                                                │  3. Resources       │
│                                                │     ○               │
│                                                │  4. Review & Create │
│                                                │     ○               │
├────────────────────────────────────────────────┴─────────────────────┤
│  [← Previous]  [Next →]  [Skip to Review »]                          │
└──────────────────────────────────────────────────────────────────────┘
```

- **우측 Steps 패널**: `<Steps size="small" orientation="vertical" current={currentStep} />` — `screens.lg`(lg breakpoint 이상) 일 때만 표시, sticky 포지션 (`SessionLauncherPage` 참조)
- **하단 네비게이션** (매 step 공통):
  - `← Previous` — currentStep > 0 일 때 표시
  - `Next →` — 마지막 step 전까지 표시 (primary ghost)
  - `Skip to Review »` — 마지막 step 전까지 표시, 클릭 시 Review step으로 즉시 이동 (`session.launcher.SkipToConfirmAndLaunch` 패턴 참조)
  - Review step에서는 `Next`/`Skip to Review` 대신 **`Create Deployment`** (primary) 버튼 표시

**기본 진입 — 빈 폼으로 바로 시작**
1. Step 1 — **기본 정보**: 배포 이름, 공개 여부 (`open_to_public`)
2. Step 2 — **모델 & 런타임**: 모델 폴더(VFolder), 런타임 변형(`vllm` / `sglang` / `custom` 등), 컨테이너 이미지, 실행 커맨드(custom일 때만 표시)
3. Step 3 — **리소스**: GPU/CPU/메모리, 레플리카 수, 리소스 그룹, 클러스터 모드
4. Step 4 — **검토 & 생성**: 입력 내용 요약 확인 후 제출

> **범위 외 (별도 spec)**: "기존 배포에서 가져오기" (Recent Deployments pre-fill) 기능은 FR-2419로 완전 별도 진행. 이 스펙에 포함하지 않음.

제출 흐름:
- `createModelDeployment` mutation → `deploymentId` 반환
- `addModelRevision` mutation으로 배포 설정 적용 (image, model, resources, environ 등)
- 성공 → `/deployments/:deploymentId` 상세 페이지로 이동

구현 요구사항:
- [ ] `DeploymentLauncherPage.tsx` 신규 생성 (생성/편집 통합 진입점)
- [ ] `DeploymentLauncherPageContent.tsx` 신규 생성 (다단계 폼 본문)
- [ ] **레이아웃**: 좌측 폼 + 우측 세로 Steps 패널 (`SessionLauncherPage` 구조 참조)
  - 우측 `<Steps size="small" orientation="vertical" />` — lg breakpoint 이상일 때만 표시, sticky
  - `antd` `useBreakpoint` (`screens.lg`) 으로 조건부 렌더링
- [ ] **하단 네비게이션** 구현
  - `← Previous`: currentStep > 0 일 때 표시
  - `Next →`: 마지막 step 전까지 표시 (primary ghost)
  - `Skip to Review »`: 마지막 step 전까지 표시, Review step으로 즉시 이동
  - Review step: `Create Deployment` (primary) 버튼
- [ ] `createModelDeployment` + `addModelRevision` GQL mutation 연동
- [ ] **URL 상태 동기화** (`nuqs` `useQueryStates` 사용): 새로고침 후에도 폼 상태 유지
  - `step`: 현재 단계 번호 (`parseAsInteger.withDefault(1)`)
  - `formValues`: 핵심 폼 값 JSON (`parseAsJson` 또는 `JsonParam`, `withDefault({})`)
  - 기존 `ServiceLauncherPageContent`의 `useQueryParams` 패턴 참조
- [ ] 성공 후 상세 페이지로 이동

---

#### Flow 3: 배포 상세 (Deployment Detail)

사용자가 목록에서 배포를 클릭하면 상세 페이지로 이동합니다. 배포의 현재 상태, 레플리카 헬스, 리비전 히스토리를 한 페이지에서 파악할 수 있어야 합니다.

**페이지: `DeploymentDetailPage` (`/deployments/:deploymentId`)**

사용자 경험:
- 헤더: 배포 이름, 상태 배지, Endpoint URL 복사 버튼, "Delete" 버튼
  > "Edit" 진입점은 Overview 섹션의 **"Edit Configuration"** 버튼 하나로 통일. 헤더에는 별도 Edit 버튼 없음

**Overview 섹션** (메인 본문 상단, 탭 밖):

> **Active Pool은 Overview에서 제거.** 첫 번째 탭(Replicas)에서 이미 레플리카 상태를 전체 확인할 수 있으므로 중복. Configuration 카드만 Overview에 배치.

```
┌─────────────────────────────────────────────────────────────┐
│  Configuration                       [Edit Configuration]   │
├─────────────────────────────────────┬───────────────────────┤
│  Image                              │  vllm:latest          │
│  Model                              │  my-llama-model       │
│  Cluster Mode / Size                │  single / 1           │
│  Replicas                           │  3                    │
│  Resource Group                     │  default              │
│  Resources                          │  GPU 1, CPU 4, 16 GiB │
└─────────────────────────────────────┴───────────────────────┘
```

- Configuration 카드: 현재 Active 리비전의 설정 요약 (읽기 전용). "Edit Configuration" 버튼 → Flow 4

**탭 구성**:

| 탭 | 내용 |
|----|------|
| Replicas | 전체 레플리카 목록 + 헬스 상태 |
| Revision History | 리비전 목록 + Rollback 버튼 |
| Access Tokens | 토큰 목록 + 생성/삭제 |
| Auto-scaling | 규칙 목록 + 생성/편집/삭제 |

**Replicas 탭**:
- 각 행: `replicaId`, `healthStatus` (`ReplicaStatusTag`), `trafficStatus`, `trafficRatio`, `revision`, `createdAt`
- 행 클릭 시 Replica 상세 Drawer 오픈
- Drawer 내용: `readinessStatus`, `livenessStatus`, `activenessStatus`, `sessionId` (Session 링크), `revisionId`, `createdAt`

**Revision History 탭**:
- 리비전 목록: 번호, 생성일, 이미지, 리소스 요약
- 각 리비전에 "Rollback" 버튼 표시 → Flow 5

**Access Tokens 탭**:
- 토큰 목록 표시
- 신규 토큰 생성 버튼
- 토큰 삭제

**Auto-scaling 탭**:
- 오토스케일링 규칙 목록
- 규칙 생성/편집/삭제

구현 요구사항:
- [ ] `DeploymentDetailPage.tsx` 신규 생성 (Strawberry API 기반)
- [ ] `DeploymentConfigurationSection.tsx` 신규 생성 (Overview 섹션 — Configuration 카드 + "Edit Configuration" 버튼)
- [ ] `ReplicaStatusTag.tsx` 신규 생성 (Replica 헬스 상태 태그, 아래 별도 스펙 참조)
- [ ] `DeploymentReplicasTab.tsx` 신규 생성 (Replicas 탭)
- [ ] `DeploymentRevisionHistoryTab.tsx` 신규 생성 (Revision History 탭)
- [ ] `DeploymentAccessTokensTab.tsx` 신규 생성 (Access Tokens 탭, 기존 `EndpointTokenGenerationModal` 로직 참조하여 새로 구현)
- [ ] `DeploymentAutoScalingTab.tsx` 신규 생성 (Auto-scaling 탭)
- [ ] `DeploymentOwnerInfo.tsx` 신규 생성 (소유자 정보, 기존 `EndpointOwnerInfo` 로직 참조하여 새로 구현)
- [ ] Replica 상세 Drawer 구현 (Replicas 탭 내)
- [ ] **활성 탭 URL 동기화** (`nuqs` `useQueryStates` 사용): 새로고침·공유 후에도 탭 위치 유지
  ```ts
  const tabValues = ['replicas', 'revision-history', 'access-tokens', 'auto-scaling'] as const;
  const [{ tab }, setTab] = useQueryStates({
    tab: parseAsStringLiteral(tabValues).withDefault('replicas'),
  });
  ```
- [ ] 페이지 자동 갱신 (`fetchKey` 기반 polling 또는 refetch)

---

#### Flow 4: 배포 설정 편집 (Edit Deployment)

사용자가 Overview 섹션의 "Edit Configuration" 버튼을 클릭합니다.

**페이지: `DeploymentLauncherPage` (`/deployments/:deploymentId/edit`)**

사용자 경험:
- Flow 2와 동일한 다단계 폼 (`DeploymentLauncherPageContent` 재사용)
- 현재 Active 리비전의 데이터로 폼 pre-fill
- 폼 상단에 **안내 배너** 표시: "설정을 변경하면 새 리비전이 생성됩니다. 이전 리비전은 보존됩니다."

제출 흐름:
- `addModelRevision` mutation 호출 (새 리비전 생성, 이전 리비전 보존)
- 성공 → `/deployments/:deploymentId` 상세 페이지로 복귀

구현 요구사항:
- [ ] `DeploymentLauncherPage`가 create/edit 모드 모두 처리 (URL param으로 구분)
- [ ] 편집 모드: `deployment(id: $deploymentId)` + `currentRevision` 데이터로 폼 pre-fill
- [ ] 편집 모드 안내 배너 표시 (새 리비전 생성 안내)
- [ ] `addModelRevision` mutation 연동
- [ ] 성공 후 상세 페이지로 복귀

---

#### Flow 5: Rollback

사용자가 리비전 히스토리 탭에서 이전 리비전의 "Rollback" 버튼을 클릭합니다.

사용자 경험:
1. "Rollback" 버튼 클릭
2. 확인 다이얼로그: "리비전 #N으로 롤백하시겠습니까? 현재 리비전이 교체됩니다."
3. 확인 → `activateRevision` mutation 호출
4. 성공 → 상세 페이지 갱신, Active 리비전 변경 표시

구현 요구사항:
- [ ] `DeploymentRevisionHistoryTab` 내 Rollback 버튼 구현
- [ ] 확인 다이얼로그 표시
- [ ] `activateRevision` mutation 연동
- [ ] 성공 후 페이지 refetch

---

#### Flow 6: 관리자 배포 목록 (Admin Deployments)

**페이지: `AdminDeploymentListPage` (`/admin-deployments`)**

사용자 경험:
- 전체 사용자/프로젝트의 배포 목록 표시
- 소유자(사용자, 프로젝트) 정보 컬럼 포함
- Flow 1과 동일한 테이블 구조 + 관리자용 추가 컬럼

구현 요구사항:
- [ ] `AdminDeploymentListPage.tsx` 신규 생성 (`/admin-deployments` 경로, 기존 `/admin-serving`, `/admin-session` 컨벤션과 일치)
- [ ] `adminDeployments` query 사용 (Flow 1의 `myDeployments` 대신)
- [ ] 소유자 정보 표시 (`DeploymentOwnerInfo` 컴포넌트)

**서버사이드 필터 / 정렬 / 페이지네이션 요구사항** (AdminDeploymentList 또는 DeploymentList에 `mode="admin"` prop):

- [ ] Flow 1 필터에 추가되는 관리자 전용 필드 (26.4.3+ 조건부 노출):

  | 필드 | GQL 타입 | 버전 조건 | 비고 |
  |------|----------|-----------|------|
  | `domainName` | `StringFilter` | 26.4.3+ | `baiClient.supports('model-deployment-extended-filter')` |
  | `resourceGroup` | `StringFilter` | 26.4.3+ | 동일 |
  | `createdAt` | `DateTimeFilter` | 26.4.3+ | datetime picker 사용 |

  ```ts
  const isExtendedFilter = baiClient.supports('model-deployment-extended-filter');
  filterProperties={filterOutEmpty([
    { key: 'name', ... },          // 항상 노출
    { key: 'status', ... },        // 항상 노출
    isExtendedFilter && { key: 'domainName', propertyLabel: t('...'), type: 'string' },
    isExtendedFilter && { key: 'resourceGroup', propertyLabel: t('...'), type: 'string' },
    isExtendedFilter && { key: 'createdAt', propertyLabel: t('...'), type: 'datetime' },
  ])}
  ```

- [ ] 관리자 전용 컬럼 추가: `domainName`, `projectName`, 소유자(createdBy)
- [ ] 정렬: Flow 1과 동일 + `DOMAIN`, `PROJECT`, `RESOURCE_GROUP` sorter 추가 (26.4.3+)

---

#### URL 경로 변경 + Fallback 리디렉션

- [ ] URL 경로 `/serving` → `/deployments`로 변경
- [ ] `/serving/:serviceId` → `/deployments/:deploymentId`로 변경 (값은 동일 UUID, 파라미터 이름만 통일)
- [ ] 기존 경로 fallback 리디렉션 추가 (북마크/외부 링크 호환성 유지)
  ```tsx
  { path: '/serving', Component: () => <WebUINavigate to="/deployments" replace /> },
  { path: '/serving/:serviceId', Component: () => {
      const { serviceId } = useParams();
      return <WebUINavigate to={`/deployments/${serviceId}`} replace />;
  }},
  ```
- [ ] `/admin-serving` → `/admin-deployments`로 변경 (하이픈 컨벤션 유지)
  ```tsx
  { path: '/admin-serving', Component: () => <WebUINavigate to="/admin-deployments" replace /> },
  ```
- [ ] Launcher URL 변경:
  - Create: `/service/start` → `/deployments/create`
  - Edit: `/service/update/:endpointId` → `/deployments/:deploymentId/edit` (값은 동일 UUID)
  - 기존 경로 fallback 리디렉션 추가:
    ```tsx
    { path: '/service/start', Component: () => <WebUINavigate to="/deployments/create" replace /> },
    { path: '/service/update/:endpointId', Component: () => {
        const { endpointId } = useParams();
        // 기존 endpoint UUID를 신규 :deploymentId 자리에 그대로 전달
        return <WebUINavigate to={`/deployments/${endpointId}/edit`} replace />;
    }},
    ```
- [ ] `routes.tsx`의 `handle.labelKey` 업데이트: `'webui.menu.Serving'` → `'webui.menu.Deployments'`

---

#### ReplicaStatusTag 컴포넌트

신규 컴포넌트: `react/src/components/ReplicaStatusTag.tsx`

- `RouteHealthStatus` (`NOT_CHECKED | HEALTHY | UNHEALTHY | DEGRADED`) 및 `LivenessStatus` 표시
- `BAITag` props 확장 (`component-props-extension.md` 규칙 준수)
- 색상 매핑:
  - `NOT_CHECKED` → gray/default
  - `HEALTHY` → green/success
  - `UNHEALTHY` → **red/error** (확정 비정상)
  - `DEGRADED` → **amber/warning** (체크 불가 유예)
- 각 상태에 상태 의미를 설명하는 Tooltip 포함
- Storybook 스토리 필요

```tsx
export interface ReplicaStatusTagProps extends Omit<BAITagProps, 'color'> {
  status: RouteHealthStatus | LivenessStatus;
  showTooltip?: boolean;
}
```

상태별 툴팁 텍스트:
- `NOT_CHECKED`: "초기 지연 기간 중. 첫 번째 헬스체크 전 상태입니다."
- `HEALTHY`: "정상. AppProxy Active Pool에 포함되어 트래픽을 수신 중입니다."
- `UNHEALTHY`: "비정상 확정. 연속 실패 횟수 초과로 Active Pool에서 제외되었습니다."
- `DEGRADED`: "헬스체커 도달 불가 유예 상태. Active Pool에서 임시 제외되었습니다."

---

#### i18n 키 추가

신규 추가 키를 `resources/i18n/en.json`에 추가한 뒤, `/fw:i18n` 스킬로 22개 지원 언어 전체에 번역을 자동 생성합니다.

```json
{
  "webui": {
    "menu": {
      "Deployments": "Deployments"
    }
  },
  "modelService": {
    "DeploymentId": "Deployment ID",
    "DeploymentName": "Deployment Name",
    "NewDeployment": "New Deployment",
    "Deployments": "Deployments",
    "DeploymentDetail": "Deployment Detail",
    "Replicas": "Replicas",
    "ReplicaId": "Replica ID",
    "ReplicaDetail": "Replica Detail",
    "ActivePool": "Active Pool",
    "ActivePoolDescription": "Replicas currently receiving traffic through AppProxy",
    "HealthySummary": "{{healthy}} / {{total}} Healthy",
    "NotChecked": "Not Checked",
    "Healthy": "Healthy",
    "Unhealthy": "Unhealthy",
    "Degraded": "Degraded",
    "ReplicaHealthStatus": "Replica Health Status",
    "LivenessStatus": "Liveness Status",
    "ReadinessStatus": "Readiness Status",
    "ActivenessStatus": "Activeness Status",
    "RevisionHistory": "Revision History",
    "Rollback": "Rollback",
    "RollbackConfirm": "Are you sure you want to rollback to Revision #{{revisionNumber}}? The current revision will be replaced.",
    "RollbackSuccess": "Rollback to Revision #{{revisionNumber}} has been requested.",
    "TrafficSplit": "Traffic Split",
    "EditConfiguration": "Edit Configuration",
    "EditDeployment": "Edit Deployment",
    "NewRevisionWillBeCreated": "Saving will create a new Revision. The previous Revision will be preserved.",
    "NewRevisionWillBeCreatedConfirm": "A new Revision will be created. Continue?",
    "DeploymentUpdated": "Deployment has been updated.",
    "DeploymentCreated": "Deployment has been created.",
    "FailedToUpdateDeployment": "Failed to update deployment.",
    "FailedToCreateDeployment": "Failed to create deployment.",
    "FilterByName": "Name",
    "FilterByStatus": "Status",
    "FilterByEndpointUrl": "Endpoint URL",
    "FilterByTags": "Tags",
    "FilterByOpenToPublic": "Public",
    "FilterByDomainName": "Domain",
    "FilterByResourceGroup": "Resource Group",
    "FilterByCreatedAt": "Created At"
  }
}
```

---

---

#### Flow 7: 모델 폴더에서 바로 배포 (Quick Deploy)

모델 폴더 목록 또는 모델 카드에서 배포를 시작합니다.

**진입점**: 모델 폴더 목록, 모델 카드, Model Store 등

**버튼 구성** (`[Deploy | ▼]` 분할 버튼):
- **`Deploy` (메인 버튼)**: 폼 없이 즉시 배포 생성 (기존 Quick Deploy 동작)
- **`▼` (드롭다운 버튼)** → `세부 설정 후 배포하기` 메뉴 → `DeploymentLauncherPage` preview 단계(Step 2 또는 Step 1)로 이동, 모델 폴더 pre-fill

**`Deploy` 버튼 Quick Deploy 사용자 경험:**
1. "Deploy" 클릭
2. 즉시 배포 생성 시작 — 별도 폼 없음
3. 백그라운드 알림으로 진행 상황 표시: "배포를 시작하는 중..."
4. 준비 완료 → 알림에 "/chat으로 이동" 링크 표시
5. 준비 실패(타임아웃) → 알림에 배포 상세 페이지(`/deployments/:deploymentId`) 링크 표시

배포 설정 소스:
- 런타임: `custom` 고정
- 이미지/리소스/커맨드 등: 모델 폴더 내 **`deployment-config.yaml`** 파일에서 읽음
  - (현재 코드는 `service-definition.toml` 참조 중 → `deployment-config.yaml`로 전환 예정)

제출 흐름:
- `createModelDeployment` mutation → `deploymentId` 반환
- `addModelRevision` mutation (minimal config, `deployment-config.yaml` 기반)
- 백그라운드에서 레플리카 준비 상태 폴링 (GQL `deployment { activeReplicas replicas }` 필드 사용)
- 기존: `GET /services/:endpoint_id` active_routes 폴링 → GQL 폴링으로 교체

구현 요구사항:
- [ ] `useDeploymentLauncher.ts` 신규 생성 (기존 `useModelServiceLauncher.ts` 대체)
  - `createServiceInput` → `createDeploymentInput` (vfolderId, resourceGroup → minimal deployment config)
  - `mutationToCreateService` (`POST /services`) → `createModelDeployment` + `addModelRevision` GQL mutation
  - 폴링 로직: `GET /services/:id` → 신규 Deployment API로 교체
  - 알림 링크: `/serving/:endpointId` → `/deployments/:deploymentId`
- [ ] `useModelServiceLauncher.ts` — `useDeploymentLauncher` 지원 후 제거 또는 deprecated 처리
- [ ] **`deployment-config.yaml` 지원**: 모델 폴더에서 `deployment-config.yaml` 읽기 (기존 `service-definition.toml` 대체)
- [ ] 26.4.2 미만 백엔드: 기존 `useModelServiceLauncher` 유지 (fallback)

**URL pre-fill 경로** (폼 경유 빠른 시작):
- `/deployments/create?model=<vfolderId>` — 풀 폼(Flow 2)을 열되 모델 폴더를 pre-fill
- 기존: `/service/start?model=<vfolderId>` → fallback 리디렉션 추가

---

### 선택 구현 (Nice to Have)

- [ ] **Route 상태 필터**: Replicas 탭에서 `healthStatus`(NOT_CHECKED, HEALTHY, UNHEALTHY, DEGRADED)로 필터링
- [ ] **배포 전략 시각화**: Canary/Blue-Green 배포 시 트래픽 비율을 Bar 또는 퍼센트로 시각 표시
- [ ] **배포 목록 실시간 헬스 갱신**: 목록 테이블에서 헬스 요약 컬럼 자동 갱신

---

## 컴포넌트 아키텍처

### 신규 생성 파일

```
react/src/pages/
  DeploymentListPage.tsx           # Flow 1: 배포 목록
  AdminDeploymentListPage.tsx      # Flow 6: 관리자 배포 목록
  DeploymentDetailPage.tsx         # Flow 3: 배포 상세
  DeploymentLauncherPage.tsx       # Flow 2 & 4: 생성/편집 통합 진입점

react/src/hooks/
  useDeploymentLauncher.ts         # Flow 7: 모델 폴더에서 바로 배포 (useModelServiceLauncher 대체)

react/src/components/
  DeploymentList.tsx                   # 배포 목록 테이블
  DeploymentStatusTag.tsx              # 배포 상태 태그
  DeploymentLauncherPageContent.tsx    # 생성/편집 다단계 폼 본문
  ReplicaStatusTag.tsx                 # 레플리카 헬스 상태 태그
  DeploymentConfigurationSection.tsx   # Overview 섹션 — Configuration 카드
  DeploymentReplicasTab.tsx            # Replicas 탭
  DeploymentRevisionHistoryTab.tsx     # Revision History 탭
  DeploymentAccessTokensTab.tsx        # Access Tokens 탭
  DeploymentAutoScalingTab.tsx         # Auto-scaling 탭
  DeploymentOwnerInfo.tsx              # 소유자 정보
```

### 구버전 컴포넌트 (삭제 대상)

신규 Deployment 컴포넌트로 완전 교체하므로 아래 파일들을 삭제합니다.

```
react/src/pages/
  ServingPage.tsx                  # 삭제
  EndpointDetailPage.tsx           # 삭제
  ServiceLauncherPage.tsx          # 삭제

react/src/components/
  EndpointList.tsx                 # 삭제
  EndpointStatusTag.tsx            # 삭제
  EndpointDiagnosticsSection.tsx   # 삭제
  EndpointOwnerInfo.tsx            # 삭제
  EndpointTokenGenerationModal.tsx # 삭제
  ServiceLauncherPageContent.tsx   # 삭제
```

### 변경 필요 파일

| 파일 경로 | 변경 내용 |
|----------|---------|
| `react/src/routes.tsx` | URL 경로 변경, fallback 리디렉션 추가, 신규 Deployment 페이지 import, 구버전 Endpoint 페이지 제거 |
| `react/src/hooks/useWebUIMenuItems.tsx` | 메뉴 경로 및 레이블 업데이트 |
| `src/lib/backend.ai-client-esm.ts` | `model-deployment-extended-filter` feature flag 추가 (26.4.3+ 조건부 필터용) |
| `resources/i18n/en.json` | 신규 i18n 키 추가 (22개 언어 번역 필요) |

---

## 폼 필드 매핑 (편집 폼 pre-fill 참조)

| 기존 Graphene 필드 | 신규 Strawberry 필드 |
|-------------------|---------------------|
| `endpoint.name` | `deployment.metadata.name` |
| `endpoint.replicas` | `revision.replicaCount` |
| `endpoint.resource_slots` | `revision.resourceSlots` |
| `endpoint.resource_group` / `scaling_group` | revision 설정 내 해당 필드 |
| `endpoint.environ` | `revision.modelDefinition.environ` |
| `endpoint.runtime_variant.name` | `revision.modelDefinition.runtimeVariant` |
| `endpoint.image_object` | `revision.modelDefinition.image` |
| `endpoint.model` (vfolder ID) | `revision.modelDefinition.model` |
| `endpoint.model_mount_destination` | `revision.modelDefinition.modelMountDestination` |
| `endpoint.model_definition_path` | `revision.modelDefinition.modelDefinitionPath` |
| `endpoint.extra_mounts` | `revision.modelDefinition.extraMounts` |
| `endpoint.open_to_public` | `deployment.networkAccess.openToPublic` |
| `endpoint.cluster_mode`, `endpoint.cluster_size` | `revision.clusterConfig.mode`, `revision.clusterConfig.size` (`ClusterConfig` 타입) |

---

## 범위 외 (Out of Scope)

- 백엔드 API 변경 — `RouteHealthStatus`, `ModelReplica`, `LivenessStatus` 등 스키마는 이미 구현됨
- 오토스케일링 규칙 UI — `AutoScalingRuleEditorModal`, `AutoScalingRuleList` 모두 이미 Deployment API(`modelDeploymentId`, `deploymentId`) 기반으로 구현됨. 추가 변경 불필요
- Chat 페이지의 Endpoint 관련 컴포넌트 (`EndpointSelect.tsx`, `EndpointTokenSelect.tsx`)
- API 클라이언트 레벨의 `useApiEndpoint.ts`, `useEduAppApiEndpoint.ts` (다른 의미의 "endpoint")

---

## 핵심 GQL 스키마 참조

### Route (Strawberry, `routes` 쿼리)

```graphql
type Route {
  id: ID!
  status: RouteStatus!              # PROVISIONING | RUNNING | TERMINATING | TERMINATED | FAILED_TO_START
  healthStatus: RouteHealthStatus!  # NOT_CHECKED | HEALTHY | UNHEALTHY | DEGRADED  (since 26.4.0)
  trafficStatus: RouteTrafficStatus! # ACTIVE | INACTIVE
  trafficRatio: Float!
  createdAt: DateTime
  errorData: JSON
  deployment: ModelDeployment!
  sessionV2: SessionV2              # since 26.4.3 — optional, @since gate required in UI
  revision: ModelRevision
}
```

### ModelReplica (Strawberry, `replicas` 쿼리 on ModelDeployment)

```graphql
type ModelReplica {
  id: ID!
  sessionId: ID!
  revisionId: ID!
  readinessStatus: ReadinessStatus!    # NOT_CHECKED | HEALTHY | UNHEALTHY
  livenessStatus: LivenessStatus!      # NOT_CHECKED | HEALTHY | UNHEALTHY | DEGRADED
  activenessStatus: ActivenessStatus!  # ACTIVE | INACTIVE
  createdAt: DateTime!
  sessionV2: SessionV2                 # since 26.4.3 — optional, @since gate required in UI
  revision: ModelRevision!
}
```

### ModelDeployment (Strawberry)

```graphql
type ModelDeployment {
  id: ID!                          # GlobalID (Relay)
  metadata: ModelDeploymentMetadata!
  networkAccess: ModelDeploymentNetworkAccess!
  replicaState: ReplicaState!      # { desiredReplicaCount: Int! }
  currentRevision: ModelRevision   # since 26.4.3
  creator: UserV2                  # since 26.4.3
  replicas(filter, orderBy, limit, offset): ModelReplicaConnection!
  revisionHistory(filter, orderBy, limit, offset): ModelRevisionConnection!
  autoScalingRules(filter, orderBy, limit, offset): AutoScalingRuleConnection!
  accessTokens(filter, orderBy, limit, offset): AccessTokenConnection!
}

type ModelDeploymentMetadata {
  name: String!
  status: DeploymentStatus!        # PENDING | SCALING | DEPLOYING | READY | STOPPING | STOPPED
  tags: [String!]!
  createdAt: DateTime!
  updatedAt: DateTime!
  projectId: ID!
  domainName: String!
}

type ModelDeploymentNetworkAccess {
  endpointUrl: String
  openToPublic: Boolean!
}

type ReplicaState {
  desiredReplicaCount: Int!
}
```

### DeploymentFilter / DeploymentOrderBy

```graphql
input DeploymentFilter {
  name: StringFilter           # 26.4.2+
  status: DeploymentStatusFilter
  openToPublic: Boolean
  tags: StringFilter
  endpointUrl: StringFilter
  domainName: StringFilter     # 26.4.3+
  projectId: UUIDFilter        # 26.4.3+
  resourceGroup: StringFilter  # 26.4.3+
  createdUserId: UUIDFilter    # 26.4.3+
  createdAt: DateTimeFilter    # 26.4.3+
  AND/OR/NOT: [DeploymentFilter!]
}

input DeploymentOrderBy {
  field: DeploymentOrderField!  # NAME | CREATED_AT | DESTROYED_AT | DOMAIN | PROJECT | RESOURCE_GROUP | TAG
  direction: OrderDirection! = DESC
}
```

쿼리 시그니처:
```graphql
myDeployments(filter: DeploymentFilter, orderBy: [DeploymentOrderBy!], limit: Int, offset: Int): ModelDeploymentConnection!
projectDeployments(scope: ProjectDeploymentScope!, filter: ..., orderBy: ..., limit: Int, offset: Int): ModelDeploymentConnection!
adminDeployments(filter: DeploymentFilter, orderBy: [DeploymentOrderBy!], limit: Int, offset: Int): ModelDeploymentConnection!
```

`convertToOrderBy<DeploymentOrderBy>(orderString)` 헬퍼(`react/src/helper/index.tsx`)로 BAITable 문자열 포맷(`"-createdAt"`) → `[{ field: "CREATED_AT", direction: "DESC" }]` 변환.

---

## 구현 단계 계획

### Phase 1 — 기반 작업

1. `backend.ai-client-esm.ts`에 `model-deployment-extended-filter` feature flag 추가 (26.4.3+ 조건부 필터용)
2. `routes.tsx`: URL 경로 변경 + fallback 리디렉션 (신규 Deployment 페이지로 직접 라우팅)
3. `useWebUIMenuItems.tsx`: 메뉴 레이블 및 경로 업데이트
4. i18n 신규 키 추가 (`en.json`)

### Phase 2 — 공통 컴포넌트

5. `ReplicaStatusTag.tsx` 신규 생성 + Storybook 스토리
6. `DeploymentStatusTag.tsx` 신규 생성
7. `DeploymentOwnerInfo.tsx` 신규 생성

### Phase 3 — 배포 목록 페이지

8. `DeploymentList.tsx` 신규 생성 (Strawberry API 기반)
9. `DeploymentListPage.tsx` 신규 생성
10. `AdminDeploymentListPage.tsx` 신규 생성

### Phase 4 — 배포 생성/편집 페이지 (Launcher)

11. `DeploymentLauncherPageContent.tsx` 신규 생성 (다단계 폼, create/edit 통합)
12. `DeploymentLauncherPage.tsx` 신규 생성
13. `createModelDeployment` + `addModelRevision` mutation 연동
14. 편집 모드: `deployment.currentRevision` 기반 pre-fill + 안내 배너 (새 리비전 생성 안내)
15. Relay 컴파일 + `__generated__` 파일 확인

### Phase 5 — 배포 상세 페이지

16. `DeploymentActivePoolSection.tsx` 신규 생성 (Active Pool + Configuration 카드 포함 Overview 섹션)
17. `DeploymentReplicasTab.tsx` 신규 생성 (Replica 목록 + 상세 Drawer)
18. `DeploymentRevisionHistoryTab.tsx` 신규 생성 (리비전 목록 + Rollback)
19. `DeploymentAccessTokensTab.tsx` 신규 생성
20. `DeploymentAutoScalingTab.tsx` 신규 생성
21. `DeploymentDetailPage.tsx` 신규 생성 (Overview 섹션 + 4탭 조합)

---

## 향후 작업 (이 스펙 이후)

- **배포 지표 탭**: deployment에서 표시할 만한 지표가 있으면 상세 페이지에 별도 탭으로 추가
- **상태 히스토리**: 배포의 상태 변경 이력을 UI에서 확인할 수 있도록 히스토리 뷰 제공
- **기존 배포에서 가져오기** (FR-2419): 별도 spec으로 진행. Deployment 전반 구현 완료 후 단독 스펙 작성

---

## 관련 이슈

- FR-2591: Route trafficStatus 수동 전환 (BAIRouteNodes의 TODO)
- FR-2300: Diagnostics 시스템 (EndpointDiagnosticsSection 원본)
- `draft-auto-scaling-rule-ux`: 오토스케일링 규칙 UX 개선
- FR-2581: 이전 모델 서비스 UI 수정

---

## 변경 이력

- 2026-04-22: PR 리뷰 피드백 반영
  - 구버전 Endpoint 컴포넌트 "유지" → "삭제 대상"으로 변경 (26.4.x LTS만 지원, fallback 제거)
  - `DeploymentList.tsx` 패턴 수정: `useRefetchableFragment` → 복수형 fragment-receiving Table 컴포넌트
  - "Recent Deployments" (FR-2419) 이 스펙에서 제거 → 완전 별도 spec으로 분리
  - Overview 섹션에서 Active Pool 제거 (Replicas 탭과 중복), Configuration 카드만 유지
  - Flow 7 Quick Deploy UX 변경: `[Deploy | ▼]` 분할 버튼 — `▼` 드롭다운에 "세부 설정 후 배포하기" 추가 → launcher preview 진입
  - 향후 작업 섹션 추가 (배포 지표 탭, 상태 히스토리)
- 2026-04-22: Flow 2 UX 변경 — 기본 진입을 빈 폼으로, "Recent Deployments" 버튼을 오른쪽 상단에 배치하여 모달로 기존 배포 선택 (세션 런처 Recent History 패턴)
- 2026-04-21: 서버사이드 페이지네이션/필터/정렬 패턴 명세 추가 (DeploymentFilter, DeploymentOrderBy, isEnableSorter, convertToOrderBy, nuqs URL 직렬화)
- 2026-04-21: Settings 탭 제거 → Overview 섹션의 Configuration 카드로 통합. 탭 5개 → 4개
- 2026-04-21: 초기 초안 작성 (아키텍처 다이어그램 + 코드베이스 분석 기반)
- 2026-04-21: 사용자 확인 사항 6개 반영하여 한국어로 전면 재작성
  - URL: `/deployments` 변경 + `/serving` fallback 리디렉션
  - API: 26.4.2 기준 버전 분기, 별도 파일 관리
  - 색상: UNHEALTHY(red) vs DEGRADED(amber) 명확 구분
  - Route = Replica 1:1 관계 확인 및 반영
  - Active Pool 섹션: 메인 본문 배치
  - 최소 백엔드 버전: 26.4.2
- 2026-04-21: ServiceLauncherPage/ServiceLauncherPageContent 마이그레이션 범위 추가
- 2026-04-21: Flow 7 추가 — 모델 폴더에서 바로 배포 (useDeploymentLauncher, deployment-config.yaml 기반)
- 2026-04-21: Flow 2에 "기존 배포에서 가져오기" 추가 (FR-2419 반영)
- 2026-04-21: 요구사항 전면 재구조화 — User Flow 중심으로 재작성
  - US-1~US-8 구조 → Flow 1~7 사용자 흐름 중심으로 전환
  - 신규 컴포넌트 처음부터 새로 작성 (기존 컴포넌트 rename/patch 방식 폐기)
  - 구버전 컴포넌트는 라우팅 fallback 전용으로 유지 (수정 없음)
  - 페이지 간 내비게이션 다이어그램 추가
  - 컴포넌트 아키텍처 섹션 신설 (신규/유지/변경 파일 명확 구분)
  - Phase 계획을 신규 빌드 중심으로 재편
