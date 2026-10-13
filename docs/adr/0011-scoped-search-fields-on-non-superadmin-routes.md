# 0011 — Scoped search fields on non-superadmin routes

## Summary

> 낯선 용어는 문서 맨 아래 [용어](#용어)에 모아 두었다.

- [실효 access](#용어)가 `'superadmin'`이 아닌 route에서 열리는 화면은 목록을 엔티티마다 하나인 [`scoped*` field](#용어)에 `scope` input 하나를 넘겨 읽는다. `admin*` root field는 `scope`가 없는 분기, 즉 superadmin 화면의 호출과 26.9.0a4 미만 매니저에서만 남는다.
- 공용 component는 범위를 `domainId`·`projectId` 같은 종류별 prop이 아니라, 그 `scoped*` field의 scope input type을 받는 optional `scope` prop 하나로 받는다.
- 현재 도메인의 scope는 `react/src/hooks/useCurrentDomainScope.ts`의 `useCurrentDomainScope()`가 `myUserV2.organization.domainId`로 만들고, 26.9.0a4 미만 매니저에서는 `null`을 답한다.
- `scoped*` field의 버전 기준은 26.9.0a4 하나다. 그보다 오래된 매니저는 지금 쓰는 field를 계속 받는다.

## Context

- **admin field**: 매니저 Strawberry API의 `admin*` root field(`adminUsersV2`, `adminProjectsV2`, `adminResourceGroups`, `adminImagesV2`, `admin*` mutation)는 resolver 첫 줄에서 `check_admin_only()`를 부르고, superadmin이 아니면 `Insufficient privilege. (Admin exclusive access)`로 요청을 거부한다.
- **Route access**: `useRouteAccessDecision`(`react/src/hooks/useRouteAccess.ts`)은 match chain에서 가장 깊은 `handle.access`로 route의 접근을 정한다. `react/src/routes.tsx`의 `/admin` route가 `access: 'admin'`이라, 자기 `access`가 없는 `/admin/users`, `/admin/session` 같은 leaf는 도메인 관리자도 들어온다.
- **Two scope shapes**: schema에는 범위를 받는 field가 두 모양으로 있다.

| 모양                                                           | 예                                                                                                                        | 추가된 매니저 |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 범위 종류마다 field 하나, 이름으로 지정                        | `domainUsersV2(scope: { domainName })`, `domainProjectsV2(scope: { domainName })`, `projectUsersV2(scope: { projectId })` | 26.2.0        |
| 엔티티마다 `scoped*` field 하나, 여러 종류의 범위를 한 input에 | `scopedUsersV2(scope: { domain: [{ value }], project: [{ value }], role: [{ value }] })`                                  | 26.9.0        |

- **Backend direction**: backend.ai의 `api/gql/AGENTS.md`와 `KNOWLEDGE.md`는 `scoped*` 모양을 규약으로 두고, 범위 종류별 field는 새로 만들지 않는 모양이라고 적는다(BA-7742).
- **Authorization**: `scoped*` field는 scope에 적힌 모든 범위에서 읽기 권한을 검사하고 하나라도 없으면 요청 전체를 거부한다. 결과는 각 범위로 닿는 행의 합집합이고, `filter`는 그 위에 AND로 붙는다. 범위 목록이 모두 비어 있는 scope는 거부된다.
- **Domain id**: `scoped*` scope는 도메인을 UUID로 받는데, `useCurrentDomainValue()`는 도메인 이름을 답한다. UUID를 답하는 `UserV2.organization.domainId`는 26.9.0a4에 추가되었다.

## 설계도

```mermaid
flowchart LR
  manager["manager"]
  client["backend.ai-client Client<br/>isManagerVersionCompatibleWith"]
  hook["useCurrentDomainScope<br/>myUserV2 query, store-or-network"]
  page["host component<br/>실효 access 'admin' 이하"]
  superpage["host component<br/>실효 access 'superadmin'"]
  select["BUI 공용 component<br/>scope prop"]
  transformer["graphql-transformer.ts<br/>RelayEnvironment fetch"]
  client -- "26.9.0a4 이상인가" --> hook
  hook -- "myUserV2.organization.domainId" --> transformer
  hook -- "domainScope 또는 null, domainName" --> page
  page -- "scope prop" --> select
  superpage -- "scope 없음" --> select
  select -- "scope 있음: scoped* / 없음: admin*" --> transformer
  page -- "scoped* 또는 이름 field" --> transformer
  client -- "manager version" --> transformer
  transformer -- "@since에 맞지 않는 field를 지운 문서" --> manager
```

## Decision

### 1. superadmin이 아닌 route는 `scoped*` field로 읽는다

- **Rule**: 실효 access가 `'superadmin'`이 아닌 route가 렌더하는 component와, 그 route에서 열리는 modal과 select는 목록을 `scoped*` field(`scopedUsersV2`, `scopedProjectsV2`, `scopedResourceGroups`, `scopedImagesV2` …)로 읽는다. scope는 화면이 다루는 도메인이나 프로젝트를 담는다.
- **Allowed admin field**: `admin*` field는 `scope`가 없을 때 고르는 분기(2절)와, 26.9.0a4 미만 매니저가 받는 분기(4절)에만 둔다.
- **Write**: `scoped*`에 대응하는 mutation이 없는 쓰기(사용자 생성·수정, keypair, 리소스 정책)는 그 동작을 렌더하는 host component가 `useSuspendedBackendaiClient().is_superadmin`이 참일 때만 렌더한다. 동작이 BUI component 안에 있으면 host가 그 component나 trigger를 렌더하지 않는다.
- **No scoped field**: 읽을 `scoped*` field가 없으면, 도메인 관리자에게 답하는 legacy field가 있을 때 그 field를 쓰고, 없으면 route를 `access: 'superadmin'`으로 좁힌다. 두 경우 모두 `TODO(needs-backend)`로 backend 요청 issue를 가리킨다.

### 2. 공용 component는 `scope` prop 하나를 받는다

- **Prop**: BUI의 공용 select와 목록은 `scope?: <ScopeInputType>` prop 하나로 범위를 받는다. `<ScopeInputType>`은 그 component의 query가 쓰는 scope input(`UserScope`, `ProjectScope`, `ResourceGroupScope`, `ImageSearchScope`)이고, relay-compiler가 그 query의 `__generated__/<Query>.graphql.ts`에 내보낸 type을 import한다. `domainId`·`projectId`·`userId` 같은 종류별 prop을 더하지 않는다.
- **Host value**: host 호출부는 `useCurrentDomainScope()`의 `domainScope`(type `DomainUUIDScope`, `{ domain: [{ value }] }`)나 직접 만든 같은 모양의 객체를 넘긴다. 이 모양은 위 네 input type에 모두 대입된다.
- **Query**: document는 `scoped*` field에 `@since(version: "26.9.0a4") @include(if: $useScope)`를, `admin*` field에 `@skip(if: $useScope)`를 단다. `$useScope`는 `scope`가 주어졌는지만 본다.
- **Read**: 두 field는 같은 connection type을 답하므로 공통 선택을 fragment 하나로 두고, component는 `useFragment(fragment, data.scoped ?? data.admin)`처럼 값이 있는 쪽을 읽는다.
- **Callers**: 실효 access가 `'superadmin'`인 화면은 `scope`를 넘기지 않고, 그 밖의 화면은 넘긴다.

### 3. 현재 도메인 scope는 `useCurrentDomainScope`가 만든다

- **Hook**: `useCurrentDomainScope()`는 `{ domainName, domainId, domainScope, supportsScopedSearch }`를 답한다. `domainScope`는 `{ domain: [{ value: domainId }] }`이고, 26.9.0a4 미만 매니저에서는 `null`이다.
- **Fetch**: 26.9.0a4 이상에서는 `myUserV2.organization.domainId`를 `store-or-network`로 읽고, 미만에서는 `store-only`로 두어 요청을 보내지 않는다.
- **Version owner**: scope를 만드는 쪽이 버전을 판단한다. 26.9.0a4 미만에서는 hook이 `null`을 답하고, 프로젝트 scope를 직접 만드는 호출부도 `isManagerVersionCompatibleWith(SCOPED_SEARCH_MIN_VERSION)`이 거짓이면 `scope`를 넘기지 않는다. `@since`는 그 판단이 틀렸을 때 26.9 미만 매니저가 모르는 field를 받지 않게 막는다.
- **Version constant**: `'26.9.0a4'`는 같은 파일의 `SCOPED_SEARCH_MIN_VERSION`이 가진다. graphql tag 안의 `@since`는 상수를 쓸 수 없어 같은 문자열을 적는다.

### 4. 26.9.0a4가 `scoped*` 분기의 유일한 기준이다

- **Single floor**: field마다 처음 나온 버전이 달라도(`scopedUsersV2`는 26.9.0a1) `scoped*` 분기는 모두 26.9.0a4로 gate한다. 도메인 scope에 필요한 `domainId`가 그 버전에 들어왔고, 기준이 하나여야 26.9 미만 지원을 끝낼 때 지울 곳을 한 번에 찾는다. ADR 0010의 "처음 낸 버전" 규칙에 대한 이 결정의 예외다.
- **Fallback**: 페이지가 직접 쓰는 query는 `scope`가 없을 때 이름으로 범위를 받는 field(`domainUsersV2` …)를 `@skip(if: $useScope)`로 읽는다. 이름 field가 없으면 `admin*` field를 읽는다.
- **Removal**: 26.9 미만 매니저 지원을 끝내는 PR이 이름 field 분기와 `@since(version: "26.9.0a4")`를 지운다. 공용 component의 `admin*` 분기는 superadmin 화면이 쓰므로 남는다.

## 대안과 기각 사유

- **범위 종류별 field(`domainUsersV2`, `projectUsersV2`)**: 26.2.0부터 있어 버전 분기가 없고 도메인 이름으로 바로 부른다. 기각한다. 도메인, 프로젝트, 사용자 범위마다 field와 query가 따로 필요해 공용 component가 범위 종류마다 분기하고, backend가 새로 만들지 않는 모양이라 새 엔티티에는 없다.
- **종류별 prop(`domainId`, `projectId`)을 공용 component에 더하기**: 호출부가 읽기 쉽다. 기각한다. 범위 종류가 늘 때마다 prop과 분기가 늘고, 두 종류를 함께 넘기는 경우(도메인과 사용자 OR)를 표현하려면 prop 조합 규칙을 따로 정해야 한다. scope input type은 schema가 이미 정의한 계약이다.
- **도메인 관리자에게 화면을 숨기기만 하기**: 수정이 가장 적다. 기각한다. 도메인 관리자가 읽을 수 있는 `scoped*` field가 있는데도 화면을 잃는다.

## Consequences

- 도메인 관리자는 `admin*`만 쓰던 목록 화면을 26.9.0a4 이상 매니저에서 자기 도메인 범위로 본다.
- 26.9.0a4 미만 매니저에서 이름 field가 없는 공용 select는 도메인 관리자에게 계속 거부된다.
- 26.9.0a1부터 26.9.0a3까지의 매니저는 `scoped*` field를 답하지만 이 분기를 받지 않는다.

## 출처

- #10300 (epic), #10301, #10288, 2026-10-13.
- backend.ai `src/ai/backend/manager/api/gql/AGENTS.md`, `api/gql/KNOWLEDGE.md`, `api/gql/utils.py`의 `check_admin_only`, BA-7742(#14451).

관련: [ADR 0006](0006-version-gated-field-pairs-across-manager-versions.md), [ADR 0010](0010-component-level-manager-version-gates.md).

## 용어

| 용어            | 뜻                                                                                                                                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 실효 access     | `useRouteAccessDecision`이 match chain에서 가장 깊은 `handle.access`로 정한 route의 접근 수준이다. 자기 `access`가 없는 route는 부모의 값을 받는다.                                                                                                                |
| `scoped*` field | 엔티티마다 하나인 검색 root field로, `scope` input에 도메인·프로젝트·사용자 같은 범위를 `UUIDScope` 목록으로 받는다(`scopedUsersV2`, `scopedProjectsV2` …). `ImageSearchScope`는 목록 외에 `public: Boolean!`도 받는다. backend.ai `api/gql/AGENTS.md`가 정의한다. |
| `UUIDScope`     | `scoped*` scope input의 항목 하나로, `{ value: UUID }` 모양이다. 한 목록 안의 항목과 여러 목록은 OR로 합쳐진다.                                                                                                                                                    |
