import { convertToBinaryUnit } from '../helper';
import { getBaseUnit } from '../helper/resourceCardUtils';
import { useResourceSlotsDetails } from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import {
  ResourceAllocation,
  useResourceLimitAndRemaining,
} from '../hooks/useResourceLimitAndRemaining';
import BaseResourceCard, {
  AcceleratorSlotDetail,
  ResourceValues,
} from './BaseResourceCard';
import ResourceGroupSelectForCurrentProject from './ResourceGroupSelectForCurrentProject';
import { Typography } from 'antd';
import { Flex, BAICardProps } from 'backend.ai-ui';
import _ from 'lodash';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MyResourceWithinResourceGroupCardProps extends BAICardProps {
  fetchKey?: string;
  isRefetching?: boolean;
}

const getResourceValue = (
  type: 'usage' | 'capacity',
  resource: string,
  checkPresetInfo: ResourceAllocation | null,
  resourceGroup: string,
): ResourceValues => {
  const getCurrentValue = () => {
    if (type === 'usage') {
      const value = _.get(
        checkPresetInfo?.scaling_groups?.[resourceGroup]?.using,
        resource,
      );

      if (resource === 'mem') {
        const converted = convertToBinaryUnit(value, getBaseUnit(value));
        return _.toNumber(converted?.numberFixed);
      }

      return _.toNumber(value);
    }

    const remaining = _.get(
      checkPresetInfo?.scaling_groups?.[resourceGroup]?.remaining,
      resource,
    );
    if (remaining === Number.MAX_SAFE_INTEGER) return Number.MAX_SAFE_INTEGER;

    if (resource === 'mem') {
      const converted = convertToBinaryUnit(remaining, getBaseUnit(remaining));
      return _.toNumber(converted?.numberFixed);
    }

    return _.toNumber(remaining);
  };

  return {
    current: getCurrentValue(),
  };
};

const MyResourceWithinResourceGroupCard: React.FC<
  MyResourceWithinResourceGroupCardProps
> = ({ fetchKey, isRefetching, ...props }) => {
  const { t } = useTranslation();

  const currentProject = useCurrentProjectValue();
  const [selectedResourceGroup, setSelectedResourceGroup] = useState<string>();
  const deferredSelectedResourceGroup = useDeferredValue(selectedResourceGroup);

  const [{ checkPresetInfo, isRefetching: internalIsRefetching }, { refetch }] =
    useResourceLimitAndRemaining({
      currentProjectName: currentProject.name,
      currentResourceGroup: deferredSelectedResourceGroup || 'default',
      fetchKey,
    });

  const resourceSlotsDetails = useResourceSlotsDetails(
    deferredSelectedResourceGroup || 'default',
  );
  const [displayType, setDisplayType] = useState<'usage' | 'capacity'>('usage');

  const acceleratorSlotsDetails = useMemo(() => {
    return _.chain(resourceSlotsDetails?.resourceSlotsInRG)
      .omit(['cpu', 'mem'])
      .map((resourceSlot, key) => ({
        key,
        resourceSlot,
        values: getResourceValue(
          displayType,
          key,
          checkPresetInfo,
          deferredSelectedResourceGroup || 'default',
        ),
      }))
      .filter((item) => Boolean(item.resourceSlot))
      .value() as AcceleratorSlotDetail[];
  }, [
    resourceSlotsDetails,
    displayType,
    checkPresetInfo,
    deferredSelectedResourceGroup,
  ]);

  const getResourceValueForCard = useCallback(
    (resource: string) =>
      getResourceValue(
        displayType,
        resource,
        checkPresetInfo,
        deferredSelectedResourceGroup || 'default',
      ),
    [displayType, checkPresetInfo, deferredSelectedResourceGroup],
  );

  const title = (
    <Flex gap={'xs'}>
      <Typography.Title level={5} style={{ margin: 0 }}>
        {t('webui.menu.MyResourcesIn')}
      </Typography.Title>
      <ResourceGroupSelectForCurrentProject
        showSearch
        style={{ minWidth: 100 }}
        onChange={(v) => setSelectedResourceGroup(v)}
        loading={selectedResourceGroup !== deferredSelectedResourceGroup}
        popupMatchSelectWidth={false}
        tooltip={t('general.ResourceGroup')}
      />
    </Flex>
  );

  return (
    <BaseResourceCard
      {...props}
      title={title}
      tooltipKey="webui.menu.MyResourcesInResourceGroupDescription"
      isRefetching={isRefetching || internalIsRefetching}
      displayType={displayType}
      onDisplayTypeChange={setDisplayType}
      onRefetch={refetch}
      getResourceValue={getResourceValueForCard}
      acceleratorSlotsDetails={acceleratorSlotsDetails}
      resourceSlotsDetails={resourceSlotsDetails}
      progressProps={{
        showProgress: false,
      }}
    />
  );
};

export default MyResourceWithinResourceGroupCard;
