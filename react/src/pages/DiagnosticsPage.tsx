/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { message } from '../app-shim';
import CspDiagnosticsSection from '../components/CspDiagnosticsSection';
import EndpointDiagnosticsSection from '../components/EndpointDiagnosticsSection';
import ErrorBoundaryWithNullFallback from '../components/ErrorBoundaryWithNullFallback';
import StorageProxyDiagnosticsSection from '../components/StorageProxyDiagnosticsSection';
import WebServerConfigDiagnosticsSection from '../components/WebServerConfigDiagnosticsSection';
import { downloadCSV, escapeCsvValue } from '../helper/csv-util';
import { DiagnosticResult } from '../types/diagnostics';
import { Collapsible, CollapsibleGroup } from '@astryxdesign/core/Collapsible';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Switch } from '@astryxdesign/core/Switch';
import {
  BAISkeleton,
  BAIButton,
  BAICard,
  BAIFlex,
  useFetchKey,
} from 'backend.ai-ui';
import { Download, EllipsisVertical, RotateCw } from 'lucide-react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { Suspense, useCallback, useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

type SectionKey = 'csp' | 'storage' | 'endpoint' | 'config';

const DiagnosticsPage = () => {
  'use memo';

  const { t } = useTranslation();
  const [curTabKey] = useQueryState(
    'tab',
    parseAsStringLiteral(['diagnostics']).withDefault('diagnostics'),
  );
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
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n');

    const today = new Date().toISOString().slice(0, 10);
    // Diagnostics reports are assembled client-side; switch to the
    // useCSVExport hook once server-side CSV export supports them.
    downloadCSV(csvContent, `diagnostics-${today}.csv`);
  };

  const allItems = [
    {
      key: 'csp' as SectionKey,
      label: t('diagnostics.ContentSecurityPolicy'),
      children: (
        <ErrorBoundaryWithNullFallback>
          <Suspense fallback={<BAISkeleton />}>
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
          <Suspense fallback={<BAISkeleton />}>
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
          <Suspense fallback={<BAISkeleton />}>
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
          <Suspense fallback={<BAISkeleton />}>
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
      tabList={[
        {
          key: 'diagnostics',
          label: t('webui.menu.Diagnostics'),
        },
      ]}
      tabBarExtraContent={
        <BAIFlex gap="sm" align="center">
          {/* antd `Switch` + a sibling `Typography.Text` caption -> one Astryx
              `Switch`. `label` is required and rendered by the control itself
              (`labelPosition="end"` is the default), so the separate text node
              is not just redundant, it was the only thing giving the toggle an
              accessible name — and it never actually did, because antd's
              Switch and that Text were unassociated siblings. */}
          <Switch
            size="sm"
            value={showOnlyFailed}
            onChange={setShowOnlyFailed}
            label={t('diagnostics.ShowOnlyFailedItems')}
          />
          <BAIButton
            icon={
              <RotateCw
                className={isPending ? 'bai-icon-spin' : undefined}
                size="1em"
              />
            }
            onClick={handleRefresh}
            loading={isPending}
          >
            {t('diagnostics.Refresh')}
          </BAIButton>
          {/* antd `Dropdown menu={{items}}` wrapping an icon-only child button
              -> `DropdownMenu`, which owns its own trigger. `trigger={['click']}`
              is the Astryx default and disappears; the per-item `key` goes with
              antd's menu model (`onClick` already lives on the item). The
              trigger gains a real accessible name, which the bare icon button
              never had. */}
          <DropdownMenu
            hasChevron={false}
            placement="below"
            alignment="end"
            button={{
              label: t('button.More'),
              isIconOnly: true,
              icon: <EllipsisVertical size="1em" />,
            }}
            items={[
              {
                icon: <Download size="1em" />,
                label: t('diagnostics.ExportCSV'),
                onClick: handleExport,
              },
            ]}
          />
        </BAIFlex>
      }
    >
      {curTabKey === 'diagnostics' && (
        <BAIFlex direction="column" align="stretch" gap="md">
          {visibleItems.length === 0 ? (
            // antd `Empty` -> `EmptyState`: `description` becomes the required
            // `title`; `PRESENTED_IMAGE_SIMPLE` has no counterpart and the
            // section genuinely has nothing to illustrate, so no icon.
            <EmptyState title={t('diagnostics.NoFailedItems')} />
          ) : (
            // antd `Collapse items=[...] defaultActiveKey={[all]}` (a bordered
            // multi-panel accordion, every panel open) -> `CollapsibleGroup
            // type="multiple" hasDividers` + one `Collapsible` per item.
            // `hasDividers` supplies the row hairlines antd's panel chrome drew;
            // the outer box border is DROPPED (Astryx collapsibles are flat, and
            // this list already sits inside a `BAICard`).
            <CollapsibleGroup
              type="multiple"
              hasDividers
              // The GROUP owns open state once it coordinates its children —
              // a child's own `defaultIsOpen` is ignored inside one (measured:
              // every section rendered collapsed). antd's
              // `defaultActiveKey={[all]}` therefore becomes the group's
              // `defaultValue`.
              defaultValue={allItems.map((item) => item.key)}
            >
              {visibleItems.map((item) => (
                <Collapsible
                  key={item.key}
                  value={item.key}
                  trigger={item.label}
                >
                  {item.children}
                </Collapsible>
              ))}
            </CollapsibleGroup>
          )}
        </BAIFlex>
      )}
    </BAICard>
  );
};

export default DiagnosticsPage;
