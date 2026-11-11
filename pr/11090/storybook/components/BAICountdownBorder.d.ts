import { CountdownBorderProps } from '@lablup/ui-common/components/CountdownBorder';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAICountdownBorderProps extends Omit<CountdownBorderProps, 'isAnimated' | 'isPaused'> {
    /** Whether the fill animation runs (and the border is drawn). Defaults to `true`. */
    animated?: boolean;
    /** Freezes the fill and hides the border, e.g. while a refresh is in flight. */
    paused?: boolean;
}
declare const BAICountdownBorder: React.FC<BAICountdownBorderProps>;
export default BAICountdownBorder;
