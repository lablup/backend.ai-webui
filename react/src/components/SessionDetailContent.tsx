/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ScopedAuditLogQuery as ScopedAuditLogQueryType } from '../__generated__/ScopedAuditLogQuery.graphql';
import { SessionDetailContentFragment$key } from '../__generated__/SessionDetailContentFragment.graphql';
import { SessionDetailContentQuery } from '../__generated__/SessionDetailContentQuery.graphql';
import { convertToBinaryUnit } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import {
  useCurrentUserInfo,
  useCurrentUserRole,
  useResourceSlotsDetails,
} from '../hooks/backendai';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { ResourceNumbersOfSession } from '../pages/SessionLauncherPage';
import { useBAIBreakpoint } from '../theme-shim';
import BAIErrorBoundary from './BAIErrorBoundary';
import CodeHighlighterModal from './CodeHighlighterModal';
import ConnectedKernelList from './ComputeSessionNodeItems/ConnectedKernelList';
import EditableSessionName from './ComputeSessionNodeItems/EditableSessionName';
import SessionActionButtons from './ComputeSessionNodeItems/SessionActionButtons';
import SessionIdleChecks, {
  IdleChecks,
} from './ComputeSessionNodeItems/SessionIdleChecks';
import SessionReservation from './ComputeSessionNodeItems/SessionReservation';
import SessionStatusDetailModal from './ComputeSessionNodeItems/SessionStatusDetailModal';
import SessionStatusTag from './ComputeSessionNodeItems/SessionStatusTag';
import IdleCheckDescriptionModal from './IdleCheckDescriptionModal';
import ImageNodeSimpleTag from './ImageNodeSimpleTag';
import { UNSAFELazySessionImageTag } from './ImageTags';
import MountedVFolderLinks from './MountedVFolderLinks';
import ScopedAuditLog, { ScopedAuditLogQuery } from './ScopedAuditLog';
import { getUnifiedSlotNameFromTag } from './SessionFormItems/ResourceAllocationFormItems';
import SessionSchedulingHistoryModal from './SessionSchedulingHistoryModal';
import SessionUsageMonitor from './SessionUsageMonitor';
import BAISkeletonAstryx from './astryx-bui/BAISkeletonAstryx';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  BAIFlex,
  BAILink,
  BAISessionAgentIds,
  BAISessionClusterMode,
  BAISessionTypeTag,
  BAIText,
  INITIAL_FETCH_KEY,
  UNSAFELazyUserEmailView,
  filterOutNullAndUndefined,
  toGlobalId,
  useMemoizedJSONParse,
  useToggle,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { History, Info, CircleHelp, TriangleAlert } from 'lucide-react';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useQueryLoader,
} from 'react-relay';
import { useLocation } from 'react-router-dom';

// When a session is tagged as using a unified-memory accelerator slot, its
// quantity is auto-allocated and not meaningfully stored in `requested_slots`.
// Surface that slot as the accelerator type so `ResourceNumbersOfSession`
// renders it as the device description, and drop it from the numeric slot map
// to avoid showing it twice.
const buildResourceWithUnifiedSlot = (
  requestedSlots?: string | null,
  tag?: string | null,
) => {
  const slots = JSON.parse(requestedSlots || '{}');
  const unifiedSlotName = getUnifiedSlotNameFromTag(tag);
  return unifiedSlotName
    ? { ..._.omit(slots, unifiedSlotName), acceleratorType: unifiedSlotName }
    : slots;
};

// Parse a resource-slot JSON string into a numeric map, dropping zero-valued
// slots so that requested vs. allocated slots compare equal when they only
// differ by absent/zero entries.
const parseSlotsToNumbers = (slots?: string | null) =>
  _.omitBy(
    _.mapValues(JSON.parse(slots || '{}'), (value) => _.toNumber(value)),
    (value) => value === 0,
  );

const SessionDetailContent: React.FC<{
  id: string;
  sessionFrgmt?: SessionDetailContentFragment$key | null;
  fetchKey?: string;
}> = ({ id, fetchKey, sessionFrgmt }) => {
  'use memo';
  const { t } = useTranslation();
  const { md } = useBAIBreakpoint();
  const { mergedResourceSlots } = useResourceSlotsDetails();
  const location = useLocation();

  const currentProject = useCurrentProjectValue();
  if (!currentProject.id) {
    throw new Error('Project ID is required for SessionDetailContent');
  }
  const [currentUser] = useCurrentUserInfo();
  const userRole = useCurrentUserRole();
  const baiClient = useSuspendedBackendaiClient();
  const supportsSessionSchedulingHistory = baiClient.supports(
    'session-scheduling-history',
  );

  const [openIdleCheckDescriptionModal, setOpenIdleCheckDescriptionModal] =
    useState<boolean>(false);
  const [openStatusDetailModal, setOpenStatusDetailModal] =
    useState<boolean>(false);
  // PILOT-DECISION (ticket 17): the usage-target antd Select rendered with
  // `display: 'none'` (dead UI); it is removed instead of being ported to an
  // Astryx Selector, and the display target stays at its only reachable value.
  const usageMonitorDisplayTarget = 'current' as const;
  const [activeTabKey, setActiveTabKey] = useState<'kernels' | 'auditLog'>(
    'kernels',
  );
  const [openCodeHighlighterModal, { toggle: toggleOpenCodeHighlighterModal }] =
    useToggle(false);
  const [
    openSessionSchedulingHistoryModal,
    { toggle: toggleOpenSessionSchedulingHistoryModal },
  ] = useToggle(false);
  const [auditLogQueryRef, loadAuditLogQuery] =
    useQueryLoader<ScopedAuditLogQueryType>(ScopedAuditLogQuery);

  const { baiPaginationOption, setTablePaginationOption } =
    useBAIPaginationOptionState({ current: 1, pageSize: 10 });
  const reloadAuditLogQuery: React.ComponentProps<
    typeof ScopedAuditLog
  >['onReload'] = (variables, options) => {
    const limit = variables.limit ?? 10;
    setTablePaginationOption({
      pageSize: limit,
      current: variables.offset ? Math.floor(variables.offset / limit) + 1 : 1,
    });
    loadAuditLogQuery(variables, options);
  };

  // TODO: Remove useLazyLoadQuery and use useRefetchableFragment instead of useFragment to fetch session data when deprecatedProjectId is removed.
  const { internalLoadedSession } = useLazyLoadQuery<SessionDetailContentQuery>(
    graphql`
      query SessionDetailContentQuery($id: GlobalIDField!) {
        internalLoadedSession: compute_session_node(id: $id) {
          ...SessionDetailContentFragment
        }
      }
    `,
    {
      id: toGlobalId('ComputeSessionNode', id),
    },
    {
      fetchPolicy:
        // Only use network when sessionFrgmt is not provided on initial fetch
        fetchKey === INITIAL_FETCH_KEY
          ? sessionFrgmt
            ? 'store-only'
            : 'store-and-network' // initial fetch
          : 'network-only',
      fetchKey: fetchKey,
    },
  );

  const session = useFragment(
    graphql`
      fragment SessionDetailContentFragment on ComputeSessionNode {
        id
        row_id
        name
        project_id
        user_id
        owner @since(version: "25.13.0") {
          email
        }
        resource_opts
        status
        status_data
        vfolder_mounts
        vfolder_nodes @since(version: "25.4.0") {
          edges {
            node {
              ...FolderLink_vfolderNode
            }
          }
          count
        }
        created_at @required(action: NONE)
        terminated_at
        scaling_group
        agent_ids
        requested_slots
        occupied_slots
        tag
        idle_checks @since(version: "24.12.0")
        type
        startup_command

        kernel_nodes {
          edges {
            node {
              image {
                ...ImageNodeSimpleTagFragment
              }
              ...ConnectedKernelListFragment
            }
          }
        }

        dependees {
          edges {
            node {
              id
              row_id
              name
              status
            }
          }
          count
        }
        dependents {
          edges {
            node {
              id
              row_id
              name
              status
            }
          }
          count
        }

        ...SessionStatusTagFragment
        ...SessionActionButtonsFragment
        ...BAISessionTypeTagFragment
        ...EditableSessionNameFragment
        ...SessionReservationFragment
        ...ContainerLogModalFragment
        ...SessionUsageMonitorFragment
        ...ContainerCommitModalFragment
        ...SessionIdleChecksNodeFragment
        ...SessionStatusDetailModalFragment
        ...AppLauncherModalFragment
        ...MountedVFolderLinksFragment
        ...BAISessionAgentIdsFragment
        ...BAISessionClusterModeFragment
      }
    `,
    (internalLoadedSession as SessionDetailContentFragment$key) || sessionFrgmt,
  );

  // The feature to display imminent expiration time as a separate Alert is supported from version 24.12.
  const imminentExpirationTime = _.min(
    _.values(
      useMemoizedJSONParse<IdleChecks>(session?.idle_checks, {
        fallbackValue: {},
      }),
    )
      .map((check) => check.remaining)
      .filter(Boolean),
  );

  const resolvedProjectIdOfSession = session?.project_id;

  // Pass both the requested and the actually-allocated (occupied_slots)
  // resources to `ResourceNumbersOfSession`, which surfaces the allocation as
  // the primary value and renders any differing slot as `allocated / requested`
  // (the requested amount shown as a muted reference). Here we only additionally
  // compute whether *any* slot differs, to flag the section label with a warning
  // icon.
  const requestedResource = buildResourceWithUnifiedSlot(
    session?.requested_slots,
    session?.tag,
  );
  const occupiedResource = buildResourceWithUnifiedSlot(
    session?.occupied_slots,
    session?.tag,
  );
  const hasOccupiedSlots = !_.isEmpty(
    parseSlotsToNumbers(session?.occupied_slots),
  );
  // The unified-memory accelerator slot is auto-allocated and rendered as a
  // quantity-less chip (it is stripped from the numeric map by
  // `buildResourceWithUnifiedSlot`), so exclude it from the comparison to match
  // what is actually displayed.
  const unifiedSlotName = getUnifiedSlotNameFromTag(session?.tag) ?? '';
  const requestedSlotNumbers = _.omit(
    parseSlotsToNumbers(session?.requested_slots),
    unifiedSlotName,
  ) as Record<string, number>;
  const occupiedSlotNumbers = _.omit(
    parseSlotsToNumbers(session?.occupied_slots),
    unifiedSlotName,
  ) as Record<string, number>;
  // Normalize a slot value to its displayed precision (binary slots render as
  // GiB with 2 decimals; the rest round to the slot's `round_length`) so the
  // label warning only fires on a difference the user can actually see —
  // matching the per-chip sub-precision guard in `BAIResourceNumberWithIcon`.
  const toDisplayedNumber = (slotType: string, value: number) => {
    const numberFormat = mergedResourceSlots?.[slotType]?.number_format;
    const roundLength = numberFormat?.round_length || 0;
    return numberFormat?.binary
      ? Number(convertToBinaryUnit(value.toString(), 'g', 2, true)?.numberFixed)
      : roundLength > 0
        ? Number(value.toFixed(roundLength))
        : value;
  };
  // Slot types whose allocated amount is *less* than what was requested — the
  // round-down case the `AllocatedLessThanRequested` warning label describes.
  // Only meaningful once the session is actually allocated (occupied_slots
  // present). Detection is directional (`occupied < requested`) to match the
  // directional label copy; the neutral per-chip `allocated / requested`
  // rendering (which fires on any difference) is computed inside
  // `ResourceNumbersOfSession` itself.
  const slotTypesAllocatedLessThanRequested = hasOccupiedSlots
    ? _.union(_.keys(requestedSlotNumbers), _.keys(occupiedSlotNumbers)).filter(
        (slotType) =>
          toDisplayedNumber(slotType, occupiedSlotNumbers[slotType] ?? 0) <
          toDisplayedNumber(slotType, requestedSlotNumbers[slotType] ?? 0),
      )
    : [];
  const hasResourceAllocationDifference =
    slotTypesAllocatedLessThanRequested.length > 0;

  return session ? (
    <BAIFlex direction="column" gap={'lg'} align="stretch">
      {resolvedProjectIdOfSession !== currentProject.id && (
        <Banner status="warning" title={t('session.NotInProject')} />
      )}
      {currentUser.uuid !== session?.user_id && (
        <Banner status="warning" title={t('session.AnotherUserSession')} />
      )}
      {imminentExpirationTime && imminentExpirationTime < 3600 && (
        <Banner
          status="warning"
          title={t('session.IdleCheckExpirationWarning')}
        />
      )}
      <BAIFlex direction="column" gap={'sm'} align="stretch">
        <BAIFlex
          direction="row"
          justify="between"
          align="start"
          style={{
            alignSelf: 'stretch',
          }}
          gap={'sm'}
        >
          <EditableSessionName
            sessionFrgmt={session}
            level={3}
            dimmed={['TERMINATED', 'CANCELLED'].includes(session.status || '')}
            editable={
              !['TERMINATED', 'CANCELLED'].includes(session.status || '')
            }
          />
          <SessionActionButtons size={'large'} compact sessionFrgmt={session} />
        </BAIFlex>

        {/* antd `Descriptions bordered` -> Astryx MetadataList.
            PILOT-DECISION (ticket 17): `bordered` and per-item `span` have no
            MetadataList equivalent (MAPPING.md §4) and are dropped; JSX labels
            (warning triangle / help icon) split so the label stays a plain
            string and the icon affordance moves into the value cell (P2). */}
        <MetadataList columns={md ? 2 : 1}>
          <MetadataListItem label={t('session.SessionId')}>
            <BAIText code copyable ellipsis={{ tooltip: true }}>
              {session.row_id ?? ''}
            </BAIText>
          </MetadataListItem>
          {(userRole === 'admin' || userRole === 'superadmin') && (
            <MetadataListItem label={t('credential.UserID')}>
              {session.owner?.email ? (
                session.owner.email
              ) : session.user_id ? (
                <Suspense
                  fallback={<BAISkeletonAstryx variant="input" size="small" />}
                >
                  <UNSAFELazyUserEmailView uuid={session.user_id} />
                </Suspense>
              ) : (
                '-'
              )}
            </MetadataListItem>
          )}
          <MetadataListItem label={t('session.Status')}>
            <BAIFlex>
              <SessionStatusTag
                sessionFrgmt={session}
                showInfo={!supportsSessionSchedulingHistory}
              />
              {/* QA-FINDINGS Q-37 — both controls in this row were antd
                  `type="link"` buttons (`Button` / `BAIButton`), i.e. painted
                  `colorLink` #FF7A00. The conversion to `IconButton
                  variant="ghost"` dropped the tint to `--color-text-primary`
                  (measured rgb(20,20,20) light / rgb(255,255,255) dark),
                  which is what "버튼 색깔이 default 라서 클릭 가능한지 알기
                  힘듭니다" is describing. `.bai-action-accent` restores it
                  through `--color-text-accent`, which resolves to exactly
                  `colorLink` here and to `colorInfo` under the admin theme —
                  see `packages/backend.ai-ui/src/styles/actionAccent.css`. */}
              {!supportsSessionSchedulingHistory &&
              session?.status_data &&
              session?.status_data !== '{}' ? (
                <IconButton
                  className="bai-action-accent"
                  variant="ghost"
                  size="sm"
                  icon={<Info size="1em" />}
                  label={t('button.ClickForMoreDetails')}
                  tooltip={t('button.ClickForMoreDetails')}
                  onClick={() => {
                    setOpenStatusDetailModal(true);
                  }}
                />
              ) : null}
              {supportsSessionSchedulingHistory && (
                <IconButton
                  className="bai-action-accent"
                  variant="ghost"
                  size="sm"
                  icon={<History size="1em" />}
                  label={t('session.SessionSchedulingHistory')}
                  tooltip={t('session.SessionSchedulingHistory')}
                  onClick={() => toggleOpenSessionSchedulingHistoryModal()}
                />
              )}
            </BAIFlex>
          </MetadataListItem>
          <MetadataListItem label={t('session.SessionType')}>
            {/* QA-FINDINGS Q-36 — the `<dd>` a `MetadataListItem` renders is
                `display: block`, so a tag and an icon button dropped in as
                siblings are two inline-flex boxes sitting on the SAME TEXT
                BASELINE, not on a shared centre line. Their content boxes have
                different heights, so aligning their baselines puts their
                centres 4px apart. The Status row above already avoids this by
                wrapping its identical tag+IconButton pair in a `BAIFlex`
                (default `align: center`), which replaces baseline alignment
                with cross-axis centring; this row now does the same. Note this
                is NOT a migration regression — antd's
                `.ant-descriptions-item-content` was `display: table-cell` and
                laid the same pair out on the same baseline, so legacy was 4px
                off too. */}
            <BAIFlex>
              <BAISessionTypeTag sessionFrgmt={session} />
              {/* QA-FINDINGS Q-37 — legacy `BAIButton type="link"`, so the
                  accent here is a straight parity restoration. */}
              {session.type === 'batch' && session.startup_command && (
                <IconButton
                  className="bai-action-accent"
                  variant="ghost"
                  size="sm"
                  icon={<Info size="1em" />}
                  label={t('session.ViewStartupCommand')}
                  tooltip={t('session.ViewStartupCommand')}
                  onClick={() => toggleOpenCodeHighlighterModal()}
                />
              )}
            </BAIFlex>
          </MetadataListItem>
          <MetadataListItem label={t('session.launcher.Environments')}>
            {session.kernel_nodes?.edges[0]?.node?.image ? (
              <ImageNodeSimpleTag
                imageFrgmt={session.kernel_nodes?.edges[0]?.node?.image || null}
              />
            ) : session.row_id ? (
              <Suspense
                fallback={<BAISkeletonAstryx variant="input" size="small" />}
              >
                <UNSAFELazySessionImageTag sessionId={session.row_id} />
              </Suspense>
            ) : null}
          </MetadataListItem>
          <MetadataListItem label={t('session.launcher.MountedFolders')}>
            <BAIFlex gap="xs" wrap="wrap">
              <MountedVFolderLinks sessionFrgmt={session} />
            </BAIFlex>
          </MetadataListItem>
          <MetadataListItem label={t('session.launcher.ResourceAllocation')}>
            <BAIFlex gap={'sm'} wrap="wrap" align="center">
              {hasResourceAllocationDifference && (
                <Tooltip content={t('session.AllocatedLessThanRequested')}>
                  <TriangleAlert
                    size="1em"
                    style={{ color: 'var(--color-warning)' }}
                  />
                </Tooltip>
              )}
              <Tooltip content={t('session.ResourceGroup')}>
                <Badge label={session.scaling_group} />
              </Tooltip>
              <ResourceNumbersOfSession
                resource={
                  hasOccupiedSlots ? occupiedResource : requestedResource
                }
                comparedResource={
                  hasOccupiedSlots ? requestedResource : undefined
                }
                showDividers
              />
            </BAIFlex>
          </MetadataListItem>
          <MetadataListItem label={t('session.Agent')}>
            <BAISessionAgentIds sessionFrgmt={session} />
          </MetadataListItem>
          <MetadataListItem label={t('session.Reservation')}>
            <BAIFlex gap={'xs'} wrap={'wrap'}>
              <SessionReservation sessionFrgmt={session} />
            </BAIFlex>
          </MetadataListItem>
          <MetadataListItem label={t('session.ClusterMode')}>
            <BAISessionClusterMode sessionFrgmt={session} showSize />
          </MetadataListItem>
          {baiClient.supports('idle-checks-gql') &&
          session.status === 'RUNNING' &&
          imminentExpirationTime ? (
            <MetadataListItem label={t('session.ReclamationStatus')}>
              <BAIFlex gap="xxs" align="start">
                <Suspense
                  fallback={<BAISkeletonAstryx variant="input" size="small" />}
                >
                  <SessionIdleChecks
                    sessionNodeFrgmt={session}
                    direction={md ? 'row' : 'column'}
                  />
                </Suspense>
                {/* QA-FINDINGS Q-37 — recorded honestly: this one is NOT a
                    parity restoration. Legacy rendered a bare
                    `<QuestionCircleOutlined style={{cursor:'pointer'}}>` in the
                    Descriptions LABEL, at the label's inherited neutral colour,
                    so antd never tinted it either. It gets the accent anyway
                    because it is a real action affordance (opens
                    `IdleCheckDescriptionModal`) and it now sits in the drawer's
                    content column alongside the two ⓘ buttons above — leaving
                    one of three identical `size="sm"` ghost glyphs black while
                    the others are accent would read as an inconsistency rather
                    than a distinction. The report "세션 디테일 드로어에서 i 가
                    클릭 가능한지 인식하기 어렵네요" names this glyph class. */}
                <IconButton
                  className="bai-action-accent"
                  variant="ghost"
                  size="sm"
                  icon={<CircleHelp size="1em" />}
                  label={t('button.ClickForMoreDetails')}
                  tooltip={t('button.ClickForMoreDetails')}
                  onClick={() => setOpenIdleCheckDescriptionModal(true)}
                />
              </BAIFlex>
            </MetadataListItem>
          ) : null}
          <MetadataListItem label={t('session.ResourceUsage')}>
            <SessionUsageMonitor
              sessionFrgmt={session}
              displayTarget={usageMonitorDisplayTarget}
            />
          </MetadataListItem>
          {(session.dependees?.count ?? 0) > 0 && (
            <MetadataListItem label={t('session.DependsOn')}>
              <BAIFlex gap="xs" wrap="wrap">
                {session.dependees?.edges
                  ?.map((edge) => edge?.node)
                  .filter(Boolean)
                  .map((node) => {
                    const searchParams = new URLSearchParams(location.search);
                    if (node?.row_id) {
                      searchParams.set('sessionDetail', node.row_id);
                    }
                    return (
                      <BAILink
                        key={node?.row_id}
                        type="hover"
                        to={{
                          pathname: location.pathname,
                          search: searchParams.toString(),
                        }}
                      >
                        {node?.name}
                      </BAILink>
                    );
                  })}
              </BAIFlex>
            </MetadataListItem>
          )}
          {(session.dependents?.count ?? 0) > 0 && (
            <MetadataListItem label={t('session.DependedByOthers')}>
              <BAIFlex gap="xs" wrap="wrap">
                {session.dependents?.edges
                  ?.map((edge) => edge?.node)
                  .filter(Boolean)
                  .map((node) => {
                    const searchParams = new URLSearchParams(location.search);
                    if (node?.row_id) {
                      searchParams.set('sessionDetail', node.row_id);
                    }
                    return (
                      <BAILink
                        key={node?.row_id}
                        type="hover"
                        to={{
                          pathname: location.pathname,
                          search: searchParams.toString(),
                        }}
                      >
                        {node?.name}
                      </BAILink>
                    );
                  })}
              </BAIFlex>
            </MetadataListItem>
          )}
        </MetadataList>
      </BAIFlex>
      {/* antd `Tabs` -> Astryx `TabList` + `Tab` (navigation only — the
          panels are rendered below; MAPPING.md §4). */}
      <BAIFlex direction="column" align="stretch" gap="sm">
        <TabList
          value={activeTabKey}
          onChange={(key) => {
            if (key === 'auditLog' && session.row_id && !auditLogQueryRef) {
              loadAuditLogQuery(
                {
                  scope: {
                    entity: [
                      { entityType: 'SESSION', entityId: session.row_id },
                    ],
                  },
                  orderBy: [{ field: 'CREATED_AT', direction: 'DESC' }],
                  limit: baiPaginationOption.limit,
                  offset: baiPaginationOption.offset,
                },
                { fetchPolicy: 'store-and-network' },
              );
            }
            setActiveTabKey(key as 'kernels' | 'auditLog');
          }}
        >
          <Tab value="kernels" label={t('kernel.Kernels')} />
          {session.row_id ? (
            <Tab value="auditLog" label={t('auditLog.AuditLog')} />
          ) : null}
        </TabList>
        {activeTabKey === 'kernels' && (
          <Suspense fallback={<BAISkeletonAstryx />}>
            <ConnectedKernelList
              kernelsFrgmt={filterOutNullAndUndefined(
                session.kernel_nodes?.edges.map((e) => e?.node),
              )}
              sessionFrgmtForLogModal={session}
            />
          </Suspense>
        )}
        {activeTabKey === 'auditLog' && session.row_id && (
          <BAIErrorBoundary>
            {auditLogQueryRef ? (
              <Suspense fallback={<BAISkeletonAstryx />}>
                <ScopedAuditLog
                  queryRef={auditLogQueryRef}
                  onReload={reloadAuditLogQuery}
                  tableSettings={{}}
                />
              </Suspense>
            ) : (
              <BAISkeletonAstryx />
            )}
          </BAIErrorBoundary>
        )}
      </BAIFlex>
      <IdleCheckDescriptionModal
        open={openIdleCheckDescriptionModal}
        onCancel={() => setOpenIdleCheckDescriptionModal(false)}
      />
      <CodeHighlighterModal
        open={openCodeHighlighterModal}
        language="shell"
        content={session.startup_command || ''}
        title={t('session.StartupCommand')}
        footer={
          <Button
            variant="primary"
            label={t('button.Close')}
            onClick={() => {
              toggleOpenCodeHighlighterModal();
            }}
          />
        }
        onCancel={toggleOpenCodeHighlighterModal}
      />
      <SessionSchedulingHistoryModal
        sessionId={id}
        open={openSessionSchedulingHistoryModal}
        onCancel={toggleOpenSessionSchedulingHistoryModal}
      />
      <SessionStatusDetailModal
        sessionFrgmt={session}
        open={openStatusDetailModal}
        onCancel={() => setOpenStatusDetailModal(false)}
      />
    </BAIFlex>
  ) : (
    <Banner
      status="error"
      title={t('session.SessionNotFound')}
      description={id}
    />
  );
};

export default SessionDetailContent;
