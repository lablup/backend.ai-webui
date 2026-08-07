/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import type { RadioGroupProps } from 'antd';
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
 * PILOT-DECISION: the deleted `createStyles` block and the `ConfigProvider`
 * component-token override existed solely to tint antd's checked radio button
 * with `rgba(colorPrimary, .15/.30)`. Astryx's SegmentedControl renders its own
 * selected treatment from theme tokens; the alpha-tint override is dropped
 * rather than re-implemented. Needs a design call before rollout.
 */
export interface BAIRadioGroupProps extends Pick<
  RadioGroupProps,
  'value' | 'onChange' | 'className'
> {
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
        onChange?.({
          target: { value: next },
        } as Parameters<NonNullable<RadioGroupProps['onChange']>>[0]);
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
