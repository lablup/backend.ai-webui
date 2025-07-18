import { useCurrentResourceGroupValue } from '../hooks/useCurrentProject';
import BAIAlert, { BAIAlertProps } from './BAIAlert';
import BAIErrorBoundary from './BAIErrorBoundary';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface NoResourceGroupAlertProps extends BAIAlertProps {}

const NoResourceGroupAlertContent: React.FC<NoResourceGroupAlertProps> = (
  props,
) => {
  const currentResourceGroup = useCurrentResourceGroupValue();
  const { t } = useTranslation();

  return _.isEmpty(currentResourceGroup) ? (
    <BAIAlert
      message={t('resourceGroup.NoScalingGroupAssignedToThisProject')}
      showIcon
      {...props}
    />
  ) : null;
};

const NoResourceGroupAlert: React.FC<NoResourceGroupAlertProps> = (props) => {
  return (
    <BAIErrorBoundary
      onError={(error: any) => {
        console.warn('NoResourceGroupAlert error:', error);
      }}
      style={{ display: 'none' }} // Hide error UI for this specific case
    >
      <NoResourceGroupAlertContent {...props} />
    </BAIErrorBoundary>
  );
};

export default NoResourceGroupAlert;
