import type { DeviceMetaData, ImageMetaData } from './types';
import { createContext } from 'react';

/** Static device metadata bundled with the host app (`device_metadata.json`). */
export const BAIDeviceMetaDataContext = createContext<
  DeviceMetaData | undefined
>(undefined);

export type BAIResourceSlotsContextValue = {
  /** Slots as the server reported them. */
  resourceSlots: DeviceMetaData | undefined;
  /** Server slots layered over the static device metadata. */
  mergedResourceSlots: DeviceMetaData;
};

/** Server-configured resource slots; see `BAIResourceSlotsProvider`. */
export const BAIResourceSlotsContext = createContext<
  BAIResourceSlotsContextValue | undefined
>(undefined);

export const BAIImageMetaDataContext = createContext<ImageMetaData | undefined>(
  undefined,
);

/**
 * Base path where the host app serves icon files — those named by
 * `image_metadata.json`'s `imageInfo[].icon` and by a resource slot's
 * `display_icon` (e.g. `resources/icons`).
 */
export const BAIImagePathContext = createContext<string | undefined>(undefined);
