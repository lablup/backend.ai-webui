# 0014 — BAI names for ui-common form controls

> ADR 0009의 1절 "New code" 항목 중 form control에 관한 부분을 대신한다.

## Summary

> 낯선 용어는 문서 맨 아래 [용어](#용어)에 모아 두었다.

- `react/`는 ui-common의 [Form.Item-aware form control](#용어)을 `@lablup/ui-common/<X>`가 아니라 `backend.ai-ui`의 `BAI<X>` 이름으로 import한다.
- BUI는 그 이름을 `packages/backend.ai-ui/src/components/BAIFormControls.tsx` 한 파일에서 ui-common component의 [re-export](#용어)로 낸다. re-export는 wrapper가 아니므로 props와 동작은 ui-common component 그대로다.
- form control을 `Form.Item`에 맞추던 webui의 adapter(`AstryxForm*`)는 두지 않는다. value 보정, item 폭 채우기, label과 status와 disabled 전달은 ui-common이 한다.
- BUI 쪽 동작이 필요한 control은 re-export 목록에서 빼고 같은 이름의 `BAI<X>` component 파일을 따로 둔다. 지금 그런 control은 `BAISegmentedControlItem` 하나다.
- `react/eslint.config.js`의 `no-restricted-imports`가 `react/`에서 이 component 이름을 ui-common subpath로 import하는 것을 막는다. 같은 subpath의 type과 helper(`SelectorOptionType`, `ISODateTimeString`, `SliderProps` 등)는 그대로 import한다.

## Context

- **What ui-common provides**: ui-common 0.2.0-alpha.20부터 form control(`TextInput`, `NumberInput`, `Selector` 등)은 Astryx component를 감싼 Form.Item-aware wrapper다. `Form.Item` 안에서 value, onChange, disabled, validation status, 접근 가능한 이름을 item에서 받고, item 행의 폭을 채운다. `NumberInput`은 비우면 `null`을 보고하고, `Selector`는 trigger 아래로 열리고, `TagsInput`은 `tokenSeparators`로 tag를 나눈다.
- **What webui had**: webui는 이 일을 직접 하는 adapter를 두 벌 두었다. `react/src/components/astryxFormControls.tsx`·`astryxFormTextInput.tsx`와 BUI의 `astryxFormControls.tsx`다. #10553이 둘을 지우고 ui-common control을 직접 쓰게 했다.
- **Why a decision is needed**: ADR 0009는 새 webui code가 BUI에 `BAI*` adapter가 있으면 그것을, 없으면 ui-common component를 직접 쓴다고 정했다. 그 규칙대로면 form control은 BUI에 adapter가 없으므로 webui가 ui-common subpath를 직접 import한다. 그러면 webui 화면의 다른 component(`BAISelect`, `BAICheckbox`, `BAIModal` 등)는 `backend.ai-ui`에서, form control만 ui-common에서 오고, BUI 쪽 동작을 나중에 더할 자리가 없다. 팀은 form control도 `BAI*` 이름 하나로 쓰기로 했다.

## 설계도

```mermaid
flowchart LR
  subgraph react["react/src"]
    page["page / component"]
  end
  subgraph bui["packages/backend.ai-ui/src/components"]
    barrel["index.ts"]
    fc["BAIFormControls.tsx<br/>re-export only"]
    item["BAISegmentedControlItem.tsx<br/>own component"]
  end
  subgraph uic["@lablup/ui-common"]
    ctl["TextInput, NumberInput, Selector, ...<br/>Form.Item-aware wrapper"]
    form["Form, Form.Item"]
  end
  page -- "import BAITextInput, BAINumberInput, ..." --> barrel
  barrel -- "named re-export" --> fc
  barrel -- "default export" --> item
  fc -- "X renamed to BAIX" --> ctl
  item -- "wraps SegmentedControlItem" --> ctl
  ctl -- "reads label, status, disabled from item context" --> form
  page -- "ESLint blocks import of X from @lablup/ui-common/X" --> uic
```

## Decision

### 1. BUI가 form control을 `BAI<X>` 이름으로 re-export한다

| `backend.ai-ui` 이름 | ui-common subpath의 이름 |
|---|---|
| `BAICheckboxInput` | `CheckboxInput` |
| `BAICheckboxList`, `BAICheckboxListItem` | `CheckboxList`, `CheckboxListItem` |
| `BAIDateInput` | `DateInput` |
| `BAIDateRangeInput` | `DateRangeInput` |
| `BAIDateTimeInput` | `DateTimeInput` |
| `BAIFileInput` | `FileInput` |
| `BAIMultiSelector` | `MultiSelector` |
| `BAINumberInput` | `NumberInput` |
| `BAIRadioList`, `BAIRadioListItem` | `RadioList`, `RadioListItem` |
| `BAISegmentedControl` | `SegmentedControl` |
| `BAISelector` | `Selector` |
| `BAISlider` | `Slider` |
| `BAISwitch` | `Switch` |
| `BAITagsInput` | `TagsInput` |
| `BAITextArea` | `TextArea` |
| `BAITextInput` | `TextInput` |
| `BAITimeInput` | `TimeInput` |
| `BAITokenizer` | `Tokenizer` |
| `BAITypeahead` | `Typeahead` |

- **One file**: 모든 re-export는 `BAIFormControls.tsx`에 `export { X as BAIX, type XProps as BAIXProps } from '@lablup/ui-common/X'` 꼴로 있다. components barrel `index.ts`는 이름을 하나씩 나열해 다시 낸다.
- **Props type**: 각 control은 `BAI<X>Props` type도 함께 낸다. 이 type은 ui-common의 `<X>Props`와 같다.
- **Catalog**: `BAIFormControls.doc.ts`가 이 component들을 한 doc의 `components`로 적어 `ui-common component` 목록과 `astryxIntegration.test.ts`의 catalog coverage를 채운다.
- **Not a wrapper**: re-export는 ui-common component 그 자체이므로 `component-props-extension.md`가 말하는 wrapper 규칙(props extend, `...rest` 전달)의 대상이 아니다.

### 2. BUI 동작이 필요한 control은 자기 파일을 갖는다

- **Promotion**: 어떤 control에 BUI 쪽 동작(번역, 기본값, 다른 props)이 필요해지면 그 이름을 `BAIFormControls.tsx`에서 빼고 `BAI<X>.tsx`와 `BAI<X>.doc.ts`를 둔다. props interface는 ui-common `<X>Props`를 extend한다. call site의 import는 바뀌지 않는다.
- **SegmentedControlItem**: `BAISegmentedControlItem`은 이미 그런 component다. `label`을 `ReactNode`로 넓히고, `isLabelHidden`은 `label`이 string일 때만 받는다. 그래서 `SegmentedControlItem`의 BAI 이름은 이것이고, 같은 이름의 re-export는 두지 않는다.
- **Existing antd-shaped wrappers stay**: `BAISelect`, `BAICheckbox`, `BAIDynamicUnitInputNumber`처럼 frozen antd-v6 props를 받는 기존 BUI component는 그대로 남는다. 새 code는 Astryx 모양 props가 맞으면 이 문서의 `BAI<X>`를 쓴다.

### 3. ESLint가 `react/`의 직접 import를 막는다

- **Rule**: `react/eslint.config.js`의 `formControlImportBans`가 `no-restricted-imports`의 `paths`에 subpath마다 한 항목을 둔다. 항목은 그 subpath의 component 이름만 `importNames`로 막고, 메시지로 `BAI<X>`를 가리킨다. `restrictedImportPaths`와 project-agnostic page block이 이 배열을 펼친다.
- **Types stay importable**: `importNames`에 없는 이름(type, helper, `TypeaheadItem` 같은 다른 component)은 막지 않는다.
- **BUI is exempt**: BUI source는 ui-common subpath를 직접 import한다. re-export와 promotion된 component가 그 경로를 쓴다.

## 대안과 기각 사유

- **Direct ui-common imports**: ADR 0009의 규칙대로 webui가 `@lablup/ui-common/<X>`를 직접 import한다. BUI에 파일을 더하지 않는다는 것이 장점이다. 기각한 이유는 한 화면 안에서 component 출처가 `backend.ai-ui`와 ui-common으로 갈리고, 나중에 BUI 동작을 더하려면 call site를 다시 모두 고쳐야 하기 때문이다.
- **Thin BAI wrappers per control**: control마다 ui-common component를 감싸는 `BAI<X>.tsx`를 둔다. 동작을 더할 자리가 처음부터 있다는 것이 장점이다. 기각한 이유는 더할 동작이 없는 wrapper가 19개 생기고, 각 wrapper가 props 전달과 `ref`를 다시 구현해 ui-common과 어긋날 수 있기 때문이다. 필요해진 control만 2절대로 자기 파일을 갖는다.
- **Keep the AstryxForm adapters**: webui의 adapter를 그대로 둔다. call site를 바꾸지 않는다는 것이 장점이다. 기각한 이유는 adapter가 하던 일을 ui-common이 하게 되어 같은 일을 두 곳에서 하고, adapter가 ui-common과 다른 props 이름(`label`, `onValueChange`, `allowClear`)을 써서 ui-common 문서와 맞지 않기 때문이다.

## Consequences

- **One import source**: webui 화면의 form control은 다른 BUI component와 같이 `backend.ai-ui`에서 온다.
- **Upstream props**: `BAI<X>`의 props는 ui-common과 Astryx의 props다. `label`은 `Form.Item`이 그리고 control에는 필요할 때 `aria-label`을 준다. checkbox와 switch의 보이는 글은 `children`이다.
- **New ui-common control**: ui-common이 새 Form.Item-aware control을 내면, webui에서 쓰기 전에 `BAIFormControls.tsx`, components barrel, `BAIFormControls.doc.ts`, `formControlImportBans`에 같이 더한다.
- **Lint scope**: ban은 `react/`의 static import만 본다. BUI story와 test는 ui-common을 직접 import해도 된다.

## 출처

- GitHub: #10553, PR #10554. ui-common의 Form.Item wrapper는 lablup/ui-common#72(0.2.0-alpha.20).
- 결정일: 2026-10-25.
- 관련: [ADR 0009](0009-ui-common-as-the-single-entry-point-to-astryx.md) (ui-common이 Astryx로 가는 유일한 경로, BUI의 `BAI*` adapter).

## 용어

| 용어 | 뜻 |
|---|---|
| Form.Item-aware form control | ui-common이 Astryx 입력 component를 감싸 `Form.Item` 안에서 value, onChange, disabled, validation status, 접근 가능한 이름을 item에서 받게 한 component다. Astryx의 field chrome(`label`, `description`, `isRequired`)은 받지 않는다. |
| re-export | 다른 module의 export를 이름만 바꿔 다시 내는 것이다. 새 component를 만들지 않으므로 `BAITextInput === TextInput`이다. |
