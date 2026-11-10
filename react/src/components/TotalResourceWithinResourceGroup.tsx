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
import SharedResourceGroupSelectForCurrentProject from './SharedResourceGroupSelectForCurrentProject';
import { Heading } from '@lablup/ui-common/Text';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIBoardItemTitle,
  BAIFetchKeyButton,
  BAIFlex,
  BAIFlexProps,
  BAIIconWithTooltip,
  ResourceStatistics,
  addNumberWithUnits,
  convertToNumber,
  filterOutNullAndUndefined,
  processMemoryValue,
  subNumberWithUnits,
  useControllableValue,
  BAISegmentedControl,
  BAISegmentedControlItem,
  useIsInBAIBoardItem,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CircleHelp } from 'lucide-react';
import {
  ReactNode,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useState,
  useTransition,
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
  id: string;
  capacity: unknown;
  used: unknown;
}

const parseSlots = (slots: unknown): Record<string, unknown> =>
  (typeof slots === 'string' ? JSON.parse(slots || '{}') : slots) ?? {};

type AgentPage = Pick<
  TotalResourceWithinResourceGroupRemainingAgentsQuery['response'],
  'agentsV2' | 'agent_summary_list'
>;

const toAgentSlots = (page: AgentPage | null | undefined): Array<AgentSlots> =>
  page?.agentsV2
    ? page.agentsV2.edges.map(({ node }) => ({
        id: node.id,
        capacity: node.resourceInfo.capacity,
        used: node.resourceInfo.used,
      }))
    : filterOutNullAndUndefined(page?.agent_summary_list?.items ?? []).map(
        (item) => ({
          id: item.id ?? '',
          capacity: item.available_slots,
          used: item.occupied_slots,
        }),
      );

const remainingAgentsQuery = graphql`
  query TotalResourceWithinResourceGroupRemainingAgentsQuery(
    $resourceGroup: String
    $isSuperAdmin: Boolean!
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
    agentsV2(
      filter: {
        status: { equals: ALIVE }
        schedulable: true
        scalingGroup: { equals: $resourceGroup }
      }
      orderBy: [{ field: ID }]
      limit: $limit
      offset: $offset
    ) @include(if: $isSuperAdmin) {
      edges {
        node {
          id
          resourceInfo {
            capacity
            used
          }
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
      if (isCancelled()) return agents;
      const items = toAgentSlots(page);
      if (_.isEmpty(items)) break;
      agents.push(...items);
    }
    return agents;
  });

  useEffect(() => {
    if (!needsMore) return;
    let cancelled = false;
    const requestKey = firstPageKey;
    fetchRemaining(() => cancelled).then((agents) => {
      if (!cancelled) setRemaining({ key: requestKey, agents });
    });
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
  /** Hides the card's own refresh button, for hosts that refresh it themselves. */
  hideRefreshButton?: boolean;
  displayType?: 'used' | 'free';
  onDisplayTypeChange?: (type: 'used' | 'free') => void;
  extra?: ReactNode;
  /** Fixes the resource group (the parent query's); without it the header's group and a picker are used. */
  resourceGroup?: string;
  /** Drops the title row, for a host that owns the card header and its resource group picker. */
  asSection?: boolean;
}

export const useIsAvailableTotalResourceWithinResourceGroup = () => {
  const baiClient = useSuspendedBackendaiClient();
  const userRole = useCurrentUserRole();
  const isHiddenAgents = !!baiClient?._config?.hideAgents;

  // Superadmins read `agentsV2` even when hideAgents is true; others need `agent_summary_list`.
  return userRole === 'superadmin' || !isHiddenAgents;
};

const TotalResourceWithinResourceGroup: React.FC<
  TotalResourceWithinResourceGroupProps
> = ({
  queryRef,
  refetching,
  hideRefreshButton,
  extra,
  resourceGroup,
  asSection,
  ...props
}) => {
  'use memo';
  const { t } = useTranslation();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const headerResourceGroup = useCurrentResourceGroupValue();
  const currentResourceGroup = resourceGroup ?? headerResourceGroup;
  const deferredSelectedResourceGroup = useDeferredValue(currentResourceGroup);
  const userRole = useCurrentUserRole();
  const { token } = useTheme();
  const isInBoard = useIsInBAIBoardItem();

  // TODO(needs-backend): #11077 agentsV2 is superadmin-only, so other roles stay on agent_summary_list.
  const [data, refetch] = useRefetchableFragment(
    graphql`
      fragment TotalResourceWithinResourceGroupFragment on Query
      @argumentDefinitions(
        resourceGroup: { type: "String" }
        isSuperAdmin: { type: "Boolean!" }
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
        agentsV2(
          filter: {
            status: { equals: ALIVE }
            schedulable: true
            scalingGroup: { equals: $resourceGroup }
          }
          orderBy: [{ field: ID }]
          limit: 100
          offset: 0
        ) @include(if: $isSuperAdmin) {
          edges {
            node {
              id
              resourceInfo {
                capacity
                used
              }
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
    valuePropName: 'displayType',
    trigger: 'onDisplayTypeChange',
    defaultValuePropName: 'defaultDisplayType',
  });

  useEffect(() => {
    if (deferredSelectedResourceGroup && !resourceGroup) {
      refetch({
        resourceGroup: deferredSelectedResourceGroup,
        isSuperAdmin: userRole === 'superadmin',
      });
    }
  }, [deferredSelectedResourceGroup, refetch, userRole, resourceGroup]);

  const firstPageAgents = toAgentSlots(data);
  const { remainingAgents, isLoadingRemaining } = useRemainingAgents({
    firstPageKey: data.agentsV2 ?? data.agent_summary_list,
    loadedCount: firstPageAgents.length,
    totalCount: data.agentsV2
      ? data.agentsV2.count
      : data.agent_summary_list?.total_count,
    variables: {
      resourceGroup: deferredSelectedResourceGroup,
      isSuperAdmin: userRole === 'superadmin',
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
        occupiedSlots = parseSlots(agent.used);
        availableSlots = parseSlots(agent.capacity);
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
        // On a board the board pads the item.
        ...(isInBoard
          ? {}
          : {
              paddingBlock: token('--spacing-4'),
              paddingInline: token('--spacing-8'),
              flex: 1,
              // A narrow cell leaves no height to center in; the title still keeps its distance.
              rowGap: token('--spacing-4'),
            }),
        ...props.style,
      }}
      {..._.omit(props, [
        'style',
        'displayType',
        'defaultDisplayType',
        'onDisplayTypeChange',
      ])}
    >
      {asSection ? null : (
        // The same header row as the dashboard's card: title, help, picker.
        <BAIBoardItemTitle
          title={
            <BAIFlex gap="xs" wrap="wrap" align="center">
              <Heading level={5}>
                {t('webui.menu.TotalResourcesInResourceGroup')}
              </Heading>
              <BAIIconWithTooltip
                icon={<CircleHelp size="1em" />}
                content={t(
                  'webui.menu.TotalResourcesInResourceGroupDescription',
                )}
              />
              {resourceGroup ? (
                <Heading level={5}>{resourceGroup}</Heading>
              ) : (
                <SharedResourceGroupSelectForCurrentProject
                  isLoading={
                    currentResourceGroup !== deferredSelectedResourceGroup
                  }
                />
              )}
            </BAIFlex>
          }
          extra={
            <BAIFlex gap="xs" wrap="wrap" align="center">
              {/* PILOT-DECISION: SegmentedControl.label is aria-only and required;
                composed from the two option labels to avoid new i18n keys. */}
              <BAISegmentedControl
                size="sm"
                aria-label={`${t('dashboard.Used')}/${t('dashboard.Free')}`}
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
                <BAISegmentedControlItem
                  value="used"
                  label={t('dashboard.Used')}
                />
                <BAISegmentedControlItem
                  value="free"
                  label={t('dashboard.Free')}
                />
              </BAISegmentedControl>
              <BAIFetchKeyButton
                hidden={hideRefreshButton}
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
      )}

      <BAIFlex
        direction="column"
        align="stretch"
        justify="center"
        style={{ flex: 1 }}
      >
        <ResourceStatistics
          resourceData={resourceData}
          displayType={displayType}
          progressMode="normal"
        />
      </BAIFlex>
    </BAIFlex>
  );
};

export default TotalResourceWithinResourceGroup;
