# RBAC Admin Role 기반 Admin 메뉴 동작 개선 Spec

> **Epic**: FR-1692 ([Enhanced Admin menu](https://lablup.atlassian.net/browse/FR-1692))
> **Task**: FR-2313 ([Improve admin menu behavior based on RBAC admin role](https://lablup.atlassian.net/browse/FR-2313))

## 개요

현재 WebUI의 Admin 메뉴는 `superadmin`과 `admin` 두 가지 역할만 구분하여 동작한다. RBAC 체계에 따라 **프로젝트 어드민**, **도메인 어드민**, **Super Admin** 세 단계의 관리자 역할을 정확히 구분하고, 각 역할에 맞는 메뉴 표시 및 데이터 범위(scope)를 적용하도록 개선한다.

## 문제 정의

1. 현재 `useCurrentUserRole` 훅은 `superadmin | admin | user | monitor` 네 가지 값만 반환하며, 프로젝트 어드민과 도메인 어드민을 구분하지 못한다.
2. Admin 메뉴 진입 시 모든 admin이 동일한 메뉴와 데이터 범위를 보게 되어, 프로젝트 어드민이 다른 프로젝트의 데이터에 접근하거나 도메인 어드민에게 불필요한 Super Admin 전용 메뉴가 노출될 수 있다.
3. Header의 프로젝트 선택기가 admin 역할 수준에 따라 적절히 제어되지 않는다.

## 용어 정의

| 용어 | 설명 |
|------|------|
| **프로젝트 어드민** | 특정 프로젝트에 대한 관리 권한을 가진 사용자. 해당 프로젝트 범위의 entity만 관리 가능. |
| **도메인 어드민** | 현재 WebUI 도메인에 대한 관리 권한을 가진 사용자. 해당 도메인 전체의 entity를 관리 가능. |
| **Super Admin** | 시스템 전체에 대한 관리 권한을 가진 사용자. 모든 도메인의 모든 entity를 관리 가능. |
| **Admin 역할 계층** | 프로젝트 어드민 < 도메인 어드민 < Super Admin. 상위 역할은 하위 역할의 권한을 포함. |
| **WebUI 도메인** | `webserver.conf`의 domain 설정에 해당하는 도메인. 도메인별로 WebUI endpoint가 존재. |

## 요구사항

### Must Have

- [ ] 사용자의 RBAC admin role(프로젝트 어드민 / 도메인 어드민 / Super Admin)을 정확히 식별하는 로직 구현
  - `TODO(needs-backend): FR-2313` -- 백엔드 API에서 세분화된 admin role 정보 제공 필요 (아래 "백엔드 API 의존성" 섹션 참고)
- [ ] Admin Settings 메뉴 아이템의 표시 조건을 역할별로 적용
  - 프로젝트 어드민: 현재 선택된 프로젝트에 admin 권한이 있을 때
  - 도메인 어드민: 항상 (현재 WebUI 도메인의 admin이므로)
  - Super Admin: 항상
- [ ] Admin 메뉴 내 각 페이지의 데이터 범위(scope)를 역할에 따라 제한
  - Session, User, Service 페이지: 프로젝트/도메인/전체 범위
  - 기타 관리 페이지 (Agent, Project, Settings, Maintenance, Diagnostics, Branding, Information): Super Admin 전용
- [ ] Header 프로젝트 선택기를 admin 역할에 따라 제어
  - 프로젝트 어드민: 프로젝트 선택기 표시 (프로젝트 간 이동 가능)
  - 도메인 어드민 / Super Admin: 프로젝트 선택기 비표시
- [ ] 프로젝트 어드민이 admin 권한이 없는 프로젝트로 전환 시 confirm 대화상자 표시 후 일반 메뉴 모드로 전환
- [ ] 여러 레벨의 admin role을 동시에 보유한 경우, 가장 높은 권한을 기준으로 Admin 페이지 동작
- [ ] Header 프로젝트 선택기의 Project Admin 뱃지 표시 규칙 적용
  - 프로젝트 어드민 권한을 가진 프로젝트에 뱃지 표시
  - 단, WebUI 도메인의 도메인 어드민이나 Super Admin인 경우 뱃지 비표시 (혼선 방지)
- [ ] Admin Session 페이지를 일반 세션 목록(`ComputeSessionListPage`)과 동일한 UI로 제공하되, 데이터 범위는 admin 역할에 따라 scope 적용
  - terminate/cancel 등 세션 제어 액션을 역할 scope 내에서 허용

### Nice to Have

- [ ] 기존 일반 사용자 메뉴에서 admin과 동일한 데이터를 페이지네이션 쿼리로 조회할 수 있는 경우, 일반 메뉴의 해당 페이지로 대체
- [ ] Data(폴더) 일반 사용자 페이지에서 현재 프로젝트에 mount 불가능한 폴더를 시각적으로 구분 (disabled 스타일) 및 필터링 옵션 제공

## 사용자 스토리

- **프로젝트 어드민**으로서, 내가 관리하는 프로젝트의 세션/사용자/서비스를 한 곳에서 관리하고 싶다. 다른 프로젝트의 데이터는 볼 필요가 없다.
- **도메인 어드민**으로서, 내 도메인에 속한 모든 프로젝트의 세션/사용자/서비스를 관리하되, 시스템 전체 설정(Agent, Maintenance 등)에는 접근할 필요가 없다.
- **Super Admin**으로서, 모든 도메인의 모든 entity를 관리하고 시스템 설정까지 접근할 수 있어야 한다.
- **여러 역할을 가진 사용자**로서, Admin 메뉴에 진입하면 내가 가진 가장 높은 권한 수준에 맞는 화면을 자동으로 보고 싶다.
- **프로젝트 어드민**으로서, Admin 모드에서 다른 프로젝트로 전환할 때, 해당 프로젝트의 admin 권한이 없으면 일반 모드로 자연스럽게 전환되길 원한다.
- **프로젝트 어드민**으로서, Admin 세션 페이지에서 내 프로젝트의 문제 있는 세션을 직접 종료/취소하고 싶다.

## 인수 조건 (Acceptance Criteria)

### Admin Settings 메뉴 아이템 표시

- [ ] 프로젝트 어드민 권한만 있는 사용자가 해당 프로젝트를 선택했을 때, 사이더에 Admin Settings 메뉴 아이템이 표시된다.
- [ ] 프로젝트 어드민이 admin 권한이 없는 프로젝트를 선택하면, Admin Settings 메뉴 아이템이 사라진다.
- [ ] 도메인 어드민은 어떤 프로젝트를 선택하든 Admin Settings 메뉴 아이템이 항상 표시된다.
- [ ] Super Admin은 항상 Admin Settings 메뉴 아이템이 표시된다.
- [ ] admin role이 전혀 없는 일반 사용자에게는 Admin Settings 메뉴 아이템이 표시되지 않는다.

### Header 프로젝트 선택기

- [ ] 프로젝트 어드민이 Admin 메뉴에 진입하면, Header에 프로젝트 선택기가 표시된다.
- [ ] 도메인 어드민이 Admin 메뉴에 진입하면, Header에 프로젝트 선택기가 표시되지 않는다.
- [ ] Super Admin이 Admin 메뉴에 진입하면, Header에 프로젝트 선택기가 표시되지 않는다.
- [ ] 일반 메뉴에서는 모든 사용자에게 프로젝트 선택기가 기존과 동일하게 표시된다.

### 프로젝트 선택기 뱃지

- [ ] 프로젝트 어드민 권한이 있는 프로젝트에 "Project Admin" 뱃지가 표시된다.
- [ ] 도메인 어드민 또는 Super Admin인 경우, 프로젝트 어드민 권한이 있더라도 뱃지가 표시되지 않는다.

### 프로젝트 전환 (프로젝트 어드민 Admin 모드)

- [ ] Admin 모드에서 admin 권한이 있는 다른 프로젝트로 전환하면, Admin 모드가 유지되며 해당 프로젝트 범위의 데이터가 표시된다.
- [ ] Admin 모드에서 admin 권한이 없는 프로젝트로 전환하려 하면, "해당 프로젝트에 admin 권한이 없으며, 전환 시 일반 메뉴로 이동합니다"라는 confirm 대화상자가 표시된다.
- [ ] Confirm 수락 시: 해당 프로젝트로 전환되고, 일반 메뉴 모드로 이동한다 (Admin 모드 해제).
- [ ] Confirm 거부 시: 프로젝트 전환이 취소되고, 현재 Admin 모드와 프로젝트가 유지된다.

### Admin 페이지별 데이터 범위

- [ ] **Session 페이지** -- 프로젝트 어드민: 해당 프로젝트의 세션만 / 도메인 어드민: 해당 도메인의 모든 세션 / Super Admin: 모든 도메인의 모든 세션
- [ ] **User 페이지** -- 프로젝트 어드민: 해당 프로젝트의 사용자만 / 도메인 어드민: 해당 도메인의 모든 사용자 / Super Admin: 모든 사용자
- [ ] **Service 페이지** -- 프로젝트 어드민: 해당 프로젝트의 서비스만 / 도메인 어드민: 해당 도메인의 모든 서비스 / Super Admin: 모든 서비스
- [ ] **Data 페이지** -- 백엔드 API의 scope 기반 응답에 따라 역할별 데이터 범위 적용 (`TODO(needs-backend): FR-2313`)
- [ ] 프로젝트 어드민/도메인 어드민은 다른 사용자의 개인(User 타입) 폴더를 조회할 수 없다.
- [ ] **기타 관리 페이지** (Agent, Project, Settings, Maintenance, Diagnostics, Branding, Information): Super Admin일 때만 표시

### Admin Session 페이지 CUD

- [ ] Admin Session 페이지는 일반 세션 목록(`ComputeSessionListPage`)과 동일한 UI를 사용한다.
- [ ] 프로젝트 어드민은 자기 프로젝트의 세션을 terminate/cancel할 수 있다.
- [ ] 도메인 어드민은 자기 도메인의 모든 세션을 terminate/cancel할 수 있다.
- [ ] Super Admin은 모든 세션을 terminate/cancel할 수 있다.
- [ ] hideAgent 설정이 되어 있을 때 Agent 컬럼은 Super Admin에게만 표시된다.
- [ ] Owner 컬럼은 모든 admin 역할에 표시된다.

### 권한 우선순위

- [ ] 프로젝트 어드민 + 도메인 어드민을 동시에 가진 사용자는 도메인 어드민 기준으로 동작한다.
- [ ] 프로젝트 어드민 + Super Admin을 동시에 가진 사용자는 Super Admin 기준으로 동작한다.

## 페이지별 CUD 권한

각 Admin 페이지에서 역할별로 허용되는 Create/Update/Delete 작업과, 폼 필드의 고정/제한 규칙을 정의한다.

### Session 페이지 (`/admin-session`)

Admin Session 페이지는 일반 사용자 세션 목록(`ComputeSessionListPage`)과 **동일한 UI**를 사용한다. 단, 데이터 범위(scope)가 admin 역할에 따라 달라진다.

| 작업 | 프로젝트 어드민 | 도메인 어드민 | Super Admin |
|------|----------------|-------------|-------------|
| **Read** (세션 목록 조회) | 해당 프로젝트 세션 | 해당 도메인 세션 | 모든 세션 |
| **Update** (terminate/cancel) | 해당 프로젝트 세션 | 해당 도메인 세션 | 모든 세션 |
| **컬럼: Owner** | 표시 | 표시 | 표시 |
| **컬럼: Agent** | 비표시 | 비표시 | 표시 |

### User 페이지 (`/credential`) — 미결정 (아래 DN-1~3 참조)

> **결정 (2026-03-23)**: 초기 버전에서는 목록 조회만 가능. 사용자 생성/수정/삭제 등 mutation은 제외.

### Service 페이지 (`/serving`)

| 작업 | 프로젝트 어드민 | 도메인 어드민 | Super Admin |
|------|----------------|-------------|-------------|
| **Read** (서비스 목록 조회) | 해당 프로젝트 서비스 | 해당 도메인 서비스 | 모든 서비스 |
| **Create** (서비스 생성) | 사용자 메뉴에서만 | 사용자 메뉴에서만 | 사용자 메뉴에서만 |
| **Update** (설정 수정) | 해당 프로젝트 서비스 | 해당 도메인 서비스 | 모든 서비스 |
| **Delete** (종료/삭제) | 해당 프로젝트 서비스 | 해당 도메인 서비스 | 모든 서비스 |

(아래 DN-4 참조)

### Data 페이지 (`/data`) — 미결정 (아래 DN-5~6 참조)

---

## 미결정 사항 (Decisions Needed)

구현 전에 결정이 필요한 CUD 권한 관련 설계 항목들이다. 각 항목은 결정 후 위 "페이지별 CUD 권한" 섹션과 인수 조건에 반영해야 한다.

### DN-1: 프로젝트 어드민의 사용자 생성 권한

프로젝트 어드민이 Users 탭에서 사용자를 생성(Create User)할 수 있는가?

- **(A)** 생성 가능. 단, `UserSettingModal`의 필드 제한:
  - `Domain`: 현재 WebUI 도메인으로 **고정** (변경 불가)
  - `Projects`: 자신이 admin인 프로젝트만 선택 가능 (다른 프로젝트 비표시)
  - `Role`: `user`로 **고정** (admin/superadmin 설정 불가)
- **(B)** 생성 불가. 사용자 생성은 도메인 어드민 이상만 허용.

> **결정 (2026-03-23)**: (A) 방향으로 결정. 단, 초기 버전에서는 사용자 mutation 전체 제외. 스코프별 쿼리/mutation 분리 시 함께 고려.

사용자 생성시 키패어 자원 정책은 수정하게 할 것인가?

- **(A)** 자유롭게 지정할 수 있게 한다.
- **(B)** 프로젝트의 "기본"을 추가한다.
  - 프로젝트별? 도메인별? ..
- **(B)** 자신과 동일한 키패어 자원 정책이 적용된다.

> **결정 (2026-03-23)**: 초기 버전에서는 사용자 생성 자체가 제외되므로 추후 결정. 프로젝트/도메인 기본 정책 도입 방향으로 논의 중.

### DN-2: 도메인 어드민의 사용자 관리 폼 필드 제한

도메인 어드민이 사용자를 생성/수정할 때 `UserSettingModal`의 필드를 어떻게 제한할 것인가?

- `Domain`: 현재 WebUI 도메인으로 **고정**할 것인가?
- `Role`: `admin`(도메인 어드민)까지 설정 가능하게 할 것인가? 아니면 `user`만?
  - **(A)** `admin`까지 설정 가능 (도메인 어드민이 다른 도메인 어드민을 생성할 수 있음)
  - **(B)** `user`만 설정 가능 (도메인 어드민 생성은 Super Admin만)

> **결정 (2026-03-23)**: (B) `user`만 설정 가능. 도메인 어드민 생성은 Super Admin만 허용.

- `Resource Policy`: 도메인 내 모든 정책을 선택 가능하게 할 것인가?

### DN-3: Purge User (영구 삭제) 허용 역할

사용자 영구 삭제(Purge)를 어느 역할까지 허용하는가?

- **(A)** Super Admin만 허용
- **(B)** 도메인 어드민까지 허용 (자기 도메인 내 사용자만)
- **(C)** 프로젝트 어드민까지 허용 (자기 프로젝트 내 사용자만)

> 초기 버전에서 사용자 mutation이 제외되므로, 이 결정도 추후로 미룸.

### DN-4: Service 페이지 — 타인 서비스 관리 권한

현재 서비스 수정/삭제는 owner만 가능하다. Admin 역할에 따라 scope 내 타인의 서비스를 관리할 수 있어야 하는가?

- **(A)** 읽기(목록 조회)만 허용. 수정/삭제는 owner만.
- **(B)** 종료(terminate/delete)만 허용. 수정은 owner만.
- **(C)** 전체 관리 허용 (수정 + 삭제). 단, 역할의 scope 내에서만.

> **결정 (2026-03-23)**: (C) 전체 관리 허용 (수정 + 삭제). 서비스 생성은 사용자 메뉴에서만 가능 (Admin 모드에서는 생성 불가).

서비스 생성(Start Service)은 admin 모드에서도 가능해야 하는가, 아니면 일반 메뉴에서만?

### DN-5: Data 페이지 — 프로젝트 어드민의 폴더 생성 권한

프로젝트 어드민이 Admin 모드에서 Project-type 폴더를 생성할 수 있는가?

- **(A)** 가능. `FolderCreateModal`의 `Type`이 Project로 고정되고, 프로젝트는 자신이 admin인 프로젝트로 제한.
- **(B)** 가능. User/Project 타입 모두 생성 가능하되, Project 타입은 자기 프로젝트만.
- **(C)** 불가. 폴더 생성은 일반 메뉴에서만 가능.

> **결정 (2026-03-23)**: (C) 기본 — 폴더 생성은 사용자 메뉴에서만 가능. Admin 메뉴에서 프로젝트 타입 폴더 생성 허용 여부는 추후 검토.

### DN-6: Data 페이지 — 도메인 어드민의 폴더 관리 범위

도메인 어드민이 도메인 내 모든 프로젝트의 폴더를 조회/관리할 수 있는가?

- **(A)** 조회만 가능 (삭제/수정은 owner 또는 Super Admin만)
- **(B)** 전체 관리 가능 (도메인 내 모든 폴더에 대해 삭제/이름 변경 등)
- **(C)** 프로젝트별 필터링하여 조회. 관리 권한은 백엔드 RBAC 응답에 따름.

> **결정 (2026-03-23)**: (B) 전체 관리 가능 방향이나, 초기 버전에서는 미구현. 추후 논의.

---

## 현재 코드베이스 참고 사항

현재 구현에서 변경이 필요한 주요 파일/훅:

| 파일 | 현재 상태 | 변경 필요 사항 |
|------|----------|---------------|
| `react/src/hooks/backendai.tsx` -- `useCurrentUserRole` | `superadmin \| admin \| user \| monitor` 4가지 값 | RBAC 기반 세분화 확장 또는 새 훅 생성 |
| `react/src/hooks/useWebUIMenuItems.tsx` | `adminMenu`/`superAdminMenu`를 `currentUserRole`로 분기 | 3단계 분기로 변경 |
| `react/src/components/MainLayout/WebUISider.tsx` | `hasAdminCategoryRole = superadmin \|\| admin` | RBAC 기반 조건으로 변경 |
| `react/src/components/MainLayout/WebUIHeader.tsx` | 프로젝트 선택기 항상 표시 | Admin 모드+역할에 따라 표시/숨김 |
| `react/src/components/ProjectSelect.tsx` | Project Admin 뱃지 미구현 | 뱃지 표시 로직 추가 |

Admin 페이지 중 `useCurrentProject`에 의존하는 페이지 (변경 영향 범위):
- `/admin-session` -- `useCurrentResourceGroupValue`
- `/environment` -- `useCurrentProjectValue`
- `/reservoir/:id` -- `useCurrentProjectValue`, `useSetCurrentProject`
- `/admin-dashboard` -- `useCurrentProjectValue`, `useCurrentResourceGroupValue`

## 백엔드 API 의존성

> `TODO(needs-backend): FR-2313`

### 1. 사용자의 Admin Role 조회

현재 사용자가 보유한 admin role 목록을 반환하는 API가 필요하다.

**기대하는 응답 구조 (예시):**

```json
{
  "admin_roles": {
    "super_admin": true,
    "domain_admin": ["domain-name-1"],
    "project_admin": ["project-id-1", "project-id-2"]
  }
}
```

또는 GraphQL 필드 확장:

```graphql
type User {
  admin_roles: AdminRoles
}

type AdminRoles {
  is_super_admin: Boolean!
  domain_admin_domains: [String!]!
  project_admin_projects: [String!]!
}
```

**프론트엔드 판단 기준:**
- `super_admin == true` → Super Admin
- `domain_admin`에 현재 WebUI 도메인이 포함 → 도메인 어드민
- `project_admin`에 현재 프로젝트 ID가 포함 → 프로젝트 어드민
- 여러 역할 보유 시 가장 높은 권한 우선

### 2. Scope 기반 Entity 조회

Admin 페이지의 각 entity(Session, User, Service, Data) 조회 시, scope 파라미터에 따라 데이터 범위가 제한되어야 한다.

- **프로젝트 scope**: `scope: { project_id: "xxx" }` → 해당 프로젝트의 entity만 반환
- **도메인 scope**: `scope: { domain_name: "xxx" }` → 해당 도메인의 entity만 반환
- **전체 scope**: scope 미지정 또는 `scope: { all: true }` → 전체 entity 반환 (Super Admin)

## 범위 외 (Out of Scope)

- 프로젝트 구성원이 아니지만 RBAC에 의해 프로젝트 폴더를 공유받은 경우의 표시 방법 -- 별도 이슈로 처리
- 일반 사용자 메뉴의 구조 변경 -- 현재 상태 유지 (admin 관련 변경에 한정)
- RBAC 권한 자체의 설정/변경 UI -- 이 스펙은 기존 RBAC 권한을 "읽어서 반영"하는 것만 다룸
- Admin Dashboard 페이지 (`/admin-dashboard`) -- 현재 hidden 상태이며 별도 계획에 따라 진행
- Data(폴더) 페이지의 mount 가능 여부 표시 개선 -- Nice to Have로 분류, 별도 구현 가능

## 관련 이슈

- FR-1692: Enhanced Admin menu (Epic)
- FR-2313: Improve admin menu behavior based on RBAC admin role (Task)
