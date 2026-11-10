/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AgentStatsFragment$key } from '../__generated__/AgentStatsFragment.graphql';
import { useResourceSlotsDetails } from '../hooks/backendai';
import PanelDetailLinkButton from './DashboardPanels/PanelDetailLinkButton';
import { countText, readCount } from './DashboardPanels/countAliases';
import { readPrimary } from './DashboardPanels/panelPermission';
import { Heading } from '@lablup/ui-common/Text';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIBoardItemTitle,
  BAIDoubleBadge,
  BAIFlex,
  BAIFlexProps,
  BAISkeleton,
  ResourceStatistics,
  convertToNumber,
  processMemoryValue,
  useControllableValue,
  BAISegmentedControl,
  BAISegmentedControlItem,
  useIsInBAIBoardItem,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

interface AgentStatsViewProps extends BAIFlexProps {
  /** Slot totals keyed by slot name; null when they could not be read. */
  totalResource: AgentSlotTotals | null;
  schedulableText: string;
  aliveText: string;
  displayType?: 'used' | 'free';
  onDisplayTypeChange?: (type: 'used' | 'free') => void;
  extra?: ReactNode;
}

export interface AgentSlotTotals {
  free: Record<string, number>;
  used: Record<string, number>;
  capacity: Record<string, number>;
}

interface AgentStatsProps extends Omit<
  AgentStatsViewProps,
  'totalResource' | 'schedulableText' | 'aliveText'
> {
  queryRef: AgentStatsFragment$key;
}

const agentCountText = (alias: Parameters<typeof readCount>[0]) => {
  const { count, denied } = readCount(alias);
  return countText(denied ? null : count);
};

export const AgentStatsView: React.FC<AgentStatsViewProps> = ({
  totalResource,
  schedulableText,
  aliveText,
  extra,
  ...props
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const isInBoard = useIsInBAIBoardItem();

  const [displayType, setDisplayType] = useControllableValue<
    Exclude<AgentStatsViewProps['displayType'], undefined>
  >(props, {
    defaultValue: 'used',
    trigger: 'onDisplayTypeChange',
    defaultValuePropName: 'defaultDisplayType',
  });

  const resourceSlotsDetails = useResourceSlotsDetails();

  const agentStatsData = (() => {
    if (!totalResource) {
      return { cpu: null, memory: null, accelerators: [] };
    }

    const { free, used, capacity } = totalResource;

    const cpuSlot = resourceSlotsDetails?.resourceSlotsInRG?.['cpu'];
    const memSlot = resourceSlotsDetails?.resourceSlotsInRG?.['mem'];

    const cpuData = cpuSlot
      ? {
          used: {
            current: convertToNumber(used['cpu'] || 0),
            total: convertToNumber(capacity['cpu'] || 0),
          },
          free: {
            current: convertToNumber(free['cpu'] || 0),
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
          used: {
            current: processMemoryValue(used['mem'] || 0, memSlot.display_unit),
            total: processMemoryValue(
              capacity['mem'] || 0,
              memSlot.display_unit,
            ),
          },
          free: {
            current: processMemoryValue(free['mem'] || 0, memSlot.display_unit),
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

    const accelerators = _.filter(
      _.compact(
        _.map(
          _.omit(resourceSlotsDetails?.resourceSlotsInRG, ['cpu', 'mem']),
          (resourceSlot, key) => {
            if (!resourceSlot) return null;

            const freeValue = free[key] || 0;
            const usedValue = used[key] || 0;
            const capacityValue = capacity[key] || 0;

            return {
              key,
              used: {
                current: convertToNumber(usedValue),
                total: convertToNumber(capacityValue),
              },
              free: {
                current: convertToNumber(freeValue),
                total: convertToNumber(capacityValue),
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
              paddingInline: token('--spacing-8'),
              paddingBottom: token('--spacing-4'),
            }),
        ...props.style,
      }}
      {..._.omit(props, ['style'])}
    >
      <BAIBoardItemTitle
        title={
          <BAIFlex gap="xs" align="center" wrap="wrap">
            {/* antd Typography.Text styled to fontSizeHeading5 (16px). On the
                restored antd type ramp 16px is heading-5. */}
            <Heading level={5}>{t('agentStats.AgentStats')}</Heading>
            <BAIDoubleBadge
              values={[
                { label: t('agentStats.SchedulableAgents') },
                {
                  label: `${schedulableText} / ${aliveText}`,
                },
              ]}
            />
          </BAIFlex>
        }
        tooltip={t('agentStats.AgentStatsDescription')}
        extra={
          <BAIFlex gap={'xs'} wrap="wrap">
            {/* PILOT-DECISION: SegmentedControl.label is aria-only and required;
                composed from the two existing option labels to avoid adding new
                i18n keys while page tickets run in parallel. */}
            <BAISegmentedControl
              size="sm"
              aria-label={`${t('dashboard.Used')}/${t('dashboard.Free')}`}
              value={displayType}
              onChange={(v) =>
                setDisplayType(
                  v as Exclude<AgentStatsViewProps['displayType'], undefined>,
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
            <PanelDetailLinkButton />
            {extra}
          </BAIFlex>
        }
      />
      {resourceSlotsDetails.isLoading ? (
        <BAISkeleton />
      ) : (
        <ResourceStatistics
          resourceData={agentStatsData}
          displayType={displayType === 'used' ? 'used' : 'free'}
          progressMode="normal"
        />
      )}
    </BAIFlex>
  );
};

/** Cluster-wide agent totals; superadmins only (`agentStats`, `agentsV2`). */
const AgentStats: React.FC<AgentStatsProps> = ({ queryRef, ...props }) => {
  'use memo';
  const [data] = useRefetchableFragment(
    graphql`
      fragment AgentStatsFragment on Query
      @refetchable(queryName: "AgentStatsRefetchQuery") {
        agentStats @catch(to: RESULT) {
          totalResource {
            free
            used
            capacity
          }
        }
        aliveAgents: agentsV2(filter: { status: { equals: ALIVE } }, limit: 1)
          @catch(to: RESULT) {
          count
        }
        schedulableAgents: agentsV2(
          filter: { status: { equals: ALIVE }, schedulable: true }
          limit: 1
        ) @catch(to: RESULT) {
          count
        }
      }
    `,
    queryRef,
  );

  const totals = readPrimary(data.agentStats)?.totalResource;
  return (
    <AgentStatsView
      totalResource={
        totals
          ? {
              free: totals.free as Record<string, number>,
              used: totals.used as Record<string, number>,
              capacity: totals.capacity as Record<string, number>,
            }
          : null
      }
      schedulableText={agentCountText(data.schedulableAgents)}
      aliveText={agentCountText(data.aliveAgents)}
      {...props}
    />
  );
};

export default AgentStats;
