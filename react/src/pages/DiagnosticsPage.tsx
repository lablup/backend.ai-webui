/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import CspDiagnosticsSection from '../components/CspDiagnosticsSection';
import EndpointDiagnosticsSection from '../components/EndpointDiagnosticsSection';
import ErrorBoundaryWithNullFallback from '../components/ErrorBoundaryWithNullFallback';
import StorageProxyDiagnosticsSection from '../components/StorageProxyDiagnosticsSection';
import WebServerConfigDiagnosticsSection from '../components/WebServerConfigDiagnosticsSection';
import { downloadBlob } from '../helper/csv-util';
import { DiagnosticResult } from '../types/diagnostics';
import {
  DownloadOutlined,
  MoreOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Collapse,
  Dropdown,
  Skeleton,
  Switch,
  Typography,
  message,
} from 'antd';
import { BAIButton, BAICard, BAIFlex, useFetchKey } from 'backend.ai-ui';
import { Suspense, useCallback, useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'diagnostics';
type SectionKey = 'csp' | 'storage' | 'endpoint' | 'config';

const tabParam = withDefault(StringParam, 'diagnostics');

const DiagnosticsPage = () => {
  'use memo';

  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);
  const [fetchKey, updateFetchKey] = useFetchKey();
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

  const sectionResultsRef = useRef<{
    csp: DiagnosticResult[];
    storage: DiagnosticResult[];
    endpoint: DiagnosticResult[];
    config: DiagnosticResult[];
  }>({
    csp: [],
    storage: [],
    endpoint: [],
    config: [],
  });

  const handleRefresh = () => {
    startTransition(() => {
      updateFetchKey();
      sectionResultsRef.current = {
        csp: [],
        storage: [],
        endpoint: [],
        config: [],
      };
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

  const onCspResultsChange = useCallback((results: DiagnosticResult[]) => {
    sectionResultsRef.current.csp = results;
  }, []);
  const onStorageResultsChange = useCallback((results: DiagnosticResult[]) => {
    sectionResultsRef.current.storage = results;
  }, []);
  const onEndpointResultsChange = useCallback((results: DiagnosticResult[]) => {
    sectionResultsRef.current.endpoint = results;
  }, []);
  const onConfigResultsChange = useCallback((results: DiagnosticResult[]) => {
    sectionResultsRef.current.config = results;
  }, []);

  const handleExport = () => {
    const allResults = [
      ...sectionResultsRef.current.csp,
      ...sectionResultsRef.current.storage,
      ...sectionResultsRef.current.endpoint,
      ...sectionResultsRef.current.config,
    ];

    if (allResults.length === 0) {
      message.info(t('diagnostics.NoResultsToExport'));
      return;
    }

    const escCsv = (val: string) =>
      val.includes(',') || val.includes('"') || val.includes('\n')
        ? `"${val.replace(/"/g, '""')}"`
        : val;

    const header = [
      'ID',
      'Severity',
      'Category',
      'Title',
      'Description',
      'Remediation',
    ];
    const rows = allResults.map((result) => [
      result.id,
      result.severity,
      result.category,
      t(result.titleKey, result.interpolationValues ?? {}),
      t(result.descriptionKey, result.interpolationValues ?? {}),
      result.remediationKey
        ? t(result.remediationKey, result.interpolationValues ?? {})
        : '',
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map(escCsv).join(','))
      .join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const today = new Date().toISOString().slice(0, 10);
    downloadBlob(blob, `diagnostics-${today}.csv`);
  };

  const allItems = [
    {
      key: 'csp' as SectionKey,
      label: t('diagnostics.ContentSecurityPolicy'),
      children: (
        <ErrorBoundaryWithNullFallback>
          <Suspense fallback={<Skeleton active />}>
            <CspDiagnosticsSection
              hidePassed={showOnlyFailed}
              fetchKey={fetchKey}
              onHasIssues={createHasIssuesCallback('csp')}
              onResultsChange={onCspResultsChange}
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
              fetchKey={fetchKey}
              onHasIssues={createHasIssuesCallback('storage')}
              onResultsChange={onStorageResultsChange}
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
              fetchKey={fetchKey}
              onHasIssues={createHasIssuesCallback('endpoint')}
              onResultsChange={onEndpointResultsChange}
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
              fetchKey={fetchKey}
              onHasIssues={createHasIssuesCallback('config')}
              onResultsChange={onConfigResultsChange}
            />
          </Suspense>
        </ErrorBoundaryWithNullFallback>
      ),
    },
  ];

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
          <Dropdown
            menu={{
              items: [
                {
                  key: 'export-csv',
                  icon: <DownloadOutlined />,
                  label: t('diagnostics.ExportCSV'),
                  onClick: handleExport,
                },
              ],
            }}
            trigger={['click']}
          >
            <BAIButton icon={<MoreOutlined />} />
          </Dropdown>
        </BAIFlex>
      }
    >
      {curTabKey === 'diagnostics' && (
        <BAIFlex direction="column" align="stretch" gap="md">
          <Collapse
            defaultActiveKey={['csp', 'storage', 'endpoint', 'config']}
            items={visibleItems}
          />
        </BAIFlex>
      )}
    </BAICard>
  );
};

export default DiagnosticsPage;
