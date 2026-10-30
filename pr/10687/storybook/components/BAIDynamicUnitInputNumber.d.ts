import { BAINumberInputProps } from './BAINumberInput';
import { default as React, CSSProperties, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAIDynamicUnitInputNumberProps extends Omit<BAINumberInputProps, 'ref' | 'value' | 'onChange' | 'min' | 'max' | 'units' | 'size' | 'label' | 'isDisabled' | 'width' | 'onBlur' | 'onKeyDown'> {
    dynamicSteps?: Array<number>;
    disableAutoUnit?: boolean;
    max?: string;
    min?: string;
    value?: string | null | undefined;
    units?: Array<string>;
    roundStep?: number;
    onChange?: (value: string) => void;
    addonPrefix?: ReactNode;
    addonSuffix?: ReactNode;
    defaultUnit?: string;
    disabled?: boolean;
    placeholder?: string;
    /** antd's `SizeType`, kept for the call sites that already pass it. */
    size?: 'small' | 'middle' | 'large';
    /** Accessible name. Hidden when absent (the field usually sits under one). */
    label?: string;
    isLabelHidden?: boolean;
    style?: CSSProperties;
    className?: string;
    [key: `data-${string}`]: string | undefined;
}
declare const BAIDynamicUnitInputNumber: React.FC<BAIDynamicUnitInputNumberProps>;
export default BAIDynamicUnitInputNumber;
