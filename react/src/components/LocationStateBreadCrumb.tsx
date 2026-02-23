/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUINavigate } from '../hooks';
import { Breadcrumb } from 'antd';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export type SessionLauncherPageLocationState = {
  alert?: {
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
    description?: string;
  };
  from?: {
    pathname: string;
    label?: any;
  };
};

const LocationStateBreadCrumb = () => {
  const {
    state: locationState,
  }: {
    state: SessionLauncherPageLocationState | undefined;
  } = useLocation();
  const webuiNavigate = useWebUINavigate();
  const { t } = useTranslation();
  return (
    locationState?.from && (
      <Breadcrumb
        items={[
          {
            title: locationState.from.label || locationState.from.pathname,
            onClick: (e) => {
              e.preventDefault();
              locationState.from?.pathname &&
                webuiNavigate(locationState.from?.pathname);
            },
            href: locationState.from.pathname,
          },
          {
            title: t('session.launcher.StartNewSession'),
          },
        ]}
      />
    )
  );
};

export default LocationStateBreadCrumb;
