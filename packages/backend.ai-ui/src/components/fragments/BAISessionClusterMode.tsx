import { BAISessionClusterModeFragment$key } from '../../__generated__/BAISessionClusterModeFragment.graphql';
import { Typography } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment, graphql } from 'react-relay';

export interface BAISessionClusterModeProps {
  sessionFrgmt: BAISessionClusterModeFragment$key;
}

const BAISessionClusterMode: React.FC<BAISessionClusterModeProps> = ({
  sessionFrgmt,
}) => {
  const { t } = useTranslation();
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
  return (
    <Typography.Text>
      {modeTitle}&nbsp;
      <Typography.Text type="secondary">
        ({session.cluster_size})
      </Typography.Text>
    </Typography.Text>
  );
};

export default BAISessionClusterMode;
