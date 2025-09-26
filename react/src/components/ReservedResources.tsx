import { ReservedResourcesFragment$key } from '../__generated__/ReservedResourcesFragment.graphql';
import { useResourceSlotsDetails } from '../hooks/backendai';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import { useControllableValue } from 'ahooks';
import { Segmented, Skeleton, theme, Typography } from 'antd';
import {
  filterOutNullAndUndefined,
  BAIFlex,
  BAIBoardItemTitle,
  ResourceStatistics,
  convertToNumber,
  processMemoryValue,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useMemo, useTransition, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

interface ReservedResourcesProps {
  queryRef: ReservedResourcesFragment$key;
  refetching?: boolean;
  displayType?: 'reserved' | 'free';
  onDisplayTypeChange?: (type: 'reserved' | 'free') => void;
  extra?: ReactNode;
}

const ReservedResources: React.FC<ReservedResourcesProps> = ({
  queryRef,
  refetching,
  extra,
  ...props
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const [displayType, setDisplayType] = useControllableValue<
    Exclude<ReservedResourcesProps['displayType'], undefined>
  >(props, {
    defaultValue: 'reserved',
    trigger: 'onDisplayTypeChange',
    defaultValuePropName: 'defaultDisplayType',
  });

  const [{ reservedResourceAgentNodes }, refetch] = useRefetchableFragment(
    graphql`
      fragment ReservedResourcesFragment on Query
      @argumentDefinitions(reservedResourceFilter: { type: "String" })
      @refetchable(queryName: "ReservedResourcesFragmentRefetchQuery") {
        reservedResourceAgentNodes: agent_nodes(
          filter: $reservedResourceFilter
        ) @since(version: "24.12.0") {
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

  const reservedResourceData = useMemo(() => {
    const agents = reservedResourceAgentNodes
      ? _.map(reservedResourceAgentNodes?.edges, 'node')
      : [];

    const used: Record<string, number> = {};
    const capacity: Record<string, number> = {};

    // TODO: Use backend API to get total reserved resources directly after available in the backend.

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
        used[key] = (used[key] || 0) + Number(value);
      });

      _.forEach(availableSlots, (value, key) => {
        capacity[key] = (capacity[key] || 0) + Number(value);
      });
    });

    const cpuSlot = resourceSlotsDetails?.resourceSlotsInRG?.['cpu'];
    const memSlot = resourceSlotsDetails?.resourceSlotsInRG?.['mem'];

    const cpuData = cpuSlot
      ? {
          using: {
            current: convertToNumber(used['cpu'] || 0),
            total: convertToNumber(capacity['cpu'] || 0),
          },
          remaining: {
            current: convertToNumber(
              (capacity['cpu'] || 0) - (used['cpu'] || 0),
            ),
            total: convertToNumber(capacity['cpu'] || 0),
          },
          metadata: {
            title: cpuSlot.human_readable_name,
            displayUnit: cpuSlot.display_unit,
          },
        }
      : null;

    const memoryData = memSlot
      ? {
          using: {
            current: processMemoryValue(used['mem'] || 0, memSlot.display_unit),
            total: processMemoryValue(
              capacity['mem'] || 0,
              memSlot.display_unit,
            ),
          },
          remaining: {
            current: processMemoryValue(
              (capacity['mem'] || 0) - (used['mem'] || 0),
              memSlot.display_unit,
            ),
            total: processMemoryValue(
              capacity['mem'] || 0,
              memSlot.display_unit,
            ),
          },
          metadata: {
            title: memSlot.human_readable_name,
            displayUnit: memSlot.display_unit,
          },
        }
      : null;

    const accelerators = _.chain(resourceSlotsDetails?.resourceSlotsInRG)
      .omit(['cpu', 'mem'])
      .map((resourceSlot, key) => {
        if (!resourceSlot) return null;

        const processAcceleratorValue = (value: any): number => {
          return convertToNumber(value);
        };

        const occupied = used[key] || 0;
        const available = capacity[key] || 0;

        return {
          key,
          using: {
            current: processAcceleratorValue(occupied),
            total: processAcceleratorValue(available),
          },
          remaining: {
            current: processAcceleratorValue(available - occupied),
            total: processAcceleratorValue(available),
          },
          metadata: {
            title: resourceSlot.human_readable_name,
            displayUnit: resourceSlot.display_unit,
          },
        };
      })
      .compact()
      .filter((item) => !!(item.using.current || item.using.total))
      .value();

    return { cpu: cpuData, memory: memoryData, accelerators };
  }, [reservedResourceAgentNodes, resourceSlotsDetails]);

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
          <Typography.Text
            style={{
              fontSize: token.fontSizeHeading5,
              fontWeight: token.fontWeightStrong,
            }}
          >
            {t('reservedResources.ReservedResources')}
          </Typography.Text>
        }
        tooltip={t('reservedResources.ReservedResourcesDescription')}
        extra={
          <BAIFlex gap={'xs'} wrap="wrap">
            <Segmented<
              Exclude<ReservedResourcesProps['displayType'], undefined>
            >
              size="small"
              options={[
                {
                  label: t('reservedResources.Reserved'),
                  value: 'reserved',
                },
                {
                  value: 'free',
                  label: t('reservedResources.Free'),
                },
              ]}
              value={displayType}
              onChange={(v) => setDisplayType(v)}
            />
            <BAIFetchKeyButton
              size="small"
              loading={isPendingRefetch || refetching}
              value=""
              onChange={() => {
                startRefetchTransition(() => {
                  refetch(
                    {},
                    {
                      fetchPolicy: 'network-only',
                    },
                  );
                });
              }}
              variant="link"
              color="default"
            />
            {extra}
          </BAIFlex>
        }
      />
      {resourceSlotsDetails.isLoading ? (
        <Skeleton active />
      ) : (
        <ResourceStatistics
          resourceData={reservedResourceData}
          displayType={displayType === 'reserved' ? 'using' : 'remaining'}
          showProgress={true}
        />
      )}
    </BAIFlex>
  );
};

export default ReservedResources;
