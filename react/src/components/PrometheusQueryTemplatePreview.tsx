/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { PrometheusQueryTemplatePreviewQuery } from '../__generated__/PrometheusQueryTemplatePreviewQuery.graphql';
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import {
  BAIButton,
  BAIFlex,
  useDebouncedDeferredValue,
  useFetchKey,
} from 'backend.ai-ui';
import React, { Suspense, useDeferredValue } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const DEBOUNCE_MS = 800;

/**
 * Inline preview component for a raw PromQL query template.
 *
 * Acts as a thin wrapper that catches errors thrown by the inner content
 * (network failures, Relay infrastructure errors) and surfaces them as an
 * inline message. GraphQL-level failures are handled inside the content via
 * the `@catch` directive instead of throwing.
 *
 * The ErrorBoundary's `resetKeys` is bound to `queryTemplate`, so any change
 * to the input automatically clears a previous error and lets the content
 * try again with the new value.
 */
const PrometheusQueryTemplatePreview: React.FC<{
  queryTemplate: string;
}> = ({ queryTemplate }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <ErrorBoundary
      resetKeys={[queryTemplate]}
      fallbackRender={({ error }) => {
        return (
          <BAIFlex gap="xxs">
            <Typography.Text type="danger">
              {extractErrorMessage(
                error,
                t('autoScalingRule.QueryExecutionFailed'),
              )}
            </Typography.Text>
          </BAIFlex>
        );
      }}
    >
      <Suspense fallback={<LoadingOutlined spin />}>
        <PrometheusQueryTemplatePreviewContent queryTemplate={queryTemplate} />
      </Suspense>
    </ErrorBoundary>
  );
};

/**
 * Preview content. Two distinct loading shapes:
 *  - Input still settling (`fetchTemplate !== trimmed`): hide the previous
 *    value and show a loading-only placeholder. The user changed the query,
 *    so the previously rendered value is no longer meaningful.
 *  - Refetch via the refresh button (same template, new fetchKey): keep the
 *    previous value visible and only show a loading spinner on the button —
 *    the deferred fetchKey makes React suspend in the background render
 *    while keeping the committed render on screen.
 *
 * GraphQL / network errors throw and are caught by the wrapper's
 * ErrorBoundary. The domain-level `status !== 'success'` case is a regular
 * data field and is rendered inline here.
 */
const PrometheusQueryTemplatePreviewContent: React.FC<{
  queryTemplate: string;
}> = ({ queryTemplate }) => {
  'use memo';
  const { t } = useTranslation();
  const trimmed = queryTemplate.trim();
  const fetchTemplate = useDebouncedDeferredValue(trimmed, {
    wait: DEBOUNCE_MS,
  });
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredKey = useDeferredValue(fetchKey);

  const { adminPreviewPrometheusQueryPreset } =
    useLazyLoadQuery<PrometheusQueryTemplatePreviewQuery>(
      graphql`
        query PrometheusQueryTemplatePreviewQuery($queryTemplate: String!) {
          adminPreviewPrometheusQueryPreset(
            input: { queryTemplate: $queryTemplate }
          ) {
            status
            result {
              values {
                timestamp
                value
              }
            }
          }
        }
      `,
      { queryTemplate: fetchTemplate },
      {
        fetchPolicy: !fetchTemplate ? 'store-only' : 'network-only',
        fetchKey: deferredKey,
      },
    );

  const hadDomainError =
    !!fetchTemplate && adminPreviewPrometheusQueryPreset?.status !== 'success';

  const value = hadDomainError
    ? null
    : formatPreviewValue(adminPreviewPrometheusQueryPreset?.result, t);

  return fetchTemplate !== trimmed ? (
    <LoadingOutlined spin />
  ) : !fetchTemplate ? null : hadDomainError ? (
    <BAIFlex gap="xxs">
      <Typography.Text type="danger">
        {t('autoScalingRule.QueryExecutionFailed')}
      </Typography.Text>
    </BAIFlex>
  ) : (
    <BAIFlex gap="xxs">
      <Typography.Text type="secondary">
        {t('autoScalingRule.CurrentValue')}:
      </Typography.Text>
      <Typography.Text type="secondary">
        {value ?? t('autoScalingRule.NoDataAvailable')}
      </Typography.Text>
      <BAIButton
        type="link"
        size="small"
        icon={<ReloadOutlined />}
        loading={fetchKey !== deferredKey}
        onClick={() => updateFetchKey()}
        title={t('autoScalingRule.RefreshPreview')}
        aria-label={t('autoScalingRule.RefreshPreview')}
      />
    </BAIFlex>
  );
};

const formatNumber = (raw: string) => {
  const num = parseFloat(raw);
  return isNaN(num) ? raw : (Math.round(num * 100) / 100).toString();
};

const formatPreviewValue = (
  result: ReadonlyArray<{
    readonly values: ReadonlyArray<{
      readonly timestamp: number;
      readonly value: string;
    }>;
  }> = [],
  t: (key: string, opts?: Record<string, unknown>) => string,
): string | null => {
  if (result.length === 1) {
    const vals = result[0].values;
    const raw = vals.length > 0 ? vals[vals.length - 1].value : null;
    return raw != null ? formatNumber(raw) : null;
  }
  if (result.length > 1) {
    const firstVals = result[0].values;
    const latest =
      firstVals.length > 0 ? firstVals[firstVals.length - 1].value : null;
    return latest != null
      ? t('autoScalingRule.MultipleSeriesResult', {
          count: result.length,
          value: formatNumber(latest),
        })
      : null;
  }
  return null;
};

// Relay wraps GQL errors: "...got error(s): <msg>\n\nSee the error...".
// Split on the known prefix/suffix so whitespace differences between Relay
// versions don't cause a miss.
const extractErrorMessage = (_err: unknown, fallback: string): string => {
  if (!(_err instanceof Error)) return fallback;
  const prefix = 'got error(s): ';
  const prefixIdx = _err.message.indexOf(prefix);
  if (prefixIdx === -1) return _err.message || fallback;
  const afterPrefix = _err.message.slice(prefixIdx + prefix.length);
  const seeIdx = afterPrefix.indexOf('See the error');
  const raw = seeIdx !== -1 ? afterPrefix.slice(0, seeIdx) : afterPrefix;
  return raw.trim() || fallback;
};

export default PrometheusQueryTemplatePreview;
