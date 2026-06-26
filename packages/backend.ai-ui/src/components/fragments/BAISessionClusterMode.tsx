import { BAISessionClusterModeFragment$key } from '../../__generated__/BAISessionClusterModeFragment.graphql';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { Tag, theme, Typography } from 'antd';
import * as _ from 'lodash-es';
import React from 'react';
import { useFragment, graphql } from 'react-relay';

export interface BAISessionClusterModeProps {
  sessionFrgmt: BAISessionClusterModeFragment$key;
  showSize?: boolean;
  mode?: 'text' | 'tag';
}

const BAISessionClusterMode: React.FC<BAISessionClusterModeProps> = ({
  sessionFrgmt,
  showSize = true,
  mode = 'text',
}) => {
  const { t } = useBAIi18n();
  const { token } = theme.useToken();
  const session = useFragment(
    graphql`
      fragment BAISessionClusterModeFragment on ComputeSessionNode {
        cluster_mode
        cluster_size
      }
    `,
    sessionFrgmt,
  );

  const canShowSize = showSize && !_.isNil(session.cluster_size);

  const modeTitle = _.startsWith(
    session.cluster_mode?.toUpperCase() || '',
    'SINGLE',
  )
    ? t('comp:BAISessionClusterMode.SingleNodeShort')
    : _.startsWith(session.cluster_mode?.toUpperCase() || '', 'MULTI')
      ? t('comp:BAISessionClusterMode.MultiNodeShort')
      : '-';
  return mode === 'text' ? (
    <Typography.Text>
      {modeTitle}
      {canShowSize && (
        <>
          &nbsp;
          <Typography.Text type="secondary">
            ({session.cluster_size})
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
            ({session.cluster_size})
          </Typography.Text>
        </>
      )}
    </Tag>
  );
};

export default BAISessionClusterMode;
