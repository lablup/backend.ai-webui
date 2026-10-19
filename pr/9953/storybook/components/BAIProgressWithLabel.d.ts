import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIProgressWithLabelProps {
    /**
     * antd's `showInfo` — the only `ProgressProps` key any call site passes
     * (measured across 44 sites in 7 files). The rest of antd's `ProgressProps`
     * described a control this component never rendered: it draws its own fill
     * bar, so `type`, `steps`, `strokeLinecap`, `trailColor`, `format` and
     * friends were all inert. Restating just this key is what drops the module
     * out of the antd import graph (P15).
     */
    showInfo?: boolean;
    title?: React.ReactNode;
    valueLabel?: React.ReactNode;
    percent?: number;
    width?: React.CSSProperties['width'];
    strokeColor?: string;
    labelStyle?: React.CSSProperties;
    progressStyle?: React.CSSProperties;
    size?: 'small' | 'middle' | 'large';
}
declare const BAIProgressWithLabel: React.FC<BAIProgressWithLabelProps>;
export default BAIProgressWithLabel;
