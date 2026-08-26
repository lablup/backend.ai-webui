/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Dynamic-step controls for the Astryx number inputs
 (to-astryx phase 3, wave 2 / ticket W2-D).

 ## Why this module exists

 `BAIDynamicStepInputNumber` and `BAIDynamicUnitInputNumber` are not "number
 inputs with a step" — their whole substance is a NON-LINEAR step ladder
 (`1, 2, 4, 8, 16, …`, plus a unit carry in the unit variant).

 `NumberInput hasNumberSteppers` cannot express that, and the limit is
 structural rather than a missing convenience (re-checked against core 0.5.0,
 FR-3688):

   - `getSteppedValue` snaps to a grid anchored at `min` (`stepBase + n*step`),
     so no single `step` gives 8 -> 16 going up and 8 -> 4 going down;
   - the built-in buttons call the internal `stepValue(±1)` directly, so unlike
     the keyboard path they never reach the consumer's `onKeyDown` and cannot be
     intercepted;
   - there is no `onStep` prop, and `onChange` alone cannot be told apart from
     a typed edit.

 So the ladder keeps explicit controls, and this module matches the built-in
 stepper's DESIGN instead: the same 16px column, the same chevron glyph rotated
 for the increment half, the same hairline between the halves, and the same
 icon/overlay tokens (`NumberInput.tsx` `styles.numberSteppers` /
 `numberStepperButton` / `decrementButton`). Metrics live in the co-located CSS.

 One deliberate delta: Astryx's buttons re-focus the input after stepping; these
 only suppress the focus move, because the input they belong to is the caller's.
*/
import './astryxNumberStepper.css';
import { Icon } from '@astryxdesign/core/Icon';
import { InputGroupText } from '@astryxdesign/core/InputGroup';
import React from 'react';

export type StepDirection = 'up' | 'down';

export interface AstryxNumberStepperProps {
  onStep: (direction: StepDirection) => void;
  isDisabled?: boolean;
  /** Accessible names — required by Astryx, supplied by the owning component. */
  increaseLabel: string;
  decreaseLabel: string;
}

/**
 * The up/down pair that replaces antd `InputNumber`'s built-in spinner.
 * REQUIRES an `InputGroup` ancestor — `InputGroupText` is what welds the column
 * to the field, and outside a group it is a stray bordered box.
 */
export const AstryxNumberStepper: React.FC<AstryxNumberStepperProps> = ({
  onStep,
  isDisabled,
  increaseLabel,
  decreaseLabel,
}) => (
  <InputGroupText className="bai-number-stepper">
    <button
      type="button"
      // Not a tab stop, and a click must not pull focus out of the field —
      // both mirror the built-in stepper.
      tabIndex={-1}
      className="bai-number-stepper__button bai-number-stepper__button--increase"
      aria-label={increaseLabel}
      disabled={isDisabled}
      onPointerDown={(event) => event.preventDefault()}
      onClick={() => onStep('up')}
    >
      <Icon icon="chevronDown" size="xsm" color="inherit" />
    </button>
    <button
      type="button"
      tabIndex={-1}
      className="bai-number-stepper__button bai-number-stepper__button--decrease"
      aria-label={decreaseLabel}
      disabled={isDisabled}
      onPointerDown={(event) => event.preventDefault()}
      onClick={() => onStep('down')}
    >
      <Icon icon="chevronDown" size="xsm" color="inherit" />
    </button>
  </InputGroupText>
);

/**
 * The next value on a non-linear ladder. Ported verbatim from the `onStep`
 * handlers the two components shared — including the "already exactly on a
 * rung" special case, which is what makes ↑ from `4` land on `8` rather than
 * re-selecting `4`.
 *
 * Returns `null` when the move would leave the ladder; the caller decides what
 * that means (clamp, or carry to the next unit).
 */
export const nextLadderIndex = (
  steps: Array<number>,
  current: number,
  direction: StepDirection,
): number => {
  const sorted = [...steps].sort((a, b) => a - b);
  let index = 0;
  while (index < sorted.length && sorted[index] < current) index += 1;
  if (direction === 'up') {
    return current === sorted[index] ? index + 1 : index;
  }
  return index - 1;
};
