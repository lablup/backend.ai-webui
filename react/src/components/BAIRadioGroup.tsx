/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import React from 'react';

/**
 * PILOT (cn-oss-removal / ticket 10) — rebuilt on Astryx `SegmentedControl`.
 *
 * Every existing call site uses this component in exactly one shape:
 * `optionType="button"` + `buttonStyle="solid"` + an `options` array. That IS
 * a segmented control, so the mapping is semantically exact — Astryx's own
 * docs say "use SegmentedControl, not TabList, when the selection controls a
 * value or mode rather than navigation."
 *
 * The wrapper keeps the antd-shaped PUBLIC contract (`options`, `value`,
 * `onChange(e)` with `e.target.value`) so the 20 call sites in `react/src` do
 * not change. This is the single highest-leverage pattern found in the pilot:
 * Astryx's controlled inputs pass the VALUE to `onChange`, antd passes the
 * EVENT. Absorbing that at the wrapper avoids editing 20 files.
 *
 * PHASE 3 (wave 2 A): the antd `RadioGroupProps` TYPE import is gone too. §6
 * of the mapping is explicit that a type-only antd import is still an antd
 * import and still blocks the zero-antd gate, so the three props this file
 * borrowed (`value`, `onChange`, `className`) and the antd change-event shape
 * `onChange` re-creates are RESTATED locally. The public contract is
 * byte-identical for the 20 call sites — they keep reading `e.target.value`.
 *
 * PILOT-DECISION: the deleted `createStyles` block and the `ConfigProvider`
 * component-token override existed solely to tint antd's checked radio button
 * with `rgba(colorPrimary, .15/.30)`. Astryx's SegmentedControl renders its own
 * selected treatment from theme tokens; the alpha-tint override is dropped
 * rather than re-implemented. Needs a design call before rollout.
 */
/**
 * The subset of antd's radio change event that call sites read. Restated here
 * so the wrapper carries no antd type import.
 */
export interface BAIRadioChangeEvent {
  /* antd typed `RadioGroupProps['value']` as `any`; narrowing it here would
     break the 20 call sites that read `e.target.value` into their own typed
     state. */
  target: { value: any };
}

export interface BAIRadioGroupProps {
  /* `any`, for the reason stated on `BAIRadioChangeEvent` above. */
  value?: any;
  onChange?: (e: BAIRadioChangeEvent) => void;
  className?: string;
  options?: Array<{ label: React.ReactNode; value: string }>;
  /** Accessible name for the group. Astryx requires one (never rendered). */
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /**
   * Accepted and ignored. Every call site passes `optionType="button"` (and
   * some `buttonStyle="solid"`) because that is how antd is told to render a
   * segmented control. Astryx's SegmentedControl IS that rendering, so the
   * props are meaningless — but dropping them from the interface would break
   * 20 unrelated files. Keeping them as inert props is what makes this a
   * one-file change instead of a twenty-file change.
   */
  optionType?: 'button' | 'default';
  buttonStyle?: 'solid' | 'outline';
}

const BAIRadioGroup: React.FC<BAIRadioGroupProps> = ({
  options,
  value,
  onChange,
  label,
  disabled,
  size = 'md',
}) => {
  'use memo';
  return (
    <SegmentedControl
      value={String(value ?? '')}
      label={label ?? 'options'}
      isDisabled={disabled}
      size={size}
      onChange={(next) => {
        // Re-shape Astryx's `(value) => void` back into antd's
        // `(event) => void` so `e.target.value` still works at call sites.
        onChange?.({ target: { value: next } });
      }}
    >
      {options?.map((option) => (
        <SegmentedControlItem
          key={option.value}
          value={option.value}
          label={option.label as string}
        />
      ))}
    </SegmentedControl>
  );
};

export default BAIRadioGroup;
