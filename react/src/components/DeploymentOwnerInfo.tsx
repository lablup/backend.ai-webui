/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentOwnerInfo_deployment$key } from '../__generated__/DeploymentOwnerInfo_deployment.graphql';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Tooltip, Typography, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface DeploymentOwnerInfoProps {
  deploymentFrgmt: DeploymentOwnerInfo_deployment$key | null | undefined;
}

const DeploymentOwnerInfo: React.FC<DeploymentOwnerInfoProps> = ({
  deploymentFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const deployment = useFragment(
    graphql`
      fragment DeploymentOwnerInfo_deployment on ModelDeployment {
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

  const initial = (fullName || username || email)
    .trim()
    .charAt(0)
    .toUpperCase();
  const tooltipLines = [
    t('deployment.CreatedBy'),
    fullName || username || email,
    email,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <BAIFlex gap="xs" align="center">
      <Tooltip
        title={<span style={{ whiteSpace: 'pre-line' }}>{tooltipLines}</span>}
      >
        <Avatar
          size="small"
          style={{
            backgroundColor: token.colorFillSecondary,
            color: token.colorText,
            flexShrink: 0,
          }}
          icon={!initial ? <UserOutlined /> : undefined}
        >
          {initial || null}
        </Avatar>
      </Tooltip>
      <Typography.Text ellipsis={{ tooltip: email }} style={{ maxWidth: 200 }}>
        {email}
      </Typography.Text>
    </BAIFlex>
  );
};

export default DeploymentOwnerInfo;
