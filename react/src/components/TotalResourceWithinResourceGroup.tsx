import {
  TotalResourceWithinResourceGroupFragment$key,
  TotalResourceWithinResourceGroupFragment$data,
} from '../__generated__/TotalResourceWithinResourceGroupFragment.graphql';
import {
  processResourceValue,
  UNLIMITED_VALUES,
} from '../helper/resourceCardUtils';
import { useResourceSlotsDetails } from '../hooks/backendai';
import BaseResourceItem, {
  AcceleratorSlotDetail,
  ResourceValues,
} from './BaseResourceItem';
import ResourceGroupSelectForCurrentProject from './ResourceGroupSelectForCurrentProject';
import { Typography } from 'antd';
import {
  BAIFlex,
  BAICardProps,
  subNumberWithUnits,
  addNumberWithUnits,
} from 'backend.ai-ui';
import _ from 'lodash';
import {
  useCallback,
  useMemo,
  useState,
  useTransition,
  useDeferredValue,
  useEffect,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

interface TotalResourceWithinResourceGroupProps extends BAICardProps {
  queryRef: TotalResourceWithinResourceGroupFragment$key;
  isRefetching?: boolean;
}

type AgentSummary = NonNullable<
  TotalResourceWithinResourceGroupFragment$data['agent_summary_list']
>['items'][number];

const TotalResourceWithinResourceGroup: React.FC<
  TotalResourceWithinResourceGroupProps
> = ({ queryRef, isRefetching, ...props }) => {
  const { t } = useTranslation();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [selectedResourceGroup, setSelectedResourceGroup] = useState<string>();
  const deferredSelectedResourceGroup = useDeferredValue(selectedResourceGroup);

  const [data, refetch] = useRefetchableFragment(
    graphql`
      fragment TotalResourceWithinResourceGroupFragment on Queries
      @argumentDefinitions(resourceGroup: { type: "String" })
      @refetchable(
        queryName: "TotalResourceWithinResourceGroupFragmentRefetchQuery"
      ) {
        agent_summary_list(
          limit: 1000
          offset: 0
          status: "ALIVE"
          scaling_group: $resourceGroup
          filter: "schedulable == true"
        ) {
          items {
            id
            status
            available_slots
            occupied_slots
            scaling_group
          }
          total_count
        }
      }
    `,
    queryRef,
  );

  const resourceSlotsDetails = useResourceSlotsDetails();
  const [type, setType] = useState<'usage' | 'remaining'>('usage');

  useEffect(() => {
    if (deferredSelectedResourceGroup) {
      refetch({
        resourceGroup: deferredSelectedResourceGroup,
      });
    }
  }, [deferredSelectedResourceGroup, refetch]);

  const getResourceValue = (
    type: 'usage' | 'remaining',
    resource: string,
    totalOccupied: number,
    totalAvailable: number,
  ): ResourceValues => {
    const getCurrentValue = () => {
      if (type === 'usage') {
        return processResourceValue(totalOccupied, resource);
      }
      const remaining = subNumberWithUnits(
        _.toString(totalAvailable),
        _.toString(totalOccupied),
        '',
      );
      return processResourceValue(remaining, resource);
    };

    const getTotalValue = () => {
      return processResourceValue(totalAvailable, resource);
    };

    return {
      current: getCurrentValue() || 0,
      total: getTotalValue(),
    };
  };

  const { acceleratorSlotsDetails, totalOccupiedSlots, totalAvailableSlots } =
    useMemo(() => {
      const agents = data.agent_summary_list?.items || [];

      const totalOccupiedSlots: Record<string, number> = {};
      const totalAvailableSlots: Record<string, number> = {};

      _.forEach(agents as AgentSummary[], (agent) => {
        if (!agent) return;
        const occupiedSlots = JSON.parse(agent.occupied_slots || '{}');
        const availableSlots = JSON.parse(agent.available_slots || '{}');

        _.forEach(occupiedSlots, (value, key) => {
          totalOccupiedSlots[key] = _.toNumber(
            addNumberWithUnits(
              _.toString(totalOccupiedSlots[key] || 0),
              _.toString(value),
              '',
            ),
          );
        });

        _.forEach(availableSlots, (value, key) => {
          totalAvailableSlots[key] = _.toNumber(
            addNumberWithUnits(
              _.toString(totalAvailableSlots[key] || 0),
              _.toString(value),
              '',
            ),
          );
        });
      });

      const accelerators: AcceleratorSlotDetail[] = _.chain(
        resourceSlotsDetails?.resourceSlotsInRG,
      )
        .omit(['cpu', 'mem'])
        .map((resourceSlot, key) => ({
          key,
          resourceSlot,
          values: getResourceValue(
            type,
            key,
            totalOccupiedSlots[key] || 0,
            totalAvailableSlots[key] || 0,
          ),
        }))
        .filter((item) => Boolean(item.resourceSlot))
        .value() as AcceleratorSlotDetail[];

      return {
        acceleratorSlotsDetails: accelerators,
        totalOccupiedSlots,
        totalAvailableSlots,
      };
    }, [data, type, resourceSlotsDetails]);

  const getResourceValueForCard = useCallback(
    (resource: string) =>
      getResourceValue(
        type,
        resource,
        totalOccupiedSlots[resource] || 0,
        totalAvailableSlots[resource] || 0,
      ),
    [type, totalOccupiedSlots, totalAvailableSlots],
  );

  const title = (
    <BAIFlex gap={'xs'}>
      <Typography.Title level={5} style={{ margin: 0 }}>
        {t('webui.menu.TotalResourcesIn')}
      </Typography.Title>
      <ResourceGroupSelectForCurrentProject
        showSearch
        style={{ minWidth: 100 }}
        onChange={(v) => setSelectedResourceGroup(v)}
        loading={selectedResourceGroup !== deferredSelectedResourceGroup}
        popupMatchSelectWidth={false}
        tooltip={t('general.ResourceGroup')}
      />
    </BAIFlex>
  );

  const handleRefetch = () => {
    startRefetchTransition(() => {
      refetch(
        {
          resourceGroup: deferredSelectedResourceGroup,
        },
        {
          fetchPolicy: 'network-only',
        },
      );
    });
  };

  return (
    <BaseResourceItem
      {...props}
      title={title}
      tooltip="webui.menu.TotalResourcesInResourceGroupDescription"
      isRefetching={isRefetching || isPendingRefetch}
      displayType={type}
      onDisplayTypeChange={setType}
      onRefetch={handleRefetch}
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

export default TotalResourceWithinResourceGroup;
