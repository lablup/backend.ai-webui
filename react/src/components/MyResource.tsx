/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { MyResourceQuery } from '../__generated__/MyResourceQuery.graphql';
import { MyResourceV2StatisticsFragment$key } from '../__generated__/MyResourceV2StatisticsFragment.graphql';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import ResourceUsageStatistics from './DashboardPanels/memberCards/ResourceUsageStatistics';
import {
  offeredSlotsOf,
  toUsageRows,
} from './DashboardPanels/memberCards/memberCardData';
import { readPrimary, readSecondary } from './DashboardPanels/panelPermission';
import { Heading } from '@lablup/ui-common/Heading';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIBoardItemTitle,
  BAIFlex,
  BAIFlexProps,
  BAIIconWithTooltip,
  ResourceStatistics,
  BAIFetchKeyButton,
  BAISkeleton,
  useFetchKey,
  useIsInBAIBoardItem,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CircleHelp } from 'lucide-react';
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
  const isInBoard = useIsInBAIBoardItem();
  const currentProject = useCurrentProjectValue();

  const [internalFetchKey, updateInternalFetchKey] = useFetchKey();
  const [isPending, startTransition] = useTransition();

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
      {..._.omit(props, ['style'])}
    >
      <BAIBoardItemTitle
        title={
          <BAIFlex gap="xs" wrap="wrap" align="center">
            <Heading level={5}>{t('webui.menu.MyResources')}</Heading>
            <BAIIconWithTooltip
              icon={<CircleHelp size="1em" />}
              content={<Trans i18nKey="webui.menu.MyResourcesDescription" />}
            />
          </BAIFlex>
        }
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
      {/* Off a board the card is taller than its numbers; they sit in its middle. */}
      <BAIFlex
        direction="column"
        align="stretch"
        justify="center"
        style={{ flex: 1 }}
      >
        {/* A transport failure escapes @catch; keep the title and let refresh retry. */}
        <ErrorBoundary
          resetKeys={[fetchKey, internalFetchKey, currentProject.id]}
          fallbackRender={() => (
            <ResourceStatistics
              resourceData={NO_RESOURCE_DATA}
              displayType="used"
              progressMode="normal"
            />
          )}
        >
          <Suspense fallback={<BAISkeleton />}>
            {currentProject.id ? (
              <MyTotalResourceStatistics
                projectId={currentProject.id}
                fetchKey={`${fetchKey}${internalFetchKey}`}
              />
            ) : (
              <ResourceStatistics
                resourceData={NO_RESOURCE_DATA}
                displayType="used"
                progressMode="normal"
              />
            )}
          </Suspense>
        </ErrorBoundary>
      </BAIFlex>
    </BAIFlex>
  );
};

const NO_RESOURCE_DATA = { cpu: null, memory: null, accelerators: [] };

/**
 * The viewer's used-vs-limit per slot across all resource groups, for one
 * project; the session page card and the dashboard card both render it.
 */
export const MyTotalResourceStatistics: React.FC<{
  projectId: string;
  fetchKey: string;
  /** A line under a slot's statistic, keyed by its resource type. */
  notesOf?: (resourceType: string) => React.ReactNode;
}> = ({ projectId, fetchKey, notesOf }) => {
  'use memo';
  const queryRef = useLazyLoadQuery<MyResourceQuery>(
    graphql`
      query MyResourceQuery($projectId: UUID!) {
        ...MyResourceV2StatisticsFragment @arguments(projectId: $projectId)
      }
    `,
    { projectId },
    { fetchPolicy: 'network-only', fetchKey },
  );

  return (
    <MyTotalResourceStatisticsContent queryRef={queryRef} notesOf={notesOf} />
  );
};

const MyTotalResourceStatisticsContent: React.FC<{
  queryRef: MyResourceV2StatisticsFragment$key;
  notesOf?: (resourceType: string) => React.ReactNode;
}> = ({ queryRef, notesOf }) => {
  'use memo';
  // Fields a plain project member can read; the user's figures count every keypair.
  const data = useFragment(
    graphql`
      fragment MyResourceV2StatisticsFragment on Query
      @argumentDefinitions(projectId: { type: "UUID!" }) {
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
        projectResourceAllocationV2(projectId: $projectId) @catch(to: RESULT) {
          project {
            assignable {
              resourceType
              quantity
              unlimited
            }
          }
        }
        scopedResourceGroups(
          scope: { project: [{ value: $projectId }] }
          limit: 100
        ) @catch(to: RESULT) {
          edges {
            node {
              resourceInfo {
                capacity {
                  entries {
                    resourceType
                    quantity
                  }
                }
              }
            }
          }
        }
      }
    `,
    queryRef,
  );
  const user = readPrimary(data.myUserResourceAllocationV2)?.user;
  const project = readSecondary(data.projectResourceAllocationV2).value
    ?.project;
  // Only the slots some group of the project offers; the allocation lists every slot the manager knows.
  const groupSlots = _.compact(
    _.map(readSecondary(data.scopedResourceGroups).value?.edges, (edge) =>
      offeredSlotsOf(edge?.node?.resourceInfo?.capacity.entries),
    ),
  );
  const slots = groupSlots.length
    ? new Set(groupSlots.flatMap((offered) => [...offered]))
    : undefined;

  return (
    <ResourceUsageStatistics
      notesOf={notesOf}
      rows={
        user
          ? toUsageRows(
              user.used,
              [user.assignable, project?.assignable ?? []],
              {
                slots,
              },
            )
          : []
      }
    />
  );
};

export default MyResource;
