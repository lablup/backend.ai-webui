# 0019 — Ant Design removal and its replacements

## Summary

> 낯선 용어는 문서 맨 아래 [용어](#용어)에 모아 두었다.

- **Removed packages**: `antd`, `antd-style`, `@ant-design/icons`, `ahooks`, `@lobehub/*` 패키지는 `react/`와 `packages/backend.ai-ui/`(BUI)의 직접 dependency도, 간접 dependency도 아니다. `pnpm-lock.yaml`은 이 중 어느 것도 resolve하지 않으므로, 이 패키지를 import하면 `tsc`와 Vite에서 module resolution이 실패한다.
- **One component system**: component system은 [ADR 0009](0009-ui-common-as-the-single-entry-point-to-astryx.ko.md)가 정한 대로 `@lablup/ui-common`을 거쳐 쓰는 Astryx 하나다.
- **Replacements**: 삭제한 패키지마다 저장소 안에 대체물이 하나씩 있다. 아이콘은 `lucide-react`와 BUI의 `BAI*Icon` 파일, `ahooks` hook은 BUI 자체 hook, `App.useApp()`은 BUI의 [app-shim](#용어), `antd-style`은 같은 위치에 둔 `.css` 파일, `@lobehub/*`는 저장소에 복사해 둔 brand 아이콘이 대신한다.
- **No antd emulation**: 대체물은 call site 수정을 줄일 수 있는 곳에서 antd의 call shape를 유지하지만, antd engine의 동작은 재현하지 않는다. `BAITable`은 column의 `render`에 `(value, record, index)`를 넘기고, `dataIndex`가 없는 column에는 [rc-table](#용어)이 넘기던 record가 아니라 `value === undefined`를 넘긴다. `BAITable.cellValue.test.tsx`가 이 동작을 고정한다.
- **E2E locators**: 새로 쓰거나 고친 e2e test는 `.ant-*` locator를 추가하지 않는다. 앱의 어떤 요소도 `ant-` class를 그리지 않기 때문이다.

## Context

- **What is left of antd**: antd 시절 코드에는 antd 모양의 call site가 아직 남아 있다. `App.useApp().modal.confirm({ … })`, 직접 만든 아이콘의 `Icon` component frame, `ahooks` hook 이름, `BAI*` wrapper의 [frozen antd-v6 prop](0017-single-select-for-client-held-option-lists.ko.md#용어) 이름, `className`과 inline `style` 사용이 그것이다. 이 중 어느 것도 더는 antd를 import하지 않는다.
- **Why a decision is needed**: antd 모양의 call site를 본 기여자는 그것을 antd나 그 계열 패키지를 다시 추가하라는 신호로, 또는 대체물을 antd에 더 가깝게 동작하게 하라는 신호로 읽을 수 있다. 이 기록은 삭제한 패키지마다 어떤 대체물이 있는지와 antd 동작을 어디까지 따르는지를 정한다.

## 설계도

```mermaid
flowchart LR
  subgraph removed["설치되지 않음"]
    antd["antd"]
    icons["@ant-design/icons"]
    style["antd-style"]
    ahooks["ahooks"]
    lobe["@lobehub/icons와 @lobehub/fluent-emoji"]
  end
  subgraph bui["packages/backend.ai-ui/src"]
    appshim["app-shim/<br/>App, message, modal, BAIAppProvider"]
    iconshim["icons/iconShim.tsx와 BAI*Icon 파일"]
    hooks["hooks/<br/>useToggle, useControllableValue, ..."]
    table["components/Table/BAITable.tsx"]
    buicss["styles/backend.ai-ui.css"]
  end
  subgraph host["react/src"]
    hostshim["app-shim/index.tsx"]
    brand["components/brandIcons/"]
    emoji["components/FluentEmojiIcon.tsx"]
    cocss["같은 위치에 둔 .css 파일"]
  end
  lucide["lucide-react"]
  uic["@lablup/ui-common, ADR 0009"]
  antd -- "App.useApp call shape" --> appshim
  antd -- "Table column render" --> table
  icons -- "glyph 이름" --> lucide
  icons -- "Icon frame과 CustomIconComponentProps" --> iconshim
  style -- "createStyles 블록" --> cocss
  icons -- "아이콘 baseline과 spin keyframes" --> buicss
  ahooks -- "hook 12개, 같은 이름" --> hooks
  lobe -- "brand glyph 36개" --> brand
  lobe -- "CDN URL 템플릿" --> emoji
  appshim -- "backend.ai-ui에서 re-export" --> hostshim
  appshim -- "Modal과 Toast를 그림" --> uic
  table -- "DataGrid를 그림" --> uic
```

## Decision

### 1. 삭제한 패키지는 다시 들이지 않는다

| 삭제한 패키지           | 대체물                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| `antd` components       | `@lablup/ui-common`을 거친 Astryx(ADR 0009)와 `backend.ai-ui`의 `BAI*` wrapper                 |
| `antd` `App.useApp()`   | app-shim, 4절                                                                                  |
| `@ant-design/icons`     | `lucide-react`와 `BAI*Icon` 파일, 2절                                                          |
| `antd-style`            | 같은 위치에 둔 `.css` 파일, 5절                                                                |
| `ahooks`                | `packages/backend.ai-ui/src/hooks/`의 hook, 3절                                                |
| `@lobehub/icons`        | `react/src/components/brandIcons/`(`createBrandIcon.tsx`와 `generated/` 아래 정적 module 36개) |
| `@lobehub/fluent-emoji` | `/resources/fluentemoji/...` URL을 스스로 만드는 `react/src/components/FluentEmojiIcon.tsx`    |

- **Guard**: 막는 장치는 dependency graph 자체다. `pnpm-lock.yaml`에는 이 패키지도, `rc-*` 패키지도 없으므로 import는 `tsc`, Vite, Vitest에서 resolve되지 않는다. ESLint rule은 막는 장치가 아니다. Consequences에 적은 남은 항목 두 개는 project-agnostic 페이지만 다룬다.
- **New need**: 기능에 삭제한 패키지가 주던 무언가가 필요하면, 기여자는 그것을 Astryx 위에 만들고 `.claude/rules/bui-component-home.md`가 정한 곳에 둔다. 제품 중립 component는 ui-common에, Backend.AI에 의존하는 component는 BUI에 둔다.

### 2. 아이콘

- **Icon set**: `lucide-react`는 `react/`와 BUI 둘 다의 아이콘 세트다. `pnpm-workspace.yaml`의 catalog가 이것을 `^1.37.0`으로 고정한다. 이 범위는 major 하나이고 `@astryxdesign/theme-neutral`이 의존하는 버전이므로, 설치되는 사본은 하나다.
- **Own glyphs**: lucide에 없는 Backend.AI glyph는 SVG 하나와 `packages/backend.ai-ui/src/icons/`의 `BAI*Icon` component 하나로 만든다. 이 component는 SVG를 `./X.svg?react`로 import하고, `Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'>` props를 받고, `<Icon component={logo} aria-label={…} />`를 그리고, `icons/index.ts`에서 export된다. 예시는 `BAIGitHubIcon.tsx`다. lucide 1.x에는 brand 아이콘이 없으므로 GitHub와 GitLab brand glyph는 `BAIGitHubIcon`과 `BAIGitLabIcon`이다.
- **Icon frame**: `icons/iconShim.tsx`는 `Icon`을 default export한다. `Icon`은 `1em` 크기에 `fill: currentColor`인 SVG를 `<span role="img" class="bai-icon">`으로 감싸 그리고, `spin`과 `rotate`를 지원한다. 이 파일의 `CustomIconComponentProps`, `IconBaseProps`, `IconComponentProps` type은 `@ant-design/icons`의 선언을 복사한 것이므로, 이 type으로 쓴 `BAI*Icon` props interface는 고치지 않아도 컴파일된다.
- **Class name**: frame은 `anticon`이 아니라 `bai-icon`과 `bai-icon-spin`을 쓴다. 그래서 bundle에 `anticon` class 문자열이 있으면 `@ant-design/icons`가 다시 들어왔다는 뜻이다.
- **Inline size**: antd 아이콘을 대신하는 inline lucide glyph는 `size="1em"`을 받는다. antd 아이콘은 `1em`이었고 lucide의 기본값은 24px이기 때문이다.

### 3. 유틸리티 hook

- **Ported hooks**: 저장소가 쓰던 `ahooks` hook 12개는 `packages/backend.ai-ui/src/hooks/`에 `BAI` 접두어 없이 `ahooks` 이름 그대로 있다. `useControllableValue`, `useToggle`, `useSessionStorageState`, `useLocalStorageState`, `useUpdateEffect`, `useNetwork`, `useDebounce`, `useDebounceFn`, `useThrottleFn`, `usePrevious`, `useHover`, `useEventListener`다. `hooks/index.ts`가 이것을 export하고, `react/`는 `backend.ai-ui`에서 import한다.
- **No new dependency**: 옮긴 hook은 React와 `lodash-es`만 쓴다. `useDebounceFn`과 `useThrottleFn`은 시간 처리를 `lodash-es`의 `debounce`와 `throttle`에 맡긴다.
- **Home of a new hook**: 새 범용 hook은 새 npm 패키지가 아니라 `packages/backend.ai-ui/src/hooks/`에 둔다.
- **Stable callbacks**: `hooks/internal/useLatest.ts`는 옮긴 hook이 쓰는 `useLatest`와 `useLatestCallback`을 담고, `backend.ai-ui`는 이 둘을 export하지 않는다. effect 안에서 최신 값이 필요한 애플리케이션 코드는 `.claude/rules/use-effect-event.md`대로 `useEffectEvent`를 쓴다.

### 4. 명령형 피드백

- **Call shape**: `App.useApp()`, `useApp()`, `message`, `modal.confirm` / `modal.error` / `modal.info` / `modal.warning` / `modal.success`는 antd의 call shape와 반환값을 유지한다. 이것들은 ui-common을 거쳐 Astryx component를 그리는 `packages/backend.ai-ui/src/app-shim/`에서 온다.
- **Import path**: `backend.ai-ui`가 app-shim을 export한다. `react/src/app-shim/index.tsx`가 그것을 re-export하고, `react/src`의 파일은 그 디렉터리(`../app-shim`)에서 import한다. `react/src/components/DefaultProviders.tsx`에 mount된 `BAIAppProvider`가 toast와 modal을 띄운다.
- **Tier rule**: 어떤 action이 어떤 확인 방식을 쓰는지는 `.claude/rules/destructive-confirmation.md`가 정한다. 클릭 한 번으로 끝나는 `modal.confirm`은 되돌릴 수 있는 action에만 쓴다.

### 5. runtime style engine 없는 스타일링

- **No style engine**: 코드는 runtime CSS-in-JS engine을 쓰지 않는다. `createStyles`도, `antd-style`도, emotion도 없다. component props와 `xstyle`로 표현할 수 없는 스타일은 component가 import하는, 같은 위치에 둔 `.css` 파일에 넣는다.
- **Tokens**: 그런 `.css` 파일은 선언된 Astryx `var(--…)` token을 쓴다. `scripts/migration-gates/astryx-token-gate.mjs`가 선언되지 않은 token을 나열하고, `CLAUDE.md`가 정한 기준은 새 finding이 없는 것이다.
- **No style element**: `react/eslint.config.js`는 `no-restricted-syntax`로 JSX `<style>` 요소를 거부한다. 엄격한 CSP `style-src 'nonce-...'`가 그 요소를 버리기 때문이다. runtime에 바뀌는 값은 CSS custom property로 넘긴다.
- **BUI stylesheet**: BUI는 `src/styles/backend.ai-ui.css`를 함께 배포한다. `src/index.ts`가 이 파일을 첫 layer stylesheet로 import하고, 패키지는 이것을 `backend.ai-ui/styles.css`로 export한다. bundler가 이 파일을 버리지 않도록 `package.json`은 `sideEffects`에 `"**/*.css"`를 둔다.
- **Layer order**: 이 stylesheet는 `react/src/index.css`와 같은 `@layer` 순서 선언으로 시작하고, 자기 rule을 `@layer components`에 둔다. `scripts/verify.sh`가 실행하는 `scripts/migration-gates/layer-order-gate.mjs`는 두 사본이 다르면 실패한다.

### 6. `BAITable` cell 값 계약

- **Render arguments**: `BAITable` column의 `render`는 `tableTypes.ts`가 선언한 대로 `(value, record, index)`를 받는다. `value`는 column의 `dataIndex`에 있는 값이다.
- **No `dataIndex`**: `dataIndex`가 없는 column은 `value === undefined`를 받는다. 계산 column은 두 번째 인자에서 row를 읽는다: `render: (_value, row) => …`.
- **No quirk emulation**: rc-table은 빈 경로에 record 전체를 돌려주므로, antd에서는 `render: (row) => …`가 동작했다. `Table/dataGridColumns.tsx`의 `readDataIndex`는 `dataIndex`가 없으면 `undefined`를 돌려주고 그 동작을 재현하지 않는다. `packages/backend.ai-ui/src/components/Table/BAITable.cellValue.test.tsx`가 양쪽 방향을 모두 고정하므로, 그 emulation을 되살리는 변경은 이 test에서 실패한다.

### 7. E2E locator

- **No `.ant-*` locator**: `e2e/` 아래에 새로 쓰거나 고친 spec이나 page object는 `.ant-*` locator를 추가하지 않는다. 그런 locator는 요소를 하나도 찾지 못하고, timeout이 다 지난 뒤에야 실패한다.
- **Fix on touch**: `.ant-*` locator가 있는 파일을 고치는 변경은 같은 변경에서 그 locator를 바꾼다. `git grep -n '\.ant-' -- e2e`가 남은 locator를 나열한다. 2026-11-03 기준으로 41개 파일에 남아 있다.
- **Preferred locators**: locator는 `.github/instructions/e2e.instructions.md`가 정한 순서대로 role과 accessible name을 먼저 쓰고, 다음으로 label 조회, 그다음 `data-testid`를 쓴다.

### 8. antd 모양 props는 남긴다

- **Frozen vocabulary**: `BAI*` wrapper는 [frozen antd-v6 prop](0017-single-select-for-client-held-option-lists.ko.md#용어) 이름(`BAIAlert`의 `title`, `okButtonProps`, `allowClear`, …)을 유지한다. call site도 이 이름을 그대로 쓴다. `.claude/rules/component-props-extension.md`가 이 어휘와, wrapper가 그것을 확장하는 방법을 정의한다.

## 대안과 기각 사유

- **Emulate rc-table in `BAITable`**: `BAITable`이 rc-table처럼 `dataIndex`가 없는 column에 record를 돌려줄 수 있다. `render: (row) => …` call site를 고치지 않아도 된다는 것이 장점이다. 기각한 이유는 그러면 `render` type이 첫 인자를 잘못 기술하게 되고, 이후 `BAITable`을 읽는 모든 사람이 `render`가 무엇을 받는지 알려면 rc-table을 알아야 하기 때문이다.
- **antd as an optional peer of BUI**: wrapper가 아직 antd를 쓰는 동안 BUI가 `antd`, `@ant-design/icons`, `antd-style`을 optional peer로 둘 수 있다. 단계적으로 없앨 수 있다는 것이 장점이다. 기각한 이유는 BUI가 배포하는 `.d.ts`가 각 wrapper를 그것이 감싼 대상의 type으로 기술하므로, antd type을 쓰는 wrapper가 하나라도 있으면 consumer가 barrel을 기준으로 type check하려면 antd를 설치해야 하기 때문이다.
- **Keep `ahooks`**: 저장소가 쓰는 hook을 위해 dependency를 유지할 수 있다. 옮긴 코드를 유지보수할 필요가 없다는 것이 장점이다. 기각한 이유는 쓰는 hook 12개가 새 dependency 없이 React와 `lodash-es`만으로 BUI 안에 들어가기 때문이다.
- **Keep `@lobehub/icons`**: brand glyph 36개를 위해 패키지를 유지할 수 있다. 새 brand glyph를 손으로 복사하지 않고 패키지 업데이트로 받는다는 것이 장점이다. 기각한 이유는 이 패키지의 `@lobehub/ui` peer가 component library 하나와 마지막 `rc-*` 패키지들을 설치에 끌어들였기 때문이다.
- **Keep the `anticon` class**: icon frame이 예전 CSS와 selector를 위해 antd의 class 이름을 유지할 수 있다. 기각한 이유는 그 class가 진짜 `@ant-design/icons` 출력을 알아보는 표지인데, 자체 코드에 그 class를 남기면 antd가 다시 들어와도 드러나지 않기 때문이다.

## Consequences

- **Loud failure**: 패키지가 설치되어 있지 않으므로 antd import를 다시 추가하면 type check 단계에서 실패한다. 이 실패는 lint rule에 의존하지 않는다.
- **Stale lint entries**: `react/eslint.config.js`의 project-agnostic override 블록은 `no-restricted-imports` 목록에 아직 `antd-style`(`useThemeMode`)과 `@lobehub/fluent-emoji`를 적고 있다. 이 항목은 막는 장치가 아니라 남은 흔적이고, 지워도 달라지는 것은 없다.
- **antd-shaped code remains**: antd 시절 파일은 `className`, inline `style`, `useTheme().token('--…')` 읽기를 유지한다. `CLAUDE.md`의 MIGRATION RELAXATION은 그 파일을 다른 이유로 고칠 때까지 이것들을 남겨 두도록 허용한다.
- **E2E backlog**: `e2e/`의 예전 `.ant-*` locator는 어떤 변경이 그 파일을 건드릴 때까지 계속 실패한다.

## 출처

- GitHub: #10802 (2026-11-03에 `.specs/`에서 흡수).
- Jira: FR-3482(migration, PR #8626)와 FR-3488(migration gate 정리, PR #8649). 둘 다 결정일인 2026-08-11에 머지되었다.
- 예전 위치는 `.specs/FR-3482-astryx-migration/`이며 #10802에서 삭제되었다. git history를 참고한다.
- 관련: [ADR 0009](0009-ui-common-as-the-single-entry-point-to-astryx.ko.md) (ui-common이 Astryx로 가는 유일한 경로), [ADR 0014](0014-bai-names-for-ui-common-form-controls.ko.md) (form control의 `BAI<X>` 이름), [ADR 0017](0017-single-select-for-client-held-option-lists.ko.md) (`BAISelect`와 그 antd-v6 props), [ADR 0018](0018-adrs-as-the-only-design-record.ko.md) (ADR이 유일한 설계 기록).

## 용어

| 용어     | 뜻                                                                                                                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| app-shim | app-shim은 `packages/backend.ai-ui/src/app-shim/`에 있는 BUI module로, antd의 call shape로 `App.useApp()`, `message`, `modal`을 export하고 Astryx component로 그린다. 이 module에는 antd 코드가 없다. |
| rc-table | rc-table은 antd의 `Table`이 기반으로 삼은 table engine이다. 이 engine의 `getPathValue`는 빈 `dataIndex` 경로에 record 전체를 돌려주므로, antd는 그런 column에서 `render`의 첫 인자로 record를 넘겼다. |
