import { ProgressWithLabelProps } from '@lablup/ui-common/components/ProgressWithLabel';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
