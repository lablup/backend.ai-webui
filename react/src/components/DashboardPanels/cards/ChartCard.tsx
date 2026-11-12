/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import ResourceChartPanel from '../ResourceChartPanel';
import type { PanelChart, PanelComponentProps, ResourceKey } from '../types';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** A catalog card the custom-panel chart engine draws from a fixed source and chart; the page scope and the card's range do the rest. */
export const chartCard = (
  resourceType: ResourceKey,
  chart: PanelChart,
  titleKey: string,
): React.FC<PanelComponentProps> => {
  const ChartCard: React.FC<PanelComponentProps> = ({
    panel,
    fetchKey,
    vars,
  }) => {
    'use memo';
    const { t } = useTranslation();
    return (
      <ResourceChartPanel
        descriptor={{
          resourceType,
          title: t(titleKey),
          chart,
          range: vars.range,
        }}
        fetchKey={fetchKey}
        refreshedAt={vars.refreshedAt}
        panelId={panel.id}
      />
    );
  };
  return ChartCard;
};
