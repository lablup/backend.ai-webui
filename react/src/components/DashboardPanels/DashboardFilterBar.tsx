/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  useDashboardLastRefreshAt,
  useDashboardRefreshScheduler,
} from './DashboardRefreshContext';
import { REFRESH_OPTIONS, refreshToMs } from './dashboardFilterUrl';
import {
  TIME_RANGE_PRESETS,
  customRange,
  parseTimeRange,
  type TimeRangePreset,
} from './timeRange';
import type { DashboardScope } from './types';
import type { DashboardFilters } from './useDashboardFilters';
import type { ISODateString } from '@lablup/ui-common/Calendar';
import { DateRangeInput } from '@lablup/ui-common/DateRangeInput';
import {
  BAIFetchKeyButton,
  BAIFlex,
  BAIIconWithTooltip,
  BAIQuestionIconWithTooltip,
  BAIScopedProjectSelect,
  BAIScopedResourceGroupSelect,
  BAISelect,
  BAIText,
  useIntervalValue,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { Pin } from 'lucide-react';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

export interface DashboardFilterBarProps {
  filters: DashboardFilters;
  isRefetching: boolean;
}

const CUSTOM_RANGE = 'custom';

const PRESET_LABEL_KEYS: Record<TimeRangePreset, string> = {
  'now-1h': 'dashboard.filterBar.Last1Hour',
  'now-24h': 'dashboard.filterBar.Last24Hours',
  'now-7d': 'dashboard.filterBar.Last7Days',
};

const toISODate = (value: dayjs.Dayjs) =>
  value.format('YYYY-MM-DD') as ISODateString;

const resourceGroupScopeOf = (scope: DashboardScope) => {
  if (scope.kind === 'mine') {
    return { project: scope.projectId ? [{ value: scope.projectId }] : [] };
  }
  return scope.projectIds === 'all'
    ? { domain: [{ value: scope.domain.id }] }
    : { project: scope.projectIds.map((value) => ({ value })) };
};

const LastRefreshed: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const lastRefreshAt = useDashboardLastRefreshAt();
  const seconds = useIntervalValue(
    () =>
      lastRefreshAt === null
        ? null
        : Math.max(0, Math.floor((Date.now() - lastRefreshAt) / 1000)),
    1000,
    String(lastRefreshAt),
  );
  if (seconds === null) return null;
  return (
    <BAIText type="secondary">
      {seconds < 60
        ? t('dashboard.filterBar.RefreshedSecondsAgo', { count: seconds })
        : t('dashboard.filterBar.RefreshedMinutesAgo', {
            count: Math.floor(seconds / 60),
          })}
    </BAIText>
  );
};

/**
 * The dashboard's filter bar: the projects and resource groups every card
 * reads, the time range, and the one auto refresh.
 */
const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({
  filters,
  isRefetching,
}) => {
  'use memo';
  const { t } = useTranslation();
  const scheduler = useDashboardRefreshScheduler();
  const { page, vars, scope, projectPinned, setVars } = filters;
  const parsedRange = parseTimeRange(vars.range);
  const isCustomRange = parsedRange?.kind === 'custom';

  const formatRefresh = (option: string) => {
    const ms = refreshToMs(option);
    if (ms === null) return t('dashboard.filterBar.Off');
    return ms < 60_000
      ? t('dashboard.filterBar.Seconds', { count: ms / 1000 })
      : t('dashboard.filterBar.Minutes', { count: ms / 60_000 });
  };

  const selectedProjectIds =
    scope.kind === 'projects' && scope.projectIds !== 'all'
      ? scope.projectIds
      : [];

  const projectControl = (() => {
    if (page === 'project') return null;
    const pinnedTooltip = projectPinned ? (
      <BAIIconWithTooltip
        content={t('dashboard.filterBar.PinnedToBoard')}
        icon={<Pin />}
      />
    ) : null;
    if (page === 'projectAdmin') {
      return (
        <>
          <BAISelect
            mode="multiple"
            label={t('dashboard.filterBar.Projects')}
            isLabelHidden
            placeholder={t('dashboard.filterBar.AllProjects')}
            disabled={projectPinned}
            value={selectedProjectIds}
            options={filters.adminProjects.map((project) => ({
              value: project.id,
              label: project.name,
            }))}
            onChange={(ids: Array<string>) =>
              setVars(
                { project: ids.length ? ids : 'all' },
                filters.projectNameById,
              )
            }
            style={{ minWidth: 200 }}
          />
          {pinnedTooltip}
        </>
      );
    }
    return (
      <>
        <Suspense fallback={<BAISelect mode="multiple" loading disabled />}>
          <BAIScopedProjectSelect
            multiple
            label={t('dashboard.filterBar.Projects')}
            isLabelHidden
            placeholder={t('dashboard.filterBar.AllProjects')}
            scope={{
              domain: [
                { value: scope.kind === 'projects' ? scope.domain.id : '' },
              ],
            }}
            isDisabled={projectPinned}
            value={selectedProjectIds}
            onChange={(ids, pairs) => {
              const list = _.castArray(ids ?? []);
              setVars(
                { project: list.length ? list : 'all' },
                new Map(
                  _.castArray(pairs ?? []).map((pair) => [
                    pair.value,
                    pair.label,
                  ]),
                ),
              );
            }}
            allowClear
            width={240}
          />
        </Suspense>
        {pinnedTooltip}
      </>
    );
  })();

  return (
    <BAIFlex
      direction="row"
      align="center"
      justify="between"
      gap="sm"
      wrap="wrap"
      role="toolbar"
      aria-label={t('dashboard.filterBar.Filters')}
      data-testid="dashboard-filter-bar"
    >
      <BAIFlex direction="row" align="center" gap="sm" wrap="wrap">
        {projectControl}
        <BAIScopedResourceGroupSelect
          multiple
          label={t('dashboard.filterBar.ResourceGroups')}
          isLabelHidden
          placeholder={t('dashboard.filterBar.AllResourceGroups')}
          scope={resourceGroupScopeOf(scope)}
          value={vars.rg === 'all' ? [] : vars.rg}
          onChange={(names) => {
            const list = _.castArray(names ?? []);
            setVars({ rg: list.length ? list : 'all' });
          }}
          allowClear
          width={220}
        />
        <BAIFlex direction="row" align="center" gap="xxs">
          <BAISelect
            label={t('dashboard.filterBar.TimeRange')}
            value={isCustomRange ? CUSTOM_RANGE : vars.range}
            options={[
              ...TIME_RANGE_PRESETS.map((preset) => ({
                value: preset,
                label: t(PRESET_LABEL_KEYS[preset]),
              })),
              {
                value: CUSTOM_RANGE,
                label: t('dashboard.filterBar.CustomRange'),
              },
            ]}
            onChange={(value: string) =>
              setVars({
                range:
                  value === CUSTOM_RANGE
                    ? customRange(
                        toISODate(dayjs().subtract(6, 'day')),
                        toISODate(dayjs()),
                      )
                    : value,
              })
            }
            style={{ minWidth: 150 }}
          />
          {isCustomRange ? (
            <DateRangeInput
              aria-label={t('dashboard.filterBar.CustomRange')}
              hasClear={false}
              max={toISODate(dayjs())}
              value={{
                start: parsedRange.start as ISODateString,
                end: parsedRange.end as ISODateString,
              }}
              onChange={(range) => {
                if (range?.start && range?.end) {
                  setVars({ range: customRange(range.start, range.end) });
                }
              }}
            />
          ) : null}
          <BAIQuestionIconWithTooltip
            title={t('dashboard.filterBar.TimeRangeHelp')}
          />
        </BAIFlex>
        <BAIFlex direction="row" align="center" gap="xs">
          <BAIText type="secondary">{t('button.AutoRefresh')}</BAIText>
          <BAISelect
            label={t('button.AutoRefresh')}
            value={vars.refresh}
            options={REFRESH_OPTIONS.map((option) => ({
              value: option,
              label: formatRefresh(option),
            }))}
            onChange={(value: string) => setVars({ refresh: value })}
            style={{ minWidth: 90 }}
          />
        </BAIFlex>
      </BAIFlex>
      <BAIFlex direction="row" align="center" gap="xs">
        <LastRefreshed />
        <BAIFetchKeyButton
          loading={isRefetching}
          value=""
          onChange={() => scheduler?.refreshAll()}
        />
      </BAIFlex>
    </BAIFlex>
  );
};

export default DashboardFilterBar;
