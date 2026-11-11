import { DoubleTokenProps, DoubleTokenValue } from '@lablup/ui-common/components/DoubleToken';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export type BAIDoubleTokenValue = DoubleTokenValue & {
    /** Appends the shared copy control (`BAIText copyable`) to this segment. */
    copyable?: boolean;
};
export interface BAIDoubleTokenProps extends Omit<DoubleTokenProps, 'values'> {
    values?: Array<string> | Array<BAIDoubleTokenValue>;
}
declare const BAIDoubleToken: React.FC<BAIDoubleTokenProps>;
export default BAIDoubleToken;
