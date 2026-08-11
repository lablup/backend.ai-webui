/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIUncontrolledInput` on Astryx (to-astryx phase 3, wave 2 / ticket W2-D).

 antd `Input` -> Astryx `TextInput`, and `type="number"` -> `NumberInput`
 (MAPPING §3.6 / §3.17). The public contract (`defaultValue` + `onCommit` on
 Enter/blur) is unchanged; 16 call sites in 5 files keep working.

 PILOT-DECISION — **"uncontrolled" is now local state, because Astryx has no
 uncontrolled mode.** `TextInput.value` is REQUIRED and non-nullable (contract
 3 / P4) and there is no `defaultValue`. So the component holds the draft in a
 `useState` seeded from `defaultValue`, and the `key={defaultValue}` remount
 that already reset it on an external change now also reseeds that state. The
 OBSERVABLE contract is identical — `onCommit` still fires only on Enter or
 blur, never per keystroke, which is the whole point of the component.

 PILOT-DECISION — **the ⏎ hint icon is dropped.** antd let an arbitrary node
 sit in `suffix`; Astryx `TextInput` has no suffix slot at all (MAPPING §3.6
 routes `suffix` to `InputGroup`, which welds a permanent adjacent box — much
 heavier than a hint that only appeared while focused). The behaviour it
 advertised is unchanged and now runs on Astryx's own `onEnter`.
 `BAIUncontrolledInput.css` goes with it: its only rules hid the native number
 spinner on `input[type=number]`, and the number branch is a `NumberInput`
 which owns its own stepper (P6 — a selector that matches nothing must go).

 PILOT-DECISION — **`label` is required by Astryx and defaults to hidden.**
 No call site passes one (all 16 sit under an existing `Form.Item` /
 `BAIFormItem` / settings row label), so the wrapper accepts an explicit
 `label` and otherwise falls back to the translated `general.Select` with
 `isLabelHidden` — the same policy `BAIButton` and `BAICheckbox` use in this
 ticket. Passing a real `label` is the per-surface copy task (P8).
*/
import { useBAIi18n } from '../hooks/useBAIi18n';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { TextInput } from '@astryxdesign/core/TextInput';
import React, { useState } from 'react';
import type { CSSProperties } from 'react';

export interface BAIUncontrolledInputProps {
  /** Initial value. Changing it remounts the input and discards uncommitted edits. */
  defaultValue?: string;
  /** Called with the current value when the user commits by pressing Enter or blurring. */
  onCommit?: (value: string) => void;
  /** `'number'` routes to Astryx `NumberInput`; everything else to `TextInput`. */
  type?: 'text' | 'number' | 'password' | 'email';
  placeholder?: string;
  disabled?: boolean;
  /** antd's `status`, reshaped onto Astryx's richer `status` object. */
  status?: 'error' | 'warning' | '';
  /** Visible accessible name. Hidden when absent — see the PILOT-DECISION. */
  label?: string;
  isLabelHidden?: boolean;
  style?: CSSProperties;
  className?: string;
  [key: `data-${string}`]: string | undefined;
}

/**
 * An intentionally uncontrolled input that commits its value on Enter or
 * blur — not on every keystroke.
 *
 * `value`/`onChange` are deliberately absent so expensive commit side effects
 * (e.g. persisting to localStorage) go through `onCommit`, which fires only
 * when the user finishes editing.
 */
const BAIUncontrolledInput: React.FC<BAIUncontrolledInputProps> = ({
  defaultValue,
  onCommit,
  type,
  placeholder,
  disabled,
  status,
  label,
  isLabelHidden,
  ...restProps
}) => {
  const { t } = useBAIi18n();
  const [draft, setDraft] = useState(defaultValue ?? '');
  // antd got "changing `defaultValue` discards uncommitted edits" from a
  // `key={defaultValue}` remount. The draft now lives in this component, so
  // the reseed is the render-phase state adjustment React documents for
  // exactly this case (the same pattern `BAIFetchKeyButton` uses) — no effect,
  // no extra commit.
  const [seed, setSeed] = useState(defaultValue);
  if (seed !== defaultValue) {
    setSeed(defaultValue);
    setDraft(defaultValue ?? '');
  }

  const shared = {
    ...restProps,
    label: label ?? t('general.Select'),
    isLabelHidden: isLabelHidden ?? label === undefined,
    placeholder,
    isDisabled: disabled,
    status:
      status === 'error' || status === 'warning' ? { type: status } : undefined,
  } as const;

  const commit = (next: string) => onCommit?.(next);

  if (type === 'number') {
    const numeric = draft === '' ? null : Number(draft);
    return (
      <NumberInput
        {...shared}
        value={Number.isNaN(numeric as number) ? null : numeric}
        onChange={(next) => setDraft(next === null ? '' : String(next))}
        onEnter={() => commit(draft)}
        onBlur={() => commit(draft)}
      />
    );
  }

  return (
    <TextInput
      {...shared}
      type={type === 'password' || type === 'email' ? type : 'text'}
      value={draft}
      onChange={(next) => setDraft(next)}
      onEnter={() => commit(draft)}
      onBlur={() => commit(draft)}
    />
  );
};

export default BAIUncontrolledInput;
