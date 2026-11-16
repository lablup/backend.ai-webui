import { ProgressWithLabelProps } from '@lablup/ui-common/components/ProgressWithLabel';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAIProgressWithLabelProps extends Pick<ProgressWithLabelProps, 'valueLabel' | 'width' | 'labelStyle'> {
    /** Whether the value label shows; its space stays reserved. */
    showInfo?: boolean;
    title?: React.ReactNode;
    percent?: number;
    strokeColor?: string;
    progressStyle?: React.CSSProperties;
    size?: 'small' | 'middle' | 'large';
}
declare const BAIProgressWithLabel: React.FC<BAIProgressWithLabelProps>;
export default BAIProgressWithLabel;
