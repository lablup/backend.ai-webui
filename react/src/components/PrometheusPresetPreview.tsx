/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { PrometheusPresetPreviewResultQuery } from '../__generated__/PrometheusPresetPreviewResultQuery.graphql';
import { ReloadOutlined } from '@ant-design/icons';
import { Typography, theme } from 'antd';
import {
  BAIButton,
  INITIAL_FETCH_KEY,
  toLocalId,
  useFetchKey,
} from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Inline preview component for a selected Prometheus preset.
 * The label and refresh button are always visible; only the value area
 * shows a loading spinner during fetch/refresh.
 */
export const PrometheusPresetPreview: React.FC<{
  presetGlobalId: string;
}> = ({ presetGlobalId }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const presetRawId = toLocalId(presetGlobalId);

  const data = useLazyLoadQuery<PrometheusPresetPreviewResultQuery>(
    graphql`
      query PrometheusPresetPreviewResultQuery(
        $id: ID!
        $options: ExecuteQueryDefinitionOptionsInput
      ) {
        prometheusQueryPresetResult(id: $id, options: $options) {
          status
          resultType
          result {
            metric {
              key
              value
            }
            values {
              timestamp
              value
            }
          }
        }
      }
    `,
    {
      id: presetRawId,
      options: {
        filterLabels: [],
        groupLabels: [],
      },
    },
    {
      fetchPolicy:
        fetchKey === INITIAL_FETCH_KEY ? 'store-and-network' : 'network-only',
      fetchKey,
    },
  );

  const results = data.prometheusQueryPresetResult.result;

  const formatValue = (raw: string) => {
    const num = parseFloat(raw);
    return isNaN(num) ? raw : (Math.round(num * 100) / 100).toString();
  };

  let displayValue: string | null = null;
  if (results.length === 1) {
    const values = results[0].values;
    const raw = values.length > 0 ? values[values.length - 1].value : null;
    displayValue = raw != null ? formatValue(raw) : null;
  } else if (results.length > 1) {
    const firstValues = results[0].values;
    const latestValue =
      firstValues.length > 0 ? firstValues[firstValues.length - 1].value : null;
    displayValue =
      latestValue != null
        ? t('autoScalingRule.MultipleSeriesResult', {
            count: results.length,
            value: formatValue(latestValue),
          })
        : null;
  }

  return (
    <span>
      <Typography.Text
        type="secondary"
        style={{ marginRight: token.marginXXS }}
      >
        {t('autoScalingRule.CurrentValue')}:{' '}
      </Typography.Text>
      {displayValue != null ? (
        <Typography.Text type="secondary">{displayValue}</Typography.Text>
      ) : (
        <Typography.Text type="secondary">
          {t('autoScalingRule.NoDataAvailable')}
        </Typography.Text>
      )}
      <BAIButton
        type="link"
        size="small"
        icon={<ReloadOutlined />}
        action={async () => updateFetchKey()}
        title={t('autoScalingRule.RefreshPreview')}
        aria-label={t('autoScalingRule.RefreshPreview')}
      />
    </span>
  );
};

export default PrometheusPresetPreview;
