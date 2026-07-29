/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentResourceGroupValue } from '../hooks/useCurrentProject';
import { useIsProjectAgnosticPage } from '../hooks/useIsProjectAgnosticPage';
import { BAIAlert, BAIAlertProps } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface NoResourceGroupAlertProps extends BAIAlertProps {}

const NoResourceGroupAlert: React.FC<NoResourceGroupAlertProps> = (props) => {
  // FR-3414 (ADR-0001): this alert is project-scoped ("no resource group in
  // THIS PROJECT"), so it must not render on the project-agnostic pages,
  // which operate above project scope. This component is globally mounted in
  // MainLayout (no page parent), so consulting the route here is the
  // sanctioned exception of ADR-0001.
  const isProjectAgnosticPage = useIsProjectAgnosticPage();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const { t } = useTranslation();

  return !isProjectAgnosticPage && _.isEmpty(currentResourceGroup) ? (
    <BAIAlert
      title={t('resourceGroup.NoScalingGroupAssignedToThisProject')}
      showIcon
      {...props}
    />
  ) : null;
};

export default NoResourceGroupAlert;
