/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AgentStatsFragment$key } from '../__generated__/AgentStatsFragment.graphql';
import { useResourceSlotsDetails } from '../hooks/backendai';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import { Heading } from '@astryxdesign/core/Text';
import { useTheme } from '@astryxdesign/core/theme';
import {
  BAISkeleton,
  BAIBoardItemTitle,
  BAIFetchKeyButton,
  BAIFlex,
  BAIFlexProps,
  ResourceStatistics,
  convertToNumber,
  processMemoryValue,
  useControllableValue,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useTransition, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

interface AgentStatsProps extends BAIFlexProps {
  queryRef: AgentStatsFragment$key;
  isRefetching?: boolean;
  displayType?: 'used' | 'free';
  onDisplayTypeChange?: (type: 'used' | 'free') => void;
  extra?: ReactNode;
}

const AgentStats: React.FC<AgentStatsProps> = ({
  queryRef,
  isRefetching,
  extra,
  ...props
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();

  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const [displayType, setDisplayType] = useControllableValue<
    Exclude<AgentStatsProps['displayType'], undefined>
  >(props, {
    defaultValue: 'used',
    trigger: 'onDisplayTypeChange',
    defaultValuePropName: 'defaultDisplayType',
  });

  const [data, refetch] = useRefetchableFragment(
    graphql`
      fragment AgentStatsFragment on Query
      @refetchable(queryName: "AgentStatsRefetchQuery") {
        agentStats @since(version: "25.15.0") {
          totalResource {
            free
            used
            capacity
          }
        }
      }
    `,
    queryRef,
  );

  const resourceSlotsDetails = useResourceSlotsDetails();

  const agentStatsData = (() => {
    const totalResource = data.agentStats?.totalResource;
    if (!totalResource) {
      return { cpu: null, memory: null, accelerators: [] };
    }

    const free = totalResource.free as Record<string, number>;
    const used = totalResource.used as Record<string, number>;
    const capacity = totalResource.capacity as Record<string, number>;

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
        paddingInline: token('--spacing-8'),
        paddingBottom: token('--spacing-4'),
        ...props.style,
      }}
      {..._.omit(props, ['style'])}
    >
      <BAIBoardItemTitle
        title={
          // antd Typography.Text styled to fontSizeHeading5 (16px) +
          // fontWeightStrong. On the restored antd type ramp 16px is
          // heading-5; `level={3}` tracked the same 16px back when Astryx's
          // own ramp put 17px there.
          <Heading level={5}>{t('agentStats.AgentStats')}</Heading>
        }
        tooltip={t('agentStats.AgentStatsDescription')}
        extra={
          <BAIFlex gap={'xs'} wrap="wrap">
            {/* PILOT-DECISION: SegmentedControl.label is aria-only and required;
                composed from the two existing option labels to avoid adding new
                i18n keys while page tickets run in parallel. */}
            <SegmentedControl
              size="sm"
              label={`${t('dashboard.Used')}/${t('dashboard.Free')}`}
              value={displayType}
              onChange={(v) =>
                setDisplayType(
                  v as Exclude<AgentStatsProps['displayType'], undefined>,
                )
              }
            >
              <SegmentedControlItem value="used" label={t('dashboard.Used')} />
              <SegmentedControlItem value="free" label={t('dashboard.Free')} />
            </SegmentedControl>
            <BAIFetchKeyButton
              size="small"
              loading={isPendingRefetch || isRefetching}
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
              type="text"
              style={{
                backgroundColor: 'transparent',
              }}
            />
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

export default AgentStats;
