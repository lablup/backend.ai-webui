/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Typography } from 'antd';
import { BAICard } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

const RBACManagementPage: React.FC = () => {
  'use memo';

  const { t } = useTranslation();

  return (
    <BAICard title={t('webui.menu.RBACManagement')}>
      <Typography.Text type="secondary">
        {t('rbac.PagePlaceholder')}
      </Typography.Text>
    </BAICard>
  );
};

export default RBACManagementPage;
