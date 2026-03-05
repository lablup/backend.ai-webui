/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../hooks/useCurrentProject';
import { BAIAlert, BAIAlertProps } from 'backend.ai-ui';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface NoResourceGroupAlertProps extends BAIAlertProps {}

const NoResourceGroupAlert: React.FC<NoResourceGroupAlertProps> = (props) => {
  const currentProject = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const { t } = useTranslation();

  // Don't show alert when no project is selected - the message
  // "no resource group assigned to this project" is misleading without a project
  if (!currentProject.name) {
    return null;
  }

  return _.isEmpty(currentResourceGroup) ? (
    <BAIAlert
      title={t('resourceGroup.NoScalingGroupAssignedToThisProject')}
      showIcon
      {...props}
    />
  ) : null;
};

export default NoResourceGroupAlert;
