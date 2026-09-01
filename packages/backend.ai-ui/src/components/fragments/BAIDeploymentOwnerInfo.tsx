/*
 to-astryx W2-D: antd `Tooltip` -> Astryx `Tooltip` (`title` -> `content`,
 MAPPING §4) and antd `Typography.Text` -> Astryx `Text` / `BAIText`.

 The truncating cell keeps `BAIText` rather than a bare `Text`: it passes
 `ellipsis={{ tooltip: false }}`, i.e. "clamp but do NOT add your own
 tooltip" — the outer Tooltip already carries the full owner detail — and
 `BAIText` is where that antd-shaped ellipsis config is translated.
*/
import { BAIDeploymentOwnerInfo_deployment$key } from '../../__generated__/BAIDeploymentOwnerInfo_deployment.graphql';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIText from '../BAIText';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
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
    return <Text color="secondary">-</Text>;
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
      content={<span style={{ whiteSpace: 'pre-line' }}>{tooltipLines}</span>}
    >
      <BAIText ellipsis={{ tooltip: false }} style={{ maxWidth: 200 }}>
        {email}
      </BAIText>
    </Tooltip>
  );
};

export default BAIDeploymentOwnerInfo;
