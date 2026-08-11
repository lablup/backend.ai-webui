# 28 — PowerSearch 일반화

**Target:** to-astryx
**Blocked by:** 09
**Status:** done

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 파일럿의 PowerSearch 스왑(직렬화+역파서)을 BAIPropertyFilter 사용처 전면으로 일반화. 연산자 라벨 i18n 연결 범위 명시.

## Acceptance criteria

- [x] BAIPropertyFilter 사용처 전환 완료 (45 live call sites — 아래 census)
- [x] URL 필터 상태 왕복 보존(공유 링크 회귀 없음) — 87 unit tests, 페이지별 대표
      필터 왕복 증명
- [x] verify.sh ALL PASS

## Implementation notes

### 전략 — 프런티어 번역자 in-place 재작성 (호출부 0 변경)

파일럿(ticket 16)은 `react/src/components/astryx-bui/BAIPropertyFilterAstryx.tsx`
라는 **포크**로 Data/VFolder 2페이지만 전환했다. 45개 호출부를 그 포크의 좁은
API로 하나씩 옮기는 대신, ticket 16이 `BAITabs`/`BAIRadioGroup`에 쓴 **같은 경로
재작성 + 소비자 무변경** 패턴을 택했다:

- `packages/backend.ai-ui/src/components/BAIPropertyFilter.tsx` — Backend.AI
  queryfilter DSL 문자열 필터. antd `Select`+`AutoComplete`+`Tag` 합성 →
  Astryx `PowerSearch`.
- `packages/backend.ai-ui/src/components/BAIGraphQLPropertyFilter.tsx` —
  GraphQL 필터 객체 필터. 동일.
- `packages/backend.ai-ui/src/components/BAIPowerSearchAdapters.tsx` (신규) —
  둘이 공유하는 번역 계층(옵션→`EnumItem`/`SearchSource`, `renderInput`→
  `custom` operator editor, chrome props).

외부 계약(`value`/`onChange`/`filterProperties`/`combinationMode`/
`singleCondition`/`loading`/`defaultValue`)은 그대로. **45개 호출부 중 코드
변경이 필요한 곳은 0이었고, `tsc --noEmit`이 react/BUI 양쪽 다 무수정 통과**
— 이것이 계약 보존의 1차 증거다.

포크(`BAIPropertyFilterAstryx.tsx`)는 삭제하고 `VFolderNodeListPage` /
`AdminVFolderNodeListPage`를 BUI 배럴로 되돌렸다 (`operatorLabels` prop 제거 —
아래 i18n 절). 파일럿이 추가했던 chrome props(`label`/`placeholder`/
`applyLabel`/`contentSearchFieldKey`/`resultCount`/`size`/`isDisabled`)는
`BAIPowerSearchChromeProps`로 BUI 공개 API가 되어 두 필터 모두에서 쓸 수 있다.

### 소비자 census (45 live + 1 주석 처리)

`BAIPropertyFilter` (DSL 문자열, 13곳 — 1곳은 주석):
`AdminUserCredentialList`, `AgentList`, `AgentSummaryList`,
`ContainerRegistryList`, `ImageList`, `ReservoirAuditLogList`,
`StorageProxyList`, `ComputeSessionNodeItems/ConnectedKernelList`(주석 처리됨),
`AdminComputeSessionListPage`, `AdminVFolderNodeListPage`,
`ComputeSessionListPage`, `ProjectPage`, `VFolderNodeListPage`.

`BAIGraphQLPropertyFilter` (GraphQL 객체, 33곳):
`AdminDeployment`, `AdminDeploymentPreset`, `AdminModelCard`,
`AdminPrometheusPreset`, `AdminRuntimeVariantPreset`, `AdminUserManagement`,
`DeploymentAutoScalingCard`, `DeploymentReplicasCard`,
`DeploymentRevisionHistoryTab`, `DeploymentSchedulingHistoryModal`,
`FairShareItems/FairShareList`, `LegacyRolePermissionTab`,
`LegacyRoleScopeTab`, `LoginHistory`, `LoginSession`,
`MyKeypairManagementModal`, `ProjectStoragePermissionTable`,
`RoleAssignmentTab`, `RouteSchedulingHistoryModal`, `ScopedAuditLog`,
`ScopedRolePermissionCard`, `SessionSchedulingHistoryModal`,
`UserFolderPermissionPanelV2`, `UserResourcePolicyV2`, `DeploymentListPage`,
`ModelStoreListPageV2`, `ProjectAdminDataPage`, `ProjectAdminDeploymentsPage`,
`ProjectAdminSessionPage`, `ProjectAdminUsersPage`, `RBACManagementPage`,
`ReservoirArtifactDetailPage`, `ReservoirPage`.

기능 축(census에서 확인한 실사용 표면): `renderInput` 6곳, `fixedOperator`
17곳, `valueMode: 'scalar'` 7곳, `singleCondition` 2곳, `combinationMode` 3곳,
`rule` 2곳, per-property `placeholder` 1곳, `type: 'boolean'` 12곳,
`'datetime'`/`'number'`/`'uuid'` 11파일.

### URL 왕복 보존 (하드 요구사항) — 증명 방식

두 필터 모두 `value`가 곧 URL 상태이자 GraphQL 변수다. 왕복을 **순수 함수 쌍**
으로 뽑아내고 페이지별 대표 필터로 테스트한다 (총 87 tests, 전부 통과):

- DSL: `parseFilterString` ⇄ `serializeFilters`
  (`buildFieldSpecs`가 양쪽에 같은 field spec을 공급).
  `BAIPropertyFilter.test.tsx` — 9개 페이지 fixture × 대표 필터 문자열,
  `roundTrip(props, s) === s` (byte 동일).
- GraphQL: `graphQLFilterToPowerSearchFilters` ⇄
  `powerSearchFiltersToGraphQLFilter`.
  조건 변환기(`convertGraphQLFilterToConditions` /
  `convertConditionsToGraphQLFilter`)는 **antd 구현에서 한 글자도 안 바꿨다** —
  객체 스키마가 바뀌지 않았다는 뜻. `BAIGraphQLPropertyFilter.test.tsx` —
  7개 페이지 fixture × 대표 필터 객체, `toEqual` 동일.

왕복이 깨질 수 있었던 두 함정을 **근사하지 않고 명시적으로** 처리했다:

1. **미설정 field / operator.** 오래된 공유 링크가 지금 빌드에 없는 property나
   (`legacy_field`) 이 빌드가 제공하지 않는 operator(`>=`, `in`)를 담을 수
   있다. 파일럿은 이런 토큰을 **드롭**했다(= 링크가 조용히 다른 쿼리가 됨).
   여기서는 inbound 문자열에서 field spec을 **합성**해 토큰을 살려 둔다 —
   화면에 보이고, 지울 수 있고, 재직렬화 시 원문 그대로다.
2. **비대칭 wildcard.** `ilike "%foo"`(접미 일치)를 표시용으로 `foo`로 벗긴 뒤
   순진하게 다시 감싸면 `"%foo%"`(부분 일치)가 되어 쿼리가 조용히 넓어진다.
   파싱할 때 토큰별 원본 raw 조각을 기억해 두고 손대지 않은 토큰은 그대로
   재방출한다.

그 외 회귀 테스트: boolean 무따옴표 / string 따옴표, 값 내부 공백,
빈 값 조건 드롭, 2회 왕복 안정성, `OR` combination mode, `singleCondition`,
`in` 리스트, datetime.

### i18n 범위 (명시 요구사항)

**우리(BUI 카탈로그, `useBAIi18n`)가 소유하는 것 — `packages/backend.ai-ui/src/locale/en.json`:**

- `comp:BAIGraphQLPropertyFilter.operator.*` — **기존 네임스페이스 재사용**
  (22개 로케일에 이미 번역 존재). 신규 키는 en.json에만 6개 추가:
  `Contains`, `NotContains`, `StartsWith`, `NotStartsWith`, `EndsWith`,
  `NotEndsWith` — `fixedOperator: 'contains'`류를 쓰는 17개 호출부가 지금까지
  raw camelCase(`contains`)를 그대로 보여주고 있었다. 나머지 21개 로케일은
  `fallbackLng: 'en'`로 폴백.
- `comp:BAIPropertyFilter.operator.*` — **신규 서브트리** (DSL 연산자):
  `Contains`(`ilike`/`like`), `Equals`(`==`), `NotEquals`(`!=`),
  `GreaterThan`/`GreaterThanOrEqual`/`LessThan`/`LessThanOrEqual`, `In`.
  기존 `comp:BAIPropertyFilter` 네임스페이스 안이라 신규 네임스페이스 없음.
- `comp:BAIPropertyFilter.PlaceHolder` (기존 재사용, PowerSearch placeholder),
  신규 `comp:BAIPropertyFilter.SearchLabel`(접근성 label),
  `comp:BAIPropertyFilter.Apply`(popover 확인 버튼).
- `resultCount`는 호출부가 **문자열**로 넘긴다 — Astryx의 "N results" 대신
  host의 i18next 복수형이 이긴다.

**우리가 소유하지 않는 것 (Astryx `InternationalizationProvider` 카탈로그,
현재 영어):** typeahead 빈 결과 문구, 토큰 remove 버튼 aria, clear-all 버튼,
date/relative-date 편집기 라벨, operator 메뉴 aria. 이건 prop이 아니라 카탈로그
등록이 필요하다 — **P13(이중 i18n 구조 정리, spec Phase 3)로 이관**. 필요해지면
`PowerSearchOperator`의 `i18nKey` variant가 문서화된 경로다.

**호스트(react) 쪽 정리:** ticket 16이 두 VFolder 페이지에 넣었던
`operatorLabels={{ contains: t('propertyFilter.Contains', 'contains'), … }}`
패치를 제거했다. `resources/i18n/*.json`에 존재하지 않는 키였고(항상 default로
폴백), 이제 BUI 카탈로그가 소유한다. 신규 host i18n 키 0개.

`comp:BAIPropertyFilter.ResetFilter`는 이제 미사용(PowerSearch `hasClear`)이나
22개 로케일 파일 churn을 피해 키는 남겨 뒀다.

### PILOT-DECISIONs / drops

1. **`rule.validate`가 게이트에서 자문으로.** antd는 키 입력 시점에 값을
   거절할 수 있었지만 PowerSearch가 자기 editor를 소유해 가로챌 이음매가 없다.
   위반 토큰은 컨트롤의 `status={{type:'error', message}}`로 보고한다 —
   피드백은 유지, 차단은 드롭. (`AdminModelCard`, `ProjectPage` 2곳)
2. **`renderInput` 컨트롤이 commit-on-select → stage-then-Apply.** antd는
   컨트롤이 값을 내는 즉시 조건을 커밋했다. PowerSearch는 popover의 Apply가
   커밋을 소유하므로 클릭 1회가 늘었다. 대안은 popover 재구현이라 단순성 정책
   위반. 기능(Relay 기반 picker + opaque UUID의 label 표시)은 전부 보존 —
   `CustomOperatorValue`의 `Editor`/`getString`로 매핑.
3. **`renderInput` Editor는 property key별로 캐시**하고 최신 클로저는 ref로
   라우팅한다. 호출부가 `renderInput`을 인라인으로 선언하므로 매 렌더 새
   component identity가 나오면 Relay select가 keystroke마다 remount된다.
   컨트롤의 antd Select dropdown이 body portal이라 popover의 outside-click
   해제와 충돌할 수 있어 editor 래퍼에서 pointer/mouse down을 stopPropagation
   한다.
4. **per-property `placeholder` 드롭** (`BAIGraphQLPropertyFilter`).
   PowerSearch에는 토큰이 없을 때 보이는 컨트롤 단위 placeholder 하나뿐이라
   놓을 자리가 없다. 컨트롤 단위 `placeholder` prop은 유지. (`ScopedAuditLog`
   1곳)
5. **`datetime` 왕복은 초 정밀도.** PowerSearch는 절대 날짜를 `unixSeconds`로
   보관하고 antd `DatePicker`는 ISO 문자열을 냈다. 손으로 쓴 링크의 밀리초
   성분은 첫 편집에서 사라진다. 피커가 밀리초를 만든 적은 없다.
6. **"reset filters" 버튼 + Tooltip 드롭** — PowerSearch의 `hasClear` 기본
   제공. `ResetFilter` i18n 키는 미사용으로 남는다.
7. **operator "짧은 기호" 라벨(`⊃`, `≠`, `^`, `∈` …) 드롭.** antd 태그가
   좁아서 쓰던 축약인데, PowerSearch 토큰은 전체 operator 라벨을 담는다.
   번역된 전체 라벨(`contains`, `is not`)만 남는다.
8. **비-strict `options`는 suggestion으로 유지.** `options`만 있고
   `strictSelection`이 없는 property는 `{type:'string', searchSource,
   isArbitraryStringAllowed:true}`로 매핑 — antd `AutoComplete`의 "제안은
   주되 자유 입력 허용"과 동치. 매칭은 antd와 같이 **label** 기준.
9. **`contentSearchFieldKey` 기본값 = 첫 free-text property.** antd 필터는
   property `Select`가 첫 항목에서 시작했으므로 "타이핑 후 Enter"가 곧 첫
   property 조건이었다. 이 기본값이 그 흐름을 13/33개 호출부에서 그대로
   재현한다 (VFolder 페이지들은 기존대로 `"name"` 명시).
10. **`FilterProperty.options` 타입이 antd `AutoCompleteProps['options']`
    에서 로컬 `FilterPropertyOption`으로.** 필터가 자기 props를 기술하려고
    antd 타입을 import하던 마지막 이유가 사라졌다. 구조적 부분집합이라
    호출부는 무변경.

### 잔여 antd (이 티켓 범위 밖)

두 필터 파일과 어댑터에 **antd import 0**. `dayjs`는 datetime 값 변환에 남는다
(spec §1 — 별도 트랙). 스토리 파일 2개는 `antd Select`를 `renderInput` 데모로
쓰고 있어 남겨 뒀다 — Storybook 재작성은 ticket 32. 스토리 상단 설명에는 엔진
교체와 3가지 동작 변경을 명시했다.

### E2E 핸드오프 (ticket 31)

antd 필터 UI를 직접 조작하는 스펙이 3파일 남아 있다 —
`e2e/environment/environment.spec.ts`, `e2e/environment/registry.spec.ts`,
`e2e/project/project-crud.spec.ts` (`[aria-label="Filter property selector"]`,
`[aria-label="Filter value search"]`). PowerSearch의 상호작용 모델(단일
typeahead → field 선택 → operator/value popover → Apply)로 다시 써야 하고,
검증에 실클러스터가 필요하므로 ticket 31로 넘긴다. 다만
`e2e/visual_regression/environments/environments_page.test.ts`의 `beforeEach`
대기 셀렉터는 파일 전체를 죽이므로 여기서 고쳤다
(`getByRole('combobox', { name: 'Search filters' })` — 실측한 접근성 이름).

### 검증

- `bash scripts/verify.sh` → `=== ALL PASS ===`
  (Relay / Lint / Format / TypeScript / warmup / StyleX / theme / Terminology)
- `pnpm exec vitest run` (BUI, 두 필터 파일) → **87 passed**
- react `tsc --noEmit` 및 BUI `tsc --noEmit` 모두 **호출부 무수정 통과**
