import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
export declare const AstryxNumberStepper: React.FC<AstryxNumberStepperProps>;
/**
 * The next value on a non-linear ladder. Ported verbatim from the `onStep`
 * handlers the two components shared — including the "already exactly on a
 * rung" special case, which is what makes ↑ from `4` land on `8` rather than
 * re-selecting `4`.
 *
 * Returns `null` when the move would leave the ladder; the caller decides what
 * that means (clamp, or carry to the next unit).
 */
export declare const nextLadderIndex: (steps: Array<number>, current: number, direction: StepDirection) => number;
