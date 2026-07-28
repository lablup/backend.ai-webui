import { BAIDeviceMetaDataContext, BAIResourceSlotsContext } from '../context';
import type { DeviceMetaData } from '../types';
import { use } from 'react';

const EMPTY_RESOURCE_SLOTS: DeviceMetaData = Object.freeze({});

/**
 * Resource slot metadata from `BAIMetaDataProvider` and
 * `BAIResourceSlotsProvider`.
 *
 * `mergedResourceSlots` is always defined. Outside `BAIResourceSlotsProvider`
 * — anonymous routes, Storybook — it holds the static metadata alone rather
 * than throwing, matching `useBAIImageMetaData`.
 */
const useBAIResourceSlots = () => {
  'use memo';
  const deviceMetaData = use(BAIDeviceMetaDataContext);
  const resourceSlots = use(BAIResourceSlotsContext);

  return {
    deviceMetaData,
    resourceSlots: resourceSlots?.resourceSlots,
    mergedResourceSlots:
      resourceSlots?.mergedResourceSlots ??
      deviceMetaData ??
      EMPTY_RESOURCE_SLOTS,
  };
};

export default useBAIResourceSlots;
