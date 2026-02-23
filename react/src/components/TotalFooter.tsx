/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { LoadingOutlined } from '@ant-design/icons';
import { theme, Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

const TotalFooter: React.FC<{
  loading?: boolean;
  total?: number;
}> = ({ loading, total }) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  return (
    <BAIFlex justify="end" gap={'xs'}>
      {loading ? (
        <LoadingOutlined
          spin
          style={{
            color: token.colorTextSecondary,
          }}
        />
      ) : (
        <div />
      )}
      <Typography.Text type="secondary">
        {t('general.TotalItems', {
          total: total,
        })}
      </Typography.Text>
    </BAIFlex>
  );
};

export default TotalFooter;
