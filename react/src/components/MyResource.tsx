/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { MyResourceQuery } from '../__generated__/MyResourceQuery.graphql';
import { MyResourceV2StatisticsFragment$key } from '../__generated__/MyResourceV2StatisticsFragment.graphql';
import { useResourceSlotsDetails } from '../hooks/backendai';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../hooks/useCurrentProject';
import { toUsageRows } from './DashboardPanels/memberCards/memberCardData';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIBoardItemTitle,
  BAIFlex,
  BAIFlexProps,
  ResourceStatistics,
  convertToNumber,
  processMemoryValue,
  BAIFetchKeyButton,
  BAISkeleton,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { ReactNode, Suspense, useTransition } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface MyResourceProps extends BAIFlexProps {
  fetchKey?: string;
  refetching?: boolean;
  /** Hides the card's own refresh button, for hosts that refresh it themselves. */
  hideRefreshButton?: boolean;
  extra?: ReactNode;
}

const MyResource: React.FC<MyResourceProps> = ({
  fetchKey,
  refetching,
  hideRefreshButton,
  extra,
  ...props
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const currentProject = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();

  const [internalFetchKey, updateInternalFetchKey] = useFetchKey();
  const [isPending, startTransition] = useTransition();

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
        title={t('webui.menu.MyResources')}
        tooltip={<Trans i18nKey={'webui.menu.MyResourcesDescription'} />}
        extra={
          <BAIFlex gap={'xs'}>
            <BAIFetchKeyButton
              hidden={hideRefreshButton}
              size="small"
              loading={isPending || refetching}
              value=""
              onChange={() => {
                startTransition(() => {
                  updateInternalFetchKey();
                });
              }}
              variant="link"
              color="default"
            />
            {extra}
          </BAIFlex>
        }
      />
      {/* A transport failure, or a manager without myUserResourceAllocationV2, escapes @catch; keep the title and let refresh retry. */}
      <ErrorBoundary
        resetKeys={[
          fetchKey,
          internalFetchKey,
          currentProject.id,
          currentResourceGroup,
        ]}
        fallbackRender={() => (
          <ResourceStatistics
            resourceData={NO_RESOURCE_DATA}
            displayType="used"
            progressMode="normal"
          />
        )}
      >
        <Suspense fallback={<BAISkeleton />}>
          <MyResourceStatistics fetchKey={`${fetchKey}${internalFetchKey}`} />
        </Suspense>
      </ErrorBoundary>
    </BAIFlex>
  );
};

const NO_RESOURCE_DATA = { cpu: null, memory: null, accelerators: [] };

const MyResourceStatistics: React.FC<{ fetchKey: string }> = ({ fetchKey }) => {
  'use memo';
  const currentProject = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();
  if (!currentProject.id) {
    throw new Error('Project id is required for MyResource');
  }
  if (!currentResourceGroup) {
    return (
      <ResourceStatistics
        resourceData={NO_RESOURCE_DATA}
        displayType="used"
        progressMode="normal"
      />
    );
  }

  return (
    <MyResourceStatisticsQuery
      projectId={currentProject.id}
      resourceGroupName={currentResourceGroup}
      fetchKey={fetchKey}
    />
  );
};

const MyResourceStatisticsQuery: React.FC<{
  projectId: string;
  resourceGroupName: string;
  fetchKey: string;
}> = ({ projectId, resourceGroupName, fetchKey }) => {
  'use memo';
  const queryRef = useLazyLoadQuery<MyResourceQuery>(
    graphql`
      query MyResourceQuery($input: EffectiveResourceAllocationV2Input!) {
        ...MyResourceV2StatisticsFragment @arguments(input: $input)
      }
    `,
    { input: { projectId, resourceGroupName } },
    { fetchPolicy: 'network-only', fetchKey },
  );

  return <MyResourceStatisticsContent queryRef={queryRef} />;
};

const MyResourceStatisticsContent: React.FC<{
  queryRef: MyResourceV2StatisticsFragment$key;
}> = ({ queryRef }) => {
  'use memo';
  const resourceSlotsDetails = useResourceSlotsDetails();
  const data = useFragment(
    graphql`
      fragment MyResourceV2StatisticsFragment on Query
      @argumentDefinitions(
        input: { type: "EffectiveResourceAllocationV2Input!" }
      ) {
        effectiveResourceAllocationV2(input: $input) @catch(to: RESULT) {
          assignable {
            resourceType
            quantity
            unlimited
          }
        }
        myUserResourceAllocationV2 @catch(to: RESULT) {
          user {
            used {
              resourceType
              quantity
            }
            assignable {
              resourceType
              quantity
              unlimited
            }
          }
        }
      }
    `,
    queryRef,
  );

  // Same user-based usage as the dashboard's My Resources card: every keypair's sessions.
  const effective = data.effectiveResourceAllocationV2.ok
    ? data.effectiveResourceAllocationV2.value
    : undefined;
  const user = data.myUserResourceAllocationV2.ok
    ? data.myUserResourceAllocationV2.value?.user
    : undefined;
  const allocation = effective && user ? { effective, user } : undefined;
  const usageRows = allocation
    ? toUsageRows(
        allocation.user.used,
        [allocation.effective.assignable, allocation.user.assignable],
        { dropEmpty: false },
      )
    : [];

  // Raw units (cores, bytes, device counts); the manager's effective limit
  // across scopes, undefined when unlimited.
  const amountsOf = (slot: string) => {
    const row = _.find(usageRows, (entry) => entry.resourceType === slot);
    const limit = row?.limit ?? undefined;
    return {
      used: row?.used ?? 0,
      limit,
      remaining: limit === undefined ? undefined : limit - (row?.used ?? 0),
    };
  };

  const cpuSlot = resourceSlotsDetails?.resourceSlotsInRG?.['cpu'];
  const memSlot = resourceSlotsDetails?.resourceSlotsInRG?.['mem'];
  const cpuAmounts = amountsOf('cpu');
  const memAmounts = amountsOf('mem');

  // Without the allocation there is nothing to show, not zero usage.
  const resourceData = !allocation
    ? NO_RESOURCE_DATA
    : {
        cpu: cpuSlot
          ? {
              used: {
                current: convertToNumber(cpuAmounts.used),
                total: convertToNumber(cpuAmounts.limit),
              },
              free: {
                current: convertToNumber(cpuAmounts.remaining),
                total: convertToNumber(cpuAmounts.limit),
              },
              metadata: {
                title: cpuSlot.human_readable_name,
                displayUnit: cpuSlot.display_unit,
              },
            }
          : null,
        memory: memSlot
          ? {
              used: {
                current: processMemoryValue(
                  memAmounts.used,
                  memSlot.display_unit,
                ),
                total: processMemoryValue(
                  memAmounts.limit,
                  memSlot.display_unit,
                ),
              },
              free: {
                current: processMemoryValue(
                  memAmounts.remaining,
                  memSlot.display_unit,
                ),
                total: processMemoryValue(
                  memAmounts.limit,
                  memSlot.display_unit,
                ),
              },
              metadata: {
                title: memSlot.human_readable_name,
                displayUnit: memSlot.display_unit,
              },
            }
          : null,
        accelerators: _.compact(
          _.map(
            _.omit(resourceSlotsDetails?.resourceSlotsInRG, ['cpu', 'mem']),
            (resourceSlot, key) => {
              if (!resourceSlot) return null;
              const amounts = amountsOf(key);
              return {
                key,
                used: {
                  current: convertToNumber(amounts.used),
                  total: convertToNumber(amounts.limit),
                },
                free: {
                  current: convertToNumber(amounts.remaining),
                  total: convertToNumber(amounts.limit),
                },
                metadata: {
                  title: resourceSlot.human_readable_name,
                  displayUnit: resourceSlot.display_unit,
                },
              };
            },
          ),
        ),
      };

  return (
    <ResourceStatistics
      resourceData={resourceData}
      displayType="used"
      progressMode="normal"
    />
  );
};

export default MyResource;
