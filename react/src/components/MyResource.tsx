/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { MyResourceQuery } from '../__generated__/MyResourceQuery.graphql';
import { MyResourceV2StatisticsFragment$key } from '../__generated__/MyResourceV2StatisticsFragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { ResourceSlotName, useResourceSlotsDetails } from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useResourceLimitAndRemaining } from '../hooks/useResourceLimitAndRemaining';
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
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

type ResourceData = React.ComponentProps<
  typeof ResourceStatistics
>['resourceData'];

const EMPTY_RESOURCE_DATA: ResourceData = {
  cpu: null,
  memory: null,
  accelerators: [],
};

// A slot's figures in raw units (cores, bytes, device counts). An undefined
// `limit` / `remaining` means unlimited.
interface SlotAmounts {
  used: number | string;
  limit?: number | string;
  remaining?: number | string;
}

const useBuildResourceData = () => {
  'use memo';
  const resourceSlotsDetails = useResourceSlotsDetails();

  return (getAmounts: (slot: string) => SlotAmounts): ResourceData => {
    const cpuSlot = resourceSlotsDetails?.resourceSlotsInRG?.['cpu'];
    const memSlot = resourceSlotsDetails?.resourceSlotsInRG?.['mem'];

    const cpuAmounts = getAmounts('cpu');
    const memAmounts = getAmounts('mem');

    const cpu = cpuSlot
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
      : null;

    const memory = memSlot
      ? {
          used: {
            current: processMemoryValue(memAmounts.used, memSlot.display_unit),
            total: processMemoryValue(memAmounts.limit, memSlot.display_unit),
          },
          free: {
            current: processMemoryValue(
              memAmounts.remaining,
              memSlot.display_unit,
            ),
            total: processMemoryValue(memAmounts.limit, memSlot.display_unit),
          },
          metadata: {
            title: memSlot.human_readable_name,
            displayUnit: memSlot.display_unit,
          },
        }
      : null;

    const accelerators = _.compact(
      _.map(
        _.omit(resourceSlotsDetails?.resourceSlotsInRG, ['cpu', 'mem']),
        (resourceSlot, key) => {
          if (!resourceSlot) return null;
          const amounts = getAmounts(key);
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
    );

    return { cpu, memory, accelerators };
  };
};

interface MyResourceProps extends BAIFlexProps {
  fetchKey?: string;
  refetching?: boolean;
  extra?: ReactNode;
}

const MyResource: React.FC<MyResourceProps> = ({
  fetchKey,
  refetching,
  extra,
  ...props
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const baiClient = useSuspendedBackendaiClient();
  const isAllocationV2Supported =
    baiClient.isManagerVersionCompatibleWith('26.4.2');

  const [internalFetchKey, updateInternalFetchKey] = useFetchKey();
  const [isPending, startTransition] = useTransition();
  const mergedFetchKey = `${fetchKey}${internalFetchKey}`;

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
      <Suspense fallback={<BAISkeleton />}>
        {isAllocationV2Supported ? (
          <MyResourceV2Statistics fetchKey={mergedFetchKey} />
        ) : (
          <MyResourceLegacyStatistics fetchKey={mergedFetchKey} />
        )}
      </Suspense>
    </BAIFlex>
  );
};

const MyResourceV2Statistics: React.FC<{ fetchKey: string }> = ({
  fetchKey,
}) => {
  'use memo';
  const currentProject = useCurrentProjectValue();
  if (!currentProject.id) {
    throw new Error('Project id is required for MyResource');
  }

  const queryRef = useLazyLoadQuery<MyResourceQuery>(
    graphql`
      query MyResourceQuery($projectId: UUID!) {
        ...MyResourceV2StatisticsFragment @arguments(projectId: $projectId)
      }
    `,
    { projectId: currentProject.id },
    { fetchPolicy: 'network-only', fetchKey },
  );

  return <MyResourceV2StatisticsContent queryRef={queryRef} />;
};

type LimitEntries = ReadonlyArray<{
  readonly resourceType: string;
  readonly quantity: unknown;
  readonly unlimited: boolean;
}>;

// Undefined when the slot is unlimited; a slot with no entry is unlimited too.
const finiteQuantity = (entries: LimitEntries | undefined, slot: string) => {
  const entry = _.find(entries, (e) => e.resourceType === slot);
  return !entry || entry.unlimited || entry.quantity == null
    ? undefined
    : _.toNumber(entry.quantity);
};

const smallestFinite = (...values: Array<number | undefined>) =>
  _.min(_.filter(values, (v): v is number => v !== undefined));

const MyResourceV2StatisticsContent: React.FC<{
  queryRef: MyResourceV2StatisticsFragment$key;
}> = ({ queryRef }) => {
  'use memo';
  const buildResourceData = useBuildResourceData();
  const data = useFragment(
    graphql`
      fragment MyResourceV2StatisticsFragment on Query
      @argumentDefinitions(projectId: { type: "UUID!" }) {
        myKeypairResourceAllocationV2 @catch(to: RESULT) {
          keypair {
            used {
              resourceType
              quantity
            }
            limits {
              resourceType
              quantity
              unlimited
            }
            assignable {
              resourceType
              quantity
              unlimited
            }
          }
        }
        projectResourceAllocationV2(projectId: $projectId) @catch(to: RESULT) {
          project {
            limits {
              resourceType
              quantity
              unlimited
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

  const keypair = data.myKeypairResourceAllocationV2.ok
    ? data.myKeypairResourceAllocationV2.value?.keypair
    : undefined;
  // Without the keypair figures there is nothing to show, not zero usage.
  if (!keypair) {
    return (
      <ResourceStatistics
        resourceData={EMPTY_RESOURCE_DATA}
        displayType="used"
        progressMode="normal"
      />
    );
  }
  const project = data.projectResourceAllocationV2.ok
    ? data.projectResourceAllocationV2.value?.project
    : undefined;

  const resourceData = buildResourceData((slot) => ({
    // The payload omits slots the keypair holds nothing of: that is 0 used.
    used: _.find(keypair.used, (e) => e.resourceType === slot)?.quantity ?? 0,
    limit: smallestFinite(
      finiteQuantity(keypair.limits, slot),
      finiteQuantity(project?.limits, slot),
    ),
    remaining: smallestFinite(
      finiteQuantity(keypair.assignable, slot),
      finiteQuantity(project?.assignable, slot),
    ),
  }));

  return (
    <ResourceStatistics
      resourceData={resourceData}
      displayType="used"
      progressMode="normal"
    />
  );
};

// Managers before 26.4.2 have no allocation V2 queries: read REST check-presets.
const MyResourceLegacyStatistics: React.FC<{ fetchKey: string }> = ({
  fetchKey,
}) => {
  'use memo';
  const currentProject = useCurrentProjectValue();
  const buildResourceData = useBuildResourceData();
  if (!currentProject.name) {
    throw new Error('Project name is required for MyResource');
  }
  const [
    {
      checkPresetInfo,
      resourceLimitsWithoutResourceGroup,
      remainingWithoutResourceGroup,
    },
  ] = useResourceLimitAndRemaining({
    currentProjectName: currentProject.name,
    ignorePerContainerConfig: true,
    fetchKey,
  });

  // A failed request is a no-data state, not zero usage across every slot.
  const resourceData = !checkPresetInfo
    ? EMPTY_RESOURCE_DATA
    : buildResourceData((slot) => {
        // The payload omits slots the keypair holds nothing of: that is 0 used.
        const used =
          checkPresetInfo.keypair_using[slot as ResourceSlotName] ?? 0;
        if (slot === 'cpu' || slot === 'mem') {
          return {
            used,
            limit: resourceLimitsWithoutResourceGroup[slot]?.max,
            remaining: remainingWithoutResourceGroup[slot],
          };
        }
        return {
          used,
          limit: resourceLimitsWithoutResourceGroup.accelerators[slot]?.max,
          remaining: remainingWithoutResourceGroup.accelerators[slot],
        };
      });

  return (
    <ResourceStatistics
      resourceData={resourceData}
      displayType="used"
      progressMode="normal"
    />
  );
};

export default MyResource;
