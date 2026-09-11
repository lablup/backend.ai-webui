import { default as React, ChangeEvent, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
    onChange?: (checked: boolean, e: ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    style?: React.CSSProperties;
    [key: `data-${string}`]: string | undefined;
}
declare const BAICheckbox: React.FC<BAICheckboxProps>;
export default BAICheckbox;
