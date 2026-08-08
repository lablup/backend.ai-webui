# 30 — BUI 계약 재정의 + i18n 정리 + @lobehub 자체 구현

**Target:** to-astryx
**Blocked by:** 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29
**Status:** done

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** BUI peerDependencies에서 antd 계열 제거, @astryxdesign/core+테마 계약 추가, CSS export 신설, sideEffects 수정, 소비자 @layer 요구 문서화. BUI 이중 i18n(P13) 정리. @lobehub/icons(3)+fluent-emoji(1) 사용 표면 자체 구현 후 패키지 제거.

## Acceptance criteria

- [x] BUI가 antd 없는 peer 계약으로 빌드·소비됨 — antd 3종은 `peerDependenciesMeta.optional`,
      Astryx 2종은 필수 peer. 설치·런타임 기준 antd-free (타입 잔재는 아래 결정 4 참조).
- [x] @lobehub 패키지 제거 후 rc-* 비-antd 경로 소멸 — lockfile rc-* 11개 → 1개
      (`rc-util`, 유일 경로 `@ant-design/cssinjs@1.24.0` = antd 경로).
- [x] verify.sh ALL PASS

## Implementation notes

### 1. BUI peer 계약

`packages/backend.ai-ui/package.json`:

- **필수 peer 추가**: `@astryxdesign/core` `0.3.0`, `@astryxdesign/theme-neutral` `0.3.0`.
  둘 다 devDependency로도 유지한다 — vite가 `rollupOptions.external`을 `peerDependencies`
  키에서 파생하므로 peer로 올라간 시점에 external이 되고, devDep는 BUI 자체
  build/vitest/Storybook 해석용으로만 쓰인다. **티켓 25가 남긴 context-duplication
  플래그는 이걸로 닫힌다**: 이전에는 devDep-only여서 external 목록에 없었고
  `dist/backend.ai-ui.js`가 Astryx 사본을 인라인으로 안고 있었다(= StyleX 레지스트리
  2개, React context 2개). 빌드 후 확인: dist에 `@astryxdesign/core/*` 22개가 bare
  specifier로 남아 있고 인라인된 구현은 없다.
- **antd 3종(`antd`, `@ant-design/icons`, `antd-style`)은 optional peer로 강등**.
  `@stylexjs/stylex`는 BUI가 직접 import하지 않으므로 계약에 넣지 않았다(Astryx core의
  peer라 소비자 쪽에서 이미 강제된다).
- `sideEffects: false` → `["**/*.css"]`.
- `exports`에 `"./styles.css": "./dist/backend.ai-ui.css"` 신설.

### 2. CSS export + @layer 계약

- 신설 `packages/backend.ai-ui/src/styles/backend.ai-ui.css` — 전부 `@layer components`.
  현재 내용은 `.anticon*` baseline + spin. 이 규칙들은 그동안 (a) 호스트의
  `fix_antd.css`(선언되지 않은 소비자 의존)와 (b) `iconShim.tsx`가 첫 `<Icon>` 렌더에서
  `document.head`에 꽂던 `<style>` 요소에 나뉘어 있었다. (b)는 `<LoaderCircle
  className="anticon-spin">`처럼 `Icon`을 거치지 않는 4개 BUI 컴포넌트에 대해 **애초에
  발화하지 않았다**. 런타임 주입은 제거하고 스타일시트로 통일.
- `src/index.ts`가 이 CSS를 첫 문장으로 import한다 → 호스트(`backend.ai-ui` → src alias)는
  자동 적용. dist 소비자는 `import 'backend.ai-ui/styles.css'`.
- **@layer 순서문을 BUI 스타일시트에도 넣었다.** 처음엔 `react/src/index.css`의 순서문만
  믿었는데, 빌드 산출물을 열어 보니 BUI CSS가 **byte 0**에 오고 순서문은 16829에 있었다
  — layer 우선순위는 *첫 등장* 순이고 이후 `@layer` 문은 미등장 이름을 덧붙일 뿐 재정렬이
  불가하므로, `components`가 `astryx-base`보다 **앞**(=낮은 우선순위)에 등록되어 계약이
  뒤집혀 있었다. 두 파일에 동일한 목록을 두고 서로 KEEP-IN-SYNC 주석을 달았다
  (동일하면 멱등, 다르면 먼저 로드된 쪽이 조용히 이긴다). 재빌드 후 순서문 offset 0 확인.
- `vite.config.ts`의 locale entry glob을 `src/locale/*.ts` → `src/locale/*_*.ts`로 좁혔다.
  `astryxOverrides.ts`가 `dist/locale/`에 배포 entry로 새어 나갔기 때문(그 디렉터리가 곧
  `./dist/locale/*` 공개 export다).

### 3. P13 — 이중(사실은 삼중) i18n

문제는 "카탈로그가 둘"이 아니라 **런타임이 셋인데 하나가 미배선**이었다: 호스트 i18next,
BUI i18next(FR-2986, 유지), 그리고 아무도 설정하지 않은 Astryx resolver. 세 번째는 단순히
번역이 안 되는 문제가 아니다 — provider가 없으면 context 기본값 `{locale:'en'}`이 그대로
`IntlMessageFormat`에 들어가므로, **한국어 세션에서도 Astryx 컴포넌트의 복수형·숫자·날짜가
영어 로케일로 포맷**되고 있었다.

- `BAIConfigProvider`가 이미 언어 변경이 착지하는 유일한 지점이므로(`buiI18n.changeLanguage`
  + `dayjs.locale`), 같은 effect가 Astryx `InternationalizationProvider`의 `locale`/`dir`도
  구동하게 했다. 네 번째 카탈로그는 만들지 않았다.
- 신설 `src/locale/astryxOverrides.ts` — BUI 로케일 JSON의 예약 키 `astryx` 서브트리를
  Astryx `Overrides` 형태로 들어 올린다. 즉 Astryx chrome 문자열을 번역하고 싶으면
  `src/locale/ko.json`의 `astryx["@astryx.pagination.next"]` 한 줄이면 되고, 없는 키는
  Astryx 영문으로 폴백한다(= 기존 동작).
  **티켓 28이 여기로 미룬 PowerSearch/Typeahead chrome 번역 경로가 이걸로 열렸다.**
- 서브트리는 **비운 채로 두었다**(신규 i18n 키 0개, 22개 로케일 파일 churn 0). Astryx en
  카탈로그는 250키이고 부분 번역은 한 위젯 안에서 한/영이 섞이는 결과가 되므로 §0 단순성
  정책에 따라 드롭. 채널만 만들고 문서화했다(README `How many i18n runtimes are there?`).
- 곁다리: `src/locale/index.ts`의 `import { Locale } from 'antd/es/locale'`를 `import type`
  으로 바꿨다. 이 배럴은 antd-import-graph 게이트 기준 **최대 taint hub(665 파일)**이고,
  optional peer가 된 antd에 대해 런타임 import를 방출하면 안 된다.

### 4. 결정 — 남은 antd 표면을 어떻게 다룰 것인가

측정: BUI src에서 `from 'antd'` 128파일, `from 'antd/...'` 46, `antd-style` 13.
"소스가 antd-free"는 이 티켓 범위가 아니다. 검토한 3안 중:

- **(기각) 레거시 entrypoint 분리** — `BAITableProps`/컬럼 헬퍼가 Astryx 후계자와 같은
  모듈에 있고 남은 호출부 전부가 양쪽을 함께 import한다. 마이그레이션 도중에 이걸 쪼개면
  이음매가 하나 더 생긴다.
- **(기각) peer에서 완전 제거** — 실재하는 런타임 요구가 보이지 않게 된다.
- **(채택) optional peer** — "이 패키지의 일부는 antd가 필요하고 대부분은 아니다"의 정직한
  서술. Astryx-native 표면(BAITableAstryx / BAIComplexSelect / BAIPropertyFilter /
  `*SelectAstryx` / theme-shim / app-shim / iconShim)만 쓰는 소비자는 antd 없이 설치·실행되고
  pnpm peer 경고도 안 난다.

**정직한 단서**: 이건 설치/런타임 보장이지 타입 보장이 아니다. `dist/index.d.ts`는 전체
표면을 재수출하고 레거시 래퍼가 여전히 antd 타입으로 자기를 서술하므로(`BAICardProps
extends Omit<CardProps,'extra'>`) 배럴 대상 `tsc`는 antd 선언을 요구한다. README에 그대로 적었다.

### 5. @lobehub 제거

- **`@lobehub/icons`**: peerDependency로 `@lobehub/ui`를 선언한다 → auto-install-peers가
  LobeHub 컴포넌트 라이브러리 전체를 트리에 끌어왔고, 그게 **마지막 비-antd rc-\* 경로**
  (`rc-collapse`, `rc-footer`, `rc-image`, `rc-input-number`, `rc-menu`)의 출처였다.
  실제 사용은 브랜드 글리프 36개뿐(MIT).
  → 일회성 추출기로 각 아이콘을 `react-dom/server`로 정적 렌더 → `react/src/components/
  brandIcons/generated/*.ts` 36개로 vendoring. gradient id는 `useId` 값이 섞여 나오므로
  추출 시점에 `bai-brand-<brand>-<variant>-<n>`로 안정화.
  런타임은 `createBrandIcon.tsx` 하나(`dangerouslySetInnerHTML`로 빌드타임 정적 문자열 주입 —
  다중 path + `<linearGradient>` defs를 손으로 JSX화하면 36번의 훼손 기회가 생긴다).
  소비 3파일(`ModelBrandIcon` / `AuthorIcon` / `helper/modelBrandIcons`)은 **동적 import
  loader 구조를 그대로 유지** → 페이지가 실제로 그리는 브랜드만 청크로 내려간다
  (react build 산출물에 브랜드별 청크 36개 확인). `IconType` → 로컬 `BrandIconType`.
- **`@lobehub/fluent-emoji`**: 쓰던 표면은 `getFluentEmojiCDN`의 커스텀 URL 템플릿 분기
  하나뿐(우리 CDN은 `/resources/fluentemoji/...`). 코드포인트 → 파일명 매핑 포함 ~15줄로
  자체 구현하고 `FluentEmojiIcon.tsx`에 흡수. 이 패키지 때문에 유지하던
  `react/patches/lobehub__fluent-emoji@2.0.0.patch`와 `no-restricted-imports` 규칙, 그리고
  `pnpm-workspace.yaml`의 `uuid@^13` 주석에 있던 `@lobehub/ui` 언급도 정리.
- 결과: 설치 패키지 **-142개**.

### 6. astryxFormControls 통합 (티켓 19부터 플래그)

두 사본(`components/astryxFormControls.tsx` 10개 호출부 / `components/astryx-bui/
astryxFormControls.tsx` 30개 호출부)이 **같은 7개 이름을 서로 다른 prop 표면**으로
export하고 있었다(`allowClear` vs `hasClear`, `number|string|null` vs `number|null`,
한쪽만 `startIcon`/`onValueChange`, 다른 쪽만 `width`/`onBlur`/`data-testid`).

- `components/astryxFormControls.tsx`를 **유일 구현**으로 삼고 두 표면의 **합집합**을 담았다.
  `astryx-bui/astryxFormControls.tsx`는 순수 re-export shim(30개 호출부 무변경).
  호출부 코드 변경 0줄로 tsc 통과.
- 합집합에서 유일한 **동작 통일**: `AstryxFormNumberInput`의 `hasClear` 기본값 `true`.
  ticket-18 변형(호출부 30개)이 이미 항상 켜고 있었고, 이게 antd `InputNumber`의 nullable
  모델(비우면 `null`)을 주는 오버로드다. 파일럿 변형 호출부 3곳이 clear 어피던스를 얻는다.
  끄려면 `hasClear={false}`.
- `AstryxFormSelector`는 두 옵션 타입을 `AstryxFormSelectorOption | SelectorOptionType`
  합집합으로 받고, `hasClear` 분기(파일럿)와 `hasSearch`/`isLoading`(티켓 18)을 모두 유지.

### 7. BAITable 플립 — 하지 않음 (per-consumer 근거)

레거시 `BAITable` 잔여 소비자 13곳 + stories. 기능 사용은 가볍다:

| 소비자 | 쓰는 기능 |
|---|---|
| BAIImportArtifactModal / BAIDeleteArtifactRevisionsModal / BAIAllowedVfolderHostsWithPermission / SessionLauncherPreview | pagination만 |
| BAIArtifactRevisionTable / BAIArtifactTable / BAIProjectTable | `scroll`, `BAITableProps` |
| BAIAgentTable | `scroll`, `onCell`, `BAITableProps` |
| BAIFileExplorer | `rowSelection`, `onRow`, `scroll`, `BAITableProps` |
| BAIBulkErrorModal / InviteFolderSettingModal | `scroll`, pagination |
| ChatPage | `onRow`, `showHeader` |
| ReservoirAuditLogList | `expandable`, `scroll` |

`scroll`은 8곳 전부 `{x:'max-content'}`라 BAITableAstryx가 드롭한 `scroll.y`에 걸리는 곳은
없다. 그럼에도 플립하지 않은 이유는 **구조적 블로커 2개**:

1. `BAITableProps`가 5개 BUI 컴포넌트의 **공개 prop 인터페이스**에 박혀 있다. 플립은
   `BAIAstryxTableProps`로의 공개 타입 변경이고, 그 컴포넌트들의 소비자로 파급된다.
2. **레거시 `BAITable.tsx`는 어차피 지울 수 없다.** `BAITableAstryx` 자신이
   `isColumnVisible`을 거기서 import하고, 공유 타입(`BAITableProps`, `BAIColumnsType`,
   `BAIExportSettings` …)과 `getVisibleColumns`/`restoreColumnToDefault` 헬퍼가 그 모듈에
   산다. 게다가 `BAITableAstryx`가 쓰는 `BAITableColumnCSVExportModal`이 아직 antd다 —
   전부 플립해도 antd 도달은 남는다.

→ "one-line import swap"이라는 이음매 설계는 유효하지만, **레거시 삭제로 이어지지 않는
13파일 churn**은 §0 단순성 정책에 반한다. 티켓 35(또는 CSV export modal의 Astryx 이관을
선행하는 티켓)로 넘긴다. `BAITable`의 `.ant-*` 3건도 그때 같이 사라진다.

### 8. 부수 정리 — react 테스트 스위트 0 실패

브리핑상 "선재 실패 ~11건"이었고 둘 다 실제로 고쳤다:

- **StyleX(10개 파일)**: `react/vitest.config.ts`에 `@stylexjs/unplugin/vite`가 없어서
  `xstyle`을 쓰는 컴포넌트를 **import만 해도** "Unexpected 'stylex.create' call at runtime"
  으로 죽었다. 앱 빌드와 같은 플러그인을 vitest 파이프라인에도 붙였다
  (`cssInjectionTarget`은 불필요 — vitest는 모든 CSS specifier를 `rawCss.mock.js`로 alias).
- **usePrimaryColors(5 assertion)**: 훅은 티켓 10에서 `theme-shim`으로 옮겨 갔는데 테스트는
  여전히 antd `<ConfigProvider theme={{token}}>`로 주입을 시도하고 있었다(= 아무 효과 없음,
  shim의 fallback 시드를 antd 옛 기본값과 비교하며 실패). wrapper를 `ThemeShimProvider`
  `seeds`로 교체. `seeds` 리터럴은 모듈 상수로 hoist — 인라인이면 매 렌더 새 identity라
  memoization 테스트가 자기 자신 때문에 깨진다.

결과: **61 files / 1106 tests 전부 통과**. BUI vitest도 22 passed / 1 skipped.

### 검증

- `bash scripts/verify.sh` → `=== ALL PASS ===`
- `pnpm --filter backend.ai-ui build` (dist CSS emit + Astryx external 확인)
- `pnpm --filter backend.ai-ui test` → 441 passed / 1 skipped
- `pnpm run build:react-only` → 성공, 브랜드 아이콘 청크 36개, `@layer` 순서문 offset 0
- `react`: `pnpm run test` → 61 files / 1106 tests 통과
- 마이그레이션 게이트: `antd-import-graph` / `ant-selector-gate` / `astryx-token-gate`
  모두 실행, 신규 위반 0 (token gate exit 0).
