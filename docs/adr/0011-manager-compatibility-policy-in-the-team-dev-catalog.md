# 0011 — Manager compatibility policy in the team dev catalog

## Summary

> 낯선 용어는 문서 맨 아래 [용어](#용어)에 모아 두었다.

- 이 저장소의 branch가 지원하는 매니저 [floor](#용어)와 개발의 [target](#용어)은 팀 dev catalog의 `policy.webui.branches[<branch>]`가 선언한다. 이 저장소의 ADR, 코드, 문서는 그 값을 적지 않고 catalog를 읽으라고만 적는다.
- 개발자와 agent는 `pnpm run dev-env compat`으로 checkout한 branch의 floor와 target, 그것을 돌리는 catalog server, 그리고 애플리케이션 코드에서 floor 이하인 [version gate](0010-component-level-manager-version-gates.md#용어)의 `file:line` 목록을 읽는다.
- floor를 올리는 사람은 catalog의 policy를 고치고, `dev-env compat`이 나열한 gate를 [ADR 0010](0010-component-level-manager-version-gates.md)의 규칙대로 지우는 PR을 낸다. ADR은 새로 쓰지 않는다.
- policy에 없는 branch는 유지하지 않는 branch다.
- 이 ADR은 ADR 0010 Decision 1절의 **Floor location** 하나만 대신한다.

## Context

- **Floor in the ADR**: ADR 0010 Decision 1절은 결정 당시의 지원 기준을 `26.4` [line](#용어)으로 적었고, **Floor location**에서 그 값은 코드의 상수가 아니라 ADR 본문이 정하며 기준을 올리는 PR은 그 절을 대신하는 ADR을 함께 쓴다고 정했다.
- **Release branches**: `main` 외에 `26.9` 같은 release branch도 자기 floor를 갖는다.
- **Target line**: `main`은 floor와 별개로 가장 새 매니저 line을 상대로 개발한다. 그 line에 release가 없으면 backend.ai의 `main` branch가 target이다. 이 결정 전에는 어떤 문서도 target을 적지 않았다.
- **Team dev catalog**: 팀 PR board(`lablup/frontend-board`)가 `http://board.<domain>/api/catalog`로 dev API server와 test account의 catalog를 내고, board의 catalog page(`?view=catalog`)에서 편집한다(`DEV_ENVIRONMENT.md`의 "Dev servers and test accounts"). `scripts/dev-env.mjs`가 이미 그것을 읽고, board는 server마다 매니저 버전을 probe한다. board는 webui와 다른 저장소에 있고, dev VPN 안에서만 열린다.
- **Version strings alone**: 매니저는 버전 문자열(`26.9.0rc1`)만 알려 주고 commit은 알려 주지 않는다. backend.ai `main`의 `VERSION` 파일은 release PR만 올리므로, `main`으로 build한 server는 같은 이름의 pre-release와 구별되지 않고 숫자로는 release line의 최신 patch보다 낮아 보인다. 그래서 agent는 버전만으로 floor server와 target server를 고르지 못한다.
- **Shared contract**: catalog의 field 이름과 의미는 board, webui, `fw` plugin의 `webui-connection-info` skill이 함께 쓰는 contract로 정했다.

## 설계도

### policy를 읽는 곳

```mermaid
flowchart LR
  github["GitHub<br/>lablup/backend.ai<br/>VERSION, release tags"]
  board["PR board<br/>catalog.json의 policy와 server의 tracks<br/>probe: status, upstream, resolved"]
  api["GET /api/catalog"]
  compat["scripts/dev-env.mjs compat<br/>dev-env-lib.mjs"]
  verify["scripts/verify.sh<br/>Compat floor lane"]
  skill["fw webui-connection-info skill"]
  code["react/src, packages/backend.ai-ui/src,<br/>packages/backend.ai-client/src"]
  github -- "main_version, lines" --> board
  board -- "policy, upstream, servers" --> api
  api -- "floor, target, resolved" --> compat
  api -- "floor server, target server" --> skill
  code -- "version gate의 버전 문자열" --> compat
  compat -- "report, exit 0" --> verify
```

### floor를 올리는 순서

```mermaid
flowchart TD
  edit["catalog page에서 policy의 min_manager_line을 고친다"]
  run["pnpm run dev-env compat"]
  list["floor 이하 gate의 file:line 목록"]
  pr["gate와 fallback 분기를 지우는 PR (ADR 0010의 규칙)"]
  edit -- "새 floor line" --> run
  run -- "gate scan 결과" --> list
  list -- "PR 본문에 싣는 목록" --> pr
```

## Decision

### 1. floor와 target은 catalog policy가 branch마다 선언한다

- **Policy location**: catalog 문서의 `policy.webui.branches`가 webui branch 이름을 key로 아래 field를 담는다.

| field | 값 | 뜻 |
|---|---|---|
| key | `main`, 또는 `^\d+\.\d+$` 꼴의 release branch 이름 | 그 entry를 읽는 webui branch |
| `min_manager_line` | `^\d+\.\d+$` 꼴의 line | floor. 그 line 전체를 뜻하고 최신 patch를 가정한다(ADR 0010의 **Latest patch assumed**). |
| `target` | `main`(backend.ai의 `main` branch) 또는 line | target. `parseCatalog`는 다른 값을 `null`로 읽고 warning을 남기며, `compat`은 `target: unknown`으로 찍는다. |
| `notes` | 문자열 | 자유 메모 |

- **No number in this repository**: 이 저장소의 ADR, 코드, 문서는 floor나 target의 값을 적지 않는다. 값이 필요한 문서는 catalog와 `pnpm run dev-env compat`을 가리킨다. `.github/instructions/e2e.instructions.md`, `e2e/E2E-TEST-NAMING-GUIDELINES.md`, `.github/PULL_REQUEST_TEMPLATE.md`가 그렇게 적는다.
- **Edit path**: policy는 board의 catalog page(`?view=catalog`)에서 고치고, board가 `PUT /api/catalog/policy`로 저장하며 검증한다. release branch를 자르는 사람이 그 branch의 entry를 더한다. webui 쪽에서 쓰는 길은 없다.
- **Unmaintained branch**: `branches`에 없는 branch는 유지하지 않는 branch이고, `dev-env compat`은 그 branch에 "not maintained"와 유지하는 branch 목록을 답한다.

### 2. `dev-env compat`이 policy를 읽고 보고한다

- **Branch resolution**: `scripts/dev-env.mjs compat`은 `git rev-parse --abbrev-ref HEAD`로 checkout한 branch를 읽고, `--branch <name>`이 있으면 그 이름을 대신 쓴다. 둘 다 `dev-env-lib.mjs`의 `resolveCompatBranch`를 거친다. 이름이 `^\d+\.\d+$`이면 그 entry를, 그 밖의 모든 이름(feature branch, detached HEAD, git checkout이 아닌 곳)은 `main`의 entry를 읽는다.
- **Report**: 명령은 floor line, target과 board가 GitHub에서 푼 target 버전(`resolved.target_version`), 그리고 아래 세 server 목록을 찍는다. board가 `resolved`를 보내지 않으면 `dev-env-lib.mjs`의 `compatReport`가 catalog의 server, `upstream`, [tracks](#용어), [freshness](#용어)로 같은 목록을 계산한다. live server는 probe의 `status.live`가 `true`인 server다.

| 목록 | contract의 field | 조건 |
|---|---|---|
| floor servers | `floor_servers` | live server 중 매니저 버전의 line이 floor와 같은 것 |
| target servers | `target_servers` | live server 중 `tracks`가 target과 같고 `freshness`가 `current`인 것 |
| below the floor | `below_floor_servers` | live server 중 매니저 버전의 line이 floor보다 낮은 것 |

- **Gate scan**: 명령은 `react/src`, `packages/backend.ai-ui/src`, `packages/backend.ai-client/src` 아래 `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` 파일을 읽고, `__generated__`·`node_modules` 디렉터리와 `*.test.*`, `*.spec.*`, `*.stories.*` 파일은 건너뛴다. `dev-env-lib.mjs`의 `findVersionGates`가 아래 형태를 정규식으로 찾는다.

| 형태 | 예 | floor 이하로 세는 조건 |
|---|---|---|
| `isManagerVersionCompatibleWith('V')` | `isManagerVersionCompatibleWith('26.9.0')` | V의 line이 floor 이하 |
| `isManagerVersionCompatibleWith([...])` | `isManagerVersionCompatibleWith(['26.4.5', '26.8.2'])` | 모든 항목의 line이 floor 이하(ADR 0010의 **Backport arrays stay**) |
| `@since(version: "V")` | `@since(version: "26.7.0")` | V의 line이 floor 이하 |
| `@deprecatedSince(version: "V")` | `@deprecatedSince(version: "26.4.0")` | V의 line이 floor 이하 |
| `@sinceMultiple(versions: [...])` | `@sinceMultiple(versions: ["26.4.5", "26.9.0"])` | 모든 항목의 line이 floor 이하 |

- **Version strings**: `versionLine`은 `<digits>.<digits>`로 시작하지 않는 버전(`x.y.z`)을 무시하고, `compareLines`는 line을 두 숫자 성분으로 비교한다. `packages/backend.ai-client/src/pep440.ts`는 쓰지 않는다.
- **Report only**: catalog를 읽지 못하면(`WEBUI_DEV_ENV_CATALOG`·`WEBUI_DEV_ENV_CATALOG_URL`·`DEV_GW_CONFIG`가 모두 없고 `~/.config/fw/dev-gw.json`도 없을 때, board에 닿지 않을 때, board가 `policy`를 내지 않을 때) 명령은 `compat: no policy to read — <이유>` 한 줄을 찍고 exit 0으로 끝난다. `--json`은 그 경우 `{ available: false, branch, gitBranch, reason }`을 낸다.
- **JSON output**: `--json`은 아래 key를 낸다.

| key | 값 |
|---|---|
| `available` | `true` |
| `gitBranch` | `git rev-parse`가 답한 이름, 없으면 `null` |
| `branch`, `maintained` | 읽은 policy branch와 entry가 있는지. 없으면 `maintainedBranches`가 유지하는 branch 목록이다. |
| `floor`, `target`, `targetVersion`, `notes` | entry의 값과 푼 target 버전 |
| `floorServers`, `targetServers`, `belowFloorServers` | 위 표의 세 목록 |
| `gates` | `{ file, line, kind, versions }`의 배열, 파일 이름과 줄 순 |
| `policyUpdatedAt`, `upstream`, `warnings` | policy의 `updated_at`, board의 GitHub probe 결과, `parseCatalog`의 warning |

- **List and status**: `dev-env list`는 live server의 `tracks`와 `freshness`를 버전 옆에 찍고(`tracks main (current)`, `tracks 26.9 (behind: expected 26.9.4)`), `dev-env status`는 policy의 branch별 floor와 target을 한 줄로 찍는다.

### 3. floor를 올리는 PR은 ADR을 쓰지 않는다

- **Catalog first**: floor를 올리는 사람은 catalog page에서 그 branch의 `min_manager_line`을 고친다.
- **Deletion PR**: 그다음 `pnpm run dev-env compat`이 나열한 gate를 ADR 0010 Decision 1절의 규칙(gate, fallback 분기, 그 분기만 쓰던 component·query·i18n key, `@include`·`@skip` variable을 함께 지운다)대로 지우는 PR을 내고, PR 본문에 그 명령의 출력을 싣는다.

### 4. 검증은 report-only다

- **verify.sh lane**: `scripts/verify.sh`의 `Compat floor` lane은 `WEBUI_DEV_ENV_FETCH_TIMEOUT_MS=4000`으로 `node scripts/dev-env.mjs compat`을 돌려 출력을 그대로 찍고, `=== ALL PASS ===`에 영향을 주지 않는다. Astryx token gate lane과 같은 `report` 종류다.
- **Skip rule**: lane은 `WEBUI_DEV_ENV_CATALOG`와 `WEBUI_DEV_ENV_CATALOG_URL`이 모두 없고 `${DEV_GW_CONFIG:-~/.config/fw/dev-gw.json}` 파일도 없으면 한 줄로 건너뛴다. CI runner가 그 경우다. board는 dev VPN 안에서만 열리므로 CI는 floor를 강제하지 않고, 리뷰어가 lane의 출력으로 floor 이하 gate를 본다.

## 대안과 기각 사유

- **Keep the floor in the ADR**: ADR 0010의 **Floor location**대로 값을 ADR 본문에 두고, 올릴 때마다 대신하는 ADR을 쓴다. 저장소 안에서 값을 읽을 수 있다는 것이 장점이다. 기각한 이유는 LTS line이 바뀔 때마다 ADR이 하나씩 늘고, branch마다 다른 floor와 target을 본문 하나가 담지 못하기 때문이다.
- **Constant in code**: `packages/backend.ai-client`에 `SUPPORTED_MANAGER_FLOOR` 같은 상수를 두고 lint나 test가 그 값과 gate를 비교한다. CI가 floor 이하 gate를 막을 수 있다는 것이 장점이다. 기각한 이유는 값이 branch마다 다르고, server의 `tracks`·`freshness`와 함께 읽어야 floor server와 target server를 고를 수 있는데 그 정보는 board만 갖기 때문이다. 상수가 catalog와 어긋나도 아무도 검사하지 않는다.
- **Policy file in the repository**: `compat-policy.json` 같은 파일을 저장소에 두고 board가 그것을 읽는다. 값이 PR 리뷰를 거친다는 것이 장점이다. 기각한 이유는 release branch마다 파일 사본이 생겨 branch 사이에서 어긋나고, board가 webui의 branch를 돌며 파일을 읽어야 하기 때문이다. catalog는 이미 한곳에서 편집되고 board가 이전 버전을 보관한다.
- **CI enforcement**: `Compat floor` lane을 gate로 두어 floor 이하 gate가 있으면 verify를 실패시킨다. 지워야 할 gate가 남지 못한다는 것이 장점이다. 기각한 이유는 board가 VPN 안에만 있어 CI가 policy를 읽을 수 없고, 읽을 수 있는 box에서만 실패하는 gate는 환경에 따라 결과가 갈리기 때문이다.

## Consequences

- **Floor raise cost**: floor를 올리는 사람은 catalog를 고치고 gate를 지우는 PR 하나를 낸다. webui 쪽 문서는 고칠 것이 없다.
- **Floor source**: 저장소만 읽는 사람은 floor를 알 수 없다. dev VPN 밖의 사람과 CI는 `dev-env compat`의 안내 한 줄만 본다.
- **No enforcement**: floor 이하 gate가 남아도 CI는 통과한다. 리뷰어가 `Compat floor` lane의 출력으로 잡는다.
- **Contract drift**: catalog의 field 이름은 board와 `fw` plugin과 함께 바뀌어야 한다. `parseCatalog`는 모르는 key를 무시하고 잘못된 값은 warning으로 남기므로, board가 먼저 바뀌어도 명령은 멈추지 않는다.
- **Scan method**: gate scan은 정규식이라 `isManagerVersionCompatibleWith(version)`처럼 변수를 넘기는 호출(`react/src/RelayEnvironment.ts`의 directive helper)은 세지 않고, `.graphql` 파일은 읽지 않는다. component, hook, graphql tag의 gate는 버전을 문자열 literal로 적는다(ADR 0010의 **Version string**).

## 출처

- GitHub: #10345.
- 결정일: 2026-10-14. contract는 board(`lablup/frontend-board`), webui, `fw` plugin(`webui-connection-info` skill)이 같은 날 함께 정했다.
- 관련: [ADR 0010](0010-component-level-manager-version-gates.md)의 Decision 1절 **Floor location**을 이 ADR이 대신하고, 나머지 결정은 그대로 발효 중이다. [ADR 0006](0006-version-gated-field-pairs-across-manager-versions.md)의 `@since`·`@deprecatedSince` pair는 `dev-env compat`이 세는 gate 형태 중 둘이다. 코드: `scripts/dev-env.mjs`, `scripts/dev-env-lib.mjs`, `scripts/verify.sh`. 문서: `DEV_ENVIRONMENT.md`의 "Manager compatibility policy".

## 용어

| 용어 | 뜻 |
|---|---|
| line | 매니저 버전의 앞 두 숫자 성분이다. `26.9.0rc1`의 line은 `26.9`, `26.4.13`의 line은 `26.4`다. LTS line은 backend.ai가 장기 지원하는 release line이다. |
| floor | 한 webui branch가 지원하는 가장 오래된 매니저 line이다. catalog의 `min_manager_line`이고, 그 line의 최신 patch를 가정한다. |
| target | 한 webui branch가 상대로 개발하는 매니저 line, 또는 그 line에 release가 없을 때 backend.ai의 `main` branch다. catalog의 `target`이다. |
| tracks | catalog server가 선언하는, 그 server를 build한 backend.ai branch(`main`) 또는 release line이다. board는 probe한 매니저 버전을 그것의 현재 버전과 비교한다. 선언하지 않은 server는 `null`이다. |
| freshness | board가 server의 probe 버전을 `tracks`의 현재 버전과 비교한 결과다. `current`, `behind`, `unknown` 중 하나다. |
