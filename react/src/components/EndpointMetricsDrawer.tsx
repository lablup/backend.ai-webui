/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import EndpointMetricsPanel from './EndpointMetricsPanel';
import { Drawer } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface EndpointMetricsDrawerProps {
  open: boolean;
  endpointId: string;
  onClose: () => void;
}

const EndpointMetricsDrawer: React.FC<EndpointMetricsDrawerProps> = ({
  open,
  endpointId,
  onClose,
}) => {
  'use memo';
  const { t } = useTranslation();

  return (
    <Drawer
      title={t('modelService.InferenceMetrics')}
      open={open}
      onClose={onClose}
      width="70%"
      destroyOnClose
    >
      <EndpointMetricsPanel endpointId={endpointId} enabled={open} />
    </Drawer>
  );
};

export default EndpointMetricsDrawer;
