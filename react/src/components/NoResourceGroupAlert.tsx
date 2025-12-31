import { useCurrentResourceGroupValue } from '../hooks/useCurrentProject';
import { BAIAlert, BAIAlertProps } from 'backend.ai-ui';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface NoResourceGroupAlertProps extends BAIAlertProps {}

const NoResourceGroupAlert: React.FC<NoResourceGroupAlertProps> = (props) => {
  const currentResourceGroup = useCurrentResourceGroupValue();
  const { t } = useTranslation();

  return _.isEmpty(currentResourceGroup) ? (
    <BAIAlert
      title={t('resourceGroup.NoScalingGroupAssignedToThisProject')}
      showIcon
      {...props}
    />
  ) : null;
};

export default NoResourceGroupAlert;
