import { CountdownBorderProps } from '@lablup/ui-common/components/CountdownBorder';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAICountdownBorderProps extends Omit<CountdownBorderProps, 'isAnimated' | 'isPaused'> {
    /** Whether the fill animation runs (and the border is drawn). Defaults to `true`. */
    animated?: boolean;
    /** Freezes the fill and hides the border, e.g. while a refresh is in flight. */
    paused?: boolean;
}
declare const BAICountdownBorder: React.FC<BAICountdownBorderProps>;
export default BAICountdownBorder;
