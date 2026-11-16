import { DeviceMetaData, ImageMetaData } from './types';
/** Static device metadata bundled with the host app (`device_metadata.json`). */
export declare const BAIDeviceMetaDataContext: import('../../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react').Context<DeviceMetaData | undefined>;
export type BAIResourceSlotsContextValue = {
    /** Slots as the server reported them. */
    resourceSlots: DeviceMetaData | undefined;
    /** Server slots layered over the static device metadata. */
    mergedResourceSlots: DeviceMetaData;
};
/** Server-configured resource slots; see `BAIResourceSlotsProvider`. */
export declare const BAIResourceSlotsContext: import('../../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react').Context<BAIResourceSlotsContextValue | undefined>;
export declare const BAIImageMetaDataContext: import('../../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react').Context<ImageMetaData | undefined>;
/**
 * Base path where the host app serves icon files — those named by
 * `image_metadata.json`'s `imageInfo[].icon` and by a resource slot's
 * `display_icon` (e.g. `resources/icons`).
 */
export declare const BAIImagePathContext: import('../../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react').Context<string | undefined>;
