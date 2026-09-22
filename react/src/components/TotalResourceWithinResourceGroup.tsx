/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { TotalResourceWithinResourceGroupFragment$key } from '../__generated__/TotalResourceWithinResourceGroupFragment.graphql';
import { TotalResourceWithinResourceGroupRemainingAgentsQuery } from '../__generated__/TotalResourceWithinResourceGroupRemainingAgentsQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import {
  useCurrentUserRole,
  useResourceSlotsDetails,
} from '../hooks/backendai';
import { useCurrentResourceGroupValue } from '../hooks/useCurrentProject';
import { theme } from '../theme-shim';
import SharedResourceGroupSelectForCurrentProject from './SharedResourceGroupSelectForCurrentProject';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import { Heading } from '@astryxdesign/core/Text';
import {
  BAIBoardItemTitle,
  BAIFetchKeyButton,
  BAIFlex,
  BAIFlexProps,
  ResourceStatistics,
  addNumberWithUnits,
  convertToNumber,
  filterOutNullAndUndefined,
  processMemoryValue,
  subNumberWithUnits,
  useControllableValue,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import {
  useTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useState,
  ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchQuery,
  graphql,
  useRefetchableFragment,
  useRelayEnvironment,
} from 'react-relay';

// One page of agents per request; the statistic below sums EVERY agent in the
// resource group, so pages after the first are fetched until `count` is met.
const AGENT_PAGE_SIZE = 100;

interface AgentSlots {
  id: string | null | undefined;
  available_slots: string | null | undefined;
  occupied_slots: string | null | undefined;
}

const remainingAgentsQuery = graphql`
  query TotalResourceWithinResourceGroupRemainingAgentsQuery(
    $resourceGroup: String
    $isSuperAdmin: Boolean!
    $agentNodeFilter: String!
    $limit: Int!
    $offset: Int!
  ) {
    agent_summary_list(
      limit: $limit
      offset: $offset
      status: "ALIVE"
      scaling_group: $resourceGroup
      filter: "schedulable == true"
    ) @skip(if: $isSuperAdmin) {
      items {
        id
        available_slots
        occupied_slots
      }
    }
    agent_nodes(filter: $agentNodeFilter, first: $limit, offset: $offset)
      @since(version: "24.12.0")
      @include(if: $isSuperAdmin) {
      edges {
        node {
          id
          available_slots
          occupied_slots
        }
      }
    }
  }
`;

/**
 * Agents past the fragment's first page. Keyed on the first page's identity so
 * a refetch (resource group change, refresh) invalidates the tail with it.
 */
const useRemainingAgents = ({
  firstPageKey,
  loadedCount,
  totalCount,
  variables,
}: {
  firstPageKey: object | null | undefined;
  loadedCount: number;
  totalCount: number | null | undefined;
  variables: Omit<
    TotalResourceWithinResourceGroupRemainingAgentsQuery['variables'],
    'limit' | 'offset'
  >;
}) => {
  'use memo';
  const relayEnv = useRelayEnvironment();
  const [remaining, setRemaining] = useState<{
    key: object | null | undefined;
    agents: Array<AgentSlots>;
  }>({ key: undefined, agents: [] });

  const needsMore =
    !!firstPageKey && _.isNumber(totalCount) && totalCount > loadedCount;

  const fetchRemaining = useEffectEvent(async (isCancelled: () => boolean) => {
    const agents: Array<AgentSlots> = [];
    for (
      let offset = loadedCount;
      offset < (totalCount as number);
      offset += AGENT_PAGE_SIZE
    ) {
      const page =
        await fetchQuery<TotalResourceWithinResourceGroupRemainingAgentsQuery>(
          relayEnv,
          remainingAgentsQuery,
          { ...variables, limit: AGENT_PAGE_SIZE, offset },
        ).toPromise();
      if (isCancelled()) return;
      const items: ReadonlyArray<AgentSlots | null | undefined> =
        page?.agent_nodes
          ? page.agent_nodes.edges.map((edge) => edge?.node)
          : (page?.agent_summary_list?.items ?? []);
      if (_.isEmpty(items)) break;
      agents.push(...filterOutNullAndUndefined(items));
    }
    setRemaining({ key: firstPageKey, agents });
  });

  useEffect(() => {
    if (!needsMore) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- state is set after the awaited pages resolve, not synchronously
    fetchRemaining(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [firstPageKey, needsMore]);

  const isCurrent = remaining.key === firstPageKey;
  return {
    remainingAgents: isCurrent ? remaining.agents : [],
    isLoadingRemaining: needsMore && !isCurrent,
  };
};

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
  'use memo';
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
          limit: 100
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
        agent_nodes(filter: $agentNodeFilter, first: 100)
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

  const firstPageAgents: Array<AgentSlots> = filterOutNullAndUndefined(
    agent_nodes
      ? _.map(agent_nodes?.edges, 'node')
      : agent_summary_list?.items || [],
  );
  const { remainingAgents, isLoadingRemaining } = useRemainingAgents({
    firstPageKey: agent_nodes ?? agent_summary_list,
    loadedCount: firstPageAgents.length,
    totalCount: agent_nodes
      ? agent_nodes.count
      : agent_summary_list?.total_count,
    variables: {
      resourceGroup: deferredSelectedResourceGroup,
      isSuperAdmin: userRole === 'superadmin',
      agentNodeFilter: `schedulable == true & status == "ALIVE" & scaling_group == "${deferredSelectedResourceGroup}"`,
    },
  });

  const resourceData = (() => {
    const agents = [...firstPageAgents, ...remainingAgents];

    const totalOccupiedSlots: Record<string, number> = {};
    const totalAvailableSlots: Record<string, number> = {};

    _.forEach(agents, (agent) => {
      let occupiedSlots;
      let availableSlots;

      try {
        occupiedSlots = JSON.parse(agent.occupied_slots || '{}');
        availableSlots = JSON.parse(agent.available_slots || '{}');
      } catch {
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

    const accelerators = _.filter(
      _.compact(
        _.map(
          _.omit(resourceSlotsDetails?.resourceSlotsInRG, ['cpu', 'mem']),
          (resourceSlot, key) => {
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
          },
        ),
      ),
      (item) => !!(item.used.current || item.used.total),
    );

    return { cpu: cpuData, memory: memoryData, accelerators };
  })();

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
            {/* antd Typography.Text (fontSizeHeading5 = 16px +
                fontWeightStrong). 16px is heading-5 on the restored antd type
                ramp; `level={3}` tracked the same 16px under Astryx's own. */}
            <Heading level={5}>{t('webui.menu.TotalResourcesIn')}</Heading>
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
            {/* PILOT-DECISION: SegmentedControl.label is aria-only and required;
                composed from the two option labels to avoid new i18n keys. */}
            <SegmentedControl
              size="sm"
              label={`${t('dashboard.Used')}/${t('dashboard.Free')}`}
              value={displayType}
              onChange={(v) =>
                setDisplayType(
                  v as Exclude<
                    TotalResourceWithinResourceGroupProps['displayType'],
                    undefined
                  >,
                )
              }
            >
              <SegmentedControlItem value="used" label={t('dashboard.Used')} />
              <SegmentedControlItem value="free" label={t('dashboard.Free')} />
            </SegmentedControl>
            <BAIFetchKeyButton
              size="small"
              loading={isPendingRefetch || refetching || isLoadingRemaining}
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
        progressMode="normal"
      />
    </BAIFlex>
  );
};

export default TotalResourceWithinResourceGroup;
