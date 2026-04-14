import { BAIDeviceMetaDataContext } from '../context';
import { useContext } from 'react';

/**
 * Returns all resource slot metadata from the BAIMetaDataProvider context.
 * - `deviceMetaData`: raw static device metadata from `resources/device_metadata.json`
 * - `resourceSlotsInRG`: server-side resource slots for the current resource group
 * - `mergedResourceSlots`: merged result of the above two (always a defined object)
 * - `refresh`: re-fetches resource slot details
 * - `isLoading`: whether the resource slot details are currently loading
 */
const useBAIMetaData = () => {
  const context = useContext(BAIDeviceMetaDataContext);
  if (!context) {
    throw new Error('useBAIMetaData must be used within a BAIMetaDataProvider');
  }
  return {
    deviceMetaData: context.deviceMetaData,
    resourceSlotsInRG: context.resourceSlotsInRG,
    mergedResourceSlots: context.mergedResourceSlots ?? {},
    refresh: context.refresh,
    isLoading: context.isLoading,
  };
};

export default useBAIMetaData;
