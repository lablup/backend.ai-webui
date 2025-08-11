import { TotalResourceWithinResourceGroupFragment$key } from '../__generated__/TotalResourceWithinResourceGroupFragment.graphql';
import {
  processResourceValue,
  UNLIMITED_VALUES,
} from '../helper/resourceCardUtils';
import {
  useCurrentUserRole,
  useResourceSlotsDetails,
} from '../hooks/backendai';
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
import { filterOutNullAndUndefined } from 'src/helper';

interface TotalResourceWithinResourceGroupProps extends BAICardProps {
  queryRef: TotalResourceWithinResourceGroupFragment$key;
  isRefetching?: boolean;
  onResourceGroupChange?: (resourceGroup: string) => void;
}

const TotalResourceWithinResourceGroup: React.FC<
  TotalResourceWithinResourceGroupProps
> = ({ queryRef, isRefetching, onResourceGroupChange, ...props }) => {
  const { t } = useTranslation();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [selectedResourceGroup, setSelectedResourceGroup] = useState<string>();
  const deferredSelectedResourceGroup = useDeferredValue(selectedResourceGroup);
  const userRole = useCurrentUserRole();

  const [data, refetch] = useRefetchableFragment(
    graphql`
      fragment TotalResourceWithinResourceGroupFragment on Queries
      @argumentDefinitions(resourceGroup: { type: "String" }, isSuperAdmin: { type: "Boolean!" })
      @refetchable(
        queryName: "TotalResourceWithinResourceGroupFragmentRefetchQuery"
      ) {
        agent_summary_list(
          limit: 1000
          offset: 0
          status: "ALIVE"
          scaling_group: $resourceGroup
          filter: "schedulable == true"
        ) @skip(if: $isSuperAdmin) {
          items {
            id
            status
            available_slots
            occupied_slots
            scaling_group
          }
          total_count
        }
        agent_nodes(
          filter: "schedulable == true & status == \"ALIVE\""
        ) @include(if: $isSuperAdmin) {
          edges {
            node {
              id
              status
              available_slots
              occupied_slots
              scaling_group
            }
          }
          count
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
        isSuperAdmin: userRole === 'superadmin',
      });
    }
  }, [deferredSelectedResourceGroup, refetch, userRole]);

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
      const agents = _.isEqual(userRole, 'superadmin')
        ? _.map(data.agent_nodes?.edges, 'node')
        : data.agent_summary_list?.items || [];

      const totalOccupiedSlots: Record<string, number> = {};
      const totalAvailableSlots: Record<string, number> = {};

      _.forEach(filterOutNullAndUndefined(agents), (agent) => {
        let occupiedSlots;
        let availableSlots;

        try {
          occupiedSlots = JSON.parse(agent.occupied_slots || '{}');
          availableSlots = JSON.parse(agent.available_slots || '{}');
        } catch (e) {
          return;
        }

        if (_.isError(occupiedSlots) || _.isError(availableSlots)) return;

        _.forEach(occupiedSlots, (value, key) => {
          totalOccupiedSlots[key] = _.toNumber(
            addNumberWithUnits(
              _.toString(_.get(totalOccupiedSlots, key, 0)),
              _.toString(value),
              '',
            ),
          );
        });

        _.forEach(availableSlots, (value, key) => {
          totalAvailableSlots[key] = _.toNumber(
            addNumberWithUnits(
              _.toString(_.get(totalAvailableSlots, key, 0)),
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
    }, [data, type, resourceSlotsDetails, userRole]);

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
        onChange={(v) => {
          setSelectedResourceGroup(v);
          onResourceGroupChange?.(v);
        }}
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
          isSuperAdmin: _.isEqual(userRole, 'superadmin'),
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
