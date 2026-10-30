import { DrawerProps } from '@lablup/ui-common/Drawer';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
/** Everything lab `Drawer` takes; the portal owns the scrim, so not `hasScrim`. */
export type BAIDrawerPortalProps = Omit<DrawerProps, 'hasScrim'>;
declare const BAIDrawerPortal: React.FC<BAIDrawerPortalProps>;
export default BAIDrawerPortal;
