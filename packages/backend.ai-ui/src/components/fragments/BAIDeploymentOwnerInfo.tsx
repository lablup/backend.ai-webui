import { BAIDeploymentOwnerInfo_deployment$key } from '../../__generated__/BAIDeploymentOwnerInfo_deployment.graphql';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { Tooltip, Typography } from 'antd';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

export interface BAIDeploymentOwnerInfoProps {
  deploymentFrgmt: BAIDeploymentOwnerInfo_deployment$key | null | undefined;
}

/**
 * BAIDeploymentOwnerInfo — render the creator of a deployment as the
 * email with a tooltip exposing full name / username for admin views.
 */
const BAIDeploymentOwnerInfo: React.FC<BAIDeploymentOwnerInfoProps> = ({
  deploymentFrgmt,
}) => {
  'use memo';
  const { t } = useBAIi18n();

  const deployment = useFragment(
    graphql`
      fragment BAIDeploymentOwnerInfo_deployment on ModelDeployment {
        id
        creator @since(version: "26.4.3") {
          id
          basicInfo {
            email
            username
            fullName
          }
        }
      }
    `,
    deploymentFrgmt,
  );

  const email = deployment?.creator?.basicInfo?.email ?? '';
  const fullName = deployment?.creator?.basicInfo?.fullName ?? '';
  const username = deployment?.creator?.basicInfo?.username ?? '';

  if (!email) {
    return <Typography.Text type="secondary">-</Typography.Text>;
  }

  const tooltipLines = [
    t('comp:BAIDeploymentOwnerInfo.CreatedBy'),
    fullName || username || email,
    email,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <Tooltip
      title={<span style={{ whiteSpace: 'pre-line' }}>{tooltipLines}</span>}
    >
      <Typography.Text ellipsis={{ tooltip: false }} style={{ maxWidth: 200 }}>
        {email}
      </Typography.Text>
    </Tooltip>
  );
};

export default BAIDeploymentOwnerInfo;
