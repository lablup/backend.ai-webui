import { TotalResourceWithinResourceGroupFragment$key } from '../__generated__/TotalResourceWithinResourceGroupFragment.graphql';
import {
  useCurrentUserRole,
  useResourceSlotsDetails,
} from '../hooks/backendai';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import SharedResourceGroupSelectForCurrentProject from './SharedResourceGroupSelectForCurrentProject';
import { useControllableValue } from 'ahooks';
import { Segmented, theme, Typography } from 'antd';
import {
  filterOutNullAndUndefined,
  BAIFlex,
  subNumberWithUnits,
  addNumberWithUnits,
  BAIBoardItemTitle,
  ResourceStatistics,
  convertToNumber,
  processMemoryValue,
  BAIFlexProps,
} from 'backend.ai-ui';
import _ from 'lodash';
import {
  useMemo,
  useTransition,
  useDeferredValue,
  useEffect,
  ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';
import { useSuspendedBackendaiClient } from 'src/hooks';
import { useCurrentResourceGroupValue } from 'src/hooks/useCurrentProject';

interface TotalResourceWithinResourceGroupProps extends BAIFlexProps {
  queryRef: TotalResourceWithinResourceGroupFragment$key;
  refetching?: boolean;
  displayType?: 'used' | 'free';
  onDisplayTypeChange?: (type: 'used' | 'free') => void;
  extra?: ReactNode;
}

export const useIsAvailableTotalResourceWithinResourceGroup = () => {
  const baiClient = useSuspendedBackendaiClient();
  const userRole = useCurrentUserRole();
  const isHiddenAgents = !!baiClient?._config?.hideAgents;

  // Superadmin users can use `agent_nodes` if available, even when hideAgents is true.
  // The GraphQL `agent_nodes` field is only available from v24.12.0. If hideAgents is false, `agent_summary_list` can be used instead.
  return userRole === 'superadmin'
    ? baiClient.isManagerVersionCompatibleWith('24.12.0') || !isHiddenAgents
    : !isHiddenAgents;
};

const TotalResourceWithinResourceGroup: React.FC<
  TotalResourceWithinResourceGroupProps
> = ({ queryRef, refetching, extra, ...props }) => {
  const { t } = useTranslation();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const deferredSelectedResourceGroup = useDeferredValue(currentResourceGroup);
  const userRole = useCurrentUserRole();
  const { token } = theme.useToken();

  const [{ agent_nodes, agent_summary_list }, refetch] = useRefetchableFragment(
    graphql`
      fragment TotalResourceWithinResourceGroupFragment on Query
      @argumentDefinitions(
        resourceGroup: { type: "String" }
        isSuperAdmin: { type: "Boolean!" }
        agentNodeFilter: { type: "String!" }
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
        agent_nodes(filter: $agentNodeFilter)
          @since(version: "24.12.0")
          @include(if: $isSuperAdmin) {
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
    defaultValue: 'free',
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

  const resourceData = useMemo(() => {
    const agents = agent_nodes
      ? _.map(agent_nodes?.edges, 'node')
      : agent_summary_list?.items || [];

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

    const cpuSlot = resourceSlotsDetails?.resourceSlotsInRG?.['cpu'];
    const memSlot = resourceSlotsDetails?.resourceSlotsInRG?.['mem'];

    const cpuData = cpuSlot
      ? {
          used: {
            current: convertToNumber(totalOccupiedSlots['cpu'] || 0),
            total: convertToNumber(totalAvailableSlots['cpu'] || 0),
          },
          free: {
            current: convertToNumber(
              subNumberWithUnits(
                _.toString(totalAvailableSlots['cpu'] || 0),
                _.toString(totalOccupiedSlots['cpu'] || 0),
                '',
              ),
            ),
            total: convertToNumber(totalAvailableSlots['cpu'] || 0),
          },
          metadata: {
            title: cpuSlot.human_readable_name,
            displayUnit: cpuSlot.display_unit,
          },
        }
      : null;

    const memoryData = memSlot
      ? {
          used: {
            current: processMemoryValue(
              totalOccupiedSlots['mem'] || 0,
              memSlot.display_unit,
            ),
            total: processMemoryValue(
              totalAvailableSlots['mem'] || 0,
              memSlot.display_unit,
            ),
          },
          free: {
            current: processMemoryValue(
              subNumberWithUnits(
                _.toString(totalAvailableSlots['mem'] || 0),
                _.toString(totalOccupiedSlots['mem'] || 0),
                '',
              ),
              memSlot.display_unit,
            ),
            total: processMemoryValue(
              totalAvailableSlots['mem'] || 0,
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

        const occupied = totalOccupiedSlots[key] || 0;
        const available = totalAvailableSlots[key] || 0;
        const remaining = subNumberWithUnits(
          _.toString(available),
          _.toString(occupied),
          '',
        );

        return {
          key,
          used: {
            current: processAcceleratorValue(occupied),
            total: processAcceleratorValue(available),
          },
          free: {
            current: processAcceleratorValue(remaining),
            total: processAcceleratorValue(available),
          },
          metadata: {
            title: resourceSlot.human_readable_name,
            displayUnit: resourceSlot.display_unit,
          },
        };
      })
      .compact()
      .filter((item) => !!(item.used.current || item.used.total))
      .value();

    return { cpu: cpuData, memory: memoryData, accelerators };
  }, [agent_nodes, agent_summary_list, resourceSlotsDetails]);

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{
        paddingInline: token.paddingXL,
        paddingBottom: token.padding,
        ...props.style,
      }}
      {..._.omit(props, ['style'])}
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
            <SharedResourceGroupSelectForCurrentProject
              size="small"
              showSearch
              style={{ minWidth: 100 }}
              loading={currentResourceGroup !== deferredSelectedResourceGroup}
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
                  label: t('dashboard.Used'),
                  value: 'used',
                },
                {
                  label: t('dashboard.Free'),
                  value: 'free',
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
                // Handle local refetching
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
              }}
              variant="link"
              color="default"
            />
            {extra}
          </BAIFlex>
        }
      />

      <ResourceStatistics
        resourceData={resourceData}
        displayType={displayType}
        showProgress={true}
      />
    </BAIFlex>
  );
};

export default TotalResourceWithinResourceGroup;
