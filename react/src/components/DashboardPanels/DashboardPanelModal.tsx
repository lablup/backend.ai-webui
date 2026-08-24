/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import {
  DEFAULT_SESSION_GRID_VIEW,
  type SessionGridViewParams,
} from '../../helper/sessionResourceGridData';
import { theme } from '../../theme-shim';
import {
  AstryxFormSegmented,
  AstryxFormSelector,
  AstryxFormTextInput,
} from '../astryxFormControls';
import { DeploymentNodesPanelContent } from './DeploymentNodesPanel';
import { ResourceCountContent } from './ResourceCountPanel';
import { ResourceTableContent } from './ResourceTablePanel';
import { SessionNodesPanelContent } from './SessionNodesPanel';
import { SessionResourceGridContent } from './SessionResourceGridPanel';
import { availablePanelTypes, panelTypeLabelKeys } from './panelRegistry';
import { resourceRegistry } from './resourceRegistry';
import type {
  PanelInput,
  PanelType,
  PersistedPanel,
  ResourceKey,
} from './types';
import {
  BAIBoardItemErrorBoundary,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIModal,
  BAIPropertyFilter,
  BAISkeleton,
  type GraphQLFilter,
} from 'backend.ai-ui';
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
}

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
  const { token } = theme.useToken();
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
    });
    onRequestClose();
  };

  return (
    <BAIModal
      open={open}
      destroyOnHidden
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
            <AstryxFormSegmented
              label={t('dashboard.panelModal.PanelType')}
              options={panelTypeOptions.map((type) => ({
                value: type,
                label: t(panelTypeLabelKeys[type]),
              }))}
            />
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
            <AstryxFormSelector
              label={t('dashboard.panelModal.DataSource')}
              options={resourceOptions.map((key) => ({
                value: key,
                label: t(resourceRegistry[key].labelKey),
              }))}
            />
          </Form.Item>
          <Form.Item
            name="title"
            label={t('dashboard.panelModal.TitleOptional')}
            extra={t('dashboard.panelModal.TitleDescription')}
            style={{ flex: 1, minWidth: 180 }}
          >
            <AstryxFormTextInput
              label={t('dashboard.panelModal.TitleOptional')}
              placeholder={t(config.labelKey)}
              hasClear
            />
          </Form.Item>
        </BAIFlex>
        <Form.Item name="filter" label={t('dashboard.panelModal.Condition')}>
          {config.kind === 'sessionNodes' ? (
            // Same condition language/properties as the sessions page.
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
        <div
          style={{
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadius,
            padding: token.paddingSM,
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
              status="error"
            >
              <Suspense fallback={<BAISkeleton />}>
                {panelType === 'resourceCount' ? (
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
                ) : config.kind === 'deploymentNodes' ? (
                  <DeploymentNodesPanelContent
                    key={`${resourceType}:${JSON.stringify(filter ?? null)}`}
                    descriptor={{
                      resourceType,
                      filter: filter ?? null,
                      order,
                    }}
                    onChangeOrder={(next) => setOrder(next ?? null)}
                    disableNavigation
                  />
                ) : config.kind === 'sessionNodes' ? (
                  <SessionNodesPanelContent
                    key={`${resourceType}:${JSON.stringify(filter ?? null)}`}
                    descriptor={{
                      resourceType,
                      filter: filter ?? null,
                      order,
                    }}
                    onChangeOrder={(next) => setOrder(next ?? null)}
                    disableSessionDetail
                  />
                ) : (
                  <ResourceTableContent
                    key={`${resourceType}:${JSON.stringify(filter ?? null)}`}
                    descriptor={{
                      resourceType,
                      filter: filter ?? null,
                      order,
                    }}
                    onChangeOrder={(next) => setOrder(next ?? null)}
                  />
                )}
              </Suspense>
            </BAIBoardItemErrorBoundary>
          ) : null}
        </div>
      </BAIFlex>
    </BAIModal>
  );
};

export default DashboardPanelModal;
