/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import CspDiagnosticsSection from '../components/CspDiagnosticsSection';
import EndpointDiagnosticsSection from '../components/EndpointDiagnosticsSection';
import StorageProxyDiagnosticsSection from '../components/StorageProxyDiagnosticsSection';
import WebServerConfigDiagnosticsSection from '../components/WebServerConfigDiagnosticsSection';
import { ReloadOutlined } from '@ant-design/icons';
import { Collapse, Skeleton } from 'antd';
import { BAIButton, BAICard, BAIFlex } from 'backend.ai-ui';
import { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import ErrorBoundaryWithNullFallback from 'src/components/ErrorBoundaryWithNullFallback';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'diagnostics';

const tabParam = withDefault(StringParam, 'diagnostics');

const DiagnosticsPage = () => {
  'use memo';

  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      setRefreshKey((prev) => prev + 1);
    });
  };

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
        <BAIButton
          icon={<ReloadOutlined spin={isPending} />}
          onClick={handleRefresh}
          loading={isPending}
        >
          {t('diagnostics.Refresh')}
        </BAIButton>
      }
    >
      {curTabKey === 'diagnostics' && (
        <BAIFlex direction="column" align="stretch" gap="md">
          <Collapse
            key={refreshKey}
            defaultActiveKey={['csp', 'storage', 'endpoint', 'config']}
            items={[
              {
                key: 'csp',
                label: t('diagnostics.ContentSecurityPolicy'),
                children: (
                  <ErrorBoundaryWithNullFallback>
                    <Suspense fallback={<Skeleton active />}>
                      <CspDiagnosticsSection />
                    </Suspense>
                  </ErrorBoundaryWithNullFallback>
                ),
              },
              {
                key: 'storage',
                label: t('diagnostics.StorageProxy'),
                children: (
                  <ErrorBoundaryWithNullFallback>
                    <Suspense fallback={<Skeleton active />}>
                      <StorageProxyDiagnosticsSection />
                    </Suspense>
                  </ErrorBoundaryWithNullFallback>
                ),
              },
              {
                key: 'endpoint',
                label: t('diagnostics.EndpointConnectivity'),
                children: (
                  <ErrorBoundaryWithNullFallback>
                    <Suspense fallback={<Skeleton active />}>
                      <EndpointDiagnosticsSection />
                    </Suspense>
                  </ErrorBoundaryWithNullFallback>
                ),
              },
              {
                key: 'config',
                label: t('diagnostics.WebServerConfig'),
                children: (
                  <ErrorBoundaryWithNullFallback>
                    <Suspense fallback={<Skeleton active />}>
                      <WebServerConfigDiagnosticsSection />
                    </Suspense>
                  </ErrorBoundaryWithNullFallback>
                ),
              },
            ]}
          />
        </BAIFlex>
      )}
    </BAICard>
  );
};

export default DiagnosticsPage;
