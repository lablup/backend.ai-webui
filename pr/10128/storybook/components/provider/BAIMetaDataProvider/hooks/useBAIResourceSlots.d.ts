import { DeviceMetaData } from '../types';
/**
 * Resource slot metadata from `BAIMetaDataProvider` and
 * `BAIResourceSlotsProvider`.
 *
 * `mergedResourceSlots` is always defined. Outside `BAIResourceSlotsProvider`
 * — anonymous routes, Storybook — it holds the static metadata alone rather
 * than throwing, matching `useBAIImageMetaData`.
 */
declare const useBAIResourceSlots: () => {
    deviceMetaData: DeviceMetaData | undefined;
    resourceSlots: DeviceMetaData | undefined;
    mergedResourceSlots: DeviceMetaData;
};
export default useBAIResourceSlots;
