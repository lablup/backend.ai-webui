import {
  BAIDeviceMetaDataContext,
  BAIImageMetaDataContext,
  BAIImagePathContext,
} from './context';
import type { DeviceMetaData, ImageMetaData } from './types';
import type { ReactNode } from 'react';

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
const BAIMetaDataProvider = ({
  deviceMetaData,
  imageMetaData,
  imagePath,
  children,
}: BAIMetaDataProviderProps) => {
  'use memo';
  return (
    <BAIDeviceMetaDataContext.Provider value={deviceMetaData}>
      <BAIImageMetaDataContext.Provider value={imageMetaData}>
        <BAIImagePathContext.Provider value={imagePath}>
          {children}
        </BAIImagePathContext.Provider>
      </BAIImageMetaDataContext.Provider>
    </BAIDeviceMetaDataContext.Provider>
  );
};

export default BAIMetaDataProvider;
