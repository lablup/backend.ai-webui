import { TotalResourceWithinResourceGroupFragment$key } from '../__generated__/TotalResourceWithinResourceGroupFragment.graphql';
import {
  useCurrentUserRole,
  useResourceSlotsDetails,
} from '../hooks/backendai';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import BaseResourceItem, {
  AcceleratorSlotDetail,
  ResourceValues,
} from './BaseResourceItem';
import ResourceGroupSelectForCurrentProject from './ResourceGroupSelectForCurrentProject';
import { useControllableValue } from 'ahooks';
import { Segmented, theme, Typography } from 'antd';
import {
  filterOutNullAndUndefined,
  BAIFlex,
  subNumberWithUnits,
  addNumberWithUnits,
  BAIBoardItemTitle,
} from 'backend.ai-ui';
import _ from 'lodash';
import {
  useCallback,
  useMemo,
  useState,
  useTransition,
  useDeferredValue,
  useEffect,
  ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

interface TotalResourceWithinResourceGroupProps {
  queryRef: TotalResourceWithinResourceGroupFragment$key;
  refetching?: boolean;
  onResourceGroupChange?: (resourceGroup: string) => void;
  displayType?: 'using' | 'remaining';
  onDisplayTypeChange?: (type: 'using' | 'remaining') => void;
  extra?: ReactNode;
}

const TotalResourceWithinResourceGroup: React.FC<
  TotalResourceWithinResourceGroupProps
> = ({ queryRef, refetching, onResourceGroupChange, extra, ...props }) => {
  const { t } = useTranslation();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [selectedResourceGroup, setSelectedResourceGroup] = useState<string>();
  const deferredSelectedResourceGroup = useDeferredValue(selectedResourceGroup);
  const userRole = useCurrentUserRole();
  const { token } = theme.useToken();

  const [data, refetch] = useRefetchableFragment(
    graphql`
      fragment TotalResourceWithinResourceGroupFragment on Query
      @argumentDefinitions(
        resourceGroup: { type: "String" }
        isSuperAdmin: { type: "Boolean!" }
        agentNodeFilter: { type: "String" }
      )
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
        agent_nodes(filter: $agentNodeFilter) @include(if: $isSuperAdmin) {
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
  const [displayType, setDisplayType] = useControllableValue<
    Exclude<TotalResourceWithinResourceGroupProps['displayType'], undefined>
  >(props, {
    defaultValue: 'remaining',
    trigger: 'onDisplayTypeChange',
    defaultValuePropName: 'defaultDisplayType',
  });

  useEffect(() => {
    if (deferredSelectedResourceGroup) {
      refetch({
        resourceGroup: deferredSelectedResourceGroup,
        isSuperAdmin: userRole === 'superadmin',
      });
    }
  }, [deferredSelectedResourceGroup, refetch, userRole]);

  const getResourceValue = (
    type: TotalResourceWithinResourceGroupProps['displayType'],
    resource: string,
    totalOccupied: number,
    totalAvailable: number,
  ): ResourceValues => {
    const getCurrentValue = () => {
      if (type === 'using') {
        return totalOccupied;
      }
      const remaining = subNumberWithUnits(
        _.toString(totalAvailable),
        _.toString(totalOccupied),
        '',
      );
      return remaining;
    };

    const getTotalValue = () => {
      return totalAvailable;
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
            displayType,
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
    }, [data, displayType, resourceSlotsDetails, userRole]);

  const getResourceValueForCard = useCallback(
    (resource: string) =>
      getResourceValue(
        displayType,
        resource,
        totalOccupiedSlots[resource] || 0,
        totalAvailableSlots[resource] || 0,
      ),
    [displayType, totalOccupiedSlots, totalAvailableSlots],
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
    <BAIFlex
      direction="column"
      align="stretch"
      style={{
        paddingInline: token.paddingXL,
        paddingBottom: token.padding,
      }}
    >
      <BAIBoardItemTitle
        title={
          <BAIFlex gap={'xs'} wrap="wrap">
            <Typography.Text
              style={{
                fontSize: token.fontSizeHeading5,
                fontWeight: token.fontWeightStrong,
              }}
            >
              {t('webui.menu.TotalResourcesIn')}
            </Typography.Text>
            <ResourceGroupSelectForCurrentProject
              size="small"
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
        }
        tooltip={t('webui.menu.TotalResourcesInResourceGroupDescription')}
        extra={
          <BAIFlex gap={'xs'} wrap="wrap">
            <Segmented<
              Exclude<
                TotalResourceWithinResourceGroupProps['displayType'],
                undefined
              >
            >
              size="small"
              options={[
                {
                  label: t('resourcePanel.UsingNumber'),
                  value: 'using',
                },
                {
                  value: 'remaining',
                  label: t('resourcePanel.RemainingNumber'),
                },
              ]}
              value={displayType}
              onChange={(v) => setDisplayType(v)}
            />
            <BAIFetchKeyButton
              size="small"
              loading={isPendingRefetch || refetching}
              value=""
              onChange={handleRefetch}
              variant="link"
              color="default"
            />
            {extra}
          </BAIFlex>
        }
      />

      <BaseResourceItem
        {...props}
        getResourceValue={getResourceValueForCard}
        acceleratorSlotsDetails={acceleratorSlotsDetails}
        resourceSlotsDetails={resourceSlotsDetails}
        progressProps={{
          showProgress: true,
          steps: 12,
        }}
      />
    </BAIFlex>
  );
};

export default TotalResourceWithinResourceGroup;
