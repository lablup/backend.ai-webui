import { StepNumberInputProps } from '@lablup/ui-common/components/StepNumberInput';
import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIDynamicStepInputNumberProps extends Omit<StepNumberInputProps, 'steps' | 'label' | 'isDisabled' | 'units' | 'value' | 'onChange' | 'className' | 'style'> {
    dynamicSteps?: Array<number>;
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
    /** A unit string, shown in the field. */
    addonAfter?: ReactNode;
    /** Accessible name. Hidden when absent (the field usually sits under one). */
    label?: string;
    /** Accepted and ignored, as before the move. */
    style?: React.CSSProperties;
    /** Accepted and ignored, as before the move. */
    className?: string;
    [key: `data-${string}`]: string | undefined;
}
declare const BAIDynamicStepInputNumber: React.FC<BAIDynamicStepInputNumberProps>;
export default BAIDynamicStepInputNumber;
