/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Adapters that let Astryx form controls sit inside an antd `Form.Item` /
 `BAIFormItem` (the antd form ENGINE we keep, per MIGRATION-SPEC §0; visuals
 come from BAIFormItem).

 ## Why there is exactly one of these now (ticket 30)

 A twin of this module once grew in parallel at
 `components/astryx-bui/astryxFormControls.tsx` (since deleted), with the
 same seven export names and quietly different prop surfaces. This file is the
 single implementation, carrying the UNION of both surfaces — do not re-fork
 it (see `.claude/rules/bui-component-home.md`).

 ## THREE deltas make raw Astryx controls unusable as direct `Form.Item`
 children (pilot patterns P3/P4; each is a codemod / lint-rule candidate):

 1. `value` is REQUIRED and typed non-nullable on most Astryx controls
    (`TextInput.value: string`, `Switch.value: boolean`). antd's `Form.Item`
    clones its child with `value={undefined}` until the field is first
    touched, which flips the input from uncontrolled to controlled and logs a
    React warning. The adapters coalesce.

 2. The adapters keep a required `label`, passed on as `aria-label`: the
    ui-common controls take no field chrome (`Form.Item` owns the visible
    label), and `aria-label` is what names them outside an item. Checkbox and
    Switch render a visible `label` as their inline `children`.

 3. `onChange` receives the VALUE, not the event. antd's default
    `getValueFromEvent` happens to pass a non-event first argument through
    unchanged, but the adapters normalise explicitly instead of relying on
    that accident (and it does NOT hold for booleans read via
    `e.target.checked`).
*/
import {
  AstryxFormTextInput,
  type AstryxFormTextInputProps,
} from './astryxFormTextInput';
import { CheckboxInput } from '@lablup/ui-common/CheckboxInput';
import { MultiSelector } from '@lablup/ui-common/MultiSelector';
import { NumberInput } from '@lablup/ui-common/NumberInput';
import { RadioList, RadioListItem } from '@lablup/ui-common/RadioList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@lablup/ui-common/SegmentedControl';
import type { SelectorOptionType } from '@lablup/ui-common/Selector';
import { Selector } from '@lablup/ui-common/Selector';
import { Switch } from '@lablup/ui-common/Switch';
import { TextArea } from '@lablup/ui-common/TextArea';
import { Tokenizer } from '@lablup/ui-common/Tokenizer';
import { TypeaheadItem } from '@lablup/ui-common/Typeahead';
import type { SearchableItem, SearchSource } from '@lablup/ui-common/Typeahead';
import type { SizeValue } from '@lablup/ui-common/utils';
import * as _ from 'lodash-es';
import React, { useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';

export { AstryxFormTextInput, type AstryxFormTextInputProps };

export interface AstryxFormTextAreaProps {
  /** Injected by `Form.Item`. */
  value?: string;
  /** Injected by `Form.Item`. */
  onChange?: (value: string) => void;
  /** Accessible name (`aria-label`); the enclosing `Form.Item` renders the visible one. */
  label: string;
  /** antd `Input.TextArea rows`. */
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  width?: SizeValue;
  /**
   * antd `Input.TextArea maxLength`. Astryx declares it natively AND renders
   * antd's `showCount` counter from it, so the two antd props collapse to one.
   */
  maxLength?: number;
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
  maxLength,
  ...rest
}) => {
  'use memo';
  return (
    <TextArea
      value={value ?? ''}
      onChange={(next) => onChange?.(next)}
      aria-label={label}
      rows={rows}
      placeholder={placeholder}
      disabled={disabled}
      width={width}
      maxLength={maxLength}
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
      aria-label={isLabelHidden ? label : undefined}
      disabled={disabled}
      isLoading={isLoading}
      size={size}
      {...(rest as object)}
    >
      {isLabelHidden ? undefined : label}
    </Switch>
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
      aria-label={label}
      disabled={disabled}
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
  ...rest
}) => {
  'use memo';
  return (
    <SegmentedControl
      value={value ?? ''}
      onChange={(next) => onChange?.(next)}
      aria-label={label}
      disabled={disabled}
      // `Form.Item`'s `data-uic-field-id` rides through to the root, which is
      // what lets scroll-to-first-error find this field.
      {...(rest as object)}
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
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
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
  onBlur,
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

  /**
   * RESTORED — **an out-of-range entry is clamped on blur.**
   *
   * antd's `InputNumber` ran `getRangeValue` on blur and on Enter, so typing
   * `70000` into a `max={65535}` port field left `65535` behind. Astryx's
   * `parseNumberInput` REJECTS anything past a bound (returns `null`), so
   * `onChange` never fires and the pending text is discarded on blur — the
   * field snaps back to its old value and the user's intent is lost, silently.
   * 35 bounded fields in this repo were affected (ports, MTU, replica counts,
   * resource-policy maxima).
   *
   * The raw field text is the only place the rejected entry still exists, so
   * the clamp is computed from there. React 19 does not pool events.
   */
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const rawText = event.target.value;
    const typed = rawText.trim() === '' ? NaN : Number(rawText);
    // `isIntegerOnly` counts as a repairable constraint on its own: Astryx's
    // parser rejects a typed decimal exactly the way it rejects an
    // out-of-range value, so without it a decimal vanishes on blur in an
    // unbounded integer field.
    if (
      Number.isFinite(typed) &&
      typed !== safeValue &&
      (typeof min === 'number' || typeof max === 'number' || isIntegerOnly)
    ) {
      let clamped = typed;
      if (typeof min === 'number' && clamped < min) clamped = min;
      if (typeof max === 'number' && clamped > max) clamped = max;
      if (isIntegerOnly) clamped = Math.round(clamped);
      if (clamped !== safeValue && clamped !== typed) {
        onChange?.(clamped);
      }
    }
    onBlur?.(event);
  };

  return (
    <NumberInput
      hasClear={hasClear}
      value={safeValue}
      onChange={(next) => onChange?.(next)}
      aria-label={label}
      min={min}
      max={max}
      step={step}
      units={units || undefined}
      isIntegerOnly={isIntegerOnly}
      placeholder={placeholder}
      disabled={disabled}
      width={width}
      onBlur={handleBlur}
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
      aria-label={isLabelHidden ? label : undefined}
      disabled={disabled}
      {...(rest as object)}
    >
      {isLabelHidden ? undefined : label}
    </CheckboxInput>
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
  /** Accessible name (`aria-label`); the enclosing `Form.Item` renders the visible one. */
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
  // QA-FINDINGS Q-34 — both branches pin `placement`. Without it `Selector`
  // takes `shouldOverlaySelectedItem = placement == null && !hasSearch` and
  // offsets the panel upwards by a negative `margin-block-start` so that the
  // selected option lands ON the trigger, hiding the field's label and current
  // value. Inside a `Form.Item` that is worse than elsewhere: the visible
  // label `BAIFormItem` renders is exactly what gets covered. Every one of
  // these adapters is search-optional, so the condition is live whenever a
  // call site omits `hasSearch`.
  return hasClear ? (
    <Selector
      hasClear
      placement="below"
      value={value ?? null}
      onChange={(next: string | null) => onChange?.(next)}
      aria-label={label}
      options={selectorOptions}
      placeholder={placeholder}
      disabled={disabled}
      hasSearch={hasSearch}
      isLoading={isLoading}
      width={width}
      {...(rest as object)}
    />
  ) : (
    <Selector
      placement="below"
      value={value ?? undefined}
      onChange={(next: string) => onChange?.(next)}
      aria-label={label}
      options={selectorOptions}
      placeholder={placeholder}
      disabled={disabled}
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
  /**
   * Trigger rendering. Defaults to `'labels'` (QA2-B-1) — Astryx's own default
   * is `'count'` ("3 selected"), which hides the selection antd showed inline.
   */
  triggerDisplay?: 'count' | 'labels' | 'badges';
  'data-testid'?: string;
}

/**
 * Static-options multi-select (MAPPING §3.1 `mode="multiple"` branch).
 * Relay / infinite-scroll multi-selects are NOT this — those stay on the BUI
 * frontier until the ComplexSelector rebuild (tickets 26/27).
 *
 * PILOT-DECISION (QA2-B-1): `triggerDisplay` defaults to `'labels'`, matching
 * `BAISelect`'s multiple branch and `BAIComplexSelect`, so every multi-select
 * in the app names its selection in the trigger instead of counting it. Astryx
 * caps the labels list at three and appends `, +N`.
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
  triggerDisplay = 'labels',
  ...rest
}) => {
  'use memo';
  return (
    <MultiSelector
      value={value ?? []}
      onChange={(next) => onChange?.(next)}
      aria-label={label}
      options={options as SelectorOptionType[]}
      placeholder={placeholder}
      disabled={disabled}
      hasSearch={hasSearch}
      isLoading={isLoading}
      width={width}
      triggerDisplay={triggerDisplay}
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
  /** Accessible name (`aria-label`); the enclosing `Form.Item` renders the visible one. */
  label: string;
  placeholder?: string;
  disabled?: boolean;
  /** antd `allowClear` — clears every token at once. */
  hasClear?: boolean;
  /** antd `maxCount`. */
  maxEntries?: number;
  /**
   * antd `tokenSeparators` — the characters that split one entry into several
   * tokens. Restored because the UI still PROMISES it: `PortSelectFormItem`
   * renders "Enter multiple values separated by either a comma (,) or a
   * space", `UserSettingModal` says "Enter GIDs separated by commas or
   * spaces", and `AppLauncherModal` labels its field "(comma-separated)".
   *
   * Honoured on TWO paths, because antd honoured both:
   *  - **while typing** — pressing one of these keys commits the pending text
   *    as a token (see the `QA-FINDINGS Q-31` block on the component below);
   *  - **on commit** — `splitOnSeparators` takes a single committed entry
   *    apart, which is what makes a PASTE of `"a,b,c"` + Enter behave as antd
   *    did (Astryx's `Tokenizer` exposes no paste hook).
   */
  tokenSeparators?: Array<string>;
  width?: SizeValue;
  'data-testid'?: string;
}

// Tokenizer's ref is its input; the listeners need the control box around it.
const tokenizerControlBox = (input: HTMLInputElement | null) =>
  input?.closest<HTMLElement>('.astryx-tokenizer') ?? null;

/**
 * Free-form chip input — antd `Select mode="tags"` (MAPPING §3.1 tags branch).
 * The form field holds `string[]`; the Tokenizer works on `SearchableItem[]`
 * (`{id, label}`), so the shapes are translated here.
 *
 * PILOT-DECISION: antd `Select mode="tags"` → Astryx `Tokenizer` with
 * `hasCreate` over an empty search source (there are no suggestions to
 * search). `allowClear` → `hasClear`; `maxTagCount` (how many chips render
 * before a "+N" collapse) is dropped — Tokenizer owns that through
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
  tokenSeparators,
  width = '100%',
  ...rest
}) => {
  'use memo';
  const { t } = useTranslation();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const splitOnSeparators = (label: string): Array<string> => {
    if (!tokenSeparators?.length) return [label];
    const pattern = new RegExp(
      tokenSeparators.map((s) => _.escapeRegExp(s)).join('|'),
    );
    return label
      .split(pattern)
      .map((part) => part.trim())
      .filter(Boolean);
  };

  /*
   * QA-FINDINGS Q-31 — "supplementary GID splits on comma and space, but the
   * only trigger is Enter".
   *
   * MEASURED SYMPTOM (Admin > Users > Edit, the Supplementary GID field):
   * typing `10,20 30` at 120ms/key left the whole raw string sitting in the
   * input and produced ZERO tokens; only Enter committed, and only then did
   * `splitOnSeparators` above take the single committed entry apart into
   * `10 / 20 / 30`. So the separators were honoured on COMMIT and never while
   * typing — while the field's own helper text promises "Enter GIDs separated
   * by commas or spaces". Legacy was antd `Select mode="tags"
   * tokenSeparators={[',', ' ']}`, which cut a token on the KEYSTROKE.
   *
   * WHY THERE IS NO PROP: Astryx's `Tokenizer` has no delimiter API —
   * `ui-common component Tokenizer` lists none, `Tokenizer.d.ts` contains no
   * `separator`/`delimiter`, and `TokenizerHandle` exposes only
   * `focus()`/`blur()`. `InputGroup`-style composition does not apply either.
   * The only reachable seam is the DOM.
   *
   * MECHANISM: `Tokenizer`'s ref is its `<input>`; `tokenizerControlBox`
   * recovers the control box around it (`.astryx-tokenizer`). A CAPTURE-phase
   * `keydown` listener on that box sees the separator key before anything else,
   * cancels it (a separator is never part of a tag) and re-dispatches a
   * synthetic `Enter` keydown on the same `<input>`. Astryx's own create path
   * then runs unmodified: `BaseTypeahead` selects the highlighted
   * `Create "…"` row that `Tokenizer`'s `hasCreate` source appended, and
   * `handleAdd` emits a `type: 'create'` change. We commit nothing ourselves,
   * so dedupe, `maxEntries`, the announce region and the form binding all
   * behave exactly as they do for a real Enter.
   *
   * `debounceMs={0}` below is LOAD-BEARING, not tidying. `BaseTypeahead`
   * defaults to 150ms, and its Enter branch is gated on `popover.isOpen` —
   * at 120ms/key the search for `"10"` had not fired yet when `,` arrived, so
   * the synthetic Enter hit a closed popover, did nothing, and the cancelled
   * comma was simply lost. The search source here is `EMPTY_TAG_SEARCH_SOURCE`
   * (no network, no work), so debouncing it buys nothing anyway.
   *
   * FRAGILITY — read before bumping `@astryxdesign/core`. This depends on
   * Astryx's keydown handler accepting a NON-TRUSTED event and on its create
   * path still being reachable from `Enter`. Both are internal details: if
   * upstream starts checking `event.isTrusted`, moves the create commit to
   * `keypress`/`beforeinput`, or stops opening the popover for a
   * create-only result set, this stops working SILENTLY — no type error, no
   * lint, no test in CI outside this file. The standing ask is an upstream
   * `tokenSeparators` / `delimiters` prop on `Tokenizer`; when it lands,
   * delete this block and pass the prop.
   *
   * PASTE still goes through `splitOnSeparators` on commit: `paste` inserts
   * text without a keydown per character, so there is no separator key to
   * intercept.
   */
  const handleSeparatorKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!tokenSeparators?.length || !tokenSeparators.includes(event.key)) {
      return;
    }
    // Never steal a shortcut, and never cut a token mid-IME-composition.
    if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) {
      return;
    }
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    // A separator character is never part of a tag, so it is swallowed even
    // when there is nothing to commit (leading/repeated separators).
    event.preventDefault();
    if (!input.value.trim()) return;
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
  });

  // Tokenizer leaves uncommitted text in the input on blur; commit it as tags
  // (antd `mode="tags"` did). Its own Enter path re-focuses the input, so the
  // tags are emitted here and the query is cleared through a native input event.
  const commitPendingTextOnFocusOut = useEffectEvent((event: FocusEvent) => {
    const root = tokenizerControlBox(inputRef.current);
    const input = root?.querySelector('input');
    if (!root || !input || !input.value.trim()) return;
    const next = event.relatedTarget;
    const listbox = document.getElementById(
      input.getAttribute('aria-controls') ?? '',
    );
    if (
      next instanceof Node &&
      (root.contains(next) || listbox?.contains(next))
    )
      return;

    const current = value ?? [];
    const merged = _.uniq([
      ...current,
      ...splitOnSeparators(input.value.trim()),
    ]);
    const committed =
      maxEntries == null
        ? merged
        : merged.slice(0, Math.max(maxEntries, current.length));
    if (committed.length > current.length) onChange?.(committed);

    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set?.call(input, '');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  React.useEffect(() => {
    const root = tokenizerControlBox(inputRef.current);
    if (!root) return;
    const keyListener = (event: KeyboardEvent) => handleSeparatorKeyDown(event);
    const focusOutListener = (event: FocusEvent) =>
      commitPendingTextOnFocusOut(event);
    root.addEventListener('keydown', keyListener, true);
    root.addEventListener('focusout', focusOutListener);
    return () => {
      root.removeEventListener('keydown', keyListener, true);
      root.removeEventListener('focusout', focusOutListener);
    };
  }, []);

  return (
    <Tokenizer
      ref={inputRef}
      value={(value ?? []).map((tag) => ({ id: tag, label: tag }))}
      onChange={(items) =>
        // antd tags mode deduplicated entries; keep that behavior.
        onChange?.(
          Array.from(
            new Set(items.flatMap((item) => splitOnSeparators(item.label))),
          ).filter(Boolean),
        )
      }
      aria-label={label}
      searchSource={EMPTY_TAG_SEARCH_SOURCE}
      hasCreate
      // Tokenizer hardcodes the create row's English label; the typed text
      // rides on `auxiliaryData.__createdValue`.
      renderItem={(item) => {
        const createdValue = (
          item as SearchableItem<{ __createdValue?: unknown }>
        ).auxiliaryData?.__createdValue;
        return (
          <TypeaheadItem
            item={
              typeof createdValue === 'string'
                ? {
                    ...item,
                    label: t('general.CreateValue', { value: createdValue }),
                  }
                : item
            }
          />
        );
      }}
      // See the Q-31 block above — the separator keystroke needs the create
      // row to already be in `results`, and the source is free to query.
      debounceMs={0}
      hasClear={hasClear}
      maxEntries={maxEntries}
      placeholder={placeholder}
      disabled={disabled}
      width={width}
      {...(rest as object)}
    />
  );
};
