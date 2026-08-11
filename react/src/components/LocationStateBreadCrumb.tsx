/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUINavigate } from '../hooks';
import { Breadcrumbs, BreadcrumbItem } from '@astryxdesign/core/Breadcrumbs';
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
      // antd `Breadcrumb items` → Astryx `Breadcrumbs` + `BreadcrumbItem`
      // children (MAPPING §4). The first crumb keeps its
      // `href` + `preventDefault` router navigation; the trailing crumb is
      // the current page (`isCurrent`), which antd expressed by omitting
      // `href`.
      <Breadcrumbs>
        <BreadcrumbItem
          href={locationState.from.pathname}
          onClick={(e) => {
            e.preventDefault();
            locationState.from?.pathname &&
              webuiNavigate(locationState.from?.pathname);
          }}
        >
          {locationState.from.label || locationState.from.pathname}
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>
          {t('session.launcher.StartNewSession')}
        </BreadcrumbItem>
      </Breadcrumbs>
    )
  );
};

export default LocationStateBreadCrumb;
