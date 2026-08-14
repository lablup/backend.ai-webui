/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Dynamic-step controls for the Astryx number inputs
 (to-astryx phase 3, wave 2 / ticket W2-D).

 ## Why this module exists

 `BAIDynamicStepInputNumber` and `BAIDynamicUnitInputNumber` are not "number
 inputs with a step" — their whole substance is a NON-LINEAR step ladder
 (`1, 2, 4, 8, 16, …`, plus a unit carry in the unit variant). Astryx
 `NumberInput` exposes no `onStep` hook (MAPPING §3.17), and every stepping
 affordance it does have — keyboard, wheel, its opt-in trailing buttons — is
 LINEAR by `step`, which would silently replace the ladder. So the ladder gets
 explicit controls: two `IconButton`s drive `onStep('up' | 'down')`, and the
 owning components cancel the built-in ArrowUp/ArrowDown step in `onKeyDown`.
 The ladder arithmetic itself is ported unchanged from each component — this
 module owns only the affordance.

 (Until Astryx 0.4.0 the field was a native `<input type="number">` whose
 browser spinner also had to be suppressed in a co-located CSS file; 0.4.0's
 text-backed spinbutton, astryx#4896, renders no native spinner, so the CSS
 is gone.)
*/
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
