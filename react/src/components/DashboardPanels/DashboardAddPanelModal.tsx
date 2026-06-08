/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceTableContent } from './ResourceTablePanel';
import { resourceKeys, resourceRegistry } from './resourceRegistry';
import type { PanelDescriptor, ResourceKey } from './types';
import { Input, Modal, Select, Skeleton, theme, Typography } from 'antd';
import {
  BAIBoardItemErrorBoundary,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  type GraphQLFilter,
} from 'backend.ai-ui';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface DashboardAddPanelModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (
    descriptor: Pick<PanelDescriptor, 'resourceType' | 'filter' | 'title'>,
  ) => void;
}

/**
 * "Add panel" modal: pick a resource, build a condition with the same
 * {@link BAIGraphQLPropertyFilter} the panels use, optionally set a title, and
 * see the matching rows live in a preview table. The panel is only added to the
 * board when the user confirms (OK) — Cancel discards everything.
 */
const DashboardAddPanelModal: React.FC<DashboardAddPanelModalProps> = ({
  open,
  onClose,
  onAdd,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [resourceType, setResourceType] = useState<ResourceKey>(
    resourceKeys[0],
  );
  const [filter, setFilter] = useState<GraphQLFilter | undefined>(undefined);
  const [title, setTitle] = useState('');

  const config = resourceRegistry[resourceType];

  const reset = () => {
    setResourceType(resourceKeys[0]);
    setFilter(undefined);
    setTitle('');
  };
  const handleClose = () => {
    onClose();
    reset();
  };
  const handleOk = () => {
    onAdd({
      resourceType,
      filter: filter ?? null,
      title: title.trim() || undefined,
    });
    handleClose();
  };

  const labelStyle: React.CSSProperties = {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
  };

  return (
    <Modal
      open={open}
      title={t('dashboard.addPanel.title', { defaultValue: 'Add panel' })}
      okText={t('button.Add')}
      onOk={handleOk}
      onCancel={handleClose}
      width={960}
    >
      <BAIFlex
        direction="column"
        align="stretch"
        gap="md"
        style={{ marginTop: token.margin }}
      >
        <BAIFlex direction="row" align="end" gap="md" wrap="wrap">
          <BAIFlex
            direction="column"
            align="stretch"
            gap="xs"
            style={{ flex: 1, minWidth: 180 }}
          >
            <Typography.Text style={labelStyle}>
              {t('dashboard.addPanel.resource', { defaultValue: 'Resource' })}
            </Typography.Text>
            <Select
              style={{ width: '100%' }}
              value={resourceType}
              onChange={(value) => {
                setResourceType(value);
                setFilter(undefined);
              }}
              options={resourceKeys.map((key) => ({
                value: key,
                label: t(resourceRegistry[key].labelKey),
              }))}
            />
          </BAIFlex>
          <BAIFlex
            direction="column"
            align="stretch"
            gap="xs"
            style={{ flex: 1, minWidth: 180 }}
          >
            <Typography.Text style={labelStyle}>
              {t('dashboard.addPanel.titleField', {
                defaultValue: 'Title (optional)',
              })}
            </Typography.Text>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t(config.labelKey)}
              allowClear
            />
          </BAIFlex>
        </BAIFlex>

        <BAIFlex direction="column" align="stretch" gap="xs">
          <Typography.Text style={labelStyle}>
            {t('dashboard.addPanel.condition', { defaultValue: 'Condition' })}
          </Typography.Text>
          <BAIGraphQLPropertyFilter
            style={{ width: '100%' }}
            filterProperties={[...config.getFilterProperties(t)]}
            value={filter}
            onChange={(value) => setFilter(value ?? undefined)}
          />
        </BAIFlex>

        <BAIFlex direction="column" align="stretch" gap="xs">
          <Typography.Text style={labelStyle}>
            {t('dashboard.addPanel.preview', { defaultValue: 'Preview' })}
          </Typography.Text>
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
                title={t(config.labelKey)}
                status="error"
              >
                <Suspense fallback={<Skeleton active />}>
                  <ResourceTableContent
                    key={resourceType}
                    descriptor={{ resourceType, filter: filter ?? null }}
                  />
                </Suspense>
              </BAIBoardItemErrorBoundary>
            ) : null}
          </div>
        </BAIFlex>
      </BAIFlex>
    </Modal>
  );
};

export default DashboardAddPanelModal;
