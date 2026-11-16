import { DoubleTokenProps, DoubleTokenValue } from '@lablup/ui-common/components/DoubleToken';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export type BAIDoubleTokenValue = DoubleTokenValue & {
    /** Appends the shared copy control (`BAIText copyable`) to this segment. */
    copyable?: boolean;
};
export interface BAIDoubleTokenProps extends Omit<DoubleTokenProps, 'values'> {
    values?: Array<string> | Array<BAIDoubleTokenValue>;
}
declare const BAIDoubleToken: React.FC<BAIDoubleTokenProps>;
export default BAIDoubleToken;
