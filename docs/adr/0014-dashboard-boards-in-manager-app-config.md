# 0014 — Dashboard boards in manager app config

## Summary

> 낯선 용어는 문서 맨 아래 [용어](#용어)에 모아 두었다.

- 대시보드 page의 보드는 [panel catalog](#용어)의 key와 배치만 담은 JSON이다. 카드 하나하나는 `panelCatalog.tsx`의 `PanelDefinition`이 정의하고, 보드는 그 key를 `PersistedPanelV2` 목록으로 가리킨다.
- 사용자의 보드는 매니저 app config `userConfig`의 `dashboard` key에 page마다 `{ boards, active }`로 저장한다. 기본 보드([role template](#용어))는 `domainConfig.dashboardTemplates`, 그다음 `publicConfigByDomain[<domain>].dashboardTemplates`, 그다음 코드의 기본값 순서로 고른다.
- `userConfig.dashboard`는 사용자 자신의 [USER fragment](#용어)에만, `useDashboardBoards` 한 곳에서만 쓴다. template은 이 key에 두지 않는다.
- 브라우저 localStorage에 있던 보드는 page마다 한 번 `userConfig.dashboard`로 옮기고, upsert가 성공한 뒤에만 localStorage key를 지운다.
- 사용자 정의 패널은 실험 기능 flag 없이 catalog의 `kind: 'preset'` 항목으로 늘 켜져 있다.

## Context

- **Panel catalog**: #10580이 대시보드의 고정 카드와 사용자 정의 패널을 `PANEL_CATALOG`(`react/src/components/DashboardPanels/panelCatalog.tsx`) 하나로 합쳤다. 순수 함수 `boardModel.ts`가 보드를 만들고(`seedBoard`), 카드를 더하고 빼고, 배치를 반영하고, 저장값을 검사한다(`sanitizeBoard`).
- **localStorage boards**: #10580까지 보드는 `useBAISettingUserState`로 localStorage의 `dashboard_board.<page>`에 있었고, 그 전에는 `dashboard_board_items`, `admin_dashboard_board_items`, `custom_dashboard_panels`에 있었다. 브라우저를 바꾸면 보드가 사라지고, 한 브라우저 안에서는 모든 프로젝트가 한 보드를 나눠 쓴다.
- **App config documents**: `react/src/hooks/useAppConfig.ts`가 매니저 app config 문서 세 개를 읽고 쓴다(FR-1964). `useMyAppConfig`는 서버가 PUBLIC, DOMAIN, USER fragment를 deep-merge한 `userConfig` view를 읽고, `useUpdateMyUserAppConfig`는 USER fragment 원본을 다시 읽어 key 하나만 바꾼 문서 전체를 upsert한다.
- **Deep merge of arrays**: 서버의 deep-merge는 배열을 scope 사이에서 섞는다. 도메인 관리자가 DOMAIN scope의 `userConfig`에 보드 목록을 두면 사용자의 보드 목록과 섞여, 사용자가 지운 보드가 다시 나타나거나 id가 겹친다.
- **Whole-document upsert**: 한 upsert가 USER fragment 문서 전체를 바꾸므로, 두 upsert가 동시에 원본을 읽으면 나중 것이 먼저 것의 변경을 지운다.
- **Layout events**: 보드를 끌거나 크기를 바꾸면 `BAIBoard`가 이벤트마다 `onItemsChange`를 낸다.

## 설계도

### 데이터 흐름

```mermaid
flowchart LR
  subgraph manager["매니저 app config"]
    user["userConfig USER fragment<br/>dashboard.page"]
    domain["domainConfig<br/>dashboardTemplates"]
    public["publicConfigByDomain.domain<br/>dashboardTemplates"]
  end
  local["localStorage<br/>dashboard_board.page, legacy keys"]
  hook["useDashboardBoards<br/>resolveBoards, optimistic atom"]
  queue["dashboardWriter<br/>debounce 800ms, 한 번에 하나"]
  board["DashboardPanelBoard<br/>useDashboardBoard, DashboardBoardTabs"]
  user -- "useMyAppConfig merged view" --> hook
  domain -- "useDomainAppConfig" --> hook
  public -- "usePublicDomainAppConfig" --> hook
  local -- "보드가 저장되기 전 한 번 읽기" --> hook
  hook -- "active board, template, update" --> board
  board -- "update(config => next)" --> hook
  hook -- "page config" --> queue
  queue -- "useUpdateMyUserAppConfig dashboard.page" --> user
  queue -- "migration upsert 성공 후 삭제" --> local
```

### 쓰기 상태

```mermaid
stateDiagram-v2
  [*] --> Server: optimistic 값 없음
  Server --> Pending: update가 atom에 page config를 넣음
  Pending --> Pending: 800ms 안의 update가 값을 바꿈
  Pending --> Server: upsert와 refetch 성공, atom 값이 쓴 값과 같아 지움
  Pending --> Server: upsert 실패, atom을 지우고 오류 message
```

## Decision

### 1. 보드는 catalog key와 배치의 목록이다

- **Board shape**: 보드 하나는 `DashboardModel`(`react/src/components/DashboardPanels/types.ts`)이다.

| field       | type                                                                                    | 뜻                                                                                          |
| ----------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `id`        | `string`                                                                                | page 안에서 유일한 id. template에서 온 첫 보드는 `default`                                  |
| `title`     | `string`                                                                                | 탭 이름. 빈 문자열이면 탭은 `dashboard.boards.DefaultBoard`를 보여 준다                     |
| `vars`      | `{ project: string[] \| 'all'; rg: string[] \| 'all'; range: string; refresh: string }` | 보드가 열릴 때의 필터 값                                                                    |
| `panels`    | `PersistedPanelV2[]`                                                                    | catalog key, 사용자 정의 패널의 filter와 viz, 배치                                          |
| `knownKeys` | `string[]`                                                                              | 보드가 본 catalog key. 사용자가 뺀 카드는 다시 나오지 않고, 새 release가 더한 카드는 나온다 |

- **No domain fields**: 보드에는 도메인 field가 없다. superadmin도 현재 도메인을 읽는다([ADR 0012](0012-scoped-search-fields-in-place-of-admin-fields.md)).
- **Catalog owns cards**: 카드의 제목, 크기, 필요한 역할과 메뉴, 갱신 주기는 `PanelDefinition`이 정하고 보드에 복사하지 않는다. `sanitizeBoard`가 catalog에 없는 key와 page가 맞지 않는 key를 버린다.

### 2. 사용자 보드는 `userConfig.dashboard`에 둔다

- **Key shape**: `userConfig.dashboard`는 `DashboardConfig`(`Partial<Record<PanelPage, DashboardPageConfig>>`)이다. `project`, `projectAdmin`, `admin` key가 모두 아래 `DashboardPageConfig` 모양을 갖는다.

| field      | type               | 뜻                                         |
| ---------- | ------------------ | ------------------------------------------ |
| `boards`   | `DashboardModel[]` | page의 보드. 하나 이상                     |
| `active`   | `string`           | 열려 있는 보드의 id                        |
| `migrated` | `true` (optional)  | 이 page config가 한 번이라도 쓰였다는 표시 |

- **Read path**: `useDashboardBoards(page, catalog)`(`useDashboardBoards.tsx`)가 `useMyAppConfig('dashboard')`의 page 값을 `sanitizeDashboardPageConfig`로 검사한다. 남는 보드가 없으면 저장값이 없는 것으로 본다.
- **Single writer**: `userConfig.dashboard`는 `useDashboardBoards`만 `useUpdateMyUserAppConfig(['dashboard', page], …)`로 쓴다. 다른 scope의 `userConfig`에 `dashboard` key를 쓰는 코드는 두지 않는다.
- **Board tabs**: `projectAdmin`과 `admin` page는 `DashboardBoardTabs`로 보드를 고르고, 더하고(빈 보드로 시작), 이름을 바꾸고, 지운다. 마지막 보드는 지울 수 없다. 보드 삭제는 되돌릴 수 있는 동작이라 `BAIPopconfirm`으로 확인한다. `project` page는 보드 하나만 두고 탭을 그리지 않는다.

### 3. 기본 보드는 template key에서 고른다

- **Precedence**: `resolveTemplate`(`dashboardConfig.ts`)이 page의 template을 `domainConfig.dashboardTemplates[page]`, `publicConfigByDomain[<domain>].dashboardTemplates[page]`, `defaultBoardModel`(catalog의 `seedBoard`) 순서로 고른다. 값이 `DashboardModel`로 검사되지 않으면 다음 순서로 넘어간다.
- **Template knownKeys**: `knownKeys`가 없는 template은 지금 catalog의 page 카드를 모두 본 것으로 친다. template이 뺀 카드는 보드에 나오지 않는다.
- **Template use**: 저장된 보드가 없는 page는 template을 그대로 보여 주고, 사용자가 처음 고칠 때 쓴다. "새 보드"는 패널 없이 시작하고, 지금 catalog의 카드를 모두 본 것으로 쳐서(`createEmptyBoard`) 기본 카드가 채워지지 않는다. "기본 배치로 초기화"는 열린 보드의 패널을 template으로 되돌리고, template에 없는 사용자 정의 패널과 보드의 이름, 필터 값은 남긴다.
- **Template editing**: template을 고치는 화면은 이 결정의 범위 밖이다. superadmin은 `useUpdateDomainAppConfig`·`useUpdatePublicDomainAppConfig`로 같은 key를 쓴다.

### 4. 쓰기는 debounce하고 한 번에 하나만 보낸다

- **Optimistic state**: `update`는 다음 page config를 jotai atom `optimisticDashboardAtom`에 바로 넣어 화면에 보여 주고, 쓰기를 queue에 넣는다. 쓰기와 `useRefetchMyAppConfig`가 끝나면 atom의 값이 그 쓰기의 값과 같을 때만 지운다. 쓰기가 실패하면 atom을 지워 서버 값으로 돌아가고 오류 message를 띄운다.
- **Write queue**: `createWriteQueue`(`writeQueue.ts`)가 800ms(`DASHBOARD_WRITE_DELAY_MS`) 안에 들어온 값을 page마다 마지막 값 하나로 합치고, 앞선 쓰기가 끝난 뒤에만 다음 쓰기를 시작한다. 앱 전체에 queue는 `useDashboardBoards.tsx`의 module 하나다. 끌기와 크기 바꾸기는 이벤트마다 쓰기를 보내지 않는다.
- **Migrated flag**: 모든 쓰기는 page config에 `migrated: true`를 붙인다.

### 5. localStorage 보드는 한 번 옮긴다

- **Source order**: `migrateLocalStorage`가 `dashboard_board.<page>`를 먼저 읽고, 없으면 `project` page는 `dashboard_board_items`와 `custom_dashboard_panels`를, `admin` page는 `admin_dashboard_board_items`를 `migrateLegacyBoard`로 바꾼다. `projectAdmin` page는 #10580 이전의 key가 없어 `dashboard_board.projectAdmin`만 읽는다. `start_page_board_items`는 Start page의 카드라 옮기지 않는다.
- **When**: `resolveBoards`는 page에 저장된 config가 없고 localStorage 보드가 있을 때만 migration을 만든다. 보드는 template의 id, 이름, 필터 값 위에 localStorage의 `panels`와 `knownKeys`를 얹은 것이다.
- **Once**: `dashboardWriter.migrate`가 page마다 session에 한 번만 즉시 upsert하고, 성공한 뒤에만 그 page의 localStorage key를 지운다. 실패하면 localStorage는 남고 화면은 localStorage 보드를 계속 보여 주며, 다음 load에서 다시 시도한다. 저장된 config가 있는 page는 다른 브라우저에 localStorage 보드가 남아 있어도 옮기지 않는다.

### 6. 사용자 정의 패널에는 실험 기능 flag가 없다

- **Flag removal**: #10580이 `experimental_custom_dashboard_panels` 설정과 그 토글을 지웠다. 사용자 정의 패널은 catalog의 `kind: 'preset'` 항목이고, 볼 수 있는지는 data source의 `minRole`(`resourceRegistry.tsx`)이 정한다.

## 대안과 기각 사유

- **Templates inside userConfig**: template을 PUBLIC·DOMAIN scope의 `userConfig.dashboard`에 두어 deep-merge로 기본값을 내려준다. 읽는 hook이 하나로 끝난다. 기각한다. deep-merge가 template의 보드 배열과 사용자의 보드 배열을 섞어, 사용자가 지우거나 고친 보드가 template 값과 합쳐진다.
- **Keep localStorage**: 보드를 localStorage에 둔다. 매니저 왕복이 없다. 기각한다. 브라우저와 기기마다 보드가 다르고, 관리자가 role template을 내려줄 길이 없다.
- **Write per event**: 끌기와 크기 바꾸기마다 바로 upsert한다. 구현이 단순하다. 기각한다. 끌기 한 번이 수십 번의 문서 전체 upsert가 되고, 동시에 나간 upsert가 서로의 변경을 지운다.
- **Dedicated config name**: `dashboard`라는 새 app config 문서를 allow-list에 등록한다. deep-merge 규칙을 따로 정할 수 있다. 기각한다. 매니저의 allow-list 등록이 필요하고, 이미 등록된 세 문서로 충분하다.

## Consequences

- **Cross-device boards**: 같은 계정은 어느 브라우저와 기기에서나 같은 보드를 본다.
- **Admin-provided defaults**: superadmin은 template key를 써서 설치나 도메인의 기본 보드를 바꿀 수 있다. 이미 보드를 저장한 사용자는 "기본 배치로 초기화"를 누를 때 새 template을 받는다.
- **Write latency**: 보드 변경은 최대 800ms 뒤에 서버로 간다. 그 사이에 탭을 닫으면 마지막 변경이 저장되지 않는다.
- **Shared queue scope**: queue는 대시보드 쓰기만 줄 세운다. `useRecentSessionHistory`처럼 `userConfig`의 다른 key를 쓰는 기능과 동시에 upsert하면 USER fragment 문서를 두고 경합할 수 있다.
- **Vars without consumer**: `vars`는 저장되지만, 필터 바(#10582)가 생기기 전까지 카드의 데이터 범위를 바꾸지 않는다.
- **No pinned projects**: 보드에 프로젝트를 고정하는 field는 두지 않는다. 예전에 저장된 `pinned`는 `sanitizeDashboardModel`이 버린다.

## 출처

- #10422 (epic), #10580, #10581, 2026-10-26.
- #10422의 role-based dashboard 제안(저장과 마이그레이션, 기본 레이아웃).

관련: [ADR 0012](0012-scoped-search-fields-in-place-of-admin-fields.md).

## 용어

| 용어          | 뜻                                                                                                                                                               |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| panel catalog | 대시보드에 놓을 수 있는 카드의 정의 목록 `PANEL_CATALOG`이다. 고정 카드는 `kind: 'custom'`, data source마다 하나인 사용자 정의 패널은 `kind: 'preset'` 항목이다. |
| role template | 저장된 보드가 없는 사용자와 "기본 배치로 초기화"가 시작점으로 쓰는 page별 기본 보드이다. `dashboardTemplates` key에 `DashboardModel`로 둔다.                     |
| USER fragment | 매니저 app config 문서 중 사용자 한 명의 scope에 저장된 원본이다. `useMyAppConfig`가 읽는 view는 이 원본과 PUBLIC, DOMAIN fragment를 합친 값이다.                |
