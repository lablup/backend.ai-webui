/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Adapters that let Astryx form controls sit inside an antd `Form.Item` /
 `BAIFormItem` (the antd form ENGINE we keep, per MIGRATION-SPEC §0; visuals
 come from BAIFormItem).

 ## Why there is exactly one of these now (ticket 30)

 Two copies of this module grew in parallel: the pilot's
 (`components/astryxFormControls.tsx`, ported in ticket 10 and extended by
 tickets 16/17/19/23) and the page-group tickets'
 (`components/astryx-bui/astryxFormControls.tsx`, ticket 18, extended by 20).
 They exported the SAME seven component names with quietly different prop
 surfaces — `allowClear` vs `hasClear`, `number | string | null` vs
 `number | null`, one with `startIcon`/`onValueChange`, the other with
 `width`/`onBlur`/`data-testid`. Nothing failed, because each call site
 imported from whichever file its ticket happened to touch; but "which
 `AstryxFormTextInput` is this?" had become a per-file question and the two
 drifted further with every page migrated.

 This file is now the single implementation, carrying the UNION of both prop
 surfaces. `astryx-bui/astryxFormControls.tsx` re-exports it verbatim so the
 ~30 call sites on that path keep working; new code should import from here.

 ## THREE deltas make raw Astryx controls unusable as direct `Form.Item`
 children (pilot patterns P3/P4; each is a codemod / lint-rule candidate):

 1. `value` is REQUIRED and typed non-nullable on most Astryx controls
    (`TextInput.value: string`, `Switch.value: boolean`). antd's `Form.Item`
    clones its child with `value={undefined}` until the field is first
    touched, which flips the input from uncontrolled to controlled and logs a
    React warning. The adapters coalesce.

 2. `label` is REQUIRED on every Astryx control and rendered by the control
    itself. `BAIFormItem` already renders the visible label, so the adapters
    pass `label={sameString} isLabelHidden` to keep the accessible name
    without double-rendering. (`AstryxFormCheckbox` is the exception — antd
    `Checkbox` renders its children inline and the call sites keep that.)

 3. `onChange` receives the VALUE, not the event. antd's default
    `getValueFromEvent` happens to pass a non-event first argument through
    unchanged, but the adapters normalise explicitly instead of relying on
    that accident (and it does NOT hold for booleans read via
    `e.target.checked`).
*/
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { MultiSelector } from '@astryxdesign/core/MultiSelector';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import type { SelectorOptionType } from '@astryxdesign/core/Selector';
import { Selector } from '@astryxdesign/core/Selector';
import { Switch } from '@astryxdesign/core/Switch';
import { TextArea } from '@astryxdesign/core/TextArea';
import type { TextInputProps } from '@astryxdesign/core/TextInput';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Tokenizer } from '@astryxdesign/core/Tokenizer';
import type {
  SearchableItem,
  SearchSource,
} from '@astryxdesign/core/Typeahead';
import type { SizeValue } from '@astryxdesign/core/utils';
import React from 'react';

export interface AstryxFormTextInputProps {
  /** Injected by `Form.Item`. */
  value?: string;
  /** Injected by `Form.Item`. */
  onChange?: (value: string) => void;
  /** Accessible name. Visually hidden — `BAIFormItem` renders the visible one. */
  label: string;
  type?: 'text' | 'password' | 'email';
  placeholder?: string;
  disabled?: boolean;
  /** Astryx spelling. */
  hasClear?: boolean;
  /** antd spelling of `hasClear`, kept so migrated call sites read naturally. */
  allowClear?: boolean;
  /** antd `prefix` icon -> Astryx `startIcon` (icon component, not element). */
  startIcon?: TextInputProps['startIcon'];
  /** Astryx `TextInput.hasAutoFocus` passthrough (inline edit flows). */
  hasAutoFocus?: boolean;
  width?: SizeValue;
  /**
   * Astryx `TextInput.size`. Inline editors want `lg`, in-row fields want
   * `sm`; without it those call sites had to hand-roll a local adapter (D10).
   */
  size?: TextInputProps['size'];
  /** antd `Input.onPressEnter` is Astryx's `onEnter`. */
  onEnter?: () => void;
  /**
   * The key event Astryx exposes. antd's `onKeyUp`-based Escape-to-cancel
   * becomes `onKeyDown` here; inline editors are the only users.
   */
  onKeyDown?: TextInputProps['onKeyDown'];
  /** Native `name` attribute (autofill / password-manager hints). */
  htmlName?: string;
  /**
   * Fired with the new value AFTER `Form.Item`'s injected `onChange`. This is
   * the reason several call sites forked their own adapter: they need a side
   * effect (mark dirty, clear a resolved lookup) alongside the form write,
   * and `onChange` itself is owned by `Form.Item`.
   */
  onValueChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  'data-testid'?: string;
}

export const AstryxFormTextInput: React.FC<AstryxFormTextInputProps> = ({
  value,
  onChange,
  label,
  type,
  placeholder,
  disabled,
  hasClear,
  allowClear,
  startIcon,
  hasAutoFocus,
  width = '100%',
  size,
  onEnter,
  onKeyDown,
  htmlName,
  onValueChange,
  onBlur,
  ...rest
}) => {
  'use memo';
  return (
    <TextInput
      type={type}
      value={value ?? ''}
      onChange={(next) => {
        onChange?.(next);
        onValueChange?.(next);
      }}
      label={label}
      isLabelHidden
      placeholder={placeholder}
      isDisabled={disabled}
      hasClear={hasClear ?? allowClear}
      startIcon={startIcon}
      hasAutoFocus={hasAutoFocus}
      width={width}
      size={size}
      onEnter={onEnter}
      onKeyDown={onKeyDown}
      htmlName={htmlName}
      onBlur={onBlur}
      {...(rest as object)}
    />
  );
};

export interface AstryxFormTextAreaProps {
  /** Injected by `Form.Item`. */
  value?: string;
  /** Injected by `Form.Item`. */
  onChange?: (value: string) => void;
  /** Accessible name. Visually hidden — `BAIFormItem` renders the visible one. */
  label: string;
  /** antd `Input.TextArea rows`. */
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  width?: SizeValue;
  'data-testid'?: string;
}

export const AstryxFormTextArea: React.FC<AstryxFormTextAreaProps> = ({
  value,
  onChange,
  label,
  rows,
  placeholder,
  disabled,
  width = '100%',
  ...rest
}) => {
  'use memo';
  return (
    <TextArea
      value={value ?? ''}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden
      rows={rows}
      placeholder={placeholder}
      isDisabled={disabled}
      width={width}
      {...(rest as object)}
    />
  );
};

export interface AstryxFormSwitchProps {
  /** Injected by `Form.Item` (default `valuePropName`, i.e. `value`). */
  value?: boolean;
  /** Injected by `Form.Item valuePropName="checked"`. */
  checked?: boolean;
  onChange?: (value: boolean) => void;
  label: string;
  disabled?: boolean;
  /** Astryx `Switch.isLoading` — the toggle is awaiting a server round-trip. */
  isLoading?: boolean;
  size?: 'sm' | 'md';
  /**
   * Keep the control's own label visible instead of relying on `BAIFormItem`
   * to render it. Needed where the switch has no form-item label of its own.
   */
  isLabelHidden?: boolean;
  /**
   * Fired with the new value AFTER `Form.Item`'s injected `onChange` — same
   * role as on `AstryxFormTextInput`.
   */
  onValueChange?: (value: boolean) => void;
  'data-testid'?: string;
}

export const AstryxFormSwitch: React.FC<AstryxFormSwitchProps> = ({
  value,
  checked,
  onChange,
  label,
  disabled,
  isLoading,
  size,
  isLabelHidden = true,
  onValueChange,
  ...rest
}) => {
  'use memo';
  return (
    <Switch
      value={value ?? checked ?? false}
      onChange={(next) => {
        onChange?.(next);
        onValueChange?.(next);
      }}
      label={label}
      isLabelHidden={isLabelHidden}
      isDisabled={disabled}
      isLoading={isLoading}
      size={size}
      {...(rest as object)}
    />
  );
};

export interface AstryxFormRadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Trailing slot — e.g. a question-mark tooltip icon. */
  endContent?: React.ReactNode;
  'data-testid'?: string;
}

export interface AstryxFormRadioListProps {
  value?: string;
  onChange?: (value: string) => void;
  label: string;
  options: Array<AstryxFormRadioOption>;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  /**
   * Side effect to run alongside the Form-injected `onChange` (e.g. cross-field
   * revalidation). antd's `Form.Item` wraps and preserves a child's own
   * `onChange`; since the adapter owns that slot, the escape hatch is explicit.
   */
  onValueChange?: (value: string) => void;
}

export const AstryxFormRadioList: React.FC<AstryxFormRadioListProps> = ({
  value,
  onChange,
  label,
  options,
  disabled,
  orientation = 'horizontal',
  onValueChange,
}) => {
  'use memo';
  return (
    <RadioList
      value={value ?? ''}
      onChange={(next) => {
        onChange?.(next);
        onValueChange?.(next);
      }}
      label={label}
      isLabelHidden
      isDisabled={disabled}
      orientation={orientation}
    >
      {options.map((option) => (
        <RadioListItem
          key={option.value}
          value={option.value}
          label={option.label}
          isDisabled={option.disabled}
          endContent={option.endContent}
          // Astryx spreads unknown props onto the item's container element but
          // does NOT declare them in its TS types, so the cast is required.
          // The e2e suite selects on these, and they land on the wrapping
          // <label> instead of antd's <input> — selectors survive, but any
          // assertion on the matched element's tag/role does not.
          {...({ 'data-testid': option['data-testid'] } as object)}
        />
      ))}
    </RadioList>
  );
};

export interface AstryxFormSegmentedOption {
  value: string;
  label: string;
}

export interface AstryxFormSegmentedProps {
  value?: string;
  onChange?: (value: string) => void;
  label: string;
  options: Array<AstryxFormSegmentedOption>;
  disabled?: boolean;
}

// antd `Radio.Group` with `Radio.Button` children -> `SegmentedControl`
// (MAPPING.md §3.10).
export const AstryxFormSegmented: React.FC<AstryxFormSegmentedProps> = ({
  value,
  onChange,
  label,
  options,
  disabled,
}) => {
  'use memo';
  return (
    <SegmentedControl
      value={value ?? ''}
      onChange={(next) => onChange?.(next)}
      label={label}
      isDisabled={disabled}
    >
      {options.map((option) => (
        <SegmentedControlItem
          key={option.value}
          value={option.value}
          label={option.label}
        />
      ))}
    </SegmentedControl>
  );
};

export interface AstryxFormNumberInputProps {
  /** Injected by `Form.Item`. antd InputNumber values may arrive as strings. */
  value?: number | string | null;
  onChange?: (value: number | null) => void;
  label: string;
  min?: number | null;
  max?: number | null;
  step?: number | null;
  /** antd `InputNumber suffix` (a unit string) → Astryx `units`. */
  units?: string | null;
  isIntegerOnly?: boolean;
  placeholder?: string;
  disabled?: boolean;
  /**
   * Defaults to `true`: it is what gives Astryx's `onChange` the nullable
   * overload, which is the model antd `InputNumber` had (a cleared field is
   * `null`, not `0`) and what every call site's `onChange` is already typed
   * for. Pass `false` for a field that must never hold "no value".
   */
  hasClear?: boolean;
  width?: SizeValue;
  'data-testid'?: string;
}

export const AstryxFormNumberInput: React.FC<AstryxFormNumberInputProps> = ({
  value,
  onChange,
  label,
  min,
  max,
  step,
  units,
  isIntegerOnly,
  placeholder,
  disabled,
  hasClear = true,
  width = '100%',
  ...rest
}) => {
  'use memo';
  // antd `InputNumber` handed strings through in some call sites; coalesce
  // before Astryx sees it, and treat an unparseable string as "no value"
  // rather than letting NaN reach the input.
  const numericValue =
    value === undefined || value === null || value === ''
      ? null
      : Number(value);
  const safeValue = Number.isNaN(numericValue as number) ? null : numericValue;
  return hasClear ? (
    <NumberInput
      hasClear
      value={safeValue}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden
      min={min}
      max={max}
      step={step}
      units={units || undefined}
      isIntegerOnly={isIntegerOnly}
      placeholder={placeholder}
      isDisabled={disabled}
      width={width}
      {...(rest as object)}
    />
  ) : (
    <NumberInput
      value={safeValue}
      onChange={(next: number) => onChange?.(next)}
      label={label}
      isLabelHidden
      min={min}
      max={max}
      step={step}
      units={units || undefined}
      isIntegerOnly={isIntegerOnly}
      placeholder={placeholder}
      isDisabled={disabled}
      width={width}
      {...(rest as object)}
    />
  );
};

export interface AstryxFormCheckboxProps {
  /** Injected by `Form.Item` (default `valuePropName`, i.e. `value`). */
  value?: boolean;
  /** Injected by `Form.Item valuePropName="checked"`. */
  checked?: boolean;
  onChange?: (value: boolean) => void;
  /** The visible checkbox label (antd `<Checkbox>{children}</Checkbox>`). */
  label: string;
  disabled?: boolean;
  /** Opt out of the inline label when `BAIFormItem` already renders one. */
  isLabelHidden?: boolean;
  /**
   * Side effect to run alongside the Form-injected `onChange` (e.g. clearing
   * a sibling field). The adapter owns the `onChange` slot, so the escape
   * hatch is explicit (same convention as AstryxFormRadioList).
   */
  onValueChange?: (value: boolean) => void;
  'data-testid'?: string;
}

export const AstryxFormCheckbox: React.FC<AstryxFormCheckboxProps> = ({
  value,
  checked,
  onChange,
  label,
  disabled,
  isLabelHidden,
  onValueChange,
  ...rest
}) => {
  'use memo';
  return (
    <CheckboxInput
      value={value ?? checked ?? false}
      onChange={(next) => {
        onChange?.(next);
        onValueChange?.(next);
      }}
      label={label}
      isLabelHidden={isLabelHidden}
      isDisabled={disabled}
      {...(rest as object)}
    />
  );
};

/**
 * Option shape accepted by `AstryxFormSelector` / `AstryxFormMultiSelector`.
 *
 * A superset of what the two former modules declared. `description` and
 * `isDisabled` came from the ticket-18 variant and are accepted (Astryx's
 * `Selector` ignores what it does not know); `label`, `disabled` and plain
 * strings / dividers / sections come from Astryx's own `SelectorOptionType`.
 */
export interface AstryxFormSelectorOption {
  value: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  isDisabled?: boolean;
}

export type AstryxFormSelectorOptions = ReadonlyArray<
  AstryxFormSelectorOption | SelectorOptionType
>;

export interface AstryxFormSelectorProps {
  /** Injected by `Form.Item`. */
  value?: string;
  onChange?: (value: string | null) => void;
  /** Accessible name. Visually hidden — `BAIFormItem` renders the visible one. */
  label: string;
  options: AstryxFormSelectorOptions;
  placeholder?: string;
  disabled?: boolean;
  hasClear?: boolean;
  /** antd `showSearch`. */
  hasSearch?: boolean;
  isLoading?: boolean;
  width?: SizeValue;
  'data-testid'?: string;
}

/**
 * Small static-option select inside a `Form.Item` — the plain `Selector`
 * branch of MAPPING §3.1 (no remote source, no multiple, few options).
 * Anything Relay-backed or large keeps the ComplexSelector track (tickets
 * 26/27), not this adapter.
 */
export const AstryxFormSelector: React.FC<AstryxFormSelectorProps> = ({
  value,
  onChange,
  label,
  options,
  placeholder,
  disabled,
  hasClear,
  hasSearch,
  isLoading,
  width = '100%',
  ...rest
}) => {
  'use memo';
  // `hasClear` is a discriminated union on Selector (with it, value/onChange
  // become nullable) — branch instead of passing `boolean | undefined`.
  const selectorOptions = options as SelectorOptionType[];
  return hasClear ? (
    <Selector
      hasClear
      value={value ?? null}
      onChange={(next: string | null) => onChange?.(next)}
      label={label}
      isLabelHidden
      options={selectorOptions}
      placeholder={placeholder}
      isDisabled={disabled}
      hasSearch={hasSearch}
      isLoading={isLoading}
      width={width}
      {...(rest as object)}
    />
  ) : (
    <Selector
      value={value ?? undefined}
      onChange={(next: string) => onChange?.(next)}
      label={label}
      isLabelHidden
      options={selectorOptions}
      placeholder={placeholder}
      isDisabled={disabled}
      hasSearch={hasSearch}
      isLoading={isLoading}
      width={width}
      {...(rest as object)}
    />
  );
};

export interface AstryxFormMultiSelectorProps {
  /** Injected by `Form.Item`; antd `Select mode="multiple"` also nullable
   *  until first touch. */
  value?: string[];
  onChange?: (value: string[]) => void;
  label: string;
  options: AstryxFormSelectorOptions;
  placeholder?: string;
  disabled?: boolean;
  hasSearch?: boolean;
  isLoading?: boolean;
  width?: SizeValue;
  'data-testid'?: string;
}

/**
 * Static-options multi-select (MAPPING §3.1 `mode="multiple"` branch).
 * Relay / infinite-scroll multi-selects are NOT this — those stay on the BUI
 * frontier until the ComplexSelector rebuild (tickets 26/27).
 */
export const AstryxFormMultiSelector: React.FC<
  AstryxFormMultiSelectorProps
> = ({
  value,
  onChange,
  label,
  options,
  placeholder,
  disabled,
  hasSearch,
  isLoading,
  width = '100%',
  ...rest
}) => {
  'use memo';
  return (
    <MultiSelector
      value={value ?? []}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden
      options={options as SelectorOptionType[]}
      placeholder={placeholder}
      isDisabled={disabled}
      hasSearch={hasSearch}
      isLoading={isLoading}
      width={width}
      {...(rest as object)}
    />
  );
};

/**
 * Free-tag entry has no options to search — the source is intentionally empty
 * and `hasCreate` is what commits typed text as a new token. Module-level so
 * the Tokenizer never sees a fresh identity per render.
 */
const EMPTY_TAG_SEARCH_SOURCE: SearchSource<SearchableItem> = {
  search: () => [],
  bootstrap: () => [],
};

export interface AstryxFormTagsInputProps {
  /** Injected by `Form.Item`; nullable until the field is first touched. */
  value?: string[];
  /** Injected by `Form.Item`. */
  onChange?: (value: string[]) => void;
  /** Accessible name. Visually hidden — `BAIFormItem` renders the visible one. */
  label: string;
  placeholder?: string;
  disabled?: boolean;
  /** antd `allowClear` — clears every token at once. */
  hasClear?: boolean;
  /** antd `maxCount`. */
  maxEntries?: number;
  width?: SizeValue;
  'data-testid'?: string;
}

/**
 * Free-form chip input — antd `Select mode="tags"` (MAPPING §3.1 tags branch).
 * The form field holds `string[]`; the Tokenizer works on `SearchableItem[]`
 * (`{id, label}`), so the shapes are translated here.
 *
 * PILOT-DECISION: antd `Select mode="tags"` → Astryx `Tokenizer` with
 * `hasCreate` over an empty search source (there are no suggestions to
 * search). `tokenSeparators` (comma/space splitting one paste into several
 * tags) has no Tokenizer equivalent and is dropped — tags are committed one at
 * a time with Enter. `allowClear` → `hasClear`; `maxTagCount` (how many chips
 * render before a "+N" collapse) is dropped — Tokenizer owns that through
 * `tokenOverflowBehavior`. `notFoundContent` maps to nothing: the empty search
 * source simply yields no dropdown.
 */
export const AstryxFormTagsInput: React.FC<AstryxFormTagsInputProps> = ({
  value,
  onChange,
  label,
  placeholder,
  disabled,
  hasClear,
  maxEntries,
  width = '100%',
  ...rest
}) => {
  'use memo';
  return (
    <Tokenizer
      value={(value ?? []).map((tag) => ({ id: tag, label: tag }))}
      onChange={(items) =>
        // antd tags mode deduplicated entries; keep that behavior.
        onChange?.(
          Array.from(new Set(items.map((item) => item.label))).filter(Boolean),
        )
      }
      label={label}
      isLabelHidden
      searchSource={EMPTY_TAG_SEARCH_SOURCE}
      hasCreate
      hasClear={hasClear}
      maxEntries={maxEntries}
      placeholder={placeholder}
      isDisabled={disabled}
      width={width}
      {...(rest as object)}
    />
  );
};
