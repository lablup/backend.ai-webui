import { BAISessionClusterModeFragment$key } from '../../__generated__/BAISessionClusterModeFragment.graphql';
import { Tag, theme, Typography } from 'antd';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment, graphql } from 'react-relay';

export interface BAISessionClusterModeProps {
  /** v1 `ComputeSessionNode` fragment. Omit when passing values directly. */
  sessionFrgmt?: BAISessionClusterModeFragment$key | null;
  /**
   * Cluster mode value (e.g. from the v2 `SessionV2` API). Takes precedence
   * over `sessionFrgmt` when provided.
   */
  clusterMode?: string | null;
  /** Cluster size value. Takes precedence over `sessionFrgmt` when provided. */
  clusterSize?: number | null;
  showSize?: boolean;
  mode?: 'text' | 'tag';
}

const BAISessionClusterMode: React.FC<BAISessionClusterModeProps> = ({
  sessionFrgmt,
  clusterMode,
  clusterSize,
  showSize = true,
  mode = 'text',
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const session = useFragment(
    graphql`
      fragment BAISessionClusterModeFragment on ComputeSessionNode {
        cluster_mode
        cluster_size
      }
    `,
    sessionFrgmt ?? null,
  );

  const resolvedClusterMode = clusterMode ?? session?.cluster_mode;
  const resolvedClusterSize = clusterSize ?? session?.cluster_size;
  const canShowSize = showSize && !_.isNil(resolvedClusterSize);

  const modeTitle = _.startsWith(
    resolvedClusterMode?.toUpperCase() || '',
    'SINGLE',
  )
    ? t('comp:BAISessionClusterMode.SingleNodeShort')
    : _.startsWith(resolvedClusterMode?.toUpperCase() || '', 'MULTI')
      ? t('comp:BAISessionClusterMode.MultiNodeShort')
      : '-';
  return mode === 'text' ? (
    <Typography.Text>
      {modeTitle}
      {canShowSize && (
        <>
          &nbsp;
          <Typography.Text type="secondary">
            ({resolvedClusterSize})
          </Typography.Text>
        </>
      )}
    </Typography.Text>
  ) : (
    <Tag>
      {modeTitle}
      {canShowSize && (
        <>
          &nbsp;
          <Typography.Text
            type="secondary"
            style={{
              fontSize: token.fontSizeSM,
            }}
          >
            ({resolvedClusterSize})
          </Typography.Text>
        </>
      )}
    </Tag>
  );
};

export default BAISessionClusterMode;
