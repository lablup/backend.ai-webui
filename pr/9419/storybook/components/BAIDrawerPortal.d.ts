import { DrawerProps } from '@astryxdesign/lab';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/** Everything lab `Drawer` takes; the portal owns the scrim, so not `hasScrim`
    — nor the collapse-to-rail pair its `hasScrim={false}` silently unlocks. */
export type BAIDrawerPortalProps = Omit<DrawerProps, 'hasScrim' | 'isCollapsed' | 'onCollapsedChange'>;
declare const BAIDrawerPortal: React.FC<BAIDrawerPortalProps>;
export default BAIDrawerPortal;
