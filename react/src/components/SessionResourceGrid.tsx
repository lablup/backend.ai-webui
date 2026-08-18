/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Session resource grid (FR-3570): the user session list's grid view.
 Sessions from the legacy `compute_session_list` are quantized into unit
 cells (resource or kernel mode) and rendered by <BAIResourceUnitGrid>;
 this wrapper owns the query, the controls, the semantic utilization
 colors, and the popover content.
 */
import { SessionResourceGridQuery } from '../__generated__/SessionResourceGridQuery.graphql';
import { formatDuration } from '../helper';
import {
  mergeKernelLiveStats,
  parseLiveStat,
  SessionLiveStats,
} from '../helper/mergeKernelLiveStats';
import {
  availableLiveStatMetrics,
  availableResourceOptions,
  isNotYetAllocatedSession,
  MAX_UNITS_PER_SESSION,
  memKeyForSlot,
  parseResourceValue,
  parseSlotMap,
  SESSION_CAP,
  sessionGridMemUnitValues,
  sessionGridModeValues,
  sessionGridUnits,
  sessionHasResource,
  sessionUtilizationPct,
  SlotMap,
  utilizationFill,
  UtilizationFills,
} from '../helper/sessionResourceGridData';
import {
  UTILIZATION_ERROR_PERCENT,
  UTILIZATION_WARNING_PERCENT,
} from '../helper/utilizationThresholds';
import { useResourceSlotsDetails } from '../hooks/backendai';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import './SessionResourceGrid.css';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { Divider } from '@astryxdesign/core/Divider';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import { Selector } from '@astryxdesign/core/Selector';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIFlex,
  BAIResourceUnitGrid,
  BAIUnitGridGroup,
  badgeVariantForStatus,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { Duration } from 'dayjs/plugin/duration';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const layoutValues = ['serpentine', 'wordwrap'] as const;

// Utilization fills follow the app's semantic usage convention
// (utilizationThresholds.ts: ≥50% warning, ≥80% error) via theme tokens;
// intermediate steps deepen the WARNING hue. <BAIResourceUnitGrid> resolves
// these strings (incl. color-mix) against the live cascade for ink contrast.
const UTILIZATION_FILLS: UtilizationFills = {
  bins: [
    'var(--color-background-muted)',
    'color-mix(in srgb, var(--color-warning) 35%, transparent)',
    'color-mix(in srgb, var(--color-warning) 65%, transparent)',
    'var(--color-warning)',
    'var(--color-error)',
  ],
  noData: 'var(--color-skeleton)',
};

interface GridKernel {
  id: string;
  role: string;
  hostname: string;
  status: string;
  liveStat: SessionLiveStats;
}

interface GridSession {
  id: string;
  name: string;
  status: string;
  type: string;
  image: string;
  createdAt: string;
  startsAt: string | null;
  terminatedAt: string | null;
  clusterMode: string;
  clusterSize: number;
  scalingGroup: string;
  slots: SlotMap;
  notYetAllocated: boolean;
  liveStat: SessionLiveStats;
  kernels: Array<GridKernel>;
}

const formatBytes = (v: number): string =>
  v >= 2 ** 30
    ? `${(v / 2 ** 30).toFixed(1)} GiB`
    : v >= 2 ** 20
      ? `${(v / 2 ** 20).toFixed(1)} MiB`
      : `${(v / 2 ** 10).toFixed(0)} KiB`;

// "cr.backend.ai/multiarch/python:3.13-ubuntu24.04" → "python:3.13-ubuntu24.04"
const shortImage = (image: string): string => image.split('/').pop() ?? image;

// Same semantics as SessionReservation: elapsed runs from `starts_at`
// (fallback `created_at`, only once in the past) to `terminated_at` or now.
const elapsedRange = (
  session: Pick<GridSession, 'startsAt' | 'createdAt' | 'terminatedAt'>,
): { begin: dayjs.Dayjs; duration: Duration } | null => {
  const begin = dayjs(session.startsAt || session.createdAt);
  if (!begin.isValid() || !begin.isBefore()) return null;
  const end = session.terminatedAt ? dayjs(session.terminatedAt) : dayjs();
  return { begin, duration: dayjs.duration(end.diff(begin)) };
};

interface SessionResourceGridProps {
  filter?: string | null;
  order?: string | null;
  projectId?: string | null;
  fetchKey: string;
  onClickSession?: (sessionId: string) => void;
}

const SessionResourceGrid = ({
  filter,
  order,
  projectId,
  fetchKey,
  onClickSession,
}: SessionResourceGridProps) => {
  'use memo';
  const { t } = useTranslation();
  // Human-friendly names/units for dynamic accelerator slot keys
  // (e.g. `cuda.shares` → "fGPU"), same source as the session list/detail.
  const { mergedResourceSlots } = useResourceSlotsDetails();
  const slotLabel = (slot: string): string =>
    slot === 'cpu'
      ? t('session.CPU')
      : slot === 'mem'
        ? t('session.launcher.Memory')
        : (mergedResourceSlots?.[slot]?.human_readable_name ?? slot);
  const slotUnit = (slot: string): string =>
    mergedResourceSlots?.[slot]?.display_unit ?? '';

  const [gridParams, setGridParams] = useQueryStates(
    {
      gridMode: parseAsStringLiteral(sessionGridModeValues).withDefault(
        'resource',
      ),
      // Plain strings: resource slot / metric keys are dynamic per cluster.
      gridResource: parseAsString.withDefault('cpu'),
      gridMetric: parseAsString.withDefault('cpu_util'),
      gridMemUnit: parseAsStringLiteral(sessionGridMemUnitValues).withDefault(
        '1',
      ),
      gridLayout: parseAsStringLiteral(layoutValues).withDefault('serpentine'),
    },
    { history: 'replace' },
  );

  const [hueOverrides, setHueOverrides] = useBAISettingUserState(
    'sessionResourceGridHueOverrides',
  );

  const queryData = useLazyLoadQuery<SessionResourceGridQuery>(
    graphql`
      query SessionResourceGridQuery(
        $limit: Int!
        $offset: Int!
        $filter: String
        $order: String
        $group_id: String
      ) {
        compute_session_list(
          limit: $limit
          offset: $offset
          filter: $filter
          order: $order
          group_id: $group_id
        ) {
          total_count
          items {
            id
            session_id
            name
            type
            status
            image
            created_at
            starts_at
            terminated_at
            cluster_mode
            cluster_size
            scaling_group
            occupied_slots
            requested_slots
            containers {
              id
              cluster_role
              cluster_hostname
              status
              agent
              live_stat
            }
          }
        }
      }
    `,
    {
      limit: SESSION_CAP,
      offset: 0,
      filter,
      order: order || '-created_at',
      group_id: projectId,
    },
    { fetchPolicy: 'network-only', fetchKey },
  );

  const totalCount = queryData.compute_session_list?.total_count ?? 0;
  const sessions: GridSession[] = filterOutNullAndUndefined(
    queryData.compute_session_list?.items,
  ).map((item) => {
    const { slots, slotsAreRequested } = parseSlotMap(
      item.occupied_slots,
      item.requested_slots,
    );
    const kernels: GridKernel[] = filterOutNullAndUndefined(
      item.containers,
    ).map((c) => ({
      id: c.id ?? '',
      role: c.cluster_role ?? '',
      hostname: c.cluster_hostname ?? '',
      status: c.status ?? '',
      liveStat: parseLiveStat(c.live_stat),
    }));
    return {
      id: String(item.session_id ?? item.id ?? ''),
      name: item.name || t('session.resourceGrid.Unnamed'),
      status: item.status ?? '',
      type: item.type ?? '',
      image: item.image ?? '',
      createdAt: item.created_at ?? '',
      startsAt: item.starts_at ?? null,
      terminatedAt: item.terminated_at ?? null,
      clusterMode: item.cluster_mode ?? '',
      clusterSize: item.cluster_size ?? 0,
      scalingGroup: item.scaling_group ?? '',
      slots,
      notYetAllocated: isNotYetAllocatedSession(
        item.status ?? '',
        slotsAreRequested,
      ),
      liveStat: mergeKernelLiveStats(kernels.map((k) => k.liveStat)),
      kernels,
    };
  });

  const resourceOptions = availableResourceOptions(sessions);
  const metricOptions = availableLiveStatMetrics(sessions);
  const resource = resourceOptions.includes(gridParams.gridResource)
    ? gridParams.gridResource
    : 'cpu';
  const metric =
    metricOptions.length === 0 || metricOptions.includes(gridParams.gridMetric)
      ? gridParams.gridMetric
      : metricOptions[0];

  const warningBandStep =
    (UTILIZATION_ERROR_PERCENT - UTILIZATION_WARNING_PERCENT) / 3;
  const legendItems = [
    {
      color: UTILIZATION_FILLS.bins[0],
      label: t('session.resourceGrid.LessThanPercent', {
        value: UTILIZATION_WARNING_PERCENT,
      }),
    },
    ...[0, 1, 2].map((i) => ({
      color: UTILIZATION_FILLS.bins[1 + i],
      label: t('session.resourceGrid.RangePercent', {
        from: UTILIZATION_WARNING_PERCENT + i * warningBandStep,
        to: UTILIZATION_WARNING_PERCENT + (i + 1) * warningBandStep,
      }),
    })),
    {
      color: UTILIZATION_FILLS.bins[4],
      label: t('session.resourceGrid.AtLeastPercent', {
        value: UTILIZATION_ERROR_PERCENT,
      }),
    },
    {
      color: UTILIZATION_FILLS.noData,
      label: t('session.resourceGrid.NoData'),
    },
  ];

  // Resource mode surveys ONE resource: sessions holding none of it are
  // omitted (and counted into an info banner) instead of rendering as
  // misleading no-data placeholder cells.
  const shownSessions =
    gridParams.gridMode === 'resource'
      ? sessions.filter((s) => sessionHasResource(s.slots, resource))
      : sessions;
  const omittedCount = sessions.length - shownSessions.length;

  const groups: BAIUnitGridGroup[] = shownSessions.map((session) => ({
    key: session.id,
    label: session.name,
    units: sessionGridUnits(session, {
      mode: gridParams.gridMode,
      resource,
      metric,
      memUnitGiB: parseInt(gridParams.gridMemUnit),
      fills: UTILIZATION_FILLS,
    }),
    // Dashed plate = the allocation is not real yet (still requested).
    plateVariant: session.notYetAllocated ? ('dashed' as const) : undefined,
  }));
  const sessionByKey = new Map(sessions.map((s) => [s.id, s]));

  const renderPopoverBody = (session: GridSession) => {
    const elapsed = elapsedRange(session);
    const ioRead = parseFloat(session.liveStat.io_read?.current ?? '');
    const ioWrite = parseFloat(session.liveStat.io_write?.current ?? '');
    return (
      <>
        <BAIFlex gap={6} align="center">
          <Badge
            variant={badgeVariantForStatus('session', session.status)}
            label={session.status}
          />
          <Text size="sm" color="secondary">
            {`${session.type.toLowerCase()} · ${session.clusterMode} ×${session.clusterSize || Math.max(1, session.kernels.length)} · ${session.scalingGroup}`}
          </Text>
        </BAIFlex>
        <Text size="sm" color="secondary">
          {shortImage(session.image) || t('session.resourceGrid.UnknownImage')}
        </Text>
        {elapsed && (
          <Text size="sm" color="secondary">
            {t('session.resourceGrid.StartedElapsed', {
              startedAt: elapsed.begin.toDate().toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              elapsed:
                formatDuration(elapsed.duration, t) || `0 ${t('time.Sec')}`,
            })}
          </Text>
        )}
        <Divider />
        {Object.entries(session.slots)
          .flatMap(([slot, raw]) => {
            const alloc =
              slot === 'cpu'
                ? parseFloat(raw) > 1
                  ? t('session.resourceGrid.NCores', { value: raw })
                  : t('session.resourceGrid.NCore', { value: raw })
                : slot === 'mem'
                  ? formatBytes(parseFloat(raw))
                  : `${raw} ${slotUnit(slot)}`.trim();
            const rows = [
              {
                key: slot,
                label:
                  `${slotLabel(slot)} · ${alloc}` +
                  (session.notYetAllocated
                    ? ` ${t('session.resourceGrid.Requested')}`
                    : ''),
                pct: sessionUtilizationPct(
                  session.status,
                  session.liveStat,
                  slot,
                ),
              },
            ];
            // Accelerators reporting a memory stat get a second row: device
            // memory (capacity from the merged live_stat) + its own bar.
            const memStat =
              slot !== 'cpu' && slot !== 'mem'
                ? session.liveStat[memKeyForSlot(slot)]
                : undefined;
            if (memStat) {
              const capacity = parseFloat(memStat.capacity ?? '');
              rows.push({
                key: `${slot}:mem`,
                label:
                  t('session.resourceGrid.SlotMemLabel', {
                    label: slotLabel(slot),
                  }) +
                  (Number.isFinite(capacity)
                    ? ` · ${formatBytes(capacity)}`
                    : ''),
                pct: sessionUtilizationPct(
                  session.status,
                  session.liveStat,
                  `${slot}:mem`,
                ),
              });
            }
            return rows;
          })
          .map((row) => (
            <BAIFlex key={row.key} direction="column" align="stretch" gap={2}>
              <BAIFlex justify="between" gap={12}>
                <Text size="sm" color="secondary">
                  {row.label}
                </Text>
                <Text size="sm">
                  {row.pct === null ? '–' : `${row.pct.toFixed(0)}%`}
                </Text>
              </BAIFlex>
              <div className="session-resource-grid-usage-track">
                <div
                  className="session-resource-grid-usage-fill"
                  style={{
                    width: `${Math.max(0, Math.min(100, row.pct ?? 0))}%`,
                    background: utilizationFill(row.pct, UTILIZATION_FILLS),
                  }}
                />
              </div>
            </BAIFlex>
          ))}
        {Number.isFinite(ioRead) || Number.isFinite(ioWrite) ? (
          <Text size="sm" color="secondary">
            {t('session.resourceGrid.IOReadWrite', {
              read: Number.isFinite(ioRead) ? formatBytes(ioRead) : '–',
              write: Number.isFinite(ioWrite) ? formatBytes(ioWrite) : '–',
            })}
          </Text>
        ) : (
          <Text size="sm" color="secondary">
            {t('session.resourceGrid.NoLiveData')}
          </Text>
        )}
      </>
    );
  };

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex gap="sm" wrap="wrap" align="center">
        <SegmentedControl
          size="sm"
          label={t('session.resourceGrid.GridMode')}
          value={gridParams.gridMode}
          onChange={(value) =>
            setGridParams({
              gridMode: value as (typeof sessionGridModeValues)[number],
            })
          }
        >
          <SegmentedControlItem
            value="resource"
            label={t('session.resourceGrid.Resource')}
          />
          <SegmentedControlItem
            value="kernel"
            label={t('session.resourceGrid.Kernel')}
          />
        </SegmentedControl>
        {gridParams.gridMode === 'resource' ? (
          <>
            <SegmentedControl
              size="sm"
              label={t('session.resourceGrid.Resource')}
              value={resource}
              onChange={(value) => setGridParams({ gridResource: value })}
            >
              {resourceOptions.map((value) => {
                const { slot, dimension } = parseResourceValue(value);
                // Accelerators with a memory live_stat split into two
                // entries: "<label> (util)" and "<label> (mem)".
                const label =
                  dimension === 'mem'
                    ? t('session.resourceGrid.SlotMemLabel', {
                        label: slotLabel(slot),
                      })
                    : resourceOptions.includes(`${slot}:mem`)
                      ? t('session.resourceGrid.SlotUtilLabel', {
                          label: slotLabel(slot),
                        })
                      : slotLabel(slot);
                return (
                  <SegmentedControlItem
                    key={value}
                    value={value}
                    label={label}
                  />
                );
              })}
            </SegmentedControl>
            {(resource === 'mem' ||
              parseResourceValue(resource).dimension === 'mem') && (
              <SegmentedControl
                size="sm"
                label={t('session.resourceGrid.MemoryUnit')}
                value={gridParams.gridMemUnit}
                onChange={(value) =>
                  setGridParams({
                    gridMemUnit:
                      value as (typeof sessionGridMemUnitValues)[number],
                  })
                }
              >
                {sessionGridMemUnitValues.map((u) => (
                  <SegmentedControlItem
                    key={u}
                    value={u}
                    label={t('session.resourceGrid.NGiB', { value: u })}
                  />
                ))}
              </SegmentedControl>
            )}
          </>
        ) : (
          <Selector
            label={t('session.resourceGrid.Metric')}
            isLabelHidden
            size="sm"
            width={180}
            options={metricOptions}
            value={metric}
            onChange={(value) => setGridParams({ gridMetric: value ?? '' })}
          />
        )}
        <SegmentedControl
          size="sm"
          label={t('session.resourceGrid.Layout')}
          value={gridParams.gridLayout}
          onChange={(value) =>
            setGridParams({
              gridLayout: value as (typeof layoutValues)[number],
            })
          }
        >
          <SegmentedControlItem
            value="serpentine"
            label={t('session.resourceGrid.Serpentine')}
          />
          <SegmentedControlItem
            value="wordwrap"
            label={t('session.resourceGrid.WordWrap')}
          />
        </SegmentedControl>
      </BAIFlex>
      {totalCount > SESSION_CAP && (
        <Banner
          status="info"
          title={t('session.resourceGrid.ShowingFirstNSessions', {
            count: SESSION_CAP,
            total: totalCount,
          })}
        />
      )}
      {omittedCount > 0 && (
        <Banner
          status="info"
          title={t('session.resourceGrid.OmittedNoResource', {
            count: omittedCount,
            label: slotLabel(parseResourceValue(resource).slot),
          })}
        />
      )}
      <BAIResourceUnitGrid
        aria-label={t('session.resourceGrid.ResourceGridOfNSessions', {
          count: shownSessions.length,
        })}
        groups={groups}
        layout={gridParams.gridLayout}
        maxUnitsPerGroup={MAX_UNITS_PER_SESSION}
        legendItems={legendItems}
        hueOverrides={hueOverrides}
        onHueOverrideChange={(key, paletteIdx) =>
          setHueOverrides((prev) => {
            // Prune overrides for sessions no longer in the result so the
            // persisted map cannot grow unboundedly with dead session ids.
            const alive = new Set(sessions.map((s) => s.id));
            const next: Record<string, number> = {};
            for (const [k, v] of Object.entries(prev ?? {})) {
              if (alive.has(k)) next[k] = v;
            }
            next[key] = paletteIdx;
            return next;
          })
        }
        renderGroupPopover={(group) => {
          const session = sessionByKey.get(group.key);
          return session ? renderPopoverBody(session) : null;
        }}
        onClickGroup={(key) => onClickSession?.(key)}
        emptyFallback={
          // When everything was omitted for lacking the selected resource,
          // the omitted-count banner above already explains the empty grid.
          omittedCount > 0 ? null : (
            <Banner
              status="info"
              title={t('session.resourceGrid.NoSessionsMatchingFilter')}
            />
          )
        }
      />
    </BAIFlex>
  );
};

export default SessionResourceGrid;
