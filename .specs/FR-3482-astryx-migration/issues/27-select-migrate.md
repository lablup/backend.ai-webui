# 27 — 무한스크롤 셀렉트 이행 배치

**Target:** to-astryx
**Blocked by:** 26
**Status:** done

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 셀렉트 래퍼 22종 중 재작성 필요 18종을 새 BAISelect 기반으로 배치 이행(프런티어 규칙 적용).

## Acceptance criteria

- [x] 18종 이행 완료 표(native/frontier 구분) — see census table below
- [x] 대표 실동 스크린샷 (오케스트레이터 지시로 5종 → **2종 대표(name-valued 1 + id-valued 1)** scroll-load + labelInValue 값 계약 실측으로 축소; ticket 26이 이미 `BAIUserSelectAstryx` 1종을 실측했으므로 27은 배치 산출물 중 별도 2종을 실측)
- [x] verify.sh ALL PASS (relay/lint/format/tsc/terminology all pass; the pre-existing `BAIVFolderSelect.tsx` ref-type warning predates this ticket)

## Implementation notes

### 작업 방식

18종의 이행 레시피가 CONVERSION-BRIEF.md에 이미 기계적으로 정의되어 있어(ticket 26 산출물),
4개의 병렬 서브에이전트에 4종씩(16종)을 위임하고, 나머지 2종
(`BAIAdminResourceGroupSelect` — class C usePaginationFragment, `DeploymentSelect`
— app-level 파일, IconButton 부가 chrome 포함)은 직접 작업했다. 각 서브에이전트는
원본(antd) 파일과 공유 export 파일(`fragments/index.ts`)을 건드리지 않고 신규
`*Astryx.tsx` 파일만 생성했으며, `fragments/index.ts` 배선·`pnpm relay`·타입 오류
수정·하네스 실측·스크린샷·본 문서 갱신은 오케스트레이터(본 세션)가 통합 단계에서
일괄 수행했다.

### 이행 표 — 18종 전량 완료

| # | 래퍼 | 클래스 | 신규 파일 | 값 해석 쿼리 | PILOT-DECISION |
|---|---|---|---|---|---|
| 1 | `BAIUserSelect` | A (name, `email`) | `BAIUserSelectAstryx.tsx` (ticket 26 산출, 27은 불변 재사용) | 있음 | P26-3/4/6/7 (코어 문서 참조) |
| 2 | `BAIAdminContainerRegistrySelect` | B/A 이중 (`valuePropName`) | `BAIAdminContainerRegistrySelectAstryx.tsx` | 있음 | `onChange` 2번째 `option` 인자 드롭(미사용 확인); notFoundContent 드롭 |
| 3 | `BAIAdminImageSelect` | B (`toLocalId`) | `BAIAdminImageSelectAstryx.tsx` | 있음 | 원본의 `labelCache`+`useOptimistic` 오버레이 드롭(해석쿼리 폴백으로 대체) |
| 4 | `BAIAdminKeypairResourcePolicySelect` | A (`name`==label) | `BAIAdminKeypairResourcePolicySelectAstryx.tsx` | **없음** (name이 곧 label이라 해석 불필요, 원본도 동일) | multiple 지원(`UserFolderPermissionPanel`이 실사용) |
| 5 | `BAIAdminModelServiceSelect` | B (`toLocalId`) | `BAIAdminModelServiceSelectAstryx.tsx` | 있음 (단일 노드 쿼리 한계로 multi-select 시 1번째 키만 해석 — 원본 한계 그대로 보존) | notFoundContent 드롭 |
| 6 | `BAIAdminProjectSelect` | B (`toLocalId`) | `BAIAdminProjectSelectAstryx.tsx` | 있음 | 없음(원본에 rich rendering 없었음) — **select27 하네스로 실동 증명(id-valued 대표)** |
| 7 | `BAIAdminResourceGroupSelect` | **C** (`usePaginationFragment`, `endReached`→`loadNext(10)`) | `BAIAdminResourceGroupSelectAstryx.tsx` | **없음** (resourceGroup `name`이 곧 id·label) | `queryRef` 계약 불변 |
| 8 | `BAIAdminSessionSelect` | B (`toLocalId`) | `BAIAdminSessionSelectAstryx.tsx` | 있음 | 원본의 2번째 `option` 인자 콜백 드롭(단일 plain-key 계약으로 통일) |
| 9 | `BAIAvailablePresetSelect` | B (`toLocalId`) | `BAIAvailablePresetSelectAstryx.tsx` | 있음 | `optionRender` 보조줄→`description`; `runtimeVariant` optgroup 그룹핑 드롭(flat list로) |
| 10 | `BAIBucketSelect` | B (raw id, `toLocalId` 미사용 — 원본 그대로) | `BAIBucketSelectAstryx.tsx` | **불가능** (`ObjectStorage.namespaces`에 filter 인자 자체가 스키마에 없음) — 로드된 페이지 내에서만 라벨 해석, 나머지는 raw id 표시 | `autoSelectOption` 드롭; imperative `scrollTo(0)` 드롭; limit 1 그대로 보존(특이하지만 원본 값) |
| 11 | `BAIDeploymentSelect` (fragments/BUI) | B (raw id) | `BAIDeploymentSelectAstryx.tsx` | 있음(단일 노드 쿼리 한계로 multi 시 1번째만) | notFoundContent 드롭 |
| 12 | `BAIKeypairSelect` | A (`access_key`) | `BAIKeypairSelectAstryx.tsx` | 있음 | monospace 스타일 드롭(label은 plain string) — **select27 하네스로 실동 증명(name-valued 대표)** |
| 13 | `BAIObjectStorageSelect` | B (raw id) | `BAIObjectStorageSelectAstryx.tsx` | **신규 추가** (원본은 labelInValue 자체가 없어 해석쿼리가 아예 없었음; `objectStorage(id:)` 단일 노드 쿼리 신설) | `<BAIText>` 래핑 드롭; imperative `scrollTo(0)` 드롭; multi-select 미지원(id-list filter 없음); limit 1 원본 그대로 |
| 14 | `BAIProjectSelect` (fragments/BUI) | B (raw id, `toLocalId`는 filter 빌드에만 사용) | `BAIProjectSelectAstryx.tsx` | 있음 | 없음 |
| 15 | `BAIProjectVfolderSelect` | B (`toLocalId`) | `BAIProjectVfolderSelectAstryx.tsx` | 있음 | `onClickVFolder` 트리거 링크 드롭(P26-3/4); 보조 id 텍스트→`description`; multi 미지원(원본도 단일값) |
| 16 | `BAIRuntimeVariantSelect` | B (`toLocalId`) | `BAIRuntimeVariantSelectAstryx.tsx` | 있음 | 없음; 페이지 크기 20(원본 그대로) |
| 17 | `BAIStorageHostSelect` | B (raw id) | `BAIStorageHostSelectAstryx.tsx` | 있음 | monospace 라벨 스타일 드롭; multiple 지원 |
| 18 | `BAIVFolderSelect` | B (`valuePropName`: `id`\|`row_id`) | `BAIVFolderSelectAstryx.tsx` | 있음 | `onClickVFolder` 트리거 링크 드롭; 보조 id 텍스트→`description`; multi 지원 |
| 19 | `DeploymentSelect` (react/src/Chat, app-level) | B (raw id) | `DeploymentSelectAstryx.tsx` | 있음 | `Space.Compact` 용접 해체는 원본이 이미 기록(재확인만); `onChange`의 2번째 `option.deployment` 부가 데이터 드롭(실사용처 없음 확인 — `ChatHeader.tsx`는 1번째 인자만 사용); info 버튼은 `BAIComplexSelect` 밖 형제 요소로 유지 |

18종 전부 CONVERSION-BRIEF §2 레시피(A/B/C) 그대로 변환 완료. 원본 antd 파일은
**전부 무변경**(프런티어 규칙) — 아직 실제 호출부를 신규 래퍼로 전환하지 않았으므로
(별도 후속 작업), antd `BAISelect`/22종 래퍼 export가 여전히 `fragments/index.ts`에서
함께 나간다.

공통 PILOT-DECISION(반복 적용, ticket 26 코어 문서에 이미 기록): P26-3(label은 string,
rich content는 description/extra) · P26-4(트리거 칩은 표시 전용, 제거 버튼 없음) ·
P26-6(`open ? network-only : store-only`) · P26-7(notFoundContent skeleton 전량 드롭).
페이지네이션 창(페이지 크기)은 전 래퍼에서 **원본 그대로 보존** — 절대 축소하지 않음.

### 서바이버 (전환하지 않음, 사유 명시)

**정적/단발성 옵션 — Relay 페이지네이션 대상 아님 (MAPPING §3.1 경계):**

| 파일 | 사유 |
|---|---|
| `BAIDomainSelect.tsx` | 단발성 `useLazyLoadQuery`, 스크롤 페이지네이션 없음 |
| `BAIResourceGroupSelect.tsx` | 동일 |
| `BAIProjectResourcePolicySelect.tsx` | 동일 |
| `BAIStorageProxySelect.tsx` | 동일 |
| `BAIAllowedHostNamesSelect.tsx` | 완전 정적(로컬 훅), Relay 미사용 |
| `BAIProjectResourceGroupSelect.tsx` (top-level) | non-Relay 클라이언트 SDK 훅(`useProjectResourceGroups`) + 클라이언트측 하이라이트 검색 |
| `react/src/components/AccessKeySelect.tsx` | 단발성 Relay 쿼리, 소량 리스트 |
| `react/src/components/AgentSelect.tsx` | Relay 백엔드이나 `useBAIPaginationOptionState` 고정창 방식(스크롤 loadNext 아님) |
| `react/src/components/Chat/ModelSelect.tsx` | 부모가 넘긴 로컬 옵션, 쿼리 없음 |
| `react/src/components/KeypairResourcePolicySelect.tsx` | 단발성 Relay 쿼리, raw antd Select |
| `react/src/components/ProjectSelect.tsx` | non-Relay 클라이언트 훅, ReactNode 라벨(역할 아이콘) |
| `react/src/components/PrometheusCategorySelect.tsx` | 단발성 Relay 쿼리 |
| `react/src/components/ResourcePresetSelect.tsx` | 단발성 Relay 쿼리 |
| `react/src/components/StorageSelect.tsx` | REST/TanQuery 백엔드, Relay 아님 |
| `react/src/components/UserResourcePolicySelect.tsx` | 단발성 Relay 쿼리 |
| `react/src/components/UserSelect.tsx` | raw antd `Select`(BAISelect 래핑 아님), 150건 단발 fetch |
| `react/src/components/VFolderSelect.tsx` | **미사용 코드** — 어디서도 렌더되지 않음(타입 `VFolder`만 `VFolderTable.tsx`가 재사용); `SessionLauncherPage.tsx`의 사용처는 주석 처리됨 |

**이미 Astryx 네이티브 — 이전 티켓에서 전환 완료, 재작업 불필요:**

| 파일 | 비고 |
|---|---|
| `react/src/components/Chat/AIAgentSelect.tsx` | Astryx `Selector` 직접 사용 |
| `react/src/components/Chat/DeploymentTokenSelect.tsx` | Astryx `Selector` 직접 사용 |

**`mode="tags"` (자유 입력) — ticket 27 스코프 밖 (CONVERSION-BRIEF §2.D):**

| 파일 | 비고 |
|---|---|
| `react/src/components/PortSelectFormItem.tsx` | `mode="tags"` 사용 — `Tokenizer`+`hasCreate` 후보, 18종에 미포함(별도 결정 필요) |

18종의 재작성 대상 셀렉트 중 `mode="tags"`를 쓰는 것은 없었음(CONVERSION-BRIEF의 사전
확인과 일치).

### 실동 증명 — select27 하네스

ticket 26의 `select26` 하네스와 별도로, **배치 산출물 자체**(4개 병렬 서브에이전트가
생성한 16종 중 2종)를 검증하기 위해 `react/theme-probe/select27.{html,tsx}` +
`select27-env.ts` + `shoot27.mjs`를 신설했다. mock Relay 환경이 `offset`/`limit`에
따라 다른 페이지를 반환하는 것은 select26과 동일한 기법.

- **name-valued 대표**: `BAIKeypairSelectAstryx` (`?case=keypair`) — 35개 keypair,
  페이지 10개.
- **id-valued 대표**: `BAIAdminProjectSelectAstryx` (`?case=project`) — 24개 project,
  페이지 10개.

실측 (`.scratch/astryx-migration/shots/27/measure-27.json`, headless Chromium):

```
keypair_initialRows       10
keypair_rowsAfterScroll   [20, 30, 35, 35]      ← 바닥 도달 4회, 35건 전량 로드
keypair_pageFetches       ["0/10","10/10","20/10","30/10"]
keypair_valueAfterKeyboardEnter  "PROBEKEY002"   ← ↓↓+Enter = 3번째 행

project_initialRows       10
project_rowsAfterScroll   [20, 24, 24, 24]       ← 바닥 도달 시 24건 전량 로드
project_pageFetches       ["0/10","10/10","20/10"]
project_valueAfterKeyboardEnter  "00000000-0000-0000-0000-000000000002" ← labelInValue의 value가 toLocalId 결과

pageErrors  []
```

라이트/다크 각 4장, 총 8장 스크린샷: `.scratch/astryx-migration/shots/27/ticket27-{keypair,project}-{open-,}{light,dark}.png`.

콘솔에 relay-test-utils 정규화 경고("Payload did not contain a value for field
`id: id`")가 keypair 케이스에서 반복 관측됐으나 — mock 응답이 쿼리 선택셋과
정확히 일치하는데도 KeyPair 타입에 `id` 필드가 없어 발생하는 하네스 자체의
잡음이며, 실측값(행 수·페이지 오프셋·키보드 선택값)은 전부 정확함. 컴포넌트
결함 아님.

### fragments/index.ts 배선

18종 전부(`BAIUserSelectAstryx` 제외 — ticket 26이 이미 배선) 오케스트레이터가
직접 `fragments/index.ts`에 원본 export 바로 뒤에 대응 export를 추가했다. 4종은
원본과 동일한 타입명(`VFolderNode`, `ProjectVfolderNode`, `RuntimeVariantNode`,
`StorageHostNode`)을 재사용하고 있어 배럴에서 `as *AstryxNode`로 별칭 처리해
충돌을 피했다(예: `export type { VFolderNode as VFolderAstryxNode } from
'./BAIVFolderSelectAstryx'`).

### 통합 중 발견·수정한 문제

1. **`vite-plugin-relay-lite` 오탐지**: `BAIBucketSelectAstryx.tsx`의 헤더 주석에
   `` `data/schema.graphql` `` 표기가 있었는데, 이 플러그인의 graphql 태그 탐지
   정규식(`/(?<prefix>...|\.|...)\s*graphql`(?<query>[^`]*)`/gm`)이 "스키마.**graphql**`"
   부분을 실제 태그 시작으로 오인해, 다음 백틱(`` `before` ``)까지의 TS 코드를
   GraphQL로 파싱 시도 → `Syntax Error: Unexpected ")"`. 주석에서 백틱을 제거해
   해결(`schema: data/schema.graphql`로 표기 변경). `pnpm relay`(오프라인 컴파일러)는
   정상 AST 파싱을 쓰므로 이 문제를 잡지 못했다 — **빌드까지 실행해야 드러나는
   클래스의 오류**였다.
2. **`DeploymentSelectAstryx.tsx` TS2783**: `label={...}` 뒤에 `{...selectProps}`를
   펼쳐 `label`이 덮어써지는 문제 — `label`/`isLabelHidden`/`placeholder`를 이
   래퍼의 Omit 목록에 추가해 컴파일러가 상위 호출부의 이 3개 prop을 애초에 받지
   않도록 정리(이 래퍼는 도메인 고정 라벨이라 override 불필요).

### verify.sh 관련 메모

`scripts/verify.sh`의 relay 드리프트 체크(`check_relay_drift`)는 `git status
--porcelain -- __generated__`가 **비어 있을 것**을 요구한다 — 신규 GraphQL
오퍼레이션을 도입하는 세션에서는 커밋 전에는 항상 새 파일이 걸리므로, 이 체크는
**커밋 이후 재실행**해야 진짜로 깨끗해진다(ticket 26도 동일 구조). 본 세션은
1) 커밋 전 verify.sh로 relay 외 전 항목(lint/format/tsc/terminology) PASS 확인 →
2) 커밋 → 3) verify.sh 재실행으로 relay 포함 전 항목 최종 확인, 순서로 진행했다.

## PILOT-DECISIONs (ticket 27 신규분, 27 내부에서 결정)

| # | 결정 |
|---|---|
| P27-1 | `name`이 곧 label인 도메인(KeypairResourcePolicy, ResourceGroup)은 선택값 해석 쿼리 자체를 생략 — `{label: key, value: key}`가 폴백이 아니라 항상 옳은 값이기 때문. 쿼리 왕복만 늘리는 인프라라 추가하지 않았다. |
| P27-2 | 스키마가 filter 인자를 제공하지 않는 연결(`ObjectStorage.namespaces`)은 해석 쿼리를 만들 수 없음 — 이미 로드된 페이지에서만 라벨을 찾고, 나머지는 raw id를 그대로 표시(antd가 매치 없는 옵션에 raw value를 보여주던 것과 동일한 폴백, 소스만 로컬로 바뀜). |
| P27-3 | 배치 병렬화: 기계적 레시피(A/B 클래스, 16종)는 4개 서브에이전트에 위임, 상태 공유 파일(`fragments/index.ts`) 편집과 `pnpm relay`/타입체크/커밋은 통합 단계에서 오케스트레이터가 단독 수행 — 동시 쓰기 충돌을 원천 차단. |
| P27-4 | app-level 래퍼(`DeploymentSelect`)의 부가 chrome(정보 버튼)은 `BAIComplexSelect` 밖 형제 요소로 유지 — 원본이 이미 `Space.Compact` 용접을 해체해뒀던 결정을 그대로 승계. |

## 관련

- ticket 26 — `BAIComplexSelect` 코어 + `BAIUserSelectAstryx` 실증 + 본 CONVERSION-BRIEF.md
- `.scratch/astryx-migration/shots/26/CONVERSION-BRIEF.md` — 27이 그대로 따른 레시피
- `.scratch/astryx-migration/shots/27/measure-27.json` + 8장 스크린샷 — 본 티켓 실측
- `react/theme-probe/select27.{html,tsx}` + `select27-env.ts` + `shoot27.mjs` — 실측 하네스
