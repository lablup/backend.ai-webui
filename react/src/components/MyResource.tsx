/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { MyResourceQuery } from '../__generated__/MyResourceQuery.graphql';
import { MyResourceV2StatisticsFragment$key } from '../__generated__/MyResourceV2StatisticsFragment.graphql';
import { useResourceSlotsDetails } from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
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
        <MyResourceStatistics fetchKey={`${fetchKey}${internalFetchKey}`} />
      </Suspense>
    </BAIFlex>
  );
};

const MyResourceStatistics: React.FC<{ fetchKey: string }> = ({ fetchKey }) => {
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

  return <MyResourceStatisticsContent queryRef={queryRef} />;
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

const MyResourceStatisticsContent: React.FC<{
  queryRef: MyResourceV2StatisticsFragment$key;
}> = ({ queryRef }) => {
  'use memo';
  const resourceSlotsDetails = useResourceSlotsDetails();
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
  const project = data.projectResourceAllocationV2.ok
    ? data.projectResourceAllocationV2.value?.project
    : undefined;

  // Raw units (cores, bytes, device counts); an undefined limit or remaining
  // means unlimited, and a slot the keypair holds nothing of is 0 used.
  const amountsOf = (slot: string) => ({
    used: _.find(keypair?.used, (e) => e.resourceType === slot)?.quantity ?? 0,
    limit: smallestFinite(
      finiteQuantity(keypair?.limits, slot),
      finiteQuantity(project?.limits, slot),
    ),
    remaining: smallestFinite(
      finiteQuantity(keypair?.assignable, slot),
      finiteQuantity(project?.assignable, slot),
    ),
  });

  const cpuSlot = resourceSlotsDetails?.resourceSlotsInRG?.['cpu'];
  const memSlot = resourceSlotsDetails?.resourceSlotsInRG?.['mem'];
  const cpuAmounts = amountsOf('cpu');
  const memAmounts = amountsOf('mem');

  // Without the keypair figures there is nothing to show, not zero usage.
  const resourceData = !keypair
    ? { cpu: null, memory: null, accelerators: [] }
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
