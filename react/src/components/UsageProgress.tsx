import { UsageProgressFragment_usageFrgmt$key } from '../__generated__/UsageProgressFragment_usageFrgmt.graphql';
import { bytesToGB, usageIndicatorColor } from '../helper';
import Flex from './Flex';
import { Progress, Typography, theme } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

const UsageProgress: React.FC<{
  usageProgressFrgmt: UsageProgressFragment_usageFrgmt$key | null;
}> = ({ usageProgressFrgmt: usageFrgmt }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const usage = useFragment(
    graphql`
      fragment UsageProgressFragment_usageFrgmt on QuotaScope {
        details {
          usage_bytes
          hard_limit_bytes
        }
      }
    `,
    usageFrgmt,
  );

  const usageBytes = parseFloat(usage?.details?.usage_bytes) || 0;
  const hardLimitBytes = parseFloat(usage?.details?.hard_limit_bytes) || 0;
  const percent = (
    hardLimitBytes > 0 ? ((usageBytes / hardLimitBytes) * 100)?.toFixed(2) : 0
  ) as number;

  return (
    <Flex direction="column">
      <Progress
        size={[180, 15]}
        percent={percent}
        strokeColor={usageIndicatorColor(percent)}
        status={percent >= 100 ? 'exception' : 'normal'}
      />
      <Flex direction="row" gap={token.marginXXS} style={{ fontSize: 12 }}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {t('data.Used')}:
        </Typography.Text>
        {bytesToGB(usage?.details?.usage_bytes)} GB
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {' / '}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {t('data.Limit')}:
        </Typography.Text>
        {bytesToGB(usage?.details?.hard_limit_bytes)} GB
        {/* <Typography.Text type="secondary">({percent} %)</Typography.Text> */}
      </Flex>
    </Flex>
  );
};

export default UsageProgress;
