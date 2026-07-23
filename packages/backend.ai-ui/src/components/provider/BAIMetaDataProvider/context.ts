import type { DeviceMetaData, ImageMetaData } from './types';
import { createContext } from 'react';

export type BAIMetaDataContextValue = {
  deviceMetaData: DeviceMetaData | undefined;
  resourceSlotsInRG: DeviceMetaData | undefined;
  mergedResourceSlots: DeviceMetaData | undefined;
  refresh: () => void;
  isLoading: boolean;
};

export const BAIMetaDataContext = createContext<
  BAIMetaDataContextValue | undefined
>(undefined);

export const BAIImageMetaDataContext = createContext<ImageMetaData | undefined>(
  undefined,
);

/**
 * Base path (URL prefix) where the host app serves the image icon files
 * referenced by `image_metadata.json`'s `imageInfo[].icon` (e.g.
 * `resources/icons`). Combined with the icon filename by
 * `useBAIImageMetaData`'s `getImageIcon` helper.
 */
export const BAIImagePathContext = createContext<string | undefined>(undefined);
