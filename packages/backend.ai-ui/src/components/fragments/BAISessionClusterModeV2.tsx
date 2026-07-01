import { BAISessionClusterModeV2Fragment$key } from '../../__generated__/BAISessionClusterModeV2Fragment.graphql';
import { Tag, theme, Typography } from 'antd';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment, graphql } from 'react-relay';

export interface BAISessionClusterModeV2Props {
  /** v2 `SessionV2MetadataInfo` fragment. */
  metadataFrgmt: BAISessionClusterModeV2Fragment$key | null;
  showSize?: boolean;
  mode?: 'text' | 'tag';
}

/**
 * v2 counterpart of `BAISessionClusterMode`. Consumes the
 * `SessionV2MetadataInfo` fragment directly instead of receiving the cluster
 * mode/size via props. The v2 `ClusterMode` enum (`SINGLE_NODE`/`MULTI_NODE`)
 * is matched by prefix, mirroring the v1 component.
 */
const BAISessionClusterModeV2: React.FC<BAISessionClusterModeV2Props> = ({
  metadataFrgmt,
  showSize = true,
  mode = 'text',
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const metadata = useFragment(
    graphql`
      fragment BAISessionClusterModeV2Fragment on SessionV2MetadataInfo {
        clusterMode
        clusterSize
      }
    `,
    metadataFrgmt ?? null,
  );

  const clusterMode = metadata?.clusterMode;
  const clusterSize = metadata?.clusterSize;
  const canShowSize = showSize && !_.isNil(clusterSize);

  const modeTitle = _.startsWith(clusterMode?.toUpperCase() || '', 'SINGLE')
    ? t('comp:BAISessionClusterMode.SingleNodeShort')
    : _.startsWith(clusterMode?.toUpperCase() || '', 'MULTI')
      ? t('comp:BAISessionClusterMode.MultiNodeShort')
      : '-';

  return mode === 'text' ? (
    <Typography.Text>
      {modeTitle}
      {canShowSize && (
        <>
          &nbsp;
          <Typography.Text type="secondary">({clusterSize})</Typography.Text>
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
            ({clusterSize})
          </Typography.Text>
        </>
      )}
    </Tag>
  );
};

export default BAISessionClusterModeV2;
