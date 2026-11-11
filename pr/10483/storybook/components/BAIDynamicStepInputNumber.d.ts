import { StepNumberInputProps } from '@lablup/ui-common/components/StepNumberInput';
import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
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
