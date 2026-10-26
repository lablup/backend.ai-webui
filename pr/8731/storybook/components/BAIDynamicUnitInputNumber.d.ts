import { default as React, CSSProperties, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIDynamicUnitInputNumberProps {
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
