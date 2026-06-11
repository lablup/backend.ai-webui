# 감사 로그 테이블 Spec

> 본 문서는 한국어로 작성되었습니다. 파일명은 `spec.md` 규칙에 따라 유지하며, Jira 이슈 제목/설명은 영어로 작성합니다.
>
> **Epic**: FR-2920 / **Spec Task**: FR-2949

## Overview

일반 사용자/운영자가 리소스 **상세 페이지**(Compute Session 상세, VFolder, Model Deployment 상세)에서 해당 리소스 범위의 감사 로그(Audit Log)를 **직접 열어** 무슨 일이 있었는지 확인할 수 있는 화면을 정의한다. 문제 상황을 마주쳤을 때 관리자/지원팀에 의존하지 않고 사용자 스스로 변경 이력을 추적하는 것이 목적이다. 본 스펙은 유저 스토리와 화면 동작(UX)을 먼저 정의하고, 구현 방식은 마지막에 참고 수준으로만 언급한다.

## Problem Statement

- 현재 감사 로그(`AuditLogV2`)는 관리자 전용 쿼리로만 노출되어 있어, 일반 사용자가 본인이 소유/접근 가능한 리소스의 변경 이력을 확인할 수 없다.
- 운영 사고나 권한 문제를 조사할 때 사용자가 "내 Deployment의 revision/state가 언제 왜 바뀌었나", "이 세션에 무슨 작업이 가해졌나", "내 VFolder에 누가 무엇을 했나"를 스스로 추적할 수 없어 매번 관리자/지원팀에 의존해야 한다.
- 여러 리소스 상세 화면에 동일한 감사 로그 뷰가 요구되므로, 컬럼·필터·상태 UX를 일관되게 표준화해 유지보수성을 확보해야 한다.

## User Stories

상세 페이지에서 출발하는 세 가지 시나리오가 본 스펙의 중심이다.

- **U1 (Model Deployment 상세).** 운영자로서, 내 Deployment 상세 화면에서 감사 로그를 열어 **revision/state가 언제·왜·누구에 의해 바뀌었는지** 확인하고, 실패(`ERROR`) 이벤트만 추려 보거나 특정 기간으로 좁혀 원인을 조사하고 싶다.
- **U2 (Compute Session 상세).** 사용자로서, 내 세션 상세 화면에서 **이 세션에 어떤 작업(생성/종료/재시작 등)이 가해졌는지** 시간순으로 확인하고, 각 작업의 성공/실패와 수행 주체를 알고 싶다.
- **U3 (VFolder).** 사용자로서, 내 VFolder에서 **누가 무엇을 했는지**(접근·공유·변경 등)를 직접 확인하고 싶다.
- **U4 (지원되지 않는 환경).** 사용자로서, 백엔드가 본 기능을 지원하지 않는 구버전 환경에서는 깨진 화면이나 빈 안내 영역 대신 감사 로그 진입점 자체가 아예 보이지 않기를 바란다.
- **U5 (빈/에러 상태).** 사용자로서, 로그가 없거나 조회가 실패했을 때 모호한 빈 화면 대신 명확한 상태 메시지를 보고 싶다.

## UX / 화면 설계

### 진입점 매핑 — 디테일 뷰의 sub-tab을 우선 고려

세 상세 화면은 구조가 서로 다르지만, 감사 로그의 진입점은 **디테일 뷰 내의 sub-tab**을 **우선 고려한다**(원칙: 항상 보이는 카드나 아이콘 버튼보다 sub-tab을 기본으로 둔다). 즉 사용자가 상세 뷰 안에서 "Audit Log" 탭을 골라 들어오는 방식을 표준으로 삼고, **탭을 둘 수 없는 구조의 표면에서만** 그 사유를 명시하고 대체 방식(버튼/섹션)으로 폴백한다.

> **중요 — 세 표면 모두 현재 디테일 뷰 탭 스트립이 없다.** sub-tab은 단순 "이동/재배치"가 아니라, 각 표면에 **탭 호스트(tab strip)를 새로 추가하는 구조 변경**이다. 현황은 다음과 같다.
>
> - Model Deployment 상세(`DeploymentDetailPage`): `BAICard` 섹션들의 **세로 스택**(Configuration / Replicas / AutoScaling / AccessTokens). 상위 탭 스트립 없음.
> - Compute Session 상세(`SessionDetailContent` in `SessionDetailDrawer`): **드로어 안 key-value `Descriptions` 블록**. 탭 스트립 없음.
> - VFolder(`FolderExplorerModalV2`): `Splitter`/스택 기반 **파일 탐색 모달**. 기존 스펙이 "탭"이라 불렀으나 코드상 탭 호스트는 없음.

| 표면                  | 기존 컴포넌트                                     | 현재 레이아웃                                                                       | 감사 로그 배치(목표)                                  | 진입(발견) 방법          |
| --------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------ |
| Model Deployment 상세 | `DeploymentDetailPage`                            | `BAICard` 섹션들의 세로 스택(Configuration / Replicas / AutoScaling / AccessTokens) | **디테일 뷰 sub-tab "Audit Log"** (탭 호스트 신규 도입) | 탭 라벨                  |
| Compute Session 상세  | `SessionDetailContent` (드로어 안 `Descriptions`) | key-value 설명 + Status 옆 액션 아이콘들                                            | **드로어 내 sub-tab "Audit Log"** (Overview/Audit Log 탭화) | 탭 라벨                  |
| VFolder               | `FolderExplorerModalV2`                           | Suspense로 감싼 파일 탐색 모달                                                      | **모달 내 sub-tab "Audit Log"** (탭 호스트 신규 도입)  | 탭 라벨                  |

> **선례 — in-card `tabList` sub-tab(UI 구조) + transition 기반 lazy(로딩 방식).** `DeploymentConfigurationSection`은 한 `BAICard` 안에서 `tabList`(`activeTabKey`/`onTabChange`)로 currentRevision/revisionHistory sub-tab을 운영한다. 감사 로그 sub-tab은 이 **탭 호스트 UI 구조**를 그대로 따른다(단, 위 표대로 각 표면에는 아직 탭 호스트가 없으므로 도입이 선행되어야 한다).
>
> **다만 로딩 방식은 같은 파일 안의 다른 선례를 따른다.** 같은 컴포넌트의 revisionHistory 탭은 활성 탭을 `Suspense`로 lazy 마운트하므로 탭 전환 즉시 스켈레톤 fallback이 뜬다(=빈 스켈레톤 점프). 본 스펙은 이 방식을 **따르지 않는다.** 대신 같은 파일의 **AddRevision 버튼** 패턴을 따른다 — `useQueryLoader`로 fetch를 먼저 시작하고, 마운트를 일으키는 상태 업데이트를 `startTransition`으로 감싸 **Suspense fallback으로 떨어지지 않게** 한다(render-as-you-fetch). 즉 **lazy 전환은 `Suspense`가 아니라 `transition`으로 만든다.** Suspense는 본문을 감싸는 안전 경계로만 남고, 전환을 지연·유예하는 주체는 transition이다. (PR #7575 / FR-2964의 render-as-you-fetch 모달도 동일한 클릭 트리거 로딩의 참고.)

### 설계 결정 — 데이터 로딩은 "클릭 트리거 탭" 공통 패턴

진입점을 sub-tab으로 통일하면 로딩 트리거도 **하나의 공통 패턴**으로 수렴한다: **탭 클릭이 곧 fetch 시작**이며, 빈 스켈레톤으로 먼저 점프하지 않고 준비된 뒤 전환한다.

| 트리거 성격           | 로딩 방식                                                                                                                                                                                                                                                                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **탭 클릭(공통)**     | **render-as-you-fetch + 탭 전환 transition**: "Audit Log" 탭 클릭이 `loadQuery`(store-and-network)로 요청을 시작하고, 전환을 `useTransition`으로 감싼다. 로딩 동안 **클릭한 탭 라벨에 pending(스피너) 표시**가 뜨고 사용자는 이전 탭에 그대로 머문다. 데이터가 준비되면 **그때 해당 탭으로 전환**되어 테이블이 보인다(빈 스켈레톤 점프 없음). 활성 탭 본문은 `BAIErrorBoundary` + `Suspense`로 감싼다. |

> **폴백 예외(탭 호스트가 없는 표면).** 어떤 표면이 끝내 sub-tab을 호스팅할 수 없다고 판명되면(예: 드로어 폭/헤더 제약으로 탭화가 어려운 경우), 해당 표면에 한해 기존 render-as-you-fetch 버튼→모달 방식으로 폴백한다(Session의 scheduling-history 버튼 선례). 이 경우에도 로딩 성격은 "명시적 클릭 → fetch 시작"으로 동일하며, 폴백 사유는 Open Questions에 명시한다. (이전 버전 스펙의 "Deployment는 항상 보이는 섹션이라 마운트 시 Suspense-lazy" 분기는 sub-tab 전환으로 **폐기**한다.)

#### 탭 전환 흐름 (모든 표면 공통)

```
[1] 사용자가 "Audit Log" sub-tab 클릭
        │  (탭 클릭 → loadQuery 시작, startTransition으로 감쌈)
        ▼
[2] 아직 현재 탭(예: Overview / Files / Configuration)에 머문 채,
    "Audit Log" 탭 라벨에 pending 스피너 표시  ┌ Overview ┐┌ Audit Log ◌ ┐
        │                                        └──────────┘└────────────┘
        ▼  (쿼리 완료)
[3] "Audit Log" 탭으로 전환 + 로딩된 테이블 표시  ┌ Overview ┐┌▌Audit Log ┐
                                                  └──────────┘└────────────┘
```

- 본문이 빈 스켈레톤으로 **깜빡이며 점프**하지 않는다 — 준비될 때까지 현재 탭이 유지되고, 진행 신호는 클릭한 탭에만 국소적으로 표시된다.
- 이미 한 번 로드한 뒤 탭을 오가는 경우는 캐시된 데이터로 즉시 전환된다(`store-and-network`). 새로고침은 아래 공통 재조회 규칙을 따른다.

**재조회(필터/정렬/새로고침)** 시에는 deferred query reference로 **이전 행을 유지한 채** 인라인 로딩을 보여준다(빈 화면 깜빡임 없음). 이 부분은 표면과 무관하게 공통이다.

### 공통 뷰 — 레이아웃

배치 컨테이너(섹션/모달/탭)가 무엇이든 감사 로그 뷰 자체는 동일하다: 상단에 필터 바 + 새로고침, 그 아래 테이블.

```
┌─ Audit Log ─────────────────────────────────── [⟳ 새로고침] [⚙ 컬럼] ┐
│  [ 기간 ▾ ]  [ 상태 ▾ ]  [ 작업: 검색…  ]  [ 수행자 ▾ ]              │
├──────────────────────────────────────────────────────────────────────┤
│  시간 ▾        작업        수행자            상태      설명            │
│  ───────────────────────────────────────────────────────────────────  │
│  06-02 14:03   update      alice@lab.com    ●ERROR   replica 0→1 실패  │
│  06-02 13:58   create      bob@lab.com      ●SUCCESS revision v4 생성  │
│  06-01 09:12   delete      alice@lab.com    ●SUCCESS token 폐기        │
│  …                                                                     │
├──────────────────────────────────────────────────────────────────────┤
│                                        ‹  1  2  3  ›   [ 10 / page ▾ ] │
└──────────────────────────────────────────────────────────────────────┘
```

### 공통 뷰 — 컬럼

각 행은 하나의 감사 로그 이벤트이며, 단일 리소스 범위로 한정한다.

- **기본 표시**: 시간(Time) · 작업(Operation) · 수행 주체(Actor) · 상태(Status) · 설명(Description) · 소요 시간(Duration).
  - **Actor**: 수행 사용자의 이메일을 표시(값이 비는 경우는 백엔드 응답에 위임).
  - **Status**: 색상 배지/태그(`SUCCESS`/`ERROR`/`RUNNING`/`UNKNOWN`).
  - **Description**: 길면 말줄임 + hover 시 전문 tooltip. **Duration**: 값이 없으면 `-`.
- **기본 숨김(컬럼 토글로 노출)**: 요청 ID(Request ID) · 액션 ID(Action ID). 둘 다 복사 가능한 단축 식별자 형태.

### 공통 뷰 — 필터

단일 리소스 범위 안에서 다음 기준으로 좁힌다.

- **기간(Date range)**: 날짜 범위.
- **상태(Status)**: 정해진 값 목록에서 고르는 **드롭다운**(strict). 백엔드가 상태 값 목록(variants)을 노출하므로 가능.
- **작업(Operation)**: **자유 입력(포함/일치)**. 백엔드가 작업 값 목록을 노출하지 않아 v1에서는 드롭다운 대신 자유 입력. (백엔드가 작업 목록을 추가하면 드롭다운으로 전환)
- **수행 주체(Actor)**: 사용자 선택기로 고르면 해당 사용자의 로그만 표시(UUID 직접 타이핑 안 함).

### 공통 뷰 — 정렬 / 페이지네이션

- 기본 정렬 **시간 내림차순(최신 먼저)**. 시간·작업·상태 컬럼에서 정렬 변경 가능. (단일 리소스 범위라 entity type 정렬은 노출 안 함)
- 커서 기반 페이지네이션. 기본 페이지 사이즈 10, 옵션 `[10, 50, 100]`.

### 상태별 화면 (로딩 / 빈 / 에러 / 미지원)

```
[로딩 — 최초]              [빈 결과]                 [에러]
┌────────────────┐        ┌────────────────┐        ┌────────────────────────┐
│ ▭▭▭▭  ▭▭  ▭▭▭ │        │      (◌)        │        │  ⚠ 감사 로그를 불러오지 │
│ ▭▭▭▭  ▭▭  ▭▭▭ │        │ 이 리소스에 대한 │        │     못했습니다.         │
│ ▭▭▭▭  ▭▭  ▭▭▭ │        │ 감사 로그가 없음 │        │     [ 다시 시도 ]       │
└────────────────┘        └────────────────┘        └────────────────────────┘
```

- **로딩(최초)**: 표준 스켈레톤. **재조회**: 이전 행 유지 + 인라인 로딩(위 설계 결정 참고).
- **빈 결과**: "이 리소스에 대한 감사 로그가 없습니다" 안내.
- **에러**: 표준 에러 메시지 + 재시도. 필터/페이지 상태는 유지. 에러는 **격리**되어 상세 페이지의 다른 영역(다른 섹션/탭)에 영향 없음.
- **미지원**: 백엔드 미지원 환경에서는 감사 로그 진입점(sub-tab, 또는 폴백 시 버튼) 자체를 **노출하지 않는다**(Session의 `supportsSessionSchedulingHistory` 게이팅과 동일한 방식). 마운트된 채 "지원 안 됨"을 띄우기보다, 진입점을 숨기는 쪽을 기본으로 한다. (탭 폴백 표면이면 "Audit Log" 탭이 탭 스트립에 나타나지 않는다.)

### 대표 유저 플로우 (Deployment 예)

1. 운영자가 자신의 Deployment 상세 페이지에서 replica가 올라오지 않는 문제를 발견한다.
2. 상세 뷰의 **"Audit Log" sub-tab을 클릭**한다 → 탭 라벨에 pending이 뜨고, 데이터가 준비되면 그때 해당 탭으로 전환되며 최신순 로그가 보인다(빈 스켈레톤 점프 없음).
3. 상태 필터를 `ERROR`로 좁힌다 → 이전 행이 유지된 채 인라인 로딩 후 실패 이벤트만 남는다.
4. 실패 행의 **설명**에 hover해 전문을 확인하고, **수행자**(이메일)로 누가 그 변경을 했는지 파악한다.
5. (필요 시) 컬럼 토글로 **요청 ID**를 켜고 값을 복사해 지원팀/로그 시스템과 대조한다.

Session/VFolder도 동일하게 각 상세 뷰의 "Audit Log" sub-tab을 클릭해 들어오며, 2단계 이후 흐름은 동일하다. (어느 표면이 탭을 호스팅하지 못해 버튼 폴백을 쓰는 경우, 2단계의 진입 동작만 "버튼 클릭 → 모달"로 바뀌고 로딩 성격은 동일하다.)

## Goals / Non-Goals

### Goals

- 세 상세 페이지(Session/VFolder/Deployment)에서 단일 리소스 범위의 감사 로그를 디테일 뷰 sub-tab 진입으로 일관되게 조회.
- 클릭 트리거 기반 로딩(render-as-you-fetch + 탭 전환)과, 재조회 시 이전 행 유지로 매끄러운 사용 경험 제공.
- 빈/에러/로딩/미지원 상태에 대한 명확한 UX와 안전한 게이팅.

### Non-Goals

- 관리자용 전체 감사 로그 뷰(`/admin/audit-logs` 등).
- CSV/JSON 등 외부 export.
- 실시간 스트리밍/주기적 폴링 — 사용자가 명시적으로 새로고침한다.
- 로그 항목 단위의 상세 drill-down 모달.
- 비관리자 RBAC 규칙 설계 자체 — 백엔드가 결정한 권한 규칙을 따른다.
- 작업(Operation) 필터의 드롭다운(strict) 전환 — 백엔드 후속 작업.

## Requirements

### Must Have

- **데이터 범위**: 단일 리소스(`entityType` + `entityId`) 한 건으로 좁힌 감사 로그만 표시한다. Session/VFolder/Model Deployment 세 종류의 리소스를 지원한다.
- **컬럼**: 시간/작업/수행 주체/상태/설명/소요 시간을 기본 표시하고, 요청 ID·액션 ID는 기본 숨김 + 토글 노출. 식별자는 복사 가능한 단축 표시. Actor는 수행 사용자의 이메일을 표시.
- **필터**: 기간(범위), 상태(드롭다운), 작업(자유 입력), 수행 주체(사용자 선택기)를 제공한다.
- **정렬/페이지네이션**: 시간 내림차순 기본 정렬, 시간·작업·상태 정렬 가능, 커서 기반 페이지네이션(기본 20).
- **상태 UX**: 로딩/빈/에러/미지원 상태를 각각 명확히 처리하고, 에러는 격리되어 페이지의 다른 영역에 영향을 주지 않는다.
- **진입점(sub-tab 우선)**: 세 상세 뷰(Session/VFolder/Deployment) 모두 감사 로그 진입점으로 **디테일 뷰 sub-tab을 우선 도입**한다. 세 표면 모두 현재 탭 스트립이 없으므로 각각 탭 호스트를 신규로 둔다. 특정 표면이 탭을 호스팅할 수 없다고 판명되면 그 표면에 한해 버튼→모달로 폴백하고 사유를 명시한다(Open Questions).
- **로딩 방식(공통)**: sub-tab은 클릭 트리거이므로 **render-as-you-fetch + `useTransition` 탭 전환**을 공통으로 적용한다(클릭 시 로딩, 준비 후 전환, 빈 스켈레톤 점프 없음). 버튼 폴백 표면도 클릭 트리거 render-as-you-fetch로 동일 성격이다. 표면과 무관하게 **재조회 시에는 이전 행을 유지**한다.
- **버전 게이팅**: manager 버전 분기로 지원 여부를 판단해, 지원 환경에서만 감사 로그 진입점(sub-tab, 또는 폴백 시 버튼)을 **렌더한다.** 미지원이면 진입점 자체를 **노출하지 않는다**(마운트된 채 "지원 안 됨"을 띄우는 fallback 방식이 아니다 — Session의 `supportsSessionSchedulingHistory` 게이팅과 동일).
- **i18n**: 신규 문구는 `auditLog.*` 네임스페이스로 한국어/영어를 함께 추가한다.

### Nice to Have

- 컬럼 표시/숨김 상태를 사용자 단위로 기억(재방문 시 유지).
- 필터/정렬/페이지 상태를 URL에 동기화.
- 수동 새로고침 버튼(영역 헤더의 액션 슬롯).
- 발견성: 진입점(주로 "Audit Log" sub-tab 라벨, 폴백 시 버튼)에 최근 실패(`ERROR`) 건수 등을 알리는 배지/카운트를 두어, 문제가 있을 때 사용자가 감사 로그의 존재를 더 쉽게 알아채게 한다.

## Acceptance Criteria

- **AC1.** 백엔드 의존성이 충족된 환경에서 세 상세 페이지(Session/VFolder/Deployment) 각각에서 해당 리소스의 감사 로그가 동일한 컬럼/필터 UX로 표시된다.
- **AC2.** 표시되는 모든 행이 진입한 리소스 한 건에 대한 로그이다(다른 리소스의 로그가 섞이지 않는다).
- **AC3.** 기본 정렬이 시간 내림차순이며(최신 먼저), 상태 필터를 `ERROR`로 선택하면 모든 행의 상태가 `ERROR`다. 기간/작업/수행 주체 필터도 각각 선택 기준에 맞게 결과를 좁힌다.
- **AC4.** 요청 ID·액션 ID는 기본적으로 숨겨져 있고, 토글로 켜면 표시된다. 식별자는 복사 가능하다.
- **AC5.** 결과가 0건이면 빈 상태 안내가, 조회 실패 시 에러 메시지가 표시되며, 에러는 상세 페이지의 다른 영역에 영향을 주지 않는다.
- **AC6.** 백엔드 미지원 환경에서는 버전 게이팅으로 감사 로그 진입점(sub-tab, 또는 폴백 시 버튼) 자체가 **렌더되지 않는다.** 마운트된 채 "지원 안 됨" 안내를 띄우는 fallback 방식은 사용하지 않는다(Session의 `supportsSessionSchedulingHistory` 게이팅과 동일).
- **AC7.** 감사 로그 진입점은 디테일 뷰 sub-tab을 우선으로 하며, 세 표면 모두 **"Audit Log" 탭 클릭이 데이터 요청을 시작한다.** **클릭 후 데이터가 준비될 때까지 사용자는 이전 탭(Overview/Files/Configuration 등)에 머물고 클릭한 탭 라벨에 pending 표시가 보이며, 준비되면 그때 해당 탭으로 전환된다(빈 스켈레톤으로 먼저 점프하지 않는다).** 특정 표면이 탭을 호스팅하지 못해 버튼→모달로 폴백한 경우, 버튼 클릭이 동일하게 데이터 요청을 시작한다(render-as-you-fetch). 어느 표면이든 필터/정렬/새로고침 시 이전 행이 유지된 채 갱신된다(빈 화면 깜빡임 없음).
- **AC8.** 신규 `auditLog.*` 문구가 한국어/영어 두 파일에 모두 존재하며, `bash scripts/verify.sh`가 `=== ALL PASS ===`로 종료한다.

## 구현 계획 / 참고

세부 구현은 아래 기존 자산/패턴을 따른다. (디테일은 개발 계획 단계에서 결정)

- **탭 호스트**: 감사 로그 sub-tab은 `BAICard`의 `tabList`/`activeTabKey`/`onTabChange`(in-card sub-tab) 메커니즘을 따른다(선례: `DeploymentConfigurationSection`의 currentRevision/revisionHistory 탭 — 활성 탭만 `Suspense`로 lazy 마운트). 단, 세 표면 모두 현재 탭 스트립이 없으므로 각 표면에 탭 호스트를 신규로 도입해야 한다(Deployment 세로 스택 → 탭화, Session 드로어 `Descriptions` → Overview/Audit Log 탭화, VFolder 모달 → 탭화).
- **데이터 로딩(공통)**: sub-tab 클릭은 **render-as-you-fetch** — 탭 클릭이 `useQueryLoader`/`loadQuery`(store-and-network)로 요청을 시작하고 뷰는 `usePreloadedQuery`로 읽는다(→ **PR #7575 / FR-2964, scheduling-history 모달** 패턴 참고). **탭 전환은 `useTransition`으로 감싸 로딩 중 클릭한 탭에 pending을 표시하고 준비 후 전환**한다(`DeploymentDetailPage`/`DeploymentConfigurationSection`이 `useTransition`으로 Suspense fallback 점프를 막는 기존 관용과 동일). 버튼 폴백 표면도 동일한 render-as-you-fetch. 공통으로 재조회는 deferred query reference로 이전 행을 유지.
- **Relay 테이블/페이지네이션**: `relay-patterns` / `react-relay-table` skill, `BAITable` + pagination fragment 패턴.
- **Actor**: `AuditLogV2.user` 필드를 동일 페이지네이션 fragment에서 직접 읽는다(백엔드가 `triggered_by` UUID에서 resolve해 내려줌). 별도 user lookup 쿼리·`UNSAFELazyUserEmailView`·UUID fallback **불필요**.
- **식별자 표시**: `BAIId` 컴포넌트(`uuid`/`globalId` prop, copyable·monospace·ellipsis·안전한 global id 디코딩 내장)를 사용. 복사/monospace를 직접 구현하지 않는다.
- **필터 UI**: `BAIGraphQLPropertyFilter`. 상태는 백엔드의 상태 variants로 드롭다운 구성, 작업은 자유 입력.
- **에러 격리**: `BAIErrorBoundary`.
- **버전 게이팅**: `useSuspendedBackendaiClient().isManagerVersionCompatibleWith(...)` 류 manager 버전 분기로 진입점 렌더 여부를 결정(미지원이면 진입점 미렌더). Relay 차원에서는 `@since` client directive 활용 가능(`relay-patterns` skill 참고).

## Open Questions

1. **entity_id 필터의 ID 형식**: 필터가 받는 ID가 globalId인지 raw UUID인지 확정 필요. (`BAIId`는 _표시_ 시 안전한 디코딩을 제공하지만, 필터 입력으로 어떤 형식을 보내야 하는지는 별개 문제로 미정.) 각 상세 페이지가 어떤 ID를 전달할지에 직접 영향.
2. **미지원 환경 게이팅 신호**: manager 버전 문자열 비교로 충분한지, 아니면 백엔드가 별도 capability 플래그를 제공하는지.
3. **가시성 정책**: 비-소유자/co-collaborator가 접근 가능한 리소스의 로그를 볼 수 있는지 — 백엔드 RBAC 정책 확인 필요.
4. **Session 드로어 sub-tab 호스팅 타당성**: Session 상세는 폭 800 드로어 안의 key-value `Descriptions` 블록이며, 이를 Overview/Audit Log 탭 레이아웃으로 재구성하는 것이 드로어 폭·헤더(이름 + 액션 버튼) 배치와 충돌 없이 가능한지 dev-planning에서 검증 필요. 가능하면 sub-tab으로, 불가하면 기존 scheduling-history 버튼 선례를 따른 버튼→모달 폴백으로 결정한다(폴백 시 그 사유를 기록).
5. **Deployment/VFolder 탭 호스트 도입 범위**: Deployment의 세로 카드 스택과 VFolder의 `Splitter` 모달에 상위 탭 스트립을 도입할 때 기존 섹션/패널 레이아웃을 어떻게 재배치할지(예: 기존 콘텐츠 전체를 "Overview"/"Files" 탭으로 묶고 "Audit Log"를 형제 탭으로 추가) — 구조 변경 범위를 dev-planning에서 확정.

## 백엔드 의존성 (선행 조건)

- `scopedAuditLogsV2` 쿼리가 **비관리자 사용자-범위 RBAC**로 동작해야 한다.
- 특정 리소스 한 건으로 좁히는 **entity_id 필터**가 사용자 향 API에서 동작해야 한다.
- 위 두 가지는 **FR-2920**의 선행 조건이다. 미지원 환경(구버전 manager/capability)에 대한 게이팅이 필요하다.

## Related Issues

- **FR-2920** (source): Reservoir audit log Phase 2 / 사용자 향 감사 로그 노출 및 백엔드 선행 작업.
- **FR-2964** (PR #7575): render-as-you-fetch 전환 패턴 — 본 화면의 데이터 로딩 흐름이 참고하는 패턴.
