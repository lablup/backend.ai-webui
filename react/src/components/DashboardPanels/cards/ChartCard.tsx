/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentUserInfo } from '../../../hooks/backendai';
import ResourceChartPanel from '../ResourceChartPanel';
import { cardScopeKind } from '../cardScope';
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
    scope,
  }) => {
    'use memo';
    const { t } = useTranslation();
    const [userInfo] = useCurrentUserInfo();
    // The session source reads a project or domain; the member board counts the viewer's own sessions.
    const filter =
      resourceType === 'session' && cardScopeKind(scope) === 'mine'
        ? `user_email == ${JSON.stringify(userInfo.email)}`
        : undefined;
    return (
      <ResourceChartPanel
        descriptor={{
          resourceType,
          title: t(titleKey),
          filter,
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
