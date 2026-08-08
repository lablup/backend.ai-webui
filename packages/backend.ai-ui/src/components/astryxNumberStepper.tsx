/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Dynamic-step controls for the Astryx number inputs
 (to-astryx phase 3, wave 2 / ticket W2-D).

 ## Why this module exists

 `BAIDynamicStepInputNumber` and `BAIDynamicUnitInputNumber` are not "number
 inputs with a step" — their whole substance is a NON-LINEAR step ladder
 (`1, 2, 4, 8, 16, …`, plus a unit carry in the unit variant). antd gave them
 the hook they needed: `InputNumber onStep(afterValue, {type})` fires when the
 user clicks a spinner arrow or presses ↑/↓, and `step={0}` neutralised antd's
 own arithmetic so the handler alone decided the next value.

 MAPPING §3.17 records the gap bluntly: **`onStep` -> NONE. Astryx
 `NumberInput` has `onChange` and nothing else.** Its field is a native
 `<input type="number">`, so the browser's own spinner is still there and steps
 by `step` — i.e. leaving it in place would silently replace the step ladder
 with linear arithmetic. That is the P10 shape (a behaviour antd rendered and
 Astryx does not), and it is invisible to `tsc`.

 So the ladder gets explicit controls: the native spinner is suppressed in CSS
 and two `IconButton`s drive `onStep('up' | 'down')`. The ladder arithmetic
 itself is ported unchanged from each component — this module owns only the
 affordance.

 SCOPED CSS JUSTIFICATION (`astryxNumberStepper.css`, imported by this module
 per P17): the rules hide `::-webkit-*-spin-button` / Firefox's
 `-moz-appearance` on the input inside `.bai-number-stepper`. They target
 native pseudo-elements of `input[type=number]`, never a design-system class,
 so an Astryx bump cannot break them. Astryx exposes no prop to suppress the
 native spinner.
*/
import './astryxNumberStepper.css';
import { IconButton } from '@astryxdesign/core/IconButton';
import { VStack } from '@astryxdesign/core/Stack';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
 * Render it as a sibling of the `NumberInput` inside the same `InputGroup`.
 */
export const AstryxNumberStepper: React.FC<AstryxNumberStepperProps> = ({
  onStep,
  isDisabled,
  increaseLabel,
  decreaseLabel,
}) => (
  <VStack gap={0} align="center" justify="center">
    <IconButton
      variant="ghost"
      size="sm"
      icon={<ChevronUp size="1em" />}
      label={increaseLabel}
      isDisabled={isDisabled}
      onClick={() => onStep('up')}
    />
    <IconButton
      variant="ghost"
      size="sm"
      icon={<ChevronDown size="1em" />}
      label={decreaseLabel}
      isDisabled={isDisabled}
      onClick={() => onStep('down')}
    />
  </VStack>
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
