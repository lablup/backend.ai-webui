import { DeviceMetaData, ImageMetaData } from './types';
import { ReactNode } from '../../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAIMetaDataProviderProps {
    deviceMetaData?: DeviceMetaData;
    imageMetaData?: ImageMetaData;
    /**
     * Base path where the host app serves the icon files referenced by
     * `imageMetaData.imageInfo[].icon` and by a resource slot's `display_icon`
     * (e.g. `resources/icons`). The package never bundles or resolves app asset
     * paths on its own.
     */
    imagePath?: string;
    children?: ReactNode;
}
/**
 * The host app's static metadata (`device_metadata.json`,
 * `image_metadata.json`, icon base path). None of it requires authentication,
 * so the host mounts this at the app root, login screen included.
 *
 * Server-configured slots are a separate, authenticated layer — see
 * `BAIResourceSlotsProvider`.
 */
declare const BAIMetaDataProvider: ({ deviceMetaData, imageMetaData, imagePath, children, }: BAIMetaDataProviderProps) => import("react").JSX.Element;
export default BAIMetaDataProvider;
