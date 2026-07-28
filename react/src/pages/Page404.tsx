/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import RouteErrorContent, {
  RouteErrorSegment,
} from '../components/RouteErrorContent';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useActiveProjectName } from '../hooks/useRouteScope';
import {
  getPathFromMenuKey,
  useWebUIMenuItems,
} from '../hooks/useWebUIMenuItems';
import { Button } from 'antd';
import { ArrowRightIcon } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const MAX_SEGMENTS = 4;

const Page404 = () => {
  'use memo';
  const { t } = useTranslation();
  const webuiNavigate = useWebUINavigate();
  const location = useLocation();
  const { firstAvailableMenuItem } = useWebUIMenuItems();
  const activeProjectName = useActiveProjectName();
  useSuspendedBackendaiClient(); //monkey patch for flickering

  const defaultPagePath = firstAvailableMenuItem
    ? getPathFromMenuKey(firstAvailableMenuItem.key, activeProjectName)
    : '/start';
  const defaultPageTitle =
    firstAvailableMenuItem?.labelText ?? t('webui.menu.FirstPageNameAlias');

  // The pill shows the unknown path with its LAST segment marked broken —
  // that is the part the router could not resolve. Long paths are capped
  // with a leading ellipsis so detail-page URLs stay readable.
  const rawSegments = location.pathname.split('/').filter(Boolean);
  const capped =
    rawSegments.length > MAX_SEGMENTS
      ? ['…', ...rawSegments.slice(-(MAX_SEGMENTS - 1))]
      : rawSegments;
  const segments: RouteErrorSegment[] = capped.map((text, i) => ({
    text,
    broken: i === capped.length - 1,
  }));

  return (
    <RouteErrorContent
      segments={segments.length ? segments : undefined}
      title={<Trans i18nKey={'webui.NotFound'} />}
      description={t('webui.DescNotFound')}
      extra={
        <Button
          type="primary"
          size="large"
          icon={<ArrowRightIcon size="1em" />}
          iconPosition="end"
          onClick={() => webuiNavigate(defaultPagePath)}
        >
          {t('button.GoBackToStartPage', { title: defaultPageTitle })}
        </Button>
      }
    />
  );
};

export default Page404;
