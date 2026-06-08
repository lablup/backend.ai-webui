/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import DashboardAddPanelModal from './DashboardAddPanelModal';
import { resourceRegistry } from './resourceRegistry';
import type { PanelDescriptor, PersistedPanel } from './types';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Empty, theme, Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface DashboardEditSiderProps {
  panels: ReadonlyArray<PersistedPanel>;
  onAdd: (
    descriptor: Pick<PanelDescriptor, 'resourceType' | 'filter' | 'title'>,
  ) => void;
  onRemove: (id: string) => void;
}

/**
 * Inline edit side-panel shown while the dashboard is in edit mode. Rendered as a
 * flex sibling of the board (NOT an overlay) so the board reflows into the
 * remaining width and is never covered. It lists the custom panels (with remove)
 * and an "Add" button that opens the {@link DashboardAddPanelModal} — the panel
 * is only created when the user confirms in that modal.
 */
const DashboardEditSider: React.FC<DashboardEditSiderProps> = ({
  panels,
  onAdd,
  onRemove,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="md"
      style={{
        width: 320,
        flexShrink: 0,
        paddingLeft: token.paddingLG,
        borderLeft: `1px solid ${token.colorBorder}`,
        overflow: 'auto',
      }}
    >
      <BAIFlex direction="row" justify="between" align="center" gap="sm">
        <Typography.Title level={5} style={{ margin: 0 }}>
          {t('dashboard.editSider.title', { defaultValue: 'Custom panels' })}
        </Typography.Title>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        >
          {t('button.Add')}
        </Button>
      </BAIFlex>

      {panels.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('dashboard.editSider.empty', {
            defaultValue: 'No custom panels yet',
          })}
        />
      ) : (
        <BAIFlex direction="column" align="stretch" gap="xs">
          {panels.map((panel) => {
            const config = resourceRegistry[panel.descriptor.resourceType];
            const label =
              panel.descriptor.title ??
              (config ? t(config.labelKey) : panel.id);
            return (
              <BAIFlex
                key={panel.id}
                direction="row"
                justify="between"
                align="center"
                gap="sm"
                style={{
                  paddingBlock: token.paddingXS,
                  borderBottom: `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <Typography.Text ellipsis style={{ flex: 1, minWidth: 0 }}>
                  {label}
                </Typography.Text>
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  aria-label={t('button.Close')}
                  onClick={() => onRemove(panel.id)}
                />
              </BAIFlex>
            );
          })}
        </BAIFlex>
      )}

      <DashboardAddPanelModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={onAdd}
      />
    </BAIFlex>
  );
};

export default DashboardEditSider;
