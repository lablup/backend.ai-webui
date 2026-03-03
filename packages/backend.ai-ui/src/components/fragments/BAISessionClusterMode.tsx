import { BAISessionClusterModeFragment$key } from '../../__generated__/BAISessionClusterModeFragment.graphql';
import { Tag, theme, Typography } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      {showSize && (
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
      {showSize && (
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
