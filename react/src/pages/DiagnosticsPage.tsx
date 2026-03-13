/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import CspDiagnosticsSection from '../components/CspDiagnosticsSection';
import EndpointDiagnosticsSection from '../components/EndpointDiagnosticsSection';
import StorageProxyDiagnosticsSection from '../components/StorageProxyDiagnosticsSection';
import WebServerConfigDiagnosticsSection from '../components/WebServerConfigDiagnosticsSection';
import { ReloadOutlined } from '@ant-design/icons';
import { Collapse, Skeleton, Switch, Typography } from 'antd';
import { BAIButton, BAICard, BAIFlex } from 'backend.ai-ui';
import { Suspense, useCallback, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import ErrorBoundaryWithNullFallback from 'src/components/ErrorBoundaryWithNullFallback';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'diagnostics';
type SectionKey = 'csp' | 'storage' | 'endpoint' | 'config';

const tabParam = withDefault(StringParam, 'diagnostics');

const DiagnosticsPage = () => {
  'use memo';

  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [showOnlyFailed, setShowOnlyFailed] = useState(false);
  const [sectionsWithIssues, setSectionsWithIssues] = useState<
    Record<SectionKey, boolean>
  >({
    csp: true,
    storage: true,
    endpoint: true,
    config: true,
  });

  const handleRefresh = () => {
    startTransition(() => {
      setRefreshKey((prev) => prev + 1);
    });
  };

  const createHasIssuesCallback = useCallback(
    (key: SectionKey) => (hasIssues: boolean) => {
      setSectionsWithIssues((prev) => {
        if (prev[key] === hasIssues) return prev;
        return { ...prev, [key]: hasIssues };
      });
    },
    [],
  );

  const allItems = useMemo(
    () => [
      {
        key: 'csp' as SectionKey,
        label: t('diagnostics.ContentSecurityPolicy'),
        children: (
          <ErrorBoundaryWithNullFallback>
            <Suspense fallback={<Skeleton active />}>
              <CspDiagnosticsSection
                hidePassed={showOnlyFailed}
                onHasIssues={createHasIssuesCallback('csp')}
              />
            </Suspense>
          </ErrorBoundaryWithNullFallback>
        ),
      },
      {
        key: 'storage' as SectionKey,
        label: t('diagnostics.StorageProxy'),
        children: (
          <ErrorBoundaryWithNullFallback>
            <Suspense fallback={<Skeleton active />}>
              <StorageProxyDiagnosticsSection
                hidePassed={showOnlyFailed}
                onHasIssues={createHasIssuesCallback('storage')}
              />
            </Suspense>
          </ErrorBoundaryWithNullFallback>
        ),
      },
      {
        key: 'endpoint' as SectionKey,
        label: t('diagnostics.EndpointConnectivity'),
        children: (
          <ErrorBoundaryWithNullFallback>
            <Suspense fallback={<Skeleton active />}>
              <EndpointDiagnosticsSection
                hidePassed={showOnlyFailed}
                onHasIssues={createHasIssuesCallback('endpoint')}
              />
            </Suspense>
          </ErrorBoundaryWithNullFallback>
        ),
      },
      {
        key: 'config' as SectionKey,
        label: t('diagnostics.WebServerConfig'),
        children: (
          <ErrorBoundaryWithNullFallback>
            <Suspense fallback={<Skeleton active />}>
              <WebServerConfigDiagnosticsSection
                hidePassed={showOnlyFailed}
                onHasIssues={createHasIssuesCallback('config')}
              />
            </Suspense>
          </ErrorBoundaryWithNullFallback>
        ),
      },
    ],
    [t, showOnlyFailed, createHasIssuesCallback],
  );

  const visibleItems = showOnlyFailed
    ? allItems.filter((item) => sectionsWithIssues[item.key])
    : allItems;

  return (
    <BAICard
      activeTabKey={curTabKey}
      onTabChange={(key) => setCurTabKey(key as TabKey)}
      tabList={[
        {
          key: 'diagnostics',
          tab: t('webui.menu.Diagnostics'),
        },
      ]}
      tabBarExtraContent={
        <BAIFlex gap="sm" align="center">
          <Switch
            size="small"
            checked={showOnlyFailed}
            onChange={setShowOnlyFailed}
          />
          <Typography.Text>
            {t('diagnostics.ShowOnlyFailedItems')}
          </Typography.Text>
          <BAIButton
            icon={<ReloadOutlined spin={isPending} />}
            onClick={handleRefresh}
            loading={isPending}
          >
            {t('diagnostics.Refresh')}
          </BAIButton>
        </BAIFlex>
      }
    >
      {curTabKey === 'diagnostics' && (
        <BAIFlex direction="column" align="stretch" gap="md">
          <Collapse
            key={refreshKey}
            defaultActiveKey={['csp', 'storage', 'endpoint', 'config']}
            items={visibleItems}
          />
        </BAIFlex>
      )}
    </BAICard>
  );
};

export default DiagnosticsPage;
