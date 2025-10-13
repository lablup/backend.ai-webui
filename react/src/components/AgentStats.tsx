import { useResourceSlotsDetails } from '../hooks/backendai';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import { useControllableValue } from 'ahooks';
import { Segmented, Skeleton, theme, Typography } from 'antd';
import {
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
import { AgentStatsFragment$key } from 'src/__generated__/AgentStatsFragment.graphql';

interface AgentStatsProps {
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
  const { t } = useTranslation();
  const { token } = theme.useToken();

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

  const agentStatsData = useMemo(() => {
    const totalResource = data.agentStats.totalResource;
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
          using: {
            current: convertToNumber(used['cpu'] || 0),
            total: convertToNumber(capacity['cpu'] || 0),
          },
          remaining: {
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
          using: {
            current: processMemoryValue(used['mem'] || 0, memSlot.display_unit),
            total: processMemoryValue(
              capacity['mem'] || 0,
              memSlot.display_unit,
            ),
          },
          remaining: {
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

    const accelerators = _.chain(resourceSlotsDetails?.resourceSlotsInRG)
      .omit(['cpu', 'mem'])
      .map((resourceSlot, key) => {
        if (!resourceSlot) return null;

        const freeValue = free[key] || 0;
        const usedValue = used[key] || 0;
        const capacityValue = capacity[key] || 0;

        return {
          key,
          using: {
            current: convertToNumber(usedValue),
            total: convertToNumber(capacityValue),
          },
          remaining: {
            current: convertToNumber(freeValue),
            total: convertToNumber(capacityValue),
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
  }, [data, resourceSlotsDetails]);

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
            {t('agentStats.AgentStats')}
          </Typography.Text>
        }
        tooltip={t('agentStats.AgentStatsDescription')}
        extra={
          <BAIFlex gap={'xs'} wrap="wrap">
            <Segmented<Exclude<AgentStatsProps['displayType'], undefined>>
              size="small"
              options={[
                {
                  label: t('agentStats.Used'),
                  value: 'used',
                },
                {
                  value: 'free',
                  label: t('agentStats.Free'),
                },
              ]}
              value={displayType}
              onChange={(v) => setDisplayType(v)}
            />
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
        <Skeleton active />
      ) : (
        <ResourceStatistics
          resourceData={agentStatsData}
          displayType={displayType === 'used' ? 'using' : 'remaining'}
          showProgress={true}
        />
      )}
    </BAIFlex>
  );
};

export default AgentStats;
