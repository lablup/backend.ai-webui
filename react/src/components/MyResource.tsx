import { useResourceSlotsDetails } from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import {
  MergedResourceLimits,
  RemainingSlots,
  ResourceAllocation,
  useResourceLimitAndRemaining,
} from '../hooks/useResourceLimitAndRemaining';
import BaseResourceItem, {
  AcceleratorSlotDetail,
  ResourceValues,
} from './BaseResourceItem';
import { Typography } from 'antd';
import { BAICardProps, BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MyResourceProps extends BAICardProps {
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
  const getTotalValue = () => {
    let maxValue;
    maxValue = _.get(
      resourceLimitsWithoutResourceGroup,
      _.includes(['cpu', 'mem'], resource)
        ? [resource, 'max']
        : ['accelerators', resource, 'max'],
    );
    return maxValue;
  };
  const totalValue = getTotalValue();

  const getCurrentValue = () => {
    if (type === 'usage') {
      return _.get(checkPresetInfo?.keypair_using, resource);
    }
    return _.get(
      remainingWithoutResourceGroup,
      _.includes(['cpu', 'mem'], resource)
        ? resource
        : ['accelerators', resource],
    );
  };
  const currentValue = getCurrentValue();

  return {
    current: currentValue || 0,
    total: totalValue,
  };
};

const MyResource: React.FC<MyResourceProps> = ({
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
          checkPresetInfo ?? null,
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
        checkPresetInfo ?? null,
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
    <BaseResourceItem
      {...props}
      title={
        <BAIFlex gap={'xs'}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            {t('webui.menu.MyResources')}
          </Typography.Title>
        </BAIFlex>
      }
      tooltip={t('webui.menu.MyResourcesDescription')}
      isRefetching={isRefetching || internalIsRefetching}
      displayType={type}
      onDisplayTypeChange={setType}
      onRefetch={refetch}
      getResourceValue={getResourceValueForCard}
      acceleratorSlotsDetails={acceleratorSlotsDetails}
      resourceSlotsDetails={resourceSlotsDetails}
      progressProps={{
        showProgress: true,
        steps: 12,
      }}
    />
  );
};

export default MyResource;
