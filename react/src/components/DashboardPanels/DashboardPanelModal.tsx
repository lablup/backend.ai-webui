/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import {
  DEFAULT_SESSION_GRID_VIEW,
  type SessionGridViewParams,
} from '../../helper/sessionResourceGridData';
import { DeploymentNodesPanelContent } from './DeploymentNodesPanel';
import PanelRangeSelect, { NO_PERIOD } from './PanelRangeSelect';
import { ResourceChartContent, SKELETON_VARIANTS } from './ResourceChartPanel';
import { ResourceCountContent } from './ResourceCountPanel';
import { ResourceTableContent } from './ResourceTablePanel';
import { SessionNodesPanelContent } from './SessionNodesPanel';
import { SessionResourceGridContent } from './SessionResourceGridPanel';
import {
  CHART_GROUPINGS,
  chartTypesFor,
  chartWindow,
  resolveChart,
} from './chartSources';
import { PanelPermissionBoundary } from './panelPermission';
import { availablePanelTypes, panelTypeLabelKeys } from './panelRegistry';
import { DEFAULT_RANGE } from './panelSettings';
import { resourceRegistry } from './resourceRegistry';
import {
  GROUP_CHART_TYPES,
  chartUsesPeriod,
  TIME_CHART_TYPES,
  isTimeChartType,
  type ChartType,
  type PanelDescriptor,
  type PanelInput,
  type PanelType,
  type PersistedPanel,
  type ResourceKey,
} from './types';
import { SkeletonChart } from '@lablup/ui-common';
import { Text } from '@lablup/ui-common/Text';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAISegmentedControl,
  BAISegmentedControlItem,
  BAISelect,
  BAISwitch,
  BAITextInput,
  BAIBoardItemErrorBoundary,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIModal,
  BAIPropertyFilter,
  BAISkeleton,
  type GraphQLFilter,
} from 'backend.ai-ui';
import {
  ChartArea,
  ChartColumn,
  ChartLine,
  ChartPie,
  ChartNoAxesColumn,
  Donut,
  Radar,
} from 'lucide-react';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface DashboardPanelModalProps {
  open: boolean;
  onRequestClose: () => void;
  /** When set, the modal edits this panel instead of creating a new one. */
  initialPanel?: PersistedPanel;
  /** Resources the current role may query (drives the resource selector). */
  availableResources: ReadonlyArray<ResourceKey>;
  /** `experimental_session_resource_grid` — gates the grid kind. */
  gridEnabled?: boolean;
  onSubmit: (input: PanelInput) => void;
  /** Forwarded so `BAIUnmountAfterClose` can unmount this after the exit. */
  afterClose?: () => void;
}

interface PanelFormValues {
  panelType: PanelType;
  resourceType: ResourceKey;
  title?: string;
  filter?: GraphQLFilter | string | null;
  chartType: ChartType;
  groupBy?: string;
  /** A range, or {@link NO_PERIOD} for a group chart that counts every row. */
  range?: string;
}

const CHART_TYPE_LABELS: Record<
  ChartType,
  { labelKey: string; icon: React.ReactNode }
> = {
  donut: { labelKey: 'dashboard.panelModal.Donut', icon: <Donut /> },
  pie: { labelKey: 'dashboard.panelModal.Pie', icon: <ChartPie /> },
  bar: { labelKey: 'dashboard.panelModal.Bar', icon: <ChartColumn /> },
  radar: { labelKey: 'dashboard.panelModal.Radar', icon: <Radar /> },
  line: { labelKey: 'dashboard.panelModal.Line', icon: <ChartLine /> },
  area: { labelKey: 'dashboard.panelModal.Area', icon: <ChartArea /> },
  column: {
    labelKey: 'dashboard.panelModal.Column',
    icon: <ChartNoAxesColumn />,
  },
};

/**
 * Create/edit a table panel: pick a resource, build the condition with the same
 * property filter the queries use, optionally title it (the title is how the
 * condition is expressed on the board), and see matching rows live — sorting the
 * preview sets the panel's persisted order. Nothing is applied until OK.
 */
const DashboardPanelModal: React.FC<DashboardPanelModalProps> = ({
  open,
  onRequestClose,
  initialPanel,
  availableResources,
  gridEnabled = false,
  onSubmit,
  afterClose,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const [form] = Form.useForm<PanelFormValues>();
  const fallbackResource = availableResources[0];
  const initialResource =
    initialPanel?.descriptor.resourceType ?? fallbackResource;
  // A saved panel whose resource the current role can no longer query must stay
  // editable — dropping it from the options would leave the selector showing a
  // value it cannot name, and the panel repairable only by deleting it.
  const resourceOptions =
    initialPanel && !availableResources.includes(initialResource)
      ? [...availableResources, initialResource]
      : availableResources;
  // Preview-driven sort order; not a typed field, so it lives beside the form.
  const [order, setOrder] = useState<string | null>(
    initialPanel?.descriptor.order ?? null,
  );
  // Same idea for the grid's view settings: the preview's own toolbar edits
  // them, and OK persists them into the descriptor.
  const [gridView, setGridView] = useState<SessionGridViewParams>(
    initialPanel?.descriptor.gridView ?? DEFAULT_SESSION_GRID_VIEW,
  );

  const resourceType = (Form.useWatch('resourceType', form) ??
    initialResource) as ResourceKey;
  const panelType = (Form.useWatch('panelType', form) ??
    initialPanel?.panelType ??
    'resourceTable') as PanelType;
  const filter = Form.useWatch('filter', form) ?? undefined;
  const initialChart = resolveChart(
    initialResource,
    initialPanel?.descriptor.chart,
  );
  const initialRange = chartUsesPeriod(initialChart)
    ? (initialPanel?.descriptor.range ?? DEFAULT_RANGE)
    : NO_PERIOD;
  const rangeValue: string = Form.useWatch('range', form) ?? initialRange;
  // Not a typed field: it shapes the preview below the form, as `order` does.
  const [showTable, setShowTable] = useState(initialChart.showTable === true);
  const chart = resolveChart(resourceType, {
    type: Form.useWatch('chartType', form) ?? initialChart.type,
    groupBy: Form.useWatch('groupBy', form) ?? initialChart.groupBy,
    period: rangeValue !== NO_PERIOD,
    showTable,
  });
  const range = rangeValue === NO_PERIOD ? undefined : rangeValue;
  const chartTypeOptions = chartTypesFor(resourceType, chart.groupBy);
  const chartTypeOption = (type: ChartType) => ({
    value: type,
    label: (
      <BAIFlex align="center" gap="xs">
        {CHART_TYPE_LABELS[type].icon}
        {t(CHART_TYPE_LABELS[type].labelKey)}
      </BAIFlex>
    ),
  });
  // The preview's time buckets end at the modal's opening, so typing does not move them.
  const [previewNow] = useState(() => Date.now());
  const config = resourceRegistry[resourceType];
  // A saved grid panel keeps offering the grid kind even with the flag off, so
  // editing it cannot silently rewrite the user's stored view.
  const panelTypeOptions = availablePanelTypes(resourceType, {
    gridEnabled,
    forcePanelType: initialPanel?.panelType,
  });

  // Panel kind and data source are required: they decide which query runs, so
  // a panel without them cannot render at all. Validation gates the submit,
  // and the modal stays open with the offending field marked.
  const handleOk = async () => {
    let values: PanelFormValues;
    try {
      values = await form.validateFields();
    } catch {
      // BAIModal calls onOk without awaiting it, so letting this reject would
      // surface as an unhandled rejection. The rejection carries no
      // information we act on: the form has already marked the offending
      // fields and the modal stays open, which IS the feedback.
      return;
    }
    onSubmit({
      panelType: values.panelType,
      resourceType: values.resourceType,
      title: values.title?.trim() || undefined,
      filter: values.filter ?? null,
      order,
      gridView: values.panelType === 'sessionResourceGrid' ? gridView : null,
      chart:
        values.panelType === 'resourceChart'
          ? resolveChart(values.resourceType, {
              type: values.chartType,
              groupBy: values.groupBy,
              period: values.range !== NO_PERIOD,
              showTable,
            })
          : null,
      range: values.range === NO_PERIOD ? undefined : values.range,
    });
    onRequestClose();
  };

  // The table the Table kind previews, and a chart lists under it with Show table on.
  const renderTablePreview = (
    previewFilter: PanelInput['filter'],
    tableWindow: PanelDescriptor['tableWindow'] = null,
  ) =>
    config.kind === 'deploymentNodes' ? (
      <DeploymentNodesPanelContent
        key={`${resourceType}:${JSON.stringify(previewFilter ?? null)}`}
        descriptor={{
          resourceType,
          filter: previewFilter ?? null,
          order,
          range,
          tableWindow,
        }}
        onChangeOrder={(next) => setOrder(next ?? null)}
        disableNavigation
      />
    ) : config.kind === 'sessionNodes' ? (
      <SessionNodesPanelContent
        key={`${resourceType}:${JSON.stringify(previewFilter ?? null)}`}
        descriptor={{
          resourceType,
          filter: previewFilter ?? null,
          order,
          range,
          tableWindow,
        }}
        onChangeOrder={(next) => setOrder(next ?? null)}
        disableSessionDetail
      />
    ) : (
      <ResourceTableContent
        key={`${resourceType}:${JSON.stringify(previewFilter ?? null)}`}
        descriptor={{
          resourceType,
          filter: previewFilter ?? null,
          order,
          range,
          tableWindow,
        }}
        onChangeOrder={(next) => setOrder(next ?? null)}
        disableNavigation
      />
    );

  return (
    <BAIModal
      open={open}
      width="min(960px, 95vw)"
      title={
        initialPanel
          ? t('dashboard.panelModal.EditPanel')
          : t('dashboard.panelModal.AddPanel')
      }
      okText={initialPanel ? t('button.Save') : t('button.Add')}
      onOk={handleOk}
      onCancel={onRequestClose}
      afterClose={afterClose}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          panelType: initialPanel?.panelType ?? 'resourceTable',
          resourceType: initialResource,
          title: initialPanel?.descriptor.title,
          filter: initialPanel?.descriptor.filter ?? undefined,
          chartType: initialChart.type,
          groupBy: initialChart.groupBy,
          range: initialRange,
        }}
        onValuesChange={(changed: Partial<PanelFormValues>) => {
          // A resource switch invalidates the condition and sort of the old one,
          // and can invalidate the kind too (grid is session-only).
          if (changed.resourceType) {
            form.setFieldsValue({ filter: undefined });
            setOrder(null);
            setGridView(DEFAULT_SESSION_GRID_VIEW);
            const nextTypes = availablePanelTypes(changed.resourceType, {
              gridEnabled,
              forcePanelType: initialPanel?.panelType,
            });
            if (!nextTypes.includes(form.getFieldValue('panelType'))) {
              form.setFieldsValue({ panelType: 'resourceTable' });
            }
            // Groupings differ per source.
            form.setFieldsValue({
              groupBy: CHART_GROUPINGS[changed.resourceType][0].key,
            });
          }
          // A radar needs three groups; a grouping with fewer turns it into a bar.
          const values = form.getFieldsValue();
          const valid = resolveChart(values.resourceType, {
            type: values.chartType,
            groupBy: values.groupBy,
          });
          if (values.chartType && valid.type !== values.chartType) {
            form.setFieldsValue({ chartType: valid.type });
          }
          // A time chart always has a period.
          if (isTimeChartType(valid.type) && values.range === NO_PERIOD) {
            form.setFieldsValue({ range: DEFAULT_RANGE });
          }
          // Switching only the kind keeps the condition and sort: the session
          // table and grid read the same minilang filter and order strings.
        }}
      >
        <BAIFlex direction="row" align="start" gap="md" wrap="wrap">
          <Form.Item
            name="panelType"
            label={t('dashboard.panelModal.PanelType')}
            required
            rules={[
              {
                required: true,
                message: t('dashboard.panelModal.PanelTypeRequired'),
              },
            ]}
            style={{ flexShrink: 0 }}
          >
            <BAISegmentedControl
              aria-label={t('dashboard.panelModal.PanelType')}
            >
              {panelTypeOptions.map((type) => (
                <BAISegmentedControlItem
                  key={type}
                  value={type}
                  label={t(panelTypeLabelKeys[type])}
                />
              ))}
            </BAISegmentedControl>
          </Form.Item>
          <Form.Item
            name="resourceType"
            label={t('dashboard.panelModal.DataSource')}
            required
            rules={[
              {
                required: true,
                message: t('dashboard.panelModal.DataSourceRequired'),
              },
            ]}
            style={{ flex: 1, minWidth: 180 }}
          >
            <BAISelect
              showSearch={false}
              aria-label={t('dashboard.panelModal.DataSource')}
              options={resourceOptions.map((key) => ({
                value: key,
                label: t(resourceRegistry[key].labelKey),
              }))}
            />
          </Form.Item>
          <Form.Item
            name="title"
            label={t('dashboard.panelModal.Title')}
            extra={t('dashboard.panelModal.TitleDescription')}
            style={{ flex: 1, minWidth: 180 }}
          >
            <BAITextInput
              aria-label={t('dashboard.panelModal.Title')}
              placeholder={t(config.labelKey)}
              hasClear
            />
          </Form.Item>
        </BAIFlex>
        {panelType === 'resourceChart' ? (
          <BAIFlex direction="row" align="start" gap="md" wrap="wrap">
            <Form.Item
              name="chartType"
              required
              label={t('dashboard.panelModal.ChartType')}
              style={{ flex: 1, minWidth: 180 }}
            >
              <BAISelect
                showSearch={false}
                data-testid="dashboard-chart-type"
                aria-label={t('dashboard.panelModal.ChartType')}
                options={[
                  {
                    label: t('dashboard.panelModal.CompareGroups'),
                    options: GROUP_CHART_TYPES.filter((type) =>
                      chartTypeOptions.includes(type),
                    ).map(chartTypeOption),
                  },
                  {
                    label: t('dashboard.panelModal.CreatedOverTime'),
                    options: TIME_CHART_TYPES.map(chartTypeOption),
                  },
                ]}
              />
            </Form.Item>
            {isTimeChartType(chart.type) ? null : (
              <Form.Item
                name="groupBy"
                required
                label={t('dashboard.panelModal.GroupBy')}
                style={{ flex: 1, minWidth: 180 }}
              >
                <BAISelect
                  showSearch={false}
                  aria-label={t('dashboard.panelModal.GroupBy')}
                  options={CHART_GROUPINGS[resourceType].map((grouping) => ({
                    value: grouping.key,
                    label: t(grouping.labelKey),
                  }))}
                />
              </Form.Item>
            )}
            <Form.Item
              name="range"
              required
              label={t('dashboard.settings.DefaultTimeRange')}
              tooltip={
                isTimeChartType(chart.type)
                  ? t('dashboard.panelModal.CreatedOverTimeDescription')
                  : t('dashboard.panelModal.CountWithinPeriodDescription')
              }
              style={{ flex: 1, minWidth: 180 }}
            >
              <PanelRangeSelect
                aria-label={t('dashboard.settings.DefaultTimeRange')}
                maxDays={0}
                noPeriodLabel={
                  isTimeChartType(chart.type)
                    ? undefined
                    : t('dashboard.panelModal.NoPeriod')
                }
              />
            </Form.Item>
          </BAIFlex>
        ) : null}
        <Form.Item name="filter" label={t('dashboard.panelModal.Condition')}>
          {config.kind === 'sessionNodes' ? (
            // The sessions page's condition language (queryfilter minilang),
            // over every field the manager accepts — not its 3-property picker.
            <BAIPropertyFilter
              filterProperties={config.getStringFilterProperties?.(t) ?? []}
            />
          ) : (
            <BAIGraphQLPropertyFilter
              style={{ width: '100%' }}
              filterProperties={[...(config.getFilterProperties?.(t) ?? [])]}
            />
          )}
        </Form.Item>
      </Form>
      <BAIFlex direction="column" align="stretch" gap="xs">
        {panelType === 'resourceChart' ? (
          <BAIFlex justify="end" align="center" gap="xs">
            <Text size="sm">{t('dashboard.panelModal.ShowTable')}</Text>
            <BAISwitch
              size="sm"
              value={showTable}
              onChange={(checked) => setShowTable(checked)}
              aria-label={t('dashboard.panelModal.ShowTable')}
            />
          </BAIFlex>
        ) : null}
        <div
          style={{
            border: `1px solid ${token('--color-border')}`,
            borderRadius: token('--radius-inner'),
            padding: token('--spacing-3'),
            maxHeight: 360,
            overflow: 'auto',
          }}
        >
          {open ? (
            <BAIBoardItemErrorBoundary
              // Keyed so an errored preview retries when the condition changes
              // — including the kind, or a table that failed keeps its fallback
              // after switching to a count that would have rendered.
              key={`${panelType}:${resourceType}:${JSON.stringify(filter ?? null)}`}
              title={t(config.labelKey)}
              // A chart change retries an errored preview without remounting a working one.
              resetKeys={[chart.type, chart.groupBy, range]}
              status="error"
            >
              <PanelPermissionBoundary>
                <Suspense fallback={<BAISkeleton />}>
                  {panelType === 'resourceChart' ? (
                    <BAIFlex direction="column" align="stretch" gap="md">
                      {/* With the table on, the chart keeps its own fixed height. */}
                      <BAIFlex
                        direction="column"
                        align="stretch"
                        style={chart.showTable ? undefined : { height: 240 }}
                      >
                        <Suspense
                          fallback={
                            <SkeletonChart
                              variant={SKELETON_VARIANTS[chart.type]}
                              height="100%"
                            />
                          }
                        >
                          <ResourceChartContent
                            key={`${resourceType}:${JSON.stringify(filter ?? null)}`}
                            descriptor={{
                              resourceType,
                              filter: filter ?? null,
                              order,
                              chart,
                              range,
                            }}
                            now={previewNow}
                          />
                        </Suspense>
                      </BAIFlex>
                      {chart.showTable ? (
                        // Its own boundary, so a table load never hides the chart.
                        <Suspense fallback={<BAISkeleton />}>
                          {renderTablePreview(
                            filter,
                            chartWindow(chart, range, previewNow),
                          )}
                        </Suspense>
                      ) : null}
                    </BAIFlex>
                  ) : panelType === 'resourceCount' ? (
                    <BAIFlex align="center" justify="center">
                      <ResourceCountContent
                        key={`${resourceType}:${JSON.stringify(filter ?? null)}`}
                        descriptor={{
                          resourceType,
                          filter: filter ?? null,
                          order,
                        }}
                      />
                    </BAIFlex>
                  ) : panelType === 'sessionResourceGrid' ? (
                    // The grid's own toolbar IS this panel kind's settings UI —
                    // the same symmetry as sorting the table preview to set the
                    // panel's order. `gridView` stays out of the key so toggling a
                    // setting doesn't remount and refetch.
                    <SessionResourceGridContent
                      key={`${resourceType}:${JSON.stringify(filter ?? null)}`}
                      descriptor={{
                        resourceType,
                        filter: filter ?? null,
                        order,
                        gridView,
                      }}
                      onChangeViewParams={setGridView}
                      disableSessionDetail
                    />
                  ) : (
                    renderTablePreview(filter)
                  )}
                </Suspense>
              </PanelPermissionBoundary>
            </BAIBoardItemErrorBoundary>
          ) : null}
        </div>
      </BAIFlex>
    </BAIModal>
  );
};

export default DashboardPanelModal;
