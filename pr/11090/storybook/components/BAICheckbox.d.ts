import { default as React, ChangeEvent, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAICheckboxProps {
    /** antd's name; `Form.Item valuePropName="checked"` injects this. */
    checked?: boolean;
    /** antd's default `valuePropName`. */
    value?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    /** antd rendered `children` as the inline label. */
    children?: ReactNode;
    /** Explicit accessible name, when there is no visible inline label. */
    label?: string;
    /** Hide the inline label but keep it as the accessible name. */
    isLabelHidden?: boolean;
    /** Box size; `sm` for dense grids. */
    size?: 'sm' | 'md';
    onChange?: (checked: boolean, e: ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    style?: React.CSSProperties;
    [key: `data-${string}`]: string | undefined;
}
declare const BAICheckbox: React.FC<BAICheckboxProps>;
export default BAICheckbox;
