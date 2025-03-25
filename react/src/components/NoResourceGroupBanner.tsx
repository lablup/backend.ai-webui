import { useCurrentResourceGroupValue } from '../hooks/useCurrentProject';
import { Alert, theme } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

const NoResourceGroupBanner: React.FC = () => {
  const currentResourceGroup = useCurrentResourceGroupValue();
  const { token } = theme.useToken();
  const { t } = useTranslation();

  return (
    <>
      {currentResourceGroup === null || currentResourceGroup === '' ? (
        <Alert
          style={{ margin: token.paddingContentHorizontalLG }}
          message={t('resourceGroup.NoScalingGroupAssignedToThisProject')}
          showIcon
        />
      ) : null}
    </>
  );
};

export default NoResourceGroupBanner;
