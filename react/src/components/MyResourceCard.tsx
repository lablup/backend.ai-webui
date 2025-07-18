import { convertUnitValue } from '../helper';
import {
  processResourceValue,
  UNLIMITED_VALUES,
} from '../helper/resourceCardUtils';
import { useResourceSlotsDetails } from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import {
  MergedResourceLimits,
  RemainingSlots,
  ResourceAllocation,
  useResourceLimitAndRemaining,
} from '../hooks/useResourceLimitAndRemaining';
import BaseResourceCard, {
  AcceleratorSlotDetail,
  ResourceValues,
} from './BaseResourceCard';
import { BAICardProps } from 'backend.ai-ui';
import _ from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MyResourceCardProps extends BAICardProps {
  fetchKey?: string;
  isRefetching?: boolean;
}

const getResourceValue = (
  type: 'usage' | 'remaining',
  resource: string,
  checkPresetInfo: ResourceAllocation | null,
  remainingWithoutResourceGroup: RemainingSlots,
  resourceLimitsWithoutResourceGroup: MergedResourceLimits,
): ResourceValues => {
  const getCurrentValue = () => {
    if (type === 'usage') {
      const value = _.get(checkPresetInfo?.keypair_using, resource);
      return processResourceValue(value, resource, 'auto');
    }

    const remaining = _.get(remainingWithoutResourceGroup, resource);
    if (remaining === Number.MAX_SAFE_INTEGER) return Number.MAX_SAFE_INTEGER;

    return processResourceValue(remaining, resource, 'auto');
  };

  const getTotalValue = () => {
    const maxValue = _.get(
      resourceLimitsWithoutResourceGroup,
      `${resource}.max`,
    );
    const converted = processResourceValue(maxValue, resource, 'auto');
    return _.isNaN(converted) || converted === Number.MAX_SAFE_INTEGER
      ? Number.MAX_SAFE_INTEGER
      : converted;
  };

  const totalValue = getTotalValue();

  // Get unit from total value for memory resources
  const getUnitForResource = () => {
    if (resource === 'mem' && totalValue !== Number.MAX_SAFE_INTEGER) {
      return convertUnitValue(_.toString(totalValue), 'auto')?.unit || 'g';
    }
    return 'auto';
  };

  const unit = getUnitForResource();

  return {
    current: getCurrentValue(),
    total: totalValue,
    unit: resource === 'mem' ? unit : undefined,
  };
};

const MyResourceCard: React.FC<MyResourceCardProps> = ({
  fetchKey,
  isRefetching,
  ...props
}) => {
  const { t } = useTranslation();

  const currentProject = useCurrentProjectValue();
  const [
    {
      checkPresetInfo,
      resourceLimitsWithoutResourceGroup,
      remainingWithoutResourceGroup,
      isRefetching: internalIsRefetching,
    },
    { refetch },
  ] = useResourceLimitAndRemaining({
    currentProjectName: currentProject.name,
    ignorePerContainerConfig: true,
    fetchKey,
  });

  const resourceSlotsDetails = useResourceSlotsDetails();
  const [type, setType] = useState<'usage' | 'remaining'>('usage');

  const acceleratorSlotsDetails = useMemo(() => {
    return _.chain(resourceSlotsDetails?.resourceSlotsInRG)
      .omit(['cpu', 'mem'])
      .map((resourceSlot, key) => ({
        key,
        resourceSlot,
        values: getResourceValue(
          type,
          key,
          checkPresetInfo,
          remainingWithoutResourceGroup,
          resourceLimitsWithoutResourceGroup,
        ),
      }))
      .filter((item) => Boolean(item.resourceSlot))
      .value() as AcceleratorSlotDetail[];
  }, [
    resourceSlotsDetails,
    type,
    checkPresetInfo,
    remainingWithoutResourceGroup,
    resourceLimitsWithoutResourceGroup,
  ]);

  const getResourceValueForCard = useCallback(
    (resource: string) =>
      getResourceValue(
        type,
        resource,
        checkPresetInfo,
        remainingWithoutResourceGroup,
        resourceLimitsWithoutResourceGroup,
      ),
    [
      type,
      checkPresetInfo,
      remainingWithoutResourceGroup,
      resourceLimitsWithoutResourceGroup,
    ],
  );

  return (
    <BaseResourceCard
      {...props}
      title={t('webui.menu.MyResources')}
      tooltipKey="webui.menu.MyResourcesDescription"
      isRefetching={isRefetching || internalIsRefetching}
      displayType={type}
      onDisplayTypeChange={setType}
      onRefetch={refetch}
      getResourceValue={getResourceValueForCard}
      acceleratorSlotsDetails={acceleratorSlotsDetails}
      resourceSlotsDetails={resourceSlotsDetails}
      progressProps={{
        showProgress: true,
        unlimitedValues: UNLIMITED_VALUES,
        steps: 12,
      }}
    />
  );
};

export default MyResourceCard;
