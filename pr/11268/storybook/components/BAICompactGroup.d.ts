import { HStackProps } from '@lablup/ui-common/HStack';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAICompactGroupProps extends Omit<HStackProps, 'gap' | 'wrap'> {
    /**
     * antd `Space.Compact` had no equivalent; the group fills its container by
     * default because every call site so far is a full-width form row. Pass a
     * `SizeValue` (or `undefined`) to size it to its content instead.
     */
    width?: HStackProps['width'];
}
declare const BAICompactGroup: React.FC<BAICompactGroupProps>;
export default BAICompactGroup;
