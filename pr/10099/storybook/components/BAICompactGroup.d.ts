import { HStackProps } from '@astryxdesign/core/HStack';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
