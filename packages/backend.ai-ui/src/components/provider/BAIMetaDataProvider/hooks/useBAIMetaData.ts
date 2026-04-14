import { BAIMetaDataContext } from '../context';
import { useContext } from 'react';

/**
 * Returns all resource slot metadata from the BAIMetaDataProvider context.
 * - `deviceMetaData`: raw static device metadata from `resources/device_metadata.json`
 * - `resourceSlotsInRG`: server-side resource slots scoped to the current resource group only
 *   when the provider was created with a resource group name; otherwise this may contain
 *   unscoped or all-group resource slot data
 * - `mergedResourceSlots`: merged result of the above two sources (always a defined object)
 * - `refresh`: re-fetches resource slot details
 * - `isLoading`: whether the resource slot details are currently loading
 */
const useBAIMetaData = () => {
  'use memo';
  const context = useContext(BAIMetaDataContext);
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
